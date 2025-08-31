<script setup lang="ts">
import type { Website } from '~/types/websites';
import { z } from 'zod';
definePageMeta({
	layout: 'app-layout',
	middleware: ['sidebase-auth'],
})
const API = useRuntimeConfig().public.API_URL
const { token } = useAuth()
const { data, refresh } = useFetch<Website[]>(`${API}/api/websites`, {
	headers: {
		'Authorization': `${token.value}`
	}
})
const createWebsiteSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	type: z.enum(['personal', 'competitor']),
	url: z.string().refine(
		(val) =>
			/^https?:\/\/.+\..+/.test(val) || /^[a-z0-9.-]+\.[a-z]{2,}$/.test(val),
		{ message: "Must be a valid URL or domain" }
	)
		.refine(() => {
			if (uniqueUrl.value) {
				return true
			} else if (uniqueUrl.value == false) {
				return false
			}
			return true
		}, { message: "URL is already added." })
		.refine(() => {
			if (websiteExist.value) {
				return true
			}
			else if (websiteExist.value == false) {
				return false
			}
			return true
		}, { message: "Website is not reachable." }),
	icon: z.string().optional(),
})
const validationSchema = toTypedSchema(createWebsiteSchema)
const { values, errors, defineField, resetForm, meta } = useForm({
	validationSchema,
	validateOnMount: true,
	initialValues: {
		name: '',
		description: '',
		type: 'personal',
		url: undefined,
		icon: undefined,
	},
});
const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [url, urlAttrs] = defineField('url')
const [icon, iconAttrs] = defineField('icon')
const [type, typeAttrs] = defineField('type')
const showCreateWebsite = ref(false);
const loadingFavicon = ref(false);
const loadingVerifyUrl = ref(false);
const loadingCreateWebsite = ref(false)
const loadingVerifyWebsite = ref(false)
const uniqueUrl = ref<null | boolean>(null);
const websiteExist = ref<null | boolean>(null);
watchDebounced(url, async (newValue) => {
	if (newValue == "") {
		icon.value = "";
		return;
	}
	await Promise.all([
		setLoading(() => getFavicon(newValue as string, icon, API), loadingFavicon),
		setLoading(() => verifyUrl(newValue as string, token.value as string, uniqueUrl, API), loadingVerifyUrl),
		setLoading(() => verifyWebsite(newValue as string, API, websiteExist), loadingVerifyWebsite)
	])
}, { debounce: 500 });
async function createWebsite() {
	const isValid = meta.value.valid;
	if (loadingVerifyUrl.value || loadingFavicon.value) return;
	if (!isValid) return;
	try {
		await $fetch(`${API}/api/websites/`, {
			method: 'POST',
			headers: {
				'Authorization': `${token.value}`
			},
			body: values,
		})
		showCreateWebsite.value = false;
		await refresh()
	}
	catch (e) {
		console.log(e);
		return;
	}
}
async function handleSubmit() {
	await setLoading(() => { createWebsite() }, loadingCreateWebsite)
}

</script>

<template>
	<div>
		<Dialog v-model:visible="showCreateWebsite" header="Create Website" modal :style="{ margin: '10px' }" class="w-96">
			<form action="" class="flex flex-col gap-4 " novalidate @submit.prevent="">
				<div class="flex justify-center">
					<div
class="h-12 w-12 border-gray-300 rounded-xl" :class="{
						'border': !icon,
					}">
						<img v-if="icon" :src="icon" alt="Website Icon" class="h-full w-full object-cover rounded-xl">
					</div>
				</div>
				<div class="w-full">
					<InputText v-model="name" v-bind="nameAttrs" type="text" placeholder="Name" class='w-full' />
					<p class="text-sm text-red-500">{{ errors.name }}</p>
				</div>
				<div class="w-full">
					<InputText
v-model="description" v-bind="descriptionAttrs" type="text" placeholder="Description"
						class='w-full' />
					<p class="text-sm text-red-500">{{ errors.description }}</p>
				</div>
				<div class="w-full relative">
					<InputText v-model="url" v-bind="urlAttrs" type="text" placeholder="URL" class="w-full" />
					<Icon
v-if="loadingVerifyUrl || loadingVerifyWebsite" name="line-md:loading-loop"
						class="absolute top-3 right-4" />
					<Icon
v-if="!loadingVerifyUrl && uniqueUrl && !loadingVerifyWebsite && websiteExist"
						name="material-symbols:check" class="text-green-500 absolute top-3 right-4" />
					<p class="text-sm text-red-500">{{ errors.url }}</p>
				</div>
				<div class="relative w-full">
					<InputText v-model="icon" v-bind="iconAttrs" type="text" placeholder="Icon URL" class="w-full" />
					<Icon v-if="loadingFavicon" name="line-md:loading-loop" class="absolute top-3 right-4" />
					<p class="text-sm text-red-500">{{ errors.icon }}</p>
				</div>
				<div class="w-full">
					<Dropdown
v-model="type" v-bind="typeAttrs" :options="['personal', 'competitor']" placeholder="Type"
						class="w-full" />
					<p class="text-sm text-red-500">{{ errors.type }}</p>
				</div>
			</form>
			<template #footer>
				<Button variant="outlined" severity="secondary" @click="showCreateWebsite = false, resetForm()">Close</Button>
				<Button :loading="loadingCreateWebsite" label="Create" @click="handleSubmit" />
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
			<NuxtLink
v-for="website in data" :key="website.id" :to="`/app/websites/${website.id}`"
				class="gap-8 flex justify-between items-center px-6 py-2 font-medium tracking-wide hover:text-white transition-colors duration-300 transform  rounded-lg hover:bg-orange-500 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-80 h-32 border border-gray-300 text-gray-800 hover:border-orange-500">

				<Icon v-if="!website.icon" name="mdi:web" class="text-3xl" />
				<img v-else :src="website.icon" alt="Website Icon" class="h-12 w-12 object-cover rounded-xl">
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
