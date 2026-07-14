<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { categoriesService, filterCategoriesService } from '@/services/admin/games'
import { parseApiError } from '@/utils/adminApi'
import type { Category, FilterCategory } from '@/types/admin/games'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()

const items = ref<FilterCategory[]>([])
const total = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const isLoading = ref(false)

const categories = ref<Category[]>([])
const categoryOptions = computed(() => categories.value.map(c => ({ title: c.title, value: c.id })))
const categoryTitle = (id: number) => categories.value.find(c => c.id === id)?.title ?? `#${id}`

const headers = [
  { title: 'Order', key: 'order' },
  { title: 'Category', key: 'category' },
  { title: 'Active', key: 'is_active' },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function loadCategories() {
  try {
    const res = await categoriesService.list({ page: 1, page_size: 100 })

    categories.value = res.results
  }
  catch { /* non-blocking */ }
}

async function fetchItems() {
  isLoading.value = true
  try {
    const res = await filterCategoriesService.list({ page: page.value, page_size: itemsPerPage.value })

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

await loadCategories()
await fetchItems()
watch([page, itemsPerPage], fetchItems)

// Dialog
const dialog = ref(false)
const editing = ref<FilterCategory | null>(null)
const refForm = ref<VForm>()
const category = ref<number | null>(null)
const isActive = ref(true)
const order = ref(0)
const saving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

function openCreate() {
  editing.value = null
  category.value = null
  isActive.value = true
  order.value = 0
  serverErrors.value = {}
  dialog.value = true
}

function openEdit(fc: FilterCategory) {
  editing.value = fc
  category.value = fc.category
  isActive.value = fc.is_active
  order.value = fc.order
  serverErrors.value = {}
  dialog.value = true
}

async function save() {
  const { valid } = await refForm.value!.validate()
  if (!valid)
    return
  saving.value = true
  serverErrors.value = {}

  const payload = { category: category.value!, is_active: isActive.value, order: order.value }
  try {
    if (editing.value)
      await filterCategoriesService.update(editing.value.id, payload)
    else
      await filterCategoriesService.create(payload)
    success(editing.value ? 'Filter updated' : 'Filter created')
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

// Quick toggle active
async function toggleActive(fc: FilterCategory) {
  try {
    await filterCategoriesService.update(fc.id, { is_active: !fc.is_active })
    fetchItems()
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
}

const confirmVisible = ref(false)
const deleteLoading = ref(false)
const pending = ref<FilterCategory | null>(null)

function askDelete(fc: FilterCategory) {
  pending.value = fc
  confirmVisible.value = true
}

async function performDelete() {
  if (!pending.value)
    return
  deleteLoading.value = true
  try {
    await filterCategoriesService.remove(pending.value.id)
    success('Filter deleted')
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
    <VCard title="Filter categories">
      <VCardText class="d-flex align-center">
        <span class="text-medium-emphasis text-sm">Controls which game categories appear as dynamic filters in the app.</span>
        <VSpacer />
        <VBtn
          prepend-icon="tabler-plus"
          @click="openCreate"
        >
          Add Filter
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
        <template #item.category="{ item }">
          {{ categoryTitle(item.category) }}
        </template>
        <template #item.is_active="{ item }">
          <VSwitch
            :model-value="item.is_active"
            density="compact"
            hide-details
            @update:model-value="toggleActive(item)"
          />
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
            No filter categories configured.
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
      <VCard :title="editing ? 'Edit filter' : 'Add filter'">
        <VCardText>
          <VForm
            ref="refForm"
            @submit.prevent="save"
          >
            <AppSelect
              v-model="category"
              label="Category"
              class="mb-4"
              :items="categoryOptions"
              :disabled="!!editing"
              :rules="[requiredValidator]"
              :error-messages="serverErrors.category?.[0]"
            />
            <AppTextField
              v-model.number="order"
              label="Order"
              type="number"
              min="0"
              class="mb-4"
              :error-messages="serverErrors.order?.[0]"
            />
            <VSwitch
              v-model="isActive"
              label="Active"
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
      title="Delete filter"
      message="Delete this filter category?"
      confirm-text="Delete"
      :loading="deleteLoading"
      @confirm="performDelete"
    />
  </section>
</template>
