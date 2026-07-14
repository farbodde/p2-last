<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { metaService } from '@/services/admin/misc'
import { GENDERS, USER_ROLES } from '@/constants/adminOptions'
import type { AdminUser, Gender, UserRole } from '@/types/admin/user'

interface Props {
  mode: 'create' | 'edit'
  initial?: AdminUser | null
  submitting?: boolean
  /** field -> messages, from the backend (DRF) on validation failure. */
  serverErrors?: Record<string, string[]>
}

const props = withDefaults(defineProps<Props>(), {
  initial: null,
  submitting: false,
  serverErrors: () => ({}),
})

const emit = defineEmits<{
  (e: 'submit', payload: Record<string, any>): void
  (e: 'cancel'): void
}>()

const refForm = ref<VForm>()

const form = reactive({
  email: '',
  password: '',
  display_name: '',
  username: '',
  about_me: '',
  gender: 'none' as Gender,
  date_of_birth: '' as string | null,
  location: '',
  languages: [] as string[],
  is_active: true,
  role: 'player' as UserRole,
})

const profileImage = ref<File | null>(null)
const coverImage = ref<File | null>(null)

// Language options from the backend meta endpoint.
const languageItems = ref<{ title: string; value: string }[]>([])

onMounted(async () => {
  try {
    const langs = await metaService.languages()
    languageItems.value = langs.map(l => ({ title: l.name, value: l.code }))
  }
  catch {
    languageItems.value = []
  }
})

watch(() => props.initial, u => {
  if (!u)
    return
  form.email = u.email
  form.display_name = u.display_name ?? ''
  form.username = u.username ?? ''
  form.about_me = u.about_me ?? ''
  form.gender = u.gender ?? 'none'
  form.date_of_birth = u.date_of_birth ?? ''
  form.location = u.location ?? ''
  form.languages = u.languages ?? []
  form.is_active = u.is_active
  form.role = u.role ?? 'player'
}, { immediate: true })

function fieldError(name: string): string | undefined {
  return props.serverErrors?.[name]?.[0]
}

async function onSubmit() {
  const { valid } = await refForm.value!.validate()
  if (!valid)
    return

  const payload: Record<string, any> = {
    email: form.email,
    display_name: form.display_name,
    username: form.username || undefined,
    about_me: form.about_me,
    gender: form.gender,
    date_of_birth: form.date_of_birth || null,
    location: form.location,
    languages: form.languages,
    is_active: form.is_active,
    role: form.role,
  }

  if (props.mode === 'create')
    payload.password = form.password

  if (profileImage.value)
    payload.profile_image = profileImage.value
  if (coverImage.value)
    payload.cover_image = coverImage.value

  emit('submit', payload)
}
</script>

<template>
  <VForm
    ref="refForm"
    @submit.prevent="onSubmit"
  >
    <VRow>
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="form.email"
          label="Email"
          type="email"
          :rules="[requiredValidator, emailValidator]"
          :error-messages="fieldError('email')"
        />
      </VCol>
      <VCol
        v-if="props.mode === 'create'"
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="form.password"
          label="Password"
          type="password"
          :rules="[requiredValidator]"
          :error-messages="fieldError('password')"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="form.display_name"
          label="Display name"
          :error-messages="fieldError('display_name')"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="form.username"
          label="Username"
          hint="Min 5 characters; users can change it every 10 days"
          :error-messages="fieldError('username')"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="form.role"
          label="Role"
          :items="USER_ROLES"
          :error-messages="fieldError('role')"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppSelect
          v-model="form.gender"
          label="Gender"
          :items="GENDERS"
          :error-messages="fieldError('gender')"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="form.date_of_birth"
          label="Date of birth"
          type="date"
          :error-messages="fieldError('date_of_birth')"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <AppTextField
          v-model="form.location"
          label="Location"
          :error-messages="fieldError('location')"
        />
      </VCol>
      <VCol cols="12">
        <AppSelect
          v-model="form.languages"
          label="Languages"
          :items="languageItems"
          multiple
          chips
          closable-chips
          hint="Maximum 7 languages"
          :error-messages="fieldError('languages')"
        />
      </VCol>
      <VCol cols="12">
        <AppTextarea
          v-model="form.about_me"
          label="About"
          rows="3"
          :error-messages="fieldError('about_me')"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <VFileInput
          v-model="profileImage"
          label="Profile image"
          accept="image/*"
          prepend-icon="tabler-photo"
          :error-messages="fieldError('profile_image')"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <VFileInput
          v-model="coverImage"
          label="Cover image"
          accept="image/*"
          prepend-icon="tabler-photo"
          :error-messages="fieldError('cover_image')"
        />
      </VCol>
      <VCol cols="12">
        <VSwitch
          v-model="form.is_active"
          label="Active account"
        />
      </VCol>

      <VCol
        cols="12"
        class="d-flex gap-3"
      >
        <VBtn
          type="submit"
          :loading="props.submitting"
        >
          {{ props.mode === 'create' ? 'Create user' : 'Save changes' }}
        </VBtn>
        <VBtn
          color="secondary"
          variant="tonal"
          @click="emit('cancel')"
        >
          Cancel
        </VBtn>
      </VCol>
    </VRow>
  </VForm>
</template>
