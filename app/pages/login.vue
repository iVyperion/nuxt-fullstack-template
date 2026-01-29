
<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-20">
    <div class="w-full max-w-md px-4">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-4">
          <div class="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-400">
            <span class="text-3xl font-bold text-white">E</span>
          </div>
        </div>
        <h1 class="text-3xl mb-2">Welcome Back</h1>
        <p class="text-muted">Login to your EventLeadr account</p>
      </div>

      <UCard>
        <div v-if="errorMessage" class="mb-4">
          <UAlert color="red" icon="i-lucide-alert-circle" :title="errorMessage" />
        </div>
        <div v-if="successMessage" class="mb-4">
          <UAlert color="green" icon="i-lucide-check" :title="successMessage" />
        </div>

        <UForm :state="state" :validate="validate" class="space-y-4" @submit="onSubmit">
          <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" placeholder="your@email.com" class="w-full" />
          </UFormField>

          <UFormField label="Password" name="password" required>
            <UInput v-model="state.password" type="password" placeholder="••••••••" class="w-full" />
          </UFormField>

          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <UCheckbox v-model="state.rememberMe" />
              <span class="text-sm">Remember me</span>
            </label>
            <NuxtLink to="/forgot-password" class="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</NuxtLink>
          </div>

          <UButton type="submit" color="primary" size="lg" block :loading="isLoading" :disabled="isLoading">Login</UButton>
        </UForm>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-slate-900 text-slate-400">Or continue with</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <UButton color="slate" variant="outline" block icon="i-lucide-message-circle" @click="handleDiscordLogin">Discord</UButton>
            <UButton color="slate" variant="outline" block icon="i-lucide-chrome" @click="handleGoogleLogin">Google</UButton>
          </div>
        </div>

        <div class="mt-6 text-center text-sm">
          <span class="text-slate-400">Don't have an account?</span>
          <NuxtLink to="/register" class="ml-1 text-blue-400 hover:text-blue-300 transition-colors font-semibold">Sign up</NuxtLink>
        </div>
      </UCard>
    </div>
  </div>
</template>


<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref, onMounted } from "vue";

useSeoMeta({
  title: "Login - EventLeadr",
  description: "Login to your EventLeadr account",
});

type Schema = {
  email: string;
  password: string;
  rememberMe: boolean;
};

const state = reactive<Schema>({
  email: "",
  password: "",
  rememberMe: false,
});

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const router = useRouter();
const route = useRoute();

onMounted(() => {
  const error = route.query.error;
  if (error && typeof error === 'string') {
    errorMessage.value = decodeURIComponent(error);
  }
});

function validate(formState: Partial<Schema>): FormError[] {
  const errors: FormError[] = [];
  if (!formState.email) {
    errors.push({ name: "email", message: "Email is required" });
  }
  if (!formState.password) {
    errors.push({ name: "password", message: "Password is required" });
  }
  return errors;
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  errorMessage.value = "";
  successMessage.value = "";
  isLoading.value = true;
  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        email: event.data.email,
        password: event.data.password,
        rememberMe: event.data.rememberMe,
      },
    });
    successMessage.value = "Logged in successfully";
    await router.push("/");
  } catch (error: any) {
    const message =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.statusMessage ||
      "Login failed";
    errorMessage.value = message;
  } finally {
    isLoading.value = false;
  }
}

function handleDiscordLogin() {
  const target = (route.query.redirect as string) || "/";
  navigateTo(`/auth/discord?redirect=${encodeURIComponent(target)}`, { external: true });
}

function handleGoogleLogin() {
  const target = (route.query.redirect as string) || "/";
  navigateTo(`/auth/google?redirect=${encodeURIComponent(target)}`, { external: true });
}
</script>
