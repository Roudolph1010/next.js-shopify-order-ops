/**
 * Seeds test products into your Shopify development store.
 * Run with: npm run seed:products
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN!;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2024-10";

if (!DOMAIN || !TOKEN) {
  console.error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_TOKEN in env");
  process.exit(1);
}

const PRODUCTS = [
  {
    title: "Classic Cotton T-Shirt",
    body_html: "<p>Comfortable everyday cotton t-shirt.</p>",
    vendor: "Order Ops Store",
    product_type: "Apparel",
    tags: "cotton, casual, everyday",
    variants: [
      { option1: "S", price: "19.99", sku: "TSHIRT-S", inventory_quantity: 50 },
      { option1: "M", price: "19.99", sku: "TSHIRT-M", inventory_quantity: 75 },
      { option1: "L", price: "19.99", sku: "TSHIRT-L", inventory_quantity: 60 },
      { option1: "XL", price: "21.99", sku: "TSHIRT-XL", inventory_quantity: 40 },
    ],
    options: [{ name: "Size" }],
  },
  {
    title: "Running Sneakers",
    body_html: "<p>Lightweight running shoes for daily training.</p>",
    vendor: "Order Ops Store",
    product_type: "Footwear",
    tags: "shoes, running, sport",
    variants: [
      { option1: "7", price: "79.99", sku: "SHOES-7", inventory_quantity: 20 },
      { option1: "8", price: "79.99", sku: "SHOES-8", inventory_quantity: 30 },
      { option1: "9", price: "79.99", sku: "SHOES-9", inventory_quantity: 35 },
      { option1: "10", price: "79.99", sku: "SHOES-10", inventory_quantity: 25 },
      { option1: "11", price: "79.99", sku: "SHOES-11", inventory_quantity: 15 },
    ],
    options: [{ name: "Size" }],
  },
  {
    title: "Wireless Noise-Cancelling Headphones",
    body_html: "<p>Over-ear headphones with active noise cancellation.</p>",
    vendor: "Order Ops Store",
    product_type: "Electronics",
    tags: "audio, wireless, headphones",
    variants: [
      { option1: "Black", price: "129.99", sku: "HEADPHONES-BLK", inventory_quantity: 40 },
      { option1: "White", price: "129.99", sku: "HEADPHONES-WHT", inventory_quantity: 30 },
    ],
    options: [{ name: "Color" }],
  },
  {
    title: "Insulated Water Bottle",
    body_html: "<p>500ml stainless steel vacuum insulated bottle. Keeps drinks cold 24h, hot 12h.</p>",
    vendor: "Order Ops Store",
    product_type: "Accessories",
    tags: "bottle, hydration, outdoor",
    variants: [
      { option1: "Black", price: "24.99", sku: "BOTTLE-BLK", inventory_quantity: 80 },
      { option1: "Navy", price: "24.99", sku: "BOTTLE-NVY", inventory_quantity: 60 },
      { option1: "Red", price: "24.99", sku: "BOTTLE-RED", inventory_quantity: 45 },
    ],
    options: [{ name: "Color" }],
  },
  {
    title: "Leather Backpack",
    body_html: "<p>15L genuine leather backpack with laptop sleeve.</p>",
    vendor: "Order Ops Store",
    product_type: "Bags",
    tags: "bag, leather, laptop",
    variants: [
      { option1: "Brown", price: "89.99", sku: "BACKPACK-BRN", inventory_quantity: 25 },
      { option1: "Black", price: "89.99", sku: "BACKPACK-BLK", inventory_quantity: 30 },
    ],
    options: [{ name: "Color" }],
  },
  {
    title: "Ceramic Coffee Mug",
    body_html: "<p>350ml ceramic mug. Microwave and dishwasher safe.</p>",
    vendor: "Order Ops Store",
    product_type: "Kitchen",
    tags: "mug, coffee, kitchen",
    variants: [
      { option1: "White", price: "12.99", sku: "MUG-WHT", inventory_quantity: 100 },
      { option1: "Black", price: "12.99", sku: "MUG-BLK", inventory_quantity: 100 },
      { option1: "Grey", price: "12.99", sku: "MUG-GRY", inventory_quantity: 80 },
    ],
    options: [{ name: "Color" }],
  },
  {
    title: "Yoga Mat",
    body_html: "<p>6mm non-slip TPE yoga mat with carrying strap.</p>",
    vendor: "Order Ops Store",
    product_type: "Sports",
    tags: "yoga, fitness, mat",
    variants: [
      { option1: "Purple", price: "34.99", sku: "YOGAMAT-PRP", inventory_quantity: 40 },
      { option1: "Blue", price: "34.99", sku: "YOGAMAT-BLU", inventory_quantity: 35 },
      { option1: "Black", price: "34.99", sku: "YOGAMAT-BLK", inventory_quantity: 50 },
    ],
    options: [{ name: "Color" }],
  },
  {
    title: "Hardcover Notebook",
    body_html: "<p>A5 dotted hardcover notebook, 200 pages, lay-flat binding.</p>",
    vendor: "Order Ops Store",
    product_type: "Stationery",
    tags: "notebook, stationery, writing",
    variants: [
      { option1: "Black", price: "14.99", sku: "NOTEBOOK-BLK", inventory_quantity: 120 },
      { option1: "Navy", price: "14.99", sku: "NOTEBOOK-NVY", inventory_quantity: 90 },
    ],
    options: [{ name: "Color" }],
  },
  {
    title: "Scented Soy Candle",
    body_html: "<p>200g hand-poured soy wax candle, 40hr burn time.</p>",
    vendor: "Order Ops Store",
    product_type: "Home",
    tags: "candle, home, gift",
    variants: [
      { option1: "Vanilla", price: "18.99", sku: "CANDLE-VAN", inventory_quantity: 60 },
      { option1: "Lavender", price: "18.99", sku: "CANDLE-LAV", inventory_quantity: 55 },
      { option1: "Sandalwood", price: "18.99", sku: "CANDLE-SAN", inventory_quantity: 45 },
    ],
    options: [{ name: "Scent" }],
  },
  {
    title: "Stainless Steel Watch",
    body_html: "<p>Minimalist quartz watch with stainless steel case and mesh strap.</p>",
    vendor: "Order Ops Store",
    product_type: "Accessories",
    tags: "watch, accessory, minimalist",
    variants: [
      { option1: "Silver", price: "59.99", sku: "WATCH-SLV", inventory_quantity: 20 },
      { option1: "Gold", price: "64.99", sku: "WATCH-GLD", inventory_quantity: 15 },
      { option1: "Black", price: "59.99", sku: "WATCH-BLK", inventory_quantity: 18 },
    ],
    options: [{ name: "Color" }],
  },
];

async function createProduct(product: (typeof PRODUCTS)[0]) {
  const res = await fetch(
    `https://${DOMAIN}/admin/api/${API_VERSION}/products.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": TOKEN,
      },
      body: JSON.stringify({ product: { ...product, status: "active" } }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`${res.status} ${err}`);
  }

  const data = await res.json();
  return data.product;
}

async function main() {
  console.log(`Creating ${PRODUCTS.length} products in ${DOMAIN}...`);

  let created = 0;
  let failed = 0;

  for (const product of PRODUCTS) {
    try {
      const p = await createProduct(product);
      console.log(`  ✓ ${p.title} (${p.variants.length} variants)`);
      created++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`  ✗ ${product.title}: ${err}`);
      failed++;
    }
  }

  console.log(`\nDone. Created: ${created}, Failed: ${failed}`);
}

main();
