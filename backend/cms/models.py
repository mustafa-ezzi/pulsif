from django.db import models


class HeroChapter(models.Model):
    class Page(models.TextChoices):
        HOME = "home", "Home"
        CATALOG = "catalog", "Catalog"
        MEN = "men", "Men"
        WOMEN = "women", "Women"

    page = models.CharField(max_length=16, choices=Page.choices, default=Page.HOME)
    sort = models.PositiveSmallIntegerField(default=0)
    eyebrow = models.CharField(max_length=80, blank=True)
    headline = models.CharField(max_length=160)
    cta_label = models.CharField(max_length=80, blank=True)
    cta_href = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to="heroes/", blank=True)
    mobile_image = models.ImageField(upload_to="heroes/", blank=True)
    overlay = models.FloatField(default=0.55)
    pin_enabled = models.BooleanField(default=True)
    tone = models.CharField(max_length=24, default="graphite")

    class Meta:
        ordering = ["page", "sort"]

    def __str__(self):
        return f"{self.page} · {self.headline}"


class Carousel(models.Model):
    key = models.SlugField(unique=True)
    title = models.CharField(max_length=80)

    def __str__(self):
        return self.key


class CarouselItem(models.Model):
    carousel = models.ForeignKey(Carousel, related_name="items", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="carousels/", blank=True)
    product = models.ForeignKey(
        "catalog.Product", null=True, blank=True, on_delete=models.SET_NULL
    )
    title = models.CharField(max_length=160, blank=True)
    subtitle = models.CharField(max_length=160, blank=True)
    href = models.CharField(max_length=200, blank=True)
    sort = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort", "id"]

    def __str__(self):
        return self.title or f"Item {self.pk}"


class Banner(models.Model):
    key = models.SlugField(unique=True)
    eyebrow = models.CharField(max_length=80, blank=True)
    headline = models.CharField(max_length=160)
    cta_label = models.CharField(max_length=80, blank=True)
    cta_href = models.CharField(max_length=200, blank=True)
    image = models.ImageField(upload_to="banners/", blank=True)
    tone = models.CharField(max_length=24, default="paper")

    def __str__(self):
        return self.key


class SiteSettings(models.Model):
    announcement = models.CharField(max_length=200, blank=True)
    newsletter_blurb = models.CharField(max_length=160, blank=True)
    shipping_flat = models.DecimalField(max_digits=8, decimal_places=2, default=12)
    shipping_free_over = models.DecimalField(max_digits=8, decimal_places=2, default=150)

    class Meta:
        verbose_name = "site settings"
        verbose_name_plural = "site settings"

    def __str__(self):
        return "Site settings"


class FaqCategory(models.Model):
    slug = models.SlugField(unique=True)
    title = models.CharField(max_length=80)
    sort = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["sort"]
        verbose_name_plural = "FAQ categories"

    def __str__(self):
        return self.title


class FaqItem(models.Model):
    category = models.ForeignKey(FaqCategory, related_name="items", on_delete=models.CASCADE)
    question = models.CharField(max_length=200)
    answer = models.TextField()
    sort = models.PositiveSmallIntegerField(default=0)
    popular = models.BooleanField(default=False)

    class Meta:
        ordering = ["sort", "id"]

    def __str__(self):
        return self.question


class ContactBlock(models.Model):
    phone = models.CharField(max_length=40, blank=True)
    phone_hours = models.CharField(max_length=80, blank=True)
    email = models.EmailField(blank=True)
    email_note = models.CharField(max_length=120, blank=True)
    address = models.CharField(max_length=200, blank=True)
    address_hours = models.CharField(max_length=80, blank=True)
    blurb = models.TextField(blank=True)

    class Meta:
        verbose_name = "contact block"
        verbose_name_plural = "contact blocks"

    def __str__(self):
        return self.email or "Contact"
