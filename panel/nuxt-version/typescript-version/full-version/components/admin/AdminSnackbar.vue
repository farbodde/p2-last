<script setup lang="ts">
// Global snackbar host. Mounted once in App.vue.
const { state } = useSnackbar()
</script>

<template>
  <VSnackbar
    v-model="state.show"
    :color="state.color"
    :timeout="state.timeout"
    location="top end"
    variant="flat"
  >
    {{ state.message }}
    <template #actions>
      <VBtn
        icon="tabler-x"
        size="small"
        variant="text"
        @click="state.show = false"
      />
    </template>
  </VSnackbar>
</template>
