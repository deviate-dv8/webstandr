<script lang="ts" setup>
import type { Website } from '~/types/website'

interface PromptsExtended extends Prompt {
	website: Website
}
const props = defineProps({
	prompts: {
		type: Array as () => (PromptsExtended[] | Prompt[]),
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
	...(props.prompts.some((p) => isPromptsExtended(p) && 'website' in p)
		? [{ field: 'website.name', header: 'Website' }]
		: []),
	{ field: 'name', header: 'Name' },
	{ field: 'query', header: 'Query' },
	{ field: 'provider', header: 'Provider' },
	{ field: 'schedule', header: 'Schedule' },
]

// Type guard to check if an item is PromptsExtended
function isPromptsExtended(p: Prompt | PromptsExtended): p is PromptsExtended {
	return 'website' in p;
}

</script>
<template>
	<DataTable :value="prompts" :row-hover="true" @row-click="handlePromptRedirect">
		<Column v-for="column of columns" :key="column?.field" :field="column?.field" :header="column?.header" />
		<Column header="Actions">
			<template #body="slotProps">
				<Button :id="slotProps.data.id" icon="pi pi-trash" severity="danger" @click="deleteFunction as any" />
			</template>
		</Column>
	</DataTable>
</template>
