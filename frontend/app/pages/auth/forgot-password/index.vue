<template>
	<main class="min-h-[100svh]">
		<AuthHeader />
		<section class="min-h-[calc(100svh-60px)] flex items-center justify-center">
			<div class="container flex flex-col items-center justify-center px-6 mx-auto">
				<h1 class="mt-4 text-2xl font-semibold tracking-wide text-center text-gray-800 capitalize md:text-3xl">
					Forgot Password
				</h1>
				<div class="w-full max-w-md mx-auto mt-6">
					<form>
						<div>
							<label class="block mb-2 text-sm text-gray-600">Email</label>
							<input type="email" placeholder="Enter your email"
								class="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-orange-400 focus:outline-none focus:ring focus:ring-opacity-40">
						</div>
						<button
							class="w-full px-6 py-3 mt-4 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-orange-500 rounded-lg hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-50">
							Submit
						</button>
						<div class="mt-6 text-center">
							<NuxtLink to="/auth/login" class="text-sm text-gray-600">
								Remember your password? <span class="font-bold hover:underline text-orange-500">Sign in</span>
							</NuxtLink>
						</div>
					</form>
				</div>
			</div>
		</section>
	</main>
</template>
