export const ORDER_FIELDS = `
  fragment OrderFields on Order {
    id
    name
    email
    phone
    displayFinancialStatus
    displayFulfillmentStatus
    tags
    note
    createdAt
    updatedAt
    customer {
      displayName
      email
    }
    shippingAddress {
      name
      address1
      address2
      city
      province
      country
      zip
    }
    shippingLines(first: 1) {
      nodes {
        title
      }
    }
    lineItems(first: 50) {
      nodes {
        id
        title
        quantity
        sku
        variantTitle
        originalUnitPriceSet {
          shopMoney {
            amount
            currencyCode
          }
        }
        image {
          url
        }
        product {
          id
        }
      }
    }
  }
`;

export const GET_ORDERS_QUERY = `
  ${ORDER_FIELDS}
  query GetOrders($first: Int!, $after: String, $query: String) {
    orders(first: $first, after: $after, query: $query, sortKey: CREATED_AT, reverse: true) {
      nodes {
        ...OrderFields
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;

export const GET_ORDER_QUERY = `
  ${ORDER_FIELDS}
  query GetOrder($id: ID!) {
    order(id: $id) {
      ...OrderFields
    }
  }
`;
