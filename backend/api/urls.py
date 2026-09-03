from django.urls import include, path
from rest_framework.routers import DefaultRouter

from api import auth_views, cart_views, catalog_views, checkout_views, cms_views, page_views, seo_views, studio_views, views, webhooks

router = DefaultRouter()
router.register("studio/heroes", cms_views.HeroChapterViewSet, basename="studio-heroes")
router.register("studio/banners", cms_views.BannerViewSet, basename="studio-banners")
router.register("studio/carousel-items", studio_views.StudioCarouselItemViewSet, basename="studio-carousel-items")
router.register("studio/carousels", studio_views.StudioCarouselViewSet, basename="studio-carousel-slots")
router.register("studio/products", studio_views.StudioProductViewSet, basename="studio-products")
router.register("studio/variants", studio_views.StudioVariantViewSet, basename="studio-variants")
router.register("studio/images", studio_views.StudioImageViewSet, basename="studio-images")
router.register("studio/orders", studio_views.StudioOrderViewSet, basename="studio-orders")
router.register("studio/faqs", studio_views.StudioFaqItemViewSet, basename="studio-faqs")

urlpatterns = [
    path("health/", views.health, name="health"),
    path("sitemap.xml", seo_views.sitemap, name="sitemap"),
    path("robots.txt", seo_views.robots, name="robots"),
    path("seo/", seo_views.seo_config, name="seo-config"),
    path("cms/home/", cms_views.home, name="cms-home"),
    path("cms/pages/faqs/", page_views.faqs, name="cms-faqs"),
    path("cms/pages/contact/", page_views.contact_page, name="cms-contact"),
    path("catalog/products/", catalog_views.product_list, name="product-list"),
    path("catalog/products/<slug:slug>/", catalog_views.product_detail, name="product-detail"),
    path("catalog/categories/", catalog_views.category_list, name="category-list"),
    path("cart/", cart_views.cart, name="cart"),
    path("cart/lines/", cart_views.cart_add, name="cart-add"),
    path("cart/lines/<int:line_id>/", cart_views.cart_line, name="cart-line"),
    path("contact/", page_views.contact_submit, name="contact-submit"),
    path("newsletter/", page_views.newsletter, name="newsletter"),
    path("checkout/", checkout_views.checkout_create, name="checkout-create"),
    path("checkout/<uuid:order_id>/confirm/", checkout_views.checkout_confirm, name="checkout-confirm"),
    path("orders/<str:number>/", checkout_views.order_detail, name="order-detail"),
    path("webhooks/stripe/", webhooks.stripe_webhook, name="stripe-webhook"),
    path("auth/register/", auth_views.register, name="auth-register"),
    path("auth/shopper/login/", auth_views.shopper_login, name="auth-shopper-login"),
    path("auth/account/", auth_views.account, name="auth-account"),
    path("auth/account/orders/", auth_views.account_orders, name="auth-account-orders"),
    path("auth/login/", cms_views.StaffTokenView.as_view(), name="auth-login"),
    path("auth/me/", cms_views.me, name="auth-me"),
    path("studio/dashboard/", studio_views.dashboard, name="studio-dashboard"),
    path("studio/options/", studio_views.options, name="studio-options"),
    path("studio/settings/", studio_views.settings_view, name="studio-settings"),
    path("studio/home/", cms_views.studio_carousels, name="studio-home-bundle"),
    path("", include(router.urls)),
]
