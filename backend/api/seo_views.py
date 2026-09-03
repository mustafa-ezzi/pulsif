from xml.sax.saxutils import escape

from django.conf import settings
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from catalog.models import Product


def _site():
    return str(getattr(settings, "PUBLIC_SITE_URL", "http://127.0.0.1:5173")).rstrip("/")


def robots(_request):
    body = "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            "Disallow: /studio",
            "Disallow: /checkout",
            "Disallow: /account",
            f"Sitemap: {_site()}/sitemap.xml",
            "",
        ]
    )
    return HttpResponse(body, content_type="text/plain")


def sitemap(_request):
    origin = _site()
    paths = [
        "/",
        "/catalog",
        "/catalog/women",
        "/catalog/men",
        "/contact",
        "/faqs",
        "/privacy",
        "/refund",
        "/terms",
        "/shipping",
    ]
    urls = [f"{origin}{path}" for path in paths]
    urls += [f"{origin}/product/{product.slug}" for product in Product.objects.filter(status=Product.Status.LIVE)]
    items = "\n".join(f"  <url><loc>{escape(url)}</loc></url>" for url in urls)
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{items}\n"
        "</urlset>\n"
    )
    return HttpResponse(xml, content_type="application/xml")


@api_view(["GET"])
@permission_classes([AllowAny])
def seo_config(_request):
    return Response({"site_url": _site(), "name": "Pulsif"})
