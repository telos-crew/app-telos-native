<script lang="ts" setup>
import { ref } from 'vue';
const editor = ref('');
const emit = defineEmits(['save']);

const onSave = () => {
	emit('save', editor.value);
};
</script>

<template>
	<div class="text-editor">
		<div class="editor">
			<q-editor
				v-model="editor"
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
