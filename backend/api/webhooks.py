import json

from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from commerce.models import WebhookEvent
from commerce.services import payment_intent_succeeded, stripe_configured

try:
    import stripe
except ImportError:  # pragma: no cover
    stripe = None


@csrf_exempt
@require_POST
def stripe_webhook(request):
    if not stripe_configured():
        return JsonResponse({"detail": "Stripe is not configured."}, status=503)

    stripe.api_key = settings.STRIPE_SECRET_KEY
    payload = request.body
    secret = getattr(settings, "STRIPE_WEBHOOK_SECRET", "")
    event = None
    if secret:
        signature = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        try:
            event = stripe.Webhook.construct_event(payload, signature, secret)
        except Exception:
            return HttpResponse(status=400)
    elif settings.DEBUG:
        try:
            event = json.loads(payload.decode("utf-8"))
        except json.JSONDecodeError:
            return HttpResponse(status=400)
    else:
        return HttpResponse(status=400)

    event_id = event.get("id") if isinstance(event, dict) else event.id
    event_type = event.get("type") if isinstance(event, dict) else event.type
    data = event.get("data") if isinstance(event, dict) else event.data
    record, created = WebhookEvent.objects.get_or_create(
        event_id=event_id or f"anon-{event_type}",
        defaults={"event_type": event_type or "", "payload": event if isinstance(event, dict) else {"type": event_type}},
    )
    if not created and record.processed:
        return JsonResponse({"ok": True})

    obj = data.get("object") if isinstance(data, dict) else getattr(data, "object", None)
    intent_id = None
    if isinstance(obj, dict):
        intent_id = obj.get("id")
    elif obj is not None:
        intent_id = getattr(obj, "id", None)

    if event_type == "payment_intent.succeeded" and intent_id:
        payment_intent_succeeded(intent_id)

    record.processed = True
    record.event_type = event_type or record.event_type
    record.save(update_fields=["processed", "event_type"])
    return JsonResponse({"ok": True})
