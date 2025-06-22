<template>
	<header>
		<nav class="relative bg-white">
			<div class="container px-6 py-4 mx-auto md:flex md:justify-between md:items-center">
				<div class="flex items-center justify-between">
					<NuxtLink to="/" class="flex gap-2">
						<h1 class="text-gray-900 font-bold text-xl">webstandr</h1>
						<div class="p-2 bg-orange-500 rounded-full" />
					</NuxtLink>
					<!-- Mobile menu button -->
					<div class="flex md:hidden">
						<button
type="button" class="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600"
							aria-label="toggle menu">
							<svg
xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
								stroke="currentColor" stroke-width="2">
								<path stroke-linecap="round" stroke-linejoin="round" d="M4 8h16M4 16h16" />
							</svg>
						</button>
					</div>
				</div>
				<!-- Mobile Menu -->
				<div
					class="absolute inset-x-0 z-20 w-full px-6 py-4 bg-white md:bg-transparent md:mt-0 md:p-0 md:top-0 md:relative md:w-auto md:flex md:items-center">
					<div class="flex flex-col md:flex-row md:mx-6">
						<a
class="my-2 text-gray-700 transition-colors duration-300 transform hover:text-orange-500 md:mx-4 md:my-0"
							href="#">Home</a>
						<a
class="my-2 text-gray-700 transition-colors duration-300 transform hover:text-orange-500 md:mx-4 md:my-0"
							href="#">Shop</a>
						<a
class="my-2 text-gray-700 transition-colors duration-300 transform hover:text-orange-500 md:mx-4 md:my-0"
							href="#">Contact</a>
						<a
class="my-2 text-gray-700 transition-colors duration-300 transform hover:text-orange-500 md:mx-4 md:my-0"
							href="#">About</a>
					</div>
					<div class="flex justify-center md:block">
						<a class="relative text-gray-700 transition-colors duration-300 transform hover:text-gray-600" href="#">
							<svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path
									d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.70711 15.2929C4.07714 15.9229 4.52331 17 5.41421 17H17M17 17C15.8954 17 15 17.8954 15 19C15 20.1046 15.8954 21 17 21C18.1046 21 19 20.1046 19 19C19 17.8954 18.1046 17 17 17ZM9 19C9 20.1046 8.10457 21 7 21C5.89543 21 5 20.1046 5 19C5 17.8954 5.89543 17 7 17C8.10457 17 9 17.8954 9 19Z"
									stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
							<span class="absolute top-0 left-0 p-1 text-xs text-white bg-orange-500 rounded-full" />
						</a>
					</div>
				</div>
			</div>
		</nav>
	</header>
	<div class="container px-6 py-16 mx-auto">
		<div class="items-center lg:flex">
			<div class="w-full lg:w-1/2">
				<div class="lg:max-w-lg">
					<h1 class="text-3xl font-semibold text-gray-800 lg:text-4xl">SEO ranker across all <br> <span
							class="text-orange-500 ">Search Engines</span></h1>
					<p class="mt-3 text-gray-600">
						Monitor your website’s position on Google and Bing. Stay updated, spot trends, and grow with clear
						insights.
					</p>

					<button
						class="w-full px-5 py-2 mt-6 text-sm tracking-wider text-white uppercase transition-colors duration-300 transform bg-orange-600 rounded-lg lg:w-auto hover:bg-orange-500 focus:outline-none focus:bg-blue-500">
						Add your website
					</button>
				</div>
			</div>
			<div class="flex items-center justify-center w-full mt-6 lg:mt-0 lg:w-1/2">
				<img class="w-full h-full lg:max-w-3xl" src="/heroimage.png" alt="Catalogue-pana.svg">
			</div>
		</div>
	</div>
	<section class="container mx-auto p-4">
		<h2 class="text-center font-bold tracking-wider text-xl text-gray-900 mb-12">Rank from various Search Engines</h2>
		<div class="grid grid-cols-4 gap-4 grayscale">
			<img src="/google.png" alt="Google Logo" class="max-h-[85px]">
			<img src="/duckduckgo.svg" class="max-h-[85px]" alt="DuckDuckGo Logo">
			<img src="/bing.png" class="max-h-[85px]" alt="Bing Logo">
			<img src="/yahoo.png" class="max-h-[85px]" alt="Yahoo Logo">
		</div>
	</section>
	<section />
</template>
