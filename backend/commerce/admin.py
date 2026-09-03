from django.contrib import admin

from .models import Cart, CartLine, Order, OrderLine, WebhookEvent


class CartLineInline(admin.TabularInline):
    model = CartLine
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    inlines = [CartLineInline]


class OrderLineInline(admin.TabularInline):
    model = OrderLine
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("number", "email", "status", "total", "created_at")
    list_filter = ("status",)
    search_fields = ("number", "email", "stripe_id")
    inlines = [OrderLineInline]


admin.site.register(WebhookEvent)