<template>
  <UPageSection class="py-12">
    <UPageCard class="max-w-lg mx-auto">
      <template #header>
        <h1 class="text-3xl font-bold mb-2">Contact Us</h1>
        <p class="text-muted mb-4">We'd love to hear from you. Fill out the form below and our team will get back to you soon.</p>
      </template>
      <div class="space-y-4">
        <UAlert v-if="success" color="success">Thank you! Your message has been sent.</UAlert>
        <UAlert v-if="error" color="error">
          <template #title v-if="errorMessage" variant="outline">
            {{ errorMessage }}
          </template>
          <template #title variant="outline" v-else >
            An error occurred while sending your message. Please try again later.
          </template>
        </UAlert>
        <UForm :state="form" @submit="onSubmit" class="space-y-4">
          <UFormField label="Your Name" name="name" required class="block w-full">
            <UInput v-model="form.name" placeholder="Enter your name" required class="w-full" />
          </UFormField>
          <UFormField label="Your Email" name="email" required class="block w-full">
            <UInput v-model="form.email" type="email" placeholder="Enter your email" required class="w-full" />
          </UFormField>
          <UFormField label="Message" name="message" required class="block w-full">
            <UTextarea v-model="form.message" placeholder="How can we help you?" required :rows="5" class="w-full" />
          </UFormField>
          <UButton type="submit" color="primary" :loading="loading" class="w-full">Send Message</UButton>
        </UForm>
      </div>
    </UPageCard>
  </UPageSection>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const form = ref({ name: '', email: '', message: '' })
const loading = ref(false)
const success = ref(false)
const error = ref(false)
const errorMessage = ref('')

async function onSubmit() {
  loading.value = true
  success.value = false
  error.value = false
  errorMessage.value = ''
  try {
    const res = await $fetch('/api/contact', {
      method: 'POST',
      body: form.value
    })
    if (res && res.status === 200) {
      success.value = true
      form.value = { name: '', email: '', message: '' }
    } else {
      error.value = true
      errorMessage.value = res && res.error ? res.error : ''
    }
  } catch (e) {
    error.value = true
    errorMessage.value = e?.data?.error || e?.message || ''
  } finally {
    loading.value = false
  }
}
</script>
