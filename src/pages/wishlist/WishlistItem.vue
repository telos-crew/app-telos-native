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
			<img
				:src="content.imageUrls[0]"
				class="ballot-image"
			/>
			<div class="item-content">
				<div class="main-content">
					<div class="info">
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
											v-on:click="changeSlideshow('image')"
											class="icon"
											name="image"
											size="2rem"
										/>
									</div>
									<div class="iconWrap">
										<q-icon
											v-if="content.contentUrls.length"
											v-on:click="changeSlideshow('doc')"
											class="icon"
											name="article"
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
				<image-slideshow
					:imageUrls="content.imageUrls"
					v-show="slideshow === 'image' && content.imageUrls.length"
					class="slideShow"
				/>
				<doc-slideshow
					:contentUrls="content.contentUrls"
					v-show="slideshow === 'doc' && content.contentUrls.length"
					class="slideShow"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';
import { getBallotResults } from '../resolve/util';
import { formatVoteCount, parseContent } from './util/';
import ImageSlideshow from './components/ImageSlideshow.vue';
import DocSlideshow from './components/DocSlideshow.vue';

export default {
	props: ['ballot', 'voterVotes'],
	components: {
		ImageSlideshow,
		DocSlideshow
	},
	data() {
		return {
			slideshow: 'none'
		};
	},
	methods: {
		castVote(type) {
			this.$emit('castVote', type, this.ballot);
		},
		changeSlideshow(type) {
			if (type === 'doc') {
				if (this.slideshow !== 'doc') this.slideshow = 'doc';
				else this.slideshow = 'none';
			} else if (type === 'image') {
				if (this.slideshow !== 'image') this.slideshow = 'image';
				else this.slideshow = 'none';
			}
		}
	},
	computed: {
		...mapGetters({
			account: 'accounts/account'
		}),
		content() {
			return parseContent(this.ballot.content);
		},
		aggregateVotes() {
			const { netYes } = getBallotResults(this.ballot);
			return formatVoteCount(parseInt(netYes, 10));
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
	border: 1px solid #ddd;
	border-radius: 15px;
	padding: 12px;
	margin-bottom: 20px;

	.critical {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: flex-start;

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

		.item-content {
			display: flex;
			flex: 1;
			flex-direction: column;

			.main-content {
				display: flex;
				flex: 1;
				flex-direction: row;
				justify-content: space-between;
				margin-bottom: 20px;

				.info {
					display: flex;
					flex-direction: row;

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
}
</style>
