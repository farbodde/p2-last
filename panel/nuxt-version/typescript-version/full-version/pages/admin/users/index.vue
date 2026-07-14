<script setup lang="ts">
import { watchDebounced } from '@vueuse/core'
import { usersService } from '@/services/admin/users'
import { ROLE_COLOR, USER_ROLES } from '@/constants/adminOptions'
import { parseApiError } from '@/utils/adminApi'
import type { AdminUser, UserRole } from '@/types/admin/user'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()
const config = useRuntimeConfig()

// Resolve a possibly-relative media URL from the backend to an absolute one.
function mediaUrl(path: string | null): string | undefined {
  if (!path)
    return undefined
  if (path.startsWith('http'))
    return path
  const base = (config.public.apiBaseUrl as string).replace(/\/api\/v1\/?$/, '')

  return `${base}${path}`
}

// Filters & pagination
const searchQuery = ref('')
const selectedRole = ref<UserRole | ''>('')
const itemsPerPage = ref(10)
const page = ref(1)

const users = ref<AdminUser[]>([])
const totalUsers = ref(0)
const isLoading = ref(false)
const selectedRows = ref<number[]>([])

const headers = [
  { title: 'User', key: 'user' },
  { title: 'Role', key: 'role' },
  { title: 'Contact', key: 'contact', sortable: false },
  { title: 'Status', key: 'status' },
  { title: 'Last activity', key: 'last_activity' },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function fetchUsers() {
  isLoading.value = true
  try {
    const res = await usersService.list({
      page: page.value,
      page_size: itemsPerPage.value,
      search: searchQuery.value || undefined,
      role: selectedRole.value || undefined,
    })

    users.value = res.results
    totalUsers.value = res.count
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    isLoading.value = false
  }
}

await fetchUsers()

watch([page, itemsPerPage, selectedRole], fetchUsers)
watchDebounced(searchQuery, () => {
  page.value = 1
  fetchUsers()
}, { debounce: 400 })

// Inline role change
async function changeRole(user: AdminUser, role: UserRole) {
  if (!user.username) {
    notifyError('This user has no username and cannot have its role changed here.')

    return
  }
  try {
    await usersService.updateRole({ username: user.username, role })
    success(`Role updated to ${role}`)
    fetchUsers()
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
}

// Delete (single + bulk)
const confirmVisible = ref(false)
const deleteLoading = ref(false)
const pendingDelete = ref<AdminUser[]>([])

function askDelete(user: AdminUser) {
  pendingDelete.value = [user]
  confirmVisible.value = true
}

function askBulkDelete() {
  pendingDelete.value = users.value.filter(u => selectedRows.value.includes(u.id))
  if (pendingDelete.value.length)
    confirmVisible.value = true
}

async function performDelete() {
  deleteLoading.value = true
  try {
    for (const u of pendingDelete.value) {
      if (u.username)
        await usersService.remove(u.username)
    }
    success(`${pendingDelete.value.length} user(s) deleted`)
    selectedRows.value = []
    confirmVisible.value = false
    fetchUsers()
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    deleteLoading.value = false
  }
}

const deleteMessage = computed(() =>
  pendingDelete.value.length === 1
    ? `Delete user "${pendingDelete.value[0]?.display_name || pendingDelete.value[0]?.email}"? This cannot be undone.`
    : `Delete ${pendingDelete.value.length} selected users? This cannot be undone.`)
</script>

<template>
  <section>
    <VCard
      title="Users"
      class="mb-6"
    >
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="selectedRole"
              label="Role"
              placeholder="All roles"
              :items="USER_ROLES"
              clearable
              clear-icon="tabler-x"
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <AppTextField
              v-model="searchQuery"
              label="Search"
              placeholder="Email, name or username"
              prepend-inner-icon="tabler-search"
              clearable
            />
          </VCol>
          <VCol
            cols="12"
            sm="4"
          >
            <AppSelect
              v-model="itemsPerPage"
              label="Per page"
              :items="[10, 25, 50, 100]"
            />
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />

      <VCardText class="d-flex flex-wrap gap-4 align-center">
        <VBtn
          v-if="selectedRows.length"
          color="error"
          variant="tonal"
          prepend-icon="tabler-trash"
          @click="askBulkDelete"
        >
          Delete ({{ selectedRows.length }})
        </VBtn>
        <VSpacer />
        <VBtn
          prepend-icon="tabler-plus"
          to="/admin/users/new"
        >
          Add User
        </VBtn>
      </VCardText>

      <VDivider />

      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="users"
        item-value="id"
        :items-length="totalUsers"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
        show-select
      >
        <template #item.user="{ item }">
          <div class="d-flex align-center gap-x-3">
            <VAvatar
              size="34"
              :variant="!item.profile_image ? 'tonal' : undefined"
              :color="!item.profile_image ? ROLE_COLOR[item.role ?? 'player'] : undefined"
            >
              <VImg
                v-if="item.profile_image"
                :src="mediaUrl(item.profile_image)"
              />
              <span v-else>{{ avatarText(item.display_name || item.email) }}</span>
            </VAvatar>
            <div class="d-flex flex-column">
              <NuxtLink
                :to="`/admin/users/${item.username}`"
                class="font-weight-medium text-link"
              >
                {{ item.display_name || '—' }}
              </NuxtLink>
              <span class="text-sm text-medium-emphasis">@{{ item.username || 'no-username' }}</span>
            </div>
          </div>
        </template>

        <template #item.role="{ item }">
          <VChip
            :color="ROLE_COLOR[item.role ?? 'player']"
            size="small"
            label
            class="text-capitalize"
          >
            {{ item.role ?? 'none' }}
          </VChip>
        </template>

        <template #item.contact="{ item }">
          <div class="text-sm">
            {{ item.email }}
          </div>
          <div
            v-if="item.location"
            class="text-xs text-medium-emphasis"
          >
            {{ item.location }}
          </div>
        </template>

        <template #item.status="{ item }">
          <div class="d-flex align-center gap-x-2">
            <VChip
              :color="item.is_active ? 'success' : 'secondary'"
              size="small"
              label
            >
              {{ item.is_active ? 'Active' : 'Inactive' }}
            </VChip>
            <VChip
              v-if="item.is_online"
              color="info"
              size="x-small"
              label
            >
              Online
            </VChip>
            <VIcon
              v-if="item.is_staff"
              icon="tabler-shield-check"
              size="18"
              color="warning"
              title="Staff"
            />
          </div>
        </template>

        <template #item.last_activity="{ item }">
          <span class="text-sm">{{ item.last_activity ? new Date(item.last_activity).toLocaleString() : '—' }}</span>
        </template>

        <template #item.actions="{ item }">
          <IconBtn :to="`/admin/users/${item.username}`">
            <VIcon icon="tabler-eye" />
          </IconBtn>
          <IconBtn :to="`/admin/users/${item.username}/edit`">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn>
            <VIcon icon="tabler-dots-vertical" />
            <VMenu activator="parent">
              <VList>
                <VListSubheader>Change role</VListSubheader>
                <VListItem
                  v-for="r in USER_ROLES"
                  :key="r.value"
                  :disabled="item.role === r.value"
                  @click="changeRole(item, r.value)"
                >
                  <VListItemTitle>{{ r.title }}</VListItemTitle>
                </VListItem>
                <VDivider class="my-1" />
                <VListItem
                  class="text-error"
                  @click="askDelete(item)"
                >
                  <template #prepend>
                    <VIcon icon="tabler-trash" />
                  </template>
                  <VListItemTitle>Delete</VListItemTitle>
                </VListItem>
              </VList>
            </VMenu>
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center pa-6 text-medium-emphasis">
            No users found.
          </div>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="totalUsers"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <AdminConfirmDialog
      v-model="confirmVisible"
      title="Delete users"
      :message="deleteMessage"
      confirm-text="Delete"
      :loading="deleteLoading"
      @confirm="performDelete"
    />
  </section>
</template>
