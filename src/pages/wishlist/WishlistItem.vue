<template>
	<div class="wishlist-ballot" :id="ballot.ballot_name">
		<div class="critical">
			<div class="vote-and-image">
				<div class="vote-box">
					<q-icon
						name="fas fa-arrow-up"
						class="vote-icon up"
						:color="voterVoteKey === 'yes' ? 'primary' : 'secondary'"
						size="36px"
						@click="castVote('yes')"
					/>
					<q-icon
						name="fas fa-arrow-down"
						class="vote-icon down"
						:color="voterVoteKey === 'no' ? 'primary' : 'secondary'"
						size="36px"
						@click="castVote('no')"
					/>
				</div>
				<img
					:src="content?.imageUrls && content.imageUrls[0]"
					class="ballot-image"
				/>
			</div>
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
								<p
									class="description"
									:class="{
										shortDescription: shortDescription
									}"
								>
									{{ ballot.description }}
								</p>
								<div class="metaInfo">
									<div class="iconWrap">
										<q-icon
											v-if="content?.imageUrls?.length"
											v-on:click="changeSlideshow('image')"
											class="icon"
											name="image"
											size="2rem"
										/>
									</div>
									<div class="iconWrap">
										<q-icon
											v-if="content?.contentUrls?.length"
											v-on:click="changeSlideshow('doc')"
											class="icon"
											name="article"
											size="2rem"
										/>
									</div>
									<div>
										<p>Proposed by {{ ballot.publisher }}<br />
										{{ ballot.ballot_name }}</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="score">
						{{ formatVoteCountAsStrings(score) }}
					</div>
				</div>
				<image-slideshow
					v-if="content?.imageUrls && content?.imageUrls[0]"
					:imageUrls="content?.imageUrls"
					v-show="slideshow === 'image' && content?.imageUrls?.length"
					class="slideShow"
				/>
				<doc-slideshow
					v-if="content?.contentUrls && content?.contentUrls[0]"
					:contentUrls="content?.contentUrls"
					v-show="slideshow === 'doc' && content?.contentUrls?.length"
					class="slideShow"
				/>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getBallotResultsAsStrings2 } from '../resolve/util'
import { formatVoteCountAsStrings, parseContent } from './util/'
import ImageSlideshow from './components/ImageSlideshow.vue'
import DocSlideshow from './components/DocSlideshow.vue'
import BezierEasing from 'bezier-easing'
import { add, mul, sub, gt } from 'biggystring'

const easing = BezierEasing(0.0, 0.0, 0.08, 1.0)

export default {
	props: ['ballot', 'voterVotes', 'shortDescription', 'results'],
	components: {
		ImageSlideshow,
		DocSlideshow
	},
	data() {
		return {
			slideshow: 'none',
			score: '0'
		}
	},
	methods: {
		castVote(type) {
			this.$emit('castVote', type, this.ballot)
		},
		changeSlideshow(type) {
			if (type === 'doc') {
				if (this.slideshow !== 'doc') this.slideshow = 'doc'
				else this.slideshow = 'none'
			} else if (type === 'image') {
				if (this.slideshow !== 'image') this.slideshow = 'image'
				else this.slideshow = 'none'
			}
		},
		formatVoteCountAsStrings,
		recalcScore(oldResults, newResults) {
			if (!newResults || !this.ballot) {
				return (this.score = '0')
			}
			const ballotResults = newResults[this.ballot.ballot_name]
			if (!ballotResults) {
				return (this.score = '0')
			}
			const outcome = getBallotResultsAsStrings2(ballotResults)
			const { netYes } = outcome
			const totalIterations = 100
			let iterator = 0
			const start = this.score || '0' // 50 150
			const end = gt(netYes, '0') ? netYes : '0' // 150 50
			const totalDifference = sub(end, start) // 100 -100

			const theInterval = setInterval(() => {
				const ratio = easing(iterator / totalIterations) // .1
				const change = mul(totalDifference, ratio.toString()) // 5 -5
				const result = add(start, change) // 55
				this.score = result

				if (iterator > totalIterations) {
					clearInterval(theInterval)
					this.score = netYes
				} else {
					iterator += 1
				}
			}, 30)
		}
	},
	computed: {
		...mapGetters({
			account: 'accounts/account'
		}),
		content() {
			return parseContent(this.ballot.content)
		},
		voterVoteKey() {
			if (!this.voterVotes) return null
			const voterVote = this.voterVotes.find(
				(vote) => vote.ballot === this.ballot.ballot_name
			)
			if (!voterVote) return null
			return voterVote.weighted_votes[0].key
		}
	},
	watch: {
		results(_results, newResults) {
			this.recalcScore(_results, newResults)
		}
	},
	beforeMount() {
		this.recalcScore('0', this.results)
	}
}
</script>

<style lang="scss">
.wishlist-ballot {
	display: flex;
	flex-direction: row;
	border: 1px solid #ddd;
	border-radius: 15px;
	padding: 12px;
	margin-bottom: 20px;

	@media (max-width: $breakpoint-xs-max) {
		padding: 8px;
	}

	.critical {
		flex: 1;
		display: flex;
		flex-direction: row;
		align-items: flex-start;

		.vote-and-image {
			display: flex;
			flex-direction: row;
		}

		.vote-box {
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			margin-right: 20px;

			.vote-icon {
				&:hover {
					cursor: pointer;
					color: $primary !important;
				}
			}
		}

		.ballot-image {
			width: 100px;
			min-width: 100px;
			height: 100px;
			min-height: 100px;
			margin-right: 20px;

			@media (max-width: $breakpoint-xs-max) {
				width: 60px;
				min-width: 60px;
				height: 60px;
				min-height: 60px;
				margin-right: 10px;
			}
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

							@media (max-width: $breakpoint-xs-max) {
								font-size: 16px;
								line-height: 18px;
							}

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
							margin-right: 1rem;

							&.shortDescription {
								height: Calc(3 * 1em);
								overflow: hidden;
							}
						}

						.infoArea {
							.metaInfo {
								display: flex;
								flex-direction: row;
								align-items: flex-start;
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
				justify-content: center;
				align-items: center;
				font-size: 32px;
				border-radius: 20px;
				padding: 12px;
				min-width: 120px;
				max-height: 8rem;
				border: 1px solid #ccc;

				@media (max-width: $breakpoint-xs-max) {
					font-size: 24px;
					min-width: 80px;
					max-height: 6rem;
				}
			}
		}
	}
}
</style>
