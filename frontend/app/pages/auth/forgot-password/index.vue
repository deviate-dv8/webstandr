<script setup lang="ts">
const email = ref('');
const toast = useToast();
const API = useRuntimeConfig().public.API_URL;
async function requestForgotPassword() {
	try {
		const data = await $fetch(`${API}/api/email/send-password-reset`, {
			method: 'POST',
			body: {
				email: email.value,
			},
		});
		if (data) {
			toast.add({
				severity: 'success',
				detail: 'If the email exists, a password reset link has been sent to your email.',
				life: 5000,
				summary: 'Password Reset Request Sent',
			});
			setTimeout(async () => {
				return await navigateTo('/auth/login', { external: true });
			}, 5000)
		}
	}
	catch {
		toast.add({
			severity: 'error',
			detail: 'An error occurred while sending the password reset request. Please try again later.',
			life: 3000,
			summary: 'Error Sending Request',
		});
	}
}
</script>
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
							<input
v-model="email" type="email" placeholder="Enter your email" required
								class="block w-full px-5 py-3 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg focus:border-orange-400 focus:ring-orange-400 focus:outline-none focus:ring focus:ring-opacity-40">
						</div>
						<button
							class="w-full px-6 py-3 mt-4 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-orange-500 rounded-lg hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-50"
							@click.prevent="requestForgotPassword">
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
