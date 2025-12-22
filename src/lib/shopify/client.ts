/**
 * Shopify Admin API Client
 * GraphQL Client für die Shopify Admin API
 */

import {
  ShopifyApiError,
  ShopifyConnectionError,
  ShopifyRateLimitError,
  type ShopifyConnectionConfig,
  type ShopifyProduct,
  type ShopifyShop,
  type ShopifyOrder,
} from './types'
import { decryptToken, isEncrypted } from './encryption'

const SHOPIFY_API_VERSION = '2024-10'

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{
    message: string
    locations?: Array<{ line: number; column: number }>
    path?: string[]
    extensions?: {
      code?: string
      requestId?: string
    }
  }>
  extensions?: {
    cost?: {
      requestedQueryCost: number
      actualQueryCost: number
      throttleStatus: {
        maximumAvailable: number
        currentlyAvailable: number
        restoreRate: number
      }
    }
  }
}

/**
 * Shopify Admin API GraphQL Client
 */
export class ShopifyClient {
  private shopDomain: string
  private accessToken: string
  private apiUrl: string

  constructor(config: ShopifyConnectionConfig) {
    this.shopDomain = config.shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    
    // Token entschlüsseln falls nötig
    this.accessToken = isEncrypted(config.accessToken)
      ? decryptToken(config.accessToken)
      : config.accessToken

    this.apiUrl = `https://${this.shopDomain}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`
  }

