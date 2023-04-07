<template>
	<div class="file-upload-grid">
		<div
			v-for="file of files"
			class="item"
			v-bind:key="file.key"
		>
			<file-upload-grid-button
				:file="file"
				:accept="accept"
				:chooseFile="chooseFile"
				@delete-file="deleteFile(file.key)"
			/>
		</div>
		<div class="item">
			<file-upload-grid-button
				:accept="accept"
				:chooseFile="chooseFile"
			/>
		</div>
	</div>
	<input
		type="file"
		id="new-upload"
		:accept="accept"
		:style="{ display: 'none' }"
	/>
</template>

<script>
import { uploadMedia } from 'src/pages/wishlist/util'
import { mapGetters } from 'vuex'
import { generateRandomId } from '../util'
import FileUploadGridButton from './FileUploadGridButton.vue'
export default {
	props: ['accept', 'onUpdate'],
	components: {
		FileUploadGridButton
	},
	data() {
		return {
			files: []
		}
	},
	methods: {
		updateFile(newFile) {
			// file either already exists or does not
			const foundFileIndex = this.files.findIndex(
				(file) => file.key === newFile.key
			)
			if (foundFileIndex === -1) {
				this.files.push(newFile)
			} else {
				this.files[foundFileIndex] = {
					...this.files[foundFileIndex],
					...newFile
				}
			}
			this.$emit('update-files', this.files)
		},
		deleteFile(key) {
			const newFiles = this.files.filter((f) => f.key !== key)
			this.files = newFiles
			this.$emit('update-files', newFiles)
		},
		async onFileSelect(key) {
			const usableKey = key || generateRandomId()
			this.updateFile({
				key: usableKey,
				progress: 10,
				isUploading: true
			})
			const file = document.getElementById('new-upload')?.files[0]
			const formData = new FormData()
			formData.append('file', file)
			formData.append('uploader', this.account)
			const onUploadProgress = (progressEvent) => {
				console.log('onuploadprogress', progressEvent)
				const progress = Math.round(
					(progressEvent.loaded * 100) / progressEvent.total
				)
				this.updateFile({
					key: usableKey,
					progress,
					isUploading: true
				})
			}
			try {
				const { hash, filename } = await uploadMedia(formData, onUploadProgress)
				this.updateFile({
					key: usableKey,
					progress: 50,
					isUploading: true
				})
				const newFile = {
					hash,
					filename,
				}
				this.updateFile({
					key: usableKey,
					progress: 0,
					isUploading: false,
					...newFile
				})
			} catch (err) {
				console.log('upload error: ', err)
			}
		},
		chooseFile(key) {
			const fileElem = document.getElementById('new-upload')
			const something = (event) => {
				fileElem.removeEventListener('change', something)
				if (!event.target.value) {
					return
				}
				this.onFileSelect(key)
			}

			fileElem.addEventListener('change', something)
			if (fileElem) {
				fileElem.click()
			}
		}
	},
	computed: {
		...mapGetters({
			account: 'accounts/account'
		})
	}
}
</script>

<style lang="scss">
.file-upload-grid {
	flex: 1;

	.item {
		display: inline-block;
		margin-right: 12px;
		margin-bottom: 12px;
		vertical-align: top;
	}
}
</style>
