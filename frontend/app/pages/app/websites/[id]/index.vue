<script setup lang="ts">
import z from 'zod';
import type { Website } from '~/types/website';
import type { WebsiteInsight } from '~/types/websiteInsight';
definePageMeta({
	layout: 'app-layout',
	middleware: ['sidebase-auth'],
})
const API = useRuntimeConfig().public.API_URL
const { token } = useAuth()
const { id } = useRoute().params

interface UserWebsiteInfo extends Website {
	promptCount: number;
	websiteInsightCount: number;
	websiteInsights: WebsiteInsight[];
	prompts: Prompt[];
}

const { data: website, error, status, refresh } = await useFetch<UserWebsiteInfo>(`${API}/api/websites/${id}`, {
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
const validationSchemaUW = toTypedSchema(updateWebsiteSchema)
const { values: valuesUW, errors: errorsUW, defineField: defineFieldUW, resetForm: resetFormUW, meta: metaUW } = useForm({
	validationSchema: validationSchemaUW,
	validateOnMount: true,
	initialValues: {
		name: undefined,
		description: undefined,
		type: website?.value?.type || 'personal',
		url: undefined,
		icon: undefined,
	},
});
const [nameUW, nameAttrsUW] = defineFieldUW('name')
const [descriptionUW, descriptionAttrsUW] = defineFieldUW('description')
const [urlUW, urlAttrsUW] = defineFieldUW('url')
const [iconUW, iconAttrsUW] = defineFieldUW('icon')
const [typeUW, typeAttrsUW] = defineFieldUW('type')
const editResponseError = ref("")
const createPromptResponseError = ref("")
function getValidUrl(url: string) {
	if (!url) return '#'; // Fallback for undefined URLs
	return url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
}
const confirm = useConfirm()
const loadingDelete = ref(false)
const showEditWebsite = ref(false)
const showCreatePrompt = ref(false);
const loadingVerifyUrl = ref(false);
const loadingFavicon = ref(false);
const loadingCreatePrompt = ref(false)
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
	const isValid = metaUW.value.valid;
	if (loadingVerifyUrl.value || loadingFavicon.value) return;
	if (!isValid) return;

	await $fetch<Website>(`${API}/api/websites/${id}`, {
		method: 'PUT',
		headers: {
			'Authorization': `${token.value}`,
			'Content-Type': 'application/json'
		},
		body: valuesUW,
		onRequestError() {
			editResponseError.value = "Server is unreachable. Please try again later.";
		},
		async onResponse() {
			showEditWebsite.value = false;
			resetFormUW();
			await refresh()
		}
	})
}
watchDebounced(urlUW, async (newValue) => {
	if (newValue == "") {
		iconUW.value = "";
		return;
	}
	await Promise.all([
		setLoading(() => getFavicon(newValue as string, iconUW, API), loadingFavicon),
		setLoading(() => verifyUrl(newValue as string, token.value as string, uniqueUrl, API), loadingVerifyUrl)
	])
}, { debounce: 500 });


const createPromptSchema = z.object({
	name: z.string().min(1, 'Name is required').max(64),
	query: z.string().min(1, 'Query is required').max(1024),
	websiteId: z.string().uuid(),
	provider: z.enum(['google', 'bing', 'yahoo', 'duckduckgo']).default('google'),
	schedule: z.enum(['daily', 'weekly', 'monthly', 'annually']).default('daily'),
})
const validationSchemaCP = toTypedSchema(createPromptSchema);
const { values: valuesCP, errors: errorsCP, defineField: defineFieldCP, resetForm: resetFormCP, meta: metaCP } = useForm({
	validationSchema: validationSchemaCP,
	validateOnMount: true,
	initialValues: {
		name: '',
		query: '',
		websiteId: id as string,
		provider: 'google',
		schedule: 'daily',
	},
});
const [nameCP, nameAttrsCP] = defineFieldCP('name')
const [queryCP, queryAttrsCP] = defineFieldCP('query')
// const [websiteIdCP, websiteIdAttrsCP] = defineFieldCP('websiteId')
const [providerCP, providerAttrsCP] = defineFieldCP('provider')
const [scheduleCP, scheduleAttrsCP] = defineFieldCP('schedule')

async function createPrompt() {
	const isValid = metaCP.value.valid;
	if (!isValid) return;
	try {
		await $fetch(`${API}/api/prompts/`, {
			method: 'POST',
			headers: {
				'Authorization': `${token.value}`,
				'Content-Type': 'application/json'
			},
			body: valuesCP,
		})
		showCreatePrompt.value = false;
		await refresh()
	}
	catch (e) {
		console.log(e);
		return;
	}
}
async function handleSubmitCreatePrompt() {
	await setLoading(() => { createPrompt() }, loadingCreatePrompt)
}
const columns = [
	{ field: 'name', header: 'Name' },
	{ field: 'query', header: 'Query' },
	{ field: 'provider', header: 'Provider' },
	{ field: 'schedule', header: 'Schedule' },
]
async function deletePrompt(promptId: string) {
	await $fetch(`${API}/api/prompts/${promptId}`, {
		method: "DELETE",
		headers: {
			'Authorization': `${token.value}`,
		},
		async onResponse({ response }) {
			if (response.status == 200) {
				await refresh()
				await resetFormCP()
			}
		}
	})
}

async function handleDeletePrompt(e: Event) {
	const id = (e.target as HTMLButtonElement).id;
	confirm.require({
		message: 'Do you want to remove this prompt? This will delete all associated SERP Data.',
		icon: 'pi pi-exclamation-circle',
		header: 'Danger Zone',
		acceptLabel: 'Delete',
		rejectLabel: 'Cancel',
		rejectProps: { variant: 'outlined', },
		acceptProps: { severity: 'danger', loading: loadingDelete },
		accept: () => deletePrompt(id),
	})
}

async function handleDeleteWebsite() {
	confirm.require({
		message: 'Do you want to remove this website? This will delete all your SERP Data.', icon: 'pi pi-exclamation-circle', header: 'Danger Zone', acceptLabel: 'Delete', rejectLabel: 'Cancel',
		rejectProps: { variant: 'outlined', }, acceptProps: { severity: 'danger', loading: loadingDelete }, accept: handleSubmitDelete,
	})
}
async function handlePromptRedirect(e: { data: Prompt }) {
	const prompt = e.data
	await navigateTo(`/app/prompts/${prompt.id}`)
}
function parseWebsiteUrl(website: string) {
	if (!website.startsWith("http://") && !website.startsWith("https://")) {
		return `https://${website}`;
	}
	return website;
}
function generatePageSpeedLink(website: string) {
	const baseUrl = "https://pagespeed.web.dev/report?url=";
	const parsedWebsite = parseWebsiteUrl(website);
	return `${baseUrl}${encodeURIComponent(parsedWebsite)}`;
}
const websiteInsight = computed(() => {
	return website.value?.websiteInsights ? website.value.websiteInsights[0] : null;
})
</script>
<template>
	<div>
		<ConfirmDialog />
		<Dialog v-model:visible="showEditWebsite" header="Edit Website" :style="{ width: '25rem' }">
			<form action="" class="flex flex-col gap-4 " novalidate @submit.prevent="">
				<div class="flex justify-center">
					<div class="h-12 w-12 border-gray-300 rounded-xl" :class="{
						'border': !iconUW,
					}">
						<img v-if="iconUW" :src="iconUW" alt="Website Icon" class="h-full w-full object-cover rounded-xl">
					</div>
				</div>
				<div class="w-full">
					<InputText v-model="nameUW" v-bind="nameAttrsUW" type="text" :placeholder="`Name - ${website?.name}`"
						class='w-full' />
					<p class="text-sm text-red-500">{{ errorsUW.name }}</p>
				</div>
				<div class="w-full">
					<InputText v-model="descriptionUW" v-bind="descriptionAttrsUW" type="text"
						:placeholder="`Description - ${website?.description}`" class='w-full' />
					<p class="text-sm text-red-500">{{ errorsUW.description }}</p>
				</div>
				<div class="w-full relative">
					<InputText v-model="urlUW" v-bind="urlAttrsUW" type="text" :placeholder="`URL - ${website?.url}`"
						class="w-full" />
					<Icon v-if="loadingVerifyUrl" name="line-md:loading-loop" class="absolute top-3 right-4" />
					<Icon v-if="!loadingVerifyUrl && uniqueUrl" name="material-symbols:check"
						class="text-green-500 absolute top-3 right-4" />
					<p class="text-sm text-red-500">{{ errorsUW.url }}</p>
				</div>
				<div class="relative w-full">
					<InputText v-model="iconUW" v-bind="iconAttrsUW" type="text" :placeholder="`Icon URL - ${website?.icon}`"
						class="w-full" />
					<Icon v-if="loadingFavicon" name="line-md:loading-loop" class="absolute top-3 right-4" />
					<p class="text-sm text-red-500">{{ errorsUW.icon }}</p>
				</div>
				<div class="w-full">
					<Dropdown v-model="typeUW" v-bind="typeAttrsUW" :options="['personal', 'competitor']" placeholder="Type"
						class="w-full" />
					<p class="text-sm text-red-500">{{ errorsUW.type }}</p>
				</div>
				<p v-if="editResponseError" class="text-sm text-red-500 text-center">{{ editResponseError }}</p>
			</form>
			<template #footer>
				<Button type="button" variant="outlined" label="Cancel" severity="secondary"
					@click="showEditWebsite = false, resetFormUW()" />
				<Button type="button" label="Save" @click="handleSubmitEdit" />
			</template>
		</Dialog>

		<section class="p-4 lg:p-8 border border-gray-300 rounded-xl">
			<div class="flex gap-4 mb-12 justify-between">
				<div class="flex gap-4">
					<img :src="website?.icon" alt="Website Icon"
						class="object-contain h-16 w-16 lg:h-24 lg:w-24 rounded-xl overflow-hidden">
					<div class="flex flex-col gap-4">
						<div class="flex gap-2 items-center flex-col lg:flex-row">
							<h1 class="text-xl lg:text-2xl font-bold">{{ website?.name }}</h1>
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
					<div class="flex gap-4 flex-col lg:flex-row">
						<Button severity="warn" icon="pi pi-pencil" label="Edit" @click="showEditWebsite = true" />
						<Button severity="danger" icon="pi pi-trash" label="Delete" @click="handleDeleteWebsite" />
					</div>
				</div>
			</div>
			<p class="text-gray-600">{{ website?.description }}</p>
		</section>

		<section class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
			<div class="border border-gray-300 rounded-xl p-4">
				<h2 class="text-lg font-bold mb-4">Prompts Stats</h2>
				<div class="flex justify-between">
					<p class="text text-gray-600 fond-medium">Total Prompts</p>
					<p class="text-lg font-bold">
						{{ website?.promptCount ?? 0 }}
					</p>
				</div>
			</div>
			<div class="border border-gray-300 rounded-xl p-4">
				<h2 class="text-lg font-bold mb-4">SERP Stats</h2>
				<div class="flex justify-between">
					<p class="text text-gray-600 fond-medium">Total SERP Results</p>
					<p class="text-lg font-bold">
						{{ website?.promptCount ?? 0 }}
					</p>
				</div>
			</div>
			<div class="border border-gray-300 rounded-xl p-4">
				<div class="flex justify-between items-center">
					<h2 class="text-lg font-bold mb-4">Page Speed Insights Stats</h2>
					<NuxtLink :to="generatePageSpeedLink(website?.url as string)" :external="true">
						<Icon name="mdi:open-in-new" class="text-lg" />
					</NuxtLink>
				</div>
				<div v-if="websiteInsight">
					<div class="flex justify-between">
						<p class="text text-gray-600 fond-medium">Total Insights</p>
						<p class="text-lg font-bold">
							{{ website?.websiteInsightCount }}
						</p>
					</div>
					<div class="flex justify-between">
						<p class="text text-gray-600 fond-medium">Performance</p>
						<p class="text-lg font-bold">
							{{ websiteInsight ? websiteInsight.performance : 0 }}
						</p>
					</div>
					<div class="flex justify-between">
						<p class="text text-gray-600 fond-medium">Accessibility</p>
						<p class="text-lg font-bold">
							{{ websiteInsight ? websiteInsight.accessibility : 0 }}
						</p>
					</div>
					<div class="flex justify-between">
						<p class="text text-gray-600 fond-medium">Best Practices</p>
						<p class="text-lg font-bold">
							{{ websiteInsight ? websiteInsight.bestPractices : 0 }}
						</p>
					</div>
					<div class="flex justify-between">
						<p class="text text-gray-600 fond-medium">SEO</p>
						<p class="text-lg font-bold">
							{{ websiteInsight ? websiteInsight.seo : 0 }}
						</p>
					</div>
				</div>
				<div v-else>
					<p class="text-center text-sm text-gray-600">No Page Speed Insights data available yet.</p>
				</div>

			</div>
		</section>
		<Dialog v-model:visible="showCreatePrompt" modal header="Create Prompt" :style="{ width: '25rem' }">
			<form action="" class="flex flex-col gap-4 " novalidate @submit.prevent="">
				<div class="w-full">
					<InputText v-model="nameCP" v-bind="nameAttrsCP" type="text" placeholder="Name" class='w-full' />
					<p class="text-sm text-red-500">{{ errorsCP.name }}</p>
				</div>
				<div class="w-full">
					<InputText v-model="queryCP" v-bind="queryAttrsCP" type="text" placeholder="Query" class='w-full' />
					<p class="text-sm text-red-500">{{ errorsCP.query }}</p>
				</div>
				<div class="w-full">
					<Dropdown v-model="providerCP" v-bind="providerAttrsCP" :options="['google', 'bing', 'yahoo', 'duckduckgo']"
						placeholder="Provider" class="w-full" />
					<p class="text-sm text-red-500">{{ errorsCP.provider }}</p>
				</div>
				<div class="w-full">
					<Dropdown v-model="scheduleCP" v-bind="scheduleAttrsCP" :options="['daily', 'weekly', 'monthly', 'annually']"
						placeholder="Schedule" class="w-full" />
					<p class="text-sm text-red-500">{{ errorsCP.provider }}</p>
				</div>
				<p v-if="createPromptResponseError" class="text-sm text-red-500 text-center">{{ createPromptResponseError }}</p>
			</form>
			<template #footer>
				<Button type="button" variant="outlined" label="Cancel" severity="secondary"
					@click="showCreatePrompt = false, resetFormCP()" />
				<Button type="button" label="Save" @click="handleSubmitCreatePrompt" />
			</template>
		</Dialog>
		<section class="p-4 border border-gray-300 rounded-xl">
			<div class="flex justify-between">
				<h2 class="text-lg font-bold">Prompts</h2>
				<Button label="Create" icon="pi pi-plus-circle" @click="showCreatePrompt = true" />
			</div>
			<DataTable :value="website?.prompts" :row-hover="true" @row-click="handlePromptRedirect">
				<Column v-for="column of columns" :key="column.field" :field="column.field" :header="column.header" />
				<Column header="Actions">
					<template #body="slotProps">
						<Button :id="slotProps.data.id" icon="pi pi-trash" severity="danger" @click="handleDeletePrompt" />
					</template>
				</Column>
			</DataTable>
		</section>
	</div>
</template>
