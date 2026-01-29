<template>
  <div class="max-w-sm mx-auto py-12">
    <h1 class="text-2xl font-bold mb-6">Forgot Password</h1>
    <form @submit.prevent="submit">
      <UInput v-model="email" type="email" placeholder="Email" class="mb-4" required />
      <UButton type="submit" color="primary" class="w-full" :loading="pending">Send Reset Link</UButton>
    </form>
    <div class="flex justify-between text-sm mt-4">
      <NuxtLink to="/login" class="underline">Back to Login</NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const email = ref('')
const pending = ref(false)
const auth = useAuth()

const submit = async () => {
  pending.value = true
  try {
    await auth.forgotPassword({ email: email.value })
    // show success message
  } catch (e) {
    // handle error
  } finally {
    pending.value = false
  }
}
</script>
