<script setup lang="ts">
definePageMeta({
	layout: 'app-layout'
})
</script>

<template>
	<div class="flex flex-col h-full">
		<div>
			<h1 class="text-xl font-bold mb-8">Websites</h1>
		</div>
		<div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] max-h-full">
			<button
				class="flex justify-between items-center px-6 py-2 font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-orange-400 rounded-lg hover:bg-orange-500 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-80 h-32">
				<Icon name="ep:circle-plus-filled" class="text-3xl" />
				<p class=" font-bold">
					Add Website
				</p>
			</button>
			<NuxtLink v-for="_ in 5"
				class="gap-8 flex justify-between items-center px-6 py-2 font-medium tracking-wide hover:text-white transition-colors duration-300 transform bg-gray-100 rounded-lg hover:bg-orange-500 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-80 h-32 border border-gray-300 text-gray-800 hover:border-orange-500">
				<Icon name="mdi:web" class="text-3xl" />
				<div>
					<p class=" font-bold">
						Minecraft
					</p>
					<p class="text-sm">
						https://www.minecraft.net
					</p>
				</div>
			</NuxtLink>
		</div>
	</div>
</template>
