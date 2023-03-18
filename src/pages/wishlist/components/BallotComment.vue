<template>
	<div class="ballotComment">
		<div class="header">
			<span class="accountName">@{{ account_name }}</span>
			<span class="timeAgo">{{ date }}</span>
		</div>
		<div class="contentWrap">
			<div class="content">
				{{ content }}
			</div>
		</div>
		<div class="footer">
			<div class="permalink">link</div>
			<div class="reply">reply</div>
			<div class="hide">hide</div>
		</div>
		<div class="childrenComments">
			<BallotComment
				v-for="comment in comment.children"
				:key="comment.id"
				:comment="comment"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import { DateTime } from 'luxon';
import { defineProps } from 'vue';
import BallotComment from './BallotComment.vue';
const props = defineProps(['comment']);
const { comment } = props;
const { account_name, content, created_at } = comment;
const date = DateTime.fromISO(created_at).toRelative();
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
	}

	.childrenComments {
		margin-left: 24px;
	}
}
</style>
