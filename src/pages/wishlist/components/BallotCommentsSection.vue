<template>
	<div class="ballotCommentsSection">
		<div
			v-if="props.ballotComments"
			class="topLevelComment"
		>
			<BallotComment
				v-for="comment in ballotComments"
				:key="comment.id"
				:comment="comment"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import BallotComment from './BallotComment.vue'
const props = defineProps(['ballotComments'])
</script>

<style lang="scss" scoped>
.ballotCommentsSection {
}
</style>
