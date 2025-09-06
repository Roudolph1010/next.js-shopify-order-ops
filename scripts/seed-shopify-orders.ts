/**
 * Seeds test orders directly into your Shopify development store.
 * Run with: npx tsx scripts/seed-shopify-orders.ts
 */

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN!;
const TOKEN = process.env.SHOPIFY_ADMIN_API_TOKEN!;
const API_VERSION = process.env.SHOPIFY_API_VERSION ?? "2024-10";

if (!DOMAIN || !TOKEN) {
  console.error("Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_TOKEN in env");
  process.exit(1);
}

const CUSTOMERS = [
  { first_name: "Alice", last_name: "Johnson", email: "alice@example.com" },
  { first_name: "Bob", last_name: "Smith", email: "bob@example.com" },
  { first_name: "Carol", last_name: "White", email: "carol@example.com" },
  { first_name: "David", last_name: "Brown", email: "david@example.com" },
  { first_name: "Eva", last_name: "Davis", email: "eva@example.com" },
];

const PRODUCTS = [
  { title: "Classic T-Shirt", price: "29.99", sku: "TSHIRT-001" },
  { title: "Running Shoes", price: "89.99", sku: "SHOES-001" },
  { title: "Wireless Headphones", price: "149.99", sku: "HEADPHONES-001" },
  { title: "Coffee Mug", price: "14.99", sku: "MUG-001" },
  { title: "Notebook", price: "9.99", sku: "NOTEBOOK-001" },
  { title: "Backpack", price: "59.99", sku: "BACKPACK-001" },
];

const SHIPPING_METHODS = [
  "Standard Shipping",
  "Express Shipping",
  "Overnight Delivery",
  "Free Shipping",
];

const TAGS = [
  ["gift", "priority"],
  ["fragile"],
  ["bulk"],
  ["express"],
  [],
  ["gift"],
  ["priority"],
];

const NOTES = [
  "Please gift wrap this order",
  "Leave at door",
  "Call before delivery",
  null,
  null,
  "Fragile items — handle with care",
  null,
];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function createOrder(index: number) {
  const customer = randomFrom(CUSTOMERS);
  const product = randomFrom(PRODUCTS);
  const product2 = Math.random() > 0.5 ? randomFrom(PRODUCTS) : null;
  const shipping = randomFrom(SHIPPING_METHODS);
  const tags = randomFrom(TAGS);
  const note = randomFrom(NOTES);

  const lineItems = [
    {
      title: product.title,
      price: product.price,
      quantity: randomInt(1, 3),
      requires_shipping: true,
      sku: product.sku,
    },
    ...(product2
      ? [
          {
            title: product2.title,
            price: product2.price,
            quantity: 1,
            requires_shipping: true,
            sku: product2.sku,
          },
        ]
      : []),
  ];

  const body = {
    order: {
      line_items: lineItems,
      customer: {
        first_name: customer.first_name,
        last_name: customer.last_name,
        email: `order${index}_${customer.email}`,
      },
      billing_address: {
        first_name: customer.first_name,
        last_name: customer.last_name,
        address1: `${randomInt(1, 999)} Main St`,
        city: "New York",
        province: "NY",
        country: "US",
        zip: "10001",
      },
      shipping_address: {
        first_name: customer.first_name,
        last_name: customer.last_name,
        address1: `${randomInt(1, 999)} Main St`,
        city: "New York",
        province: "NY",
        country: "US",
        zip: "10001",
      },
      shipping_lines: [
        {
          title: shipping,
          price: "0.00",
          code: shipping.toUpperCase().replace(/ /g, "_"),
        },
      ],
      tags: tags.join(", "),
      note: note ?? undefined,
      financial_status: "paid",
      send_receipt: false,
      send_fulfillment_receipt: false,
    },
  };

  const res = await fetch(
    `https://${DOMAIN}/admin/api/${API_VERSION}/orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": TOKEN,
      },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create order ${index}: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.order;
}

async function main() {
  const count = parseInt(process.argv[2] ?? "10");
  console.log(`Creating ${count} test orders in ${DOMAIN}...`);

  let created = 0;
  let failed = 0;

  for (let i = 0; i < count; i++) {
    try {
      const order = await createOrder(i);
      console.log(`  ✓ Created ${order.name} — ${order.email}`);
      created++;
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      console.error(`  ✗ ${err}`);
      failed++;
    }
  }

  console.log(`\nDone. Created: ${created}, Failed: ${failed}`);
  console.log(`Now run "Sync from Shopify" in your dashboard to import them.`);
}

main();
