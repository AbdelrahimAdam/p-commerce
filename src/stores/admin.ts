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

  // Convert Supabase row to AdminUser (matches type exactly)
  const rowToAdmin = (row: any): AdminUser => ({
    uid: row.id,
    email: row.email,
    displayName: row.display_name || row.email,
    role: row.role,
    tenantId: row.tenant_id,
    isActive: row.is_active !== false,          // if column exists, else default true
    permissions: row.permissions || [],          // if column exists, else empty
    createdAt: row.created_at,                   // string from database
    lastLoginAt: row.last_login || new Date().toISOString() // fallback to now
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

  const createAdmin = async (adminData: CreateAdminDto): Promise<AdminUser> => {
    loading.value = true
    error.value = null
    try {
      const tenantId = adminData.tenantId || authStore.currentTenant
      if (!tenantId) throw new Error('Tenant ID is required')

      // Create auth user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: { displayName: adminData.displayName }
        }
      })
      if (signUpError) throw signUpError
      if (!signUpData.user) throw new Error('Failed to create user')

      const userId = signUpData.user.id

      // Insert into admins table (only columns that exist in your schema)
      const dbInsert = {
        id: userId,
        tenant_id: tenantId,
        email: adminData.email,
        role: adminData.role || 'admin',
        // These columns may not exist; remove if not in schema:
        // display_name: adminData.displayName,
        // is_active: true,
        // permissions: [],
        // last_login: null
      }

      const { error: insertError } = await supabase
        .from('admins')
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
    loading.value = true
    error.value = null
    try {
      const updatePayload: any = {}
      if (updateData.displayName !== undefined) updatePayload.display_name = updateData.displayName
      if (updateData.role !== undefined) updatePayload.role = updateData.role
      // If the table has these columns, uncomment:
      // if (updateData.isActive !== undefined) updatePayload.is_active = updateData.isActive
      // if (updateData.permissions !== undefined) updatePayload.permissions = updateData.permissions

      if (Object.keys(updatePayload).length === 0) return

      const { error: updateError } = await supabase
        .from('admins')
        .update(updatePayload)
        .eq('id', uid)

      if (updateError) throw updateError

      const index = admins.value.findIndex(admin => admin.uid === uid)
      if (index !== -1) {
        // Merge only the fields that exist in AdminUser type
        const updatedAdmin = {
          ...admins.value[index],
          ...updateData,
          // No 'updatedAt' field in type, so we don't add it
        }
        admins.value[index] = updatedAdmin
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

  const fetchAdminStats = async () => {
    return stats.value
  }

  const searchAdmins = async (searchTerm: string): Promise<AdminUser[]> => {
    if (!searchTerm.trim()) return []
    try {
      const tenantId = authStore.currentTenant
      if (!tenantId) return []

      const { data, error: searchError } = await supabase
        .from('admins')
        .select('*')
        .eq('tenant_id', tenantId)
        .or(`email.ilike.%${searchTerm}%`)
        .limit(20)

      if (searchError) throw searchError
      return (data || []).map(rowToAdmin)
    } catch (err: any) {
      console.error('Error searching admins:', err)
      return []
    }
  }

  const updateLastLogin = async (uid: string) => {
    try {
      // If the table has a `last_login` column, uncomment:
      // const { error: updateError } = await supabase
      //   .from('admins')
      //   .update({ last_login: new Date().toISOString() })
      //   .eq('id', uid)
      // if (updateError) throw updateError

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
