<script setup lang="ts">
definePageMeta({
	middleware: ['is-authorized']
})
const API = useRuntimeConfig().public.API_URL;
const { userId, hash } = useRoute().params as { userId: string; hash: string };
const { expires, signature } = useRoute().query as { expires: string; signature: string };
const { error } = await useFetch(`${API}/api/email/verify-email/${userId}/${hash}`, {
	method: 'GET',
	query: {
		expires,
		signature
	},
});
</script>
<template>
	<main>
		<AuthHeader />

		<section class="min-h-[calc(100svh-60px)] flex items-center justify-center">
			<div v-if="!error" class="container flex flex-col items-center justify-center px-6 mx-auto">
				<Icon name="lets-icons:check-fill" style="font-size:4rem; color:limegreen" />
				<h1 class="mt-4 text-2xl font-semibold tracking-wide text-center text-gray-800 capitalize md:text-3xl">
					Email Successfully Verified
				</h1>
				<p class="mt-2 text-gray-600 text-center">
					Your email has been successfully verified. You can now log in to your account.
				</p>
				<NuxtLink to="/auth/login" class="mt-6 text-sm text-orange-500 hover:underline">
					<button
						class="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-orange-500 rounded-lg hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-50">
						Go to Login
					</button>
				</NuxtLink>
			</div>
			<div v-else class="container flex flex-col items-center justify-center px-6 mx-auto">
				<Icon name="lets-icons:close-ring-duotone" style="font-size:4rem; color:tomato" />
				<h1 class="mt-4 text-2xl font-semibold tracking-wide text-center text-gray-800 capitalize md:text-3xl">
					Email Verification Failed
				</h1>
				<p class="mt-2 text-gray-600 text-center">
					The email verification link is invalid or has expired. Please try again.
				</p>
				<NuxtLink to="/" class="mt-6 text-sm text-orange-500 hover:underline">
					<button
						class="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-orange-500 rounded-lg hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-50">
						Go to Home
					</button>
				</NuxtLink>
			</div>
		</section>
	</main>
</template>
