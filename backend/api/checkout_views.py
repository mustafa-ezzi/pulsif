from decimal import Decimal

from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from api.throttles import CheckoutThrottle

from api.cart_views import _get_cart, serialize_cart
from commerce.models import Order
from commerce.services import (
    create_payment_intent,
    mark_paid,
    order_number,
    serialize_order,
    shipping_for,
    snapshot_lines,
    stripe_configured,
)

try:
    import stripe
except ImportError:  # pragma: no cover
    stripe = None


def _can_view(request, order):
    email = (request.query_params.get("email") or request.data.get("email") or "").strip().lower()
    if request.user.is_authenticated and (
        order.user_id == request.user.id or order.email.lower() == (request.user.email or "").lower()
    ):
        return True
    return bool(email and email == order.email.lower())


@api_view(["POST"])
@permission_classes([AllowAny])
@throttle_classes([CheckoutThrottle])
def checkout_create(request):
    cart = _get_cart(request, create=False)
    if not cart or not cart.lines.exists():
        return Response({"detail": "Your cart is empty."}, status=400)

    email = (request.data.get("email") or "").strip().lower()
    name = (request.data.get("name") or "").strip()
    address = request.data.get("shipping") or {}
    line1 = (address.get("line1") or "").strip()
    city = (address.get("city") or "").strip()
    postal = (address.get("postal") or "").strip()
    country = (address.get("country") or "US").strip().upper()[:2]
    if not (email and "@" in email and name and line1 and city and postal):
        return Response({"detail": "Email, name, and a full shipping address are required."}, status=400)

    for line in cart.lines.select_related("variant"):
        if line.variant.stock < line.qty:
            return Response(
                {"detail": f"{line.variant.product.title} does not have enough stock."},
                status=400,
            )

    payload = serialize_cart(request, cart)
    subtotal = Decimal(str(payload["subtotal"]))
    shipping = shipping_for(subtotal)
    total = subtotal + shipping

    user = request.user if request.user.is_authenticated else None
    order = Order.objects.create(
        number=order_number(),
        user=user,
        email=email,
        name=name,
        subtotal=subtotal,
        shipping=shipping,
        total=total,
        shipping_line1=line1,
        shipping_line2=(address.get("line2") or "").strip(),
        shipping_city=city,
        shipping_region=(address.get("region") or "").strip(),
        shipping_postal=postal,
        shipping_country=country,
        cart=cart,
        currency=cart.currency,
    )
    snapshot_lines(request, order, cart)
    client_secret = create_payment_intent(order)
    mock = not stripe_configured()
    data = serialize_order(order)
    data.update(
        {
            "client_secret": client_secret,
            "publishable_key": settings.STRIPE_PUBLISHABLE_KEY if not mock else "",
            "mock": mock,
        }
    )
    return Response(data, status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def checkout_confirm(request, order_id):
    order = get_object_or_404(Order, pk=order_id)
    if not _can_view(request, order):
        return Response({"detail": "Not found."}, status=404)

    if order.status == Order.Status.PAID:
        return Response(serialize_order(order))

    mock = not stripe_configured() or (order.stripe_id or "").startswith("pi_mock_")
    if mock:
        card = "".join(ch for ch in str(request.data.get("card") or "") if ch.isdigit())
        if card and card != "4242424242424242":
            return Response({"detail": "Use test card 4242 4242 4242 4242."}, status=400)
        mark_paid(order)
        order.refresh_from_db()
        return Response(serialize_order(order))

    if not stripe or not order.stripe_id:
        return Response({"detail": "Payment is not ready."}, status=400)
    stripe.api_key = settings.STRIPE_SECRET_KEY
    intent = stripe.PaymentIntent.retrieve(order.stripe_id)
    if intent.status != "succeeded":
        return Response({"detail": f"Payment is {intent.status}."}, status=400)
    mark_paid(order)
    order.refresh_from_db()
    return Response(serialize_order(order))


@api_view(["GET"])
@permission_classes([AllowAny])
def order_detail(request, number):
    order = get_object_or_404(Order, number=number)
    if not _can_view(request, order):
        return Response({"detail": "Not found."}, status=404)
    return Response(serialize_order(order))
