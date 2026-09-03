from rest_framework.throttling import AnonRateThrottle


class ContactThrottle(AnonRateThrottle):
    scope = "contact"


class NewsletterThrottle(AnonRateThrottle):
    scope = "newsletter"


class CheckoutThrottle(AnonRateThrottle):
    scope = "checkout"
