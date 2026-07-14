// Games catalog types — mirror games serializers.

export interface Platform {
  id: number
  title: string
  logo: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  title: string

  /** number as string, or "unlimited"/null when no limit. */
  limit: string | number | null
  created_at: string
  updated_at: string
}

export interface Item {
  id: number
  title: string
  icon: string | null

  /** Read-only string representation of the category. */
  category: string
  created_at: string
  updated_at: string
}

/** Nested category block inside a Game (GameSerializer read). */
export interface GameCategory {
  id: number
  category: number
  category_title: string
  item_limit: number
  items: { id: number; title: string; icon: string | null }[]
}

/** GameSerializer (read). */
export interface Game {
  id: number
  title: string
  cover: string | null
  platforms: Platform[]
  is_cross_platform: boolean
  categories: GameCategory[]
  created_at: string
}

/** GameCreateUpdateSerializer (write). */
export interface GameCategoryInput {
  category: number
  item_limit: number
  items: number[]
}

export interface GameWritePayload {
  title: string
  cover?: File | null
  platform_ids: number[]
  categories: GameCategoryInput[]
}

/** filter.FilterCategoryAdminSerializer. */
export interface FilterCategory {
  id: number
  category: number
  is_active: boolean
  order: number
}

/** GameMode (games/<id>/modes/). */
export interface GameMode {
  id: number
  title: string
}
