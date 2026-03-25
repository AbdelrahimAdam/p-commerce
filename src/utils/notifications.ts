// src/utils/notifications.ts
export type NotificationType = 'success' | 'error' | 'warning' | 'info'
export type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'

export interface Notification {
  id: string | number
  type: NotificationType
  title: string
  message: string
  duration?: number
  position?: NotificationPosition
  icon?: string
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ConfirmationOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: NotificationType
  confirmButtonClass?: string
  cancelButtonClass?: string
}

class LuxuryNotification {
  private notifications: Notification[] = []
  private subscribers: ((notifications: Notification[]) => void)[] = []
  private nextId = 0
  private timers: Map<string | number, ReturnType<typeof setTimeout>> = new Map()

  // Professional icon mapping
  private static readonly iconMap: Record<NotificationType, string> = {
    success: 'check-circle',
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'info'
  }

  // Show a luxury notification
  show(notification: Omit<Notification, 'id'>): string {
    const id = ++this.nextId
    const fullNotification: Notification = {
      id,
      position: 'top-right',
      duration: 5000,
      ...notification,
      icon: notification.icon || LuxuryNotification.iconMap[notification.type]
    }

    this.notifications.push(fullNotification)
    this.notifySubscribers()

    // Auto-remove after duration
    if (fullNotification.duration && fullNotification.duration > 0) {
      const timer = setTimeout(() => {
        this.remove(id)
        this.timers.delete(id)
      }, fullNotification.duration)
      this.timers.set(id, timer)
    }

    return id.toString()
  }

  // Remove a notification
  remove(id: string | number): void {
    const timer = this.timers.get(id)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(id)
    }
    this.notifications = this.notifications.filter(n => n.id !== id)
    this.notifySubscribers()
  }

  // Clear all notifications
  clear(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer))
    this.timers.clear()
    this.notifications = []
    this.notifySubscribers()
  }

  // Clear by type
  clearByType(type: NotificationType): void {
    const toRemove = this.notifications.filter(n => n.type === type)
    toRemove.forEach(n => {
      const timer = this.timers.get(n.id)
      if (timer) clearTimeout(timer)
      this.timers.delete(n.id)
    })
    this.notifications = this.notifications.filter(n => n.type !== type)
    this.notifySubscribers()
  }

  // Get all notifications
  getAll(): Notification[] {
    return [...this.notifications]
  }

  // Subscribe to notifications
  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback)
    }
  }

  // Notify subscribers
  private notifySubscribers(): void {
    const snapshot = this.getAll()
    this.subscribers.forEach(callback => callback(snapshot))
  }

  // Luxury notification presets
  success(title: string, message: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'success',
      title,
      message,
      icon: LuxuryNotification.iconMap.success,
      ...options
    })
  }

  error(title: string, message: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'error',
      title,
      message,
      icon: LuxuryNotification.iconMap.error,
      ...options
    })
  }

  warning(title: string, message: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      icon: LuxuryNotification.iconMap.warning,
      ...options
    })
  }

  info(title: string, message: string, options?: Partial<Notification>): string {
    return this.show({
      type: 'info',
      title,
      message,
      icon: LuxuryNotification.iconMap.info,
      ...options
    })
  }

  // Luxury confirmation dialog
  confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmEvent = new CustomEvent('luxury-confirmation', {
        detail: {
          ...options,
          confirmText: options.confirmText || 'Confirm',
          cancelText: options.cancelText || 'Cancel',
          onConfirm: () => resolve(true),
          onCancel: () => resolve(false)
        }
      })
      window.dispatchEvent(confirmEvent)
    })
  }

  // Quick toast notification
  toast(message: string, type: NotificationType = 'info', duration: number = 3000): string {
    return this.show({
      type,
      title: '',
      message,
      duration,
      icon: LuxuryNotification.iconMap[type]
    })
  }
}

// Export singleton instance
export const luxuryNotification = new LuxuryNotification()

// Convenience functions
export const showNotification = (options: Omit<Notification, 'id'>) => 
  luxuryNotification.show(options)

export const showSuccess = (title: string, message: string, options?: Partial<Notification>) =>
  luxuryNotification.success(title, message, options)

export const showError = (title: string, message: string, options?: Partial<Notification>) =>
  luxuryNotification.error(title, message, options)

export const showWarning = (title: string, message: string, options?: Partial<Notification>) =>
  luxuryNotification.warning(title, message, options)

export const showInfo = (title: string, message: string, options?: Partial<Notification>) =>
  luxuryNotification.info(title, message, options)

export const showConfirmation = (options: ConfirmationOptions) =>
  luxuryNotification.confirm(options)

export const showToast = (message: string, type?: NotificationType, duration?: number) =>
  luxuryNotification.toast(message, type, duration)

// Quick notification for cart actions
export const cartNotification = {
  added: (productName: string) => 
    showSuccess('Added to Cart', `${productName} added to your luxury collection`, {
      icon: 'shopping-bag',
      duration: 3000
    }),

  removed: (productName: string) =>
    showInfo('Removed from Cart', `${productName} removed from your collection`, {
      icon: 'trash-2',
      duration: 3000
    }),

  updated: (productName: string, quantity: number) =>
    showSuccess('Quantity Updated', `${productName} quantity set to ${quantity}`, {
      icon: 'refresh-cw',
      duration: 3000
    }),

  cleared: () =>
    showSuccess('Cart Cleared', 'Your luxury cart has been cleared', {
      icon: 'trash',
      duration: 3000
    })
}

// Quick notification for auth actions
export const authNotification = {
  loggedIn: (userName: string) =>
    showSuccess('Welcome Back', `Welcome ${userName}`, {
      icon: 'log-in',
      duration: 4000
    }),

  loggedOut: () =>
    showInfo('Logged Out', 'Successfully logged out', {
      icon: 'log-out',
      duration: 3000
    }),

  error: (message: string) => {
    // Handle null/undefined messages
    const safeMessage = message || 'An error occurred'
    return showError('Authentication Error', safeMessage, {
      icon: 'lock',
      duration: 5000
    })
  }
}

// Quick notification for product actions
export const productNotification = {
  added: (productName: string) =>
    showSuccess('Product Added', `${productName} added successfully`, {
      icon: 'package-plus',
      duration: 3000
    }),

  updated: (productName: string) =>
    showSuccess('Product Updated', `${productName} updated successfully`, {
      icon: 'edit',
      duration: 3000
    }),

  deleted: (productName: string) =>
    showSuccess('Product Deleted', `${productName} removed successfully`, {
      icon: 'trash-2',
      duration: 3000
    }),

  error: (message: string) => {
    const safeMessage = message || 'An error occurred'
    return showError('Product Error', safeMessage, {
      icon: 'alert-circle',
      duration: 5000
    })
  }
}

// Quick notification for order actions
export const orderNotification = {
  created: (orderNumber: string) =>
    showSuccess('Order Placed', `Order #${orderNumber} has been placed successfully`, {
      icon: 'check-circle',
      duration: 5000
    }),

  updated: (orderNumber: string) =>
    showSuccess('Order Updated', `Order #${orderNumber} has been updated`, {
      icon: 'refresh-cw',
      duration: 4000
    }),

  cancelled: (orderNumber: string) =>
    showWarning('Order Cancelled', `Order #${orderNumber} has been cancelled`, {
      icon: 'x-circle',
      duration: 4000
    }),

  error: (message: string) => {
    const safeMessage = message || 'Order operation failed'
    return showError('Order Error', safeMessage, {
      icon: 'alert-circle',
      duration: 5000
    })
  }
}