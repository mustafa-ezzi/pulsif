# Phase 0 decisions

Lab lives at `/lab`. Use the bar toggles while you scroll. Defaults below are the production recommendation until a Windows machine proves otherwise.

## Lenis — OFF by default

- Flag: `VITE_LENIS=false` and the **Lenis** chip starts off.
- Why: pin + snap + Windows wheel often double-scrolls or slips the pin. ScrollTrigger already feels editorial with `scrub: 0.8`.
- Turn it on in the lab on desktop only. If heroes stay glued and there is no rubber-banding, we can enable it in Phase 2 behind the same flag.
- Mobile: never starts, even if the chip is on.

## Hero motion — pin-snap on desktop, fade-up fallback

- **pin-snap** (default, `min-width: 800px`): each chapter pins, image scales `1.08 → 1`, overlay darkens, snap to chapter.
- **fade-up**: no pin. Copy fades in on enter. Use this if pin jumps on resize or a low-end GPU.
- Mobile: fade-up only. No pin, no snap.
- **Reduce** chip (and OS `prefers-reduced-motion`): instant final states, no scrub.

Phase 2 `HeroStack` should read the same three paths. Do not invent a fourth. fwf
 
## Other lab results to carry forward
   
| Experiment | Carry into Phase 1–2 |
|---|---|
| Card Embla + swatches | Keep. Color sets `--sku` and jumps to that color’s first slide. |
| Drawers | Right 420px, `power3.out` 0.45s, scroll lock, Escape. |
| Flip filters | Use on catalog; `absolute: true` during flip. |
| Tokens / fonts | `tokens.css`, Cormorant Garamond + Sora. Do not add a third family. |

## Run locally

```bash
# API
cd backend
.venv\Scripts\python.exe manage.py migrate
.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000

# Storefront lab
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173/lab`. The bar pill turns green when `GET /api/v1/health/` is up.

SQLite is the Phase 0 database. Point `DATABASE_URL` at Postgres when you have it; the health payload will say `postgres`.
