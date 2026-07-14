<script setup lang="ts">
import UserForm from '@/views/admin/users/UserForm.vue'
import { usersService } from '@/services/admin/users'
import { parseApiError } from '@/utils/adminApi'
import type { UserCreatePayload } from '@/types/admin/user'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()
const submitting = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

async function onSubmit(payload: Record<string, any>) {
  submitting.value = true
  serverErrors.value = {}
  try {
    const user = await usersService.create(payload as UserCreatePayload)

    success('User created')
    await navigateTo(`/admin/users/${user.username ?? ''}`)
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
        to="/admin/users"
      />
      <h4 class="text-h4">
        Create user
      </h4>
    </div>

    <VCard>
      <VCardText>
        <UserForm
          mode="create"
          :submitting="submitting"
          :server-errors="serverErrors"
          @submit="onSubmit"
          @cancel="navigateTo('/admin/users')"
        />
      </VCardText>
    </VCard>
  </section>
</template>
