// src/stores/auth.ts – final version with metadata in sign-up
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AdminUser, CustomerUser } from '@/types'
import { supabase } from '@/supabase/client'
import { useTenantStore } from './tenant'
import { authNotification, showInfo } from '@/utils/notifications'

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
  const currentTenant = computed(() => 
    user.value?.tenantId || customer.value?.tenantId || tenantStore.tenantId
  )

  // ========== HELPERS ==========
  const getAdminFromSupabase = async (userId: string): Promise<AdminUser | null> => {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', userId)
      .single()
    if (error || !data) return null
    return {
      uid: data.id,
      email: data.email,
      displayName: data.display_name || data.email,
      role: data.role,
      tenantId: data.tenant_id,
      isActive: data.is_active !== false,
      permissions: data.permissions || ['all'],
      photoURL: data.photo_url,
      phoneNumber: data.phone_number,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastLogin: data.last_login ? new Date(data.last_login) : new Date()
    }
  }

  const getCustomerFromSupabase = async (userId: string): Promise<CustomerUser | null> => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userId)
      .single()
    if (error || !data) return null
    return {
      uid: data.id,
      email: data.email,
      displayName: data.name || data.email,
      tenantId: data.tenant_id,
      photoURL: data.photo_url,
      phoneNumber: data.phone_number,
      addresses: data.addresses || [],
      wishlist: [],
      newsletter: data.newsletter || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
      lastLogin: new Date()
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
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })
      if (signInError || !data.user) throw new Error(signInError?.message || 'Invalid credentials')
      const userId = data.user.id

      // Wait a moment for the session to be available
      await new Promise(resolve => setTimeout(resolve, 500))

      // Fetch admin and customer (RLS will filter appropriately)
      const [adminData, customerData] = await Promise.all([
        getAdminFromSupabase(userId),
        getCustomerFromSupabase(userId)
      ])

      if (adminData) {
        setAdminUser(adminData)
        await supabase.from('admins').update({ last_login: new Date().toISOString() }).eq('id', userId)
        authNotification.loggedIn(adminData.displayName ?? 'Admin')
        console.log('✅ Admin authenticated:', adminData.email)
        return { ...adminData, role: 'admin' }
      }

      if (customerData) {
        setCustomerUser(customerData, credentials.remember)
        await supabase.from('customers').update({
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }).eq('id', userId)
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

      const { error: insertError } = await supabase
        .from('customers')
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
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')

      if (profileData.displayName && user.user_metadata?.displayName !== profileData.displayName) {
        const { error: updateAuthError } = await supabase.auth.updateUser({
          data: { displayName: profileData.displayName }
        })
        if (updateAuthError) throw updateAuthError
      }

      const updateData: any = { updated_at: new Date().toISOString() }
      if (profileData.displayName) updateData.name = profileData.displayName
      if (profileData.phoneNumber !== undefined) updateData.phone_number = profileData.phoneNumber
      if (profileData.newsletter !== undefined) updateData.newsletter = profileData.newsletter

      const { error: updateError } = await supabase
        .from('customers')
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

  // Address management (unchanged)
  const addCustomerAddress = async (address: any): Promise<void> => {
    if (!customer.value) throw new Error('No customer logged in')
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('addresses')
        .eq('id', customer.value.uid)
        .single()
      if (fetchError) throw fetchError

      const current = data?.addresses || []
      const addressWithId = {
        ...address,
        id: `addr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      const newAddresses = [...current, addressWithId]

      const { error: updateError } = await supabase
        .from('customers')
        .update({ addresses: newAddresses, updated_at: new Date().toISOString() })
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

  const updateCustomerAddress = async (addressId: string, updatedAddress: any): Promise<void> => {
    if (!customer.value) throw new Error('No customer logged in')
    isLoading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('addresses')
        .eq('id', customer.value.uid)
        .single()
      if (fetchError) throw fetchError

      const current = data?.addresses || []
      const newAddresses = current.map((addr: any) =>
        addr.id === addressId ? { ...addr, ...updatedAddress, id: addressId } : addr
      )

      const { error: updateError } = await supabase
        .from('customers')
        .update({ addresses: newAddresses, updated_at: new Date().toISOString() })
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
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('addresses')
        .eq('id', customer.value.uid)
        .single()
      if (fetchError) throw fetchError

      const current = data?.addresses || []
      const newAddresses = current.filter((addr: any) => addr.id !== addressId)

      const { error: updateError } = await supabase
        .from('customers')
        .update({ addresses: newAddresses, updated_at: new Date().toISOString() })
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
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('addresses')
        .eq('id', customer.value.uid)
        .single()
      if (fetchError) throw fetchError

      const current = data?.addresses || []
      const newAddresses = current.map((addr: any) => ({
        ...addr,
        isDefault: addr.id === addressId
      }))

      const { error: updateError } = await supabase
        .from('customers')
        .update({ addresses: newAddresses, updated_at: new Date().toISOString() })
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

  // ========== COMPANY REGISTRATION (with metadata and fallback insert) ==========
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
      // Compute tenant ID from company name
      const tenantId = data.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const rootDomain = import.meta.env.VITE_ROOT_DOMAIN
      if (!rootDomain) throw new Error('VITE_ROOT_DOMAIN environment variable is not set')
      const fullDomain = `${data.domain}.${rootDomain}`

      // Create the auth user with metadata (tenant_id, role, displayName)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            displayName: data.displayName,
            tenant_id: tenantId,
            role: 'admin'
          }
        }
      })
      if (signUpError) throw signUpError
      if (!signUpData.user) throw new Error('Failed to create user')
      const userId = signUpData.user.id

      // Ensure session is established (sometimes needed for immediate RLS)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        console.log('Waiting for session to be established...')
        await new Promise(resolve => setTimeout(resolve, 1000))
      }

      // Call the RPC function to create tenant and admin
      const { error: rpcError } = await supabase.rpc('register_company', {
        _tenant_id: tenantId,
        _tenant_name: data.companyName,
        _domain: fullDomain,
        _admin_id: userId,
        _admin_email: data.email,
        _admin_display_name: data.displayName
      })
      if (rpcError) throw rpcError

      // Delete any existing customer record (if any)
      await supabase.from('customers').delete().eq('id', userId)

      // Wait a moment for the transaction to commit
      await new Promise(resolve => setTimeout(resolve, 500))

      // Retry fetching the admin (with exponential backoff)
      let retries = 0
      let admin: AdminUser | null = null
      while (retries < 5 && !admin) {
        if (retries > 0) {
          const delay = Math.min(200 * Math.pow(2, retries - 1), 2000)
          console.log(`Retrying admin fetch (${retries}/5) after ${delay}ms...`)
          await new Promise(r => setTimeout(r, delay))
        }
        admin = await getAdminFromSupabase(userId)
        retries++
      }

      // Fallback: if still not found, insert the admin row directly
      if (!admin) {
        console.warn('Admin record not found after retries – inserting directly')
        const { error: insertError } = await supabase
          .from('admins')
          .insert({
            id: userId,
            tenant_id: tenantId,
            role: 'admin',
            email: data.email,
            display_name: data.displayName,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
            permissions: ['all']
          })
        if (insertError) {
          console.error('Fallback admin insert failed:', insertError)
          throw new Error('Admin document could not be created')
        }
        // Re‑fetch
        admin = await getAdminFromSupabase(userId)
        if (!admin) throw new Error('Admin document not found after insertion')
      }

      setAdminUser(admin)

      console.log('✅ Company registered:', tenantId)
      return { tenantId, uid: userId }
    } catch (err: any) {
      error.value = err.message || 'Registration failed'
      console.error('Company registration error:', err)
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
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw error
  }

  const confirmPasswordReset = async (_code: string, newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  }

  // ========== CHECK AUTH ==========
  const checkAuth = async () => {
    isLoading.value = true
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        user.value = null
        customer.value = null
        return
      }

      const [adminData, customerData] = await Promise.all([
        getAdminFromSupabase(authUser.id),
        getCustomerFromSupabase(authUser.id)
      ])

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
        tenant_id: tenantId,
        email: adminData.email,
        display_name: adminData.displayName,
        role: adminData.role,
        is_active: adminData.isActive,
        permissions: adminData.permissions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      const { error: insertError } = await supabase.from('admins').insert(dbData)
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
    if (authListenerInitialized.value) return
    authListenerInitialized.value = true

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userId = session.user.id
        const [adminData, customerData] = await Promise.all([
          getAdminFromSupabase(userId),
          getCustomerFromSupabase(userId)
        ])
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
    resetAuthState
  }
})