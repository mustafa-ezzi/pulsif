from django.db import models


class Color(models.Model):
    name = models.CharField(max_length=40)
    slug = models.SlugField(unique=True)
    hex = models.CharField(max_length=16, default="#1A1A1A")
    sort = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort", "name"]

    def __str__(self):
        return self.name


class Size(models.Model):
    name = models.CharField(max_length=20)
    sort = models.PositiveSmallIntegerField(default=0)
    gender_scope = models.CharField(max_length=16, default="all")

    class Meta:
        ordering = ["sort"]

    def __str__(self):
        return self.name


class Category(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=80)
    gender = models.CharField(max_length=16, default="all")
    sort = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort", "title"]
        verbose_name_plural = "categories"

    def __str__(self):
        return self.title


class Product(models.Model):
    class Gender(models.TextChoices):
        MEN = "men", "Men"
        WOMEN = "women", "Women"
        UNISEX = "unisex", "Unisex"

    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        LIVE = "live", "Live"

    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=160)
    subtitle = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    care = models.TextField(blank=True)
    features = models.JSONField(default=list, blank=True)
    size_guide = models.JSONField(default=dict, blank=True)
    shipping_note = models.CharField(max_length=200, blank=True, default="Shipping calculated at checkout.")
    gender = models.CharField(max_length=16, choices=Gender.choices, default=Gender.UNISEX)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.LIVE)
    category = models.ForeignKey(Category, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["title"]

    def __str__(self):
        return self.title


class ProductImage(models.Model):
    class Kind(models.TextChoices):
        CARD = "card", "Card"
        HERO = "hero", "Hero"
        PDP = "pdp", "PDP"
        LOOK = "look", "Look"

    product = models.ForeignKey(Product, related_name="images", on_delete=models.CASCADE)
    color = models.ForeignKey(Color, null=True, blank=True, on_delete=models.SET_NULL)
    image = models.ImageField(upload_to="products/")
    alt = models.CharField(max_length=160, blank=True)
    sort = models.PositiveSmallIntegerField(default=0)
    kind = models.CharField(max_length=16, choices=Kind.choices, default=Kind.CARD)

    class Meta:
        ordering = ["sort", "id"]


class Variant(models.Model):
    product = models.ForeignKey(Product, related_name="variants", on_delete=models.CASCADE)
    color = models.ForeignKey(Color, on_delete=models.PROTECT)
    size = models.ForeignKey(Size, null=True, blank=True, on_delete=models.SET_NULL)
    sku = models.CharField(max_length=40, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    compare_at = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stock = models.PositiveIntegerField(default=20)

    class Meta:
        unique_together = ("product", "color", "size")
        ordering = ["id"]

    def __str__(self):
        return self.sku
