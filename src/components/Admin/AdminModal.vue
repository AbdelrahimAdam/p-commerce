<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">
            {{ isEditMode ? $t('admin.modal.editTitle') : $t('admin.modal.addTitle') }}
          </h3>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-500"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="px-6 py-4">
        <!-- Name -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.modal.name') }}
          </label>
          <input
            v-model="formData.displayName"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :placeholder="$t('admin.modal.namePlaceholder')"
            required
          />
        </div>

        <!-- Email -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.modal.email') }}
          </label>
          <input
            v-model="formData.email"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :placeholder="$t('admin.modal.emailPlaceholder')"
            :readonly="isEditMode"
            required
          />
        </div>

        <!-- Phone Number -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.modal.phone') }}
          </label>
          <input
            v-model="formData.phoneNumber"
            type="tel"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :placeholder="$t('admin.modal.phonePlaceholder')"
          />
        </div>

        <!-- Role -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.modal.role') }}
          </label>
          <select
            v-model="formData.role"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="admin">{{ $t('admin.admins.roles.admin') }}</option>
            <option value="super-admin">{{ $t('admin.admins.roles.superAdmin') }}</option>
          </select>
        </div>

        <!-- Status -->
        <div class="mb-6">
          <label class="flex items-center">
            <input
              v-model="formData.isActive"
              type="checkbox"
              class="rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
            <span class="ml-2 text-sm text-gray-700">
              {{ $t('admin.modal.active') }}
            </span>
          </label>
        </div>

        <!-- Password (only for new admins) -->
        <div v-if="!isEditMode" class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            {{ $t('admin.modal.password') }}
          </label>
          <input
            v-model="formData.password"
            type="password"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            :placeholder="$t('admin.modal.passwordPlaceholder')"
            required
            minlength="6"
          />
          <p class="text-xs text-gray-500 mt-1">
            {{ $t('admin.modal.passwordHint') }}
          </p>
        </div>

        <!-- Actions -->
        <div class="sticky bottom-0 bg-white pt-4 border-t border-gray-200">
          <div class="flex justify-end gap-3">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              {{ $t('admin.modal.cancel') }}
            </button>
            <button
              type="submit"
              class="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="isSubmitting"
            >
              <span v-if="isSubmitting" class="flex items-center gap-2">
                <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {{ $t('admin.modal.saving') }}
              </span>
              <span v-else>
                {{ isEditMode ? $t('admin.modal.update') : $t('admin.modal.create') }}
              </span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AdminUser } from '@/types/admin'

export default defineComponent({
  name: 'AdminModal',
  props: {
    admin: {
      type: Object as () => AdminUser | null,
      default: null
    },
    isEditMode: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const { t } = useI18n()

    const formData = ref({
      displayName: '',
      email: '',
      phoneNumber: '',
      role: 'admin',
      isActive: true,
      password: ''
    })

    const isSubmitting = ref(false)

    // Initialize form with admin data if editing
    watch(() => props.admin, (admin) => {
      if (admin) {
        formData.value = {
          displayName: admin.displayName || '',
          email: admin.email,
          // Use type assertion because AdminUser might not have phoneNumber
          phoneNumber: (admin as any).phoneNumber || '',
          role: admin.role,
          isActive: admin.isActive,
          password: ''
        }
      } else {
        formData.value = {
          displayName: '',
          email: '',
          phoneNumber: '',
          role: 'admin',
          isActive: true,
          password: ''
        }
      }
    }, { immediate: true })

    const handleSubmit = async () => {
      isSubmitting.value = true
      try {
        emit('save', formData.value)
      } finally {
        isSubmitting.value = false
      }
    }

    return {
      t,
      formData,
      isSubmitting,
      handleSubmit
    }
  }
})
</script>