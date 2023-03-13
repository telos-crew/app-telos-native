<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { fetchBallot } from './util'
import WishlistItem from './WishlistItem.vue'

const { params } = useRoute()
const { ballot_name } = params
const ballot = ref(null)
onMounted(async () => {
	ballot.value = await fetchBallot(ballot_name)
})
</script>

<template>
	<div class="wishlistBallot">
		<wishlist-item
			v-if="ballot"
			:ballot="ballot"
			:fetchBallots="fetchBallots"
			:form="form"
			@toggleJoinModal="toggleJoinModal"
			@castVote="castVote"
			:voterVotes="voterVotes"
			:key="ballot.ballot_name"
		/>
		{{ ballot }}
	</div>
</template>

<style lang="scss">
.wishlistBallot {
	margin-top: 24px;
}
</style>
