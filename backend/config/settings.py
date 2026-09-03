from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env(
    DEBUG=(bool, True),
)
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("DJANGO_SECRET_KEY", default="phase0-dev-only-change-me")
DEBUG = env("DEBUG")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=["localhost", "127.0.0.1"])
railway_host = env("RAILWAY_PUBLIC_DOMAIN", default="")
if railway_host and railway_host not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(railway_host)
if env.bool("ALLOW_ALL_HOSTS", default=False) and "*" not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append("*")

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
    "catalog",
    "cms",
    "commerce",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

database_url = env("DATABASE_URL", default="")
if database_url:
    DATABASES = {"default": env.db("DATABASE_URL")}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
SERVE_MEDIA = env.bool("SERVE_MEDIA", default=True)
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ── Cloudflare R2 / S3-compatible object storage ─────────────────────────────
# Set CF_R2_BUCKET_NAME in Railway env to enable; falls back to local disk.
_r2_bucket = env("CF_R2_BUCKET_NAME", default="")
if _r2_bucket:
    INSTALLED_APPS += ["storages"]
    DEFAULT_FILE_STORAGE = "storages.backends.s3boto3.S3Boto3Storage"
    AWS_STORAGE_BUCKET_NAME = _r2_bucket
    AWS_S3_REGION_NAME = "auto"
    AWS_S3_ENDPOINT_URL = env("CF_R2_ENDPOINT_URL", default="")   # https://<account-id>.r2.cloudflarestorage.com
    AWS_ACCESS_KEY_ID = env("CF_R2_ACCESS_KEY_ID", default="")
    AWS_SECRET_ACCESS_KEY = env("CF_R2_SECRET_ACCESS_KEY", default="")
    AWS_S3_FILE_OVERWRITE = False
    AWS_QUERYSTRING_AUTH = False                                    # public bucket → no signed URLs
    AWS_S3_CUSTOM_DOMAIN = env("CF_R2_CUSTOM_DOMAIN", default="")  # optional: e.g. media.pulsif.store
    if AWS_S3_CUSTOM_DOMAIN:
        MEDIA_URL = f"https://{AWS_S3_CUSTOM_DOMAIN}/"
    else:
        MEDIA_URL = f"{AWS_S3_ENDPOINT_URL}/{_r2_bucket}/"
# ─────────────────────────────────────────────────────────────────────────────
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

from corsheaders.defaults import default_headers

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ORIGINS",
    default=["http://localhost:5173", "http://127.0.0.1:5173"],
)
CORS_ALLOWED_ORIGIN_REGEXES = env.list(
    "CORS_ORIGIN_REGEXES",
    default=[r"https://.*\.up\.railway\.app"],
)
CORS_ALLOW_HEADERS = [*default_headers, "x-cart-id"]
CORS_EXPOSE_HEADERS = ["x-cart-id"]

csrf_origins = env.list("CSRF_TRUSTED_ORIGINS", default=[])
if railway_host:
    csrf_origins.append(f"https://{railway_host}")
CSRF_TRUSTED_ORIGINS = csrf_origins

EMAIL_BACKEND = env("EMAIL_BACKEND", default="django.core.mail.backends.console.EmailBackend")
DEFAULT_FROM_EMAIL = "Pulsif <hello@pulsif.store>"
PUBLIC_SITE_URL = env("PUBLIC_SITE_URL", default="http://127.0.0.1:5173")

STRIPE_SECRET_KEY = env("STRIPE_SECRET_KEY", default="")
STRIPE_PUBLISHABLE_KEY = env("STRIPE_PUBLISHABLE_KEY", default="")
STRIPE_WEBHOOK_SECRET = env("STRIPE_WEBHOOK_SECRET", default="")

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_THROTTLE_RATES": {
        "contact": "8/hour",
        "newsletter": "12/hour",
        "checkout": "20/hour",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=8),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}
