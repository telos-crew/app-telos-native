<template>
	<div
		v-if="props.content"
		class="markdown-renderer"
	>
		<div class="header">Preview</div>
		<div
			class="output-wrap"
			v-html="renderedMarkdown"
		/>
	</div>
</template>

<script lang="ts" setup>
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { computed } from 'vue'
const props = defineProps(['content'])

const renderedMarkdown = computed(() => {
	const html = marked(props.content)
	const sanitizedHtml = DOMPurify.sanitize(html)
	return sanitizedHtml
})
</script>

<style lang="scss" scoped>
.markdown-renderer {
	margin-top: 2rem;
	width: 100%;
	max-width: 600px;
	border: 1px solid #ddd;
	border-radius: 6px;

	.header {
		font-size: 1rem;
		padding: 4px 10px;
		border-bottom: 1px solid #ddd;
		background-color: rgba(87, 26, 255, 0.3);
		font-weight: bold;
	}

	.output-wrap {
		padding: 0.8rem;
		font-size: 1rem;
	}
}
</style>
