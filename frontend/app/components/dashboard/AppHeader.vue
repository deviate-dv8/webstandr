<script setup lang="ts">
defineProps({
	showDashboard: {
		type: Boolean,
		default: true
	}
})
const emit = defineEmits(['toggleDesktop', 'toggleMobile'])
const { signOut } = useAuth();
async function signOutHandler() {
	await signOut({ external: true });
}
</script>
<template>
	<header class="w-full">
		<nav class="relative bg-white">
			<div class="px-12 py-4 mx-auto flex justify-between items-center">
				<div class="flex items-center justify-between gap-4">
					<button
class="items-center justify-center p-2 cursor-pointer hidden md:flex" type="button"
						@click="emit('toggleDesktop', true)">
						<Icon name="fluent:navigation-16-filled" class="text-xl" />
					</button>
					<button
class="items-center justify-center p-2 cursor-pointer flex md:hidden" type="button"
						@click="emit('toggleMobile', true)">
						<Icon name="fluent:navigation-16-filled" class="text-xl" />
					</button>
					<NuxtLink to="/app" class="flex gap-2">
						<h1 class="text-gray-900 font-bold text-xl">webstandr</h1>
						<div class="p-2 bg-orange-500 rounded-full" />
					</NuxtLink>
				</div>
				<div>
					<Button @click="signOutHandler">
						<Icon name="streamline:logout-1" />
						Logout
					</Button>
				</div>
			</div>
		</nav>
	</header>
</template>
