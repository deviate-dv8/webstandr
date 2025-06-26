<script setup lang="ts">
const showDrawer = ref(false);
</script>
<template>
	<header>
		<nav class="relative bg-white">
			<div class="container px-6 py-4 mx-auto md:flex md:justify-between md:items-center">
				<div class="flex items-center justify-between">
					<NuxtLink to="/" class="flex gap-2">
						<h1 class="text-gray-900 font-bold text-xl">webstandr</h1>
						<div class="p-2 bg-orange-500 rounded-full" />
					</NuxtLink>
					<!-- Mobile menu button -->
					<div class="flex md:hidden">
						<button type="button" class="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
							aria-label="toggle menu" @click="showDrawer = true">
							<svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
								stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
							</svg>
						</button>
					</div>
					<Drawer v-model:visible="showDrawer" :show-close-icon="false" position="top" style="height: auto">
						<div class="bg-white flex flex-col p-4">
							<NuxtLink
								class="my-2 text-gray-700 transition-colors duration-300 transform hover:text-orange-500 md:mx-4 md:my-0"
								href="/about">
								About
							</NuxtLink>
							<NuxtLink
								class="my-2 text-gray-700 transition-colors duration-300 transform hover:text-orange-500 md:mx-4 md:my-0"
								href="/auth/login">
								Login
							</NuxtLink>
						</div>
					</Drawer>
				</div>
				<div
					class="hidden md:block absolute inset-x-0 z-20 w-full px-6 py-4 bg-white md:bg-transparent md:mt-0 md:p-0 md:top-0 md:relative md:w-auto md:flex md:items-center">
					<div class="flex flex-col md:flex-row md:mx-6">
						<NuxtLink
							class="my-2 text-gray-700 transition-colors duration-300 transform hover:text-orange-500 md:mx-4 md:my-0"
							href="/about">
							About
						</NuxtLink>
						<NuxtLink
							class="my-2 text-gray-700 transition-colors duration-300 transform hover:text-orange-500 md:mx-4 md:my-0"
							href="/auth/login">
							Login
						</NuxtLink>
					</div>
				</div>
			</div>
		</nav>
	</header>
</template>
