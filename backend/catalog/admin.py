from django.contrib import admin

from .models import Category, Color, Product, ProductImage, Size, Variant


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 0


class VariantInline(admin.TabularInline):
    model = Variant
    extra = 0


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("title", "slug", "gender", "status")
    prepopulated_fields = {"slug": ("title",)}
    inlines = [ProductImageInline, VariantInline]


admin.site.register(Color)
admin.site.register(Size)
admin.site.register(Category)
