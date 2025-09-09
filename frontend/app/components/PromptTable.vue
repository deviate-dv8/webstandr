<script lang="ts" setup>
defineProps({
	prompts: {
		type: Array as () => Prompt[],
		required: true
	},
	deleteFunction: {
		type: Function,
		required: false
	}
})
async function handlePromptRedirect(e: { data: Prompt }) {
	const prompt = e.data
	await navigateTo(`/app/prompts/${prompt.id}`)
}
const columns = [
	{ field: 'name', header: 'Name' },
	{ field: 'query', header: 'Query' },
	{ field: 'provider', header: 'Provider' },
	{ field: 'schedule', header: 'Schedule' },
]
</script>
<template>
	<DataTable :value="prompts" :row-hover="true" @row-click="handlePromptRedirect">
		<Column v-for="column of columns" :key="column.field" :field="column.field" :header="column.header" />
		<Column header="Actions">
			<template #body="slotProps">
				<Button :id="slotProps.data.id" icon="pi pi-trash" severity="danger" @click="deleteFunction as any" />
			</template>
		</Column>
	</DataTable>
</template>
