# Technical R&D and Development Phases

Stack: **React (Vite)** storefront + **Django + Django REST Framework** API.  
Visual source of truth: `STYLE-AND-DESIGN.md`.  
Reference UX: [pellicor.com](https://pellicor.com/) — recreate structure and motion; do not copy their assets, copy, or trademarks.

---

## 1. Goals

Ship a production-shaped gym accessories store that **moves like Pellicor**: stacked hero storytelling, archive tabs, product-card carousels, color-swatch image swaps, drawers, PDP gallery, FAQ accordions, cart, checkout.

Admin must update **products** and **every marketing carousel/hero** without a deploy.

---

## 2. Repository shape

Monorepo from day one so tokens and types stay aligned.

```
gym-accessories/
  STYLE-AND-DESIGN.md
  TECHNICAL-RND-AND-PHASES.md
  frontend/                 # Vite + React 18 + React Router 6
    src/
      app/                  # router, providers, guards
      pages/
      studio/               # admin app (same bundle, /studio)
      components/
      motion/               # GSAP presets, reduced-motion
      styles/               # tokens.css, reset, utilities
      api/                  # fetch wrappers
      store/                # cart, auth, ui drawers
  backend/                  # Django 5 + DRF
    config/
    catalog/
    orders/
    cms/                    # heroes, carousels, lookbooks
    accounts/
    media/
  docs/                     # API notes as we go
```

**Not using Next.js** unless SEO becomes a blocker. If it does, migrate storefront routes only; keep Django as the system of record.

---

## 3. Frontend stack (locked)

| Need | Choice | Why |
|---|---|---|
| Bundler | Vite | Fast, simple SPA |
| Routing | React Router 6 | Store + `/studio` |
| Server state | TanStack Query | Catalog, PDP, orders |
| Client state | Zustand | Cart, drawers, checkout draft |
| Motion | `gsap` + `@gsap/react` + ScrollTrigger + Flip | Pellicor-level scroll/carousels |
| Smooth scroll | Lenis (desktop only, feature-flagged) | Editorial feel; drop if it fights ScrollTrigger |
| Carousel | Embla Carousel React | Card + PDP + admin previews |
| Forms | React Hook Form + Zod | Checkout, contact, admin |
| Styling | CSS modules + `tokens.css` | No Tailwind-first — Pellicor look needs custom type/spacing. Utility classes only if they help |
| Icons | Lucide | |
| Payments | Stripe.js + Payment Element | PCI offload |
| Auth | JWT (access + httpOnly refresh cookie) | Studio + customer accounts |

### Motion R&D (do this before building pages)

Prototype in `frontend/src/motion/lab/` — not production routes.

| Experiment | Pass criteria |
|---|---|
| **Hero stack pin + snap** | 4 × 100vh chapters, scrub zoom, snap, no jumpy pin on resize |
| **Lenis + ScrollTrigger** | `ScrollTrigger.update` on Lenis `scroll`; no double-scroll |
| **Card Embla + GSAP** | Drag, arrows, color jump-to-slide, no layout shift |
| **SKU color wash** | Image crossfade + CSS var `--sku` tween on gallery |
| **Flip filters** | Catalog filter does not flash empty |
| **Drawer + scroll lock** | Body lock, focus trap, ESC, restore scroll |
| **Reduced motion** | `gsap.matchMedia` kills pin/scrub; instant states |

**React rules:** `useGSAP` + `scope` ref; never leave ScrollTriggers alive on route change. `ScrollTrigger.refresh()` after images load (`onLoad` + fonts).

**Risk:** pinning + Lenis + React 18 Strict Mode double-mount. Lab must prove cleanup.

**Fallback:** if pin-snap is unstable on Windows/low-end, ship fade-up chapters (still Pellicor-like) and keep card carousels.

---

## 4. Backend stack (locked)

| Need | Choice |
|---|---|
| API | Django 5, DRF, SimpleJWT |
| DB | PostgreSQL |
| Cache / queue | Redis + Celery (emails, webhooks) — Phase 4+; sync email OK in Phase 3 |
| Media | local `MEDIA` in dev; S3/R2 in prod |
| Images | Pillow; store originals; frontend requests sized variants later (Thumbor or imgproxy optional) |
| Admin API | same DRF, `IsStaff` permission — **custom `/studio` UI**, not stock Django admin for merch (Django admin can remain a superuser escape hatch) |
| CORS | frontend origin only |
| Payments | Stripe PaymentIntents; webhook signs orders `paid` |

---

## 5. Domain model (R&D)

### 5.1 Catalog

```
Category          slug, title, gender (men|women|unisex|all), sort
Product           slug, title, subtitle, description, care, features[],
                  gender, status (draft|live), tax_class
ProductImage      product, color (nullable FK), url, alt, sort, kind (card|hero|pdp|look)
Color           name, slug, hex  → black / pink / purple / …
Size            name, sort, gender_scope
Variant         product, color, size, sku, price, compare_at, stock, barcode
```

**Rule:** a color without images must not appear as a swatch on storefront.

### 5.2 CMS (carousels / heroes)

This is the admin “carousel image updates” requirement.

```
HeroChapter       page (home|catalog|men|women), sort, eyebrow, headline,
                  cta_label, cta_href, image, mobile_image, overlay 0–1,
                  pin_enabled
Carousel          key (home_archive_men, home_lookbook, pdp_related, …)
CarouselItem      carousel, image, product (optional), title, subtitle, href, sort
Lookbook          title, hero_image, items[] → product + hotspots later
SiteSettings      logo, announcement, socials, newsletter_blurb
FaqCategory / FaqItem
ContactBlock      phone, email, address, hours
```

Studio editors change **images + copy + links**. Frontend reads `/api/cms/home/` as one payload to avoid waterfall.

### 5.3 Commerce

```
Cart              session_key or user, currency
CartLine          variant, qty
Order             number, user?, email, status, totals, addresses, stripe_id
OrderLine         snapshot title/sku/price/qty/image
Address
WebhookEvent      stripe id, processed
```

Statuses: `pending → paid → packed → shipped → delivered | cancelled | refunded`.

Cart: **server cart** after first add (cookie `cart_id`). Guest checkout required (Pellicor allows it).

---

## 6. API surface (v1)

All JSON, versioned `/api/v1/`.

**Public**

| Method | Path | Purpose |
|---|---|---|
| GET | `/cms/home/` | Heroes, archive tabs, lookbook, essentials |
| GET | `/cms/pages/contact/` `/cms/pages/faqs/` | |
| GET | `/catalog/products/` | filters: gender, color, category, price, q, sort |
| GET | `/catalog/products/:slug/` | PDP + variants + images + related |
| GET | `/catalog/categories/` | |
| POST | `/cart/` `/cart/lines/` | create/update/remove |
| POST | `/checkout/` | create order + PaymentIntent |
| POST | `/checkout/:id/confirm/` | after Stripe |
| POST | `/contact/` | form → email |
| POST | `/newsletter/` | |
| POST | `/auth/register/` `/auth/login/` `/auth/refresh/` | |

**Staff (`IsStaff`)**

| Method | Path |
|---|---|
| GET | `/studio/dashboard/` |
| CRUD | `/studio/products/` `/studio/variants/` `/studio/images/` |
| CRUD | `/studio/orders/` + `POST .../status/` |
| CRUD | `/studio/heroes/` `/studio/carousels/` `/studio/carousel-items/` |
| CRUD | `/studio/faqs/` `/studio/settings/` |

Pagination: limit/offset. Images: multipart or presigned upload (presign in Phase 4).

---

## 7. Storefront architecture

```
QueryClientProvider
  AuthProvider
    CartProvider          # hydrates from GET /cart/
      MotionProvider      # reduced-motion + Lenis start/stop
        AppShell          # header, drawers, footer
          <Outlet />
```

**Route-level code split:** landing (heavy GSAP), catalog, pdp, checkout, studio.

**SEO (SPA limitation):** Phase 5 add prerender or migrate public pages to Next/SSR. Until then: correct titles, meta, JSON-LD Product, sitemap from Django.

---

## 8. Checkout R&D

Pellicor uses Shopify checkout. We custom-build:

1. `POST /checkout/` with cart id + email + shipping → `client_secret`  
2. Stripe Payment Element  
3. Webhook `payment_intent.succeeded` is **source of truth** (not only frontend confirm)  
4. Idempotent order number `KIN-YYYYMMDD-XXXX`

Taxes/shipping: start with flat or free-over-X in `SiteSettings`. Do not fake Shopify tax.

---

## 9. Admin (`/studio`) R&D

Same React app, `requireStaff` guard.

| Screen | Must do |
|---|---|
| Dashboard | 7-day revenue, order counts by status, low stock (<5), broken carousels (item missing image) |
| Products | list, search, create/edit, variants matrix (color × size), image assign per color, publish toggle |
| Orders | filters, detail, status buttons, tracking number, resend email |
| Carousels | visual sort (dnd-kit), replace image, live preview of home hero stack |

Image replace = upload new file + keep crop 4:5 or 16:9 hints. Show Pellicor-like preview frame so merch doesn’t upload square junk into a 4:5 card.

---

## 10. Animation implementation map

| Pellicor moment | Our module | Phase |
|---|---|---|
| Full-viewport story heroes | `HeroStack` + ScrollTrigger pin/scrub/snap | 2 |
| Header transparent → solid, hide on down-scroll | `SiteHeader` | 1 |
| Right cart / search drawers | `useDrawer` + GSAP x | 1 |
| Archive Men/Women | `ArchiveTabs` | 2 |
| Card image slider + Choose + swatches | `ProductCard` + Embla | 2 |
| Color → image + wash | `useSkuTheme` (sets `--sku` on node) | 2–3 |
| Shop the Look | `Lookbook` | 2 |
| PDP gallery zoom | `Gallery` | 3 |
| FAQ / PDP accordions | `Accordion` | 3 |
| Catalog Flip filter | `FilterBar` | 3 |
| Cart count Flip | `CartBadge` | 3 |

---

## 11. Local & env

```
frontend:  VITE_API_URL=http://127.0.0.1:8000/api/v1
           VITE_STRIPE_PK=

backend:  DJANGO_SECRET_KEY
           DATABASE_URL
           CORS_ORIGINS=http://localhost:5173
           STRIPE_SECRET_KEY
           STRIPE_WEBHOOK_SECRET
           EMAIL_BACKEND  (console in dev)
```

Never commit secrets. `.env.example` only.

---

## 12. Development phases

Each phase ends with a **demoable** slice. Do not start the next phase’s features until the previous demo is stable.

### Phase 0 — Foundation (2–3 days)

- Repo, Vite React, Django project, Postgres, CORS, health check `GET /api/v1/health/`
- `tokens.css` from the style doc, fonts, reset
- Motion lab routes (`/lab/heroes`, `/lab/cards`, `/lab/drawers`)
- Decision memo: Lenis on/off, pin-snap vs fade-up

**Exit:** lab heroes feel like Pellicor on desktop; reduced-motion works.

### Phase 1 — Shell (2 days)

- Header, footer, drawers, routing skeleton, empty pages
- Cart store (client-only mock)
- Newsletter field UI (API later)

**Exit:** navigate all public routes; cart drawer matches Pellicor empty state.

### Phase 2 — Landing (4–5 days)

- CMS models + `GET /cms/home/` (seeded fixtures)
- HeroStack, Archive, Lookbook, Essentials, gender tiles
- ProductCard wired to seed products (boards, bands — placeholder images **we own**)
- Studio: **Carousels** editor for home heroes + archive (minimum admin to iterate visuals)

**Exit:** home is indistinguishable in *layout/motion* from Pellicor, with our products/colors.

### Phase 3 — Catalog + PDP + FAQ/Contact (4–5 days)

- Product list API + filters
- PDP: gallery, variants, size guide, accordions, related
- Color wash + per-color images
- Contact form + FAQ CMS
- Cart API (server cart)

**Exit:** shopper can browse, change pink/purple/black, add to cart.

### Phase 4 — Checkout + accounts (4 days)

- Checkout UI, Stripe test mode, webhooks
- Order emails (console/SMTP)
- Guest + registered checkout
- Confirmation page

**Exit:** test card completes an order; order visible in DB.

### Phase 5 — Studio complete (4 days)

- Dashboard
- Full product CRUD + image/variant matrix
- Order tracking pipeline
- All carousel slots editable
- Staff auth

**Exit:** a merch user can add a product and swap the home hero without touching code.

### Phase 6 — Harden (3–4 days)

- Image optimization, Lighthouse (LCP first hero)
- a11y pass, keyboard drawers, swatch names
- Empty/error/404 states
- Rate-limit contact + checkout
- Backup / deploy recipe (Render / Fly / VPS + S3)
- SEO: meta, sitemap, JSON-LD
- Legal pages (our policies, not Pellicor’s)

**Exit:** staging URL ready for real product photography.

---

## 13. Suggested first catalog (seed, not final)

Use these to build variants/animation without waiting on a full PIM.

| Product | Colors | Notes |
|---|---|---|
| Reformer-style pilates board | Black, Pink, Purple | Hero SKU |
| Folding pilates board | Black, Sand | |
| Resistance band set | Pink, Purple, Black | |
| Lifting grips | Black, Graphite | |
| Crew training socks | Pink, Purple, Bone | Lookbook add-on |

---

## 14. Risks and decisions

| Risk | Mitigation |
|---|---|
| Pin-snap jank on Windows | Lab in Phase 0; fallback fade-up |
| GSAP + React leaks | `useGSAP` only; QA route changes |
| “Looks like Pellicor” vs neumorphism | Style doc: neu on chrome only |
| Shopify-level checkout expectations | Honest shipping/tax; Stripe Element |
| Image-heavy LCP | One hero `priority`; the rest lazy |
| Copying Pellicor IP | Own photos, own copy, own logo |
| Scope creep (reviews, wishlist, i18n) | After Phase 6 |

**Won’t do in v1:** native apps, multi-vendor, live chat, 3D/AR, full PIM, omnichannel inventory.

---

## 15. How we work each phase

1. Seed or mock the data first.  
2. Build motionless layout to the style spec.  
3. Layer GSAP.  
4. Wire API.  
5. Click through like a shopper (and in Studio like merch).  
6. Only then mark the phase done.

Browser verification is required for every UI phase (landing motion, catalog filters, PDP color change, cart drawer, checkout, studio uploads).

---

## 16. Immediate next step

After you confirm:

- brand name  
- Phase 0 fallback (pin-snap vs fade-up) is OK to decide in lab  
- Stripe vs another PSP later  

…we scaffold `frontend/` + `backend/` and start **Phase 0** (tokens + motion lab).
