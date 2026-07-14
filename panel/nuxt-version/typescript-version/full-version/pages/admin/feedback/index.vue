<script setup lang="ts">
import { feedbackService } from '@/services/admin/misc'
import { FEEDBACK_TYPES, FEEDBACK_TYPE_COLOR } from '@/constants/adminOptions'
import { parseApiError } from '@/utils/adminApi'
import type { Feedback, FeedbackType } from '@/types/admin/misc'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()
const config = useRuntimeConfig()

function mediaUrl(path: string): string {
  if (path.startsWith('http'))
    return path
  const base = (config.public.apiBaseUrl as string).replace(/\/api\/v1\/?$/, '')

  return `${base}${path}`
}

const items = ref<Feedback[]>([])
const total = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const selectedType = ref<FeedbackType | ''>('')
const isLoading = ref(false)
const selectedRows = ref<number[]>([])

const headers = [
  { title: 'From', key: 'from' },
  { title: 'Type', key: 'type' },
  { title: 'Description', key: 'description', sortable: false },
  { title: 'Screenshots', key: 'screenshots', sortable: false },
  { title: 'Date', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function fetchFeedback() {
  isLoading.value = true
  try {
    const res = await feedbackService.list({
      page: page.value,
      page_size: itemsPerPage.value,
      type: selectedType.value || undefined,
    })

    items.value = res.results
    total.value = res.count
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    isLoading.value = false
  }
}
await fetchFeedback()
watch([page, itemsPerPage, selectedType], () => {
  fetchFeedback()
})

const confirmVisible = ref(false)
const deleteLoading = ref(false)
const bulk = ref(false)
const pending = ref<Feedback | null>(null)

function askDelete(f: Feedback) {
  pending.value = f
  bulk.value = false
  confirmVisible.value = true
}

function askBulkDelete() {
  if (selectedRows.value.length) {
    bulk.value = true
    confirmVisible.value = true
  }
}

async function performDelete() {
  deleteLoading.value = true
  try {
    if (bulk.value) {
      const res = await feedbackService.bulkDelete(selectedRows.value)

      success(res.message || 'Feedback deleted')
      selectedRows.value = []
    }
    else if (pending.value) {
      await feedbackService.remove(pending.value.id)
      success('Feedback deleted')
    }
    confirmVisible.value = false
    fetchFeedback()
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    deleteLoading.value = false
  }
}

const previewImage = ref<string | null>(null)
</script>

<template>
  <section>
    <VCard
      title="Feedback"
      class="mb-6"
    >
      <VCardText class="d-flex flex-wrap gap-4 align-center">
        <div style="inline-size: 260px;">
          <AppSelect
            v-model="selectedType"
            label="Type"
            placeholder="All types"
            :items="FEEDBACK_TYPES"
            clearable
            clear-icon="tabler-x"
          />
        </div>
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
      </VCardText>

      <VDivider />

      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:model-value="selectedRows"
        v-model:page="page"
        :items="items"
        item-value="id"
        :items-length="total"
        :headers="headers"
        :loading="isLoading"
        show-select
        class="text-no-wrap"
      >
        <template #item.from="{ item }">
          <div class="d-flex flex-column">
            <span class="font-weight-medium">{{ item.user || 'Anonymous' }}</span>
            <span class="text-sm text-medium-emphasis">{{ item.email }}</span>
          </div>
        </template>

        <template #item.type="{ item }">
          <VChip
            :color="FEEDBACK_TYPE_COLOR[item.type]"
            size="small"
            label
            class="text-capitalize"
          >
            {{ item.type }}
          </VChip>
        </template>

        <template #item.description="{ item }">
          <div
            class="text-wrap"
            style="max-inline-size: 360px;"
          >
            {{ item.description }}
          </div>
        </template>

        <template #item.screenshots="{ item }">
          <div class="d-flex gap-1">
            <VAvatar
              v-for="s in item.screenshots"
              :key="s.id"
              size="34"
              rounded
              class="cursor-pointer border"
              @click="previewImage = mediaUrl(s.image)"
            >
              <VImg :src="mediaUrl(s.image)" />
            </VAvatar>
            <span
              v-if="!item.screenshots.length"
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
            No feedback.
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
      title="Delete feedback"
      :message="bulk ? `Delete ${selectedRows.length} selected feedback items?` : 'Delete this feedback item?'"
      confirm-text="Delete"
      :loading="deleteLoading"
      @confirm="performDelete"
    />
  </section>
</template>
