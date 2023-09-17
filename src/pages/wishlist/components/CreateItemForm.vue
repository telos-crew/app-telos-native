<template>
	<q-card class="create-new-form">
		<q-card-section>
			<div class="text-h6">{{ $t('pages.wishlist.create_new_title') }}</div>
		</q-card-section>

		<q-card-section class="q-pt-none">
			<p>
				Please fill out the following info for your requested wishlist item:
			</p>
		</q-card-section>
		<q-card-section class="q-pt-none">
			<q-input
				v-model="title"
				filled
				:label="$t('pages.wishlist.title')"
				bottom-slots
				:hint="$t('pages.wishlist.create_new_title_hint')"
			/>
		</q-card-section>
		<q-card-section class="q-pt-none">
			<q-select
				v-model="wishlistCategory"
				:options="existingCategories"
				label="Category (or add new)"
				new-value-mode="add-unique"
				use-input
				@new-value="onAddNewCategory"
			/>
		</q-card-section>

		<!-- <q-card-section class="q-pt-none">
            <q-input
                v-model="subtitle"
                filled
                :label="$t('pages.wishlist.subtitle')"
                bottom-slots
                :hint="$t('pages.wishlist.create_new_subtitle_hint')"
            />
        </q-card-section> -->

		<q-card-section class="q-pt-none">
			<q-input
				type="textarea"
				v-model="description"
				filled
				:label="$t('pages.wishlist.description')"
				bottom-slots
				:hint="$t('pages.wishlist.create_new_description_hint')"
			/>
		</q-card-section>

		<q-card-section class="input-row">
			<p><strong>Attach Documents:</strong></p>
			<file-upload-grid
				scope="imageItems"
				@update-files="(files) => onUpdateFiles(files, 'contentUrls')"
				accept="*/*"
			/>
		</q-card-section>

		<q-card-section class="input-row">
			<p><strong>Attach Images:</strong></p>
			<file-upload-grid
				scope="contentItems"
				@update-files="(files) => onUpdateFiles(files, 'imageUrls')"
				accept="image/png, image/jpeg"
			/>
		</q-card-section>

		<q-card-actions
			align="right"
			class="text-primary"
		>
			<q-btn
				flat
				:label="$t('common.buttons.submit')"
				@click="checkSubmit"
				:loading="processing"
			/>
			<q-btn
				flat
				:label="$t('common.buttons.cancel')"
				@click="close"
			/>
		</q-card-actions>
	</q-card>
</template>

<script>
// title, subtitle, description, images, ballot ID, content URL
import FileUploadGrid from 'src/pages/resolve/components/FileUploadGrid.vue'
import { generateRandomId, getSymbolInfo } from 'src/pages/resolve/util'
import { mapGetters } from 'vuex'
import {
	calculateDecideFeeDeficit,
	fetchWishlistCategories,
	getFeeAmount,
	getUserContractBalance
} from '../util'
import { lt } from 'biggystring'

