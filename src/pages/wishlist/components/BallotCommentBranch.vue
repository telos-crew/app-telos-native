<template>
	<div class="ballotCommentsBranch">
		<div v-if="comments">
			<BallotComment
				v-for="comment in comments"
				:key="comment.post_id"
				:comment="comment"
			/>
		</div>
	</div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { fetchBallotComments } from '../util'
import BallotComment from './BallotComment.vue'

const props = defineProps(['ballot_name', 'parent_id'])
const comments = ref(null)

const getBallotComments = async () => {
	console.log('getBallotComments props', props)
	comments.value = await fetchBallotComments(props.ballot_name, props.parent_id)
}

onMounted(() => {
	getBallotComments()
})
</script>

<style lang="scss" scoped></style>
