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
			<MarkdownEditor
				v-if="account"
				@save="saveComment"
				@comment-change="onTopCommentChange"
				:draftComment="draftComments.top.content"
				level="top"
				:progress="saveProgress"
				:isSaving="isSaving"
			/>
		</div>
		<div class="markdown-renderer-wrap">
			<MarkdownRenderer :content="draftComments.top.content" />
		</div>
		<div class="ballotCommentsArea">
			<BallotComment
				v-for="reply in recentUserComments"
				:key="reply.content_hash"
				:comment="reply"
			/>
			<BallotCommentsSection :ballotComments="ballotComments" />
			<BallotCommentBranch
				:ballot_name="ballot_name"
				:parent_hash="null"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { AnchorResponse } from './types/blockchain'
import {
	fetchBallot,
	postBallotComment,
	fetchCommentByHash,
	fetchItemComments,
	fetchNonce,
	saveItemComment,
	checkAuth
} from './util'
import WishlistItem from './WishlistItem.vue'
import BallotCommentsSection from './components/BallotCommentsSection.vue'
import BallotComment from './components/BallotComment.vue'
import BallotCommentBranch from './components/BallotCommentBranch.vue'
import MarkdownEditor from './components/MarkdownEditor.vue'
import MarkdownRenderer from './components/MarkdownRenderer.vue'

const { params } = useRoute()
const { ballot_name } = params
const $q = useQuasar()
const saveProgress = ref(0)
const isSaving = ref(false)
const ballot = ref(null)
const ballotComments = ref(null)
const emit = defineEmits(['doSignArb'])
const draftComments = ref({
	top: {
		parent_hash: null,
		content: ''
	}
})
const recentUserComments = ref([])
const store = useStore()
const { getters, $api, $auth } = store

const account = computed(() => {
	return getters['accounts/account']
})

const onTopCommentChange = (content: string) => {
	console.log('onTopCommentChange: ', onTopCommentChange)
	draftComments.value.top.content = content
}

const onUploadProgress = (progress: number) => {
	if (typeof progress !== 'number') return
	saveProgress.value = 10 + progress * 0.5
}

const saveComment = async (level: string) => {
	await saveItemComment(account.value, '', '', store)
}

onMounted(async () => {
	ballot.value = await fetchBallot(ballot_name)
	const config = {
		contract: 'telos.decide',
		table: 'ballots',
		scope: 'telos.decide',
		primary_key: ballot_name,
		parent_hash: null
	}
	ballotComments.value = await fetchItemComments(config)
	console.log(ballot.value)
})
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
