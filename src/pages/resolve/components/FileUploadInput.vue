<template>
	<q-input
		filled
		v-model="hash"
		:label="$t('pages.resolve.file_upload_label')"
		bottom-slots
		:hint="$t('pages.resolve.file_upload_hint')"
		:error-message="$t('pages.resolve.file_upload_error')"
		dense
		autofocus
		:loading="isUploading"
		:error="!isUploading && !isHashValid"
		@update:model-value="onHashChange"
		class="file-upload-input"
	>
		<template v-slot:prepend>
			<q-icon
				name="attach_file"
				id="attach-file-button"
			/>
		</template>
		<template v-slot:loading>
			<q-circular-progress
				v-if="isUploading"
				:value="progress"
				size="24px"
				color="primary"
				class="q-ma-md"
			/>
		</template>
		<input
			type="file"
			id="file-input"
		/>
	</q-input>
</template>

<script>
import axios from 'axios'
import { mapGetters } from 'vuex'
import { validateIpfsHash, fetchDstorAccessToken, fetchDstorUploadToken, uploadFileToDstor } from '../util'

export default {
	data() {
		return {
			hash: '',
			progress: 0,
			isUploading: false
		}
	},
	methods: {
		onHashChange(hash) {
			this.$emit('update:hash', hash)
		},
		async onFileSelect() {
			this.isUploading = true
			this.hash = ''
			const file = document.getElementById('file-input')?.files[0]
			const formData = new FormData()
			formData.append('file', file)

			let accessToken
			try {
				accessToken = await fetchDstorAccessToken()
			} catch (err) {
				console.log('access token error: ', err)
			}

			let uploadToken
			try {
				uploadToken = await fetchDstorUploadToken(
					`resolve/${this.account}`,
					accessToken
				)
			} catch (err) {
				console.log('upload token error: ', err)
			}

			const updateProgress = (event) => {
				this.progress =
					Math.round((event.loaded * 100) / event.total) * 0.4 + 30
			}

			try {
				await uploadFileToDstor(
					formData,
					accessToken,
					uploadToken,
					`Upload from Resolve by ${this.account}`,
					updateProgress
				)
			} catch (err) {
				console.log('upload error: ', err)
			}

			let interval = 2000
			let timeout
			const checkStatus = async () => {
				try {
					const { data: statusData } = await axios(
						'https://api.dstor.cloud/v1/upload/get-status/',
						{
							headers: {
								Authorization: `Bearer ${accessToken}`,
								'x-dstor-upload-token': uploadToken
							}
						}
					)
					interval = interval + 250
					timeout = setTimeout(checkStatus, interval)
					switch (statusData.status) {
						case 'ADDING_TO_IPFS':
							this.progress = 80
							break
						case 'SAVING_DATA':
							this.progress = 90
							break
						case 'DONE':
							clearTimeout(timeout)
							this.progress = 100
							setTimeout(() => {
								const newHash = statusData.data[0].Hash
								this.hash = newHash
								this.onHashChange(newHash)
								this.isUploading = false
								this.progress = 0
							}, 1000)
							return
					}
				} catch (err) {
					this.progress = 0
					this.$q.notify({
						message: this.$t('pages.resolve.file_upload_failed'),
						color: 'negative'
					})
				}
			}
			checkStatus()
		}
	},
	computed: {
		...mapGetters({
			account: 'accounts/account'
		}),
		isHashValid() {
			return validateIpfsHash(this.hash)
		}
	},
	mounted: function () {
		const fileSelect = document.getElementById('attach-file-button')
		const fileElem = document.getElementById('file-input')
		fileElem.addEventListener('change', this.onFileSelect)
		fileSelect.addEventListener(
			'click',
			() => {
				if (fileElem) {
					fileElem.click()
				}
			},
			false
		)
	}
}
</script>

<style lang="scss">
.file-upload-input {
	#attach-file-button {
		&:hover {
			cursor: pointer;
		}
	}

	#file-input {
		display: none;
	}
}
</style>
