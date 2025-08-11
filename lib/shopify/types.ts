export interface ShopifyMoneyV2 {
  amount: string;
  currencyCode: string;
}

export interface ShopifyAddress {
  name?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  country?: string;
  zip?: string;
}

export interface ShopifyLineItem {
  id: string;
  title: string;
  quantity: number;
  sku?: string;
  variantTitle?: string;
  originalUnitPriceSet: { shopMoney: ShopifyMoneyV2 };
  image?: { url: string } | null;
  product?: { id: string } | null;
}

export interface ShopifyShippingLine {
  title: string;
}

export interface ShopifyOrder {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  displayFinancialStatus?: string;
  displayFulfillmentStatus?: string;
  tags: string[];
  note?: string;
  createdAt: string;
  updatedAt: string;
  lineItems: {
    nodes: ShopifyLineItem[];
  };
  shippingLines: {
    nodes: ShopifyShippingLine[];
  };
  shippingAddress?: ShopifyAddress | null;
  customer?: {
    displayName?: string;
    email?: string;
  } | null;
}

export interface ShopifyOrdersResponse {
  orders: {
    nodes: ShopifyOrder[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor?: string;
    };
  };
}

export interface ShopifyOrderResponse {
  order: ShopifyOrder | null;
}

export interface ShopifyWebhookPayload {
  id: number;
  admin_graphql_api_id: string;
  name: string;
  email?: string;
  phone?: string;
  financial_status?: string;
  fulfillment_status?: string | null;
  tags?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}
