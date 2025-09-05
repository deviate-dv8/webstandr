<script setup lang="ts">
interface SerpResponseType {
	id: string
	requestId: string
	success: boolean
	provider: 'google' | 'bing' | 'yahoo' | 'duckduckgo'
	query: string
	results: SerpResultType[]
	createdAt: Date
	updatedAt: Date
}
interface SerpResultType {
	title: string
	link: string
	description: string
	rank: number
	domain: string
}
const query = ref<string>("")
const selectedProvider = ref<SerpResponseType['provider']>('google')
const result = ref<SerpResponseType | null>(null)
const searchLoading = ref<boolean>(false);
const queryError = ref<string>("");
const API = useRuntimeConfig().public.API_URL
const providers = [
	{ name: 'Google', value: 'google', icon: 'flat-color-icons:google' },
	{ name: 'Bing', value: 'bing', icon: 'logos:bing' },
	{ name: 'Yahoo', value: 'yahoo', icon: 'mdi:yahoo' },
	{ name: 'DuckDuckGo', value: 'duckduckgo', icon: 'logos:duckduckgo' },
]
async function serpFreeSearch() {
	queryError.value = ""
	result.value = null
	if (query.value == "") {
		queryError.value = "Please enter a search query."
		return
	}
	await $fetch<SerpResultType>(`${API}/api/serp/search`, {
		method: 'POST',
		body: {
			query: query.value,
			provider: selectedProvider.value
		},
		onResponse({ response, error }) {
			if (error) {
				queryError.value = error.message
				return
			}
			result.value = response._data
		}, onResponseError({ response }) {
			queryError.value = `${response.statusText} Try again later.`
		},
		onRequestError({ error }) {
			queryError.value = error.message
		}
	})
}
async function handleSubmit() {
	setLoading(() => serpFreeSearch(), searchLoading)
}
</script>
<template>
	<main>
		<LandingHeader />
		<section class="container mx-auto p-2 min-h-[calc(100svh)]">
			<div class="flex flex-col w-full ">
				<h1 class="text-5xl font-extrabold text-center lg:text-7xl 2xl:text-8xl mt-12">
					<span class="text-transparent bg-gradient-to-br bg-clip-text from-teal-500 via-indigo-500 to-sky-500">
						Serp
					</span>
					<span class="text-transparent bg-gradient-to-tr bg-clip-text from-orange-500 via-pink-500 to-red-500">
						Free
					</span>
				</h1>

				<p class="max-w-3xl mx-auto mt-6 text-lg text-center text-gray-700 md:text-xl">
					The simple open source SERP API. Get search engine results from multiple providers.
				</p>
				<div class="flex flex-col mt-8">
					<div class="flex flex-col md:flex-row gap-4 md:gap-2 w-full justify-center">
						<Select
v-model="selectedProvider" :options="providers" option-label="name" option-value="value"
							placeholder="Select Provider">
							<template #header>
								<p class="font-medium p-3">Available Providers</p>
							</template>
							<template #value="slotProps">
								<div class="flex items-center gap-2">
									<div v-if="slotProps.value" class="flex items-center">
										<Icon
:name="providers.find(target => target.value == slotProps.value)?.icon as string"
											class="mr-2" />
										<p>{{ slotProps.value }}</p>
									</div>
									<span v-else>
										{{ slotProps.placeholder }}
									</span>
								</div>
							</template>
							<template #option="slotProps">
								<div class="flex items-center gap-2">
									<Icon :name="slotProps.option.icon" class="mr-2" />
									<p>{{ slotProps.option.name }}</p>
								</div>
							</template>
						</Select>
						<div class="relative">
							<Icon name="material-symbols:search" class="absolute left-4 top-3 text-xl text-gray-500" />
							<input
v-model="query" type="text"
								class="w-full px-10 py-2 text-gray-700 bg-white border rounded-md focus:border-orange-400 focus:ring-blue-300 focus:ring-opacity-40 focus:outline-none focus:ring"
								placeholder="Search Query" @keydown.enter="handleSubmit">
						</div>
						<Button label="Search" :loading="searchLoading" class="shrink-0" @click="handleSubmit" />
					</div>
					<p v-if="queryError" class="text-red-500 text-center mt-4">{{ queryError }}</p>
				</div>
			</div>
			<div v-if="result && !queryError" class="mt-8">
				<h2 class="text-3xl font-bold mb-6 text-center text-gray-600">Search Results - {{ result.query }}</h2>
				<div class="max-w-4xl mx-auto space-y-4">
					<div
v-for="item in result.results" :key="item.link"
						class="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow overflow-hidden">
						<a
:href="item.link" target="_blank"
							class="block text-lg font-semibold text-gray-600 hover:underline truncate" style="max-width: 100%;">
							{{ item.title }}
						</a>
						<p class="text-sm text-gray-500 mt-1 truncate" style="max-width: 100%;">
							{{ item.link }}
						</p>
						<p class="text-gray-700 mt-2">
							{{ item.description }}
						</p>
					</div>
				</div>
			</div>
		</section>
		<LandingFooter />
	</main>
</template>
