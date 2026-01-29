<template>
  <NuxtLink :to="to" class="text-primary hover:underline"><slot /></NuxtLink>
</template>
<script setup lang="ts">
defineProps<{ to: string }>()
</script>
