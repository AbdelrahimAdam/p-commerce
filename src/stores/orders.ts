// src/stores/orders.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  getDoc, 
  doc, 
  updateDoc, 
  addDoc, 
  serverTimestamp,
  Timestamp,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  runTransaction
} from 'firebase/firestore'
import { db } from '@/firebase/config'
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
  FirestoreOrder,
  Product
} from '@/types'

export const useOrdersStore = defineStore('orders', () => {
  const authStore = useAuthStore()
  const cartStore = useCartStore()
  const productsStore = useProductsStore()

  // State
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastVisible = ref<QueryDocumentSnapshot<DocumentData> | null>(null)
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

  // Helper to get product reference in brand subcollection
  const getProductRef = (brandId: string, productId: string) => {
    return doc(db, 'brands', brandId, 'products', productId)
  }

  // Getters
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

  // Helper functions
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

  const convertTimestampsToDates = (firestoreOrder: FirestoreOrder & { id: string }): Order => ({
    ...firestoreOrder,
    id: firestoreOrder.id,
    userId: firestoreOrder.userId ?? undefined,
    guestId: firestoreOrder.guestId ?? undefined,
    tenantId: firestoreOrder.tenantId,
    createdAt: (firestoreOrder.createdAt as Timestamp)?.toDate?.() || new Date(),
    updatedAt: (firestoreOrder.updatedAt as Timestamp)?.toDate?.() || new Date(),
    shippedAt: (firestoreOrder.shippedAt as Timestamp)?.toDate?.() || undefined,
    deliveredAt: (firestoreOrder.deliveredAt as Timestamp)?.toDate?.() || undefined,
    cancelledAt: (firestoreOrder.cancelledAt as Timestamp)?.toDate?.() || undefined,
    statusHistory: firestoreOrder.statusHistory?.map(h => ({
      status: h.status,
      date: h.timestamp.toDate(),
      note: h.note,
      updatedBy: h.updatedBy
    }))
  })

  const getCurrentUserId = (): string | null => {
    if (!authStore.isAuthenticated) return null
    if (authStore.user?.uid) return authStore.user.uid
    if (authStore.customer?.uid) return authStore.customer.uid
    return null
  }

  const getCurrentUserEmail = (): string | null => {
    if (!authStore.isAuthenticated) return null
    if (authStore.user?.email) return authStore.user.email
    if (authStore.customer?.email) return authStore.customer.email
    return null
  }

  const getCurrentUserName = (): string | null => {
    if (!authStore.isAuthenticated) return null
    if (authStore.user?.displayName) return authStore.user.displayName
    if (authStore.customer?.displayName) return authStore.customer.displayName
    return null
  }

  // ========== fetchOrders ==========
  const fetchOrders = async (options?: {
    limit?: number
    status?: OrderStatus
    startAfterDoc?: QueryDocumentSnapshot<DocumentData>
    userId?: string
    guestId?: string
    email?: string
    all?: boolean
  }) => {
    if (loading.value) return []

    loading.value = true
    error.value = null

    try {
      const ordersCollection = collection(db, 'orders')
      const constraints: any[] = [
        where('tenantId', '==', authStore.currentTenant),
        orderBy('createdAt', 'desc')
      ]

      const currentUserId = getCurrentUserId()
      const isAdmin = authStore.isAdmin

      if (options?.userId) {
        if (!isAdmin && options.userId !== currentUserId) {
          console.warn('Permission denied: cannot fetch orders for another user')
          loading.value = false
          return []
        }
        constraints.push(where('userId', '==', options.userId))
      }
      else if (options?.guestId) {
        constraints.push(where('guestId', '==', options.guestId))
      }
      else if (options?.email) {
        constraints.push(where('customer.email', '==', options.email))
      }
      else if (options?.all && isAdmin) {
        // No user filter – fetch all within tenant
      }
      else if (authStore.isCustomer && currentUserId) {
        constraints.push(where('userId', '==', currentUserId))
      }
      else if (!isAdmin && !authStore.isCustomer) {
        // Guest – cannot fetch without identifier
        loading.value = false
        return []
      }

      if (options?.status) {
        constraints.push(where('status', '==', options.status))
      }

      if (options?.limit) {
        constraints.push(limit(options.limit))
      } else {
        constraints.push(limit(20))
      }

      if (options?.startAfterDoc) {
        constraints.push(startAfter(options.startAfterDoc))
      }

      const q = query(ordersCollection, ...constraints)
      const querySnapshot = await getDocs(q)

      lastVisible.value = querySnapshot.docs[querySnapshot.docs.length - 1] || null
      hasMore.value = querySnapshot.docs.length === (options?.limit || 20)

      const fetchedOrders: Order[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreOrder
        return convertTimestampsToDates({ id: doc.id, ...data })
      })

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

  // ========== fetchOrderById ==========
  const fetchOrderById = async (orderId: string) => {
    loading.value = true
    error.value = null

    try {
      const orderDoc = doc(db, 'orders', orderId)
      const docSnapshot = await getDoc(orderDoc)

      if (docSnapshot.exists()) {
        const data = docSnapshot.data() as FirestoreOrder
        // Verify tenant
        if (data.tenantId !== authStore.currentTenant) {
          error.value = 'Order not found in current tenant'
          return null
        }

        const currentUserId = getCurrentUserId()

        if (authStore.isAdmin) {
          currentOrder.value = convertTimestampsToDates({ id: docSnapshot.id, ...data })
          return currentOrder.value
        }

        if (currentUserId && data.userId && data.userId === currentUserId) {
          currentOrder.value = convertTimestampsToDates({ id: docSnapshot.id, ...data })
          return currentOrder.value
        }

        if (data.guestId) {
          const guestId = localStorage.getItem('guest_order_id')
          const guestEmail = localStorage.getItem('last_order_email')
          if (guestId && data.guestId === guestId) {
            currentOrder.value = convertTimestampsToDates({ id: docSnapshot.id, ...data })
            return currentOrder.value
          }
          if (guestEmail && data.customer?.email === guestEmail) {
            currentOrder.value = convertTimestampsToDates({ id: docSnapshot.id, ...data })
            return currentOrder.value
          }
        }

        error.value = 'You do not have permission to view this order'
        return null
      } else {
        error.value = 'Order not found'
        return null
      }
    } catch (err: any) {
      // If permission error, try to get from sessionStorage (for guests)
      if (err.code === 'permission-denied') {
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
      }

      error.value = err instanceof Error ? err.message : 'Failed to fetch order'
      console.error('Error fetching order:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // ========== fetchOrderByNumber ==========
  const fetchOrderByNumber = async (orderNumber: string, email: string) => {
    loading.value = true
    error.value = null

    try {
      const ordersCollection = collection(db, 'orders')
      const q = query(
        ordersCollection,
        where('tenantId', '==', authStore.currentTenant),
        where('orderNumber', '==', orderNumber),
        where('customer.email', '==', email)
      )

      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0]
        const data = doc.data() as FirestoreOrder
        currentOrder.value = convertTimestampsToDates({ id: doc.id, ...data })
        return currentOrder.value
      } else {
        error.value = 'Order not found'
        return null
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch order'
      console.error('Error fetching order:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // ========== createOrder ==========
  const createOrder = async (
    shippingAddress: ShippingAddress,
    paymentMethod: PaymentMethod = 'cash_on_delivery',
    notes?: string
  ) => {
    if (cartStore.items.length === 0) {
      authNotification.error('Your cart is empty')
      return null
    }

    if (!authStore.currentTenant) {
      error.value = 'Tenant not resolved – cannot create order'
      authNotification.error('Unable to place order: missing tenant context')
      return null
    }

    loading.value = true
    error.value = null

    try {
      const newOrder = await runTransaction(db, async (transaction) => {
        const orderNumber = generateOrderNumber()
        const isAuthenticated = authStore.isAuthenticated
        const guestId = !isAuthenticated ? generateGuestId() : undefined
        const currentUserId = getCurrentUserId()
        const currentUserEmail = getCurrentUserEmail()
        const currentUserName = getCurrentUserName()

        // Prepare order items with stock validation
        const orderItems: OrderItem[] = []
        for (const cartItem of cartStore.items) {
          const product = productsStore.products.find((p: Product) => p.id === cartItem.id)
          if (!product) {
            throw new Error(`Product ${cartItem.id} not found`)
          }
          if (!product.brandId) {
            throw new Error(`Product ${cartItem.id} has no brandId`)
          }
          const productRef = getProductRef(product.brandId, product.id)
          const productDoc = await transaction.get(productRef)

          if (!productDoc.exists()) {
            throw new Error(`Product ${cartItem.id} no longer exists`)
          }

          const productData = productDoc.data()
          const currentStock = productData.stockQuantity || 0
          const requestedQty = cartItem.quantity || 1

          if (currentStock < requestedQty) {
            throw new Error(`Insufficient stock for ${product.name.en || product.name}`)
          }

          transaction.update(productRef, {
            stockQuantity: currentStock - requestedQty,
            updatedAt: serverTimestamp()
          })

          orderItems.push({
            id: cartItem.id,
            productId: cartItem.id,
            name: product.name?.en || 'Product',
            nameAr: product.name?.ar,
            price: product.price,
            quantity: requestedQty,
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

        const orderData: any = {
          orderNumber,
          customer: {
            name: shippingAddress.name,
            email: shippingAddress.email,
            phone: shippingAddress.phone,
            address: shippingAddress.address,
            city: shippingAddress.city,
            country: shippingAddress.country || 'Egypt'
          },
          items: orderItems,
          subtotal,
          shippingCost: shipping,
          tax,
          total,
          status: 'pending',
          paymentMethod,
          paymentStatus: paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
          shippingAddress: shippingAddressString,
          notes: notes || '',
          statusHistory: statusHistory.map(h => ({
            status: h.status,
            timestamp: Timestamp.fromDate(h.date),
            note: h.note,
            updatedBy: h.updatedBy
          })),
          tenantId: authStore.currentTenant,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        if (isAuthenticated && currentUserId) orderData.userId = currentUserId
        if (!isAuthenticated && guestId) orderData.guestId = guestId
        if (isAuthenticated && currentUserEmail) orderData.userEmail = currentUserEmail

        const ordersCollection = collection(db, 'orders')
        const docRef = await addDoc(ordersCollection, orderData)

        return {
          id: docRef.id,
          ...orderData,
          createdAt: new Date(),
          updatedAt: new Date(),
          statusHistory
        }
      })

      const createdOrder: Order = {
        ...newOrder,
        id: newOrder.id,
        tenantId: authStore.currentTenant,
        createdAt: new Date(),
        updatedAt: new Date(),
        shippedAt: undefined,
        deliveredAt: undefined,
        cancelledAt: undefined,
        userId: newOrder.userId ?? undefined,
        guestId: newOrder.guestId ?? undefined
      }

      orders.value = [createdOrder, ...orders.value]
      currentOrder.value = createdOrder

      await cartStore.clearCart()

      if (createdOrder.guestId) {
        localStorage.setItem('guest_order_id', createdOrder.guestId)
        localStorage.setItem('last_order_email', createdOrder.customer.email)
        localStorage.setItem('last_order_number', createdOrder.orderNumber)
        sessionStorage.setItem('last_created_order', JSON.stringify(createdOrder))
      }

      authNotification.loggedIn(`Order #${createdOrder.orderNumber} placed successfully`)
      return createdOrder
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create order'
      console.error('Error creating order:', err)
      authNotification.error(error.value || 'Failed to place order. Please try again.')
      return null
    } finally {
      loading.value = false
    }
  }

  // ========== getGuestOrders ==========
  const getGuestOrders = async () => {
    const guestId = localStorage.getItem('guest_order_id')
    const guestEmail = localStorage.getItem('last_order_email')
    const guestOrderNumber = localStorage.getItem('last_order_number')

    if (!guestId && !guestEmail && !guestOrderNumber) return []

    loading.value = true

    try {
      const ordersCollection = collection(db, 'orders')
      let q

      if (guestId) {
        q = query(
          ordersCollection,
          where('tenantId', '==', authStore.currentTenant),
          where('guestId', '==', guestId),
          orderBy('createdAt', 'desc')
        )
      } else if (guestEmail) {
        q = query(
          ordersCollection,
          where('tenantId', '==', authStore.currentTenant),
          where('customer.email', '==', guestEmail),
          orderBy('createdAt', 'desc')
        )
      } else if (guestOrderNumber) {
        q = query(
          ordersCollection,
          where('tenantId', '==', authStore.currentTenant),
          where('orderNumber', '==', guestOrderNumber),
          orderBy('createdAt', 'desc')
        )
      } else {
        return []
      }

      const querySnapshot = await getDocs(q)

      const guestOrders: Order[] = querySnapshot.docs.map(doc => {
        const data = doc.data() as FirestoreOrder
        return convertTimestampsToDates({ id: doc.id, ...data })
      })

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

  // ========== updateOrderStatus ==========
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
      const orderDocRef = doc(db, 'orders', orderId)
      const orderSnapshot = await getDoc(orderDocRef)

      if (!orderSnapshot.exists()) {
        throw new Error('Order not found')
      }

      const orderData = orderSnapshot.data() as FirestoreOrder
      if (orderData.tenantId !== authStore.currentTenant) {
        throw new Error('Order does not belong to this tenant')
      }

      const order = convertTimestampsToDates({ id: orderSnapshot.id, ...orderData })

      if (order.status === status) {
        console.log('Status already set to', status)
        return true
      }

      const currentUserId = getCurrentUserId()
      const currentUserName = getCurrentUserName() || 'admin'

      const statusHistory: StatusHistoryItem[] = order.statusHistory || []
      statusHistory.push({
        status,
        date: new Date(),
        note: note || getStatusDescription(status),
        updatedBy: currentUserName || currentUserId || 'admin'
      })

      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
        statusHistory: statusHistory.map(h => ({
          status: h.status,
          timestamp: Timestamp.fromDate(h.date),
          note: h.note,
          updatedBy: h.updatedBy
        }))
      }

      if (trackingNumber) updateData.trackingNumber = trackingNumber

      if (status === 'shipped') {
        updateData.shippedAt = serverTimestamp()
        if (!trackingNumber && order.paymentMethod === 'cash_on_delivery') {
          updateData.paymentStatus = 'paid'
        }
      } else if (status === 'delivered') {
        updateData.deliveredAt = serverTimestamp()
        updateData.paymentStatus = 'paid'
      } else if (status === 'cancelled') {
        updateData.cancelledAt = serverTimestamp()
        if (order.paymentStatus === 'paid') {
          updateData.paymentStatus = 'refunded'
        }

        // Restore stock for each product
        for (const item of order.items) {
          const product = productsStore.products.find((p: Product) => p.id === item.productId)
          if (product && product.brandId) {
            const productRef = getProductRef(product.brandId, product.id)
            const productDoc = await getDoc(productRef)
            if (productDoc.exists()) {
              const currentStock = productDoc.data().stockQuantity || 0
              await updateDoc(productRef, {
                stockQuantity: currentStock + item.quantity,
                updatedAt: serverTimestamp()
              })
            } else {
              console.warn(`Product document for ${item.productId} not found in Firestore`)
            }
          } else {
            console.warn(`Product ${item.productId} not found in store, cannot restore stock`)
          }
        }
      }

      await updateDoc(orderDocRef, updateData)

      const updatedOrder: Order = {
        ...order,
        status,
        updatedAt: new Date(),
        statusHistory,
        ...(trackingNumber && { trackingNumber }),
        ...(status === 'shipped' && { shippedAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date(), paymentStatus: 'paid' }),
        ...(status === 'cancelled' && { cancelledAt: new Date() })
      }

      if (updateData.paymentStatus) updatedOrder.paymentStatus = updateData.paymentStatus

      const orderIndex = orders.value.findIndex(o => o.id === orderId)
      if (orderIndex !== -1) {
        orders.value = [
          ...orders.value.slice(0, orderIndex),
          updatedOrder,
          ...orders.value.slice(orderIndex + 1)
        ]
      } else {
        orders.value = [updatedOrder, ...orders.value]
      }

      if (currentOrder.value?.id === orderId) {
        currentOrder.value = updatedOrder
      }

      const statusMessages: Partial<Record<OrderStatus, string>> = {
        processing: 'Your order is now being processed',
        shipped: `Your order has been shipped${trackingNumber ? ` with tracking #${trackingNumber}` : ''}`,
        delivered: 'Your order has been delivered',
        cancelled: 'Your order has been cancelled'
      }
      if (statusMessages[status]) {
        authNotification.loggedIn(statusMessages[status] as string)
      }

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

  // ========== updatePaymentStatus ==========
  const updatePaymentStatus = async (orderId: string, paymentStatus: PaymentStatus) => {
    if (!authStore.isAdmin) {
      authNotification.error('You do not have permission to update payment status')
      return false
    }
    loading.value = true
    try {
      const orderDoc = doc(db, 'orders', orderId)
      const orderSnap = await getDoc(orderDoc)
      if (orderSnap.exists() && orderSnap.data().tenantId !== authStore.currentTenant) {
        throw new Error('Order not in current tenant')
      }
      await updateDoc(orderDoc, { 
        paymentStatus, 
        updatedAt: serverTimestamp() 
      })
      const index = orders.value.findIndex(o => o.id === orderId)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], paymentStatus, updatedAt: new Date() }
      }
      if (currentOrder.value?.id === orderId) {
        currentOrder.value = { ...currentOrder.value, paymentStatus, updatedAt: new Date() }
      }
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update payment status'
      return false
    } finally {
      loading.value = false
    }
  }

  // ========== Stub functions ==========
  const updateOrder = async (_orderId: string, _updateData: Partial<Order>) => {
    console.warn('updateOrder not implemented')
    return false
  }
  const cancelOrder = async (_orderId: string, _reason?: string) => {
    console.warn('cancelOrder not implemented')
    return false
  }
  const deleteOrder = async (_orderId: string) => {
    console.warn('deleteOrder not implemented')
    return false
  }
  const searchOrders = async (_searchTerm: string, _status?: OrderStatus) => {
    console.warn('searchOrders not implemented')
    return []
  }
  const getOrdersByEmail = async (_email: string) => {
    console.warn('getOrdersByEmail not implemented')
    return []
  }
  const reorder = async (_orderId: string) => {
    console.warn('reorder not implemented')
    return false
  }
  const downloadInvoice = async (_orderId: string) => {
    console.warn('downloadInvoice not implemented')
    return null
  }
  const getMonthlyRevenue = async (_year: number, _month: number) => {
    console.warn('getMonthlyRevenue not implemented')
    return 0
  }
  const getOrderStats = async () => {
    console.warn('getOrderStats not implemented')
    return null
  }
  const loadMore = async () => {
    console.warn('loadMore not implemented')
  }

  // ========== Clear helpers ==========
  const clearCurrentOrder = () => { currentOrder.value = null }
  const clearOrders = () => {
    orders.value = []
    lastVisible.value = null
    hasMore.value = true
    error.value = null
  }

  // Admin helpers
  const setOrders = (newOrders: Order[]) => { orders.value = newOrders }
  const addOrder = (order: Order) => { orders.value.unshift(order) }

  return {
    // State
    orders,
    currentOrder,
    loading,
    error,
    lastVisible,
    hasMore,
    statsLoading,
    orderStats,

    // Getters
    pendingOrdersCount,
    completedOrdersCount,
    totalRevenue,
    activeOrders,
    averageOrderValue,
    getStatusText,
    getStatusDescription,
    getPaymentStatusText,

    // Actions
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

    // Admin helpers
    setOrders,
    addOrder
  }
})