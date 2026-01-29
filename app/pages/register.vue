
<template>
  <div class="min-h-[calc(100vh-200px)] flex items-center justify-center py-20">
    <div class="w-full max-w-md px-4">
      <div class="text-center mb-8">
        <div class="flex items-center justify-center mb-4">
          <div class="flex items-center justify-center w-16 h-16 rounded-lg bg-gradient-to-br from-blue-400 to-purple-400">
            <span class="text-3xl font-bold text-white">E</span>
          </div>
        </div>
        <h1 class="text-3xl mb-2">Create Account</h1>
        <p class="text-muted">Sign up to join EventLeadr</p>
      </div>

      <UCard>
        <div v-if="errorMessage" class="mb-4">
          <UAlert color="red" icon="i-lucide-alert-circle" :title="errorMessage" />
        </div>
        <div v-if="successMessage" class="mb-4">
          <UAlert color="green" icon="i-lucide-check" :title="successMessage" />
        </div>

        <UForm :state="state" :validate="validate" class="space-y-4" @submit="onSubmit">
          <UFormField label="Username" name="username" required>
            <UInput v-model="state.username" placeholder="Your in-game name" class="w-full" />
          </UFormField>

          <UFormField label="Email" name="email" required>
            <UInput v-model="state.email" type="email" placeholder="you@example.com" class="w-full" />
          </UFormField>

          <UFormField label="Password" name="password" required>
            <UInput v-model="state.password" type="password" placeholder="••••••••" class="w-full" />
          </UFormField>

          <UFormField label="Confirm Password" name="confirmPassword" required>
            <UInput v-model="state.confirmPassword" type="password" placeholder="••••••••" class="w-full" />
          </UFormField>

          <UFormField name="acceptTerms" required>
            <div class="flex items-start gap-3">
              <UCheckbox v-model="state.acceptTerms" />
              <div class="text-sm">
                <p class="font-medium">Accept terms</p>
                <p class="text-slate-400">Agree to our community rules and policies.</p>
              </div>
            </div>
          </UFormField>

          <UButton type="submit" color="primary" size="lg" block :loading="isLoading" :disabled="isLoading">Create account</UButton>
        </UForm>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-slate-900 text-slate-400">Or sign up with</span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-2 gap-3">
            <UButton color="slate" variant="outline" block icon="i-lucide-message-circle" @click="handleDiscordSignup">Discord</UButton>
            <UButton color="slate" variant="outline" block icon="i-lucide-chrome" @click="handleGoogleSignup">Google</UButton>
          </div>
        </div>

        <div class="mt-6 text-center text-sm">
          <span class="text-slate-400">Already have an account?</span>
          <NuxtLink to="/login" class="ml-1 text-blue-400 hover:text-blue-300 transition-colors font-semibold">Login</NuxtLink>
        </div>
      </UCard>
    </div>
  </div>
</template>


<script setup lang="ts">
import type { FormError, FormSubmitEvent } from "@nuxt/ui";
import { reactive, ref } from "vue";

useSeoMeta({
  title: "Sign Up - EventLeadr",
  description: "Create your EventLeadr account",
});

type Schema = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
};

const state = reactive<Schema>({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  acceptTerms: false,
});

const isLoading = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const router = useRouter();
const route = useRoute();

function validate(formState: Partial<Schema>): FormError[] {
  const errors: FormError[] = [];
  if (!formState.username) {
    errors.push({ name: "username", message: "Username is required" });
  }
  if (!formState.email) {
    errors.push({ name: "email", message: "Email is required" });
  }
  if (!formState.password) {
    errors.push({ name: "password", message: "Password is required" });
  }
  if (!formState.confirmPassword) {
    errors.push({ name: "confirmPassword", message: "Please confirm your password" });
  }
  if (
    formState.password &&
    formState.confirmPassword &&
    formState.password !== formState.confirmPassword
  ) {
    errors.push({ name: "confirmPassword", message: "Passwords must match" });
  }
  if (!formState.acceptTerms) {
    errors.push({ name: "acceptTerms", message: "You must accept the terms" });
  }
  return errors;
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  errorMessage.value = "";
  successMessage.value = "";
  isLoading.value = true;
  try {
    await $fetch("/api/auth/register", {
      method: "POST",
      body: {
        username: event.data.username,
        email: event.data.email,
        password: event.data.password,
        rememberMe: true,
      },
    });
    successMessage.value = "Account created. Redirecting...";
    await router.push("/");
  } catch (error: any) {
    const message =
      error?.data?.statusMessage ||
      error?.data?.message ||
      error?.statusMessage ||
      "Sign up failed";
    errorMessage.value = message;
  } finally {
    isLoading.value = false;
  }
}

function handleDiscordSignup() {
  const target = (route.query.redirect as string) || "/";
  navigateTo(`/auth/discord?redirect=${encodeURIComponent(target)}`, { external: true });
}

function handleGoogleSignup() {
  const target = (route.query.redirect as string) || "/";
  navigateTo(`/auth/google?redirect=${encodeURIComponent(target)}`, { external: true });
}
</script>
