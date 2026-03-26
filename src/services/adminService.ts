// src/services/adminService.ts
import { supabaseSafe } from '@/supabase/client'
import type { AdminUser, CreateAdminDto, UpdateAdminDto } from '@/types/admin'

// Helper to get the Supabase client (throws if null)
const getClient = () => supabaseSafe.client

export class AdminService {
  /**
   * Get all admins – optionally filtered by tenantId
   */
  static async getAdmins(tenantId?: string): Promise<AdminUser[]> {
    try {
      const client = getClient()
      let query = client
        .from('admins')
        .select('*')
        .order('created_at', { ascending: false })

      if (tenantId) {
        query = query.eq('tenant_id', tenantId)
      }

      const { data, error } = await query

      if (error) throw error

      // Cast data to any[] to access properties safely
      return ((data as any[]) || []).map((row: any) => ({
        uid: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        tenantId: row.tenant_id,
        isActive: row.is_active !== false,
        createdAt: row.created_at,
        lastLoginAt: row.last_login || row.created_at,
        permissions: row.permissions || [],
        phoneNumber: row.phone_number
      })) as AdminUser[]
    } catch (error) {
      console.error('Error fetching admins:', error)
      throw new Error('Failed to fetch admins')
    }
  }

  static async getAdminById(uid: string): Promise<AdminUser | null> {
    try {
      const client = getClient()
      const { data, error } = await client
        .from('admins')
        .select('*')
        .eq('id', uid)
        .single()

      if (error || !data) return null

      const row = data as any
      return {
        uid: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        tenantId: row.tenant_id,
        isActive: row.is_active !== false,
        createdAt: row.created_at,
        lastLoginAt: row.last_login || row.created_at,
        permissions: row.permissions || [],
        phoneNumber: row.phone_number
      }
    } catch (error) {
      console.error('Error fetching admin:', error)
      throw new Error('Failed to fetch admin')
    }
  }

  static async createAdmin(adminData: CreateAdminDto): Promise<AdminUser> {
    try {
      const client = getClient()
      // 1. Create user in Supabase Auth
      const { data: authData, error: signUpError } = await client.auth.signUp({
        email: adminData.email,
        password: adminData.password,
        options: {
          data: {
            displayName: adminData.displayName,
            role: adminData.role || 'admin'
          }
        }
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('Failed to create user')

      const userId = authData.user.id

      // 2. Insert into admins table
      const { error: insertError } = await client
        .from('admins')
        .insert({
          id: userId,
          tenant_id: adminData.tenantId,
          email: adminData.email,
          display_name: adminData.displayName,
          role: adminData.role || 'admin',
          is_active: adminData.isActive !== false,
          permissions: adminData.permissions || [],
          phone_number: adminData.phoneNumber || ''
        } as any) // cast to any to bypass strict type checking

      if (insertError) throw insertError

      return {
        uid: userId,
        email: adminData.email,
        displayName: adminData.displayName,
        role: adminData.role || 'admin',
        tenantId: adminData.tenantId,
        isActive: adminData.isActive !== false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        permissions: adminData.permissions || [],
        phoneNumber: adminData.phoneNumber || ''
      }
    } catch (error: any) {
      console.error('Error creating admin:', error)

      if (error.message.includes('already registered')) {
        throw new Error('Email already in use')
      } else if (error.message.includes('invalid email')) {
        throw new Error('Invalid email address')
      } else if (error.message.includes('weak password')) {
        throw new Error('Password is too weak')
      }

      throw new Error('Failed to create admin')
    }
  }

  static async updateAdmin(uid: string, updateData: UpdateAdminDto): Promise<void> {
    try {
      const client = getClient()
      const updatePayload: Record<string, any> = {}

      if (updateData.displayName !== undefined) updatePayload.display_name = updateData.displayName
      if (updateData.role !== undefined) updatePayload.role = updateData.role
      if (updateData.isActive !== undefined) updatePayload.is_active = updateData.isActive
      if (updateData.phoneNumber !== undefined) updatePayload.phone_number = updateData.phoneNumber
      if (updateData.permissions !== undefined) updatePayload.permissions = updateData.permissions

      // Update admins table
      const { error: updateError } = await client
        .from('admins')
        .update(updatePayload)
        .eq('id', uid)

      if (updateError) throw updateError

      // Update display name in Auth metadata if it changed
      if (updateData.displayName) {
        const { data: { user } } = await client.auth.getUser()
        if (user && user.id === uid && user.user_metadata?.displayName !== updateData.displayName) {
          await client.auth.updateUser({
            data: { displayName: updateData.displayName }
          })
        }
      }
    } catch (error) {
      console.error('Error updating admin:', error)
      throw new Error('Failed to update admin')
    }
  }

  static async deleteAdmin(uid: string): Promise<void> {
    try {
      const client = getClient()
      // Don't allow deletion of current user
      const { data: { user } } = await client.auth.getUser()
      if (user?.id === uid) {
        throw new Error('Cannot delete your own account')
      }

      // Delete from admins table
      const { error: deleteError } = await client
        .from('admins')
        .delete()
        .eq('id', uid)

      if (deleteError) throw deleteError

      console.log(`Admin ${uid} deleted successfully`)
    } catch (error: any) {
      console.error('Error deleting admin:', error)
      throw new Error(error.message || 'Failed to delete admin')
    }
  }

  static async resetAdminPassword(email: string): Promise<void> {
    try {
      const client = getClient()
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
    } catch (error: any) {
      console.error('Error resetting password:', error)
      if (error.message.includes('User not found')) {
        throw new Error('User not found')
      }
      throw new Error('Failed to reset password')
    }
  }

  static async getAdminStats(tenantId?: string): Promise<{
    total: number
    superAdmins: number
    activeAdmins: number
    inactiveAdmins: number
  }> {
    try {
      const admins = await this.getAdmins(tenantId)

      return {
        total: admins.length,
        superAdmins: admins.filter(admin => admin.role === 'super-admin').length,
        activeAdmins: admins.filter(admin => admin.isActive).length,
        inactiveAdmins: admins.filter(admin => !admin.isActive).length
      }
    } catch (error) {
      console.error('Error getting admin stats:', error)
      throw new Error('Failed to get admin stats')
    }
  }

  static async searchAdmins(searchTerm: string, tenantId?: string): Promise<AdminUser[]> {
    try {
      const admins = await this.getAdmins(tenantId)

      return admins.filter(admin =>
        admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        admin.phoneNumber?.includes(searchTerm)
      )
    } catch (error) {
      console.error('Error searching admins:', error)
      throw new Error('Failed to search admins')
    }
  }

  static async updateLastLogin(uid: string): Promise<void> {
    try {
      const client = getClient()
      const { error } = await client
        .from('admins')
        .update({ last_login: new Date().toISOString() })
        .eq('id', uid)

      if (error) throw error
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }
}