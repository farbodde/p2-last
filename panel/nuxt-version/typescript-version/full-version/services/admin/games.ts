// Games catalog + filter categories API service.

import { ADMIN_ENDPOINTS as E } from '@/constants/adminEndpoints'
import type { Paginated } from '@/types/admin/common'
import type {
  Category,
  FilterCategory,
  Game,
  GameMode,
  GameWritePayload,
  Item,
  Platform,
} from '@/types/admin/games'

function pageArgs(query: Record<string, unknown>) {
  const page = (query.page as number) ?? 1
  const pageSize = (query.page_size as number) ?? 10

  return { page, pageSize, query: cleanParams({ ...query, page, page_size: pageSize }) }
}

export const platformsService = {
  async list(query: Record<string, unknown> = {}): Promise<Paginated<Platform>> {
    const { page, pageSize, query: q } = pageArgs(query)

    return normalizePaginated<Platform>(await $api(E.platforms.list, { query: q }), page, pageSize)
  },
  create(payload: { title: string; logo?: File | null }): Promise<Platform> {
    return $api(E.platforms.list, { method: 'POST', body: buildFormData(payload as Record<string, unknown>) })
  },
  update(id: number, payload: { title?: string; logo?: File | null }): Promise<Platform> {
    return $api(E.platforms.detail(id), { method: 'PATCH', body: buildFormData(payload as Record<string, unknown>) })
  },
  remove(id: number): Promise<void> {
    return $api(E.platforms.detail(id), { method: 'DELETE' })
  },
}

export const categoriesService = {
  async list(query: Record<string, unknown> = {}): Promise<Paginated<Category>> {
    const { page, pageSize, query: q } = pageArgs(query)

    return normalizePaginated<Category>(await $api(E.categories.list, { query: q }), page, pageSize)
  },
  create(payload: { title: string; limit: string | number | null }): Promise<Category> {
    return $api(E.categories.list, { method: 'POST', body: cleanParams(payload) })
  },
  update(id: number, payload: { title?: string; limit?: string | number | null }): Promise<Category> {
    return $api(E.categories.detail(id), { method: 'PATCH', body: cleanParams(payload) })
  },
  remove(id: number): Promise<void> {
    return $api(E.categories.detail(id), { method: 'DELETE' })
  },
}

export const itemsService = {
  async list(query: Record<string, unknown> = {}): Promise<Paginated<Item>> {
    const { page, pageSize, query: q } = pageArgs(query)

    return normalizePaginated<Item>(await $api(E.items.list, { query: q }), page, pageSize)
  },
  create(payload: { title: string; icon?: File | null; category_id: number }): Promise<Item> {
    return $api(E.items.list, { method: 'POST', body: buildFormData(payload as Record<string, unknown>) })
  },
  update(id: number, payload: { title?: string; icon?: File | null; category_id?: number }): Promise<Item> {
    return $api(E.items.detail(id), { method: 'PATCH', body: buildFormData(payload as Record<string, unknown>) })
  },
  remove(id: number): Promise<void> {
    return $api(E.items.detail(id), { method: 'DELETE' })
  },
}

/**
 * Encode a Game write payload as multipart/form-data using the nested HTML-form
 * bracket convention that DRF's ListField (`html.parse_html_list`) understands:
 *   title, cover (file),
 *   platform_ids            (repeated keys),
 *   categories[i][category]
 *   categories[i][item_limit]
 *   categories[i][items][j]
 * A plain JSON-string body would NOT be parsed into dicts by the backend
 * serializer (see GameCreateUpdateSerializer._resolve_categories).
 */
function buildGameFormData(payload: Partial<GameWritePayload>): FormData {
  const fd = new FormData()

  if (payload.title !== undefined)
    fd.append('title', payload.title)

  if (payload.cover instanceof File)
    fd.append('cover', payload.cover)

  if (payload.platform_ids)
    payload.platform_ids.forEach(id => fd.append('platform_ids', String(id)))

  if (payload.categories) {
    payload.categories.forEach((cat, i) => {
      fd.append(`categories[${i}][category]`, String(cat.category))
      fd.append(`categories[${i}][item_limit]`, String(cat.item_limit))
      cat.items.forEach((itemId, j) => {
        fd.append(`categories[${i}][items][${j}]`, String(itemId))
      })
    })
  }

  return fd
}

export const gamesService = {
  async list(query: Record<string, unknown> = {}): Promise<Paginated<Game>> {
    const { page, pageSize, query: q } = pageArgs(query)

    return normalizePaginated<Game>(await $api(E.games.list, { query: q }), page, pageSize)
  },
  detail(id: number): Promise<Game> {
    return $api(E.games.detail(id))
  },
  create(payload: GameWritePayload): Promise<Game> {
    return $api(E.games.list, { method: 'POST', body: buildGameFormData(payload) })
  },
  update(id: number, payload: Partial<GameWritePayload>): Promise<Game> {
    // PATCH (partial) so an unchanged cover need not be re-uploaded; the
    // serializer's update() only replaces cover when a new file is provided.
    return $api(E.games.detail(id), { method: 'PATCH', body: buildGameFormData(payload) })
  },
  remove(id: number): Promise<void> {
    return $api(E.games.detail(id), { method: 'DELETE' })
  },
  modes(gameId: number): Promise<Paginated<GameMode> | GameMode[]> {
    return $api(E.games.modes(gameId))
  },
}

export const filterCategoriesService = {
  async list(query: Record<string, unknown> = {}): Promise<Paginated<FilterCategory>> {
    const { page, pageSize, query: q } = pageArgs(query)

    return normalizePaginated<FilterCategory>(await $api(E.filterCategories.list, { query: q }), page, pageSize)
  },
  create(payload: { category: number; is_active: boolean; order: number }): Promise<FilterCategory> {
    return $api(E.filterCategories.list, { method: 'POST', body: payload })
  },
  update(id: number, payload: Partial<{ category: number; is_active: boolean; order: number }>): Promise<FilterCategory> {
    return $api(E.filterCategories.detail(id), { method: 'PATCH', body: payload })
  },
  remove(id: number): Promise<void> {
    return $api(E.filterCategories.detail(id), { method: 'DELETE' })
  },
}
