<template>
	<div
		:id="`ballotComment-${comment.post_id}`"
		class="ballotComment"
	>
		<div class="header">
			<span class="accountName">@{{ props.comment.poster }}</span>
			<span class="timeAgo">{{ relativeTime }}</span>
		</div>
		<div class="contentWrap">
			<div class="content">
				{{ props.comment.content }}
			</div>
		</div>
		<div class="footer">
			<div class="clickable permalink">link</div>
			<div class="clickable hide">hide</div>
			<div
				v-if="account"
				@click="onReplyClick"
				class="clickable reply"
			>
				reply
			</div>
			<div
				class="clickable load-replies"
				v-if="props.comment.children + recentUserReplies.length"
				@click="
					showChildren ? toggleShowChildren(false) : toggleShowChildren(true)
				"
			>
				<span v-if="showChildren"> hide replies </span>
				<span v-else
					>load
					{{ props.comment.children + recentUserReplies.length }} replies</span
				>
			</div>
		</div>
		<div
			v-if="isReplyEditorVisible"
			class="replyArea"
		>
			<KeepAlive>
				<MarkdownEditor
					v-if="account"
					@save="onReplySave"
					@cancel="onReplyCancel"
					@comment-change="onReplyChange"
					:draftComment="draftReply"
					level="reply"
					:progress="saveProgress"
					:isSaving="isSaving"
					:hash="props.comment.post_id"
				/>
			</KeepAlive>
			<div class="markdown-renderer-wrap">
				<MarkdownRenderer :content="draftReply" />
			</div>
		</div>
		<div
			v-if="showChildren"
			class="childrenComments"
		>
			<BallotComment
				v-for="reply in recentUserReplies"
				:key="reply.post_id"
				:comment="reply"
			/>
			<BallotComment
				v-for="childComment in childComments"
				:key="childComment.post_id"
				:comment="childComment"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { defineProps, ref, computed } from 'vue'
import {
	postBallotComment2,
	fetchBallotComments,
	postBallotComment
} from '../util'
import BallotComment from './BallotComment.vue'
import MarkdownEditor from './MarkdownEditor.vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import MarkdownRenderer from './MarkdownRenderer.vue'
import { AnchorResponse } from '../types/blockchain'

const $q = useQuasar()
const { getters, $api } = useStore()
const saveProgress = ref(0)
const isSaving = ref(false)
const recentUserReplies = ref([])
const draftReply = ref('')
const isReplyEditorVisible = ref(false)
const showChildren = ref(false)
const childComments = ref(null)
const props = defineProps(['comment'])

const dateTimeFromIso = DateTime.fromISO(props.comment.created_at)
const relativeTime = dateTimeFromIso.toRelative()

const toggleShowChildren = (newValue: boolean) => {
	if (newValue === true && !childComments.value) fetchBallotCommentReplies()
	showChildren.value = newValue
}

const onReplyClick = () => {
	isReplyEditorVisible.value = true
}

const account = computed(() => {
	return getters['accounts/account']
})

const onReplyChange = (newContent: string) => {
	draftReply.value = newContent
}

const fetchBallotCommentReplies = async () => {
	const replies = await fetchBallotComments(
		props.comment.primary_key,
		props.comment.post_id
	)
	childComments.value = replies
}

const onUploadProgress = (progress: number) => {
	console.log('progress: ', progress)
	if (typeof progress !== 'number') return
	saveProgress.value = 10 + progress * 0.5
}

const onReplyCancel = () => {
	isReplyEditorVisible.value = false
}

const onReplySave = async () => {
	const payload = {
		parent_hash: props.comment.post_id,
		content: draftReply.value,
		table: 'ballots',
		contract: 'telos.decide',
		scope: 'telos.decide',
		primary_key: props.comment.primary_key,
		poster: account.value
	}
	saveProgress.value = 10
	try {
		const content_hash: string = await postBallotComment(payload)
		saveProgress.value = 50
		// sign
		const actions = [
			{
				account: 'testcomments',
				name: 'post',
				data: {
					poster: account.value,
					content_hash
				}
			}
		]
		const { transactionId, wasBroadcast }: AnchorResponse =
			await $api.signTransaction(actions)

		recentUserReplies.value = [
			{
				...payload,
				post_id: content_hash,
				created_at: DateTime.local().toISO()
			},
			...recentUserReplies.value
		]
		saveProgress.value = 100
		toggleShowChildren(true)
		// need to refetch
		$q.notify({
			message: 'Comment saved!',
			type: 'positive'
		})
		draftReply.value = ''
		isReplyEditorVisible.value = false
	} catch (err) {
		$q.notify({
			// @ts-ignore
			message: err.message,
			type: 'negative'
		})
	}
}
</script>

<style lang="scss" scoped>
.ballotComment {
	padding: 8px;
	border-radius: 8px;
	margin-top: 36px;
	border: 1px solid #f0f0f0;
	scroll-behavior: smooth;

	.header {
		display: flex;
		justify-content: flex-start;
		align-items: center;

		.accountName {
			font-size: 0.8rem;
			font-weight: bold;
			margin-right: 6px;
			color: $primary;
		}

		.timeAgo {
			font-size: 0.8rem;
			color: #888888;
		}
	}

	.contentWrap {
		margin: 12px auto 12px;

		.content {
			white-space: pre-wrap;
			font-size: 0.9rem;
			font-weight: 600;
		}
	}

	.footer {
		display: flex;
		flex: 1;
		flex-direction: row;
		justify-content: flex-start;
		font-size: 0.9rem;
		color: #888888;
		font-weight: 900;
		text-transform: lowercase;

		> div {
			margin-right: 12px;
		}

		.clickable:hover {
			cursor: pointer;
		}
	}

	.replyArea {
		width: 100%;
		max-width: 700px;
		margin: 0 auto 0 16px;
	}

	.childrenComments {
		margin-left: 24px;
	}
}
</style>
