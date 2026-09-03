from decimal import Decimal
from pathlib import Path

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files import File
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw

from catalog.models import Category, Color, Product, ProductImage, Size, Variant
from cms.models import (
    Banner,
    Carousel,
    CarouselItem,
    ContactBlock,
    FaqCategory,
    FaqItem,
    HeroChapter,
    SiteSettings,
)

PALETTES = {
    "pink": ((42, 18, 28), (255, 122, 182)),
    "purple": ((26, 20, 48), (123, 92, 255)),
    "black": ((20, 20, 22), (42, 42, 46)),
    "sand": ((42, 36, 28), (212, 196, 168)),
    "graphite": ((22, 24, 28), (58, 63, 70)),
    "white": ((40, 38, 34), (247, 244, 238)),
    "volt": ((16, 20, 12), (200, 245, 66)),
    "paper": ((22, 19, 15), (243, 239, 231)),
}


def paint_board(path: Path, tone: str, size=(800, 1000), inset=0.27):
    bg, obj = PALETTES[tone]
    image = Image.new("RGB", size, bg)
    draw = ImageDraw.Draw(image)
    width, height = size
    inset_x = int(width * inset)
    inset_y = int(height * 0.2)
    draw.rounded_rectangle(
        [inset_x, inset_y, width - inset_x, height - inset_y],
        radius=40,
        fill=obj,
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    image.save(path, "PNG")


def attach(instance, field_name, path: Path):
    with path.open("rb") as handle:
        getattr(instance, field_name).save(path.name, File(handle), save=True)


class Command(BaseCommand):
    help = "Seed catalog, heroes, carousels, FAQs, contact, and a staff user."

    def handle(self, *args, **_options):
        media = Path(settings.MEDIA_ROOT) / "seed"
        media.mkdir(parents=True, exist_ok=True)

        colors = {
            "black": Color.objects.update_or_create(
                slug="black", defaults={"name": "Black", "hex": "#1A1A1A", "sort": 1}
            )[0],
            "pink": Color.objects.update_or_create(
                slug="pink", defaults={"name": "Pink", "hex": "#FF7AB6", "sort": 2}
            )[0],
            "purple": Color.objects.update_or_create(
                slug="purple", defaults={"name": "Purple", "hex": "#7B5CFF", "sort": 3}
            )[0],
            "sand": Color.objects.update_or_create(
                slug="sand", defaults={"name": "Sand", "hex": "#D4C4A8", "sort": 4}
            )[0],
            "graphite": Color.objects.update_or_create(
                slug="graphite", defaults={"name": "Graphite", "hex": "#3A3F46", "sort": 5}
            )[0],
            "white": Color.objects.update_or_create(
                slug="white", defaults={"name": "Bone", "hex": "#F7F4EE", "sort": 6}
            )[0],
        }
        sizes = {
            name: Size.objects.update_or_create(name=name, defaults={"sort": index, "gender_scope": "all"})[0]
            for index, name in enumerate(["OS", "S", "M", "L", "XL"], start=1)
        }
        cats = {
            "boards": Category.objects.update_or_create(
                slug="boards", defaults={"title": "Boards", "gender": "all", "sort": 1}
            )[0],
            "bands": Category.objects.update_or_create(
                slug="bands", defaults={"title": "Bands", "gender": "all", "sort": 2}
            )[0],
            "grips": Category.objects.update_or_create(
                slug="grips", defaults={"title": "Grips", "gender": "all", "sort": 3}
            )[0],
            "socks": Category.objects.update_or_create(
                slug="socks", defaults={"title": "Socks", "gender": "all", "sort": 4}
            )[0],
        }
        board_guide = {
            "headers": ["Size", "Height", "Board length"],
            "rows": [
                ["S", "150-165 cm", "80 cm"],
                ["M", "165-178 cm", "90 cm"],
                ["L", "178-188 cm", "100 cm"],
                ["XL", "188+ cm", "110 cm"],
            ],
            "how": [
                "Height: stand against a wall, no shoes.",
                "If between sizes, size up for socks and layers.",
            ],
        }

        catalog = [
            {
                "slug": "reformer-board",
                "title": "Reformer Pilates Board",
                "subtitle": "Studio feel, apartment footprint.",
                "description": "A compact reformer-style board with enough travel for a full sequence. Built for daily work, not a weekend prop.",
                "care": "Wipe with a damp cloth. Keep away from direct heat. Do not machine wash.",
                "features": ["Fold-flat storage", "Non-slip footbed", "Pink, purple, and black"],
                "gender": Product.Gender.WOMEN,
                "category": cats["boards"],
                "sizes": ["S", "M", "L", "XL"],
                "colors": [
                    ("pink", "pink", Decimal("179.99"), Decimal("229.99")),
                    ("purple", "purple", Decimal("179.99"), Decimal("229.99")),
                    ("black", "black", Decimal("179.99"), Decimal("229.99")),
                ],
            },
            {
                "slug": "folding-board",
                "title": "Folding Pilates Board",
                "subtitle": "Travels. Still holds a full session.",
                "description": "Hinges that lock. A board you can take to a rental, a hotel, or the other room.",
                "care": "Wipe dry after use. Do not fold while damp.",
                "features": ["Travel latch", "Carry strap", "Unisex length chart"],
                "gender": Product.Gender.UNISEX,
                "category": cats["boards"],
                "sizes": ["S", "M", "L", "XL"],
                "colors": [
                    ("black", "black", Decimal("149.99"), None),
                    ("sand", "sand", Decimal("149.99"), None),
                ],
            },
            {
                "slug": "band-set",
                "title": "Resistance Band Set",
                "subtitle": "Three pulls. One bag.",
                "description": "Light, medium, and heavy in a single sleeve. Pair with a board or work standing.",
                "care": "Hang to dry. Avoid sharp jewelry.",
                "features": ["Three tensions", "Door anchor", "Carry sleeve"],
                "gender": Product.Gender.MEN,
                "category": cats["bands"],
                "sizes": ["OS"],
                "colors": [
                    ("black", "black", Decimal("39.99"), None),
                    ("purple", "purple", Decimal("39.99"), None),
                    ("pink", "pink", Decimal("39.99"), None),
                ],
            },
            {
                "slug": "grips",
                "title": "Lifting Grips",
                "subtitle": "Hold the bar without the callus tax.",
                "description": "A short grip that still lets you feel the knurl. Sized for mixed training, not just one lift.",
                "care": "Air dry. Condition leather twice a year.",
                "features": ["Split-finger", "Wrist lock", "Graphite or black"],
                "gender": Product.Gender.MEN,
                "category": cats["grips"],
                "sizes": ["S", "M", "L", "XL"],
                "colors": [
                    ("black", "black", Decimal("54.99"), None),
                    ("graphite", "graphite", Decimal("54.99"), None),
                ],
            },
            {
                "slug": "crew-socks",
                "title": "Crew Training Socks",
                "subtitle": "The look, finished.",
                "description": "A crew that stays up through reformer work and a walk home. Pink, purple, or bone.",
                "care": "Cold wash. Line dry.",
                "features": ["Arch band", "Cushion heel", "Three colors"],
                "gender": Product.Gender.UNISEX,
                "category": cats["socks"],
                "sizes": ["S", "M", "L"],
                "colors": [
                    ("pink", "pink", Decimal("18.99"), None),
                    ("purple", "purple", Decimal("18.99"), None),
                    ("white", "white", Decimal("18.99"), None),
                ],
            },
        ]

        products = {}
        for item in catalog:
            product, _ = Product.objects.update_or_create(
                slug=item["slug"],
                defaults={
                    "title": item["title"],
                    "subtitle": item["subtitle"],
                    "description": item["description"],
                    "care": item["care"],
                    "features": item["features"],
                    "size_guide": board_guide if item["category"].slug in ("boards", "grips") else {},
                    "shipping_note": "Shipping calculated at checkout.",
                    "gender": item["gender"],
                    "status": Product.Status.LIVE,
                    "category": item["category"],
                },
            )
            products[item["slug"]] = product
            Variant.objects.filter(product=product).delete()
            for color_slug, tone, price, compare in item["colors"]:
                color = colors[color_slug]
                for size_name in item["sizes"]:
                    Variant.objects.create(
                        sku=f"{item['slug'][:6]}-{color_slug[:3]}-{size_name}".upper(),
                        product=product,
                        color=color,
                        size=sizes[size_name],
                        price=price,
                        compare_at=compare,
                        stock=24,
                    )
                for shot, inset, kind in (
                    (0, 0.27, ProductImage.Kind.CARD),
                    (1, 0.22, ProductImage.Kind.PDP),
                    (2, 0.34, ProductImage.Kind.LOOK),
                ):
                    image_path = media / f"{item['slug']}-{color_slug}-{shot}.png"
                    if not image_path.exists():
                        paint_board(image_path, tone, inset=inset)
                    if not ProductImage.objects.filter(product=product, color=color, kind=kind).exists():
                        image = ProductImage(
                            product=product,
                            color=color,
                            alt=f"{product.title} {color.name}",
                            sort=shot,
                            kind=kind,
                        )
                        attach(image, "image", image_path)

        heroes = [
            ("Elevated Movement", "Tailored for\nthe Rep", "Shop Women's Boards", "/catalog/women", "pink"),
            ("Built For Both", "Real Grip.\nReal Progress.", "Explore the Collection", "/catalog", "volt"),
            ("Intentional Details", "Built to Last\nthe Program", "Shop Men's Gear", "/catalog/men", "graphite"),
            ("The Floor", "Shop All", "View the Catalog", "/catalog", "paper"),
        ]
        HeroChapter.objects.filter(page=HeroChapter.Page.HOME).delete()
        for sort, (eyebrow, headline, cta, href, tone) in enumerate(heroes):
            path = media / f"hero-{tone}.png"
            if not path.exists():
                paint_board(path, tone, size=(1080, 1620))
            chapter = HeroChapter(
                page=HeroChapter.Page.HOME,
                sort=sort,
                eyebrow=eyebrow,
                headline=headline,
                cta_label=cta,
                cta_href=href,
                overlay=0.5,
                pin_enabled=True,
                tone=tone,
            )
            chapter.save()
            attach(chapter, "image", path)

        banners = [
            ("beyond", "Beyond the Session", "A Lifetime of Training.", "View the Collection", "/catalog", "volt"),
            ("essentials", "Pulsif Essentials", "Shop now", "Shop now", "/catalog", "graphite"),
            ("lookbook", "Spring delivery", "Shop the Look", "View details", "/product/reformer-board", "pink"),
        ]
        for key, eyebrow, headline, cta, href, tone in banners:
            banner, _ = Banner.objects.update_or_create(
                key=key,
                defaults={
                    "eyebrow": eyebrow,
                    "headline": headline,
                    "cta_label": cta,
                    "cta_href": href,
                    "tone": tone,
                },
            )
            path = media / f"banner-{key}.png"
            if not path.exists():
                paint_board(path, tone, size=(1600, 900))
            if not banner.image:
                attach(banner, "image", path)

        slots = {
            "home_archive_men": ["grips", "band-set", "folding-board"],
            "home_archive_women": ["reformer-board", "folding-board", "crew-socks"],
            "home_lookbook": ["reformer-board", "band-set", "crew-socks"],
        }
        titles = {
            "home_archive_men": "Archive · Men",
            "home_archive_women": "Archive · Women",
            "home_lookbook": "Shop the Look",
        }
        for key, slugs in slots.items():
            carousel, _ = Carousel.objects.update_or_create(key=key, defaults={"title": titles[key]})
            carousel.items.all().delete()
            for sort, slug in enumerate(slugs):
                CarouselItem.objects.create(
                    carousel=carousel,
                    product=products[slug],
                    title=products[slug].title,
                    href=f"/product/{slug}",
                    sort=sort,
                )

        SiteSettings.objects.update_or_create(
            pk=1,
            defaults={
                "announcement": "",
                "newsletter_blurb": "Sign up for our newsletter",
                "shipping_flat": 12,
                "shipping_free_over": 150,
            },
        )

        ContactBlock.objects.update_or_create(
            pk=1,
            defaults={
                "blurb": "Sizing, orders, or a board in pink, purple, or black — a real person will write back.",
                "phone": "+1 (000) 000-0000",
                "phone_hours": "Mon - Fri, 9:00 - 18:00",
                "email": "hello@pulsif.store",
                "email_note": "Within one business day",
                "address": "Address coming soon",
                "address_hours": "Tue - Sat, 10:00 - 19:00",
            },
        )

        faqs = [
            (
                "general",
                "General",
                [
                    ("What is Pulsif?", "A gym and pilates accessories house for men and women — boards, bands, grips, and the kit around them.", True),
                    ("Do you make kit for both?", "Yes. Neither side of the floor is a sidecar. Pink, purple, and black sit in the same catalog.", False),
                ],
            ),
            (
                "fit",
                "Size & Fit",
                [
                    ("How do I use the size guide?", "Every product page has a chart. Match height for boards, or a pair of socks that already fit.", True),
                    ("What if I am between sizes?", "Size up for boards if you layer socks. Size down for grips if you want a lock.", False),
                ],
            ),
            (
                "shipping",
                "Shipping & Returns",
                [
                    ("Where do you ship?", "Worldwide once an order is paid. Tracking goes out with dispatch.", False),
                    ("What is the return window?", "Unused kit in original condition, 30 days. Custom pieces stay final sale.", False),
                ],
            ),
            (
                "care",
                "Product Care",
                [
                    ("How do I clean a board?", "Wipe with a damp cloth. Keep away from heat. Do not machine wash.", False),
                ],
            ),
        ]
        for cat_sort, (slug, title, items) in enumerate(faqs):
            category, _ = FaqCategory.objects.update_or_create(
                slug=slug, defaults={"title": title, "sort": cat_sort}
            )
            category.items.all().delete()
            for index, (question, answer, popular) in enumerate(items):
                FaqItem.objects.create(
                    category=category,
                    question=question,
                    answer=answer,
                    popular=popular,
                    sort=index,
                )

        User = get_user_model()
        if not User.objects.filter(username="studio").exists():
            User.objects.create_superuser("studio", "studio@pulsif.store", "studio-dev")
            self.stdout.write(self.style.SUCCESS("Staff user studio / studio-dev"))
        else:
            self.stdout.write("Staff user already exists")

        self.stdout.write(self.style.SUCCESS("Phase 2/3 seed complete."))
