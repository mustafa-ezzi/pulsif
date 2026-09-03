from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from api import seo_views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("sitemap.xml", seo_views.sitemap),
    path("robots.txt", seo_views.robots),
    path("api/v1/", include("api.urls")),
]

if settings.DEBUG or settings.SERVE_MEDIA:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
