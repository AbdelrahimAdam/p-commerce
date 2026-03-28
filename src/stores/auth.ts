// src/stores/auth.ts – updated with public page guard
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser, CustomerUser, Address } from '@/types'
import { supabaseSafe } from '@/supabase/client'
import { useTenantStore } from './tenant'
import { authNotification, showInfo } from '@/utils/notifications'

// Define the customer data structure from Supabase
interface SupabaseCustomer {
  id: string
  email: string
  name: string | null
  tenant_id: string
  photo_url: string | null
  phone_number: string | null
  addresses: Address[]
  newsletter: boolean
  created_at: string
  updated_at: string
  last_login?: string | null
}

// Define the admin data structure from Supabase
interface SupabaseAdmin {
  id: string
  user_id: string
  email: string
  display_name: string | null
  role: string
  tenant_id: string
  is_active: boolean
  permissions: string[]
  photo_url: string | null
  phone_number: string | null
  created_at: string
  updated_at: string
  last_login: string | null
}

// ========== PUBLIC PAGE CHECK HELPER ==========
const isPublicPage = (): boolean => {
  if (typeof window === 'undefined') return true
  
  const path = window.location.pathname
  const publicPaths = [
    '/',
    '/login',
    '/admin/login',
    '/register',
    '/register-company',
    '/shop',
    '/products',
    '/categories',
    '/about',
    '/contact',
    '/offers',
    '/brands',
    '/cart',
    '/checkout',
    '/wishlist',
    '/reset-password',
    '/forgot-password'
  ]
  
  return publicPaths.some(publicPath => path === publicPath || path.startsWith(publicPath + '/'))
}

