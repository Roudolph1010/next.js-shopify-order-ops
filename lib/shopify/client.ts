export class ShopifyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: unknown[]
  ) {
    super(message);
    this.name = "ShopifyApiError";
  }
}

function getConfig() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ADMIN_API_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION ?? "2024-10";

  if (!domain || !token) {
    throw new ShopifyApiError(
      "Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ADMIN_API_TOKEN environment variables"
    );
  }

  return { domain, token, apiVersion };
}

export async function shopifyFetch<TData, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables
): Promise<TData> {
  const { domain, token, apiVersion } = getConfig();
  const url = `https://${domain}/admin/api/${apiVersion}/graphql.json`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const callLimit = response.headers.get("X-Shopify-Shop-Api-Call-Limit");
  if (callLimit) {
    const [used, max] = callLimit.split("/").map(Number);
    if (used / max > 0.8) {
      console.warn(
        `[Shopify] API call limit at ${used}/${max} — approaching rate limit`
      );
    }
  }

  if (!response.ok) {
    throw new ShopifyApiError(
      `Shopify API returned ${response.status}: ${response.statusText}`,
      response.status
    );
  }

  const json = await response.json();

  if (json.errors && json.errors.length > 0) {
    throw new ShopifyApiError(
      `Shopify GraphQL errors: ${JSON.stringify(json.errors)}`,
      undefined,
      json.errors
    );
  }

  return json.data as TData;
}
