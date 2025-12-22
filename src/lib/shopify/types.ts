/**
 * Shopify Integration Types
 * TypeScript-Definitionen für die Shopify Admin API Integration
 */

// ============================================
// Shopify API Response Types
// ============================================

export interface ShopifyProduct {
  id: string // GraphQL ID (gid://shopify/Product/123)
  legacyResourceId: string // REST API ID
  title: string
  description: string
  descriptionHtml: string
  handle: string
  vendor: string
  productType: string
  status: 'ACTIVE' | 'ARCHIVED' | 'DRAFT'
  createdAt: string
  updatedAt: string
  publishedAt: string | null
  featuredImage: ShopifyImage | null
  images: {
    edges: Array<{
      node: ShopifyImage
    }>
  }
  variants: {
    edges: Array<{
      node: ShopifyVariant
    }>
  }
  totalInventory: number
}

export interface ShopifyVariant {
  id: string
  legacyResourceId: string
  title: string
  sku: string
  price: string
  compareAtPrice: string | null
  inventoryQuantity: number
  inventoryItem: {
    id: string
  }
  image: ShopifyImage | null
}

export interface ShopifyImage {
  id: string
  url: string
  altText: string | null
  width: number
  height: number
}

export interface ShopifyOrder {
  id: string
  legacyResourceId: string
  name: string // Order number (e.g., #1001)
  email: string | null
  phone: string | null
  createdAt: string
  displayFinancialStatus: string
  displayFulfillmentStatus: string
  totalPriceSet: ShopifyMoneyBag
  subtotalPriceSet: ShopifyMoneyBag
  totalTaxSet: ShopifyMoneyBag
  shippingAddress: ShopifyAddress | null
  lineItems: {
    edges: Array<{
      node: ShopifyLineItem
    }>
  }
  note: string | null
  tags: string[]
}

export interface ShopifyLineItem {
  id: string
  title: string
  quantity: number
  variant: ShopifyVariant | null
  product: {
    id: string
    legacyResourceId: string
  } | null
  originalUnitPriceSet: ShopifyMoneyBag
  discountedUnitPriceSet: ShopifyMoneyBag
  image: ShopifyImage | null
}

export interface ShopifyMoneyBag {
  shopMoney: {
    amount: string
    currencyCode: string
  }
}

export interface ShopifyAddress {
  firstName: string | null
  lastName: string | null
  address1: string | null
  address2: string | null
  city: string | null
  province: string | null
  country: string | null
  zip: string | null
  phone: string | null
}

export interface ShopifyShop {
  id: string
  name: string
  email: string
  currencyCode: string
  primaryDomain: {
    url: string
    host: string
  }
  myshopifyDomain: string
}

// ============================================
// NICNOA Internal Types
// ============================================

export interface ShopifyConnectionConfig {
  shopDomain: string
  accessToken: string
}

export interface SyncResult {
  success: boolean
  productsCreated: number
  productsUpdated: number
  productsRemoved: number
  errors: string[]
}

export interface ProductCreateInput {
  title: string
  description?: string
  vendor?: string
  productType?: string
  images?: string[] // URLs
  variants?: VariantCreateInput[]
}

export interface VariantCreateInput {
  title?: string
  price: string
  compareAtPrice?: string
  sku?: string
  inventoryQuantity?: number
}

export interface ProductUpdateInput {
  title?: string
  description?: string
  vendor?: string
  productType?: string
}

export interface InventoryUpdateInput {
  inventoryItemId: string
  locationId: string
  delta: number // Positive to add, negative to subtract
}

// ============================================
// Price Calculation Types
// ============================================

export type MarginType = 'PERCENTAGE' | 'FIXED'
export type CommissionType = 'PERCENTAGE' | 'FIXED'
export type PaymentMethod = 'STRIPE' | 'RENT_ADDITION'
export type PayoutMethod = 'BANK_TRANSFER' | 'RENT_DEDUCTION'

export interface PriceCalculation {
  basePrice: number      // EK wenn vorhanden, sonst Shopify-VK
  marginType: MarginType
  marginValue: number
  finalPrice: number     // Berechneter Stylist-Preis
  currency: string
}

export interface CommissionCalculation {
  salePrice: number      // VK für Endkunden
  commissionType: CommissionType
  commissionValue: number
  commission: number     // Berechnete Provision
  currency: string
}

// ============================================
// API Error Types
// ============================================

export class ShopifyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public errors?: Array<{ message: string; field?: string[] }>
  ) {
    super(message)
    this.name = 'ShopifyApiError'
  }
}

export class ShopifyConnectionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ShopifyConnectionError'
  }
}

export class ShopifyRateLimitError extends Error {
  public retryAfter: number

  constructor(message: string, retryAfter: number = 1000) {
    super(message)
    this.name = 'ShopifyRateLimitError'
    this.retryAfter = retryAfter
  }
}

// ============================================
// Webhook Types
// ============================================

export interface ShopifyWebhookPayload {
  id: number
  admin_graphql_api_id: string
  [key: string]: unknown
}

export interface ProductWebhookPayload extends ShopifyWebhookPayload {
  title: string
  body_html: string
  vendor: string
  product_type: string
  handle: string
  status: string
  variants: Array<{
    id: number
    admin_graphql_api_id: string
    title: string
    price: string
    compare_at_price: string | null
    sku: string
    inventory_quantity: number
  }>
  images: Array<{
    id: number
    src: string
    alt: string | null
    width: number
    height: number
  }>
}

export interface InventoryWebhookPayload extends ShopifyWebhookPayload {
  inventory_item_id: number
  location_id: number
  available: number
  updated_at: string
}

export interface OrderWebhookPayload extends ShopifyWebhookPayload {
  order_number: number
  email: string | null
  total_price: string
  subtotal_price: string
  total_tax: string
  currency: string
  financial_status: string
  fulfillment_status: string | null
  shipping_address: {
    first_name: string | null
    last_name: string | null
    address1: string | null
    address2: string | null
    city: string | null
    province: string | null
    country: string | null
    zip: string | null
    phone: string | null
  } | null
  line_items: Array<{
    id: number
    title: string
    quantity: number
    price: string
    product_id: number
    variant_id: number
  }>
  note: string | null
  tags: string
}

