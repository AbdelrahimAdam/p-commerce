// stores/admin.ts – SUPABASE VERSION (FINAL)
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/supabase/client'
import type { AdminUser, CreateAdminDto, UpdateAdminDto } from '@/types/admin'
import { useAuthStore } from './auth'

export const useAdminStore = defineStore('admin', () => {
  const authStore = useAuthStore()

  const admins = ref<AdminUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const stats = ref({
    total: 0,
    superAdmins: 0,
    activeAdmins: 0,
    inactiveAdmins: 0
  })

  // Helper to convert Supabase row to AdminUser
  const rowToAdmin = (row: any): AdminUser => ({
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    tenantId: row.tenant_id,
    photoURL: row.photo_url,
    isActive: row.is_active,
    permissions: row.permissions,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login
  })

  // Update local stats from admins array
  const updateStats = () => {
    stats.value = {
      total: admins.value.length,
      superAdmins: admins.value.filter(admin => admin.role === 'super-admin').length,
      activeAdmins: admins.value.filter(admin => admin.isActive).length,
      inactiveAdmins: admins.value.filter(admin => !admin.isActive).length
    }
  }

  // Fetch all admins for the current tenant
  const fetchAdmins = async () => {
    loading.value = true
    error.value = null
    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) {
        admins.value = []
        updateStats()
        return
      }

      const { data, error: fetchError } = await supabase
        .from('admins')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      admins.value = (data || []).map(rowToAdmin)
      updateStats()
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch admins'
      console.error('Error fetching admins:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Create new admin – two‑step: Auth sign‑up then insert admin record
  const createAdmin = async (adminData: CreateAdminDto) => {
    loading.value = true
    error.value = null
    try {
      const tenantId = adminData.tenantId || authStore.currentTenant
      if (!tenantId) {
        throw new Error('Tenant ID is required to create an admin')
      }

      // 1. Create the user in Supabase Auth
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: { displayName: adminData.displayName }
        }
      })
      if (signUpError) throw signUpError
      if (!signUpData.user) throw new Error('User creation failed')

      const userId = signUpData.user.id

      // 2. Insert the admin record into the admins table using a database function
      const { error: insertError } = await supabase.rpc('insert_admin_record', {
        _user_id: userId,
        _tenant_id: tenantId,
        _email: adminData.email,
        _display_name: adminData.displayName,
        _role: adminData.role || 'admin',
        _is_active: adminData.isActive !== false
      })
      if (insertError) throw insertError

      const newAdmin: AdminUser = {
        uid: userId,
        email: adminData.email,
        displayName: adminData.displayName,
        role: adminData.role || 'admin',
        tenantId,
        photoURL: adminData.photoURL,
        isActive: adminData.isActive !== false,
        permissions: adminData.permissions || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: null
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

  // Update admin
  const updateAdmin = async (uid: string, updateData: UpdateAdminDto) => {
    loading.value = true
    error.value = null
    try {
      const updatePayload: any = {
        updated_at: new Date().toISOString()
      }
      if (updateData.displayName !== undefined) updatePayload.display_name = updateData.displayName
      if (updateData.role !== undefined) updatePayload.role = updateData.role
      if (updateData.isActive !== undefined) updatePayload.is_active = updateData.isActive
      if (updateData.permissions !== undefined) updatePayload.permissions = updateData.permissions

      const { error: updateError } = await supabase
        .from('admins')
        .update(updatePayload)
        .eq('id', uid)

      if (updateError) throw updateError

      const index = admins.value.findIndex(admin => admin.uid === uid)
      if (index !== -1) {
        admins.value[index] = { ...admins.value[index], ...updateData, updatedAt: new 
Date().toISOString() }
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

  // Delete admin
  const deleteAdmin = async (uid: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: deleteError } = await supabase
        .from('admins')
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

  // Reset admin password – uses Supabase's built‑in password reset
  const resetAdminPassword = async (email: string) => {
    loading.value = true
    error.value = null
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
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

  // Get admin stats for the current tenant (computed from local admins)
  const fetchAdminStats = async () => {
    // Stats are already updated via fetchAdmins and local updates
    return stats.value
  }

  // Search admins within the current tenant (by display name or email)
  const searchAdmins = async (searchTerm: string) => {
    if (!searchTerm.trim()) return []
    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) return []

      const { data, error: searchError } = await supabase
        .from('admins')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`display_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(20)

      if (searchError) throw searchError

      return (data || []).map(rowToAdmin)
    } catch (err: any) {
      console.error('Error searching admins:', err)
      return []
    }
  }

  // Update last login timestamp (called after successful login)
  const updateLastLogin = async (uid: string) => {
    try {
      const { error: updateError } = await supabase
        .from('admins')
        .update({ last_login: new Date().toISOString(), updated_at: new Date().toISOString() })
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

  // Get admin by ID (from local cache)
  const getAdminById = (uid: string) => {
    return admins.value.find(admin => admin.uid === uid) || null
  }

  return {
    admins,
    loading,
    error,
    stats,
    fetchAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    resetAdminPassword,
    fetchAdminStats,
    searchAdmins,
    updateLastLogin,
    getAdminById
  }
})
