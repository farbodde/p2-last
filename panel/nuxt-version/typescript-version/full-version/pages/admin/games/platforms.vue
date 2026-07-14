<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { platformsService } from '@/services/admin/games'
import { mediaUrl, parseApiError } from '@/utils/adminApi'
import type { Platform } from '@/types/admin/games'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()

const items = ref<Platform[]>([])
const total = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const isLoading = ref(false)

const headers = [
  { title: 'Logo', key: 'logo', sortable: false },
  { title: 'Title', key: 'title' },
  { title: 'Created', key: 'created_at' },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function fetchItems() {
  isLoading.value = true
  try {
    const res = await platformsService.list({ page: page.value, page_size: itemsPerPage.value })

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

// Create / edit dialog
const dialog = ref(false)
const editing = ref<Platform | null>(null)
const refForm = ref<VForm>()
const title = ref('')
const logo = ref<File | null>(null)
const saving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

function openCreate() {
  editing.value = null
  title.value = ''
  logo.value = null
  serverErrors.value = {}
  dialog.value = true
}

function openEdit(p: Platform) {
  editing.value = p
  title.value = p.title
  logo.value = null
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
    if (editing.value)
      await platformsService.update(editing.value.id, { title: title.value, logo: logo.value })
    else
      await platformsService.create({ title: title.value, logo: logo.value })
    success(editing.value ? 'Platform updated' : 'Platform created')
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
const pending = ref<Platform | null>(null)

function askDelete(p: Platform) {
  pending.value = p
  confirmVisible.value = true
}

async function performDelete() {
  if (!pending.value)
    return
  deleteLoading.value = true
  try {
    await platformsService.remove(pending.value.id)
    success('Platform deleted')
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
    <VCard title="Platforms">
      <VCardText class="d-flex">
        <VSpacer />
        <VBtn
          prepend-icon="tabler-plus"
          @click="openCreate"
        >
          Add Platform
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
        <template #item.logo="{ item }">
          <VAvatar
            size="40"
            rounded
            :variant="!item.logo ? 'tonal' : undefined"
          >
            <VImg
              v-if="item.logo"
              :src="mediaUrl(item.logo)"
            />
            <VIcon
              v-else
              icon="tabler-device-gamepad"
            />
          </VAvatar>
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
            No platforms yet.
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
      <VCard :title="editing ? 'Edit platform' : 'Add platform'">
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
            <VFileInput
              v-model="logo"
              label="Logo"
              accept="image/*"
              prepend-icon="tabler-photo"
              :rules="editing ? [] : [requiredValidator]"
              :error-messages="serverErrors.logo?.[0]"
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
      title="Delete platform"
      :message="`Delete platform '${pending?.title}'?`"
      confirm-text="Delete"
      :loading="deleteLoading"
      @confirm="performDelete"
    />
  </section>
</template>
