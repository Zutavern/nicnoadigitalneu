/**
 * Shopify Integration
 * Zentrale Exports für die Shopify-Integration
 */

// Client
export { ShopifyClient, createClientFromConnection, createClientFromSalon } from './client'

// Products
export {
  syncProducts,
  syncSingleProduct,
  getProductsWithStylistPrices,
  calculateStylistPrice,
  calculateCommission,
  getProductCategories,
} from './products'

// Inventory
export {
  getInventoryLevels,
  adjustInventory,
  syncInventoryToShopify,
  setLowStockThreshold,
  getLowStockProducts,
  countLowStockProducts,
  getInventoryStats,
} from './inventory'

// Orders
export {
  calculateOrderSummary,
  createOrder,
  getSalonOrders,
  getStylistOrders,
  updateOrderStatus,
  getOrderStats,
} from './orders'

// Webhooks
export {
  verifyWebhookSignature,
  handleProductUpdate,
  handleProductDelete,
  handleInventoryUpdate,
  handleOrderCreate,
  handleOrderFulfilled,
  handleOrderCancelled,
  webhookHandlers,
} from './webhooks'

// Encryption
export { encryptToken, decryptToken, isEncrypted, maskToken } from './encryption'

// Types
export type {
  ShopifyConnectionConfig,
  ShopifyProduct,
  ShopifyVariant,
  ShopifyImage,
  ShopifyOrder,
  ShopifyLineItem,
  ShopifyShop,
  SyncResult,
  ProductCreateInput,
  ProductUpdateInput,
  VariantCreateInput,
  InventoryUpdateInput,
  PriceCalculation,
  CommissionCalculation,
  MarginType,
  CommissionType,
  PaymentMethod,
  PayoutMethod,
  ProductWebhookPayload,
  InventoryWebhookPayload,
  OrderWebhookPayload,
} from './types'

export {
  ShopifyApiError,
  ShopifyConnectionError,
  ShopifyRateLimitError,
} from './types'

