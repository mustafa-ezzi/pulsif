from django.db import connection
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health(_request):
    db_ok = True
    engine = connection.settings_dict.get("ENGINE", "")
    try:
        connection.ensure_connection()
    except Exception:
        db_ok = False

    return Response(
        {
            "ok": db_ok,
            "service": "pulsif-api",
            "phase": 6,
            "database": "postgres" if "postgresql" in engine else "sqlite",
            "time": timezone.now().isoformat(),
        }
    )
