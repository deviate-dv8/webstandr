<script setup lang="ts">
const { signOut } = useAuth();
definePageMeta({
	middleware: ['sidebase-auth']
})
async function signOutHandler() {
	await signOut({ external: true });
}
</script>
<template>
	<main>
		<p>
			protected route
		</p>
		<Button label="submit" @click="signOutHandler" />

	</main>
</template>
