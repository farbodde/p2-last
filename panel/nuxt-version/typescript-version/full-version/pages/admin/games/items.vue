<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { categoriesService, itemsService } from '@/services/admin/games'
import { mediaUrl, parseApiError } from '@/utils/adminApi'
import type { Category, Item } from '@/types/admin/games'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()

const items = ref<Item[]>([])
const total = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const isLoading = ref(false)
const categoryFilter = ref<number | null>(null)

// Categories for filter + form select
const categories = ref<Category[]>([])
const categoryOptions = computed(() => categories.value.map(c => ({ title: c.title, value: c.id })))

const headers = [
  { title: 'Icon', key: 'icon', sortable: false },
  { title: 'Title', key: 'title' },
  { title: 'Category', key: 'category' },
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
    const res = await itemsService.list({
      page: page.value,
      page_size: itemsPerPage.value,
      category_id: categoryFilter.value ?? undefined,
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

await loadCategories()
await fetchItems()
watch([page, itemsPerPage, categoryFilter], fetchItems)

// Dialog
const dialog = ref(false)
const editing = ref<Item | null>(null)
const refForm = ref<VForm>()
const title = ref('')
const icon = ref<File | null>(null)
const categoryId = ref<number | null>(null)
const saving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

function openCreate() {
  editing.value = null
  title.value = ''
  icon.value = null
  categoryId.value = categoryFilter.value
  serverErrors.value = {}
  dialog.value = true
}

function openEdit(it: Item) {
  editing.value = it
  title.value = it.title
  icon.value = null

  // `category` is a string label on read; match it back to an id when possible.
  categoryId.value = categories.value.find(c => c.title === it.category)?.id ?? null
  serverErrors.value = {}
  dialog.value = true
}

async function save() {
  const { valid } = await refForm.value!.validate()
  if (!valid)
    return
  saving.value = true
  serverErrors.value = {}
  try {
    if (editing.value) {
      await itemsService.update(editing.value.id, {
        title: title.value,
        icon: icon.value,
        category_id: categoryId.value ?? undefined,
      })
    }
    else {
      await itemsService.create({
        title: title.value,
        icon: icon.value,
        category_id: categoryId.value!,
      })
    }
    success(editing.value ? 'Item updated' : 'Item created')
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
const pending = ref<Item | null>(null)

function askDelete(it: Item) {
  pending.value = it
  confirmVisible.value = true
}

async function performDelete() {
  if (!pending.value)
    return
  deleteLoading.value = true
  try {
    await itemsService.remove(pending.value.id)
    success('Item deleted')
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
    <VCard title="Items">
      <VCardText class="d-flex flex-wrap gap-4 align-center">
        <div style="inline-size: 260px;">
          <AppSelect
            v-model="categoryFilter"
            label="Category"
            placeholder="All categories"
            :items="categoryOptions"
            clearable
            clear-icon="tabler-x"
          />
        </div>
        <VSpacer />
        <VBtn
          prepend-icon="tabler-plus"
          @click="openCreate"
        >
          Add Item
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
        <template #item.icon="{ item }">
          <VAvatar
            size="40"
            rounded
            :variant="!item.icon ? 'tonal' : undefined"
          >
            <VImg
              v-if="item.icon"
              :src="mediaUrl(item.icon)"
            />
            <VIcon
              v-else
              icon="tabler-puzzle"
            />
          </VAvatar>
        </template>
        <template #item.category="{ item }">
          <VChip
            size="small"
            label
          >
            {{ item.category }}
          </VChip>
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
            No items yet.
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
      <VCard :title="editing ? 'Edit item' : 'Add item'">
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
            <AppSelect
              v-model="categoryId"
              label="Category"
              class="mb-4"
              :items="categoryOptions"
              :rules="[requiredValidator]"
              :error-messages="serverErrors.category_id?.[0]"
            />
            <VFileInput
              v-model="icon"
              label="Icon"
              accept="image/*"
              prepend-icon="tabler-photo"
              :rules="editing ? [] : [requiredValidator]"
              :error-messages="serverErrors.icon?.[0]"
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
      title="Delete item"
      :message="`Delete item '${pending?.title}'?`"
      confirm-text="Delete"
      :loading="deleteLoading"
      @confirm="performDelete"
    />
  </section>
</template>
