from datetime import timedelta
from decimal import Decimal

from django.db.models import Count, Min, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response

from api.permissions import IsStaff
from api.studio_serializers import (
    StudioCarouselItemSerializer,
    StudioCategorySerializer,
    StudioColorSerializer,
    StudioContactSerializer,
    StudioFaqCategorySerializer,
    StudioFaqItemSerializer,
    StudioImageSerializer,
    StudioProductListSerializer,
    StudioProductSerializer,
    StudioSettingsSerializer,
    StudioSizeSerializer,
    StudioVariantWriteSerializer,
)
from catalog.models import Category, Color, Product, ProductImage, Size, Variant
from cms.models import Banner, Carousel, CarouselItem, ContactBlock, FaqCategory, FaqItem, HeroChapter, SiteSettings
from commerce.models import Order
from commerce.services import advance_order, serialize_order, send_order_email


def _sku(product, color, size):
    size_part = size.name if size else "OS"
    base = f"{product.slug[:10]}-{color.slug[:8]}-{size_part}".upper().replace(" ", "")
    sku = base[:40]
    n = 1
    while Variant.objects.filter(sku=sku).exists():
        n += 1
        sku = f"{base[:36]}-{n}"
    return sku


@api_view(["GET"])
@permission_classes([IsStaff])
def dashboard(request):
    since = timezone.now() - timedelta(days=7)
    counted = Order.objects.exclude(status=Order.Status.PENDING)
    revenue = (
        counted.filter(Q(paid_at__gte=since) | Q(paid_at__isnull=True, created_at__gte=since))
        .filter(status__in=[Order.Status.PAID, Order.Status.PACKED, Order.Status.SHIPPED, Order.Status.DELIVERED])
        .aggregate(total=Sum("total"))
        .get("total")
        or 0
    )
    orders_7d = Order.objects.filter(created_at__gte=since).count()
    by_status = {
        status: Order.objects.filter(status=status).count() for status, _label in Order.Status.choices
    }

    low = (
        Variant.objects.select_related("product", "color", "size")
        .filter(stock__lt=5, product__status=Product.Status.LIVE)
        .order_by("stock", "sku")[:20]
    )
    low_stock = [
        {
            "id": row.id,
            "sku": row.sku,
            "title": row.product.title,
            "color": row.color.name,
            "size": row.size.name if row.size_id else "OS",
            "stock": row.stock,
            "product_id": row.product_id,
        }
        for row in low
    ]

    broken = []
    for chapter in HeroChapter.objects.filter(page=HeroChapter.Page.HOME):
        if not chapter.image:
            broken.append({"kind": "hero", "key": f"hero-{chapter.id}", "title": chapter.headline, "reason": "Missing image"})
    for banner in Banner.objects.all():
        if not banner.image:
            broken.append({"kind": "banner", "key": banner.key, "title": banner.headline, "reason": "Missing image"})
    for item in CarouselItem.objects.select_related("carousel", "product"):
        has_file = bool(item.image)
        has_product_image = bool(item.product_id and item.product.images.exists())
        if not has_file and not has_product_image:
            broken.append(
                {
                    "kind": "carousel",
                    "key": item.carousel.key,
                    "title": item.title or (item.product.title if item.product_id else f"Item {item.id}"),
                    "reason": "Item missing image",
                }
            )

    return Response(
        {
            "revenue_7d": float(revenue),
            "orders_7d": orders_7d,
            "by_status": by_status,
            "low_stock": low_stock,
            "broken": broken,
        }
    )


@api_view(["GET"])
@permission_classes([IsStaff])
def options(_request):
    return Response(
        {
            "colors": StudioColorSerializer(Color.objects.all(), many=True).data,
            "sizes": StudioSizeSerializer(Size.objects.all(), many=True).data,
            "categories": StudioCategorySerializer(Category.objects.all(), many=True).data,
        }
    )


class StudioProductViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    queryset = Product.objects.all().select_related("category").prefetch_related(
        "variants__color", "variants__size", "images__color"
    )

    def get_serializer_class(self):
        if self.action == "list":
            return StudioProductListSerializer
        return StudioProductSerializer

    def get_queryset(self):
        qs = super().get_queryset().annotate(
            variant_count=Count("variants", distinct=True),
            image_count=Count("images", distinct=True),
            min_stock=Min("variants__stock"),
        )
        query = self.request.query_params.get("q", "").strip()
        status = self.request.query_params.get("status", "").strip()
        if query:
            qs = qs.filter(Q(title__icontains=query) | Q(slug__icontains=query))
        if status in (Product.Status.LIVE, Product.Status.DRAFT):
            qs = qs.filter(status=status)
        return qs

    def perform_create(self, serializer):
        slug = serializer.validated_data.get("slug") or slugify(serializer.validated_data.get("title") or "")
        slug = slug or f"product-{timezone.now().strftime('%H%M%S')}"
        if Product.objects.filter(slug=slug).exists():
            slug = f"{slug}-{timezone.now().strftime('%H%M%S')}"
        serializer.save(slug=slug)

    def perform_destroy(self, instance):
        for image in list(instance.images.all()):
            if image.image:
                image.image.delete(save=False)
        instance.delete()

    @action(detail=True, methods=["post"])
    def matrix(self, request, pk=None):
        product = self.get_object()
        color_ids = request.data.get("color_ids") or []
        size_ids = request.data.get("size_ids") or []
        try:
            price = Decimal(str(request.data.get("price") or "0"))
        except Exception:
            return Response({"detail": "Price must be a number."}, status=400)
        try:
            stock = int(request.data.get("stock") or 20)
        except (TypeError, ValueError):
            stock = 20
        colors = list(Color.objects.filter(id__in=color_ids))
        sizes = list(Size.objects.filter(id__in=size_ids))
        if not colors:
            return Response({"detail": "Pick at least one color."}, status=400)
        if not sizes:
            sizes = list(Size.objects.filter(name="OS")[:1]) or [None]
        created = 0
        for color in colors:
            for size in sizes:
                exists = Variant.objects.filter(product=product, color=color, size=size).exists()
                if exists:
                    continue
                Variant.objects.create(
                    product=product,
                    color=color,
                    size=size,
                    sku=_sku(product, color, size),
                    price=price,
                    stock=stock,
                )
                created += 1
        product = self.get_object()
        return Response({"created": created, "product": StudioProductSerializer(product, context={"request": request}).data})

    @action(detail=True, methods=["post"])
    def images(self, request, pk=None):
        product = self.get_object()
        upload = request.FILES.get("image")
        if not upload:
            return Response({"detail": "Choose an image file."}, status=400)
        color_id = request.data.get("color") or None
        color = Color.objects.filter(id=color_id).first() if color_id else None
        image = ProductImage(
            product=product,
            color=color,
            alt=request.data.get("alt") or product.title,
            kind=request.data.get("kind") or ProductImage.Kind.CARD,
            sort=int(request.data.get("sort") or product.images.count()),
        )
        image.image = upload
        image.save()
        return Response(StudioImageSerializer(image, context={"request": request}).data, status=201)


class StudioVariantViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    queryset = Variant.objects.select_related("product", "color", "size")
    serializer_class = StudioVariantWriteSerializer
    http_method_names = ["get", "patch", "put", "delete", "head", "options"]


class StudioImageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    queryset = ProductImage.objects.select_related("color", "product")
    serializer_class = StudioImageSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]


class StudioOrderViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsStaff]
    queryset = Order.objects.prefetch_related("lines")
    lookup_field = "number"

    def list(self, request, *args, **kwargs):
        qs = self.get_queryset()
        status = request.query_params.get("status", "").strip()
        query = request.query_params.get("q", "").strip()
        if status:
            qs = qs.filter(status=status)
        if query:
            qs = qs.filter(Q(number__icontains=query) | Q(email__icontains=query) | Q(name__icontains=query))
        return Response([serialize_order(order, staff=True) for order in qs[:100]])

    def retrieve(self, request, *args, **kwargs):
        order = self.get_object()
        return Response(serialize_order(order, staff=True))

    @action(detail=True, methods=["post"])
    def status(self, request, number=None):
        order = self.get_object()
        next_status = request.data.get("status")
        tracking = request.data.get("tracking_number")
        try:
            advance_order(order, next_status, tracking)
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=400)
        order.refresh_from_db()
        return Response(serialize_order(order, staff=True))

    @action(detail=True, methods=["post"])
    def email(self, request, number=None):
        order = self.get_object()
        send_order_email(order)
        return Response({"ok": True})

    @action(detail=True, methods=["patch"])
    def tracking(self, request, number=None):
        order = self.get_object()
        order.tracking_number = (request.data.get("tracking_number") or "").strip()
        order.save(update_fields=["tracking_number"])
        return Response(serialize_order(order, staff=True))


class StudioCarouselViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsStaff]
    queryset = Carousel.objects.prefetch_related("items__product__images")
    serializer_class = StudioCarouselItemSerializer
    lookup_field = "key"

    def list(self, request, *args, **kwargs):
        from api.studio_serializers import StudioCarouselSerializer

        return Response(StudioCarouselSerializer(self.get_queryset(), many=True, context={"request": request}).data)

    def retrieve(self, request, *args, **kwargs):
        from api.studio_serializers import StudioCarouselSerializer

        return Response(StudioCarouselSerializer(self.get_object(), context={"request": request}).data)


class StudioCarouselItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    queryset = CarouselItem.objects.select_related("carousel", "product").prefetch_related("product__images")
    serializer_class = StudioCarouselItemSerializer

    def perform_create(self, serializer):
        key = self.request.data.get("carousel_key") or self.request.data.get("carousel")
        if str(key).isdigit():
            serializer.save()
            return
        carousel = get_object_or_404(Carousel, key=key)
        serializer.save(carousel=carousel)


@api_view(["GET", "PATCH"])
@permission_classes([IsStaff])
def settings_view(request):
    row, _ = SiteSettings.objects.get_or_create(pk=1)
    contact, _ = ContactBlock.objects.get_or_create(pk=1)
    if request.method == "PATCH":
        site_data = request.data.get("site") or request.data
        contact_data = request.data.get("contact") or {}
        site_ser = StudioSettingsSerializer(row, data=site_data, partial=True)
        site_ser.is_valid(raise_exception=True)
        site_ser.save()
        if contact_data:
            contact_ser = StudioContactSerializer(contact, data=contact_data, partial=True)
            contact_ser.is_valid(raise_exception=True)
            contact_ser.save()
        row.refresh_from_db()
        contact.refresh_from_db()
    faqs = StudioFaqCategorySerializer(FaqCategory.objects.prefetch_related("items"), many=True).data
    return Response(
        {
            "site": StudioSettingsSerializer(row).data,
            "contact": StudioContactSerializer(contact).data,
            "faqs": faqs,
        }
    )


class StudioFaqItemViewSet(viewsets.ModelViewSet):
    permission_classes = [IsStaff]
    queryset = FaqItem.objects.select_related("category")
    serializer_class = StudioFaqItemSerializer
