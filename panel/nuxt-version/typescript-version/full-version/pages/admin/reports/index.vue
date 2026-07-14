<script setup lang="ts">
import { reportsService } from '@/services/admin/users'
import { parseApiError } from '@/utils/adminApi'
import type { UserReport } from '@/types/admin/user'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()

const reports = ref<UserReport[]>([])
const total = ref(0)
const page = ref(1)
const itemsPerPage = ref(20)
const isLoading = ref(false)

const headers = [
  { title: 'Reporter', key: 'reporter' },
  { title: 'Reported user', key: 'reported' },
  { title: 'Message', key: 'message', sortable: false },
  { title: 'Evidence', key: 'images', sortable: false },
  { title: 'Date', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function fetchReports() {
  isLoading.value = true
  try {
    const res = await reportsService.list({ page: page.value, page_size: itemsPerPage.value })
    reports.value = res.results
    total.value = res.count
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    isLoading.value = false
  }
}
await fetchReports()
watch([page, itemsPerPage], fetchReports)

const confirmVisible = ref(false)
const deleteLoading = ref(false)
const pending = ref<UserReport | null>(null)

function askDelete(r: UserReport) {
  pending.value = r
  confirmVisible.value = true
}

async function performDelete() {
  if (!pending.value)
    return
  deleteLoading.value = true
  try {
    await reportsService.remove(pending.value.id)
    success('Report deleted')
    confirmVisible.value = false
    fetchReports()
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    deleteLoading.value = false
  }
}

// Lightbox
const previewImage = ref<string | null>(null)
</script>

<template>
  <section>
    <VCard title="User reports">
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="reports"
        item-value="id"
        :items-length="total"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.reporter="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">@{{ item.reporter_username || '—' }}</span>
            <span class="text-sm text-medium-emphasis">{{ item.reporter_email }}</span>
          </div>
        </template>

        <template #item.reported="{ item }">
          <div class="d-flex flex-column">
            <NuxtLink
              v-if="item.reported_user_username"
              :to="`/admin/users/${item.reported_user_username}`"
              class="font-weight-medium text-link"
            >
              @{{ item.reported_user_username }}
            </NuxtLink>
            <span
              v-else
              class="font-weight-medium"
            >—</span>
            <span class="text-sm text-medium-emphasis">{{ item.reported_user_email }}</span>
          </div>
        </template>

        <template #item.message="{ item }">
          <div
            class="text-wrap"
            style="max-inline-size: 320px;"
          >
            {{ item.message }}
          </div>
        </template>

        <template #item.images="{ item }">
          <div class="d-flex gap-1">
            <VAvatar
              v-for="(img, i) in item.image_urls"
              :key="i"
              size="34"
              rounded
              class="cursor-pointer border"
              @click="previewImage = img"
            >
              <VImg :src="img" />
            </VAvatar>
            <span
              v-if="!item.image_urls.length"
              class="text-medium-emphasis text-sm"
            >—</span>
          </div>
        </template>

        <template #item.created_at="{ item }">
          <span class="text-sm">{{ new Date(item.created_at).toLocaleString() }}</span>
        </template>

        <template #item.actions="{ item }">
          <IconBtn
            color="error"
            @click="askDelete(item)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center pa-6 text-medium-emphasis">
            No reports.
          </div>
        </template>

        <template #bottom>
          <TablePagination
            v-model:page="page"
            :items-per-page="itemsPerPage"
            :total-items="total"
          />
        </template>
      </VDataTableServer>
    </VCard>

    <VDialog
      :model-value="!!previewImage"
      max-width="700"
      @update:model-value="previewImage = null"
    >
      <VCard>
        <VImg :src="previewImage!" />
      </VCard>
    </VDialog>

    <AdminConfirmDialog
      v-model="confirmVisible"
      title="Delete report"
      message="Delete this report? This cannot be undone."
      confirm-text="Delete"
      :loading="deleteLoading"
      @confirm="performDelete"
    />
  </section>
</template>
