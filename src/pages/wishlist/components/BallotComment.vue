<template>
	<div class="ballotComment">
		<div class="header">
			<span class="accountName">@{{ account_name }}</span>
		</div>
		<div class="contentWrap">
			<div class="content">
				{{ content }}
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
const props = defineProps(['comment', 'level']);
const { comment, level } = props;
const { account_name, content, created_at, is_deleted } = comment;
console.log('ballotComment comment', comment);
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
		}
	}

	.contentWrap {
		margin-top: 6px;

		.content {
			white-space: pre-wrap;
		}
	}
}
</style>
