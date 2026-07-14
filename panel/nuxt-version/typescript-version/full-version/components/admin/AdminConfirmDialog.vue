<script setup lang="ts">
// Lightweight confirmation dialog for destructive admin actions.
interface Props {
  modelValue: boolean
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Are you sure?',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'error',
  loading: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()

const close = () => emit('update:modelValue', false)
</script>

<template>
  <VDialog
    :model-value="props.modelValue"
    max-width="460"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <VCard>
      <VCardItem>
        <VCardTitle>{{ props.title }}</VCardTitle>
      </VCardItem>
      <VCardText>
        {{ props.message }}
      </VCardText>
      <VCardText class="d-flex justify-end gap-3 pt-2">
        <VBtn
          color="secondary"
          variant="tonal"
          :disabled="props.loading"
          @click="close"
        >
          {{ props.cancelText }}
        </VBtn>
        <VBtn
          :color="props.confirmColor"
          :loading="props.loading"
          @click="emit('confirm')"
        >
          {{ props.confirmText }}
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
