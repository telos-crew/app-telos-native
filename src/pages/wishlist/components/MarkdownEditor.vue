<script lang="ts" setup>
import { defineProps, onMounted, computed } from 'vue'
import { scrollToHash } from '../../resolve/util'
const props = defineProps([
	'draftComment',
	'level',
	'isSaving',
	'progress',
	'id'
])
const emit = defineEmits(['save', 'commentChange', 'cancel'])

const onSave = () => {
	emit('save', props.level)
}

const onCancel = () => {
	emit('cancel', props.level)
}

const editorId = computed(() => {
	return `ballotComment-${props.id}-reply-editor`
})

const onFormat = (type: string) => {}

onMounted(() => {
	if (props.level === 'reply') {
		const editorHash = `ballotComment-${props.id || ''}-reply-editor`
		scrollToHash(editorHash)
		document.getElementById(editorHash).focus()
	}
})
</script>

<template>
	<div class="markdown-editor">
		<div class="toolbar">
			<div class="toolbar-item">
				<q-btn
					icon="fas fa-bold"
					@click="onBold"
				/>
			</div>
			<div class="toolbar-item">
				<q-btn
					icon="fas fa-italic"
					@click="onItalic"
				/>
			</div>
			<div class="toolbar-item">
				<q-btn
					icon="fas fa-link"
					@click="onLink"
				/>
			</div>
			<div class="toolbar-item">
				<q-btn
					icon="fas fa-image"
					@click="onImage"
				/>
			</div>
			<div class="toolbar-item">
				<q-btn
					icon="fas fa-quotes"
					@click="onQuote"
				/>
			</div>
			<div class="toolbar-item">
				<q-btn
					icon="fas fa-code"
					@click="onCode"
				/>
			</div>
			<div class="toolbar-item">
				<q-btn
					icon="fas fa-list"
					@click="onList"
				/>
			</div>
			<div class="toolbar-item">
				<q-btn
					icon="fas fa-heading"
					@click="onHeading"
				/>
			</div>
		</div>
		<div class="editor">
			<textarea
				:value="props.draftComment"
				@input="(e: any) => emit('commentChange', e?.target?.value, props.level)"
				class="editor-textarea"
				min-height="7rem"
				:id="editorId"
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
			/>&nbsp;&nbsp;
			<q-btn
				label="Cancel"
				@click="onCancel"
			/>

			<!-- {{ props.isSaving }}
			{{ props.progress }} -->
		</div>
	</div>
</template>

<style lang="scss" scoped>
.markdown-editor {
	margin-top: 3rem;

	.toolbar {
		flex: 1;
		flex-direction: row;
		display: flex;
		justify-content: flex-start;
	}

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
