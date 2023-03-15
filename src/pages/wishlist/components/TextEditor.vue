<script lang="ts" setup>
import { ref, defineProps } from 'vue';
// const editor = ref('');
const props = defineProps(['draftComment', 'level']);
const emit = defineEmits(['save', 'commentChange']);

const onChange = (value: string) => {
	editor.value = value;
};

const onSave = () => {
	emit('save', editor.value);
};
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
			/>
		</div>
		<div class="saveButtonWrap">
			<q-btn
				color="primary"
				label="Save"
				@click="onSave"
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
