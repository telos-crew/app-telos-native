<template>
	<div class="wishlist-ballot">
		<div class="critical">
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
			<div class="info">
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
					<div class="infoArea">
						<p class="description">{{ ballot.description }}</p>
						<div class="metaInfo">
							<div class="iconWrap">
								<q-icon
									v-if="content.imageUrls.length"
									@click="isImagesExpanded = !isImagesExpanded"
									class="icon"
									name="image"
									size="2rem"
								/>
							</div>
							<p>Proposed by {{ ballot.publisher }}</p>
						</div>
					</div>
				</div>
			</div>
			<div class="score">
				{{ aggregateVotes }}
			</div>
		</div>
		<Slideshow
			:imageUrls="content.imageUrls"
			v-if="isImagesExpanded"
			class="slideShow"
		/>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getBallotResults } from '../resolve/util'
import { formatVoteCount, parseContent } from './util/'
import Slideshow from './components/Slideshow.vue'

export default {
	props: ['ballot', 'voterVotes'],
	compontents: {
		Slideshow
	},
	data() {
		return {
			isImagesExpanded: false
		}
	},
	methods: {
		castVote(type) {
			this.$emit('castVote', type, this.ballot)
		}
	},
	computed: {
		...mapGetters({
			account: 'accounts/account'
		}),
		content() {
			return parseContent(this.ballot.content)
		},
		aggregateVotes() {
			const { netYes } = getBallotResults(this.ballot)
			return formatVoteCount(parseInt(netYes, 10))
		},
		voterVoteKey() {
			if (!this.voterVotes) return null
			const voterVote = this.voterVotes.find(
				(vote) => vote.ballot === this.ballot.ballot_name
			)
			if (!voterVote) return null
			return voterVote.weighted_votes[0].key
		}
	}
}
</script>

<style lang="scss">
.wishlist-ballot {
	display: flex;
	flex-direction: column;
	border: 1px solid #ddd;
	border-radius: 15px;
	padding: 12px;
	margin-bottom: 20px;

	.critical {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		.info {
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
					height: Calc(3 * 1em);
					overflow: hidden;
					margin-right: 1rem;
				}

				.infoArea {
					.metaInfo {
						display: flex;
						flex-direction: row;
						align-items: center;
						margin-top: 8px;
						font-size: 14px;
						color: #666;

						&:hover {
							cursor: pointer;
						}

						p {
							margin-left: 4px;
						}

						.iconWrap {
						}
					}
				}
			}
		}

		.score {
			display: flex;
			font-size: 32px;
			border: 1px solid #ccc;
			border-radius: 20px;
			padding: 12px;
			min-width: 120px;
			justify-content: center;
			align-items: center;
		}
	}
}
</style>
