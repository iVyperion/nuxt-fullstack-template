<template>
  <div class="min-h-screen flex bg-gray-50">
    <DashboardSidebar />
    <main class="flex-1 p-6">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import DashboardSidebar from '~/components/organisms/DashboardSidebar.vue'
</script>
