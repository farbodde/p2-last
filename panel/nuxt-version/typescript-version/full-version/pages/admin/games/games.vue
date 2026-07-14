<script setup lang="ts">
import GameForm from '@/views/admin/games/GameForm.vue'
import {
  categoriesService,
  gamesService,
  platformsService,
} from '@/services/admin/games'
import { mediaUrl, parseApiError } from '@/utils/adminApi'
import type { Category, Game, GameWritePayload, Platform } from '@/types/admin/games'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()

const items = ref<Game[]>([])
const total = ref(0)
const page = ref(1)
const itemsPerPage = ref(10)
const isLoading = ref(false)

const platforms = ref<Platform[]>([])
const categories = ref<Category[]>([])

const headers = [
  { title: 'Cover', key: 'cover', sortable: false },
  { title: 'Title', key: 'title' },
  { title: 'Platforms', key: 'platforms', sortable: false },
  { title: 'Categories', key: 'categories', sortable: false },
  { title: 'Actions', key: 'actions', sortable: false },
]

async function fetchItems() {
  isLoading.value = true
  try {
    const res = await gamesService.list({ page: page.value, page_size: itemsPerPage.value })
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

async function loadRefs() {
  try {
    const [p, c] = await Promise.all([
      platformsService.list({ page: 1, page_size: 100 }),
      categoriesService.list({ page: 1, page_size: 100 }),
    ])
    platforms.value = p.results
    categories.value = c.results
  }
  catch { /* non-blocking */ }
}

await loadRefs()
await fetchItems()
watch([page, itemsPerPage], fetchItems)

// Create/edit dialog
const dialog = ref(false)
const mode = ref<'create' | 'edit'>('create')
const editing = ref<Game | null>(null)
const saving = ref(false)
const serverErrors = ref<Record<string, string[]>>({})

function openCreate() {
  mode.value = 'create'
  editing.value = null
  serverErrors.value = {}
  dialog.value = true
}

async function openEdit(g: Game) {
  mode.value = 'edit'
  serverErrors.value = {}
  // Fetch full detail (nested categories/items) before editing.
  try {
    editing.value = await gamesService.detail(g.id)
    dialog.value = true
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
}

async function onSubmit(payload: GameWritePayload) {
  saving.value = true
  serverErrors.value = {}
  try {
    if (mode.value === 'edit' && editing.value)
      await gamesService.update(editing.value.id, payload)
    else
      await gamesService.create(payload)
    success(mode.value === 'edit' ? 'Game updated' : 'Game created')
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
const pending = ref<Game | null>(null)

function askDelete(g: Game) {
  pending.value = g
  confirmVisible.value = true
}

async function performDelete() {
  if (!pending.value)
    return
  deleteLoading.value = true
  try {
    await gamesService.remove(pending.value.id)
    success('Game deleted')
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
    <VCard title="Games">
      <VCardText class="d-flex">
        <VSpacer />
        <VBtn
          prepend-icon="tabler-plus"
          @click="openCreate"
        >
          Add Game
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
        <template #item.cover="{ item }">
          <VAvatar
            size="44"
            rounded
            :variant="!item.cover ? 'tonal' : undefined"
          >
            <VImg
              v-if="item.cover"
              :src="mediaUrl(item.cover)"
            />
            <VIcon
              v-else
              icon="tabler-device-gamepad-2"
            />
          </VAvatar>
        </template>
        <template #item.platforms="{ item }">
          <div class="d-flex gap-1 flex-wrap">
            <VChip
              v-for="p in item.platforms"
              :key="p.id"
              size="x-small"
              label
            >
              {{ p.title }}
            </VChip>
            <VChip
              v-if="item.is_cross_platform"
              size="x-small"
              color="info"
              label
            >
              Cross-play
            </VChip>
          </div>
        </template>
        <template #item.categories="{ item }">
          <span class="text-sm text-medium-emphasis">{{ item.categories?.length || 0 }} categories</span>
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
            No games yet.
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
      max-width="820"
      scrollable
    >
      <VCard :title="mode === 'edit' ? 'Edit game' : 'Add game'">
        <VCardText style="max-block-size: 70vh;">
          <GameForm
            :mode="mode"
            :initial="editing"
            :platforms="platforms"
            :categories="categories"
            :submitting="saving"
            :server-errors="serverErrors"
            @submit="onSubmit"
            @cancel="dialog = false"
          />
        </VCardText>
      </VCard>
    </VDialog>

    <AdminConfirmDialog
      v-model="confirmVisible"
      title="Delete game"
      :message="`Delete game '${pending?.title}'?`"
      confirm-text="Delete"
      :loading="deleteLoading"
      @confirm="performDelete"
    />
  </section>
</template>