export const useAuthStore = defineStore('auth', () => {
  const tenantStore = useTenantStore()

  const user = ref<AdminUser | null>(null)
  const customer = ref<CustomerUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const lastLogin = ref<Date | null>(null)
  const sessionExpiry = ref<Date | null>(null)
  const authListenerInitialized = ref(false)

  const isAuthenticated = computed(() => !!user.value || !!customer.value)
  const isAdmin = computed(() => !!user.value)
  const isSuperAdmin = computed(() => user.value?.role?.toLowerCase() === 'super-admin')
  const isCustomer = computed(() => !!customer.value)

  const userInitials = computed(() => {
    const name = user.value?.displayName || customer.value?.displayName || ''
    if (name) {
      return name
        .split(' ')
        .map((n: string) => n[0])
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
  const currentTenant = computed(() => 
    user.value?.tenantId || customer.value?.tenantId || tenantStore.tenantId
  )

  // Helper to cast table access (bypass TypeScript strict typing)
  const getTable = (table: string) => supabaseSafe.client.from(table) as any

  // Helper to wait with exponential backoff
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // ========== HELPERS ==========
  const getAdminFromSupabase = async (userId: string, maxRetries: number = 15, initialDelay: number = 1000): Promise<AdminUser | null> => {
    // Skip on public pages
    if (isPublicPage()) {
      return null
    }
    
    let delay = initialDelay

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`  [Attempt ${attempt}/${maxRetries}] Fetching admin for user_id: ${userId}`)

        // Use queryWithAuth to handle unauthenticated state gracefully
        const result = await supabaseSafe.queryWithAuth(
          async (client) => {
            return await client
              .from('admins')
              .select('*')
              .eq('user_id', userId)
              .maybeSingle()
          },
          null // fallback data when not authenticated
        )

        // If not authenticated, return null (no error)
        if (!result.isAuthenticated) {
          console.log('  User not authenticated, skipping admin fetch')
          return null
        }

        if (result.error) {
          console.log(`  Attempt ${attempt} error:`, result.error.message)
        } else if (result.data) {
          console.log(`  ✅ Admin found on attempt ${attempt}!`)
          const adminData = result.data as unknown as SupabaseAdmin
          return {
            uid: adminData.user_id,
            email: adminData.email,
            displayName: adminData.display_name || adminData.email,
            role: adminData.role as 'admin' | 'super-admin',
            tenantId: adminData.tenant_id,
            isActive: adminData.is_active !== false,
            permissions: adminData.permissions || ['all'],
            photoURL: adminData.photo_url || undefined,
            phoneNumber: adminData.phone_number || undefined,
            createdAt: new Date(adminData.created_at),
            updatedAt: new Date(adminData.updated_at),
            lastLogin: adminData.last_login ? new Date(adminData.last_login) : new Date()
          }
        } else {
          console.log(`  Admin not found on attempt ${attempt}`)
        }

        if (attempt < maxRetries) {
          console.log(`  Waiting ${delay}ms before next attempt...`)
          await wait(delay)
          delay = Math.min(delay * 1.2, 5000)
        }
      } catch (err) {
        console.error(`  Error on attempt ${attempt}:`, err)
        if (attempt === maxRetries) return null
        await wait(delay)
        delay = Math.min(delay * 1.2, 5000)
      }
    }

    console.error(`❌ Admin not found after ${maxRetries} attempts`)
    return null
  }

  const getCustomerFromSupabase = async (userId: string): Promise<CustomerUser | null> => {
    // Skip on public pages
    if (isPublicPage()) {
      return null
    }
    
    try {
      // Use queryWithAuth to handle unauthenticated state gracefully
      const result = await supabaseSafe.queryWithAuth(
        async (client) => {
          return await client
            .from('customers')
            .select('*')
            .eq('id', userId)
            .single()
        },
        null // fallback data when not authenticated
      )

      // If not authenticated, return null (no error)
      if (!result.isAuthenticated) {
        console.log('User not authenticated, skipping customer fetch')
        return null
      }

      if (result.error || !result.data) {
        return null
      }

      const customerData = result.data as unknown as SupabaseCustomer
      return {
        uid: customerData.id,
        email: customerData.email,
        displayName: customerData.name || customerData.email,
        tenantId: customerData.tenant_id,
        photoURL: customerData.photo_url || undefined,
        phoneNumber: customerData.phone_number || undefined,
        addresses: customerData.addresses || [],
        wishlist: [],
        newsletter: customerData.newsletter || false,
        createdAt: new Date(customerData.created_at),
        updatedAt: new Date(customerData.updated_at),
        lastLogin: new Date()
      }
    } catch (err) {
      console.error('Error fetching customer:', err)
      return null
    }
  }

  // ========== SESSION MANAGEMENT ==========
  const setAdminUser = (adminData: AdminUser) => {
    user.value = adminData
    customer.value = null
    lastLogin.value = new Date()
    sessionExpiry.value = new Date(Date.now() + 24 * 60 * 60 * 1000)
    localStorage.setItem('luxury_admin_session', JSON.stringify({
      user: adminData,
      expiry: sessionExpiry.value.getTime(),
      timestamp: Date.now()
    }))
  }

  const setCustomerUser = (customerData: CustomerUser, remember?: boolean) => {
    customer.value = customerData
    user.value = null
    lastLogin.value = new Date()
    const sessionDuration = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    sessionExpiry.value = new Date(Date.now() + sessionDuration)
    localStorage.setItem('luxury_customer_session', JSON.stringify({
      user: customerData,
      expiry: sessionExpiry.value.getTime(),
      timestamp: Date.now()
    }))
  }

  // ========== AUTHENTICATION ==========
  const authenticate = async (credentials: { email: string; password: string; remember?: boolean }) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('🔐 Authenticating user:', credentials.email)
      const supabase = supabaseSafe.client
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
      if (signInError || !data.user) throw new Error(signInError?.message || 'Invalid credentials')
      const userId = data.user.id
      console.log('✅ Authenticated, user ID:', userId)

      await wait(1000)

      console.log('🔍 Fetching admin profile with retry...')
      const adminData = await getAdminFromSupabase(userId, 15, 1000)

      if (adminData) {
        setAdminUser(adminData)
        const updateData = { last_login: new Date().toISOString() }
        const { error: updateError } = await getTable('admins')
          .update(updateData)
          .eq('user_id', userId)
        if (updateError) console.warn('Failed to update admin last_login:', updateError)
        authNotification.loggedIn(adminData.displayName ?? 'Admin')
        console.log('✅ Admin authenticated:', adminData.email)

        const pendingRedirect = localStorage.getItem('pending_redirect')
        const pendingTenant = localStorage.getItem('pending_tenant_slug')

        if (pendingRedirect && pendingTenant) {
          console.log('🔄 Found pending tenant redirect:', pendingRedirect)
          localStorage.removeItem('pending_redirect')
          localStorage.removeItem('pending_tenant_slug')
          tenantStore.setTenantAfterRegistration(adminData.tenantId, '', pendingTenant)
          return { ...adminData, role: 'admin', pendingRedirect }
        }

        return { ...adminData, role: 'admin' }
      }

      const customerData = await getCustomerFromSupabase(userId)
      if (customerData) {
        setCustomerUser(customerData, credentials.remember)
        const updateData = {
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        const { error: updateError } = await getTable('customers')
          .update(updateData)
          .eq('id', userId)
        if (updateError) console.warn('Failed to update customer last_login:', updateError)
        authNotification.loggedIn(customerData.displayName ?? 'Customer')
        console.log('✅ Customer authenticated:', customerData.email)
        return { ...customerData, role: 'customer' }
      }

      throw new Error('User profile not found')
    } catch (err: any) {
      console.error('❌ Authentication error:', err)
      error.value = err.message || 'Invalid credentials'
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const login = async (email: string, password: string): Promise<AdminUser> => {
    const result = await authenticate({ email, password, remember: false })
    if (result.role !== 'admin' && result.role !== 'super-admin') {
      throw new Error('Access denied: not an admin')
    }
    return result as AdminUser
  }

  const customerLogin = async (credentials: { email: string; password: string; remember?: boolean }): Promise<CustomerUser> => {
    const result = await authenticate(credentials)
    if (result.role !== 'customer') {
      throw new Error('Please use admin login portal')
    }
    return result as CustomerUser
  }

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
      const supabase = supabaseSafe.client
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            displayName: userData.displayName,
            tenant_id: currentTenant.value,
            role: 'customer'
          }
        }
      })
      if (signUpError) throw signUpError
      if (!signUpData.user) throw new Error('Signup failed')

      const userId = signUpData.user.id

      const tenantId = currentTenant.value
      if (!tenantId) {
        throw new Error('Tenant not resolved. Cannot register customer.')
      }

      const newCustomer: CustomerUser = {
        uid: userId,
        email: userData.email,
        displayName: userData.displayName,
        tenantId,
        photoURL: undefined,
        phoneNumber: userData.phoneNumber,
        addresses: [],
        wishlist: [],
        newsletter: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      }

      const dbData: Record<string, any> = {
        id: userId,
        email: newCustomer.email,
        name: newCustomer.displayName,
        tenant_id: newCustomer.tenantId,
        addresses: newCustomer.addresses,
        newsletter: newCustomer.newsletter,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      if (newCustomer.phoneNumber) dbData.phone_number = newCustomer.phoneNumber

      const { error: insertError } = await getTable('customers')
        .insert(dbData)
      if (insertError) throw insertError

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
  const updateCustomerProfile = async (profileData: {
    displayName?: string
    phoneNumber?: string
    newsletter?: boolean
  }): Promise<void> => {
    if (!customer.value) throw new Error('No customer logged in')
    isLoading.value = true
    error.value = null

    try {
      const supabase = supabaseSafe.client
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('No authenticated user')

      if (profileData.displayName && authUser.user_metadata?.displayName !== profileData.displayName) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          data: { displayName: profileData.displayName }
        })
        if (updateAuthError) throw updateAuthError
      }

      const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
      if (profileData.displayName) updateData.name = profileData.displayName
      if (profileData.phoneNumber !== undefined) updateData.phone_number = profileData.phoneNumber
      if (profileData.newsletter !== undefined) updateData.newsletter = profileData.newsletter

      const { error: updateError } = await getTable('customers')
        .update(updateData)
        .eq('id', customer.value.uid)
      if (updateError) throw updateError

      if (profileData.displayName) customer.value.displayName = profileData.displayName
      if (profileData.phoneNumber !== undefined) customer.value.phoneNumber = profileData.phoneNumber
      if (profileData.newsletter !== undefined) customer.value.newsletter = profileData.newsletter

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

  const changeCustomerPassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    if (!customer.value) throw new Error('No customer logged in')
    isLoading.value = true
    error.value = null

    try {
      const supabase = supabaseSafe.client
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: customer.value.email,
        password: currentPassword
      })
      if (signInError) {
        if (signInError.message.includes('Invalid login')) {
          error.value = 'Current password is incorrect'
          throw new Error(error.value)
        }
        throw signInError
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (updateError) throw updateError

      authNotification.loggedIn('Password updated successfully')
    } catch (err: any) {
      console.error('❌ Error changing password:', err)
      if (!error.value) error.value = err.message || 'Failed to change password'
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Address management
  const addCustomerAddress = async (address: Address): Promise<void> => {
    if (!customer.value) throw new Error('No customer logged in')
    isLoading.value = true
    error.value = null

    try {
      const supabase = supabaseSafe.client
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('addresses')
        .eq('id', customer.value.uid)
        .single()
      if (fetchError) throw fetchError

      const current = (data as any)?.addresses || []
      const addressWithId = {
        ...address,
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      const newAddresses = [...current, addressWithId]

      const updatePayload = { addresses: newAddresses, updated_at: new Date().toISOString() }
      const { error: updateError } = await getTable('customers')
        .update(updatePayload)
        .eq('id', customer.value.uid)
      if (updateError) throw updateError

      customer.value.addresses = newAddresses
      authNotification.loggedIn('Address added successfully')
    } catch (err: any) {
      console.error('❌ Error adding address:', err)
      error.value = err.message
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateCustomerAddress = async (addressId: string, updatedAddress: Partial<Address>): Promise<void> => {
    if (!customer.value) throw new Error('No customer logged in')
    isLoading.value = true
    error.value = null

    try {
      const supabase = supabaseSafe.client
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('addresses')
        .eq('id', customer.value.uid)
        .single()
      if (fetchError) throw fetchError

      const current = (data as any)?.addresses || []
      const newAddresses = current.map((addr: Address) =>
        addr.id === addressId ? { ...addr, ...updatedAddress, id: addressId } : addr
      )

      const updatePayload = { addresses: newAddresses, updated_at: new Date().toISOString() }
      const { error: updateError } = await getTable('customers')
        .update(updatePayload)
        .eq('id', customer.value.uid)
      if (updateError) throw updateError

      customer.value.addresses = newAddresses
      authNotification.loggedIn('Address updated successfully')
    } catch (err: any) {
      console.error('❌ Error updating address:', err)
      error.value = err.message
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const removeCustomerAddress = async (addressId: string): Promise<void> => {
    if (!customer.value) throw new Error('No customer logged in')
    isLoading.value = true
    error.value = null

    try {
      const supabase = supabaseSafe.client
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('addresses')
        .eq('id', customer.value.uid)
        .single()
      if (fetchError) throw fetchError

      const current = (data as any)?.addresses || []
      const newAddresses = current.filter((addr: Address) => addr.id !== addressId)

      const updatePayload = { addresses: newAddresses, updated_at: new Date().toISOString() }
      const { error: updateError } = await getTable('customers')
        .update(updatePayload)
        .eq('id', customer.value.uid)
      if (updateError) throw updateError

      customer.value.addresses = newAddresses
      authNotification.loggedIn('Address removed successfully')
    } catch (err: any) {
      console.error('❌ Error removing address:', err)
      error.value = err.message
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const setDefaultAddress = async (addressId: string): Promise<void> => {
    if (!customer.value) throw new Error('No customer logged in')
    isLoading.value = true
    error.value = null

    try {
      const supabase = supabaseSafe.client
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('addresses')
        .eq('id', customer.value.uid)
        .single()
      if (fetchError) throw fetchError

      const current = (data as any)?.addresses || []
      const newAddresses = current.map((addr: Address) => ({
        ...addr,
        isDefault: addr.id === addressId
      }))

      const updatePayload = { addresses: newAddresses, updated_at: new Date().toISOString() }
      const { error: updateError } = await getTable('customers')
        .update(updatePayload)
        .eq('id', customer.value.uid)
      if (updateError) throw updateError

      customer.value.addresses = newAddresses
      authNotification.loggedIn('Default address updated')
    } catch (err: any) {
      console.error('❌ Error setting default address:', err)
      error.value = err.message
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const uploadProfilePhoto = async (_file: File): Promise<string> => {
    if (!customer.value) throw new Error('No customer logged in')
    isLoading.value = true
    error.value = null
    try {
      showInfo('Info', 'Photo upload functionality coming soon')
      return ''
    } catch (err: any) {
      console.error('❌ Error uploading photo:', err)
      error.value = err.message
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ========== COMPANY REGISTRATION ==========
  const registerCompany = async (data: {
    email: string
    password: string
    displayName: string
    companyName: string
    domain: string
  }) => {
    isLoading.value = true
    error.value = null

    try {
      console.log('🚀 Calling registration API...')

      const response = await fetch('/api/register-company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Registration failed')

      const { tenantId, uid, domain: fullDomain, slug } = result
      console.log('✅ API response:', { tenantId, uid, fullDomain, slug })

      console.log('🔐 Logging in...')
      const supabase = supabaseSafe.client
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      })
      if (signInError) throw signInError
      console.log('✅ Logged in:', signInData.user?.id)

      await wait(2000)

      console.log('🔍 Fetching admin with retry...')
      const admin = await getAdminFromSupabase(uid, 15, 1000)

      if (!admin) {
        console.warn('⚠️ Admin not found after retries. Creating fallback admin.')
        const fallbackAdmin: AdminUser = {
          uid,
          email: data.email,
          displayName: data.displayName,
          role: 'admin',
          tenantId,
          isActive: true,
          permissions: ['all'],
          createdAt: new Date(),
          updatedAt: new Date(),
          lastLogin: new Date()
        }
        setAdminUser(fallbackAdmin)
      } else {
        setAdminUser(admin)
      }

      if (tenantId && slug) {
        const domainToSet = fullDomain || `${slug}.${import.meta.env.VITE_ROOT_DOMAIN}`
        tenantStore.setTenantAfterRegistration(tenantId, domainToSet, slug)
      }

      console.log('✅ Company registered successfully:', tenantId)
      return { tenantId, uid, domain: fullDomain, slug }
    } catch (err: any) {
      console.error('❌ Registration error:', err)
      error.value = err.message || 'Registration failed'
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ========== LOGOUT ==========
  const logout = async () => {
    isLoading.value = true
    error.value = null
    try {
      const supabase = supabaseSafe.client
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) throw signOutError
      user.value = null
      customer.value = null
      sessionExpiry.value = null
      localStorage.removeItem('luxury_admin_session')
      localStorage.removeItem('luxury_customer_session')
      authNotification.loggedOut()
    } catch (err: any) {
      error.value = err.message
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // ========== PASSWORD RESET ==========
  const resetPassword = async (email: string) => {
    const supabase = supabaseSafe.client
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (resetError) throw resetError
  }

  const confirmPasswordReset = async (_code: string, newPassword: string) => {
    const supabase = supabaseSafe.client
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
    if (updateError) throw updateError
  }

  // ========== CHECK AUTH ==========
  const checkAuth = async () => {
    // Skip auth check on public pages
    if (isPublicPage()) {
      console.log('🔒 Public page detected, skipping auth check:', window.location.pathname)
      isLoading.value = false
      return
    }
    
    isLoading.value = true
    try {
      const supabase = supabaseSafe.client
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        user.value = null
        customer.value = null
        return
      }

      // Use queryWithAuth for safe fetching
      const adminData = await getAdminFromSupabase(authUser.id, 3, 500)
      const customerData = await getCustomerFromSupabase(authUser.id)

      if (adminData) {
        setAdminUser(adminData)
      } else if (customerData) {
        setCustomerUser(customerData)
      } else {
        user.value = null
        customer.value = null
      }
    } catch (err) {
      console.error('❌ Auth check failed:', err)
      user.value = null
      customer.value = null
    } finally {
      isLoading.value = false
    }
  }

  // ========== CREATE SUPER ADMIN ==========
  const createSuperAdmin = async (email: string, password: string, displayName: string) => {
    isLoading.value = true
    try {
      const supabase = supabaseSafe.client
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            displayName,
            tenant_id: currentTenant.value,
            role: 'super-admin'
          }
        }
      })
      if (signUpError) throw signUpError
      if (!signUpData.user) throw new Error('Signup failed')
      const userId = signUpData.user.id

      const tenantId = currentTenant.value
      if (!tenantId) throw new Error('Tenant not resolved. Cannot create super-admin.')

      const adminData: AdminUser = {
        uid: userId,
        email,
        displayName,
        role: 'super-admin',
        tenantId,
        isActive: true,
        permissions: ['all'],
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: new Date()
      }

      const dbData = {
        id: userId,
        user_id: userId,
        tenant_id: tenantId,
        email: adminData.email,
        display_name: adminData.displayName,
        role: adminData.role,
        is_active: adminData.isActive,
        permissions: adminData.permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { error: insertError } = await getTable('admins').insert(dbData)
      if (insertError) throw insertError

      console.log('✅ Super-admin created:', adminData.email)
      return adminData
    } catch (err: any) {
      error.value = err.message
      authNotification.error(error.value || '')
      throw err
    } finally {
      isLoading.value = false
    }
  }

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

  const clearError = () => { error.value = null }

  const init = () => {
    // Skip auth listener on public pages
    if (isPublicPage()) {
      console.log('🔒 Public page detected, skipping auth listener:', window.location.pathname)
      return
    }
    
    if (authListenerInitialized.value) return
    authListenerInitialized.value = true

    const supabase = supabaseSafe.client
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userId = session.user.id
        const adminData = await getAdminFromSupabase(userId, 3, 500)
        const customerData = await getCustomerFromSupabase(userId)
        if (adminData) {
          user.value = adminData
          customer.value = null
        } else if (customerData) {
          customer.value = customerData
          user.value = null
        } else {
          user.value = null
          customer.value = null
        }
      } else {
        user.value = null
        customer.value = null
      }
    })
  }

  const resetAuthState = () => {
    user.value = null
    customer.value = null
    sessionExpiry.value = null
  }

  return {
    user,
    customer,
    isLoading,
    error,
    lastLogin,
    sessionExpiry,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isCustomer,
    userInitials,
    currentUser,
    sessionTimeLeft,
    currentTenant,
    login,
    createSuperAdmin,
    registerCompany,
    customerLogin,
    authenticate,
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
    logout,
    checkAuth,
    refreshSession,
    clearError,
    init,
    resetAuthState,
    setAdminUser,
    getAdminFromSupabase
  }
})
