<template>
	<div class="file-upload-grid-button">
		<div
			v-if="!file?.hash"
			class="center"
			:onClick="() => chooseFile(file?.key)"
		>
			<q-circular-progress
				v-if="file?.isUploading"
				:value="file?.progress"
				size="52px"
				color="primary"
				class="q-ma-md"
			/>
			<span
				v-else
				class="text"
			>
				+
			</span>
		</div>
		<div
			v-else-if="isImage"
			:style="{ backgroundImage: `url(${ipfsLink})` }"
			class="image-cover"
			:onClick="() => chooseFile(file?.key)"
		>
			<q-tooltip :delay="1000">
				{{ file?.filename }}
			</q-tooltip>
			<div
				class="delete-icon"
				@click="
					$event.stopPropagation();
					alert = true;
				"
			>
				-
			</div>
		</div>
		<div
			v-else
			class="generic"
		>
			<span class="filename">
				{{ shortenedFilename }}
				<q-tooltip :delay="1000">
					{{ file?.filename }}
				</q-tooltip>
			</span>
			<div
				class="delete-icon"
				@click="
					$event.stopPropagation();
					alert = true;
				"
			>
				-
			</div>
		</div>
	</div>
	<q-dialog v-model="alert">
		<q-card>
			<q-card-section>
				<div class="text-h6">Delete File?</div>
			</q-card-section>
			<q-card-section class="q-pt-none">
				Are you sure that you would like to delete this file?
			</q-card-section>
			<q-card-actions align="right">
				<q-btn
					@click="$emit('deleteFile', file?.key)"
					flat
					label="Delete"
					color="primary"
					v-close-popup
				/>
				<q-btn
					flat
					label="Cancel"
					color="primary"
					v-close-popup
				/>
			</q-card-actions>
		</q-card>
	</q-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import { validateIpfsHash } from '../util';

export default {
	props: ['file', 'chooseFile'],
	data() {
		return {
			alert: false
		};
	},
	computed: {
		...mapGetters({
			account: 'accounts/account'
		}),
		isHashValid() {
			return validateIpfsHash(this.hash);
		},
		isImage() {
			return this.file?.filename?.match(/.(jpg|jpeg|png|gif)$/i);
		},
		ipfsLink() {
			return `https://api.dstor.cloud/ipfs/${this.file?.hash}`;
		},
		shortenedFilename() {
			return this.file?.filename;
		}
	}
};
</script>

<style lang="scss">
.file-upload-grid-button {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100px;
	height: 100px;
	border: 0.5px solid #ccc;
	background-color: #ccc;
	border-radius: 5px;
	padding: 3px;

	&:hover {
		cursor: pointer;
	}

	.center {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 70%;
		width: 70%;
		border-radius: 50%;
		background-color: #ccc;
		.text {
			color: white;
			font-size: 50px;
		}
	}
	#file-input {
		display: none;
	}

	.image-cover {
		width: 100%;
		height: 100%;
		background-size: cover;
		position: relative;

		&:hover {
			.delete-icon {
				display: flex;
			}
		}
	}

	.generic {
		position: relative;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;

		.filename {
			display: -webkit-box;
			-webkit-line-clamp: 3;
			-webkit-box-orient: vertical;
			overflow: hidden;
			font-size: 0.8rem;
		}

		.delete-icon {
		}

		&:hover {
			.delete-icon {
				display: flex;
			}
		}
	}
}

.delete-icon {
	display: none;
	height: 26px;
	width: 26px;
	position: absolute;
	top: 4px;
	right: 4px;
	background-color: red;
	font-size: 36px;
	border-radius: 50%;
	justify-content: center;
	align-items: center;
	color: white;
}

.file-upload-input {
	#attach-file-button {
		&:hover {
			cursor: pointer;
		}
	}
}
</style>
