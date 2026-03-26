// src/stores/orders.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseSafe, getTable } from '@/supabase/client'
import { useAuthStore } from './auth'
import { useCartStore } from './cart'
import { useProductsStore } from './products'
import { authNotification } from '@/utils/notifications'
import type { 
  Order, 
  OrderStatus, 
  OrderItem, 
  ShippingAddress, 
  PaymentMethod,
  PaymentStatus,
  StatusHistoryItem,
  Product
} from '@/types'

// Helper to get Supabase client (throws if null)
const getClient = () => supabaseSafe.client

export const useOrdersStore = defineStore('orders', () => {
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const productsStore = useProductsStore()

  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastVisible = ref<any>(null)
  const hasMore = ref(true)
  const statsLoading = ref(false)
  const orderStats = ref<{
    totalOrders: number
    pending: number
    processing: number
    shipped: number
    delivered: number
    cancelled: number
    totalRevenue: number
    averageOrderValue: number
    monthlyRevenue: number
  } | null>(null)

  const pendingOrdersCount = computed(() => 
    orders.value.filter(order => order.status === 'pending').length
  )

  const completedOrdersCount = computed(() => 
    orders.value.filter(order => order.status === 'delivered').length
  )

  const totalRevenue = computed(() => 
    orders.value
      .filter(order => order.status === 'delivered' && order.paymentStatus === 'paid')
      .reduce((sum, order) => sum + order.total, 0)
  )

  const activeOrders = computed(() => 
    orders.value.filter(order => ['pending', 'processing', 'shipped'].includes(order.status))
  )

  const averageOrderValue = computed(() => {
    const paidOrders = orders.value.filter(o => o.paymentStatus === 'paid' && o.status !== 'cancelled')
    if (paidOrders.length === 0) return 0
    return paidOrders.reduce((sum, o) => sum + o.total, 0) / paidOrders.length
  })

  const getStatusText = (status: OrderStatus): string => {
    const map: Record<OrderStatus, string> = {
      pending: 'Pending Confirmation',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
    return map[status]
  }

  const getStatusDescription = (status: OrderStatus): string => {
    const map: Record<OrderStatus, string> = {
      pending: 'Your order has been received and is waiting for confirmation',
      processing: 'Your order is being prepared for shipment',
      shipped: 'Your order has been shipped and is on its way',
      delivered: 'Your order has been delivered successfully',
      cancelled: 'This order has been cancelled'
    }
    return map[status]
  }

  const getPaymentStatusText = (paymentStatus: PaymentStatus): string => {
    const map: Record<PaymentStatus, string> = {
      pending: 'Pending Payment',
      paid: 'Paid',
      failed: 'Payment Failed',
      refunded: 'Refunded'
    }
    return map[paymentStatus]
  }

  const generateOrderNumber = (): string => {
    const date = new Date()
    const year = date.getFullYear().toString().slice(-2)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    const timestamp = Date.now().toString().slice(-4)
    return `ORD-${year}${month}${day}-${random}-${timestamp}`
  }

  const generateGuestId = (): string => 
    `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

  const convertRowToOrder = (row: any): Order => ({
    id: row.id,
    orderNumber: row.order_number,
    customer: row.customer,
    items: row.items,
    subtotal: row.subtotal,
    shippingCost: row.shipping_cost,
    tax: row.tax,
    total: row.total,
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    shippingAddress: row.shipping_address,
    notes: row.notes,
    trackingNumber: row.tracking_number,
    statusHistory: row.status_history?.map((h: any) => ({
      status: h.status,
      date: new Date(h.timestamp),
      note: h.note,
      updatedBy: h.updated_by
    })) || [],
    userId: row.user_id,
    guestId: row.guest_id,
    tenantId: row.tenant_id,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    shippedAt: row.shipped_at ? new Date(row.shipped_at) : undefined,
    deliveredAt: row.delivered_at ? new Date(row.delivered_at) : undefined,
    cancelledAt: row.cancelled_at ? new Date(row.cancelled_at) : undefined
  })

  const getCurrentUserId = (): string | null => {
    if (authStore.user?.uid) return authStore.user.uid
    if (authStore.customer?.uid) return authStore.customer.uid
    return null
  }

  const getCurrentUserEmail = (): string | null => {
    if (authStore.user?.email) return authStore.user.email
    if (authStore.customer?.email) return authStore.customer.email
    return null
  }

  const getCurrentUserName = (): string | null => {
    if (authStore.user?.displayName) return authStore.user.displayName
    if (authStore.customer?.displayName) return authStore.customer.displayName
    return null
  }

  const fetchOrders = async (options?: {
    limit?: number
    status?: OrderStatus
    startAfterDoc?: any
    userId?: string
    guestId?: string
    email?: string
    all?: boolean
  }) => {
    if (loading.value) return []

    loading.value = true
    error.value = null

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) {
        orders.value = []
        return []
      }

      const client = getClient()
      let query = client
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })
        .limit(options?.limit || 20)

      const currentUserId = getCurrentUserId()
      const isAdmin = authStore.isAdmin

      if (options?.userId) {
        if (!isAdmin && options.userId !== currentUserId) {
          console.warn('Permission denied: cannot fetch orders for another user')
          return []
        }
        query = query.eq('user_id', options.userId)
      }
      else if (options?.guestId) {
        query = query.eq('guest_id', options.guestId)
      }
      else if (options?.email) {
        query = query.eq('customer->>email', options.email)
      }
      else if (options?.all && isAdmin) {
        // no extra filter
      }
      else if (authStore.isCustomer && currentUserId) {
        query = query.eq('user_id', currentUserId)
      }
      else if (!isAdmin && !authStore.isCustomer) {
        return []
      }

      if (options?.status) {
        query = query.eq('status', options.status)
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      const fetchedOrders = ((data as any[]) || []).map(row => convertRowToOrder(row))
      orders.value = fetchedOrders
      return fetchedOrders
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch orders'
      console.error('Error fetching orders:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const fetchOrderById = async (orderId: string) => {
    loading.value = true
    error.value = null

    try {
      const client = getClient()
      const { data, error: fetchError } = await client
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (fetchError || !data) {
        const savedOrder = sessionStorage.getItem('last_created_order')
        if (savedOrder) {
          try {
            const parsed = JSON.parse(savedOrder)
            if (parsed.id === orderId) {
              const restoredOrder: Order = {
                ...parsed,
                createdAt: new Date(parsed.createdAt),
                updatedAt: new Date(parsed.updatedAt),
                shippedAt: parsed.shippedAt ? new Date(parsed.shippedAt) : undefined,
                deliveredAt: parsed.deliveredAt ? new Date(parsed.deliveredAt) : undefined,
                cancelledAt: parsed.cancelledAt ? new Date(parsed.cancelledAt) : undefined,
                statusHistory: parsed.statusHistory?.map((h: any) => ({
                  ...h,
                  date: new Date(h.date)
                }))
              }
              currentOrder.value = restoredOrder
              return restoredOrder
            }
          } catch (e) {
            console.error('Failed to parse saved order', e)
          }
        }
        error.value = 'Order not found'
        return null
      }

      const row = data as any
      if (row.tenant_id !== authStore.currentTenant) {
        error.value = 'Order not found in current tenant'
        return null
      }

      const order = convertRowToOrder(row)
      const currentUserId = getCurrentUserId()

      if (authStore.isAdmin) {
        currentOrder.value = order
        return order
      }

      if (currentUserId && order.userId && order.userId === currentUserId) {
        currentOrder.value = order
        return order
      }

      if (order.guestId) {
        const guestId = localStorage.getItem('guest_order_id')
        const guestEmail = localStorage.getItem('last_order_email')
        if (guestId && order.guestId === guestId) {
          currentOrder.value = order
          return order
        }
        if (guestEmail && order.customer?.email === guestEmail) {
          currentOrder.value = order
          return order
        }
      }

      error.value = 'You do not have permission to view this order'
      return null
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch order'
      console.error('Error fetching order:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const fetchOrderByNumber = async (orderNumber: string, email: string) => {
    loading.value = true
    error.value = null

    try {
      const client = getClient()
      const { data, error: fetchError } = await client
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .eq('customer->>email', email)
        .maybeSingle()

      if (fetchError || !data) {
        error.value = 'Order not found'
        return null
      }

      const order = convertRowToOrder(data)
      currentOrder.value = order
      return order
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch order'
      console.error('Error fetching order:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  const createOrder = async (
    shippingAddress: ShippingAddress,
    paymentMethod: PaymentMethod = 'cash_on_delivery' as PaymentMethod,
    notes?: string
  ) => {
    if (cartStore.items.length === 0) {
      authNotification.error('Your cart is empty')
      return null
    }

    const tenantId = authStore.currentTenant
    if (!tenantId) {
      error.value = 'Tenant not resolved – cannot create order'
      authNotification.error('Unable to place order: missing tenant context')
      return null
    }

    loading.value = true
    error.value = null

    try {
      const orderNumber = generateOrderNumber()
      const isAuthenticated = authStore.isAuthenticated
      const guestId = !isAuthenticated ? generateGuestId() : undefined
      const currentUserId = getCurrentUserId()
      const currentUserEmail = getCurrentUserEmail()
      const currentUserName = getCurrentUserName()

      const orderItems: OrderItem[] = []
      for (const cartItem of cartStore.items) {
        const product = productsStore.products.find((p: Product) => p.id === cartItem.id)
        if (!product) throw new Error(`Product ${cartItem.id} not found`)
        orderItems.push({
          id: cartItem.id,
          productId: cartItem.id,
          name: product.name?.en || 'Product',
          nameAr: product.name?.ar,
          price: product.price,
          quantity: cartItem.quantity || 1,
          size: product.size || '100ml',
          concentration: product.concentration || 'Eau de Parfum',
          image: product.imageUrl || '/images/default-product.jpg',
          brand: product.brand,
          imageUrl: product.imageUrl || '',
          originalPrice: product.originalPrice
        })
      }

      const subtotal = cartStore.subtotal
      const shipping = cartStore.shipping || 50
      const tax = cartStore.tax || Math.round(subtotal * 0.14)
      const total = subtotal + shipping + tax

      const updatedByName = isAuthenticated 
        ? (currentUserName || currentUserId || 'customer')
        : 'guest'

      const statusHistory: StatusHistoryItem[] = [{
        status: 'pending',
        date: new Date(),
        note: 'Order placed successfully',
        updatedBy: updatedByName
      }]

      const shippingAddressString = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.country || 'Egypt'}`

      // Use RPC call – cast to any
      const { data: orderData, error: rpcError } = await (getClient().rpc as any)('create_order', {
        _tenant_id: tenantId,
        _order_number: orderNumber,
        _customer: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          country: shippingAddress.country || 'Egypt'
        },
        _items: orderItems,
        _subtotal: subtotal,
        _shipping_cost: shipping,
        _tax: tax,
        _total: total,
        _payment_method: paymentMethod,
        _shipping_address: shippingAddressString,
        _notes: notes || '',
        _status_history: statusHistory.map(h => ({
          status: h.status,
          timestamp: h.date.toISOString(),
          note: h.note,
          updated_by: h.updatedBy
        })),
        _user_id: currentUserId,
        _guest_id: guestId,
        _user_email: currentUserEmail
      })

      if (rpcError) throw rpcError

      const newOrder = convertRowToOrder(orderData)

      orders.value = [newOrder, ...orders.value]
      currentOrder.value = newOrder

      await cartStore.clearCart()

      if (newOrder.guestId) {
        localStorage.setItem('guest_order_id', newOrder.guestId)
        localStorage.setItem('last_order_email', newOrder.customer.email)
        localStorage.setItem('last_order_number', newOrder.orderNumber)
        sessionStorage.setItem('last_created_order', JSON.stringify(newOrder))
      }

      authNotification.loggedIn(`Order #${newOrder.orderNumber} placed successfully`)
      return newOrder
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create order'
      console.error('Error creating order:', err)
      authNotification.error(error.value || 'Failed to place order. Please try again.')
      return null
    } finally {
      loading.value = false
    }
  }

  const getGuestOrders = async () => {
    const guestId = localStorage.getItem('guest_order_id')
    const guestEmail = localStorage.getItem('last_order_email')
    const guestOrderNumber = localStorage.getItem('last_order_number')

    if (!guestId && !guestEmail && !guestOrderNumber) return []

    loading.value = true

    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) return []

      const client = getClient()
      let query = client
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (guestId) {
        query = query.eq('guest_id', guestId)
      } else if (guestEmail) {
        query = query.eq('customer->>email', guestEmail)
      } else if (guestOrderNumber) {
        query = query.eq('order_number', guestOrderNumber)
      } else {
        return []
      }

      const { data, error: fetchError } = await query
      if (fetchError) throw fetchError

      const guestOrders = ((data as any[]) || []).map(row => convertRowToOrder(row))

      if (guestOrders.length > 0) {
        const latestOrder = guestOrders[0]
        if (latestOrder.guestId) localStorage.setItem('guest_order_id', latestOrder.guestId)
        if (latestOrder.customer?.email) localStorage.setItem('last_order_email', latestOrder.customer.email)
        if (latestOrder.orderNumber) localStorage.setItem('last_order_number', latestOrder.orderNumber)
      }

      return guestOrders
    } catch (err) {
      console.error('Error fetching guest orders:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  const updateOrderStatus = async (
    orderId: string,
    status: OrderStatus,
    trackingNumber?: string,
    note?: string
  ) => {
    if (!authStore.isAdmin) {
      authNotification.error('You do not have permission to update orders')
      return false
    }

    loading.value = true
    error.value = null

    try {
      const client = getClient()
      const { data: currentOrderData, error: fetchError } = await client
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

      if (fetchError || !currentOrderData) throw new Error('Order not found')
      const row = currentOrderData as any
      if (row.tenant_id !== authStore.currentTenant) throw new Error('Order does not belong to this tenant')

      const currentStatus = row.status
      if (currentStatus === status) return true

      const currentUserId = getCurrentUserId()
      const currentUserName = getCurrentUserName() || 'admin'

      const existingHistory = row.status_history || []
      const newHistoryItem = {
        status,
        timestamp: new Date().toISOString(),
        note: note || getStatusDescription(status),
        updated_by: currentUserName || currentUserId || 'admin'
      }
      const updatedHistory = [...existingHistory, newHistoryItem]

      const updatePayload: Record<string, any> = {
        status,
        updated_at: new Date().toISOString(),
        status_history: updatedHistory
      }

      if (trackingNumber) updatePayload.tracking_number = trackingNumber

      if (status === 'shipped') {
        updatePayload.shipped_at = new Date().toISOString()
        if (!trackingNumber && row.payment_method === 'cash_on_delivery') {
          updatePayload.payment_status = 'paid'
        }
      } else if (status === 'delivered') {
        updatePayload.delivered_at = new Date().toISOString()
        updatePayload.payment_status = 'paid'
      } else if (status === 'cancelled') {
        updatePayload.cancelled_at = new Date().toISOString()
        if (row.payment_status === 'paid') {
          updatePayload.payment_status = 'refunded'
        }

        const items = row.items as OrderItem[]
        for (const item of items) {
          const { error: stockError } = await (getClient().rpc as any)('adjust_product_stock', {
            _product_id: item.productId,
            _quantity: item.quantity
          })
          if (stockError) console.warn(`Failed to restore stock for product ${item.productId}:`, stockError)
        }
      }

      const { error: updateError } = await getTable('orders')
        .update(updatePayload)
        .eq('id', orderId)

      if (updateError) throw updateError

      const updatedOrder: Order = { ...convertRowToOrder({ ...row, ...updatePayload }), id: orderId }
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) orders.value = [...orders.value.slice(0, index), updatedOrder, ...orders.value.slice(index + 1)]
      else orders.value = [updatedOrder, ...orders.value]
      if (currentOrder.value?.id === orderId) currentOrder.value = updatedOrder

      const statusMessages: Partial<Record<OrderStatus, string>> = {
        processing: 'Your order is now being processed',
        shipped: `Your order has been shipped${trackingNumber ? ` with tracking #${trackingNumber}` : ''}`,
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled'
      }
      if (statusMessages[status]) authNotification.loggedIn(statusMessages[status] as string)

      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update order status'
      console.error('Error updating order status:', err)
      authNotification.error(error.value || 'Update failed')
      return false
    } finally {
      loading.value = false
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    if (!authStore.isAdmin) {
      authNotification.error('You do not have permission to update payment status')
      return false
    }
    loading.value = true
    try {
      const updatePayload = { payment_status: paymentStatus, updated_at: new Date().toISOString() }
      const { error: updateError } = await getTable('orders')
        .update(updatePayload)
        .eq('id', orderId)

      if (updateError) throw updateError

      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) orders.value[index] = { ...orders.value[index], paymentStatus, updatedAt: new Date() }
      if (currentOrder.value?.id === orderId) currentOrder.value = { ...currentOrder.value, paymentStatus, updatedAt: new Date() }
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update payment status'
      return false
    } finally {
      loading.value = false
    }
  }

  // Stubs (unchanged)
  const updateOrder = async (_orderId: string, _updateData: Partial<Order>) => false
  const cancelOrder = async (_orderId: string, _reason?: string) => false
  const deleteOrder = async (_orderId: string) => false
  const searchOrders = async (_searchTerm: string, _status?: OrderStatus) => []
  const getOrdersByEmail = async (_email: string) => []
  const reorder = async (_orderId: string) => false
  const downloadInvoice = async (_orderId: string) => null
  const getMonthlyRevenue = async (_year: number, _month: number) => 0
  const getOrderStats = async () => null
  const loadMore = async () => {}

  const clearCurrentOrder = () => { currentOrder.value = null }
  const clearOrders = () => {
    orders.value = []
    lastVisible.value = null
    hasMore.value = true
    error.value = null
  }
  const setOrders = (newOrders: Order[]) => { orders.value = newOrders }
  const addOrder = (order: Order) => { orders.value.unshift(order) }

  return {
    orders,
    currentOrder,
    loading,
    error,
    lastVisible,
    hasMore,
    statsLoading,
    orderStats,
    pendingOrdersCount,
    completedOrdersCount,
    totalRevenue,
    activeOrders,
    averageOrderValue,
    getStatusText,
    getStatusDescription,
    getPaymentStatusText,
    fetchOrders,
    fetchOrderById,
    fetchOrderByNumber,
    createOrder,
    getGuestOrders,
    updateOrderStatus,
    updatePaymentStatus,
    updateOrder,
    cancelOrder,
    deleteOrder,
    searchOrders,
    getOrdersByEmail,
    reorder,
    downloadInvoice,
    getMonthlyRevenue,
    getOrderStats,
    loadMore,
    clearCurrentOrder,
    clearOrders,
    setOrders,
    addOrder
  }
})