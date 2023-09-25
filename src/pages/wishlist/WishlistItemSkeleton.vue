<template>
	<div class="wishlist-ballot">
		<div class="critical">
			<div class="vote-and-image">
				<div
					v-if="account"
					class="vote-box"
				>
					<q-skeleton
						type="rect"
						class="vote-icon up"
						height="36px"
						width="36px"
					/>
					<q-skeleton
						type="rect"
						class="vote-icon down"
						height="36px"
						width="36px"
					/>
				</div>
				<q-skeleton
					type="rect"
					class="ballot-image"
				/>
			</div>
			<div class="item-content">
				<div class="main-content">
					<div class="info">
						<div class="content">
							<h3 class="title">
								<q-skeleton
									type="text"
									height="24px"
									width="200px"
								/>
							</h3>
							<div class="infoArea">
								<p class="description shortDescription">
									<q-skeleton
										type="text"
										height="21px"
									/>
								</p>
								<div class="metaInfo">
									<div class="iconWrap">
										<q-skeleton
											class="icon"
											type="rect"
											height="32px"
											width="32px"
										/>
									</div>
									<div class="iconWrap">
										<q-skeleton
											class="icon"
											type="rect"
											height="32px"
											width="32px"
										/>
									</div>
									<div>
										<p>
											<q-skeleton
												type="text"
												width="144px"
											/>
											<q-skeleton
												type="text"
												width="96px"
											/>
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
					<div class="score">
						<q-skeleton
							type="text"
							height="32px"
							width="48px"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
	computed: {
		...mapGetters({
			account: 'accounts/account'
		})
	}
}
</script>

<style lang="scss" scoped>
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
				&.up {
					margin-bottom: 4px;
				}
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
									margin-right: 8px;
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
