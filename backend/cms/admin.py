from django.contrib import admin

from .models import Banner, Carousel, CarouselItem, ContactBlock, FaqCategory, FaqItem, HeroChapter, SiteSettings


class CarouselItemInline(admin.TabularInline):
    model = CarouselItem
    extra = 0


@admin.register(Carousel)
class CarouselAdmin(admin.ModelAdmin):
    inlines = [CarouselItemInline]


@admin.register(HeroChapter)
class HeroChapterAdmin(admin.ModelAdmin):
    list_display = ("page", "sort", "headline")


admin.site.register(Banner)
admin.site.register(SiteSettings)
admin.site.register(ContactBlock)


class FaqItemInline(admin.TabularInline):
    model = FaqItem
    extra = 0


@admin.register(FaqCategory)
class FaqCategoryAdmin(admin.ModelAdmin):
    inlines = [FaqItemInline]
