import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser, CustomerUser } from '@/types'
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  sendPasswordResetEmail,
  confirmPasswordReset as firebaseConfirmPasswordReset,
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore'
import { auth, db } from '@/firebase/config'
import { authNotification, showInfo } from '@/utils/notifications'

// List of public paths that don't need authentication
const PUBLIC_PATHS = [
  '/',
  '/shop',
  '/offers',
  '/offer',
  '/brands',
  '/brand',
  '/cart',
  '/checkout',
  '/contact',
  '/about',
  '/collections',
  '/product',
  '/category',
  '/wishlist',
  '/admin/login',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password'
]

const isPublicPath = (path: string): boolean => {
  return PUBLIC_PATHS.some(publicPath => 
    path === publicPath || path.startsWith(publicPath + '/')
  )
}

export const useAuthStore = defineStore('auth', () => {
  // Super-admin state
  const user = ref<AdminUser | null>(null)
  // Customer state
  const customer = ref<CustomerUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastLogin = ref<Date | null>(null)
  const sessionExpiry = ref<Date | null>(null)
  const authListenerInitialized = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!user.value || !!customer.value)
  const isAdmin = computed(() => !!user.value)
  const isSuperAdmin = computed(() => user.value?.role?.toLowerCase() === 'super-admin')
  const isCustomer = computed(() => !!customer.value)
  
  const userInitials = computed(() => {
    const name = user.value?.displayName || customer.value?.displayName || ''
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
    }
    return ''
  })

  const currentUser = computed(() => user.value || customer.value)

  const sessionTimeLeft = computed(() => {
    if (!sessionExpiry.value) return 0
    return Math.max(0, sessionExpiry.value.getTime() - new Date().getTime())
  })

  // Helper: fetch super-admin from 'admins' collection
  const getSuperAdminFromFirestore = async (firebaseUser: FirebaseUser): Promise<AdminUser | null> => {
    try {
      const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid))
      if (!adminDoc.exists()) return null
      const data = adminDoc.data()
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: data.displayName || firebaseUser.displayName || '',
        role: 'super-admin',
        photoURL: data.photoURL || firebaseUser.photoURL || undefined,
        isActive: data.isActive !== false,
        permissions: data.permissions || ['all'],
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        lastLogin: new Date()
      }
    } catch (err) {
      console.error('❌ Error getting super-admin from Firestore:', err)
      return null
    }
  }

  // Helper: fetch customer from 'customers' collection
  const getCustomerFromFirestore = async (firebaseUser: FirebaseUser): Promise<CustomerUser | null> => {
    try {
      const customerDoc = await getDoc(doc(db, 'customers', firebaseUser.uid))
      if (!customerDoc.exists()) {
        // If customer doesn't exist in Firestore, create a basic profile
        const newCustomer: CustomerUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          photoURL: firebaseUser.photoURL || undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date(),
          addresses: [],
          wishlist: [],
          newsletter: false
        }
        
        // Save to Firestore
        await setDoc(doc(db, 'customers', firebaseUser.uid), {
          ...newCustomer,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        
        return newCustomer
      }
      
      const data = customerDoc.data()
      return {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: data.displayName || firebaseUser.displayName || '',
        photoURL: data.photoURL || firebaseUser.photoURL || undefined,
        addresses: data.addresses || [],
        wishlist: data.wishlist || [],
        newsletter: data.newsletter || false,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        lastLogin: new Date()
      }
    } catch (err) {
      console.error('❌ Error getting customer from Firestore:', err)
      return null
    }
  }

  // Admin Login action (only super-admin)
  const login = async (email: string, password: string): Promise<AdminUser> => {
    isLoading.value = true
    error.value = null
    try {
      console.log('🔐 Attempting super-admin login:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      const adminData = await getSuperAdminFromFirestore(firebaseUser)

      if (!adminData) {
        throw new Error('Access denied: not a super-admin')
      }

      // Update lastLogin in Firestore
      await updateDoc(doc(db, 'admins', firebaseUser.uid), { lastLogin: serverTimestamp() })

      user.value = adminData
      customer.value = null // Clear any customer data
      lastLogin.value = new Date()
      sessionExpiry.value = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h session

      localStorage.setItem('luxury_admin_session', JSON.stringify({
        user: user.value,
        expiry: sessionExpiry.value.getTime(),
        timestamp: Date.now()
      }))

      authNotification.loggedIn(user.value.displayName)
      console.log('✅ Super-admin authenticated:', user.value.email)
      return user.value
    } catch (err: any) {
      console.error('❌ Super-admin login error:', err)
      error.value = err.message || 'Invalid credentials'
      authNotification.error(error.value || 'Login failed')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Customer Login action
  const customerLogin = async (credentials: { email: string; password: string; remember?: boolean }): Promise<CustomerUser> => {
    isLoading.value = true
    error.value = null
    try {
      console.log('🔐 Attempting customer login:', credentials.email)
      const userCredential = await signInWithEmailAndPassword(auth, credentials.email, credentials.password)
      const firebaseUser = userCredential.user
      
      // Check if this is actually an admin (prevent admins from logging in as customers)
      const adminData = await getSuperAdminFromFirestore(firebaseUser)
      if (adminData) {
        throw new Error('Please use admin login portal')
      }

      const customerData = await getCustomerFromFirestore(firebaseUser)

      if (!customerData) {
        throw new Error('Failed to load customer profile')
      }

      // Update lastLogin in Firestore
      await updateDoc(doc(db, 'customers', firebaseUser.uid), { 
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      customer.value = customerData
      user.value = null // Clear any admin data
      lastLogin.value = new Date()
      
      // Set session expiry based on remember me
      const sessionDuration = credentials.remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 days or 24 hours
      sessionExpiry.value = new Date(Date.now() + sessionDuration)

      localStorage.setItem('luxury_customer_session', JSON.stringify({
        user: customer.value,
        expiry: sessionExpiry.value.getTime(),
        timestamp: Date.now()
      }))

      authNotification.loggedIn(customerData.displayName || 'Customer')
      console.log('✅ Customer authenticated:', customer.value.email)
      return customer.value
    } catch (err: any) {
      console.error('❌ Customer login error:', err)
      error.value = err.message || 'Invalid credentials'
      authNotification.error(error.value || 'Login failed')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Customer Registration
  const customerRegister = async (userData: {
    email: string
    password: string
    displayName: string
    phoneNumber?: string
  }): Promise<CustomerUser> => {
    isLoading.value = true
    error.value = null
    try {
      console.log('📝 Creating customer account:', userData.email)
      const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password)
      const firebaseUser = userCredential.user

      // Update profile with display name
      await updateProfile(firebaseUser, {
        displayName: userData.displayName
      })

      const newCustomer: CustomerUser = {
        uid: firebaseUser.uid,
        email: userData.email,
        displayName: userData.displayName,
        photoURL: undefined,
        phoneNumber: userData.phoneNumber,
        addresses: [],
        wishlist: [],
        newsletter: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      }

      // Save to Firestore
      await setDoc(doc(db, 'customers', firebaseUser.uid), {
        ...newCustomer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      customer.value = newCustomer
      user.value = null
      
      authNotification.loggedIn('Account created successfully!')
      console.log('✅ Customer registered:', newCustomer.email)
      return newCustomer
    } catch (err: any) {
      console.error('❌ Customer registration error:', err)
      error.value = err.message
      authNotification.error(error.value || 'Registration failed')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ========== CUSTOMER PROFILE UPDATE ACTIONS ==========

  // Update customer profile (displayName, phone, preferences)
  const updateCustomerProfile = async (profileData: {
    displayName?: string
    phoneNumber?: string
    newsletter?: boolean
    smsNotifications?: boolean
    dob?: string
  }): Promise<void> => {
    if (!customer.value) {
      throw new Error('No customer logged in')
    }

    isLoading.value = true
    error.value = null

    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser) {
        throw new Error('No authenticated user')
      }

      // Update display name in Firebase Auth if provided
      if (profileData.displayName && firebaseUser.displayName !== profileData.displayName) {
        await updateProfile(firebaseUser, {
          displayName: profileData.displayName
        })
      }

      // Update customer document in Firestore
      const customerRef = doc(db, 'customers', customer.value.uid)
      const updateData: any = {
        updatedAt: serverTimestamp()
      }

      if (profileData.displayName) updateData.displayName = profileData.displayName
      if (profileData.phoneNumber !== undefined) updateData.phoneNumber = profileData.phoneNumber
      if (profileData.newsletter !== undefined) updateData.newsletter = profileData.newsletter
      if (profileData.smsNotifications !== undefined) updateData.smsNotifications = profileData.smsNotifications
      if (profileData.dob !== undefined) updateData.dob = profileData.dob

      await updateDoc(customerRef, updateData)

      // Update local customer state
      if (profileData.displayName) customer.value.displayName = profileData.displayName
      if (profileData.phoneNumber !== undefined) customer.value.phoneNumber = profileData.phoneNumber
      if (profileData.newsletter !== undefined) customer.value.newsletter = profileData.newsletter
      
      // Add any additional fields to customer object
      const extendedCustomer = customer.value as any
      if (profileData.smsNotifications !== undefined) extendedCustomer.smsNotifications = profileData.smsNotifications
      if (profileData.dob !== undefined) extendedCustomer.dob = profileData.dob

      authNotification.loggedIn('Profile updated successfully')
    } catch (err: any) {
      console.error('❌ Error updating customer profile:', err)
      error.value = err.message
      authNotification.error('Failed to update profile')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Change customer password
  const changeCustomerPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!customer.value) {
      throw new Error('No customer logged in')
    }

    isLoading.value = true
    error.value = null

    try {
      const firebaseUser = auth.currentUser
      if (!firebaseUser || !firebaseUser.email) {
        throw new Error('No authenticated user')
      }

      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(
        firebaseUser.email,
        currentPassword
      )
      
      await reauthenticateWithCredential(firebaseUser, credential)
      
      // Update password
      await updatePassword(firebaseUser, newPassword)

      authNotification.loggedIn('Password updated successfully')
    } catch (err: any) {
      console.error('❌ Error changing password:', err)
      
      // Handle specific errors
      if (err.code === 'auth/wrong-password') {
        error.value = 'Current password is incorrect'
      } else if (err.code === 'auth/weak-password') {
        error.value = 'New password is too weak'
      } else {
        error.value = err.message || 'Failed to change password'
      }
      
      authNotification.error(error.value || 'Password change failed')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Add address to customer
  const addCustomerAddress = async (address: any): Promise<void> => {
    if (!customer.value) {
      throw new Error('No customer logged in')
    }

    isLoading.value = true
    error.value = null

    try {
      const customerRef = doc(db, 'customers', customer.value.uid)
      
      // Generate a unique ID for the address
      const addressWithId = {
        ...address,
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }

      await updateDoc(customerRef, {
        addresses: arrayUnion(addressWithId),
        updatedAt: serverTimestamp()
      })

      // Update local state
      if (!customer.value.addresses) {
        customer.value.addresses = []
      }
      customer.value.addresses.push(addressWithId)

      authNotification.loggedIn('Address added successfully')
    } catch (err: any) {
      console.error('❌ Error adding address:', err)
      error.value = err.message
      authNotification.error('Failed to add address')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Update customer address
  const updateCustomerAddress = async (addressId: string, updatedAddress: any): Promise<void> => {
    if (!customer.value) {
      throw new Error('No customer logged in')
    }

    isLoading.value = true
    error.value = null

    try {
      const customerRef = doc(db, 'customers', customer.value.uid)
      
      // Get current addresses
      const currentAddresses = customer.value.addresses || []
      
      // Find and update the specific address
      const updatedAddresses = currentAddresses.map(addr => 
        addr.id === addressId ? { ...addr, ...updatedAddress, id: addressId } : addr
      )

      await updateDoc(customerRef, {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp()
      })

      // Update local state
      customer.value.addresses = updatedAddresses

      authNotification.loggedIn('Address updated successfully')
    } catch (err: any) {
      console.error('❌ Error updating address:', err)
      error.value = err.message
      authNotification.error('Failed to update address')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Remove customer address
  const removeCustomerAddress = async (addressId: string): Promise<void> => {
    if (!customer.value) {
      throw new Error('No customer logged in')
    }

    isLoading.value = true
    error.value = null

    try {
      const customerRef = doc(db, 'customers', customer.value.uid)
      
      // Find the address to remove
      const addressToRemove = (customer.value.addresses || []).find(addr => addr.id === addressId)
      
      if (!addressToRemove) {
        throw new Error('Address not found')
      }

      await updateDoc(customerRef, {
        addresses: arrayRemove(addressToRemove),
        updatedAt: serverTimestamp()
      })

      // Update local state
      customer.value.addresses = (customer.value.addresses || []).filter(addr => addr.id !== addressId)

      authNotification.loggedIn('Address removed successfully')
    } catch (err: any) {
      console.error('❌ Error removing address:', err)
      error.value = err.message
      authNotification.error('Failed to remove address')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Set default address
  const setDefaultAddress = async (addressId: string): Promise<void> => {
    if (!customer.value) {
      throw new Error('No customer logged in')
    }

    isLoading.value = true
    error.value = null

    try {
      const customerRef = doc(db, 'customers', customer.value.uid)
      
      // Update all addresses to set isDefault flag
      const updatedAddresses = (customer.value.addresses || []).map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))

      await updateDoc(customerRef, {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp()
      })

      // Update local state
      customer.value.addresses = updatedAddresses

      authNotification.loggedIn('Default address updated')
    } catch (err: any) {
      console.error('❌ Error setting default address:', err)
      error.value = err.message
      authNotification.error('Failed to set default address')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Upload profile photo
  const uploadProfilePhoto = async (_file: File): Promise<string> => {
    if (!customer.value) {
      throw new Error('No customer logged in')
    }

    isLoading.value = true
    error.value = null

    try {
      // This would typically upload to Firebase Storage
      // For now, we'll return a placeholder
      // FIXED: showInfo expects two arguments (title, message)
      showInfo('Info', 'Photo upload functionality coming soon')
      return ''
    } catch (err: any) {
      console.error('❌ Error uploading photo:', err)
      error.value = err.message
      authNotification.error('Failed to upload photo')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Logout action (clears both admin and customer)
  const logout = async () => {
    isLoading.value = true
    error.value = null
    try {
      await signOut(auth)
      user.value = null
      customer.value = null
      sessionExpiry.value = null
      localStorage.removeItem('luxury_admin_session')
      localStorage.removeItem('luxury_customer_session')
      authNotification.loggedOut()
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Password Reset
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true
      })
    } catch (error) {
      throw error
    }
  }

  // Confirm Password Reset (uses aliased Firebase function)
  const confirmPasswordReset = async (code: string, newPassword: string) => {
    try {
      await firebaseConfirmPasswordReset(auth, code, newPassword)
    } catch (error) {
      throw error
    }
  }

  // Check session/auth state
  const checkAuth = async (force: boolean = false) => {
    // Skip auth check on public pages unless forced
    if (!force && isPublicPath(window.location.pathname)) {
      console.log('🌍 Public page - skipping auth check')
      user.value = null
      customer.value = null
      sessionExpiry.value = null
      return
    }

    isLoading.value = true
    try {
      // Check for existing sessions
      const adminSaved = localStorage.getItem('luxury_admin_session')
      const customerSaved = localStorage.getItem('luxury_customer_session')

      if (adminSaved) {
        try {
          const { user: savedUser, expiry } = JSON.parse(adminSaved)
          if (new Date(expiry) > new Date()) {
            user.value = savedUser
            sessionExpiry.value = new Date(expiry)
            return
          } else {
            localStorage.removeItem('luxury_admin_session')
          }
        } catch (e) {
          localStorage.removeItem('luxury_admin_session')
        }
      }

      if (customerSaved) {
        try {
          const { user: savedUser, expiry } = JSON.parse(customerSaved)
          if (new Date(expiry) > new Date()) {
            customer.value = savedUser
            sessionExpiry.value = new Date(expiry)
            return
          } else {
            localStorage.removeItem('luxury_customer_session')
          }
        } catch (e) {
          localStorage.removeItem('luxury_customer_session')
        }
      }

      return new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            // First check if admin
            const adminData = await getSuperAdminFromFirestore(firebaseUser)
            if (adminData) {
              user.value = adminData
              customer.value = null
              sessionExpiry.value = new Date(Date.now() + 24 * 60 * 60 * 1000)
              localStorage.setItem('luxury_admin_session', JSON.stringify({
                user: user.value,
                expiry: sessionExpiry.value.getTime(),
                timestamp: Date.now()
              }))
            } else {
              // Then check if customer
              const customerData = await getCustomerFromFirestore(firebaseUser)
              if (customerData) {
                customer.value = customerData
                user.value = null
                sessionExpiry.value = new Date(Date.now() + 24 * 60 * 60 * 1000)
                localStorage.setItem('luxury_customer_session', JSON.stringify({
                  user: customer.value,
                  expiry: sessionExpiry.value.getTime(),
                  timestamp: Date.now()
                }))
              } else {
                user.value = null
                customer.value = null
              }
            }
          } else {
            user.value = null
            customer.value = null
            localStorage.removeItem('luxury_admin_session')
            localStorage.removeItem('luxury_customer_session')
          }
          unsubscribe()
          resolve()
        })
      })

    } catch (err) {
      console.error('❌ Auth check failed:', err)
      user.value = null
      customer.value = null
      localStorage.removeItem('luxury_admin_session')
      localStorage.removeItem('luxury_customer_session')
    } finally {
      isLoading.value = false
    }
  }

  // Create initial super-admin
  const createSuperAdmin = async (email: string, password: string, displayName: string) => {
    isLoading.value = true
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      const adminData: AdminUser = {
        uid: firebaseUser.uid,
        email,
        displayName,
        role: 'super-admin',
        photoURL: undefined,
        isActive: true,
        permissions: ['all'],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      }
      await setDoc(doc(db, 'admins', firebaseUser.uid), {
        ...adminData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      console.log('✅ Super-admin created:', adminData.email)
      return adminData
    } catch (err: any) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Refresh session
  const refreshSession = () => {
    const current = user.value || customer.value
    if (!current) return
    
    sessionExpiry.value = new Date(Date.now() + 24 * 60 * 60 * 1000)
    
    if (user.value) {
      localStorage.setItem('luxury_admin_session', JSON.stringify({
        user: user.value,
        expiry: sessionExpiry.value.getTime(),
        timestamp: Date.now()
      }))
    } else if (customer.value) {
      localStorage.setItem('luxury_customer_session', JSON.stringify({
        user: customer.value,
        expiry: sessionExpiry.value.getTime(),
        timestamp: Date.now()
      }))
    }
  }

  // Clear error
  const clearError = () => { error.value = null }

  // Initialize listener
  const init = () => {
    // Only initialize auth listener on non-public pages
    if (isPublicPath(window.location.pathname)) {
      console.log('🌍 Public page - skipping auth listener initialization')
      return
    }

    if (authListenerInitialized.value) return
    
    console.log('🔐 Initializing auth listener for protected page')
    authListenerInitialized.value = true
    
    onAuthStateChanged(auth, async (firebaseUser) => {
      // Skip updates on public pages
      if (isPublicPath(window.location.pathname)) {
        console.log('🌍 Public page - ignoring auth state change')
        return
      }

      if (firebaseUser) {
        // Check if admin first
        const adminData = await getSuperAdminFromFirestore(firebaseUser)
        if (adminData) {
          user.value = adminData
          customer.value = null
        } else {
          // Then check if customer
          const customerData = await getCustomerFromFirestore(firebaseUser)
          if (customerData) {
            customer.value = customerData
            user.value = null
          } else {
            user.value = null
            customer.value = null
          }
        }
      } else {
        user.value = null
        customer.value = null
      }
    })
  }

  // Reset auth state
  const resetAuthState = () => {
    if (isPublicPath(window.location.pathname)) {
      user.value = null
      customer.value = null
      sessionExpiry.value = null
    }
  }

  return {
    // State
    user,
    customer,
    isLoading,
    error,
    lastLogin,
    sessionExpiry,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isCustomer,
    userInitials,
    currentUser,
    sessionTimeLeft,
    
    // Admin Actions
    login,
    createSuperAdmin,
    
    // Customer Actions
    customerLogin,
    customerRegister,
    updateCustomerProfile,
    changeCustomerPassword,
    addCustomerAddress,
    updateCustomerAddress,
    removeCustomerAddress,
    setDefaultAddress,
    uploadProfilePhoto,
    resetPassword,
    confirmPasswordReset,
    
    // Shared Actions
    logout,
    checkAuth,
    refreshSession,
    clearError,
    init,
    resetAuthState
  }
})