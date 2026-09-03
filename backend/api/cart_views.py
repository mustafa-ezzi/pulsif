from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from catalog.models import Variant
from catalog.serializers import absolute_url
from commerce.models import Cart, CartLine

CART_HEADER = "X-Cart-Id"


def _cart_id(request):
    return request.headers.get(CART_HEADER) or request.COOKIES.get("cart_id")


def _get_cart(request, create=False):
    cart_id = _cart_id(request)
    if cart_id:
        cart = Cart.objects.filter(pk=cart_id).first()
        if cart:
            return cart
    if create:
        return Cart.objects.create()
    return None


def serialize_cart(request, cart):
    lines = []
    subtotal = 0
    count = 0
    qs = cart.lines.select_related("variant__product", "variant__color", "variant__size")
    for line in qs:
        variant = line.variant
        product = variant.product
        image = product.images.filter(color=variant.color).first() or product.images.first()
        price = float(variant.price)
        lines.append(
            {
                "id": line.id,
                "variantId": variant.id,
                "productId": product.slug,
                "title": product.title,
                "price": price,
                "color": variant.color.name,
                "size": variant.size.name if variant.size_id else "OS",
                "qty": line.qty,
                "image": absolute_url(request, image.image) if image else "",
            }
        )
        subtotal += price * line.qty
        count += line.qty
    return {
        "id": str(cart.id),
        "currency": cart.currency,
        "lines": lines,
        "subtotal": round(subtotal, 2),
        "count": count,
    }


def _respond(request, cart):
    payload = serialize_cart(request, cart)
    response = Response(payload)
    response["X-Cart-Id"] = payload["id"]
    response.set_cookie("cart_id", payload["id"], max_age=60 * 60 * 24 * 30, samesite="Lax")
    return response


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def cart(request):
    if request.method == "POST":
        current = _get_cart(request, create=True)
        return _respond(request, current)
    current = _get_cart(request, create=False)
    if not current:
        return Response({"id": None, "lines": [], "subtotal": 0, "count": 0})
    return _respond(request, current)


@api_view(["POST"])
@permission_classes([AllowAny])
def cart_add(request):
    variant_id = request.data.get("variant_id") or request.data.get("variantId")
    try:
        variant_id = int(variant_id)
    except (TypeError, ValueError):
        return Response({"detail": "variant_id is required."}, status=400)
    try:
        qty = int(request.data.get("qty") or 1)
    except (TypeError, ValueError):
        qty = 1
    variant = get_object_or_404(Variant, pk=variant_id)
    current = _get_cart(request, create=True)
    line, created = CartLine.objects.get_or_create(
        cart=current, variant=variant, defaults={"qty": max(qty, 1)}
    )
    if not created:
        line.qty += max(qty, 1)
        line.save(update_fields=["qty"])
    return _respond(request, current)


@api_view(["PATCH", "DELETE"])
@permission_classes([AllowAny])
def cart_line(request, line_id):
    current = _get_cart(request, create=False)
    if not current:
        return Response({"detail": "Cart not found."}, status=404)
    line = get_object_or_404(CartLine, pk=line_id, cart=current)
    if request.method == "DELETE":
        line.delete()
        return _respond(request, current)
    qty = int(request.data.get("qty") or 0)
    if qty < 1:
        line.delete()
    else:
        line.qty = qty
        line.save(update_fields=["qty"])
    return _respond(request, current)