  /**
   * Führt eine GraphQL-Abfrage aus
   */
  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query, variables }),
    })

    if (response.status === 401) {
      throw new ShopifyConnectionError('Ungültiger Access Token')
    }

    if (response.status === 402) {
      throw new ShopifyApiError('Shop ist nicht mehr aktiv oder bezahlt', 402)
    }

    if (response.status === 403) {
      throw new ShopifyApiError('Zugriff verweigert - fehlende Berechtigungen', 403)
    }

    if (response.status === 404) {
      throw new ShopifyConnectionError(`Shop nicht gefunden: ${this.shopDomain}`)
    }

    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '1', 10) * 1000
      throw new ShopifyRateLimitError('Rate Limit erreicht', retryAfter)
    }

    if (!response.ok) {
      throw new ShopifyApiError(`HTTP Error: ${response.status}`, response.status)
    }

    const json: GraphQLResponse<T> = await response.json()

    if (json.errors && json.errors.length > 0) {
      const errorMessages = json.errors.map((e) => e.message).join(', ')
      throw new ShopifyApiError(errorMessages, undefined, json.errors)
    }

    if (!json.data) {
      throw new ShopifyApiError('Keine Daten in der Antwort')
    }

    return json.data
  }

  /**
   * Holt Shop-Informationen
   */
  async getShop(): Promise<ShopifyShop> {
    const query = `
      query GetShop {
        shop {
          id
          name
          email
          currencyCode
          primaryDomain {
            url
            host
          }
          myshopifyDomain
        }
      }
    `

    const data = await this.query<{ shop: ShopifyShop }>(query)
    return data.shop
  }

  /**
   * Holt alle Produkte
   */
  async getProducts(first: number = 50, cursor?: string): Promise<{
    products: ShopifyProduct[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }> {
    const query = `
      query GetProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          edges {
            node {
              id
              legacyResourceId
              title
              description
              descriptionHtml
              handle
              vendor
              productType
              status
              createdAt
              updatedAt
              publishedAt
              totalInventory
              featuredImage {
                id
                url
                altText
                width
                height
              }
              images(first: 10) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    legacyResourceId
                    title
                    sku
                    price
                    compareAtPrice
                    inventoryQuantity
                    inventoryItem {
                      id
                    }
                    image {
                      id
                      url
                      altText
                      width
                      height
                    }
                  }
                }
              }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `

    const data = await this.query<{
      products: {
        edges: Array<{ node: ShopifyProduct }>
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      }
    }>(query, { first, after: cursor })

    return {
      products: data.products.edges.map((edge) => edge.node),
      pageInfo: data.products.pageInfo,
    }
  }

  /**
   * Holt ein einzelnes Produkt
   */
  async getProduct(id: string): Promise<ShopifyProduct | null> {
    const query = `
      query GetProduct($id: ID!) {
        product(id: $id) {
          id
          legacyResourceId
          title
          description
          descriptionHtml
          handle
          vendor
          productType
          status
          createdAt
          updatedAt
          publishedAt
          totalInventory
          featuredImage {
            id
            url
            altText
            width
            height
          }
          images(first: 10) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 100) {
            edges {
              node {
                id
                legacyResourceId
                title
                sku
                price
                compareAtPrice
                inventoryQuantity
                inventoryItem {
                  id
                }
                image {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
          }
        }
      }
    `

    const data = await this.query<{ product: ShopifyProduct | null }>(query, { id })
    return data.product
  }

  /**
   * Holt Bestellungen
   */
  async getOrders(first: number = 50, cursor?: string, query?: string): Promise<{
    orders: ShopifyOrder[]
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }> {
    const gqlQuery = `
      query GetOrders($first: Int!, $after: String, $query: String) {
        orders(first: $first, after: $after, query: $query) {
          edges {
            node {
              id
              legacyResourceId
              name
              email
              phone
              createdAt
              displayFinancialStatus
              displayFulfillmentStatus
              totalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              subtotalPriceSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              totalTaxSet {
                shopMoney {
                  amount
                  currencyCode
                }
              }
              shippingAddress {
                firstName
                lastName
                address1
                address2
                city
                province
                country
                zip
                phone
              }
              lineItems(first: 50) {
                edges {
                  node {
                    id
                    title
                    quantity
                    originalUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    discountedUnitPriceSet {
                      shopMoney {
                        amount
                        currencyCode
                      }
                    }
                    image {
                      id
                      url
                      altText
                      width
                      height
                    }
                    variant {
                      id
                      legacyResourceId
                      title
                      sku
                      price
                      compareAtPrice
                      inventoryQuantity
                      inventoryItem {
                        id
                      }
                      image {
                        id
                        url
                        altText
                        width
                        height
                      }
                    }
                    product {
                      id
                      legacyResourceId
                    }
                  }
                }
              }
              note
              tags
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `

    const data = await this.query<{
      orders: {
        edges: Array<{ node: ShopifyOrder }>
        pageInfo: { hasNextPage: boolean; endCursor: string | null }
      }
    }>(gqlQuery, { first, after: cursor, query })

    return {
      orders: data.orders.edges.map((edge) => edge.node),
      pageInfo: data.orders.pageInfo,
    }
  }

  /**
   * Aktualisiert den Lagerbestand
   */
  async adjustInventory(
    inventoryItemId: string,
    locationId: string,
    delta: number,
    reason?: string
  ): Promise<void> {
    const query = `
      mutation InventoryAdjustQuantities($input: InventoryAdjustQuantitiesInput!) {
        inventoryAdjustQuantities(input: $input) {
          inventoryAdjustmentGroup {
            createdAt
            reason
            changes {
              name
              delta
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    const data = await this.query<{
      inventoryAdjustQuantities: {
        userErrors: Array<{ field: string[]; message: string }>
      }
    }>(query, {
      input: {
        reason: reason || 'correction',
        name: 'available',
        changes: [
          {
            inventoryItemId,
            locationId,
            delta,
          },
        ],
      },
    })

    if (data.inventoryAdjustQuantities.userErrors.length > 0) {
      const errors = data.inventoryAdjustQuantities.userErrors
        .map((e) => e.message)
        .join(', ')
      throw new ShopifyApiError(`Inventar-Fehler: ${errors}`)
    }
  }

  /**
   * Holt alle Standorte
   */
  async getLocations(): Promise<Array<{ id: string; name: string; isActive: boolean }>> {
    const query = `
      query GetLocations {
        locations(first: 50) {
          edges {
            node {
              id
              name
              isActive
            }
          }
        }
      }
    `

    const data = await this.query<{
      locations: {
        edges: Array<{ node: { id: string; name: string; isActive: boolean } }>
      }
    }>(query)

    return data.locations.edges.map((edge) => edge.node)
  }

  /**
   * Testet die Verbindung
   */
  async testConnection(): Promise<{ success: boolean; shopName?: string; error?: string }> {
    try {
      const shop = await this.getShop()
      return { success: true, shopName: shop.name }
    } catch (error) {
      if (error instanceof ShopifyConnectionError) {
        return { success: false, error: error.message }
      }
      if (error instanceof ShopifyApiError) {
        return { success: false, error: error.message }
      }
      return { success: false, error: 'Unbekannter Fehler' }
    }
  }

  /**
   * Aktualisiert ein Produkt in Shopify
   */
  async updateProduct(input: {
    productId: string
    title?: string
    descriptionHtml?: string
    vendor?: string
    productType?: string
    tags?: string[]
    status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  }): Promise<{
    success: boolean
    product?: ShopifyProduct
    error?: string
  }> {
    const query = `
      mutation ProductUpdate($input: ProductInput!) {
        productUpdate(input: $input) {
          product {
            id
            legacyResourceId
            title
            description
            descriptionHtml
            handle
            vendor
            productType
            status
            updatedAt
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    try {
      const data = await this.query<{
        productUpdate: {
          product: ShopifyProduct | null
          userErrors: Array<{ field: string[]; message: string }>
        }
      }>(query, {
        input: {
          id: input.productId,
          ...(input.title && { title: input.title }),
          ...(input.descriptionHtml !== undefined && { descriptionHtml: input.descriptionHtml }),
          ...(input.vendor && { vendor: input.vendor }),
          ...(input.productType && { productType: input.productType }),
          ...(input.tags && { tags: input.tags }),
          ...(input.status && { status: input.status }),
        },
      })

      if (data.productUpdate.userErrors.length > 0) {
        const errors = data.productUpdate.userErrors.map((e) => e.message).join(', ')
        return { success: false, error: errors }
      }

      return {
        success: true,
        product: data.productUpdate.product || undefined,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      }
    }
  }

  /**
   * Setzt den Lagerbestand für ein Inventory Item (absoluter Wert)
   * 
   * WICHTIG: inventoryItemId muss im GID-Format sein: gid://shopify/InventoryItem/...
   */
  async setInventoryQuantity(
    inventoryItemId: string,
    locationId: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> {
    // Stelle sicher, dass die IDs im GID-Format sind
    const formattedInventoryItemId = inventoryItemId.startsWith('gid://')
      ? inventoryItemId
      : `gid://shopify/InventoryItem/${inventoryItemId}`
    
    const formattedLocationId = locationId.startsWith('gid://')
      ? locationId
      : `gid://shopify/Location/${locationId}`

    const query = `
      mutation InventorySetQuantities($input: InventorySetQuantitiesInput!) {
        inventorySetQuantities(input: $input) {
          inventoryAdjustmentGroup {
            id
            createdAt
            reason
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `

    const inputPayload = {
      name: 'available',
      reason: 'correction',
      ignoreCompareQuantity: true,
      quantities: [
        {
          inventoryItemId: formattedInventoryItemId,
          locationId: formattedLocationId,
          quantity: Math.max(0, Math.round(quantity)), // Stelle sicher, dass es eine positive Ganzzahl ist
        },
      ],
    }

    console.log('[Shopify] Setting inventory quantity:', JSON.stringify(inputPayload, null, 2))

    try {
      const data = await this.query<{
        inventorySetQuantities: {
          inventoryAdjustmentGroup: { id: string } | null
          userErrors: Array<{ field: string[]; message: string; code?: string }>
        }
      }>(query, { input: inputPayload })

      if (data.inventorySetQuantities.userErrors.length > 0) {
        const errors = data.inventorySetQuantities.userErrors
          .map((e) => `${e.message} (${e.code || 'no code'})`)
          .join(', ')
        console.error('[Shopify] Inventory update errors:', errors)
        return { success: false, error: errors }
      }

      console.log('[Shopify] Inventory updated successfully')
      return { success: true }
    } catch (error) {
      console.error('[Shopify] Inventory update exception:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      }
    }
  }

  /**
   * Holt Inventory Levels für ein Produkt
   */
  async getInventoryLevels(
    inventoryItemId: string
  ): Promise<Array<{ locationId: string; locationName: string; quantity: number }>> {
    const query = `
      query GetInventoryLevels($inventoryItemId: ID!) {
        inventoryItem(id: $inventoryItemId) {
          id
          inventoryLevels(first: 50) {
            edges {
              node {
                id
                quantities(names: ["available"]) {
                  name
                  quantity
                }
                location {
                  id
                  name
                }
              }
            }
          }
        }
      }
    `

    const data = await this.query<{
      inventoryItem: {
        inventoryLevels: {
          edges: Array<{
            node: {
              id: string
              quantities: Array<{ name: string; quantity: number }>
              location: { id: string; name: string }
            }
          }>
        }
      } | null
    }>(query, { inventoryItemId })

    if (!data.inventoryItem) {
      return []
    }

    return data.inventoryItem.inventoryLevels.edges.map((edge) => ({
      locationId: edge.node.location.id,
      locationName: edge.node.location.name,
      quantity: edge.node.quantities.find((q) => q.name === 'available')?.quantity || 0,
    }))
  }

  /**
   * Aktualisiert die Variante eines Produkts (für Preis-Änderungen)
   * Nutzt productVariantsBulkUpdate (neue API)
   */
  async updateProductVariant(input: {
    productId: string
    variantId: string
    price?: string
    compareAtPrice?: string | null
    sku?: string
  }): Promise<{ success: boolean; error?: string }> {
    const query = `
      mutation ProductVariantsBulkUpdate($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
        productVariantsBulkUpdate(productId: $productId, variants: $variants) {
          product {
            id
          }
          productVariants {
            id
            price
          }
          userErrors {
            field
            message
          }
        }
      }
    `

    try {
      // Varianten-Input erstellen
      const variantInput: Record<string, unknown> = {
        id: input.variantId,
      }
      if (input.price) variantInput.price = input.price
      if (input.compareAtPrice !== undefined) variantInput.compareAtPrice = input.compareAtPrice
      if (input.sku) variantInput.sku = input.sku

      const data = await this.query<{
        productVariantsBulkUpdate: {
          product: { id: string } | null
          productVariants: Array<{ id: string; price: string }>
          userErrors: Array<{ field: string[]; message: string }>
        }
      }>(query, {
        productId: input.productId,
        variants: [variantInput],
      })

      if (data.productVariantsBulkUpdate.userErrors.length > 0) {
        const errors = data.productVariantsBulkUpdate.userErrors.map((e) => e.message).join(', ')
        return { success: false, error: errors }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      }
    }
  }
}

/**
 * Erstellt einen Shopify-Client aus einer Connection-ID
 */
export async function createClientFromConnection(
  connectionId: string
): Promise<ShopifyClient | null> {
  // Import hier um zirkuläre Abhängigkeit zu vermeiden
  const { prisma } = await import('@/lib/prisma')

  const connection = await prisma.shopifyConnection.findUnique({
    where: { id: connectionId },
  })

  if (!connection || !connection.isActive) {
    return null
  }

  return new ShopifyClient({
    shopDomain: connection.shopDomain,
    accessToken: connection.accessToken,
  })
}

/**
 * Erstellt einen Shopify-Client aus einer Salon-ID
 */
export async function createClientFromSalon(salonId: string): Promise<ShopifyClient | null> {
  const { prisma } = await import('@/lib/prisma')

  const connection = await prisma.shopifyConnection.findUnique({
    where: { salonId },
  })

  if (!connection || !connection.isActive) {
    return null
  }

  return new ShopifyClient({
    shopDomain: connection.shopDomain,
    accessToken: connection.accessToken,
  })
}

