<template>
	<div class="wishlist-ballot">
		<div class="left">
			<div class="vote-box">
				<q-icon
					name="fas fa-arrow-up"
					class="icon"
					:color="voterVoteKey === 'yes' ? 'primary' : 'secondary'"
					size="42px"
					@click="castVote('yes')"
				/>
				<q-icon
					name="fas fa-arrow-down"
					class="icon"
					:color="voterVoteKey === 'no' ? 'primary' : 'secondary'"
					size="42px"
					@click="castVote('no')"
				/>
			</div>
			<img
				:src="content.imageUrls[0]"
				class="ballot-image"
			/>
			<div class="content">
				<h3 class="title">
					<router-link :to="`/wishlist/item/${ballot.ballot_name}`">{{
						ballot.title
					}}</router-link>
				</h3>
				<p class="description">{{ ballot.description }}</p>
				<p>Proposed by {{ ballot.publisher }}</p>
			</div>
		</div>
		<div class="score">
			{{ aggregateVotes }}
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getBallotResults, getSymbolInfo } from '../resolve/util';

export default {
	props: ['ballot', 'voterVotes'],
	data() {
		return {
			// voterVote: null,
		};
	},
	methods: {
		castVote(type) {
			this.$emit('castVote', type, this.ballot);
		}
	},
	computed: {
		...mapGetters({
			account: 'accounts/account'
		}),
		content() {
			try {
				const cont = JSON.parse(this.ballot.content);
				return cont;
			} catch (err) {
				console.log('unable to parse content', err);
			}
		},
		aggregateVotes() {
			const { netYes } = getBallotResults(this.ballot);
			return parseInt(netYes, 10);
		},
		voterVoteKey() {
			if (!this.voterVotes) return null;
			const voterVote = this.voterVotes.find(
				(vote) => vote.ballot === this.ballot.ballot_name
			);
			if (!voterVote) return null;
			return voterVote.weighted_votes[0].key;
		}
	}
};
</script>

<style lang="scss">
.wishlist-ballot {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	border: 1px solid #ddd;
	border-radius: 15px;
	padding: 12px;
	margin-bottom: 20px;

	.left {
		display: flex;
		flex-direction: row;
		.vote-box {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-right: 20px;

			.icon {
				&:hover {
					cursor: pointer;
				}
			}
		}
		.ballot-image {
			width: 100px;
			min-width: 100px;
			height: 100px;
			min-height: 100px;
			margin-right: 20px;
		}

		.content {
			h3.title {
				font-size: 22px;
				line-height: 24px;
				margin-top: 0px;
				margin-bottom: 8px;
				font-family: 'silkalight';
				font-weight: bold;

				a {
					text-decoration: none;

					&:hover {
						text-decoration: underline;
					}
				}

				&:hover {
					cursor: pointer;
				}
			}

			.description {
				height: Calc(4 * 1.2em);
				overflow: hidden;
			}
		}
	}

	.score {
		display: flex;
		font-size: 48px;
		border: 1px solid #ccc;
		border-radius: 20px;
		padding: 12px;
		min-width: 120px;
		justify-content: center;
		align-items: center;
	}
}
</style>
