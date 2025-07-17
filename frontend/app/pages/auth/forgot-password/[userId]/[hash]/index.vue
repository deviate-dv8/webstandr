<script setup lang="ts">
definePageMeta({
	middleware: ['is-authorized']
})
const API = useRuntimeConfig().public.API_URL;
const { userId, hash } = useRoute().params as { userId: string; hash: string };
const { expires, signature } = useRoute().query as { expires: string; signature: string };

interface PasswordResetResponse { message: string, email: string }
const { data, error } = await useFetch<PasswordResetResponse>(`${API}/api/email/reset-password/${userId}/${hash}`, {
	method: 'GET',
	query: {
		expires,
		signature
	},
});
const resetPasswordCredentials = ref({
	password: '',
	confirmPassword: ''
});

async function resetPassword() {
	if (resetPasswordCredentials.value.password !== resetPasswordCredentials.value.confirmPassword) {
		errMessage.value = "Passwords do not match.";
		return;
	}
	errMessage.value = "";
	await $fetch(`${API}/api/email/reset-password/${userId}/${hash}`, {
		method: 'POST',
		body: {
			password: resetPasswordCredentials.value.password,
			password_confirmation: resetPasswordCredentials.value.confirmPassword
		},
		query: {
			expires,
			signature
		},
		onRequestError: ({ error }) => {
			errMessage.value = error.message || 'An unexpected error occurred. Please try again later.';
		},
		onResponse: ({ response }) => {
			if (response.status === 200) {
				toast.add({
					severity: 'success',
					summary: 'Password Reset Successful',
					detail: 'Your password has been successfully reset. You will be redirected to the home page.',
					life: 4000
				});
				successFullyChangedPassword.value = true;
				setTimeout(() => {
					useRouter().push('/auth/login');
				}, 4000);
			}
		},
	}).catch(err => {
		errMessage.value = err?.data.errors[0].message || 'An unexpected error occurred. Please try again later.';
	});
}
const toast = useToast();
const showPassword = ref(false);
const errMessage = ref("");
const successFullyChangedPassword = ref(false);
</script>
<template>
	<main>
		<AuthHeader />

		<section class="min-h-[calc(100svh-60px)] flex items-center justify-center">
			<div
v-if="!error && !successFullyChangedPassword"
				class="container flex flex-col items-center justify-center px-6 mx-auto">
				<h1 class="mt-4 text-2xl font-semibold tracking-wide text-center text-gray-800  md:text-3xl">
					Reset Account Password
				</h1>
				<p class="mt-2 text-gray-600 text-center">
					Enter your new password for the account associated with <span class="font-semibold">{{ data?.email }}</span>.
				</p>

				<div class="w-full max-w-sm mt-4">
					<input
v-model="resetPasswordCredentials.password"
						class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-orange-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-orange-300"
						:type="showPassword ? 'text' : 'password'" placeholder="Password" aria-label="Password" required>
				</div>
				<div class="w-full mt-4 relative max-w-sm">
					<input
v-model="resetPasswordCredentials.confirmPassword"
						class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-orange-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-orange-300"
						:type="showPassword ? 'text' : 'password'" placeholder="Confirm Password" aria-label="Confirm Password"
						required>
					<button
v-if="!showPassword" type="button" class="absolute right-4 top-5 hover:text-gray-500 duration-100"
						@click="showPassword = true">
						<Icon name="weui:eyes-on-filled" class="text-xl" />
					</button>
					<button
v-else type="button" class="absolute right-4 top-5 hover:text-gray-500 duration-100"
						@click="showPassword = false">
						<Icon name="weui:eyes-off-filled" class="text-xl" />
					</button>
				</div>
				<p v-if="errMessage" class="mt-4 text-sm text-red-500">{{ errMessage }}</p>
				<button
					class="mt-4 px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-orange-500 rounded-lg hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-50"
					@click.prevent="resetPassword">
					reset password
				</button>
			</div>
			<div
v-else-if="successFullyChangedPassword"
				class="container flex flex-col items-center justify-center px-6 mx-auto">
				<Icon name="icon-park-solid:check-one" style="font-size:4rem; color:green" />
				<h1 class="mt-4 text-2xl font-semibold tracking-wide text-center text-gray-800 capitalize md:text-3xl">
					Password Reset Successful
				</h1>
				<p class="mt-2 text-gray-600 text-center">
					Your password has been successfully reset. You will be redirected to the login page shortly.
				</p>
				<NuxtLink to="/" class="mt-6 text-sm text-orange-500 hover:underline">
					<button
						class="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-orange-500 rounded-lg hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-50">
						Go to Home
					</button>
				</NuxtLink>
			</div>
			<div v-else class="container flex flex-col items-center justify-center px-6 mx-auto">
				<Icon name="lets-icons:close-ring-duotone" style="font-size:4rem; color:tomato" />
				<h1 class="mt-4 text-2xl font-semibold tracking-wide text-center text-gray-800 capitalize md:text-3xl">
					Password Reset Failed
				</h1>
				<p class="mt-2 text-gray-600 text-center">
					The password reset link is invalid or has expired. Please try again.
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
