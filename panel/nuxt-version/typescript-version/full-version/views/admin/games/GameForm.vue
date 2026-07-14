<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { itemsService } from '@/services/admin/games'
import type { Category, Game, GameWritePayload, Item, Platform } from '@/types/admin/games'

interface Props {
  mode: 'create' | 'edit'
  initial?: Game | null
  platforms: Platform[]
  categories: Category[]
  submitting?: boolean
  serverErrors?: Record<string, string[]>
}

const props = withDefaults(defineProps<Props>(), {
  initial: null,
  submitting: false,
  serverErrors: () => ({}),
})

const emit = defineEmits<{
  (e: 'submit', payload: GameWritePayload): void
  (e: 'cancel'): void
}>()

const refForm = ref<VForm>()

interface CategoryRow {
  category: number | null
  unlimited: boolean
  item_limit: number
  items: number[]
}

const title = ref('')
const cover = ref<File | null>(null)
const platformIds = ref<number[]>([])
const rows = ref<CategoryRow[]>([])

const platformOptions = computed(() => props.platforms.map(p => ({ title: p.title, value: p.id })))
const categoryOptions = computed(() => props.categories.map(c => ({ title: c.title, value: c.id })))

// Item options cached per category id.
const itemsByCategory = ref<Record<number, { title: string; value: number }[]>>({})

async function ensureItems(categoryId: number) {
  if (itemsByCategory.value[categoryId])
    return
  try {
    const res = await itemsService.list({ category_id: categoryId, page_size: 100 })
    itemsByCategory.value[categoryId] = res.results.map((i: Item) => ({ title: i.title, value: i.id }))
  }
  catch {
    itemsByCategory.value[categoryId] = []
  }
}

function addRow() {
  rows.value.push({ category: null, unlimited: true, item_limit: -1, items: [] })
}

function removeRow(idx: number) {
  rows.value.splice(idx, 1)
}

async function onCategoryChange(row: CategoryRow) {
  row.items = []
  if (row.category)
    await ensureItems(row.category)
}

// Hydrate from initial (edit).
watch(() => props.initial, async g => {
  if (!g)
    return
  title.value = g.title
  platformIds.value = g.platforms.map(p => p.id)
  rows.value = g.categories.map(c => ({
    category: c.category,
    unlimited: c.item_limit === -1,
    item_limit: c.item_limit === -1 ? 1 : c.item_limit,
    items: c.items.map(i => i.id),
  }))
  await Promise.all(g.categories.map(c => ensureItems(c.category)))
}, { immediate: true })

const fe = (k: string) => props.serverErrors?.[k]?.[0]

async function onSubmit() {
  const { valid } = await refForm.value!.validate()
  if (!valid)
    return

  const categories = rows.value
    .filter(r => r.category != null)
    .map(r => ({
      category: r.category as number,
      item_limit: r.unlimited ? -1 : r.item_limit,
      items: r.items,
    }))

  const payload: GameWritePayload = {
    title: title.value,
    platform_ids: platformIds.value,
    categories,
  }
  if (cover.value)
    payload.cover = cover.value

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
          v-model="title"
          label="Title"
          :rules="[requiredValidator]"
          :error-messages="fe('title')"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <VFileInput
          v-model="cover"
          label="Cover image"
          accept="image/*"
          prepend-icon="tabler-photo"
          :rules="props.mode === 'create' ? [requiredValidator] : []"
          :error-messages="fe('cover')"
        />
      </VCol>
      <VCol cols="12">
        <AppSelect
          v-model="platformIds"
          label="Platforms"
          :items="platformOptions"
          multiple
          chips
          closable-chips
          :error-messages="fe('platform_ids')"
        />
      </VCol>
    </VRow>

    <div class="d-flex align-center mt-4 mb-2">
      <h6 class="text-h6">
        Categories & items
      </h6>
      <VSpacer />
      <VBtn
        size="small"
        variant="tonal"
        prepend-icon="tabler-plus"
        @click="addRow"
      >
        Add category
      </VBtn>
    </div>

    <VAlert
      v-if="fe('categories')"
      type="error"
      variant="tonal"
      class="mb-3"
    >
      {{ fe('categories') }}
    </VAlert>

    <VCard
      v-for="(row, idx) in rows"
      :key="idx"
      variant="outlined"
      class="mb-3"
    >
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="5"
          >
            <AppSelect
              v-model="row.category"
              label="Category"
              :items="categoryOptions"
              @update:model-value="onCategoryChange(row)"
            />
          </VCol>
          <VCol
            cols="6"
            md="3"
            class="d-flex align-center"
          >
            <VSwitch
              v-model="row.unlimited"
              label="Unlimited"
            />
          </VCol>
          <VCol
            v-if="!row.unlimited"
            cols="6"
            md="3"
          >
            <AppTextField
              v-model.number="row.item_limit"
              label="Item limit"
              type="number"
              min="1"
            />
          </VCol>
          <VCol
            cols="12"
            md="1"
            class="d-flex align-center justify-end"
          >
            <IconBtn
              color="error"
              @click="removeRow(idx)"
            >
              <VIcon icon="tabler-trash" />
            </IconBtn>
          </VCol>
          <VCol cols="12">
            <AppSelect
              v-model="row.items"
              label="Items"
              :items="row.category ? (itemsByCategory[row.category] || []) : []"
              :disabled="!row.category"
              multiple
              chips
              closable-chips
              :hint="!row.unlimited && row.items.length > row.item_limit ? `Exceeds limit of ${row.item_limit}` : ''"
              persistent-hint
            />
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <div class="d-flex gap-3 mt-4">
      <VBtn
        type="submit"
        :loading="props.submitting"
      >
        {{ props.mode === 'create' ? 'Create game' : 'Save changes' }}
      </VBtn>
      <VBtn
        color="secondary"
        variant="tonal"
        @click="emit('cancel')"
      >
        Cancel
      </VBtn>
    </div>
  </VForm>
</template>
