import { createHmac, timingSafeEqual } from "crypto";
import type { ShopifyWebhookPayload } from "./types";

export type WebhookTopic =
  | "orders/create"
  | "orders/updated"
  | "orders/paid"
  | "orders/cancelled"
  | "orders/fulfilled"
  | "fulfillments/create"
  | "fulfillments/update";

export interface WebhookEvent {
  topic: WebhookTopic;
  shopDomain: string;
  payload: ShopifyWebhookPayload;
}

export function verifyShopifyWebhook(
  rawBody: Buffer,
  hmacHeader: string | null
): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[Webhook] SHOPIFY_WEBHOOK_SECRET is not set — rejecting");
    return false;
  }
  if (!hmacHeader) return false;

  const computedHmac = createHmac("sha256", secret)
    .update(rawBody)
    .digest("base64");

  try {
    return timingSafeEqual(
      Buffer.from(computedHmac),
      Buffer.from(hmacHeader)
    );
  } catch {
    return false;
  }
}

export function parseWebhookEvent(
  rawBody: Buffer,
  topic: string | null,
  shopDomain: string | null
): WebhookEvent | null {
  if (!topic || !shopDomain) return null;

  let payload: ShopifyWebhookPayload;
  try {
    payload = JSON.parse(rawBody.toString("utf-8"));
  } catch {
    return null;
  }

  return {
    topic: topic as WebhookTopic,
    shopDomain,
    payload,
  };
}
