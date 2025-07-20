<script setup lang="ts">
definePageMeta({
	middleware: ['sidebase-auth']
})
const websiteColumns = ['name', 'url', 'type', 'provider', 'ranking']
const websitesData = reactive([
	{
		name: 'Google',
		url: 'https://www.google.com',
		type: 'Competitor',
		provider: 'Google',
		ranking: 1
	},
	{
		name: 'Bing',
		url: 'https://www.bing.com',
		type: 'Competitor',
		provider: 'Bing',
		ranking: 2
	},
	{
		name: 'Yahoo',
		url: 'https://www.yahoo.com',
		type: 'Competitor',
		provider: 'Bing',
		ranking: 3
	},
	{
		name: 'MyWebsite',
		url: 'https://www.mywebsite.com',
		type: 'Owner',
		provider: 'Google',
		ranking: 4
	},
	{
		name: 'DuckDuckGo',
		url: 'https://www.duckduckgo.com',
		type: 'Competitor',
		provider: 'Google',
		ranking: 5
	}
])
</script>
<template>
	<main class="relative min-h-screen flex flex-col">
		<DashboardAppHeader class="sticky top-0" />
		<div class="flex-1 flex h-full">
			<DashboardAppNav />
			<section class="w-full ml-[256px]">
				<div class="p-8 mx-auto w-full max-w-full min-[calc(1920px+64px)]:container h-full">
					<!-- Card Analytics -->
					<div class="grid grid-cols-4 gap-12">
						<div class="rounded-2xl bg-orange-500 px-4 py-6 flex justify-between text-white">
							<div class="">
								<p class="text-xl font-medium">Websites</p>
								<p class="text-3xl font-bold mt-8">100</p>
							</div>
							<Icon name="streamline-plump:web-solid" class="text-4xl" />
						</div>

						<div class="rounded-2xl px-4 py-6 flex justify-between border border-gray-300 ">
							<div class="">
								<p class="text-xl font-medium">Top Website</p>
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
			</section>
		</div>
	</main>
</template>
