<script setup lang="ts">
import type { ChartData } from "chart.js"
definePageMeta({
	middleware: ['sidebase-auth'],
	layout: 'app-layout'
})
const websiteColumns = ['name', 'url', 'type', 'provider', 'prompt', 'frequency', 'ranking']
const websitesData = reactive([
	{
		name: 'Google',
		url: 'https://www.google.com',
		prompt: "Google Search the quick brown fox jumps over the lazy dog",
		type: 'Competitor',
		provider: 'Google',
		frequency: 10,
		ranking: 1
	},
	{
		name: 'Bing',
		url: 'https://www.bing.com',
		prompt: "Bing Search",
		type: 'Competitor',
		provider: 'Bing',
		frequency: 9,
		ranking: 2
	},
	{
		name: 'Yahoo',
		url: 'https://www.yahoo.com',
		prompt: "Yahoo Search",
		type: 'Competitor',
		provider: 'Bing',
		frequency: 4,
		ranking: 3
	},
	{
		name: 'MyWebsite',
		url: 'https://www.mywebsite.com',
		prompt: "My Website",
		type: 'Owner',
		provider: 'Google',
		frequency: 6,
		ranking: 4
	},
	{
		name: 'DuckDuckGo',
		url: 'https://www.duckduckgo.com',
		prompt: "DuckDuckGo Search",
		type: 'Competitor',
		provider: 'Google',
		frequency: 5,
		ranking: 5
	}
])

const sampleData = [1, 2, 3, 4, 5, 8, 9]
const months = Array.from({ length: sampleData.length }, (_, i) => new Date(0, i).toLocaleString('en-US', { month: 'short' }))
const chartData: ChartData = {
	labels: months,
	datasets: [
		{
			label: 'My Website',
			data: sampleData,
			borderColor: '#4F46E5',
		},
	]
}
</script>
<template>
	<div>

		<div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-12">
			<div class="rounded-2xl bg-orange-500 px-4 py-6 flex justify-between text-white">
				<div class="">
					<p class="text-xl font-medium">Websites</p>
					<p class="text-3xl font-bold mt-8">100</p>
				</div>
				<Icon name="streamline-plump:web-solid" class="text-4xl" />
			</div>

			<div class="rounded-2xl px-4 py-6 flex justify-between border border-gray-300 ">
				<div class="">
					<p class="text-xl font-medium">My Top Website</p>
					<p class="text-3xl font-bold mt-8">Minecraft.com</p>
					<p class="text-sm text-gray-500"><span class="text-green-600 font-bold"># 1-5</span> Rank since last
						week
					</p>
				</div>
				<Icon name="solar:ranking-bold-duotone" class="text-4xl" />
			</div>
			<div class="rounded-2xl px-4 py-6 flex justify-between border border-gray-300 ">
				<div class="">
					<p class="text-xl font-medium">Keywords tracked</p>
					<p class="text-3xl font-bold mt-8">24</p>
				</div>
				<Icon name="bi:alphabet" class="text-4xl" />
			</div>
			<div class="rounded-2xl px-4 py-6 flex justify-between border border-gray-300 ">
				<div class="">
					<p class="text-xl font-medium">Page 1 Rankings</p>
					<p class="text-3xl font-bold mt-8">12</p>
					<p class="text-sm text-gray-500"><span class="text-green-600 font-bold">+3</span> this week</p>
				</div>
				<Icon name="mdi:numeric-1-box" class="text-4xl" />
			</div>
		</div>
		<div class="p-4 flex items-center justify-center">
			<div class="w-[750px]">
				<Chart type="line" :data="chartData" class="w-full border border-gray-300 rounded-xl p-4" />
			</div>
		</div>
		<div class="p-4 rounded-xl border mt-8 border-gray-300">
			<DataTable :value="websitesData">
				<template #header>
					<div class="flex flex-wrap items-center justify-between gap-2">
						<span class="text-xl font-bold">Websites</span>
					</div>
				</template>
				<Column v-for="col in websiteColumns" :key="col" :field="col" :header="col" />
			</DataTable>
		</div>
	</div>
</template>
