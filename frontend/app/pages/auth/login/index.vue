<script setup lang="ts">
definePageMeta({
	middleware: ['is-authorized']
})
const { signIn } = useAuth();
const loginCredentials = reactive({
	email: '',
	password: ''
})
interface signInError {
	data?: {
		message: string;
	}
}
function loginHandler() {
	loginError.value = false;
	if (!loginCredentials.email || !loginCredentials.password) {
		loginError.value = true;
		loginErrorMessage.value = 'Email and password are required.';
		return;
	}
	signIn(loginCredentials, { "callbackUrl": "/app" })
		.then()
		.catch((error: signInError) => {
			// Handle login error
			loginError.value = true;
			if (error.data) {
				loginErrorMessage.value = 'Invalid email or password.';
			}
			else {
				// Fallback error message
				loginErrorMessage.value = 'An unexpected error occurred. Please try again.';
			}
		});
}
const loginError = ref(false);
const loginErrorMessage = ref('');
const showPassword = ref(false);
</script>
<template>
	<main class="min-h-[100svh]">
		<AuthHeader />
		<section class="min-h-[calc(100svh-60px)] flex items-center justify-center">
			<div class="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-md">
				<div class="px-6 py-4">
					<h3 class="mt-3 text-xl font-medium text-center text-gray-600">Login</h3>
					<form>
						<div class="w-full mt-4">
							<input
v-model="loginCredentials.email"
								class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-orange-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-orange-300"
								type="email" placeholder="Email Address" aria-label="Email Address">
						</div>

						<div class="w-full mt-4 relative">
							<input
v-model="loginCredentials.password"
								class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-orange-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-orange-300"
								:type="showPassword ? 'text' : 'password'" placeholder="Password" aria-label="Password">
							<button
v-if="!showPassword" type="button" class="absolute right-4 top-3 hover:text-gray-500 duration-100"
								@click="showPassword = true">
								<Icon name="weui:eyes-on-filled" class="text-xl" />
							</button>
							<button
v-else type="button" class="absolute right-4 top-3 hover:text-gray-500 duration-100"
								@click="showPassword = false">
								<Icon name="weui:eyes-off-filled" class="text-xl" />
							</button>
						</div>
						<div class="flex items-center justify-between mt-4">
							<NuxtLink to="/auth/forgot-password" class="text-sm text-gray-600 hover:text-gray-500">Forget Password?
							</NuxtLink>

							<button
type="button"
								class="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-orange-500 rounded-lg hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-50"
								@click="loginHandler">
								Login
							</button>
						</div>
						<div v-if="loginError">
							<p class="mt-2 text-sm text-red-500 text-center">{{ loginErrorMessage }}</p>
						</div>
					</form>
				</div>
				<div class="flex items-center justify-center py-4 text-center bg-gray-50">
					<span class="text-sm text-gray-600">Don't have an account? </span>
					<NuxtLink to="/auth/signup" class="mx-2 text-sm font-bold text-orange-500 hover:underline">signup</NuxtLink>
				</div>
			</div>
		</section>
	</main>
</template>
