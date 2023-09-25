<template>
	<div class="wishlistBallotPage">
		<div class="wishlistItem">
			<wishlist-item
				v-if="ballot"
				:ballot="ballot"
				:results="results"
				@castVote="castVote"
				:voterVotes="voterVotes"
				:key="ballot_name"
				:shortDescription="false"
			/>
			<wishlist-item-skeleton v-else />
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
import {
	fetchBallot,
	fetchResults,
	fetchTop2CommentLevels,
	fetchVoterVotes,
	getCastVoteActions,
	saveItemComment
} from './util'
import WishlistItem from './WishlistItem.vue'
import WishlistItemSkeleton from './WishlistItemSkeleton.vue'
import BallotCommentsSection from './components/BallotCommentsSection.vue'
import BallotComment from './components/BallotComment.vue'
import MarkdownEditor from './components/MarkdownEditor.vue'
import MarkdownRenderer from './components/MarkdownRenderer.vue'

const emit = defineEmits(['toggleJoinModal'])
const { params } = useRoute()
const { ballot_name } = params
const saveProgress = ref(0)
const isSaving = ref(false)
const ballot = ref(null)
const results = ref(null)
const voterVotes = ref(null)
const castVoteData = ref({
	ballot_name: null,
	option: []
})
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

const voter = computed(() => {
	return store.getters['wishlist/voter']
})

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
	results.value = await fetchResults()
}

const getVoterVotes = async () => {
	voterVotes.value = await fetchVoterVotes(account.value)
}

const castVote = async (type: string, ballot: any) => {
	if (!voter.value) {
		castVoteData.value = {
			ballot_name: ballot.ballot_name,
			option: [type]
		}
		return emit('toggleJoinModal')
	}
	const castVoteActions = getCastVoteActions(
		account.value,
		ballot.ballot_name,
		type
	)
	await store.$api.signTransaction(castVoteActions)
	console.log('signed')
	castVoteData.value = { ballot_name: null, option: null }
	setTimeout(fetchEverything, 4000)
	setTimeout(fetchEverything, 7000)
	setTimeout(fetchEverything, 10000)
}

const fetchEverything = () => {
	getVoterVotes()
	getResults()
}

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

let ballotFetches = 0

const initialFetches = async () => {
	let interval = setInterval(async () => {
		const ballotData = await fetchBallot(ballot_name)
		ballotFetches++
		if (ballotFetches > 14) {
			clearInterval(interval)
			return
		}
		if (ballotData) {
			ballot.value = ballotData
			clearInterval(interval)
			return
		}
	}, 2000)
}

onMounted(async () => {
	fetchEverything()
	initialFetches()
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
