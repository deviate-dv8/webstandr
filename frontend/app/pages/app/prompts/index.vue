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
const { data: promptStats, refresh: refresh1 } = await useFetch<PromptStats>(`${API}/api/prompts/stats`, {
	method: 'GET',
	headers: {
		'Authorization': `${token.value}`
	}
})
const { data: prompts, refresh: refresh2 } = await useFetch<Prompt[]>(`${API}/api/prompts`, {
	method: 'GET',
	headers: {
		'Authorization': `${token.value}`
	},

})
const providers = [
	{ name: 'Google', value: 'google', icon: 'flat-color-icons:google' },
	{ name: 'Bing', value: 'bing', icon: 'logos:bing' },
	{ name: 'Yahoo', value: 'yahoo', icon: 'mdi:yahoo' },
	{ name: 'DuckDuckGo', value: 'duckduckgo', icon: 'logos:duckduckgo' },
]
const confirm = useConfirm()
const loadingDelete = ref(false);

async function refresh() {
	await Promise.all([
		refresh1(),
		refresh2()
	])
}

async function handleSubmitDeletePrompt(id: string, API: string, token: string, refresh: () => Promise<void>) {
	await setLoading(() => { deletePrompt(id, API, token, refresh) }, loadingDelete)
}
async function handleDeletePrompt(e: Event) {
	const id = (e.currentTarget as HTMLButtonElement).id;
	confirm.require({
		message: 'Do you want to remove this prompt? This will delete all associated SERP Data.',
		icon: 'pi pi-exclamation-circle',
		header: 'Danger Zone',
		acceptLabel: 'Delete',
		rejectLabel: 'Cancel',
		rejectProps: { variant: 'outlined', },
		acceptProps: { severity: 'danger', loading: loadingDelete },
		accept: () => handleSubmitDeletePrompt(id, API, token.value as string, refresh),
	})
}
</script>

<template>
	<main>
		<ConfirmDialog />
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
						<div v-for="entry in Object.entries(promptStats?.schedules || {})" :key="entry[0]"
							class="flex justify-between">
							<p class="font-bold">{{ entry[0] }}</p>
							<p>{{ entry[1] }}</p>
						</div>
					</div>
				</div>
				<div class="border border-gray-300 rounded-xl p-4">
					<h2 class="text-sm font-bold mb-4">Providers</h2>
					<div>
						<div v-for="entry in Object.entries(promptStats?.providers || {})" :key="entry[0]"
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
			<section class="p-4 border border-gray-300 rounded-xl">
				<PromptTable :prompts="prompts as Prompt[]" :delete-function="handleDeletePrompt" paginator :rows="5" />
			</section>
		</section>
	</main>
</template>
