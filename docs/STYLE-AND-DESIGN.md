# Style & Design System

Working brand name: **PULSIF**.  
Reference store: [pellicor.com](https://pellicor.com/)  
Products & photography: **ours only**. Pellicor is the layout, motion, and merchandising template — not the catalog.

---

## 1. How we use Pellicor

Copy the **experience**, not the brand.

| Keep from Pellicor | Replace with ours |
|---|---|
| Information architecture (Home, Catalog, Contact, FAQs, Cart, Search, Account) | Brand name, logo, gym/pilates copy |
| Full-bleed stacked hero storytelling | Our lifestyle + product shots |
| Archive tabs (Men / Women) + product card carousels | Gym accessories, not jackets |
| Color swatches that swap card images | Pink, purple, black (+ more later) |
| Slide-out cart, search overlay, sticky header | Same drawers, our tokens |
| PDP gallery + size/variant + accordion blocks | Fit charts for boards, bands, grips |
| Shop-the-look / essentials strip | Bundles (board + band + socks) |
| Footer: help, newsletter, policies, social | Our policies and contacts |
| Editorial luxury pacing (big type, lots of image, little chrome) | Energy colors + *restrained* neumorphism |

Pellicor is a Shopify fashion storefront: dark/editorial, image-first, slow luxury. Pulsif must **feel like that site** at first scroll — then reveal gym energy through color, product, and micro-motion. If a neumorphic trick fights the editorial look, cut the trick.

---

## 2. Site map (1:1 with Pellicor)

```
/                 Landing
/catalog          All products (Pellicor /collections/all)
/catalog/men      Men's accessories
/catalog/women    Women's accessories
/product/:slug    Product detail
/contact          Contact
/faqs             FAQs
/cart             Full cart page (drawer is global)
/checkout         Multi-step checkout
/account          Login / orders (phase 4+)
/search           Overlay first; /search?q= as fallback

/studio           Admin (not public nav)
  /studio                 Dashboard
  /studio/products        Product CRUD
  /studio/orders          Order tracking
  /studio/carousels       Hero / archive / lookbook image updates
```

Header nav (exact Pellicor order): **Home · Catalog · Contact · FAQs** + Search + Account + Cart count.

Footer: Help links, newsletter, social, legal (Privacy, Refund, Terms, Shipping, Contact).

---

## 3. Color system

Pellicor reads as **ink + hide + photograph**. We keep that canvas and inject gym color as *accents and product truth*, not as a rainbow skin.

### 3.1 Brand canvas (always on)

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#0E1013` | Page background (default), header, drawers |
| `--ink-2` | `#171A1F` | Elevated panels, sticky bars |
| `--paper` | `#F3EFE7` | Light sections, FAQ, contact, checkout forms |
| `--paper-2` | `#E7E1D6` | Cards on light, table rows |
| `--mist` | `#9A9388` | Muted labels, captions |
| `--line` | `rgba(243,239,231,0.12)` | Hairline borders on dark |
| `--line-dark` | `rgba(14,16,19,0.10)` | Hairline borders on light |
| `--text` | `#F6F3EC` | Primary text on dark |
| `--text-ink` | `#14161A` | Primary text on paper |

### 3.2 Energy accents (CTAs, sale, active)

Use **one primary CTA color per surface**. Do not mix lime + magenta on the same button row.

| Token | Hex | Role |
|---|---|---|
| `--volt` | `#C8F542` | Primary CTA on dark (Shop, Add to bag) |
| `--volt-ink` | `#12150A` | Text on volt buttons |
| `--ember` | `#FF4D6A` | Sale badges, urgency |
| `--ice` | `#7CFFF0` | Focus rings, rare highlights |

### 3.3 Product color tokens (variants)

These drive swatches, PDP ambient wash, and card glow. Every sellable color must exist here.

| Token | Hex | Swatch name |
|---|---|---|
| `--sku-black` | `#1A1A1A` | Black |
| `--sku-pink` | `#FF7AB6` | Pink |
| `--sku-purple` | `#7B5CFF` | Purple |
| `--sku-lilac` | `#C4B5FD` | Lilac (optional) |
| `--sku-graphite` | `#3A3F46` | Graphite |
| `--sku-sand` | `#D4C4A8` | Sand |
| `--sku-white` | `#F7F4EE` | Bone / white |

When a shopper picks a color:

1. Product images **crossfade** (280–400ms).
2. Active swatch **scales + neumorphic inset**.
3. A soft **ambient wash** (8–12% opacity radial) tints the gallery edge with that SKU color.
4. On landing cards, a thin glow ring (`box-shadow` in the SKU hue) eases in.

This is the gym equivalent of Pellicor’s black / burgundy / camel / tan swatches.

### 3.4 Semantic

| Token | Hex |
|---|---|
| `--ok` | `#3DDC97` |
| `--warn` | `#F5C14A` |
| `--err` | `#FF4D6A` |

---

## 4. Typography

Pellicor’s hierarchy: **tiny tracking-wide eyebrow → huge editorial headline → one short CTA**.

| Role | Font | Fallback | Spec |
|---|---|---|---|
| Display / H1–H2 | **Cormorant Garamond** | Georgia | 56–96px, weight 500, line 0.95–1.05, tracking −0.02em |
| Eyebrow / kicker | **Sora** | system-ui | 11–13px, weight 500, tracking 0.22em, uppercase |
| Body / UI | **Sora** | system-ui | 15–17px, weight 400, line 1.55 |
| Price | **Sora** | system-ui | 16–20px, weight 500, tabular nums |
| Button | **Sora** | system-ui | 13px, weight 600, tracking 0.08em, uppercase |

Load via `fontsource` or Google Fonts. Never mix a third family.

**Headline pattern (landing heroes):**

```
EYEBROW          e.g. ELEVATED MOVEMENT
Display          Built for the Rep
CTA text link    Shop Women's Boards  →
```

Same cadence as Pellicor’s “ELEVATED CRAFTSMANSHIP / Tailored for the Journey / Shop Women's Jackets”.

---

## 5. Layout & spacing

| Token | Value |
|---|---|
| `--space-1` … `--space-8` | 4 / 8 / 12 / 16 / 24 / 32 / 48 / 80 px |
| `--page-pad` | `clamp(16px, 4vw, 48px)` |
| `--max` | 1440px content; heroes are **full bleed, no max** |
| `--header-h` | 72px desktop / 60px mobile |
| `--radius-s` | 8px (swatches, inputs) |
| `--radius-m` | 16px (cards, drawers) |
| `--radius-l` | 28px (hero text panels only if needed) |
| Grid catalog | 2 col mobile · 3 col tablet · 4 col desktop |
| Product card | image ~ 4:5 (Pellicor portrait), then title + price + swatches |

**Header:** transparent over hero, then solid `--ink` after 8px scroll. Logo left, nav center, utilities right.

**Drawers:** cart and search slide from the **right**, ~420px, dimmed backdrop. Empty cart: headline + “Continue shopping” (Pellicor pattern).

---

## 6. Neumorphism — rules of use

Full-page neumorphism would destroy the Pellicor look. Use it only on **interactive chrome**.

**Allowed (soft, dark-theme neu):**

- Add-to-bag / primary buttons
- Color swatches
- Quantity stepper
- Icon buttons (search, cart, carousel arrows)
- Admin stat tiles
- Form inputs on `--paper` (subtle inset)

**Formula (dark):**

```css
--neu-out:
  6px 6px 14px rgba(0,0,0,0.45),
  -4px -4px 10px rgba(255,255,255,0.04);
--neu-in:
  inset 4px 4px 10px rgba(0,0,0,0.45),
  inset -3px -3px 8px rgba(255,255,255,0.04);
```

**Forbidden:**

- Neumorphic hero images
- Neumorphic product photos
- Colored plastic blobs behind lifestyle shots
- Heavy 2019 “soft UI” gray pages

Product photos stay **flat, full-bleed, editorial**. Chrome around them is lightly tactile.

---

## 7. Motion language (recreate Pellicor)

All storefront motion goes through **GSAP + ScrollTrigger**. Defaults: `duration: 0.8`, `ease: "power3.out"`. Respect `prefers-reduced-motion` (instant state, no scrub).

### 7.1 Landing — stacked cinematic heroes

Pellicor’s home is a **vertical story**: several full-viewport image chapters, each with eyebrow + headline + text CTA.

**Our implementation:**

- Each hero is `100vh` (minus header on first).
- **Pin** the chapter; **scrub** image `scale 1.08 → 1.0` (slow Ken Burns).
- Headline: split lines, `y: 40 → 0`, `autoAlpha: 0 → 1`, stagger 0.08.
- On leave: fade overlay 0.6 → 0.85 so type stays readable.
- Snap to nearest chapter (`snap: 1` with 0.2s delay) on desktop only.
- Mobile: no pin; fade-up on enter only (performance).

Chapter set (copy is ours; structure is Pellicor):

1. Women’s hero → Shop Women's  
2. Brand / origin → Explore the Collection  
3. Men’s hero → Shop Men's  
4. Shop All closer  

### 7.2 Archive (“The Pellicor Archive” → “The Pulsif Floor”)

- Section eyebrow + display title fade-up.
- **Men / Women** text tabs: underline slides (`Flip` or width tween).
- Grid of product cards stagger in (`y: 24`, stagger 0.06).
- Tab change: outgoing grid `autoAlpha → 0` 200ms, incoming stagger in.

### 7.3 Product card carousel (critical)

Pellicor cards are **mini sliders**: multiple images, prev/next, “Choose”, color dots.

- Drag + arrows (Embla or custom).
- Slide: `xPercent` 0.45s `power2.out`.
- Hover desktop: pause autoplay (if any); show arrows + “Choose”.
- “Choose” is a bottom overlay bar, not a modal.
- Color swatch click: jump carousel to that color’s first image + ambient ring.
- Sale pill: `--ember`, top-left, no bounce.

### 7.4 Shop the Look / Essentials

Pellicor: large look image + stacked product cards + “View details”.

- Horizontal scrub on desktop (pin look, cards slide in from right) **or** static 2-col if scrub feels heavy.
- Cards: same neu + swatch rules.
- CTA: text link, not a fat button.

### 7.5 Global UI

| Element | Motion |
|---|---|
| Header hide/show | Hide on scroll down > 80px, show on up (`y: -100`) |
| Cart / search / mobile nav | `x: 100% → 0`, 0.45s `power3.out`; backdrop `autoAlpha` |
| Cart line add | Flip layout of line items + badge count punch (`scale 1.2 → 1`) |
| Search results | Stagger list 0.04 |
| Page transition | Overlay wipe `--ink` 0.35s or simple fade; keep header mounted |
| Accordion (FAQ / PDP) | Height + `autoAlpha`, 0.35s; plus icon rotate 45° |
| Buttons | 120ms press: `scale 0.98` + switch to `--neu-in` |

### 7.6 Product detail

- Gallery: vertical thumbs (desktop) + main image fade. Zoom on click (scale 1.6, grab-pan).
- Variant / color: same wash + image crossfade as cards.
- Sticky ATC bar appears after gallery leaves viewport.
- Accordions: Key Features · Description · Care · Specs (Pellicor’s Features / Description / Care / Design).
- Related: same card carousel as archive.

### 7.7 Catalog

- Sticky filter bar (gender, type, color, sort, price).
- Filters apply with grid Flip (items reflow, no hard remount flash).
- Infinite scroll or “Load more” — prefer Load more to protect animation.

### 7.8 Contact & FAQs

- Contact: three info cards (phone, email, address) fade-up; form on `--paper`.
- FAQs: grouped accordion (General, Products, Fit, Shipping, Returns, Care) — same IA as Pellicor’s FAQ sections.

### 7.9 Cart & checkout

- Drawer first (Pellicor). Route `/cart` is the expanded version.
- Checkout: 3 steps — Details → Shipping → Pay. Progress bar is a thin volt line.
- No playful bounce on money UI.

---

## 8. Component inventory (storefront)

Build these as shared React pieces. Visual spec only here; API in the R&D doc.

1. `SiteHeader` — transparent / solid, hide-on-scroll  
2. `SiteFooter` — newsletter + legal  
3. `HeroChapter` — full-bleed + overlay + eyebrow/title/cta  
4. `HeroStack` — pinned chapters  
5. `ArchiveTabs` — Men / Women  
6. `ProductCard` — image carousel, sale, title, price, swatches, Choose  
7. `ColorSwatch` — neu + SKU token + selected inset  
8. `CartDrawer` / `SearchDrawer` / `NavDrawer`  
9. `Lookbook` — shop the look  
10. `EssentialsBanner` — full-bleed CTA  
11. `Accordion` / `AccordionGroup`  
12. `Gallery` — PDP media  
13. `VariantPicker` — color + size  
14. `SizeGuide` — modal table  
15. `QtyStepper`  
16. `FilterBar`  
17. `Price` — sale strike + current  
18. `EmptyState` — empty cart / empty search  
19. `NewsletterField`  
20. `Button` / `TextLink`  

Admin components live in `/studio` and may be more densely neumorphic (dashboards tolerate it).

---

## 9. Page-by-page visual spec

### 9.1 Landing

1. Header over hero  
2. 3–4 `HeroChapter`s (women / story / men / shop all)  
3. Archive: title + Men/Women + 2–4 `ProductCard`s + View All  
4. Full-bleed “Beyond the session” banner → View collection  
5. Essentials strip  
6. Shop the Look (featured board + matching band/socks)  
7. Gender tiles: Women · Men · Shop All  
8. Footer  

### 9.2 Catalog

Title “The Floor” or “Catalog”. Optional collection hero (half-height). Filter bar. Product grid. No sidebar on mobile.

### 9.3 Product detail

50/50 gallery | info. Breadcrumb. Title, price, short line, color, size, ATC, shipping note. Accordions. Related row.

### 9.4 Contact

Eyebrow “Client services”. Display “Get in touch”. Three neu cards + form. Link to FAQs.

### 9.5 FAQs

Centered display title. Category chips that scroll-spy the accordion groups. Closing “Still have questions?” → Contact.

### 9.6 Cart (page + drawer)

Line image, title, color, size, qty, price, remove. Subtotal + checkout CTA. Login hint for faster checkout.

### 9.7 Checkout

Quiet `--paper` canvas (less cinema, more trust). Summary sticky on desktop. Stripe (or equivalent) payment element. Order confirmation screen with number + email.

### 9.8 Admin `/studio`

Dark ink background, denser neu cards.  
Dashboard: orders today, revenue, low stock, carousel health.  
Products: table + slide-over editor (images, variants, colors).  
Orders: status pipeline (New → Paid → Packed → Shipped → Delivered).  
Carousels: each home/catalog slot as a sortable image list with alt, link, eyebrow, headline, CTA.

---

## 10. Imagery rules

- Lifestyle first on heroes (studio + movement). Product cutouts on cards are OK if consistent.
- 4:5 cards, 16:9 or 9:16 heroes.
- WebP, lazy below fold, `fetchpriority=high` on first hero only.
- Every SKU color needs **its own** photos. Swatches without matching images feel broken (Pellicor does this correctly).
- Do not use Pellicor jacket photos, logos, or wordmarks.

---

## 11. Copy tone

Pellicor: short, confident, heritage.  
Ours: short, confident, **athletic**. No bro-science paragraphs.

Eyebrow examples: `ELEVATED MOVEMENT` · `BUILT FOR BOTH` · `PINK. PURPLE. BLACK.`  
Headlines: `Tailored for the Rep` · `Real Grip. Real Progress.` · `Boards that last the program.`

---

## 12. Accessibility & inclusion

- Men and women are **equal** in nav, heroes, and archive — neither is a pastel ghetto.
- Color is never the only indicator (swatch has name tooltip + `aria-label`).
- Contrast: volt-on-ink and text-on-ink must pass WCAG AA.
- Reduced motion path is mandatory.
- Focus rings use `--ice`.

---

## 13. What we will literally use (implementation tokens)

```css
:root {
  --ink: #0E1013;
  --ink-2: #171A1F;
  --paper: #F3EFE7;
  --paper-2: #E7E1D6;
  --mist: #9A9388;
  --text: #F6F3EC;
  --text-ink: #14161A;
  --volt: #C8F542;
  --volt-ink: #12150A;
  --ember: #FF4D6A;
  --ice: #7CFFF0;
  --sku-black: #1A1A1A;
  --sku-pink: #FF7AB6;
  --sku-purple: #7B5CFF;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-fast: 180ms;
  --dur-med: 400ms;
  --dur-slow: 800ms;
  --font-display: "Cormorant Garamond", Georgia, serif;
  --font-ui: "Sora", system-ui, sans-serif;
}
```

Motion stack: **GSAP**, **@gsap/react**, **ScrollTrigger**, **Flip** (grid filters), optional **Lenis** for smooth scroll (off on mobile if jank).  
Carousel: **Embla**.  
Icons: **Lucide** (thin, not chunky).

---

## 14. Open design decisions (lock in Phase 0)

1. Final brand name and wordmark.  
2. Light-first vs dark-first (recommendation: **dark-first**, paper for forms/FAQ).  
3. First catalog: pilates boards, resistance bands, grips, socks, bags — confirm SKUs.  
4. Currency (USD default like Pellicor, or PKR/multi).  
5. Whether Shop the Look uses scrub-pin or a static editorial row.
