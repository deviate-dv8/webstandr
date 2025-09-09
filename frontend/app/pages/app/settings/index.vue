<script setup lang="ts">
definePageMeta({
	layout: 'app-layout',
	middleware: ['sidebase-auth'],
})
const API = useRuntimeConfig().public.API_URL
const { token, data } = useAuth()
const user = data.value as UserData;
const loadingResend = ref(false);
const toast = useToast();
async function resendEmailVerification() {
	await $fetch(`${API}/api/email/send-email-verification`, {
		method: 'POST',
		headers: {
			'Authorization': `${token.value}`
		},
		onResponse({ response }) {
			if (response.ok) {
				toast.add({
					severity: 'success',
					summary: 'Success',
					detail: 'Verification email sent successfully.',
					life: 10000,
					closable: true,
				});
			} else {
				toast.add({
					severity: 'error',
					summary: 'Error',
					detail: 'Something went wrong. Please try again later.',
					closable: true,
				});
			}
		},
		onRequestError() {
			toast.add({
				severity: 'error',
				summary: 'Error',
				detail: 'Network error. Please check your connection and try again.',
				closable: true,
			});
		}
	})
}
function handleResend() {
	setLoading(() => resendEmailVerification(), loadingResend)
}
</script>

<template>
	<section class="flex items-center justify-center min-h-[calc(100svh-100px)]">
		<div class="max-w-4xl mx-auto p-6 border border-gray-300 rounded-lg w-full">
			<h1 class="text-2xl font-bold text-center text-gray-800 mb-6">User Profile</h1>
			<div class="bg-white border border-gray-300 rounded-lg p-6">
				<div class="flex justify-between py-3 border-b border-gray-200">
					<strong class="text-gray-600">Username:</strong>
					<span class="text-gray-800">{{ user.username }}</span>
				</div>
				<div class="flex justify-between py-3 border-b border-gray-200">
					<strong class="text-gray-600">Email:</strong>
					<span class="text-gray-800">{{ user.email }}</span>
				</div>
				<div class="flex justify-between py-3 border-b border-gray-200">
					<strong class="text-gray-600">Email Verified:</strong>
					<div class="flex gap-4 items-center">
						<span :class="user.emailVerifiedAt ? 'text-green-600 font-bold' : 'text-red-600 font-bold'">
							{{ user.emailVerifiedAt ? 'Yes' : 'No' }}
						</span>
						<Button
v-if="!user.emailVerifiedAt" size='small' :loading="loadingResend"
							@click="handleResend">Resend</Button>
					</div>
				</div>
				<div class="flex justify-between py-3 border-b border-gray-200">
					<strong class="text-gray-600">Account Created:</strong>
					<span class="text-gray-800">{{ useDateFormat(user.createdAt, 'YYYY-MM-DD') }}</span>
				</div>
			</div>
		</div>
	</section>
</template>
