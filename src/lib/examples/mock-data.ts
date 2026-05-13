export type ProductStatus = "active" | "draft" | "archived";

export type Product = {
  id: string;
  name: string;
  sku: string;
  category: "Apparel" | "Electronics" | "Home" | "Books" | "Sports";
  price: number;
  stock: number;
  status: ProductStatus;
  createdAt: string;
  supplier?: string;
  weightG?: number;
  color?: string;
  leadTimeDays?: number;
  marginPct?: number;
};

const CATEGORIES: Product["category"][] = [
  "Apparel",
  "Electronics",
  "Home",
  "Books",
  "Sports",
];

const STATUSES: ProductStatus[] = ["active", "draft", "archived"];

const SUPPLIERS = [
  "Northwind Co.",
  "Acme Trading",
  "Helio Imports",
  "Pinnacle Goods",
  "Tide & Co.",
];

const COLORS = ["Slate", "Bone", "Moss", "Clay", "Indigo", "Sand", "Rust"];

const NAMES = [
  "Atlas Tee",
  "Nimbus Hoodie",
  "Glacier Mug",
  "Helio Lamp",
  "Quartz Watch",
  "Pebble Speaker",
  "Drift Backpack",
  "Loom Blanket",
  "Forge Knife Set",
  "Beacon Headphones",
  "Cinder Candle",
  "Vista Notebook",
  "Pulse Yoga Mat",
  "Tide Water Bottle",
  "Echo Earbuds",
  "Roam Sneakers",
  "Spire Pen",
  "Verdant Planter",
  "Halcyon Pillow",
  "Mosaic Throw",
  "Forge Skillet",
  "Aether Drone",
  "Pinnacle Tent",
  "Cascade Kettle",
  "Lumen Reading Light",
  "Boulder Climbing Holds",
  "Thicket Coffee Table",
  "Glide Skateboard",
  "Anchor Wallet",
  "Flint Lighter",
];

function rand(seed: number) {
  // Tiny deterministic PRNG so the data is stable across renders.
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export const MOCK_PRODUCTS: Product[] = NAMES.map((name, i) => {
  const r = rand(i + 1);
  const cat = CATEGORIES[Math.floor(r() * CATEGORIES.length)]!;
  const status = STATUSES[Math.floor(r() * STATUSES.length)]!;
  const price = Math.round((r() * 280 + 12) * 100) / 100;
  const stock = Math.floor(r() * 250);
  const day = String((i % 28) + 1).padStart(2, "0");
  const month = String(((i * 3) % 12) + 1).padStart(2, "0");
  const supplier = SUPPLIERS[Math.floor(r() * SUPPLIERS.length)]!;
  const color = COLORS[Math.floor(r() * COLORS.length)]!;
  const weightG = Math.floor(r() * 1900 + 100);
  const leadTimeDays = Math.floor(r() * 27 + 1);
  const marginPct = Math.round(r() * 60) / 100;
  return {
    id: `prod_${String(i + 1).padStart(3, "0")}`,
    name,
    sku: `SKU-${(1000 + i * 7).toString(36).toUpperCase()}`,
    category: cat,
    price,
    stock,
    status,
    createdAt: `2026-${month}-${day}`,
    supplier,
    color,
    weightG,
    leadTimeDays,
    marginPct,
  };
});

export const PRODUCT_CATEGORIES: readonly Product["category"][] = CATEGORIES;

export const MOCK_PRODUCT: Product & { description: string } = {
  ...MOCK_PRODUCTS[0]!,
  description:
    "A soft, breathable everyday tee in mid-weight cotton. Pre-washed for minimal shrinkage. Reinforced stitching at the collar.",
};
