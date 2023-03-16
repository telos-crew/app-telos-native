<template>
	<div class="ballotCommentsSection">
		<div
			v-if="props.ballotComments"
			class="topLevelComment"
		>
			<BallotComment
				v-for="comment in topLevelComments"
				:key="comment.id"
				:comment="comment"
				:level="0"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import BallotComment from './BallotComment.vue';
const props = defineProps(['ballotComments']);

console.log('ballotCommentsSection props.ballotComments', props.ballotComments);

const topLevelComments = computed(() => {
	return props.ballotComments
		? props.ballotComments.filter((comment: any) => comment.parent_id === null)
		: null;
});
</script>

<style lang="scss" scoped>
.ballotCommentsSection {
}
</style>
