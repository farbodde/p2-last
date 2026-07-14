<script setup lang="ts">
import UserForm from '@/views/admin/users/UserForm.vue'
import { usersService } from '@/services/admin/users'
import { parseApiError } from '@/utils/adminApi'
import type { AdminUser, UserUpdatePayload } from '@/types/admin/user'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const route = useRoute()
const username = computed(() => String((route.params as { username: string }).username))

const { success, error: notifyError } = useSnackbar()
const submitting = ref(false)
const serverErrors = ref<Record<string, string[]>>({})
const user = ref<AdminUser | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    user.value = await usersService.detail(username.value)
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    loading.value = false
  }
}
await load()

async function onSubmit(payload: Record<string, any>) {
  submitting.value = true
  serverErrors.value = {}
  try {
    const updated = await usersService.update(username.value, payload as UserUpdatePayload)

    success('User updated')
    await navigateTo(`/admin/users/${updated.username ?? username.value}`)
  }
  catch (err) {
    const parsed = parseApiError(err)

    serverErrors.value = parsed.fields
    notifyError(parsed.message)
  }
  finally {
    submitting.value = false
  }
}
</script>

<template>
  <section>
    <div class="d-flex align-center gap-x-3 mb-6">
      <VBtn
        icon="tabler-arrow-left"
        variant="text"
        color="default"
        :to="`/admin/users/${username}`"
      />
      <h4 class="text-h4">
        Edit {{ user?.display_name || username }}
      </h4>
    </div>

    <VCard>
      <VCardText>
        <VProgressLinear
          v-if="loading"
          indeterminate
        />
        <UserForm
          v-else
          mode="edit"
          :initial="user"
          :submitting="submitting"
          :server-errors="serverErrors"
          @submit="onSubmit"
          @cancel="navigateTo(`/admin/users/${username}`)"
        />
      </VCardText>
    </VCard>
  </section>
</template>
