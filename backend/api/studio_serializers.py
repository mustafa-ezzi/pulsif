from rest_framework import serializers

from catalog.models import Category, Color, Product, ProductImage, Size, Variant
from catalog.serializers import absolute_url
from cms.models import Banner, Carousel, CarouselItem, ContactBlock, FaqCategory, FaqItem, HeroChapter, SiteSettings


class StudioVariantSerializer(serializers.ModelSerializer):
    color_name = serializers.CharField(source="color.name", read_only=True)
    color_slug = serializers.CharField(source="color.slug", read_only=True)
    hex = serializers.CharField(source="color.hex", read_only=True)
    size_name = serializers.SerializerMethodField()

    class Meta:
        model = Variant
        fields = (
            "id",
            "sku",
            "color",
            "size",
            "price",
            "compare_at",
            "stock",
            "color_name",
            "color_slug",
            "hex",
            "size_name",
        )

    def get_size_name(self, variant):
        return variant.size.name if variant.size_id else "OS"


class StudioImageSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    color_slug = serializers.CharField(source="color.slug", read_only=True, default="")

    class Meta:
        model = ProductImage
        fields = ("id", "url", "color", "color_slug", "alt", "sort", "kind")

    def get_url(self, obj):
        return absolute_url(self.context.get("request"), obj.image)


class StudioProductListSerializer(serializers.ModelSerializer):
    category_title = serializers.CharField(source="category.title", read_only=True, default="")
    variant_count = serializers.IntegerField(read_only=True)
    image_count = serializers.IntegerField(read_only=True)
    min_stock = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "slug",
            "title",
            "gender",
            "status",
            "category",
            "category_title",
            "variant_count",
            "image_count",
            "min_stock",
        )


class StudioProductSerializer(serializers.ModelSerializer):
    variants = StudioVariantSerializer(many=True, read_only=True)
    images = StudioImageSerializer(many=True, read_only=True)
    category_title = serializers.CharField(source="category.title", read_only=True, default="")

    class Meta:
        model = Product
        fields = (
            "id",
            "slug",
            "title",
            "subtitle",
            "description",
            "care",
            "features",
            "size_guide",
            "shipping_note",
            "gender",
            "status",
            "category",
            "category_title",
            "variants",
            "images",
        )
        extra_kwargs = {
            "slug": {"required": False, "allow_blank": True},
            "category": {"required": False, "allow_null": True},
            "features": {"required": False},
            "size_guide": {"required": False},
        }


class StudioVariantWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Variant
        fields = ("id", "sku", "color", "size", "price", "compare_at", "stock")
        extra_kwargs = {"sku": {"required": False}}


class StudioCarouselItemSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    product_title = serializers.CharField(source="product.title", read_only=True, default="")
    product_slug = serializers.CharField(source="product.slug", read_only=True, default="")
    carousel_key = serializers.SlugField(source="carousel.key", read_only=True)

    class Meta:
        model = CarouselItem
        fields = (
            "id",
            "carousel",
            "carousel_key",
            "sort",
            "title",
            "subtitle",
            "href",
            "image",
            "image_url",
            "product",
            "product_title",
            "product_slug",
        )
        extra_kwargs = {"carousel": {"required": False}, "image": {"write_only": True, "required": False}, "product": {"required": False, "allow_null": True}}

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image:
            return absolute_url(request, obj.image)
        if obj.product_id:
            first = obj.product.images.first()
            if first:
                return absolute_url(request, first.image)
        return ""


class StudioCarouselSerializer(serializers.ModelSerializer):
    items = StudioCarouselItemSerializer(many=True, read_only=True)

    class Meta:
        model = Carousel
        fields = ("id", "key", "title", "items")


class StudioFaqItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaqItem
        fields = ("id", "category", "question", "answer", "popular", "sort")


class StudioFaqCategorySerializer(serializers.ModelSerializer):
    items = StudioFaqItemSerializer(many=True, read_only=True)

    class Meta:
        model = FaqCategory
        fields = ("id", "slug", "title", "sort", "items")


class StudioSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = ("id", "announcement", "newsletter_blurb", "shipping_flat", "shipping_free_over")


class StudioContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactBlock
        fields = (
            "id",
            "blurb",
            "phone",
            "phone_hours",
            "email",
            "email_note",
            "address",
            "address_hours",
        )


class StudioHeroWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = HeroChapter
        fields = (
            "id",
            "page",
            "sort",
            "eyebrow",
            "headline",
            "cta_label",
            "cta_href",
            "image",
            "mobile_image",
            "overlay",
            "pin_enabled",
            "tone",
        )


class StudioBannerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ("id", "key", "eyebrow", "headline", "cta_label", "cta_href", "image", "tone")


class StudioColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ("id", "name", "slug", "hex", "sort")


class StudioSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Size
        fields = ("id", "name", "sort", "gender_scope")


class StudioCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "slug", "title", "gender", "sort")
