<script setup lang='ts'>

const { signUp } = useAuth();
const signUpCredentials = reactive({
	username: '',
	email: '',
	password: '',
	confirmPassword: ''
})
const signUpCredentialsValidation = computed(() => {
	const emailRegex = new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
	return {
		username: signUpCredentials.username.length > 0,
		email: signUpCredentials.email.length > 0 && emailRegex.test(signUpCredentials.email),
		password: signUpCredentials.password.length >= 8
			&& signUpCredentials.password === signUpCredentials.confirmPassword
	}
})
interface SignUpError {
	data: {
		errors: [{
			message: string
		}]
	}
}
async function signUpHandler() {
	signUpError.value = false;
	if (!signUpCredentialsValidation.value.username || !signUpCredentialsValidation.value.email || !signUpCredentialsValidation.value.password || signUpCredentials.password !== signUpCredentials.confirmPassword) {
		signUpError.value = true;
		signUpErrorMessage.value = 'Please fill in all fields correctly.';
		return;
	}
	try {
		await signUp(signUpCredentials, { preventLoginFlow: true, callGetSession: false })
		signUpError.value = false;
		signUpErrorMessage.value = '';
		toast.add({
			severity: 'success',
			detail: 'Sign up successful! Please check your email to verify your account.',
			life: 3000,
			summary: 'Signing up...',
		})
		setTimeout(async () => {
			return await navigateTo('/auth/login', { external: true });
		}, 3000)
	}
	catch (error) {
		const err = error as SignUpError;
		if (!err || !err.data || !err.data.errors) {
			signUpError.value = true;
			signUpErrorMessage.value = 'An unexpected error occurred. Please try again later.';
			return;
		}
		const errorDetails = err.data.errors;
		const parsedErrors = errorDetails
			? errorDetails.map((err) => err.message).join(', ')
			: 'An error occurred during sign up.';
		signUpError.value = true;
		signUpErrorMessage.value = parsedErrors;
	}
}
const signUpError = ref(false);
const signUpErrorMessage = ref('');
const showPassword = ref(false);
const toast = useToast();
</script>
<template>
	<main class="min-h-[100svh]">
		<AuthHeader />
		<section class="min-h-[calc(100svh-60px)] flex items-center justify-center">
			<div class="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-lg shadow-md">
				<div class="px-6 py-4">
					<h3 class="mt-3 text-xl font-medium text-center text-gray-600">Sign up</h3>
					<form @submit.prevent="signUpHandler">
						<div class="w-full mt-4">
							<input v-model="signUpCredentials.username"
								class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-orange-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-orange-300"
								type="text" placeholder="Username" aria-label="Username" required>
						</div>
						<div class="w-full mt-4">
							<input v-model="signUpCredentials.email"
								class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-orange-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-orange-300"
								type="email" placeholder="Email Address" aria-label="Email Address" required>
						</div>

						<div class="w-full mt-4">
							<input v-model="signUpCredentials.password"
								class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-orange-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-orange-300"
								:type="showPassword ? 'text' : 'password'" placeholder="Password" aria-label="Password" required>
						</div>
						<div class="w-full mt-4 relative">
							<input v-model="signUpCredentials.confirmPassword"
								class="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-lg focus:border-orange-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-orange-300"
								:type="showPassword ? 'text' : 'password'" placeholder="Confirm Password" aria-label="Confirm Password"
								required>
							<button v-if="!showPassword" type="button" class="absolute right-4 top-3 hover:text-gray-500 duration-100"
								@click="showPassword = true">
								<Icon name="weui:eyes-on-filled" class="text-xl" />
							</button>
							<button v-else type="button" class="absolute right-4 top-3 hover:text-gray-500 duration-100"
								@click="showPassword = false">
								<Icon name="weui:eyes-off-filled" class="text-xl" />
							</button>
						</div>
						<div class="flex items-center justify-center mt-4">
							<button
								class="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-orange-500 rounded-lg hover:bg-orange-400 focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-50">
								Sign Up
							</button>
						</div>
						<div v-if="signUpError">
							<p class="mt-2 text-sm text-red-500 text-center">{{ signUpErrorMessage }}</p>
						</div>
					</form>
				</div>
				<div class="flex items-center justify-center py-4 text-center bg-gray-50">
					<span class="text-sm text-gray-600">Already have an account? </span>
					<NuxtLink to="/auth/login" class="mx-2 text-sm font-bold text-orange-500 hover:underline">login</NuxtLink>
				</div>
			</div>
		</section>
	</main>
</template>
