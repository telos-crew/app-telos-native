<script lang="ts" setup>
import { defineProps } from 'vue'
const props = defineProps(['draftComment', 'level', 'isSaving', 'progress'])
const emit = defineEmits(['save', 'commentChange'])
const onSave = () => {
	emit('save', props.level)
}
</script>

<template>
	<div class="markdown-editor">
		<div class="editor">
			<textarea
				:value="props.draftComment"
				@input="(e: any) => emit('commentChange', e?.target?.value, props.level)"
				class="editor-textarea"
				min-height="7rem"
				:toolbar="[]"
			/>
		</div>
		<div class="saveButtonWrap">
			<q-btn
				color="primary"
				label="Save"
				@click="onSave"
				:loading="props.isSaving"
				:percentage="props.progress"
				dark-percentage
			/>
			<!-- {{ props.isSaving }}
			{{ props.progress }} -->
		</div>
	</div>
</template>

<style lang="scss" scoped>
.markdown-editor {
	margin-top: 3rem;

	.editor {
		.editor-textarea {
			min-height: 7rem;
			width: 100%;
			max-width: 600px;
			border: 1px solid #ddd;
			border-radius: 6px;
			padding: 0.5rem;
			&:focus-visible {
				border-color: $primary;
			}
		}
	}

	.saveButtonWrap {
		margin-top: 1rem;
	}
}
</style>