export default {
	components: {
		FileUploadGrid
	},
	props: ['submit', 'close'],
	data() {
		return {
			title: 'Telegram Bot Alert for Works and Amend',
			// subtitle: '',
			description: 'This is just a test',
			imageUrls: [],
			contentUrls: [],
			wishlistCategory: '',
			existingCategories: [],
			processing: false
		}
	},
	methods: {
		async checkSubmit() {
			try {
				if (!this.wishlistCategory) {
					throw new Error('Must choose a category')
				}
				this.processing = true
				const deficit = await calculateDecideFeeDeficit(this.account)
				const isEnough = lt(deficit, '0')
				if (isEnough) return this.submitForm()
				// check deficit vs TLOS balance
				const coreLiquidBalance = this.accountData.core_liquid_balance
				const { amount: liquid } = getSymbolInfo(coreLiquidBalance)
				const feeAmount = await getFeeAmount('telos.decide', 'ballot')
				const contractBalance = await getUserContractBalance(
					'telos.decide',
					this.account
				)
				// if has enough
				if (lt(deficit, liquid)) {
					this.$q
						.dialog({
							color: 'primary',
							message: `<q-card class="text">
												<p>${this.$t('pages.wishlist.submission_need_transfer', {
													feeAmount,
													contractBalance,
													deficit
												})}</p>
											</q-card>`,
							html: true,
							cancel: true,
							fullWidth: false,
							ok: {
								label: 'OK'
							}
						})
						.onOk(() => this.submitForm(deficit))
					return
				}
				// alert user of insufficient funds
				this.$q.dialog({
					color: 'primary',
					message: `<q-card class="text">
												<p>${this.$t('pages.wishlist.submission_insufficient_funds')}</p>
											</q-card>`,
					html: true,
					fullWidth: false
					// ok: {
					// 	label: 'OK'
					// }
				})
			} catch (err) {
				this.$q.notify({
					message: err.message,
					color: 'negative'
				})
			} finally {
				this.processing = false
			}
		},
		async submitForm(deficit) {
			const currentTime = new Date()
			const currentUnixTimestamp = currentTime.getTime()
			const endTimestamp = currentUnixTimestamp + 86400 * 3 * 365 * 1000
			const utcDate = new Date(endTimestamp)
			const [utcIsoString] = utcDate.toISOString().split('Z')
			const ballot_name = `wish.gen.${generateRandomId().slice(0, 3)}`
			const content = {
				imageUrls: this.imageUrls,
				contentUrls: this.contentUrls,
				wishlistCategory: this.wishlistCategory.label.trim()
			}
			const formattedDeficit = parseFloat(deficit).toFixed(4)
			const actions = []
			if (deficit) {
				actions.push({
					account: 'eosio.token',
					name: 'transfer',
					data: {
						from: this.account,
						to: 'telos.decide',
						quantity: `${formattedDeficit} TLOS`,
						memo: 'deposit for wishlist'
					}
				})
			}
			actions.push(
				{
					account: 'telos.decide',
					name: 'newballot',
					data: {
						ballot_name,
						category: 'proposal',
						publisher: this.account,
						treasury_symbol: '4,WISH',
						voting_method: '1acct1vote',
						initial_options: ['yes', 'no', 'abstain']
					}
				},
				{
					account: 'telos.decide',
					name: 'togglebal',
					data: {
						ballot_name,
						setting_name: 'votestake'
					}
				},
				{
					account: 'telos.decide',
					name: 'editdetails',
					data: {
						ballot_name,
						title: this.title,
						description: this.description,
						content: JSON.stringify(content)
					}
				},
				{
					account: 'telos.decide',
					name: 'openvoting',
					data: {
						ballot_name,
						end_time: utcIsoString
					}
				}
			)
			console.log('actions: ', actions)
			try {
				await this.$store.$api.signTransaction(actions)
				this.$emit('create-item-form-success')
				setTimeout(this.close, 5000)
			} catch (err) {
				console.log('create ballot error: ', err)
			}
		},
		onUpdateFiles(newFiles, scope) {
			const formattedFiles = newFiles.map((file) => {
				return `https://api.dstor.cloud/ipfs/${file.hash}`
			})
			this[scope] = formattedFiles
		},
		async getWishlistCategories() {
			this.existingCategories = await fetchWishlistCategories()
		},
		onAddNewCategory(e) {
			const newCategory = {
				label: e.trim(),
				value: e.trim().replace(' ', '_').toLowerCase()
			}
			const newCategories = [...this.existingCategories, newCategory]
			this.existingCategories = newCategories
		}
	},
	computed: {
		...mapGetters({
			account: 'accounts/account',
			accountData: 'accounts/accountData'
		}),
		isFormReady() {
			if (!this.title && !this.description) return false
			return true
		}
	},
	mounted() {
		this.getWishlistCategories()
	}
}
</script>

<style lang="scss">
.create-new-form {
	max-width: 450px;
	width: 90%;
}
</style>
