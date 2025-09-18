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
		<section class="p-4 lg:p-8 border border-gray-300 rounded-xl flex justify-between mt-8">
			<div class="border border-gray-300 rounded-xl p-4">
				<p>Website</p>
			</div>
		</section>
	</main>
</template>
