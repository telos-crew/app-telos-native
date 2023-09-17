<script>
import { mapGetters } from 'vuex'
import appIcons from '~/utils/app-icons'
import SignArbitraryMessage from './pages/wishlist/components/SignArbitraryForm.vue'

export default {
	name: 'App',
	data () {
		return {
			arbDataDialog: true
		}
	},
	components: {
		SignArbitraryMessage
	},
	computed: {
		...mapGetters('accounts', ['isAutoLoading']),
		...mapGetters('general', ['isLoading', 'errorMsg', 'successMsg']),
		layout() {
			return `layout-${this.$route.meta.layout || 'main'}`
		}
	},
	watch: {
		errorMsg(msg) {
			console.log('error', msg)
			if (msg) {
				this.showNotification(msg, 'error')
				this.showErrorMsg(null)
			}
		},
		successMsg(msg) {
			if (msg) {
				this.showNotification(msg, 'success')
				this.showSuccessMsg(null)
			}
		},
		isLoading(value) {
			if (value) {
				this.$q.loading.show()
			} else {
				this.$q.loading.hide()
			}
		}
	},
	created() {
		this.$q.iconMapFn = (iconName) => {
			const icon = appIcons[iconName]
			if (icon !== void 0) {
				return { icon }
			}
		}
	},
}
</script>

<template>
	<div :style="{ height: '100%' }">
		<component :is="layout" @doSignArb="doSignArb">
			<router-view @doSignArb="doSignArb" />
		</component>
		<q-inner-loading :showing="isAutoLoading">
			<q-spinner size="3em" />
		</q-inner-loading>
		<q-dialog v-model="arbDataDialog">
			<SignArbitraryMessage
				@doSignArb="doSignArb"
			/>
		</q-dialog>
	</div>
</template>
