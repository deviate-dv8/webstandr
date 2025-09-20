<script lang="ts" setup>
import type { Website } from '~/types/website'

definePageMeta({
	layout: 'app-layout',
	middleware: ['sidebase-auth'],
})
const API = useRuntimeConfig().public.API_URL
const { id } = useRoute().params
const { token } = useAuth()
interface PromptExtended extends Prompt {
	website: Website
	serp_responses_count: number
	serp_results_count: number
	serp_analyses_count: number
}

const { data: prompt, error } = await useFetch<PromptExtended>(`${API}/api/prompts/${id}`, {
	method: 'GET',
	headers: {
		'Authorization': `${useAuth().token.value}`
	}
})
const loadingDeletePrompt = ref(false)
const confirm = useConfirm()
if (error.value) {
	throw createError({ statusCode: error.value.statusCode, statusMessage: error.value.statusMessage })
}
const providers = [
	{ name: 'Google', value: 'google', icon: 'flat-color-icons:google' },
	{ name: 'Bing', value: 'bing', icon: 'logos:bing' },
	{ name: 'Yahoo', value: 'yahoo', icon: 'mdi:yahoo' },
	{ name: 'DuckDuckGo', value: 'duckduckgo', icon: 'logos:duckduckgo' },
]
async function handleSubmitDeletePrompt(id: string, API: string, token: string) {
	await setLoading(() => { deletePrompt(id, API, token) }, loadingDeletePrompt)
}

async function handleDeletePrompt() {
	confirm.require({
		message: 'Do you want to remove this prompt? This will delete all associated SERP Data.',
		icon: 'pi pi-exclamation-circle',
		header: 'Danger Zone',
		acceptLabel: 'Delete',
		rejectLabel: 'Cancel',
		rejectProps: { variant: 'outlined', },
		acceptProps: { severity: 'danger', loading: loadingDeletePrompt },
		accept: () => handleSubmitDeletePrompt(id as string, API, token.value as string),
	})
}
</script>
<template>
	<main>
		<ConfirmDialog />
		<section class="p-4 lg:p-8 border border-gray-300 rounded-xl lg:flex justify-between block">
			<div>
				<div class="flex gap-4 items-center">
					<h1 class="text-xl font-bold">Prompt:</h1>
					<p class="text-sm lg:text-base">{{ id }}</p>
				</div>
				<p>
					<span class="font-bold">
						Name:
					</span>
					{{ prompt?.name }}
				</p>
				<p>
					<span class="font-bold">
						Query:
					</span>
					{{ prompt?.query }}
				</p>
				<p>
					<span class="font-bold">
						Schedule:
					</span>
					{{ prompt?.schedule }}
				</p>
				<div class="flex gap-1 items-center">
					<p class="font-bold">
						Provider:
					</p>
					<p class="">
						{{ prompt?.provider }}
					</p>
					<Icon :name="providers.find(item => item.value == prompt?.provider)?.icon as string" />
				</div>
			</div>
			<div class="mt-4">
				<Button severity="danger" icon="pi pi-trash" label="Delete" class="w-full" @click="handleDeletePrompt" />
			</div>
		</section>
		<section class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
			<div class="border border-gray-300 rounded-xl p-4">
				<h2 class="text-lg font-bold mb-4">Website Info</h2>
				<div class="flex gap-4 mb-4 justify-between">
					<div class="flex gap-4">
						<img :src="prompt?.website?.icon" alt="Website Icon"
							class="object-contain h-16 w-16 lg:h-24 lg:w-24 rounded-xl overflow-hidden">
						<div class="flex flex-row lg:flex-col gap-4">
							<div class="flex gap-2 items-center flex-col lg:flex-row">
								<h1 class="text-xl lg:text-2xl font-bold">{{ prompt?.website?.name }}</h1>
								<div class="py-1 px-2 rounded-xl flex gap-2 items-center justify-center" :class="{
									'bg-green-100 text-green-600': prompt?.website?.type == 'personal',
									'bg-orange-100 text-red-600': prompt?.website?.type == 'competitor'
								}">
									<Icon :name="(prompt?.website?.type == 'personal') ? 'flowbite:user-outline' : 'hugeicons:corporate'"
										class="text-lg" />
									<p>
										{{ prompt?.website?.type }}
									</p>
								</div>
							</div>
							<NuxtLink :to="getValidUrl(prompt?.website?.url as string)"
								class="flex gap-2 items-center text-gray-500 hover:text-gray-700 duration-300">
								<Icon name="mdi:web" class="text-lg" />
								<p>
									{{ prompt?.website?.url }}
								</p>
								<Icon name="mdi:open-in-new" class="text-lg" />
							</NuxtLink>
						</div>
					</div>
				</div>
				<div class="flex gap-2">
					<p class="font-bold">Description:</p>
					<p class="text-gray-600">{{ prompt?.website?.description }}</p>
				</div>
			</div>
			<div class="border border-gray-300 rounded-xl p-4">
				<h2 class="text-lg font-bold mb-4">SERP Data Stats</h2>
				<div class="flex justify-between">
					<p class="text text-gray-600 fond-medium">SERP Responses</p>
					<p class="text-lg font-bold">
						{{ prompt?.serp_responses_count ?? 0 }}
					</p>
				</div>
				<div class="flex justify-between">
					<p class="text text-gray-600 fond-medium">SERP Analysis</p>
					<p class="text-lg font-bold">
						{{ prompt?.serp_analyses_count ?? 0 }}
					</p>
				</div>
				<div class="flex justify-between">
					<p class="text text-gray-600 fond-medium">SERP Results</p>
					<p class="text-lg font-bold">
						{{ prompt?.serp_results_count ?? 0 }}
					</p>
				</div>
			</div>
		</section>
	</main>
</template>
