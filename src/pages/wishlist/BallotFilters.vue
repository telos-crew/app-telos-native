<template>
	<div id="ballot-filters">
		<div class="sortWrap">
			<q-select
				v-model="sort"
				label="Sort"
				:options="options"
				style="width: 250px"
			>
				<template v-slot:no-option>
					<q-item>
						<q-item-section class="text-grey"> No results </q-item-section>
					</q-item>
				</template>
			</q-select>
		</div>
		<q-btn
			v-if="account"
			@click="checkMembership"
			color="primary"
			size="lg"
		>
			Create New
		</q-btn>
	</div>
	<q-dialog v-model="dialog">
		<create-item-form :close="toggleDialog" />
	</q-dialog>
</template>

<script>
import { mapGetters } from 'vuex';
import CreateItemForm from './components/CreateItemForm.vue';
import { isUserTreasuryVoter, joinGroupAction } from './util';

const options = [
	{ label: 'Highest Approval', value: 'highest-approval' },
	{ label: 'Lowest Approval', value: 'lowest-approval' }
];
export default {
	components: {
		CreateItemForm
	},
	emits: ['onSortChange'],
	data() {
		return {
			options,
			sort: null,
			dialog: false,
			isMember: false
		};
	},
	methods: {
		async fetchMembership () {
			const isMember = await isUserTreasuryVoter(this.account, 'WISH')
			this.isMember = isMember
		},
		async checkMembership() {
			const action = joinGroupAction(this.account)
			if (!this.isMember) {
				this.$q
				.dialog({
					color: 'primary',
					message: `<q-card class="text">
											<p>${this.$t('pages.wishlist.submission_not_member')}</p>
										</q-card>`,
					html: true,
					cancel: true,
					fullWidth: false,
					ok: {
						label: 'OK'
					}
				})
				.onOk(async () => {
					await this.$store.$api.signTransaction(action)
					console.log('something')
					setTimeout(this.fetchMembership, 2000)
					setTimeout(this.fetchMembership, 5000)
				})
			} else {
				this.toggleDialog();
			}
		},
		toggleDialog() {
			this.dialog = !this.dialog;
		}
	},
	computed: {
		...mapGetters({
			account: 'accounts/account'
		})
	},
	watch: {
		sort(newValue) {
			this.$emit('onSortChange', newValue);
		}
	},
	mounted () {
		this.fetchMembership()
	}
};
</script>

<style lang="scss" scoped>
#ballot-filters {
	width: 100%;
	display: flex;
	justify-content: space-between;
	flex-direction: row;
	background: white;
	box-shadow: 0px 20px 48px rgb(0 9 26 / 8%), 0px 7px 15px rgb(0 9 26 / 5%),
		0px 3px 6px rgb(0 9 26 / 4%), 0px 1px 2.25px rgb(0 9 26 / 4%);
	border-radius: 12px;
	margin-bottom: 60px;
	padding: 20px;

	.sortWrap {
		max-width: 300px;
	}
}
</style>
