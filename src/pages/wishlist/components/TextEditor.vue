<script lang="ts" setup>
import { ref } from 'vue';
const editor = ref('What you see is <b>what</b> you get.');
</script>

<template>
	<div class="text-editor">
		<div class="editor">
			<q-editor
				v-model="editor"
				min-height="5rem"
			/>
		</div>
		<div class="saveButtonWrap">
			<q-btn
				color="primary"
				label="Save"
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
