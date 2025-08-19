import { NextResponse } from "next/server";
import { verifyShopifyWebhook, parseWebhookEvent } from "@/lib/shopify/webhooks";
import { syncOrderFromShopify } from "@/lib/services/order.service";
import { logActivity } from "@/lib/services/activity.service";
import { db } from "@/lib/db/client";

export async function POST(request: Request) {
  const rawBodyBuffer = Buffer.from(await request.arrayBuffer());
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");
  const shopDomain = request.headers.get("x-shopify-shop-domain");

  // Verify HMAC signature
  if (!verifyShopifyWebhook(rawBodyBuffer, hmacHeader)) {
    console.warn("[Webhook] Invalid HMAC signature — rejecting request");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const event = parseWebhookEvent(rawBodyBuffer, topic, shopDomain);
  if (!event) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  console.log(`[Webhook] Received topic: ${event.topic} from ${event.shopDomain}`);

  // Route by topic
  const shopifyId = event.payload.admin_graphql_api_id;

  switch (event.topic) {
    case "orders/create":
    case "orders/updated":
    case "orders/paid":
    case "orders/cancelled":
    case "orders/fulfilled": {
      if (shopifyId) {
        const result = await syncOrderFromShopify(shopifyId);

        // Log the webhook receipt with metadata
        if (result.orderId) {
          await logActivity({
            orderId: result.orderId,
            action: "WEBHOOK_RECEIVED",
            metadata: {
              topic: event.topic,
              shopDomain: event.shopDomain,
              shopifyId,
              success: result.success,
            },
          });
        } else {
          // Order may not exist locally yet or sync failed
          await logActivity({
            action: "WEBHOOK_RECEIVED",
            metadata: {
              topic: event.topic,
              shopDomain: event.shopDomain,
              shopifyId,
              success: result.success,
              error: result.error,
            },
          });
        }
      }
      break;
    }

    case "fulfillments/create":
    case "fulfillments/update": {
      // Fulfillment events reference an order; sync the parent order
      const orderId = event.payload.order_id;
      if (orderId) {
        const gid = `gid://shopify/Order/${orderId}`;
        const result = await syncOrderFromShopify(gid);

        // Find local order to log against
        const localOrder = await db.order.findUnique({
          where: { externalId: gid },
          select: { id: true },
        });

        await logActivity({
          orderId: localOrder?.id,
          action: "WEBHOOK_RECEIVED",
          metadata: {
            topic: event.topic,
            shopDomain: event.shopDomain,
            shopifyOrderId: gid,
            success: result.success,
          },
        });
      }
      break;
    }

    default:
      console.log(`[Webhook] Unhandled topic: ${event.topic}`);
  }

  return NextResponse.json({ received: true });
}
