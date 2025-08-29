<script setup lang="ts">

const showDashboard = ref(true)
const showDashboardMobile = ref(false)
</script>
<template>
	<main class="relative min-h-screen flex flex-col">
		<DashboardAppHeader class="sticky top-0 z-50" @toggle-desktop="() => { showDashboard = !showDashboard }"
			@toggle-mobile="() => { showDashboardMobile = !showDashboardMobile }" />
		<div class="relative flex-1 flex">
			<!-- Mobile Navbar -->
			<aside class="hidden">
				<Drawer v-model:visible="showDashboardMobile" :show-close-icon=false>
					<DashboardAppNav />
				</Drawer>
			</aside>
			<!-- Desktop Navbar	 -->
			<aside
				class="relative flex-col flex-1 py-8 bg-white border-gray-200  rtl:border-r-0 rtl:border-l min-h-[calc(100svh-74px)] hidden md:flex duration-300"
				:class="{ 'max-w-3xs px-4': showDashboard, 'max-w-0 px-0': !showDashboard }">
				<div class=" sticky top-[106px] overflow-x-hidden">
					<DashboardAppNav />
				</div>
			</aside>
			<section class="flex-1 w-full">
				<div class="p-1 md:p-2 lg:p4 mx-auto w-full max-w-full min-[calc(1920px+64px)]:container h-full">
					<slot class="flex flex-col h-full" />
				</div>
			</section>
		</div>
	</main>
</template>
