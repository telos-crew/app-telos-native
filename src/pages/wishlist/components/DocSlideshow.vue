<!-- <template>
	<div class="slideshowWrap">
		<iframe
			class="slide"
			:src="slide"
			width="100%"
			frameborder="0"
			allowfullscreen
		/>
	</div>
</template> -->

<template>
	<div class="slideshowWrap">
		<q-carousel
			v-model="slide"
			swipeable
			animated
			control-type="flat"
			control-color="primary"
			padding
			arrows
			height="600px"
			class="text-purple rounded-borders"
		>
			<q-carousel-slide
				v-for="contentUrl in props.contentUrls"
				v-bind:key="contentUrl"
				:name="contentUrl"
				class="column no-wrap flex-center slide"
			>
				<iframe
					class="slide"
					:src="slide"
					width="100%"
					frameborder="0"
					allowfullscreen
				/>
			</q-carousel-slide>
		</q-carousel>
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
