<script setup lang="ts">
import type { Website } from '~/types/websites';
import { z } from 'zod';
definePageMeta({
	layout: 'app-layout',
	middleware: ['sidebase-auth'],
})
const API = useRuntimeConfig().public.API_URL
const { token } = useAuth()
const { data } = useFetch<Website[]>(`${API}/api/websites`, {
	headers: {
		'Authorization': `${token.value}`
	}
})
const createWebsiteSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	type: z.enum(['personal', 'competitor']),
	url: z.string().url('Invalid URL format').min(1, 'URL is required').optional(),
	icon: z.string().optional(),
})
const validationSchema = toTypedSchema(createWebsiteSchema)
const { values, defineField } = useForm({
	validationSchema,
	initialValues: {
		name: '',
		type: 'personal',
		url: '',
		icon: '',
	},
});
const [name, nameAttrs] = defineField('name')
const [url, urlAttrs] = defineField('url')
const [icon, iconAttrs] = defineField('icon')
const [type, typeAttrs] = defineField('type')
const showCreateWebsite = ref(false);
watchDebounced(url, async (newValue) => {
	if (url.value === "") {
		icon.value = "";
		return;
	}
	try {
		const newIcon = await $fetch<string>(`${API}/api/serp/favicon`, {
			method: 'POST',
			body: {
				url: newValue,
			}
		})
		icon.value = newIcon;
	}
	catch {
		icon.value = "";
		return;
	}
}, { debounce: 500 });
</script>

<template>
	<div class="flex flex-col h-full">
		<Dialog v-model:visible="showCreateWebsite" header="Create Website" modal :style="{ margin: '10px' }" class="w-96">
			<form action="" class="flex flex-col gap-4 items-center" novalidate @submit.prevent="">
				<div class="h-12 w-12 border border-gray-300 rounded-xl">
					<img v-if="icon" :src="icon" alt="Website Icon" class="h-full w-full object-cover rounded-xl">
				</div>
				<InputText v-model="name" v-bind="nameAttrs" type="text" placeholder="Name" class='w-full' />
				<InputText v-model="url" v-bind="urlAttrs" type="text" placeholder="URL" class="w-full" />
				<div class="relative w-full">
					<InputText v-model="icon" v-bind="iconAttrs" type="text" placeholder="Icon URL" class="w-full" />
					<Icon name="line-md:loading-loop" class="absolute top-3 right-4" />
				</div>
				<Dropdown v-model="type" v-bind="typeAttrs" :options="['personal', 'competitor']" placeholder="Type"
					class="w-full" />
			</form>
			<template #footer>
				<Button variant="outlined" @click="showCreateWebsite = false">Close</Button>
				<Button @click="showCreateWebsite = false">Create</Button>
			</template>
		</Dialog>
		<div>
			<h1 class="text-xl font-bold mb-4">Your Websites</h1>
		</div>
		<div class="mb-4">
			<Button @click="showCreateWebsite = true">
				<Icon name="ep:circle-plus-filled" class="text-xl" />
				Add Website
			</Button>
		</div>
		<div class="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))] max-h-full">
			<NuxtLink v-for="website in data" :key="website.id" :to="`websites/${website.id}`"
				class="gap-8 flex justify-between items-center px-6 py-2 font-medium tracking-wide hover:text-white transition-colors duration-300 transform bg-gray-100 rounded-lg hover:bg-orange-500 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-80 h-32 border border-gray-300 text-gray-800 hover:border-orange-500">
				<Icon name="mdi:web" class="text-3xl" />
				<div>
					<p class=" font-bold">
						{{ website.name }}
					</p>
					<p class="text-sm">
						{{ website.url }}
					</p>
				</div>
			</NuxtLink>
		</div>
	</div>
</template>
