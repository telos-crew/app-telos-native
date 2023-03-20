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
				v-if="account"
				@save="saveComment"
				@comment-change="onTopCommentChange"
				:draftComment="draftComments.top.content"
				level="top"
			/>
		</div>
		<div class="ballotCommentsArea">
			<div class="recentUserComments">
				<BallotComment
					v-for="comment in recentUserComments"
					:comment="comment"
					v-bind:key="comment.id"
				/>
			</div>
			<BallotCommentsSection :ballotComments="ballotComments" />
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { fetchBallot, postBallotComment, fetchBallotComments } from './util';
import WishlistItem from './WishlistItem.vue';
import TextEditor from './components/TextEditor.vue';
import BallotCommentsSection from './components/BallotCommentsSection.vue';
import BallotComment from './components/BallotComment.vue';

const { params } = useRoute();
const { ballot_name } = params;
const $q = useQuasar();
const ballot = ref(null);
const ballotComments = ref(null);
const draftComments = ref({
	top: {
		parent_id: 0,
		content: ''
	}
});
const recentUserComments = ref([]);
const { getters } = useStore();

const account = computed(() => {
	return getters['accounts/account'];
});

const onTopCommentChange = (content) => {
	draftComments.value.top.content = content;
};

const saveComment = async (level) => {
	const payload = {
		ballot_name: ballot.value.ballot_name,
		content: draftComments.value[level].content,
		account_name: account.value
	};
	try {
		const { comment } = await postBallotComment(payload);
		$q.notify({
			message: 'Comment saved!',
			type: 'positive'
		});
		draftComments.value[level].content = '';
		recentUserComments.value = [comment[0], ...recentUserComments.value];
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
	ballotComments.value = await fetchBallotComments(ballot_name);
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
	}
}
</style>
