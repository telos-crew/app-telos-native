<template>
	<div class="wishlistBallotPage">
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
			<TextEditor
				@save="saveComment"
				@comment-change="onTopCommentChange"
				:draftComment="draftComments.top.content"
				level="top"
			/>
			{{ draftComments.top.content }}
		</div>
		<div class="ballotCommentsArea">
			<BallotCommentsSection />
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { fetchBallot, postBallotComment } from './util';
import WishlistItem from './WishlistItem.vue';
import TextEditor from './components/TextEditor.vue';
import BallotCommentsSection from './components/BallotCommentsSection.vue';

const { params } = useRoute();
const { ballot_name } = params;
const $q = useQuasar();
const ballot = ref(null);
const draftComments = ref({
	top: {
		parent_id: null,
		content: ''
	}
});
const { getters } = useStore();

const account = computed(() => {
	return getters['accounts/account'];
});

const onTopCommentChange = (content) => {
	console.log(content);
	draftComments.value.top.content = content;
};

const saveComment = async (level) => {
	console.log('level', level);
	const payload = {
		ballot_name: ballot.value.ballot_name,
		content: draftComments.value[level].content,
		account_name: account.value
	};
	try {
		const response = await postBallotComment(payload);
		console.log(response);
		$q.notify({
			message: 'Comment saved!',
			type: 'positive'
		});
		draftComments.value[level].content = '';
	} catch (err) {
		console.log(err);
		$q.notify({
			message: 'Error saving comment',
			type: 'negative'
		});
	}
};

onMounted(async () => {
	ballot.value = await fetchBallot(ballot_name);
	console.log(ballot.value);
});
</script>

<style lang="scss">
.wishlistBallotPage {
	margin-bottom: 52px;
	.wishlistBallot {
		margin-top: 24px;
	}

	.ballotCommentsArea {
		margin-top: 36px;
		border: 1px solid #e0e0e0;
	}
}
</style>
