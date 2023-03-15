<template>
	<div class="slideshowWrap">
		<iframe
			class="slide"
			:src="slide"
			width="100%"
			frameborder="0"
			allowfullscreen
		/>
	</div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
const props = defineProps(['contentUrls']);
const slide = ref(props.contentUrls[0]);
</script>

<style lang="scss" scoped>
.slideshowWrap {
	flex: 1;
	.slide {
		min-height: 600px;
		.image {
		}
	}

	.q-carousel__control .q-carousel__navigation {
		display: none;
	}
}
</style>
