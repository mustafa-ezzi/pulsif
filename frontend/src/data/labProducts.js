export const LAB_PRODUCTS = [
  {
    id: "reformer-board",
    title: "Reformer Pilates Board",
    price: 179.99,
    compareAt: 229.99,
    sale: true,
    gender: "women",
    colors: [
      {
        slug: "pink",
        name: "Pink",
        token: "var(--sku-pink)",
        slides: ["pink-a", "pink-b", "pink-c"],
      },
      {
        slug: "purple",
        name: "Purple",
        token: "var(--sku-purple)",
        slides: ["purple-a", "purple-b"],
      },
      {
        slug: "black",
        name: "Black",
        token: "var(--sku-black)",
        slides: ["black-a", "black-b"],
      },
    ],
  },
  {
    id: "folding-board",
    title: "Folding Pilates Board",
    price: 149.99,
    sale: false,
    gender: "unisex",
    colors: [
      {
        slug: "black",
        name: "Black",
        token: "var(--sku-black)",
        slides: ["black-a", "black-c"],
      },
      {
        slug: "sand",
        name: "Sand",
        token: "var(--sku-sand)",
        slides: ["sand-a"],
      },
    ],
  },
  {
    id: "band-set",
    title: "Resistance Band Set",
    price: 39.99,
    sale: false,
    gender: "men",
    colors: [
      {
        slug: "black",
        name: "Black",
        token: "var(--sku-black)",
        slides: ["black-b"],
      },
      {
        slug: "purple",
        name: "Purple",
        token: "var(--sku-purple)",
        slides: ["purple-a"],
      },
      {
        slug: "pink",
        name: "Pink",
        token: "var(--sku-pink)",
        slides: ["pink-c"],
      },
    ],
  },
  {
    id: "grips",
    title: "Lifting Grips",
    price: 54.99,
    sale: false,
    gender: "men",
    colors: [
      {
        slug: "black",
        name: "Black",
        token: "var(--sku-black)",
        slides: ["black-a"],
      },
      {
        slug: "graphite",
        name: "Graphite",
        token: "var(--sku-graphite)",
        slides: ["graphite-a"],
      },
    ],
  },
];

export const HERO_CHAPTERS = [
  {
    id: "women",
    eyebrow: "Elevated Movement",
    lines: ["Tailored for", "the Rep"],
    cta: "Shop Women's Boards",
    tone: "pink",
  },
  {
    id: "story",
    eyebrow: "Built For Both",
    lines: ["Real Grip.", "Real Progress."],
    cta: "Explore the Collection",
    tone: "volt",
  },
  {
    id: "men",
    eyebrow: "Intentional Details",
    lines: ["Built to Last", "the Program"],
    cta: "Shop Men's Gear",
    tone: "graphite",
  },
  {
    id: "all",
    eyebrow: "The Floor",
    lines: ["Shop All"],
    cta: "View the Catalog",
    tone: "paper",
  },
];
