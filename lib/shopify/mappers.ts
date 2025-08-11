import type { ShopifyOrder, ShopifyLineItem } from "./types";

export interface MappedOrder {
  externalId: string;
  externalOrderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  shippingMethod: string | null;
  shippingAddress: string | null;
  externalStatus: string | null;
  tags: string[];
  note: string | null;
  shopifyCreatedAt: Date;
  shopifyUpdatedAt: Date;
  rawPayload: ShopifyOrder;
  items: MappedOrderItem[];
}

export interface MappedOrderItem {
  externalId: string;
  title: string;
  variantTitle: string | null;
  sku: string | null;
  quantity: number;
  price: string | null;
  imageUrl: string | null;
}

export function mapShopifyOrder(order: ShopifyOrder): MappedOrder {
  const customerName =
    order.customer?.displayName ??
    order.shippingAddress?.name ??
    null;

  const customerEmail = order.customer?.email ?? order.email ?? null;

  const shippingMethod = order.shippingLines?.nodes?.[0]?.title ?? null;

  const shippingAddress = formatShippingAddress(order);

  const externalStatus =
    order.displayFulfillmentStatus ?? order.displayFinancialStatus ?? null;

  const tags = Array.isArray(order.tags) ? order.tags : [];

  const items = (order.lineItems?.nodes ?? []).map(mapShopifyLineItem);

  return {
    externalId: order.id,
    externalOrderNumber: order.name,
    customerName,
    customerEmail,
    shippingMethod,
    shippingAddress,
    externalStatus,
    tags,
    note: order.note ?? null,
    shopifyCreatedAt: new Date(order.createdAt),
    shopifyUpdatedAt: new Date(order.updatedAt),
    rawPayload: order,
    items,
  };
}

function mapShopifyLineItem(item: ShopifyLineItem): MappedOrderItem {
  return {
    externalId: item.id,
    title: item.title,
    variantTitle: item.variantTitle ?? null,
    sku: item.sku ?? null,
    quantity: item.quantity,
    price: item.originalUnitPriceSet?.shopMoney?.amount ?? null,
    imageUrl: item.image?.url ?? null,
  };
}

function formatShippingAddress(order: ShopifyOrder): string | null {
  const addr = order.shippingAddress;
  if (!addr) return null;

  const parts = [
    addr.address1,
    addr.address2,
    addr.city,
    addr.province,
    addr.country,
    addr.zip,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}
