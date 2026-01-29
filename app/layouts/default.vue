<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />
    <UMain class="flex flex-col flex-1">
      <UContainer class="flex-1 flex flex-col justify-center">
        <slot />
      </UContainer>
      <AppFooter />
    </UMain>
  </div>
</template>

<script setup lang="ts">
</script>
