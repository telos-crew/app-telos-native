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
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps, computed } from 'vue';
import { buildCommentTree } from '../util';
import BallotComment from './BallotComment.vue';
const props = defineProps(['ballotComments']);

const topLevelComments = computed(() => {
	console.log(
		'ballotCommentsSection props.ballotComments',
		props.ballotComments
	);
	return props.ballotComments ? buildCommentTree(props.ballotComments) : null;
});
</script>

<style lang="scss" scoped>
.ballotCommentsSection {
}
</style>
