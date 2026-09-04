from django.db.models import Min
from rest_framework import serializers

from catalog.models import Color, Product, Variant
from cms.models import Banner, CarouselItem, HeroChapter


def absolute_url(request, file_field):
    if not file_field:
        return ""
    url = file_field.url
    if url.startswith("http://") or url.startswith("https://"):
        return url
    if request:
        return request.build_absolute_uri(url)
    return url


class ColorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Color
        fields = ("name", "slug", "hex")


class ProductCardSerializer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()
    compare_at = serializers.SerializerMethodField()
    sale = serializers.SerializerMethodField()
    colors = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "slug",
            "title",
            "subtitle",
            "gender",
            "category",
            "price",
            "compare_at",
            "sale",
            "colors",
        )

    def _variants(self, product):
        return list(product.variants.select_related("color").all())

    def get_price(self, product):
        agg = product.variants.aggregate(min_price=Min("price"))
        value = agg.get("min_price")
        return float(value) if value is not None else 0

    def get_compare_at(self, product):
        priced = [v.compare_at for v in self._variants(product) if v.compare_at]
        return float(max(priced)) if priced else None

    def get_sale(self, product):
        return any(v.compare_at and v.compare_at > v.price for v in self._variants(product))

    def get_colors(self, product):
        request = self.context.get("request")
        images = list(product.images.select_related("color").all())
        variants = self._variants(product)
        color_map = {}
        for variant in variants:
            color = variant.color
            color_map.setdefault(
                color.id,
                {
                    "slug": color.slug,
                    "name": color.name,
                    "hex": color.hex,
                    "token": color.hex,
                    "images": [],
                },
            )
        for image in images:
            if not image.color_id or image.color_id not in color_map:
                continue
            color_map[image.color_id]["images"].append(
                {
                    "url": absolute_url(request, image.image),
                    "alt": image.alt or product.title,
                    "kind": image.kind,
                }
            )
        return [entry for entry in color_map.values() if entry["images"]]

    def get_category(self, product):
        return product.category.slug if product.category_id else ""


class VariantSerializer(serializers.ModelSerializer):
    color = serializers.CharField(source="color.slug")
    color_name = serializers.CharField(source="color.name")
    hex = serializers.CharField(source="color.hex")
    size = serializers.SerializerMethodField()

    class Meta:
        model = Variant
        fields = ("id", "sku", "color", "color_name", "hex", "size", "price", "compare_at", "stock")

    def get_size(self, variant):
        return variant.size.name if variant.size_id else "OS"


class ProductDetailSerializer(ProductCardSerializer):
    variants = VariantSerializer(many=True, read_only=True)
    related = serializers.SerializerMethodField()
    images = serializers.SerializerMethodField()

    class Meta(ProductCardSerializer.Meta):
        fields = ProductCardSerializer.Meta.fields + (
            "description",
            "care",
            "features",
            "size_guide",
            "shipping_note",
            "variants",
            "images",
            "related",
        )

    def get_images(self, product):
        request = self.context.get("request")
        return [
            {
                "url": absolute_url(request, image.image),
                "alt": image.alt or product.title,
                "kind": image.kind,
                "color": image.color.slug if image.color_id else None,
            }
            for image in product.images.select_related("color").all()
        ]

    def get_related(self, product):
        qs = (
            Product.objects.filter(status=Product.Status.LIVE)
            .exclude(pk=product.pk)
            .prefetch_related("images", "variants__color")
        )
        if product.category_id:
            related = list(qs.filter(category=product.category)[:4])
        else:
            related = list(qs[:4])
        if len(related) < 4:
            extra = list(qs.exclude(pk__in=[item.pk for item in related])[: 4 - len(related)])
            related.extend(extra)
        return ProductCardSerializer(related, many=True, context=self.context).data


class HeroChapterSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    mobile_image = serializers.SerializerMethodField()
    lines = serializers.SerializerMethodField()

    class Meta:
        model = HeroChapter
        fields = (
            "id",
            "page",
            "sort",
            "eyebrow",
            "headline",
            "lines",
            "cta_label",
            "cta_href",
            "image",
            "mobile_image",
            "overlay",
            "pin_enabled",
            "tone",
        )

    def get_image(self, obj):
        return absolute_url(self.context.get("request"), obj.image)

    def get_mobile_image(self, obj):
        return absolute_url(self.context.get("request"), obj.mobile_image)

    def get_lines(self, obj):
        return [part.strip() for part in obj.headline.replace("\\n", "\n").split("\n") if part.strip()]


class HeroChapterWriteSerializer(serializers.ModelSerializer):
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


class BannerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Banner
        fields = ("id", "key", "eyebrow", "headline", "cta_label", "cta_href", "image", "tone")

    def get_image(self, obj):
        return absolute_url(self.context.get("request"), obj.image)


class BannerWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Banner
        fields = ("id", "key", "eyebrow", "headline", "cta_label", "cta_href", "image", "tone")


class CarouselItemSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    product = ProductCardSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = CarouselItem
        fields = (
            "id",
            "sort",
            "title",
            "subtitle",
            "href",
            "image",
            "product",
            "product_id",
        )

    def get_image(self, obj):
        if obj.image:
            return absolute_url(self.context.get("request"), obj.image)
        if obj.product:
            first = obj.product.images.first()
            if first:
                return absolute_url(self.context.get("request"), first.image)
        return ""
