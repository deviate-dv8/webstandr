<script setup lang="ts">
import type { Website } from '~/types/websites';

definePageMeta({
	layout: 'app-layout',
	middleware: ['sidebase-auth'],
})
const API = useRuntimeConfig().public.API_URL
const { token } = useAuth()
const { id } = useRoute().params
const { data: website, error, status } = await useFetch<Website>(`${API}/api/websites/${id}`, {
	headers: {
		'Authorization': `${token.value}`
	}
});
if (status.value === "error") {
	if (error.value) {
		throw createError({
			statusCode: 404,
			statusMessage: "Website not found"
		})
	}
}
function getValidUrl(url: string) {
	if (!url) return '#'; // Fallback for undefined URLs
	return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}
const confirm = useConfirm()
</script>

<template>
	<div>
		<ConfirmDialog />
		<div class="p-4 lg:p-8 border border-gray-300 rounded-xl">
			<div class="flex gap-4 mb-12 justify-between">
				<div class="flex gap-4">
					<img :src="website?.icon" alt="" class="object-contain h-24 w-24 rounded-xl">
					<div class="flex flex-col gap-4">
						<div class="flex gap-2 items-center">
							<h1 class="text-2xl font-bold">{{ website?.name }}</h1>
							<div class="py-1 px-2 rounded-xl flex gap-2 items-center justify-center" :class="{
								'bg-green-100 text-green-600': website?.type == 'personal',
								'bg-blue-100 text-red-600': website?.type == 'competitor'
							}">
								<Icon :name="(website?.type == 'personal') ? 'flowbite:user-outline' : 'hugeicons:corporate'"
									class="text-lg" />
								<p>
									{{ website?.type }}
								</p>
							</div>
						</div>
						<NuxtLink :to="getValidUrl(website?.url as string)"
							class="flex gap-2 items-center text-gray-500 hover:text-gray-700 duration-300">
							<Icon name="mdi:web" class="text-lg" />
							<p>
								{{ website?.url }}
							</p>
							<Icon name="mdi:open-in-new" class="text-lg" />
						</NuxtLink>
					</div>
				</div>
				<div>
					<Button severity="danger" icon="pi pi-trash" label="Delete" @click="confirm.require({
						message: 'Do you want to remove this website?', icon: 'pi pi-exclamation-circle', header: 'Danger Zone', acceptLabel: 'Delete', rejectLabel: 'Cancel',
						rejectProps: { variant: 'outlined' }, acceptProps: { severity: 'danger' },
					})" />
				</div>
			</div>
			<p class="text-gray-600">{{ website?.description }}</p>
		</div>
	</div>
</template>
