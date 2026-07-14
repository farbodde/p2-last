<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { categoriesService } from '@/services/admin/games'
import { parseApiError } from '@/utils/adminApi'
import type { Category } from '@/types/admin/games'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()

const items = ref<Category[]>([])
const total = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const isLoading = ref(false)

const headers = [
  { title: 'Title', key: 'title' },
  { title: 'Item limit', key: 'limit' },
  { title: 'Created', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function fetchItems() {
  isLoading.value = true
  try {
    const res = await categoriesService.list({ page: page.value, page_size: itemsPerPage.value })
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
await fetchItems()
watch([page, itemsPerPage], fetchItems)

function limitLabel(limit: Category['limit']): string {
  if (limit === null || limit === '' || limit === 'unlimited')
    return 'Unlimited'

  return String(limit)
}

// Dialog
const dialog = ref(false)
const editing = ref<Category | null>(null)
const refForm = ref<VForm>()
const title = ref('')
const unlimited = ref(true)
const limit = ref<number | null>(null)
const saving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

function openCreate() {
  editing.value = null
  title.value = ''
  unlimited.value = true
  limit.value = null
  serverErrors.value = {}
  dialog.value = true
}

function openEdit(c: Category) {
  editing.value = c
  title.value = c.title
  const isUnlimited = c.limit === null || c.limit === '' || c.limit === 'unlimited'
  unlimited.value = isUnlimited
  limit.value = isUnlimited ? null : Number(c.limit)
  serverErrors.value = {}
  dialog.value = true
}

async function save() {
  const { valid } = await refForm.value!.validate()
  if (!valid)
    return
  saving.value = true
  serverErrors.value = {}
  const payload = {
    title: title.value,
    limit: unlimited.value ? 'unlimited' : (limit.value ?? 'unlimited'),
  }
  try {
    if (editing.value)
      await categoriesService.update(editing.value.id, payload)
    else
      await categoriesService.create(payload)
    success(editing.value ? 'Category updated' : 'Category created')
    dialog.value = false
    fetchItems()
  }
  catch (err) {
    const parsed = parseApiError(err)
    serverErrors.value = parsed.fields
    notifyError(parsed.message)
  }
  finally {
    saving.value = false
  }
}

const confirmVisible = ref(false)
const deleteLoading = ref(false)
const pending = ref<Category | null>(null)

function askDelete(c: Category) {
  pending.value = c
  confirmVisible.value = true
}

async function performDelete() {
  if (!pending.value)
    return
  deleteLoading.value = true
  try {
    await categoriesService.remove(pending.value.id)
    success('Category deleted')
    confirmVisible.value = false
    fetchItems()
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    deleteLoading.value = false
  }
}
</script>

<template>
  <section>
    <VCard title="Categories">
      <VCardText class="d-flex">
        <VSpacer />
        <VBtn
          prepend-icon="tabler-plus"
          @click="openCreate"
        >
          Add Category
        </VBtn>
      </VCardText>
      <VDivider />
      <VDataTableServer
        v-model:items-per-page="itemsPerPage"
        v-model:page="page"
        :items="items"
        item-value="id"
        :items-length="total"
        :headers="headers"
        :loading="isLoading"
        class="text-no-wrap"
      >
        <template #item.limit="{ item }">
          <VChip
            size="small"
            label
            :color="limitLabel(item.limit) === 'Unlimited' ? 'success' : 'primary'"
          >
            {{ limitLabel(item.limit) }}
          </VChip>
        </template>
        <template #item.created_at="{ item }">
          <span class="text-sm">{{ new Date(item.created_at).toLocaleDateString() }}</span>
        </template>
        <template #item.actions="{ item }">
          <IconBtn @click="openEdit(item)">
            <VIcon icon="tabler-pencil" />
          </IconBtn>
          <IconBtn
            color="error"
            @click="askDelete(item)"
          >
            <VIcon icon="tabler-trash" />
          </IconBtn>
        </template>
        <template #no-data>
          <div class="text-center pa-6 text-medium-emphasis">
            No categories yet.
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
      v-model="dialog"
      max-width="480"
    >
      <VCard :title="editing ? 'Edit category' : 'Add category'">
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="save"
          >
            <AppTextField
              v-model="title"
              label="Title"
              class="mb-4"
              :rules="[requiredValidator]"
              :error-messages="serverErrors.title?.[0]"
            />
            <VSwitch
              v-model="unlimited"
              label="Unlimited items"
              class="mb-2"
            />
            <AppTextField
              v-if="!unlimited"
              v-model.number="limit"
              label="Item limit"
              type="number"
              min="1"
              :rules="[requiredValidator]"
              :error-messages="serverErrors.limit?.[0]"
            />
          </VForm>
        </VCardText>
        <VCardText class="d-flex justify-end gap-3">
          <VBtn
            color="secondary"
            variant="tonal"
            @click="dialog = false"
          >
            Cancel
          </VBtn>
          <VBtn
            :loading="saving"
            @click="save"
          >
            Save
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>

    <AdminConfirmDialog
      v-model="confirmVisible"
      title="Delete category"
      :message="`Delete category '${pending?.title}'?`"
      confirm-text="Delete"
      :loading="deleteLoading"
      @confirm="performDelete"
    />
  </section>
</template>
