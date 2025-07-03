<template>
	<main>
		<LandingHeader />
		<section class="bg-white">
			<div class="max-w-6xl px-6 py-10 mx-auto">
				<p class="text-xl font-medium text-orange-500">About</p>

				<h1 class="mt-2 text-2xl font-semibold text-gray-800 capitalize lg:text-3xl">
					This personal project
				</h1>

				<main class="relative z-20 w-full mt-8 md:flex md:items-center xl:mt-12">
					<div class="absolute w-full bg-orange-600 -z-10 md:h-96 rounded-2xl" />

					<div
						class="w-full p-6 bg-orange-600 md:flex md:items-center rounded-2xl md:bg-transparent md:p-0 lg:px-12 md:justify-evenly">
						<img
							class="h-24 w-24 md:mx-6 rounded-full object-cover shadow-md md:h-[32rem] md:w-80 lg:h-[36rem] lg:w-[26rem] md:rounded-2xl"
							src="/profile.jpeg" alt="client photo">

						<div class="mt-2 md:mx-6">
							<div>
								<p class="text-xl font-medium tracking-tight text-white">dev-dv8</p>
								<p class="text-orange-200">Full-Stack Developer</p>
							</div>

							<p class="mt-4 text-lg leading-relaxed text-white md:text-xl">
								This is a personal project made with Nuxt 4, Tailwind, and AdonisJS. This project utilizes Webscraping
								from various search engines and show stats based on the results.
							</p>
						</div>
					</div>
				</main>
			</div>
		</section>
	</main>
</template>
