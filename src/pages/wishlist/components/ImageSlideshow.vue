<template>
	<div class="slideshowWrap">
		<q-carousel
			v-model="slide"
			swipeable
			animated
			control-type="flat"
			control-color="purple"
			navigation
			padding
			arrows
			height="300px"
			class="text-purple rounded-borders"
		>
			<q-carousel-slide
				v-for="imageUrl in props.imageUrls"
				v-bind:key="imageUrl"
				:name="imageUrl"
				class="column no-wrap flex-center slide"
			>
				<img
					:src="imageUrl"
					class="image"
				/>
			</q-carousel-slide>
		</q-carousel>
	</div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
const props = defineProps(['imageUrls']);
const slide = ref(props.imageUrls[0]);
</script>

<style lang="scss" scoped>
.slideshowWrap {
	flex: 1;
	.slide {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;

		.image {
			max-width: 100%;
			aspect-ratio: inherit;
		}
	}

	.q-carousel__control .q-carousel__navigation {
		display: none;
	}
}
</style>
