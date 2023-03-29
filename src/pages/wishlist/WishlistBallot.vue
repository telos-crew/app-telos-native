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
			<BallotCommentsSection :ballotComments="ballotComments" />
			<BallotCommentBranch
				:ballot_name="ballot_name"
				:parent_id="null"
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
	fetchBallotComments_old,
	postBallotComment2,
	fetchCommentByHash
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
const draftComments = ref({
	top: {
		parent_id: 0,
		content: ''
	}
})
const recentUserComments = ref([])
const { getters, $api } = useStore()

const account = computed(() => {
	return getters['accounts/account']
})

const onTopCommentChange = (content: string) => {
	console.log('onTopCommentChange: ', onTopCommentChange)
	draftComments.value.top.content = content
}

const onUploadProgress = (progress: number) => {
	if (typeof progress !== 'number') return
	saveProgress.value = progress * 0.5
}

const saveComment = async (level: string) => {
	saveProgress.value = 0
	isSaving.value = true
	const payload = {
		parent_id: null,
		content: draftComments.value[level].content,
		table: 'ballots',
		contract: 'telos.decide',
		scope: 'telos.decide',
		primary_key: ballot?.value?.ballot_name,
		poster: account.value
	}
	try {
		// start process
		const content_hash: string = await postBallotComment2({
			body: payload,
			folder_path: `wishlist/${account.value}`,
			comment: `Wishlist upload by ${account.value}`,
			onUploadProgress
		})
		// sign
		const actions = [
			{
				account: 'testcomments',
				name: 'post',
				data: {
					poster: account.value,
					content_hash,
					post_id: content_hash
				}
			}
		]
		saveProgress.value = 50
		const { transactionId, wasBroadcast }: AnchorResponse =
			await $api.signTransaction(actions)
		saveProgress.value = 75

		const { data: fetchedComment } = await fetchCommentByHash(content_hash)
		console.log('fetchedComment', fetchedComment)
		saveProgress.value = 100
		// check dStor
		// end process
		$q.notify({
			message: 'Comment saved!',
			type: 'positive'
		})
		draftComments.value[level].content = ''
		// need to refetch
	} catch (err) {
		console.log(err)
		$q.notify({
			message: err?.message,
			type: 'negative'
		})
	} finally {
		isSaving.value = false
		saveProgress.value = 0
	}
}

onMounted(async () => {
	ballot.value = await fetchBallot(ballot_name)
	ballotComments.value = await fetchBallotComments_old(ballot_name)
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
