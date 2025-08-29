<script setup lang="ts">
import z from 'zod';
import type { Website } from '~/types/websites';
definePageMeta({
	layout: 'app-layout',
	middleware: ['sidebase-auth'],
})
const API = useRuntimeConfig().public.API_URL
const { token } = useAuth()
const { id } = useRoute().params
const { data: website, error, status, refresh } = await useFetch<Website>(`${API}/api/websites/${id}`, {
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
const updateWebsiteSchema = z.object({
	name: z.string().min(1, 'Name is required').optional(),
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
		}
			, { message: "URL is already added." }).optional(),
	icon: z.string().optional(),
})
const validationSchema = toTypedSchema(updateWebsiteSchema)
const { values, errors, defineField, resetForm, meta } = useForm({
	validationSchema,
	validateOnMount: true,
	initialValues: {
		name: undefined,
		description: undefined,
		type: website?.value?.type || 'personal',
		url: undefined,
		icon: undefined,
	},
});
const [name, nameAttrs] = defineField('name')
const [description, descriptionAttrs] = defineField('description')
const [url, urlAttrs] = defineField('url')
const [icon, iconAttrs] = defineField('icon')
const [type, typeAttrs] = defineField('type')
const editResponseError = ref("")
function getValidUrl(url: string) {
	if (!url) return '#'; // Fallback for undefined URLs
	return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}
const confirm = useConfirm()
const loadingDelete = ref(false)
const showEditWebsite = ref(false)
const loadingVerifyUrl = ref(false);
const loadingFavicon = ref(false);
const uniqueUrl = ref<null | boolean>(null);
async function deleteWebsite() {
	try {
		await $fetch(`${API}/api/websites/${id}`, {
			method: 'DELETE',
			headers: {
				'Authorization': `${token.value}`,
			}
		})
		await navigateTo('/app/websites')
	} catch (error) {
		console.error('Error deleting website:', error);
	}
}

async function handleSubmitDelete() {
	await setLoading(() => { deleteWebsite() }, loadingDelete)
}
async function handleSubmitEdit() {
	await setLoading(() => { editWebsite() }, loadingDelete)
}
async function editWebsite() {
	const isValid = meta.value.valid;
	if (loadingVerifyUrl.value || loadingFavicon.value) return;
	if (!isValid) return;

	await $fetch<Website>(`${API}/api/websites/${id}`, {
		method: 'PUT',
		headers: {
			'Authorization': `${token.value}`,
			'Content-Type': 'application/json'
		},
		body: values,
		onRequestError({ error }) {
			editResponseError.value = "Server is unreachable. Please try again later.";
		},
		async onResponse({ response }) {
			showEditWebsite.value = false;
			resetForm();
			await refresh()
		}
	})
}
watchDebounced(url, async (newValue) => {
	if (newValue == "") {
		icon.value = "";
		return;
	}
	await Promise.all([
		setLoading(() => getFavicon(newValue as string, icon, API), loadingFavicon),
		setLoading(() => verifyUrl(newValue as string, token.value as string, uniqueUrl, API), loadingVerifyUrl)
	])
}, { debounce: 500 });
</script>

<template>
	<div>
		<ConfirmDialog />
		<Dialog v-model:visible="showEditWebsite" header="Edit Website" :style="{ width: '25rem' }">
			<form action="" class="flex flex-col gap-4 " novalidate @submit.prevent="">
				<div class="flex justify-center">
					<div class="h-12 w-12 border-gray-300 rounded-xl" :class="{
						'border': !icon,
					}">
						<img v-if="icon" :src="icon" alt="Website Icon" class="h-full w-full object-cover rounded-xl">
					</div>
				</div>
				<div class="w-full">
					<InputText v-model="name" v-bind="nameAttrs" type="text" :placeholder="`Name - ${website?.name}`"
						class='w-full' />
					<p class="text-sm text-red-500">{{ errors.name }}</p>
				</div>
				<div class="w-full">
					<InputText v-model="description" v-bind="descriptionAttrs" type="text"
						:placeholder="`Description - ${website?.description}`" class='w-full' />
					<p class="text-sm text-red-500">{{ errors.description }}</p>
				</div>
				<div class="w-full relative">
					<InputText v-model="url" v-bind="urlAttrs" type="text" :placeholder="`URL - ${website?.url}`"
						class="w-full" />
					<Icon v-if="loadingVerifyUrl" name="line-md:loading-loop" class="absolute top-3 right-4" />
					<Icon v-if="!loadingVerifyUrl && uniqueUrl" name="material-symbols:check"
						class="text-green-500 absolute top-3 right-4" />
					<p class="text-sm text-red-500">{{ errors.url }}</p>
				</div>
				<div class="relative w-full">
					<InputText v-model="icon" v-bind="iconAttrs" type="text" :placeholder="`Icon URL - ${website?.icon}`"
						class="w-full" />
					<Icon v-if="loadingFavicon" name="line-md:loading-loop" class="absolute top-3 right-4" />
					<p class="text-sm text-red-500">{{ errors.icon }}</p>
				</div>
				<div class="w-full">
					<Dropdown v-model="type" v-bind="typeAttrs" :options="['personal', 'competitor']" placeholder="Type"
						class="w-full" />
					<p class="text-sm text-red-500">{{ errors.type }}</p>
				</div>
				<p v-if="editResponseError" class="text-sm text-red-500 text-center">{{ editResponseError }}</p>
			</form>
			<template #footer>
				<Button type="button" variant="outlined" label="Cancel" severity="secondary"
					@click="showEditWebsite = false, resetForm()" />
				<Button type="button" label="Save" @click="handleSubmitEdit" />
			</template>
		</Dialog>
		<div class="p-4 lg:p-8 border border-gray-300 rounded-xl">
			<div class="flex gap-4 mb-12 justify-between">
				<div class="flex gap-4">
					<img :src="website?.icon" alt="" class="object-contain h-24 w-24 rounded-xl">
					<div class="flex flex-col gap-4">
						<div class="flex gap-2 items-center">
							<h1 class="text-2xl font-bold">{{ website?.name }}</h1>
							<div class="py-1 px-2 rounded-xl flex gap-2 items-center justify-center" :class="{
								'bg-green-100 text-green-600': website?.type == 'personal',
								'bg-orange-100 text-red-600': website?.type == 'competitor'
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
				<div class="">
					<Button severity="warn" icon="pi pi-pencil" label="Edit" class="mr-4" @click="showEditWebsite = true" />
					<Button severity="danger" icon="pi pi-trash" label="Delete" @click="confirm.require({
						message: 'Do you want to remove this website? This will delete all your SERP Data.', icon: 'pi pi-exclamation-circle', header: 'Danger Zone', acceptLabel: 'Delete', rejectLabel: 'Cancel',
						rejectProps: { variant: 'outlined', }, acceptProps: { severity: 'danger', loading: loadingDelete }, accept: handleSubmitDelete,
					})" />
				</div>
			</div>
			<p class="text-gray-600">{{ website?.description }}</p>
		</div>
	</div>
</template>
