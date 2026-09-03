import uuid
from decimal import Decimal

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from cms.models import SiteSettings
from commerce.models import Order, OrderLine

try:
    import stripe
except ImportError:  # pragma: no cover
    stripe = None


def stripe_configured():
    return bool(getattr(settings, "STRIPE_SECRET_KEY", "") and stripe)


def order_number():
    stamp = timezone.now().strftime("%Y%m%d")
    return f"PUL-{stamp}-{uuid.uuid4().hex[:4].upper()}"


def shipping_for(subtotal):
    row = SiteSettings.objects.first()
    flat = Decimal(getattr(row, "shipping_flat", None) or 12)
    free_over = Decimal(getattr(row, "shipping_free_over", None) or 0)
    if free_over and subtotal >= free_over:
        return Decimal("0.00")
    return flat.quantize(Decimal("0.01"))


NEXT_STATUSES = {
    Order.Status.PENDING: [Order.Status.PAID, Order.Status.CANCELLED],
    Order.Status.PAID: [Order.Status.PACKED, Order.Status.CANCELLED, Order.Status.REFUNDED],
    Order.Status.PACKED: [Order.Status.SHIPPED, Order.Status.CANCELLED],
    Order.Status.SHIPPED: [Order.Status.DELIVERED],
    Order.Status.DELIVERED: [Order.Status.REFUNDED],
    Order.Status.CANCELLED: [],
    Order.Status.REFUNDED: [],
}


def serialize_order(order, staff=False):
    data = {
        "id": str(order.id),
        "number": order.number,
        "status": order.status,
        "email": order.email,
        "name": order.name,
        "currency": order.currency,
        "subtotal": float(order.subtotal),
        "shipping": float(order.shipping),
        "total": float(order.total),
        "tracking_number": order.tracking_number,
        "shipping_address": {
            "line1": order.shipping_line1,
            "line2": order.shipping_line2,
            "city": order.shipping_city,
            "region": order.shipping_region,
            "postal": order.shipping_postal,
            "country": order.shipping_country,
        },
        "lines": [
            {
                "title": line.title,
                "sku": line.sku,
                "color": line.color,
                "size": line.size,
                "price": float(line.price),
                "qty": line.qty,
                "image": line.image,
            }
            for line in order.lines.all()
        ],
        "paid_at": order.paid_at.isoformat() if order.paid_at else None,
        "created_at": order.created_at.isoformat(),
    }
    if staff:
        data["next_statuses"] = NEXT_STATUSES.get(order.status, [])
        data["stripe_id"] = order.stripe_id
    return data


def snapshot_lines(request, order, cart):
    from catalog.serializers import absolute_url

    for line in cart.lines.select_related("variant__product", "variant__color", "variant__size"):
        variant = line.variant
        product = variant.product
        image = product.images.filter(color=variant.color).first() or product.images.first()
        OrderLine.objects.create(
            order=order,
            variant=variant,
            title=product.title,
            sku=variant.sku,
            color=variant.color.name,
            size=variant.size.name if variant.size_id else "OS",
            price=variant.price,
            qty=line.qty,
            image=absolute_url(request, image.image) if image else "",
        )


def create_payment_intent(order):
    if not stripe_configured():
        order.stripe_id = f"pi_mock_{order.id.hex[:24]}"
        order.save(update_fields=["stripe_id"])
        return None
    stripe.api_key = settings.STRIPE_SECRET_KEY
    intent = stripe.PaymentIntent.create(
        amount=int(order.total * 100),
        currency=order.currency.lower(),
        metadata={"order_id": str(order.id), "order_number": order.number},
        receipt_email=order.email,
        automatic_payment_methods={"enabled": True},
    )
    order.stripe_id = intent.id
    order.save(update_fields=["stripe_id"])
    return intent.client_secret


@transaction.atomic
def mark_paid(order):
    order = Order.objects.select_for_update().prefetch_related("lines__variant").get(pk=order.pk)
    if order.status == Order.Status.PAID:
        return order
    if order.status not in (Order.Status.PENDING,):
        return order

    for line in order.lines.all():
        variant = line.variant
        if not variant:
            continue
        if variant.stock < line.qty:
            variant.stock = 0
        else:
            variant.stock -= line.qty
        variant.save(update_fields=["stock"])

    if order.cart_id:
        order.cart.lines.all().delete()

    order.status = Order.Status.PAID
    order.paid_at = timezone.now()
    order.save(update_fields=["status", "paid_at"])
    send_order_email(order)
    return order


STATUS_NOTES = {
    Order.Status.PAID: "Paid. We will pack this next.",
    Order.Status.PACKED: "Packed and ready to leave the studio.",
    Order.Status.SHIPPED: "Shipped. Tracking is on its way with this note.",
    Order.Status.DELIVERED: "Delivered. Thank you for training with Pulsif.",
    Order.Status.CANCELLED: "This order was cancelled.",
    Order.Status.REFUNDED: "This order was refunded.",
}


def send_order_email(order, note=None):
    lines = "\n".join(
        f"- {line.title} ({line.color} / {line.size}) x{line.qty}  ${line.price}"
        for line in order.lines.all()
    )
    message = note or STATUS_NOTES.get(order.status, "An update on your order.")
    tracking = f"\nTracking  {order.tracking_number}\n" if order.tracking_number else "\n"
    body = (
        f"Pulsif order {order.number}\n\n"
        f"Hi {order.name},\n\n"
        f"{message}\n"
        f"{tracking}"
        f"{lines}\n\n"
        f"Shipping  ${order.shipping}\n"
        f"Total     ${order.total}\n\n"
        f"Ship to:\n{order.shipping_line1}\n{order.shipping_city} {order.shipping_postal}\n"
        f"{order.shipping_country}\n"
    )
    send_mail(
        f"Pulsif order {order.number}",
        body,
        None,
        [order.email],
        fail_silently=True,
    )


def advance_order(order, status, tracking_number=None):
    allowed = NEXT_STATUSES.get(order.status, [])
    if status not in allowed:
        raise ValueError(f"Cannot move {order.status} to {status}.")
    fields = ["status"]
    order.status = status
    if tracking_number is not None:
        order.tracking_number = tracking_number.strip()
        fields.append("tracking_number")
    if status == Order.Status.SHIPPED and not order.tracking_number:
        raise ValueError("Tracking number is required to ship.")
    if status == Order.Status.PAID and not order.paid_at:
        order.paid_at = timezone.now()
        fields.append("paid_at")
    order.save(update_fields=fields)
    send_order_email(order)
    return order


def payment_intent_succeeded(intent_id):
    order = Order.objects.filter(stripe_id=intent_id).first()
    if not order:
        return None
    return mark_paid(order)
