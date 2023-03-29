<template>
	<div
		:id="`ballotComment-${comment.id}`"
		class="ballotComment"
	>
		<div class="header">
			<span class="accountName">@{{ poster }}</span>
			<span class="timeAgo">{{ date }}</span>
		</div>
		<div class="contentWrap">
			<div class="content">
				{{ content }}
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
		</div>
		<div
			v-if="isReplyEditorVisible"
			class="replyArea"
		>
			<KeepAlive>
				<HtmlEditor
					@save="onReplySave"
					@comment-change="onReplyChange"
					:draftComment="draftReply"
					level="reply"
				/>
			</KeepAlive>
		</div>
		<div class="childrenComments">
			<BallotComment
				v-for="reply in recentUserReplies"
				:key="reply.id"
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
import { defineProps, ref, computed, KeepAlive } from 'vue'
import { postBallotComment } from '../util'
import BallotComment from './BallotComment.vue'
import HtmlEditor from './HtmlEditor.vue'
import { useQuasar } from 'quasar'
import { useStore } from 'vuex'

const $q = useQuasar()
const { getters } = useStore()

const recentUserReplies = ref([])
const draftReply = ref('')
const isReplyEditorVisible = ref(false)
const props = defineProps(['comment'])
const { comment } = props
const { poster, content, created_at } = comment
const date = DateTime.fromISO(created_at).toRelative()

const onReplyClick = () => {
	isReplyEditorVisible.value = true
}

const account = computed(() => {
	return getters['accounts/account']
})

const onReplyChange = (content: string) => {
	draftReply.value = content
}

const onReplySave = async () => {
	const payload = {
		ballot_name: comment.ballot_name,
		content: draftReply.value,
		account_name: account.value,
		parent_id: comment.id
	}

	try {
		const { comment: reply } = await postBallotComment(payload)
		$q.notify({
			message: 'Comment saved!',
			type: 'positive'
		})
		draftReply.value = ''
		recentUserReplies.value = [...reply, ...recentUserReplies.value]
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
