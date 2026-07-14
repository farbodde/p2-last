<script setup lang="ts">
import { VForm } from 'vuetify/components/VForm'
import { notificationsService } from '@/services/admin/misc'
import { DEVICE_TYPES } from '@/constants/adminOptions'
import { parseApiError } from '@/utils/adminApi'
import type { DeviceType } from '@/types/admin/misc'

definePageMeta({ action: 'read', subject: 'AdminPanel' })

const { success, error: notifyError } = useSnackbar()

// ── Test push composer ──────────────────────────────────────────────
const pushForm = ref<VForm>()
const title = ref('')
const body = ref('')
const dataJson = ref('')
const sending = ref(false)
const pushErrors = ref<Record<string, string[]>>({})

function validJson(v: string): boolean | string {
  if (!v.trim())
    return true
  try {
    JSON.parse(v)

    return true
  }
  catch {
    return 'Must be valid JSON'
  }
}

async function sendPush() {
  const { valid } = await pushForm.value!.validate()
  if (!valid)
    return
  sending.value = true
  pushErrors.value = {}
  try {
    const payload: any = { title: title.value, body: body.value }
    if (dataJson.value.trim())
      payload.data = JSON.parse(dataJson.value)
    const res = await notificationsService.testPush(payload)
    success(res.detail || 'Push notification queued')
  }
  catch (err) {
    const parsed = parseApiError(err)
    pushErrors.value = parsed.fields
    notifyError(parsed.message)
  }
  finally {
    sending.value = false
  }
}

// ── Device token management ─────────────────────────────────────────
const deviceForm = ref<VForm>()
const fcmToken = ref('')
const deviceType = ref<DeviceType>('web')
const registering = ref(false)
const unregistering = ref(false)

async function registerDevice() {
  const { valid } = await deviceForm.value!.validate()
  if (!valid)
    return
  registering.value = true
  try {
    const res = await notificationsService.registerDevice({ fcm_token: fcmToken.value, device_type: deviceType.value })
    success(res.detail || 'Device registered')
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    registering.value = false
  }
}

async function unregisterDevice() {
  if (!fcmToken.value) {
    notifyError('Enter the FCM token to unregister')

    return
  }
  unregistering.value = true
  try {
    const res = await notificationsService.unregisterDevice(fcmToken.value)
    success(res.detail || 'Device removed')
  }
  catch (err) {
    notifyError(parseApiError(err).message)
  }
  finally {
    unregistering.value = false
  }
}
</script>

<template>
  <section>
    <VRow>
      <VCol
        cols="12"
        md="7"
      >
        <VCard title="Send test push notification">
          <VCardText>
            <VForm
              ref="pushForm"
              @submit.prevent="sendPush"
            >
              <AppTextField
                v-model="title"
                label="Title"
                class="mb-4"
                :rules="[requiredValidator]"
                :error-messages="pushErrors.title?.[0]"
              />
              <AppTextarea
                v-model="body"
                label="Body"
                rows="3"
                class="mb-4"
                :rules="[requiredValidator]"
                :error-messages="pushErrors.body?.[0]"
              />
              <AppTextarea
                v-model="dataJson"
                label="Data (optional JSON)"
                rows="3"
                placeholder='{ "key": "value" }'
                :rules="[validJson]"
              />
              <VBtn
                type="submit"
                class="mt-4"
                :loading="sending"
                prepend-icon="tabler-send"
              >
                Send test push
              </VBtn>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>

      <VCol
        cols="12"
        md="5"
      >
        <VCard title="Device token">
          <VCardText>
            <p class="text-sm text-medium-emphasis mb-4">
              Register or remove an FCM device token for the current admin account.
            </p>
            <VForm
              ref="deviceForm"
              @submit.prevent="registerDevice"
            >
              <AppTextarea
                v-model="fcmToken"
                label="FCM token"
                rows="3"
                class="mb-4"
                :rules="[requiredValidator]"
              />
              <AppSelect
                v-model="deviceType"
                label="Device type"
                :items="DEVICE_TYPES"
                class="mb-4"
              />
              <div class="d-flex gap-3">
                <VBtn
                  type="submit"
                  :loading="registering"
                >
                  Register
                </VBtn>
                <VBtn
                  color="error"
                  variant="tonal"
                  :loading="unregistering"
                  @click="unregisterDevice"
                >
                  Unregister
                </VBtn>
              </div>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </section>
</template>
