import uuid

from django.conf import settings
from django.db import models


class Cart(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    currency = models.CharField(max_length=8, default="USD")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return str(self.id)


class CartLine(models.Model):
    cart = models.ForeignKey(Cart, related_name="lines", on_delete=models.CASCADE)
    variant = models.ForeignKey("catalog.Variant", on_delete=models.CASCADE)
    qty = models.PositiveIntegerField(default=1)

    class Meta:
        unique_together = ("cart", "variant")

    def __str__(self):
        return f"{self.variant.sku} x{self.qty}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PAID = "paid", "Paid"
        PACKED = "packed", "Packed"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"
        REFUNDED = "refunded", "Refunded"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    number = models.CharField(max_length=24, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="orders"
    )
    email = models.EmailField()
    name = models.CharField(max_length=120)
    status = models.CharField(max_length=16, choices=Status.choices, default=Status.PENDING)
    currency = models.CharField(max_length=8, default="USD")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stripe_id = models.CharField(max_length=80, blank=True)
    tracking_number = models.CharField(max_length=80, blank=True)
    shipping_line1 = models.CharField(max_length=160)
    shipping_line2 = models.CharField(max_length=160, blank=True)
    shipping_city = models.CharField(max_length=80)
    shipping_region = models.CharField(max_length=80, blank=True)
    shipping_postal = models.CharField(max_length=24)
    shipping_country = models.CharField(max_length=2, default="US")
    cart = models.ForeignKey(Cart, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.number


class OrderLine(models.Model):
    order = models.ForeignKey(Order, related_name="lines", on_delete=models.CASCADE)
    variant = models.ForeignKey("catalog.Variant", null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=160)
    sku = models.CharField(max_length=40)
    color = models.CharField(max_length=40, blank=True)
    size = models.CharField(max_length=20, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    qty = models.PositiveIntegerField(default=1)
    image = models.CharField(max_length=400, blank=True)

    def __str__(self):
        return f"{self.sku} x{self.qty}"


class WebhookEvent(models.Model):
    event_id = models.CharField(max_length=80, unique=True)
    event_type = models.CharField(max_length=80)
    processed = models.BooleanField(default=False)
    payload = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.event_id
