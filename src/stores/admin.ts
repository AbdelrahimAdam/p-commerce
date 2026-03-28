// src/stores/admin.ts – UPDATED with safe queries
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabaseSafe, getTable } from '@/supabase/client'
import type { AdminUser, CreateAdminDto, UpdateAdminDto } from '@/types/admin'
import { useAuthStore } from './auth'
import { useTenantStore } from './tenant'

// Helper to get Supabase client (throws if null)
const getClient = () => supabaseSafe.client

export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()

  const admins = ref<AdminUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isInitialized = ref(false)
  const stats = ref({
    total: 0,
    superAdmins: 0,
    activeAdmins: 0,
    inactiveAdmins: 0
  })

  // Check if we're on an admin page
  const isAdminPage = computed(() => {
    const path = window.location.pathname
    return path.startsWith('/admin') && !path.startsWith('/admin/login')
  })

  // Check if user is authenticated as admin
  const isAuthenticatedAdmin = computed(() => {
    return authStore.isAdmin && authStore.isAuthenticated
  })

  // Convert Supabase row to AdminUser
  const rowToAdmin = (row: any): AdminUser => ({
    uid: row.id,
    email: row.email,
    displayName: row.display_name || row.email,
    role: row.role,
    tenantId: row.tenant_id,
    isActive: row.is_active !== false,
    permissions: row.permissions || [],
    createdAt: row.created_at,
    lastLoginAt: row.last_login || new Date().toISOString()
  })

  const updateStats = () => {
    stats.value = {
      total: admins.value.length,
      superAdmins: admins.value.filter(admin => admin.role === 'super-admin').length,
      activeAdmins: admins.value.filter(admin => admin.isActive).length,
      inactiveAdmins: admins.value.filter(admin => !admin.isActive).length
    }
  }

  const fetchAdmins = async () => {
    // Only fetch if we're on an admin page and user is authenticated
    if (!isAdminPage.value || !isAuthenticatedAdmin.value) {
      console.log('🔒 Admin fetch skipped - not on admin page or not authenticated')
      return
    }

    loading.value = true
    error.value = null
    try {
      const tenantId = tenantStore.tenantId || authStore.currentTenant
      if (!tenantId) {
        admins.value = []
        updateStats()
        return
      }

      const client = getClient()
      const { data, error: fetchError } = await client
        .from('admins')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      admins.value = ((data as any[]) || []).map(rowToAdmin)
      updateStats()
      isInitialized.value = true
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch admins'
      console.error('Error fetching admins:', err)
      // Don't throw on public pages
      if (isAdminPage.value) {
        throw err
      }
    } finally {
      loading.value = false
    }
  }

  const createAdmin = async (adminData: CreateAdminDto): Promise<AdminUser> => {
    // Only allow on admin pages with authentication
    if (!isAdminPage.value || !isAuthenticatedAdmin.value) {
      throw new Error('Permission denied: Not authorized')
    }

    loading.value = true
    error.value = null
    try {
      const tenantId = adminData.tenantId || tenantStore.tenantId || authStore.currentTenant
      if (!tenantId) throw new Error('Tenant ID is required')

      const client = getClient()

      // Create auth user
      const { data: signUpData, error: signUpError } = await client.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: { displayName: adminData.displayName }
        }
      })
      if (signUpError) throw signUpError
      if (!signUpData.user) throw new Error('Failed to create user')

      const userId = signUpData.user.id

      // Insert into admins table
      const dbInsert = {
        id: userId,
        tenant_id: tenantId,
        email: adminData.email,
        role: adminData.role || 'admin',
        display_name: adminData.displayName,
        is_active: true,
        permissions: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { error: insertError } = await getTable('admins')
        .insert(dbInsert)

      if (insertError) throw insertError

      const newAdmin: AdminUser = {
        uid: userId,
        email: adminData.email,
        displayName: adminData.displayName,
        role: adminData.role || 'admin',
        tenantId,
        isActive: true,
        permissions: [],
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      }

      admins.value.unshift(newAdmin)
      updateStats()
      return newAdmin
    } catch (err: any) {
      error.value = err.message || 'Failed to create admin'
      console.error('Error creating admin:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const updateAdmin = async (uid: string, updateData: UpdateAdminDto) => {
    // Only allow on admin pages with authentication
    if (!isAdminPage.value || !isAuthenticatedAdmin.value) {
      throw new Error('Permission denied: Not authorized')
    }

    loading.value = true
    error.value = null
    try {
      const updatePayload: any = { updated_at: new Date().toISOString() }
      if (updateData.displayName !== undefined) updatePayload.display_name = updateData.displayName
      if (updateData.role !== undefined) updatePayload.role = updateData.role
      if (updateData.isActive !== undefined) updatePayload.is_active = updateData.isActive
      if (updateData.permissions !== undefined) updatePayload.permissions = updateData.permissions

      if (Object.keys(updatePayload).length === 1) return // only updated_at, nothing else changed

      const { error: updateError } = await getTable('admins')
        .update(updatePayload)
        .eq('id', uid)

      if (updateError) throw updateError

      const index = admins.value.findIndex(admin => admin.uid === uid)
      if (index !== -1) {
        admins.value[index] = {
          ...admins.value[index],
          ...updateData
        }
      }
      updateStats()
    } catch (err: any) {
      error.value = err.message || 'Failed to update admin'
      console.error('Error updating admin:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const deleteAdmin = async (uid: string) => {
    // Only allow on admin pages with authentication
    if (!isAdminPage.value || !isAuthenticatedAdmin.value) {
      throw new Error('Permission denied: Not authorized')
    }

    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await getTable('admins')
        .delete()
        .eq('id', uid)

      if (deleteError) throw deleteError

      admins.value = admins.value.filter(admin => admin.uid !== uid)
      updateStats()
    } catch (err: any) {
      error.value = err.message || 'Failed to delete admin'
      console.error('Error deleting admin:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const resetAdminPassword = async (email: string) => {
    // Only allow on admin pages with authentication
    if (!isAdminPage.value || !isAuthenticatedAdmin.value) {
      throw new Error('Permission denied: Not authorized')
    }

    loading.value = true
    error.value = null
    try {
      const client = getClient()
      const { error: resetError } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (resetError) throw resetError
    } catch (err: any) {
      error.value = err.message || 'Failed to reset password'
      console.error('Error resetting password:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchAdminStats = async () => {
    return stats.value
  }

  const searchAdmins = async (searchTerm: string): Promise<AdminUser[]> => {
    if (!searchTerm.trim()) return []
    
    // Only search on admin pages with authentication
    if (!isAdminPage.value || !isAuthenticatedAdmin.value) {
      return []
    }
    
    try {
      const tenantId = tenantStore.tenantId || authStore.currentTenant
      if (!tenantId) return []

      const client = getClient()
      const { data, error: searchError } = await client
        .from('admins')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`email.ilike.%${searchTerm}%`)
        .limit(20)

      if (searchError) throw searchError
      return ((data as any[]) || []).map(rowToAdmin)
    } catch (err: any) {
      console.error('Error searching admins:', err)
      return []
    }
  }

  const updateLastLogin = async (uid: string) => {
    // Only update on admin pages with authentication
    if (!isAdminPage.value || !isAuthenticatedAdmin.value) {
      return
    }
    
    try {
      const { error: updateError } = await getTable('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', uid)

      if (updateError) throw updateError

      const index = admins.value.findIndex(admin => admin.uid === uid)
      if (index !== -1) {
        admins.value[index].lastLoginAt = new Date().toISOString()
      }
    } catch (err) {
      console.error('Error updating last login:', err)
    }
  }

  const getAdminById = (uid: string) => {
    return admins.value.find(admin => admin.uid === uid) || null
  }

  const initialize = async () => {
    // Only initialize if on admin page and authenticated
    if (isAdminPage.value && isAuthenticatedAdmin.value) {
      await fetchAdmins()
    }
  }

  return {
    admins,
    loading,
    error,
    stats,
    isInitialized,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    resetAdminPassword,
    fetchAdminStats,
    searchAdmins,
    updateLastLogin,
    getAdminById,
    initialize
  }
})
