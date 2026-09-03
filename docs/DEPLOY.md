# Deploy

Pulsif is two hosts: Django on Railway, the Vite storefront wherever you serve `frontend/dist`.

## Railway API

Root directory: `backend`. Attach PostgreSQL so `DATABASE_URL` is injected.

Required variables:

```
DEBUG=False
DJANGO_SECRET_KEY=
ALLOWED_HOSTS=.up.railway.app
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=https://pulsif-production.up.railway.app
SERVE_MEDIA=True
PUBLIC_SITE_URL=https://YOUR-STOREFRONT-HOST
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

Leave `PORT` and `RAILWAY_PUBLIC_DOMAIN` alone.

After the first deploy:

1. Open `https://pulsif-production.up.railway.app/api/v1/health/`
2. Seed: `python manage.py seed_phase2` over Railway SSH
3. Create a staff user (`createsuperuser`)
4. Point the frontend production env at `https://pulsif-production.up.railway.app/api/v1`

Media files live on the container disk and can disappear on redeploy. Add a Railway volume on `backend/media` or move uploads to S3/R2 when photos are final.

## Storefront

`frontend/.env.development` uses localhost. `frontend/.env.production` uses the Railway API.

```
npm run build
```

Serve `frontend/dist`. Copy `index.html` to `404.html` if the host has no SPA rewrite (GitHub Pages).

## Backups

- Postgres: Railway plugin → backups, or `pg_dump` against `DATABASE_URL`
- Media: copy the volume or S3 bucket
- Do not commit `.env` files

## Stripe

Webhook URL: `https://pulsif-production.up.railway.app/api/v1/webhooks/stripe/`
