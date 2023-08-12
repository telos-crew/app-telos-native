<template>
	<div
		:id="`ballotComment-${comment.id}`"
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
					:id="props.comment.id"
				/>
			</KeepAlive>
			<div class="markdown-renderer-wrap">
				<MarkdownRenderer :content="draftReply" />
			</div>
		</div>
		<div
			v-show="showChildren"
			class="childrenComments"
		>
			<!-- showChildren is true BallotComment->Recent
			{{ recentUserReplies }} -->
			<BallotComment
				v-for="reply in recentUserReplies"
				:key="reply.id"
				:comment="reply"
			/>
			<!-- BallotComment->Child
			{{ childComments }} -->
			<BallotComment
				v-for="childComment in childCommentsWihoutRecent"
				:key="childComment.id"
				:comment="childComment"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon'
import { defineProps, ref, computed } from 'vue'
import { fetchReplies, postBallotComment, saveItemComment } from '../util'
import BallotComment from './BallotComment.vue'
import MarkdownEditor from './MarkdownEditor.vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'
import MarkdownRenderer from './MarkdownRenderer.vue'
import { AnchorResponse } from '../types/blockchain'

const $q = useQuasar()
const store = useStore()
const { getters, $api } = store
const saveProgress = ref(0)
const isSaving = ref(false)
const recentUserReplies = ref([])
const draftReply = ref('')
const isReplyEditorVisible = ref(false)
const showChildren = ref(false)
const childComments = ref([])
const props = defineProps(['comment'])

const dateTimeFromIso = DateTime.fromISO(props.comment.created_at)
const relativeTime = dateTimeFromIso.toRelative()

const toggleShowChildren = (newValue: boolean) => {
	if (newValue === true && !childComments.value.length)
		fetchBallotCommentReplies()
	showChildren.value = newValue
}

const onReplyClick = () => {
	isReplyEditorVisible.value = true
}

const account = computed(() => {
	return getters['accounts/account']
})

const childCommentsWihoutRecent = computed(() => {
	return childComments.value.filter((childComment: AnchorResponse) => {
		return !recentUserReplies.value.some((recentReply: AnchorResponse) => {
			return recentReply.id === childComment.id
		})
	})
})

const onReplyChange = (newContent: string) => {
	draftReply.value = newContent
}

// grab direct children from ID
const fetchBallotCommentReplies = async () => {
	const replies = await fetchReplies(props.comment.id)
	childComments.value = replies
}

const onReplyCancel = () => {
	isReplyEditorVisible.value = false
}

const onReplySave = async () => {
	const payload = {
		contract: 'telos.decide',
		table: 'ballots',
		scope: 'telos.decide',
		primary_key: props.comment.primary_key,
		parent_id: props.comment.id,
		poster: account.value,
		level: props.comment.level, // todo
		content: draftReply.value // todo
	}
	const {
		data: { comment }
	} = await saveItemComment(payload, store)
	console.log('comment: ', comment)
	draftReply.value = ''
	recentUserReplies.value.unshift(comment)
	isReplyEditorVisible.value = false
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
