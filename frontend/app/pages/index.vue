<script lang="ts" setup>
definePageMeta({
	middleware: ['is-authorized']
})
</script>
<template>
	<main>
		<LandingHeader />
		<section class="container px-6 py-16 mx-auto">
			<div class="items-center lg:flex">
				<div class="">
					<div class="flex flex-col items-start">
						<h1 class="text-3xl font-semibold text-gray-800 lg:text-4xl">Search Engine Result Page Ranker across all
							<br> <span class="text-orange-500 ">Search Engines</span>
						</h1>
						<p class="mt-3 text-gray-600 mb-6">
							Monitor your website’s position on Google and Bing. Stay updated, spot trends, and grow with clear
							insights.
						</p>
						<NuxtLink
to="/auth/login"
							class="w-full px-5 py-2 text-sm tracking-wider text-white uppercase transition-colors duration-300 transform bg-orange-600 rounded-lg lg:w-auto hover:bg-orange-500 focus:outline-none focus:bg-orange-500">
							Add your website
						</NuxtLink>
					</div>
				</div>
				<div class="flex items-center justify-center w-full mt-6 lg:mt-0 lg:w-1/2 hidden lg:block">
					<img class="w-full h-full lg:max-w-3xl" src="/heroimage.png" alt="Catalogue-pana.svg">
				</div>
			</div>
		</section>
		<section class="container mx-auto px-4 py-16">
			<h2 class="text-center font-bold tracking-wider text-xl text-gray-900 mb-12">Rank from various Search Engines</h2>
			<div class="grid grid-cols-4 gap-4 grayscale">
				<img src="/google.png" alt="Google Logo" class="max-h-[85px]">
				<img src="/duckduckgo.svg" class="max-h-[85px]" alt="DuckDuckGo Logo">
				<img src="/bing.png" class="max-h-[85px]" alt="Bing Logo">
				<img src="/yahoo.png" class="max-h-[85px]" alt="Yahoo Logo">
			</div>
		</section>
		<section />
		<section class="container mx-auto py-20 mb-8 px-4">
			<div class="flex items-center justify-center mb-8">
				<p class="px-4 py-1 border border-gray-300 rounded-lg text-gray-900">USE CASES</p>
			</div>
			<h2 class="text-center font-bold text-5xl text-gray-800">A 24/7 Website Rank Checker</h2>
			<div class="grid grid-cols-1 gap-8 mt-8 md:mt-16 md:grid-cols-2 xl:grid-cols-3">
				<div>
					<div class="relative">
						<img
class="object-cover object-center w-full h-64 rounded-lg lg:h-80"
							src="https://images.unsplash.com/photo-1624996379697-f01d168b1a52?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
							alt="">
					</div>
					<h1 class="mt-6 text-xl font-semibold text-gray-800">
						Get Website Ranking Insights
					</h1>
					<hr class="w-32 my-6 text-orange-500">
					<p class="text-sm text-gray-500">
						Get insights from various search engines to understand how your website is performing.
					</p>
				</div>
				<div>
					<div class="relative">
						<img
class="object-cover object-center w-full h-64 rounded-lg lg:h-80"
							src="https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
							alt="">
					</div>
					<h1 class="mt-6 text-xl font-semibold text-gray-800">
						Email Notifications for Ranking Changes
					</h1>
					<hr class="w-32 my-6 text-orange-500">
					<p class="text-sm text-gray-500">
						Notified via email when your website's ranking changes, so you can stay informed and take action
						when necessary.
					</p>
				</div>
				<div>
					<div class="relative">
						<img
class="object-cover object-center w-full h-64 rounded-lg lg:h-80"
							src="https://images.unsplash.com/photo-1597534458220-9fb4969f2df5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1374&q=80"
							alt="">
					</div>
					<h1 class="mt-6 text-xl font-semibold text-gray-800">
						Track Competitors' Rankings
					</h1>
					<hr class="w-32 my-6 text-orange-500">
					<p class="text-sm text-gray-500">
						Monitor your competitors' rankings to understand their strategies and improve your own website's
						performance.
					</p>
				</div>
			</div>
		</section>
		<section class="bg-orange-400 text-white px-4">
			<div class="container mx-auto py-16">
				<div class="flex">
					<p class="px-4 py-1 border rounded-md font-medium">IMPACT</p>
				</div>
				<div>
					<h2 class="font-medium text-3xl tracking-wider mt-4 mb-16">
						webstandr gives your websites <br>
						statistics and insights
					</h2>
					<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
						<div class="bg-orange-300 p-6 rounded-xl">
							<p class="text-5xl font-bold mb-10">500+</p>
							<p class="text-xl">Websites</p>
						</div>
						<div class="bg-orange-300 p-6 rounded-xl">
							<p class="text-5xl font-bold mb-10">500+</p>
							<p class="text-xl">Keywords</p>
						</div>
						<div class="bg-orange-300 p-6 rounded-xl">
							<p class="text-5xl font-bold mb-10">500+</p>
							<p class="text-xl">Users</p>
						</div>
						<div class="bg-orange-300 p-6 rounded-xl">
							<p class="text-5xl font-bold mb-10">500+</p>
							<p class="text-xl">insights given per week</p>
						</div>
					</div>
				</div>
			</div>
		</section>
		<section class="container mx-auto py-16 px-4">
			<div class="flex flex-col items-center bg-orange-200 text-orange-950 rounded-xl py-12 px-4">
				<div class="flex gap-2 flex-wrap justify-center items-center">
					<h2 class="text-5xl font-bold">Try</h2>
					<div class="flex gap-2 text-center">
						<h2 class="text-5xl font-bold">webstandr</h2>
						<div class="p-3 bg-white rounded-full" />
					</div>
				</div>
				<p class="mt-8">The only way to understand our impact is to try it. We'll provide you the stats you need for
					your
					company's
					website ranking</p>
				<NuxtLink
to="/auth/login"
					class="text-center font-bold w-full px-4 py-4 mt-6 text-sm tracking-wider text-white uppercase transition-colors duration-300 transform bg-orange-600 rounded-lg lg:w-auto hover:bg-orange-500 focus:outline-none focus:bg-orange-500">
					Add your website
				</NuxtLink>
			</div>
		</section>
		<LandingFooter />
	</main>
</template>
