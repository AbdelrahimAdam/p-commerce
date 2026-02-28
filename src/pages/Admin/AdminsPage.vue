<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="px-8 py-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 class="text-2xl font-display-en font-bold text-gray-900">
              {{ $t('admin.admins.title') }}
            </h1>
            <p class="text-gray-600 mt-1">
              {{ $t('admin.admins.subtitle') }}
            </p>
          </div>
          <button
            v-if="isSuperAdmin"
            @click="showAddModal = true"
            class="px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {{ $t('admin.admins.addButton') }}
          </button>
        </div>
      </div>
    </div>

    <div class="p-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Admins -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ $t('admin.admins.stats.total') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats.total }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ $t('admin.admins.stats.allAdmins') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Super Admins -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ $t('admin.admins.stats.superAdmins') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats.superAdmins }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ $t('admin.admins.stats.fullAccess') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Active Admins -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ $t('admin.admins.stats.active') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ stats.activeAdmins }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ $t('admin.admins.stats.currentlyActive') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Last Login -->
        <div class="bg-white rounded-xl shadow-luxury p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">{{ $t('admin.admins.stats.lastLogin') }}</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">
                {{ formatTimeAgo(lastLogin) }}
              </p>
              <p class="text-sm text-gray-500 mt-1">
                {{ $t('admin.admins.stats.mostRecent') }}
              </p>
            </div>
            <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Admins Table -->
      <div class="bg-white rounded-xl shadow-luxury overflow-hidden">
        <!-- Filters -->
        <div class="p-6 border-b border-gray-200">
          <div class="flex flex-wrap items-center gap-4">
            <!-- Role Filter -->
            <select
              v-model="roleFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{{ $t('admin.admins.filters.allRoles') }}</option>
              <option value="super-admin">{{ $t('admin.admins.roles.superAdmin') }}</option>
              <option value="admin">{{ $t('admin.admins.roles.admin') }}</option>
            </select>

            <!-- Status Filter -->
            <select
              v-model="statusFilter"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">{{ $t('admin.admins.filters.allStatuses') }}</option>
              <option value="active">{{ $t('admin.admins.status.active') }}</option>
              <option value="inactive">{{ $t('admin.admins.status.inactive') }}</option>
            </select>

            <!-- Search -->
            <div class="relative flex-1 min-w-[200px]">
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="$t('admin.admins.filters.searchPlaceholder')"
                class="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                @input="onSearch"
              />
              <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                   fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </div>

            <!-- Clear Filters -->
            <button
              v-if="hasActiveFilters"
              @click="clearFilters"
              class="px-4 py-2 text-gray-600 hover:text-primary-600"
            >
              {{ $t('admin.admins.filters.clear') }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="p-12 text-center">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          <p class="text-gray-600 mt-4">{{ $t('admin.admins.loading') }}</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-12 text-center">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center justify-center gap-2 text-red-600 mb-2">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="font-medium">{{ $t('admin.admins.error') }}</span>
            </div>
            <p class="text-red-600">{{ error }}</p>
            <button
              @click="refreshData"
              class="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
            >
              {{ $t('admin.admins.retry') }}
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredAdmins.length === 0" class="p-12 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0c-.83.63-1.848.974-2.9.997a4.002 4.002 0 01-4.095-3.991 4 4 0 013.991-4.095c1.023-.023 2.07.367 2.9.997z"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">{{ $t('admin.admins.empty.title') }}</h3>
          <p class="mt-1 text-sm text-gray-500">{{ $t('admin.admins.empty.description') }}</p>
          <div class="mt-6">
            <button
              v-if="isSuperAdmin"
              @click="showAddModal = true"
              class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              {{ $t('admin.admins.addButton') }}
            </button>
          </div>
        </div>

        <!-- Admins Table -->
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('admin.admins.table.admin') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('admin.admins.table.role') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('admin.admins.table.status') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('admin.admins.table.lastLogin') }}
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('admin.admins.table.joined') }}
                </th>
                <th v-if="isSuperAdmin" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ $t('admin.admins.table.actions') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="admin in filteredAdmins" 
                :key="admin.uid"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center gap-3">
                    <div v-if="admin.photoURL" class="w-10 h-10 rounded-full overflow-hidden">
                      <img :src="admin.photoURL" :alt="admin.displayName" class="w-full h-full object-cover">
                    </div>
                    <div v-else class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span class="text-sm font-bold text-gray-600">{{ getInitials(admin.displayName || admin.email) }}</span>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">
                        {{ admin.displayName || $t('admin.admins.table.noName') }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ admin.email }}
                      </div>
                      <div v-if="admin.phoneNumber" class="text-xs text-gray-400 mt-1">
                        {{ admin.phoneNumber }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getRoleClasses(admin.role)" class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ getRoleText(admin.role) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    :class="admin.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'"
                    class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ admin.isActive ? $t('admin.admins.status.active') : $t('admin.admins.status.inactive') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(admin.lastLoginAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(admin.createdAt) }}
                </td>
                <td v-if="isSuperAdmin" class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex items-center gap-2">
                    <button
                      @click="editAdmin(admin)"
                      class="text-primary-600 hover:text-primary-900 p-1"
                      :title="$t('admin.admins.actions.edit')"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      v-if="admin.uid !== currentUserUid"
                      @click="toggleAdminStatus(admin)"
                      class="text-gray-600 hover:text-gray-900 p-1"
                      :title="admin.isActive ? $t('admin.admins.actions.deactivate') : $t('admin.admins.actions.activate')"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path v-if="admin.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      </svg>
                    </button>
                    <button
                      v-if="admin.uid !== currentUserUid"
                      @click="resetAdminPassword(admin)"
                      class="text-amber-600 hover:text-amber-900 p-1"
                      :title="$t('admin.admins.actions.resetPassword')"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                      </svg>
                    </button>
                    <button
                      v-if="admin.uid !== currentUserUid"
                      @click="deleteAdmin(admin)"
                      class="text-red-600 hover:text-red-900 p-1"
                      :title="$t('admin.admins.actions.delete')"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="filteredAdmins.length > 0" class="px-6 py-4 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              {{ $t('admin.admins.pagination.showing') }}
              <span class="font-medium">{{ pagination.startIndex + 1 }}</span>
              {{ $t('admin.admins.pagination.to') }}
              <span class="font-medium">{{ Math.min(pagination.endIndex, filteredAdmins.length) }}</span>
              {{ $t('admin.admins.pagination.of') }}
              <span class="font-medium">{{ filteredAdmins.length }}</span>
              {{ $t('admin.admins.pagination.results') }}
            </div>
            <div class="flex items-center gap-2">
              <button
                @click="previousPage"
                :disabled="pagination.currentPage === 1"
                :class="pagination.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
                class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium"
              >
                {{ $t('admin.admins.pagination.previous') }}
              </button>
              <span class="text-sm text-gray-700">
                {{ $t('admin.admins.pagination.page') }} {{ pagination.currentPage }} {{ $t('admin.admins.pagination.of') }} {{ pagination.totalPages }}
              </span>
              <button
                @click="nextPage"
                :disabled="pagination.currentPage === pagination.totalPages"
                :class="pagination.currentPage === pagination.totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'"
                class="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium"
              >
                {{ $t('admin.admins.pagination.next') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Admin Modal -->
    <AdminModal
      v-if="showAddModal"
      :admin="editingAdmin"
      :is-edit-mode="!!editingAdmin"
      @close="closeModal"
      @save="handleSaveAdmin"
    />

    <!-- Password Reset Confirmation Modal -->
    <div v-if="showResetConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">
                {{ $t('admin.admins.resetPassword.title') }}
              </h3>
              <p class="text-sm text-gray-600">
                {{ resettingAdmin?.email }}
              </p>
            </div>
          </div>
          <p class="text-gray-700 mb-6">
            {{ $t('admin.admins.resetPassword.message') }}
          </p>
          <div class="flex justify-end gap-3">
            <button
              @click="cancelResetPassword"
              class="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              {{ $t('admin.admins.resetPassword.cancel') }}
            </button>
            <button
              @click="confirmResetPassword"
              class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              {{ $t('admin.admins.resetPassword.confirm') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { useAdminStore } from '@/stores/admin'
import type { AdminUser, CreateAdminDto } from '@/types/admin'
import AdminModal from '@/components/Admin/AdminModal.vue' // Fixed: uppercase 'Admin'

export default defineComponent({
  name: 'AdminsPage',
  components: {
    AdminModal
  },
  setup() {
    const { t, locale } = useI18n()
    const authStore = useAuthStore()
    const adminStore = useAdminStore()

    // Refs
    const loading = ref(true)
    const showAddModal = ref(false)
    const showResetConfirm = ref(false)
    const editingAdmin = ref<AdminUser | null>(null)
    const resettingAdmin = ref<AdminUser | null>(null)
    const searchQuery = ref('')
    const roleFilter = ref('')
    const statusFilter = ref('')
    const pagination = ref({
      currentPage: 1,
      itemsPerPage: 10,
      startIndex: 0,
      endIndex: 10,
      totalPages: 1
    })

    // Computed properties
    const isSuperAdmin = computed(() => authStore.user?.role === 'super-admin')
    const currentUserUid = computed(() => authStore.user?.uid)
    const admins = computed(() => adminStore.admins)
    const stats = computed(() => adminStore.stats)
    const error = computed(() => adminStore.error)
    
    // Enrich admins with optional fields to satisfy template
    const enrichedAdmins = computed(() => admins.value.map(admin => admin as any))

    const lastLogin = computed(() => {
      const lastLogins = admins.value
        .filter(admin => admin.lastLoginAt)
        .map(admin => new Date(admin.lastLoginAt).getTime())
      return lastLogins.length > 0 ? Math.max(...lastLogins) : Date.now()
    })

    const filteredAdmins = computed(() => {
      let filtered = [...enrichedAdmins.value]

      // Apply search filter
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(admin =>
          admin.email.toLowerCase().includes(query) ||
          admin.displayName?.toLowerCase().includes(query) ||
          admin.phoneNumber?.includes(query)
        )
      }

      // Apply role filter
      if (roleFilter.value) {
        filtered = filtered.filter(admin => admin.role === roleFilter.value)
      }

      // Apply status filter
      if (statusFilter.value) {
        const isActive = statusFilter.value === 'active'
        filtered = filtered.filter(admin => admin.isActive === isActive)
      }

      return filtered
    })

    const pagedAdmins = computed(() => {
      const startIndex = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
      const endIndex = startIndex + pagination.value.itemsPerPage
      pagination.value.startIndex = startIndex
      pagination.value.endIndex = endIndex
      pagination.value.totalPages = Math.ceil(filteredAdmins.value.length / pagination.value.itemsPerPage)
      
      return filteredAdmins.value.slice(startIndex, endIndex)
    })

    const hasActiveFilters = computed(() => 
      !!searchQuery.value || !!roleFilter.value || !!statusFilter.value
    )

    // Methods
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(part => part.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }

    const getRoleClasses = (role: string) => {
      switch (role) {
        case 'super-admin':
          return 'bg-purple-100 text-purple-800'
        case 'admin':
          return 'bg-blue-100 text-blue-800'
        default:
          return 'bg-gray-100 text-gray-800'
      }
    }

    const getRoleText = (role: string) => {
      switch (role) {
        case 'super-admin':
          return t('admin.admins.roles.superAdmin')
        case 'admin':
          return t('admin.admins.roles.admin')
        default:
          return t('admin.admins.roles.unknown')
      }
    }

    const formatDate = (dateString: string) => {
      if (!dateString) return '-'
      try {
        const date = new Date(dateString)
        
        // Determine available locale - default to English if Arabic not available
        let availableLocale = 'en-US' // Default to English
        
        // Check if current locale is Arabic
        if (locale.value === 'ar') {
          try {
            // Test if Arabic locale is available
            const testDate = new Date()
            const arabicFormatter = new Intl.DateTimeFormat('ar-SA')
            arabicFormatter.format(testDate) // This will throw if locale not available
            availableLocale = 'ar-SA' // Arabic is available
          } catch (error) {
            console.warn('Arabic locale (ar-SA) is not available in this environment. Falling back to English (en-US).')
            // Keep default as 'en-US'
          }
        } else {
          // For non-Arabic locales, use the current locale or fallback to English
          try {
            const testDate = new Date()
            const localeFormatter = new Intl.DateTimeFormat(locale.value)
            localeFormatter.format(testDate)
            availableLocale = locale.value
          } catch {
            availableLocale = 'en-US' // Fallback to English
          }
        }
        
        // Create formatter with the determined locale
        const formatter = new Intl.DateTimeFormat(availableLocale, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
        
        return formatter.format(date)
      } catch (error) {
        console.error('Error formatting date:', error)
        return '-'
      }
    }

    const formatTimeAgo = (timestamp: number) => {
      const now = Date.now()
      const diff = now - timestamp
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(diff / 3600000)
      const days = Math.floor(diff / 86400000)

      if (minutes < 1) {
        return t('admin.admins.time.justNow')
      } else if (minutes < 60) {
        return t('admin.admins.time.minutesAgo', { minutes })
      } else if (hours < 24) {
        return t('admin.admins.time.hoursAgo', { hours })
      } else {
        return t('admin.admins.time.daysAgo', { days })
      }
    }

    const clearFilters = () => {
      searchQuery.value = ''
      roleFilter.value = ''
      statusFilter.value = ''
      pagination.value.currentPage = 1
    }

    const editAdmin = (admin: AdminUser) => {
      editingAdmin.value = { ...admin }
      showAddModal.value = true
    }

    const toggleAdminStatus = async (admin: AdminUser) => {
      try {
        await adminStore.updateAdmin(admin.uid, {
          isActive: !admin.isActive
        })
      } catch (error) {
        console.error('Failed to toggle admin status:', error)
      }
    }

    const resetAdminPassword = (admin: AdminUser) => {
      resettingAdmin.value = admin
      showResetConfirm.value = true
    }

    const confirmResetPassword = async () => {
      if (!resettingAdmin.value) return
      
      try {
        await adminStore.resetAdminPassword(resettingAdmin.value.email)
        alert(t('admin.admins.resetPassword.success'))
        showResetConfirm.value = false
        resettingAdmin.value = null
      } catch (error: any) {
        alert(t('admin.admins.resetPassword.error', { error: error.message }))
      }
    }

    const cancelResetPassword = () => {
      showResetConfirm.value = false
      resettingAdmin.value = null
    }

    const deleteAdmin = async (admin: AdminUser) => {
      if (!confirm(t('admin.admins.confirm.delete'))) return
      
      try {
        await adminStore.deleteAdmin(admin.uid)
      } catch (error: any) {
        alert(t('admin.admins.delete.error', { error: error.message }))
      }
    }

    const closeModal = () => {
      showAddModal.value = false
      editingAdmin.value = null
    }

    const handleSaveAdmin = async (adminData: Partial<AdminUser & { password: string }>) => {
      try {
        if (editingAdmin.value) {
          await adminStore.updateAdmin(editingAdmin.value.uid, adminData)
        } else {
          const createDto: CreateAdminDto = {
            email: adminData.email!,
            displayName: adminData.displayName,
            role: adminData.role!,
            password: adminData.password!,
            isActive: adminData.isActive
          }
          await adminStore.createAdmin(createDto)
        }
        closeModal()
      } catch (error: any) {
        alert(t('admin.admins.save.error', { error: error.message }))
      }
    }

    const nextPage = () => {
      if (pagination.value.currentPage < pagination.value.totalPages) {
        pagination.value.currentPage++
      }
    }

    const previousPage = () => {
      if (pagination.value.currentPage > 1) {
        pagination.value.currentPage--
      }
    }

    const onSearch = () => {
      pagination.value.currentPage = 1
    }

    const refreshData = async () => {
      loading.value = true
      try {
        await adminStore.fetchAdmins()
        await adminStore.fetchAdminStats()
      } catch (error) {
        console.error('Failed to refresh data:', error)
      } finally {
        loading.value = false
      }
    }

    // Watch for filter changes to reset pagination
    watch([searchQuery, roleFilter, statusFilter], () => {
      pagination.value.currentPage = 1
    })

    // Lifecycle
    onMounted(async () => {
      try {
        await adminStore.fetchAdmins()
        await adminStore.fetchAdminStats()
      } catch (error) {
        console.error('Failed to load admins:', error)
      } finally {
        loading.value = false
      }
    })

    return {
      // Refs
      loading,
      showAddModal,
      showResetConfirm,
      editingAdmin,
      resettingAdmin,
      searchQuery,
      roleFilter,
      statusFilter,
      pagination,
      
      // Computed
      isSuperAdmin,
      currentUserUid,
      admins,
      stats,
      error,
      lastLogin,
      filteredAdmins: pagedAdmins,
      hasActiveFilters,
      
      // Methods
      t,
      getInitials,
      getRoleClasses,
      getRoleText,
      formatDate,
      formatTimeAgo,
      clearFilters,
      editAdmin,
      toggleAdminStatus,
      resetAdminPassword,
      confirmResetPassword,
      cancelResetPassword,
      deleteAdmin,
      closeModal,
      handleSaveAdmin,
      nextPage,
      previousPage,
      onSearch,
      refreshData
    }
  }
})
</script>

<style scoped>
.shadow-luxury {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.bg-primary-500 {
  background-color: #3b82f6;
}

.hover\:bg-primary-600:hover {
  background-color: #2563eb;
}

.border-primary-500 {
  border-color: #3b82f6;
}

.focus\:ring-primary-500:focus {
  --tw-ring-color: rgba(59, 130, 246, 0.5);
}
</style>