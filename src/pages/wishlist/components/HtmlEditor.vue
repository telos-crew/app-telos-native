<script lang="ts" setup>
import { defineProps } from 'vue'
// const editor = ref('');
const props = defineProps(['draftComment', 'level', 'isSaving', 'progress'])
const emit = defineEmits(['save', 'commentChange'])
const onSave = () => {
	console.log('onSave', props.level)
	emit('save', props.level)
}
</script>

<template>
	<div class="text-editor">
		<div class="editor">
			<q-editor
				:modelValue="props.draftComment"
				@update:modelValue="
					(newValue) => emit('commentChange', newValue, props.level)
				"
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
		</div>
	</div>
</template>

<style lang="scss" scoped>
.text-editor {
	margin-top: 3rem;

	.saveButtonWrap {
		margin-top: 1rem;
	}
}
</style>
