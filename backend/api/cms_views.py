from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from api.auth import StaffTokenObtainPairSerializer
from api.permissions import IsStaff
from catalog.models import Product
from catalog.serializers import (
    BannerSerializer,
    BannerWriteSerializer,
    CarouselItemSerializer,
    HeroChapterSerializer,
    HeroChapterWriteSerializer,
    ProductCardSerializer,
)
from cms.models import Banner, Carousel, CarouselItem, HeroChapter


class StaffTokenView(TokenObtainPairView):
    serializer_class = StaffTokenObtainPairSerializer


def _product_cards(request, products):
    return ProductCardSerializer(products, many=True, context={"request": request}).data


@api_view(["GET"])
@permission_classes([AllowAny])
def home(request):
    heroes = HeroChapter.objects.filter(page=HeroChapter.Page.HOME)
    banners = {banner.key: banner for banner in Banner.objects.all()}

    def carousel_products(key):
        items = (
            CarouselItem.objects.filter(carousel__key=key, product__status=Product.Status.LIVE)
            .select_related("product")
            .prefetch_related("product__images", "product__variants__color")
        )
        products = [item.product for item in items if item.product_id]
        return _product_cards(request, products)

    def unique_cards(*groups):
        seen = set()
        out = []
        for group in groups:
            for card in group:
                slug = card.get("slug")
                if slug and slug not in seen:
                    seen.add(slug)
                    out.append(card)
        return out

    payload = {
        "heroes": HeroChapterSerializer(heroes, many=True, context={"request": request}).data,
        "archive": {
            "eyebrow": "The Pulsif Floor",
            "title": "Built to Tell Your Story",
            "products": unique_cards(
                carousel_products("home_archive_women"),
                carousel_products("home_archive_men"),
            ),
        },
        "beyond": BannerSerializer(banners.get("beyond"), context={"request": request}).data
        if banners.get("beyond")
        else None,
        "essentials": BannerSerializer(banners.get("essentials"), context={"request": request}).data
        if banners.get("essentials")
        else None,
        "lookbook": {
            **(
                BannerSerializer(banners.get("lookbook"), context={"request": request}).data
                if banners.get("lookbook")
                else {"eyebrow": "Shop the Look", "headline": "Spring delivery", "cta_label": "", "cta_href": "/catalog", "image": "", "tone": "pink"}
            ),
            "products": carousel_products("home_lookbook"),
        },
        "shop_tiles": [
            {"label": "Boards", "href": "/catalog?category=boards"},
            {"label": "Bands", "href": "/catalog?category=bands"},
            {"label": "Shop All", "href": "/catalog"},
        ],
    }
    return Response(payload)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsStaff])
def me(request):
    return Response({"username": request.user.get_username(), "is_staff": request.user.is_staff})


class HeroChapterViewSet(viewsets.ModelViewSet):
    queryset = HeroChapter.objects.all()
    permission_classes = [IsStaff]
    serializer_class = HeroChapterWriteSerializer

    def get_serializer_class(self):
        if self.request.method == "GET":
            return HeroChapterSerializer
        return HeroChapterWriteSerializer


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    lookup_field = "key"
    permission_classes = [IsStaff]

    def get_serializer_class(self):
        if self.request.method == "GET":
            return BannerSerializer
        return BannerWriteSerializer


class CarouselItemViewSet(viewsets.ModelViewSet):
    queryset = CarouselItem.objects.select_related("product", "carousel")
    serializer_class = CarouselItemSerializer
    permission_classes = [IsStaff]

    def get_queryset(self):
        qs = super().get_queryset()
        key = self.request.query_params.get("carousel")
        if key:
            qs = qs.filter(carousel__key=key)
        return qs

    def perform_create(self, serializer):
        key = self.request.data.get("carousel") or self.request.query_params.get("carousel")
        carousel = get_object_or_404(Carousel, key=key)
        serializer.save(carousel=carousel)


@api_view(["GET"])
@permission_classes([IsStaff])
def studio_carousels(request):
    carousels = Carousel.objects.prefetch_related("items__product__images", "items__product__variants__color")
    data = []
    for carousel in carousels:
        data.append(
            {
                "key": carousel.key,
                "title": carousel.title,
                "items": CarouselItemSerializer(
                    carousel.items.all(), many=True, context={"request": request}
                ).data,
            }
        )
    return Response(
        {
            "heroes": HeroChapterSerializer(
                HeroChapter.objects.filter(page=HeroChapter.Page.HOME),
                many=True,
                context={"request": request},
            ).data,
            "banners": BannerSerializer(Banner.objects.all(), many=True, context={"request": request}).data,
            "carousels": data,
        }
    )
