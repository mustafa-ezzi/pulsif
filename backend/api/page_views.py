from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from cms.models import ContactBlock, FaqCategory, SiteSettings


@api_view(["GET"])
@permission_classes([AllowAny])
def faqs(_request):
    groups = []
    for category in FaqCategory.objects.prefetch_related("items"):
        groups.append(
            {
                "slug": category.slug,
                "title": category.title,
                "items": [
                    {
                        "id": item.id,
                        "question": item.question,
                        "answer": item.answer,
                        "popular": item.popular,
                    }
                    for item in category.items.all()
                ],
            }
        )
    return Response({"groups": groups})


@api_view(["GET"])
@permission_classes([AllowAny])
def contact_page(_request):
    block = ContactBlock.objects.first()
    settings_row = SiteSettings.objects.first()
    return Response(
        {
            "blurb": block.blurb if block else "",
            "phone": block.phone if block else "",
            "phone_hours": block.phone_hours if block else "",
            "email": block.email if block else "",
            "email_note": block.email_note if block else "",
            "address": block.address if block else "",
            "address_hours": block.address_hours if block else "",
            "newsletter_blurb": settings_row.newsletter_blurb if settings_row else "",
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def contact_submit(request):
    name = (request.data.get("name") or "").strip()
    email = (request.data.get("email") or "").strip()
    message = (request.data.get("message") or "").strip()
    if not (name and email and message):
        return Response({"detail": "Name, email, and message are required."}, status=400)
    send_mail(
        f"Pulsif contact from {name}",
        f"{name} <{email}>\n\n{message}",
        None,
        ["hello@pulsif.store"],
        fail_silently=True,
    )
    return Response({"ok": True})


@api_view(["POST"])
@permission_classes([AllowAny])
def newsletter(request):
    email = (request.data.get("email") or "").strip()
    if "@" not in email:
        return Response({"detail": "A valid email is required."}, status=400)
    send_mail(
        "Pulsif newsletter signup",
        email,
        None,
        ["hello@pulsif.store"],
        fail_silently=True,
    )
    return Response({"ok": True})
