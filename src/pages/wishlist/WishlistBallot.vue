<template>
	<div class="wishlistBallotPage">
		<div class="wishlistItem">
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
				:results="results"
			/>
		</div>
		<div class="textEditorWrap">
			<MarkdownEditor
				v-if="account"
				@save="saveComment"
				@comment-change="onTopCommentChange"
				:draftComment="draftComments['0'].content"
				:level="'0'"
				:progress="saveProgress"
				:isSaving="isSaving"
			/>
		</div>
		<!-- recentUserComments:
		{{ JSON.stringify(recentUserComments) }} -->
		<!-- ballotComments:
		{{ ballotComments }} -->
		<!-- <br /><br />
		draftComments:
		{{ draftComments }} -->
		<div class="markdown-renderer-wrap">
			<MarkdownRenderer :content="draftComments['0'].content" />
		</div>
		<div class="ballotCommentsArea">
			<BallotComment
				v-for="reply in recentUserComments"
				:key="reply.id"
				:comment="reply"
			/>
			<BallotCommentsSection :ballotComments="ballotComments" />
			<!-- <BallotCommentBranch
				:ballot_name="ballot_name"
				:parent_id="null"
			/> -->
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { fetchBallot, fetchResults, fetchTop2CommentLevels, saveItemComment } from './util'
import WishlistItem from './WishlistItem.vue'
import BallotCommentsSection from './components/BallotCommentsSection.vue'
import BallotComment from './components/BallotComment.vue'
import MarkdownEditor from './components/MarkdownEditor.vue'
import MarkdownRenderer from './components/MarkdownRenderer.vue'

const { params } = useRoute()
const { ballot_name } = params
const saveProgress = ref(0)
const isSaving = ref(false)
const ballot = ref(null)
const results = ref(null);
const ballotComments = ref(null)
const draftComments = ref({
	'0': {
		parent_id: null,
		content: ''
	}
})
const recentUserComments = ref([])
const store = useStore()
const { getters } = store

const payload = {
	contract: 'telos.decide',
	table: 'ballots',
	scope: 'telos.decide',
	primary_key: ballot_name
	// parent_id: null
}

const account = computed(() => {
	return getters['accounts/account']
})

const onTopCommentChange = (content: string) => {
	draftComments.value['0'].content = content
}

const getResults = async () => {
	results.value = await fetchResults();
};

const saveComment = async (level: string) => {
	const data = {
		...payload,
		level: parseInt(level),
		poster: account.value,
		content: draftComments.value['0'].content
	}
	const {
		data: { comment }
	} = await saveItemComment(data, store)
	draftComments.value['0'] = { parent_id: null, content: '' }
	recentUserComments.value.unshift(comment)
}

onMounted(async () => {
	getResults()
	ballot.value = await fetchBallot(ballot_name)
	ballotComments.value = await fetchTop2CommentLevels(payload)
})
</script>

<style lang="scss">
.wishlistBallotPage {
	margin-bottom: 52px;
	.wishlistItem {
		margin-top: 24px;
	}

	.ballotCommentsArea {
	}
}
</style>
