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
			:shortDescription="false"
		/>
	</div>
	<div class="textEditorWrap">
		<TextEditor @save="saveComment" />
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { fetchBallot, postBallotComment } from './util';
import WishlistItem from './WishlistItem.vue';
import TextEditor from './components/TextEditor.vue';

const { params } = useRoute();
const { ballot_name } = params;
const ballot = ref(null);
const { getters } = useStore();

const account = computed(() => {
	return getters['accounts/account'];
});

const saveComment = async (content) => {
	const payload = {
		ballot_name: ballot.value.ballot_name,
		content,
		account_name: account.value
	};
	try {
		const response = await postBallotComment(payload);
		console.log(response);
	} catch (err) {
		console.log(err);
	}
};

onMounted(async () => {
	ballot.value = await fetchBallot(ballot_name);
	console.log(ballot.value);
});
</script>

<style lang="scss">
.wishlistBallot {
	margin-top: 24px;
}
</style>
