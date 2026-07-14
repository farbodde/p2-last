<script setup lang="ts">
import { reportsService, usersService } from '@/services/admin/users'
import { feedbackService } from '@/services/admin/misc'
import { gamesService, platformsService } from '@/services/admin/games'
import { FEEDBACK_TYPE_COLOR } from '@/constants/adminOptions'
import { mediaUrl } from '@/utils/adminApi'
import type { AdminUser, UserReport } from '@/types/admin/user'
import type { Feedback } from '@/types/admin/misc'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const userData = useCookie<any>('userData')

const stats = ref({
  users: 0,
  reports: 0,
  feedback: 0,
  games: 0,
  platforms: 0,
})

const recentUsers = ref<AdminUser[]>([])
const recentReports = ref<UserReport[]>([])
const recentFeedback = ref<Feedback[]>([])
const loading = ref(true)

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  }
  catch {
    return fallback
  }
}

async function load() {
  loading.value = true

  const [users, reports, feedback, games, platforms, recentU, recentR, recentF] = await Promise.all([
    safe(() => usersService.list({ page_size: 1 }), { count: 0, results: [] } as any),
    safe(() => reportsService.list({ page_size: 1 }), { count: 0, results: [] } as any),
    safe(() => feedbackService.list({ page_size: 1 }), { count: 0, results: [] } as any),
    safe(() => gamesService.list({ page: 1, page_size: 1 }), { count: 0, results: [] } as any),
    safe(() => platformsService.list({ page: 1, page_size: 1 }), { count: 0, results: [] } as any),
    safe(() => usersService.list({ page_size: 5 }), { results: [] } as any),
    safe(() => reportsService.list({ page_size: 5 }), { results: [] } as any),
    safe(() => feedbackService.list({ page_size: 5 }), { results: [] } as any),
  ])

  stats.value = {
    users: users.count,
    reports: reports.count,
    feedback: feedback.count,
    games: games.count,
    platforms: platforms.count,
  }
  recentUsers.value = recentU.results
  recentReports.value = recentR.results
  recentFeedback.value = recentF.results
  loading.value = false
}
await load()

const cards = computed(() => [
  { title: 'Users', value: stats.value.users, icon: 'tabler-users', color: 'primary', to: '/admin/users' },
  { title: 'Reports', value: stats.value.reports, icon: 'tabler-flag', color: 'error', to: '/admin/reports' },
  { title: 'Feedback', value: stats.value.feedback, icon: 'tabler-message-report', color: 'warning', to: '/admin/feedback' },
  { title: 'Games', value: stats.value.games, icon: 'tabler-device-gamepad-2', color: 'info', to: '/admin/games/games' },
  { title: 'Platforms', value: stats.value.platforms, icon: 'tabler-brand-steam', color: 'success', to: '/admin/games/platforms' },
])
</script>

<template>
  <section>
    <div class="mb-6">
      <h4 class="text-h4">
        Welcome back, {{ userData?.fullName || 'Admin' }} 👋
      </h4>
      <p class="text-body-1 text-medium-emphasis">
        P2 Player administration overview
      </p>
    </div>

    <VRow class="mb-2">
      <VCol
        v-for="c in cards"
        :key="c.title"
        cols="12"
        sm="6"
        md="auto"
        class="flex-grow-1"
      >
        <VCard :to="c.to">
          <VCardText class="d-flex align-center gap-x-4">
            <VAvatar
              :color="c.color"
              variant="tonal"
              rounded
              size="48"
            >
              <VIcon
                :icon="c.icon"
                size="28"
              />
            </VAvatar>
            <div>
              <div class="text-h4">
                {{ c.value }}
              </div>
              <div class="text-sm text-medium-emphasis">
                {{ c.title }}
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <VCol
        cols="12"
        md="6"
      >
        <VCard
          title="Latest users"
          class="mb-6"
        >
          <template #append>
            <VBtn
              variant="text"
              size="small"
              to="/admin/users"
            >
              View all
            </VBtn>
          </template>
          <VList lines="two">
            <VListItem
              v-for="u in recentUsers"
              :key="u.id"
              :to="`/admin/users/${u.username}`"
            >
              <template #prepend>
                <VAvatar
                  size="38"
                  :variant="!u.profile_image ? 'tonal' : undefined"
                  color="primary"
                >
                  <VImg
                    v-if="u.profile_image"
                    :src="mediaUrl(u.profile_image)"
                  />
                  <span v-else>{{ avatarText(u.display_name || u.email) }}</span>
                </VAvatar>
              </template>
              <VListItemTitle>{{ u.display_name || u.email }}</VListItemTitle>
              <VListItemSubtitle>{{ u.email }}</VListItemSubtitle>
              <template #append>
                <VChip
                  size="x-small"
                  label
                  class="text-capitalize"
                >
                  {{ u.role ?? 'none' }}
                </VChip>
              </template>
            </VListItem>
            <VListItem v-if="!recentUsers.length && !loading">
              <VListItemTitle class="text-medium-emphasis">
                No users.
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="6"
      >
        <VCard
          title="Latest feedback"
          class="mb-6"
        >
          <template #append>
            <VBtn
              variant="text"
              size="small"
              to="/admin/feedback"
            >
              View all
            </VBtn>
          </template>
          <VList lines="two">
            <VListItem
              v-for="f in recentFeedback"
              :key="f.id"
            >
              <VListItemTitle>{{ f.description }}</VListItemTitle>
              <VListItemSubtitle>{{ f.email }}</VListItemSubtitle>
              <template #append>
                <VChip
                  size="x-small"
                  label
                  class="text-capitalize"
                  :color="FEEDBACK_TYPE_COLOR[f.type]"
                >
                  {{ f.type }}
                </VChip>
              </template>
            </VListItem>
            <VListItem v-if="!recentFeedback.length && !loading">
              <VListItemTitle class="text-medium-emphasis">
                No feedback.
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </VCol>

      <VCol cols="12">
        <VCard title="Latest reports">
          <template #append>
            <VBtn
              variant="text"
              size="small"
              to="/admin/reports"
            >
              View all
            </VBtn>
          </template>
          <VList lines="two">
            <VListItem
              v-for="r in recentReports"
              :key="r.id"
            >
              <VListItemTitle>
                @{{ r.reporter_username || '—' }} reported @{{ r.reported_user_username || '—' }}
              </VListItemTitle>
              <VListItemSubtitle>{{ r.message }}</VListItemSubtitle>
              <template #append>
                <span class="text-xs text-medium-emphasis">{{ new Date(r.created_at).toLocaleDateString() }}</span>
              </template>
            </VListItem>
            <VListItem v-if="!recentReports.length && !loading">
              <VListItemTitle class="text-medium-emphasis">
                No reports.
              </VListItemTitle>
            </VListItem>
          </VList>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>
