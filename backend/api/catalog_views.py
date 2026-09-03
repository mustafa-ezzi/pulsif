from django.db.models import Max, Min, Q
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from catalog.models import Category, Color, Product, Variant
from catalog.serializers import ProductCardSerializer, ProductDetailSerializer


def _live():
    return (
        Product.objects.filter(status=Product.Status.LIVE)
        .select_related("category")
        .prefetch_related("images__color", "variants__color", "variants__size")
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def product_list(request):
    products = _live()
    gender = request.query_params.get("gender")
    color = request.query_params.get("color")
    category = request.query_params.get("category")
    query = request.query_params.get("q", "").strip()
    sort = request.query_params.get("sort", "featured")
    try:
        price_min = float(request.query_params.get("price_min") or 0)
    except ValueError:
        price_min = 0
    try:
        price_max = float(request.query_params.get("price_max") or 0)
    except ValueError:
        price_max = 0
    try:
        limit = min(int(request.query_params.get("limit") or 12), 48)
    except ValueError:
        limit = 12
    try:
        offset = max(int(request.query_params.get("offset") or 0), 0)
    except ValueError:
        offset = 0

    if gender in ("men", "women"):
        products = products.filter(gender__in=[gender, Product.Gender.UNISEX])
    if category:
        products = products.filter(category__slug=category)
    if color:
        products = products.filter(variants__color__slug=color).distinct()
    if query:
        products = products.filter(Q(title__icontains=query) | Q(subtitle__icontains=query))
    if price_min:
        products = products.filter(variants__price__gte=price_min).distinct()
    if price_max:
        products = products.filter(variants__price__lte=price_max).distinct()

    if sort == "price_asc":
        products = products.annotate(min_price=Min("variants__price")).order_by("min_price")
    elif sort == "price_desc":
        products = products.annotate(min_price=Min("variants__price")).order_by("-min_price")
    elif sort == "newest":
        products = products.order_by("-created_at")
    else:
        products = products.order_by("title")

    total = products.count()
    page = products[offset : offset + limit]

    facet_base = _live()
    if gender in ("men", "women"):
        facet_base = facet_base.filter(gender__in=[gender, Product.Gender.UNISEX])

    price_stats = Variant.objects.filter(product__in=facet_base).aggregate(
        min_price=Min("price"), max_price=Max("price")
    )

    return Response(
        {
            "count": total,
            "offset": offset,
            "limit": limit,
            "results": ProductCardSerializer(page, many=True, context={"request": request}).data,
            "facets": {
                "colors": list(
                    Color.objects.filter(
                        id__in=Variant.objects.filter(product__in=facet_base).values("color_id")
                    ).values("slug", "name", "hex")
                ),
                "categories": list(
                    Category.objects.filter(id__in=facet_base.values("category_id")).values("slug", "title")
                ),
                "price": {
                    "min": float(price_stats["min_price"] or 0),
                    "max": float(price_stats["max_price"] or 0),
                },
            },
        }
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def product_detail(request, slug):
    product = get_object_or_404(_live(), slug=slug)
    return Response(ProductDetailSerializer(product, context={"request": request}).data)


@api_view(["GET"])
@permission_classes([AllowAny])
def category_list(_request):
    return Response(list(Category.objects.all().values("slug", "title", "gender")))
