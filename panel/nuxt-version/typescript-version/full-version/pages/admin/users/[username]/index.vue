<script setup lang="ts">
import { usersService } from '@/services/admin/users'
import { lfgService } from '@/services/admin/misc'
import { ROLE_COLOR, USER_ROLES } from '@/constants/adminOptions'
import { parseApiError } from '@/utils/adminApi'
import type { AdminUser, UserRole } from '@/types/admin/user'
import type { Lfg } from '@/types/admin/misc'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const route = useRoute()
const username = computed(() => String(route.params.username))
const config = useRuntimeConfig()
const { success, error: notifyError } = useSnackbar()

function mediaUrl(path: string | null): string | undefined {
  if (!path)
    return undefined
  if (path.startsWith('http'))
    return path
  const base = (config.public.apiBaseUrl as string).replace(/\/api\/v1\/?$/, '')

  return `${base}${path}`
}

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

// Role change
async function changeRole(role: UserRole) {
  if (!user.value?.username)
    return
  try {
    await usersService.updateRole({ username: user.value.username, role })
    success(`Role updated to ${role}`)
    load()
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
}

// Delete
const confirmVisible = ref(false)
const deleteLoading = ref(false)

async function performDelete() {
  if (!user.value?.username)
    return
  deleteLoading.value = true
  try {
    await usersService.remove(user.value.username)
    success('User deleted')
    await navigateTo('/admin/users')
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    deleteLoading.value = false
  }
}

// LFG posts by this user (admin endpoint). The backend has a known select_related
// bug on this route; we surface it gracefully instead of crashing the page.
const lfgs = ref<Lfg[]>([])
const lfgError = ref<string | null>(null)
const lfgLoading = ref(false)

async function loadLfgs(id: number) {
  lfgLoading.value = true
  lfgError.value = null
  try {
    const res = await lfgService.byUser(id)
    lfgs.value = res.results
  }
  catch (err) {
    lfgError.value = parseApiError(err).message
  }
  finally {
    lfgLoading.value = false
  }
}

watch(user, u => {
  if (u?.id)
    loadLfgs(u.id)
}, { immediate: true })

const infoRows = computed(() => {
  const u = user.value
  if (!u)
    return []

  return [
    { label: 'Email', value: u.email },
    { label: 'Username', value: u.username ? `@${u.username}` : '—' },
    { label: 'Gender', value: u.gender },
    { label: 'Date of birth', value: u.date_of_birth || '—' },
    { label: 'Location', value: u.location || '—' },
    { label: 'Languages', value: u.languages?.length ? u.languages.join(', ') : '—' },
    { label: 'Auth provider', value: (u as any).auth_provider || '—' },
    { label: 'Last login', value: u.last_login ? new Date(u.last_login).toLocaleString() : '—' },
    { label: 'Last activity', value: u.last_activity ? new Date(u.last_activity).toLocaleString() : '—' },
  ]
})
</script>

<template>
  <section>
    <div class="d-flex align-center flex-wrap gap-3 mb-6">
      <VBtn
        icon="tabler-arrow-left"
        variant="text"
        color="default"
        to="/admin/users"
      />
      <h4 class="text-h4">
        User details
      </h4>
      <VSpacer />
      <VBtn
        v-if="user"
        variant="tonal"
        prepend-icon="tabler-pencil"
        :to="`/admin/users/${username}/edit`"
      >
        Edit
      </VBtn>
      <VBtn
        v-if="user"
        color="error"
        variant="tonal"
        prepend-icon="tabler-trash"
        @click="confirmVisible = true"
      >
        Delete
      </VBtn>
    </div>

    <VProgressLinear
      v-if="loading"
      indeterminate
    />

    <VRow v-else-if="user">
      <VCol
        cols="12"
        md="4"
      >
        <VCard>
          <VImg
            v-if="user.cover_image"
            :src="mediaUrl(user.cover_image)"
            height="120"
            cover
          />
          <VCardText class="text-center">
            <VAvatar
              size="88"
              class="mt-n12 mb-3"
              :variant="!user.profile_image ? 'tonal' : undefined"
              :color="!user.profile_image ? ROLE_COLOR[user.role ?? 'player'] : undefined"
            >
              <VImg
                v-if="user.profile_image"
                :src="mediaUrl(user.profile_image)"
              />
              <span
                v-else
                class="text-h5"
              >{{ avatarText(user.display_name || user.email) }}</span>
            </VAvatar>
            <h5 class="text-h5">
              {{ user.display_name || '—' }}
            </h5>
            <div class="d-flex justify-center gap-2 mt-2 flex-wrap">
              <VChip
                :color="ROLE_COLOR[user.role ?? 'player']"
                size="small"
                label
                class="text-capitalize"
              >
                {{ user.role ?? 'none' }}
              </VChip>
              <VChip
                :color="user.is_active ? 'success' : 'secondary'"
                size="small"
                label
              >
                {{ user.is_active ? 'Active' : 'Inactive' }}
              </VChip>
              <VChip
                v-if="user.is_online"
                color="info"
                size="small"
                label
              >
                Online
              </VChip>
              <VChip
                v-if="user.is_staff"
                color="warning"
                size="small"
                label
              >
                Staff
              </VChip>
            </div>
            <p
              v-if="user.about_me"
              class="text-body-2 mt-4 text-medium-emphasis"
            >
              {{ user.about_me }}
            </p>
          </VCardText>

          <VDivider />
          <VCardText>
            <div class="text-subtitle-2 mb-2">
              Manage role
            </div>
            <VBtnToggle
              :model-value="user.role"
              color="primary"
              density="compact"
              class="flex-wrap"
            >
              <VBtn
                v-for="r in USER_ROLES"
                :key="r.value"
                :value="r.value"
                size="small"
                @click="changeRole(r.value)"
              >
                {{ r.title }}
              </VBtn>
            </VBtnToggle>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="8"
      >
        <VCard
          title="Profile"
          class="mb-6"
        >
          <VTable class="text-no-wrap">
            <tbody>
              <tr
                v-for="row in infoRows"
                :key="row.label"
              >
                <td class="font-weight-medium text-medium-emphasis">
                  {{ row.label }}
                </td>
                <td class="text-capitalize">
                  {{ row.value }}
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCard>

        <VCard title="LFG posts by this user">
          <VCardText>
            <VProgressLinear
              v-if="lfgLoading"
              indeterminate
            />
            <VAlert
              v-else-if="lfgError"
              type="warning"
              variant="tonal"
            >
              Could not load this user's LFG posts: {{ lfgError }}
            </VAlert>
            <div
              v-else-if="!lfgs.length"
              class="text-medium-emphasis"
            >
              This user has no LFG posts.
            </div>
            <VList v-else>
              <VListItem
                v-for="lfg in lfgs"
                :key="lfg.id"
              >
                <VListItemTitle>{{ lfg.description || `LFG #${lfg.id}` }}</VListItemTitle>
                <VListItemSubtitle>
                  {{ lfg.created_at ? new Date(lfg.created_at).toLocaleString() : '' }}
                </VListItemSubtitle>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <AdminConfirmDialog
      v-model="confirmVisible"
      title="Delete user"
      :message="`Delete user '${user?.display_name || user?.email}'? This cannot be undone.`"
      confirm-text="Delete"
      :loading="deleteLoading"
      @confirm="performDelete"
    />
  </section>
</template>
