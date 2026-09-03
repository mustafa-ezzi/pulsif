from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from commerce.models import Order
from commerce.services import serialize_order

User = get_user_model()


def _shopper(user):
    return {
        "email": user.email or user.get_username(),
        "name": user.first_name or user.get_username(),
        "is_staff": user.is_staff,
    }


def _tokens(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": _shopper(user),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    name = (request.data.get("name") or "").strip()
    if not (email and "@" in email and len(password) >= 8 and name):
        return Response({"detail": "Name, email, and a password of at least 8 characters are required."}, status=400)
    if User.objects.filter(Q(username__iexact=email) | Q(email__iexact=email)).exists():
        return Response({"detail": "An account with that email already exists."}, status=400)
    user = User.objects.create_user(username=email, email=email, password=password, first_name=name[:150])
    return Response(_tokens(user), status=201)


@api_view(["POST"])
@permission_classes([AllowAny])
def shopper_login(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    user = authenticate(request, username=email, password=password)
    if user is None:
        return Response({"detail": "Invalid email or password."}, status=400)
    return Response(_tokens(user))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def account(request):
    return Response(_shopper(request.user))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def account_orders(request):
    email = (request.user.email or request.user.get_username()).lower()
    orders = Order.objects.filter(Q(user=request.user) | Q(email__iexact=email)).prefetch_related("lines")
    return Response([serialize_order(order) for order in orders])
