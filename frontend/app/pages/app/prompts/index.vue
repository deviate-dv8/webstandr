<script setup lang="ts">
definePageMeta({
	layout: 'app-layout',
	middleware: ['sidebase-auth'],
})
const API = useRuntimeConfig().public.API_URL
const { token } = useAuth()
interface PromptStats {
	totalPrompts: number
	schedules: { [key in Prompt['schedule']]: number }
	providers: { [key in Prompt['provider']]: number }
}
const { data: promptStats } = useFetch<PromptStats>(`${API}/api/prompts/stats`, {
	method: 'GET',
	headers: {
		'Authorization': `${token.value}`
	}
})
const providers = [
	{ name: 'Google', value: 'google', icon: 'flat-color-icons:google' },
	{ name: 'Bing', value: 'bing', icon: 'logos:bing' },
	{ name: 'Yahoo', value: 'yahoo', icon: 'mdi:yahoo' },
	{ name: 'DuckDuckGo', value: 'duckduckgo', icon: 'logos:duckduckgo' },
]
</script>

<template>
	<main>
		<section class="">
			<h1 class="text-xl font-bold">Prompts</h1>
		</section>
		<section>

			<section class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
				<div class="border border-gray-300 rounded-xl p-4">
					<h2 class="text-sm font-bold mb-4">Total Prompts</h2>
					<p class="text-2xl font-bold">{{ promptStats?.totalPrompts }}</p>
				</div>
				<div class="border border-gray-300 rounded-xl p-4">
					<h2 class="text-sm font-bold mb-4">Schedules</h2>
					<div>
						<div
v-for="entry in Object.entries(promptStats?.schedules || {})" :key="entry[0]"
							class="flex justify-between">
							<p class="font-bold">{{ entry[0] }}</p>
							<p>{{ entry[1] }}</p>
						</div>
					</div>
				</div>
				<div class="border border-gray-300 rounded-xl p-4">
					<h2 class="text-sm font-bold mb-4">Providers</h2>
					<div>
						<div
v-for="entry in Object.entries(promptStats?.providers || {})" :key="entry[0]"
							class="flex justify-between items-center gap-x-4">
							<div class="flex items-center gap-x-2">
								<Icon :name="providers.find(e => e.value == entry[0])?.icon as string" class="w-8" />
								<p>{{ entry[0] }}</p>
							</div>
							<p>{{ entry[1] }}</p>
						</div>
					</div>
				</div>
			</section>
		</section>
	</main>
</template>
