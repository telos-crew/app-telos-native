<template>
	<div
		:id="`ballotComment-${comment.id}`"
		class="ballotComment"
	>
		<div class="header">
			<span class="accountName">@{{ props.comment.poster }}</span>
			<span class="timeAgo">{{ date }}</span>
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
				v-if="props.comment.children"
				@click="toggleShowReplies"
			>
				load {{ props.comment.children }} replies
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
					@comment-change="onReplyChange"
					:draftComment="draftReply"
					level="reply"
					:progress="saveProgress"
					:isSaving="isSaving"
				/>
			</KeepAlive>
			<div class="markdown-renderer-wrap">
				<MarkdownRenderer :content="draftReply" />
			</div>
		</div>
		<div
			v-if="showReplies"
			class="childrenComments"
		>
			<BallotComment
				v-for="reply in recentUserReplies"
				:key="reply.post_id"
				:comment="reply"
			/>
			<BallotComment
				v-for="childComment in comment.children"
				:key="childComment.id"
				:comment="childComment"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { defineProps, ref, computed } from 'vue'
import { postBallotComment2, fetchCommentByHash } from '../util'
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
const showReplies = ref(false)
const props = defineProps(['comment'])
const date = DateTime.fromISO(props.comment.created_at).toRelative()

const toggleShowReplies = () => {
	showReplies.value = !showReplies.value
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

const onUploadProgress = (progress: number) => {
	if (typeof progress !== 'number') return
	saveProgress.value = progress * 0.5
}

const onReplySave = async () => {
	const payload = {
		parent_id: props.comment.post_id,
		content: draftReply.value,
		table: 'ballots',
		contract: 'telos.decide',
		scope: 'telos.decide',
		primary_key: props.comment.ballot_name,
		poster: account.value
	}

	try {
		const content_hash = await postBallotComment2({
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

		$q.notify({
			message: 'Comment saved!',
			type: 'positive'
		})
		draftReply.value = ''
		// need to refetch
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
