<template>
  <UHeader>
    <template #title>
      <AppLogo />
    </template>
    <UNavigationMenu
      :items="navItems"
      highlight
      color="neutral"
      class="w-full justify-center"
    />
    <template #right>
      <ClientOnly>
        <div class="flex items-center gap-2">
          <template v-if="user">
            <UDropdownMenu :items="dropdownItems" :ui="{ content: 'w-48' }">
              <UButton color="gray" variant="ghost" icon="i-lucide-user" size="sm" />
            </UDropdownMenu>
          </template>
          <template v-else>
            <UButton
              to="/login"
              icon="i-lucide-log-in"
              color="slate"
              variant="outline"
              size="sm"
              class="hidden sm:flex"
            >
              Login
            </UButton>
            <UButton
              to="/register"
              icon="i-lucide-user-plus"
              color="slate"
              variant="outline"
              size="sm"
              class="hidden sm:flex"
            >
              Register
            </UButton>
            <UButton
              to="/login"
              icon="i-lucide-log-in"
              color="slate"
              variant="outline"
              size="sm"
              square
              class="sm:hidden"
            />
          </template>
          <UColorModeButton />
        </div>
      </ClientOnly>
    </template>
    <template #body>
      <UNavigationMenu :items="navItems" orientation="vertical" class="-mx-2.5" />
    </template>
  </UHeader>
</template>

<script setup lang="ts">

const route = useRoute();
import { ref, onMounted, watch } from "vue";
import type { NavigationMenuItem, DropdownMenuItem } from "@nuxt/ui";
const user = ref<any>(null);
const isLoading = ref(false);

const loadUser = async () => {
  try {
    const response = await $fetch("/api/auth/me");
    user.value = response;
  } catch (error) {
    user.value = null;
  }
};

onMounted(() => {
  loadUser();
});

const navItems = computed<NavigationMenuItem[]>(() => [
  { label: "Home", to: "/", icon: "i-lucide-home" },
  { label: "About", to: "/about", icon: "i-lucide-info" },
  { label: "Contact", to: "/contact", icon: "i-lucide-mail" },
]);

const dropdownItems = computed<DropdownMenuItem[][]>(() => {
  const items: DropdownMenuItem[][] = [
    [
      {
        label: "Profile",
        icon: "i-lucide-user",
        to: "/profile",
      },
      {
        label: "Orders",
        icon: "i-lucide-shopping-bag",
        to: "/orders",
      },
    ],
  ];
  if (user.value && user.value.user && user.value.user.role === "ADMIN") {
    items[0].push({
      label: "Admin Dashboard",
      icon: "i-lucide-shield",
      to: "/admin",
    });
  }
  items.push([
    {
      label: "Logout",
      icon: "i-lucide-log-out",
      onSelect: handleLogout,
    },
  ]);
  return items;
});

async function handleLogout() {
  isLoading.value = true;
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
    user.value = null;
    await useRouter().push("/");
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    isLoading.value = false;
  }
}

watch(
  () => route.path,
  () => {
    loadUser();
  }
);
</script>
