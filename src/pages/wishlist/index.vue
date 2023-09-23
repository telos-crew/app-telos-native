<template>
	<router-view
		@toggle-join-modal="toggleJoinModal"
	></router-view>
	<q-dialog
		v-model="form"
		persistent
	>
		<q-card>
			<q-card-section class="row items-center">
				<p class="q-ml-sm">
					You must be a part of this group in order to cast a vote. Would you
					like to join the group?
					<strong
						>Please note that your vote weight is proportional to your <span class="emphasis">staked</span> TLOS balance.</strong
					>
				</p>
			</q-card-section>

			<q-card-actions align="right">
				<q-btn
					@click="joinGroup"
					flat
					label="Join"
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

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { fetchVoter, joinGroupAction } from './util';
import { useStore } from 'vuex';

const store = useStore();
const form = ref(false);
const toggleJoinModal = () => {
	form.value = !form.value;
};
const account = computed(() => {
	return store.getters['accounts/account'];
});

const joinGroup = async () => {
	const actions = joinGroupAction(account.value);
	await store.$api.signTransaction(actions);
	// need to refetch voter decide balance
	setTimeout(() => fetchVoter(account.value, 'WISH', store), 3000);
	setTimeout(() => fetchVoter(account.value, 'WISH', store), 7000);
	setTimeout(() => fetchVoter(account.value, 'WISH', store), 1100);
};

watch(account, async (newAccount) => {
	if (newAccount) {
		await fetchVoter(newAccount, 'WISH', store);
	}
});
onMounted(() => {
	if (account.value) {
		fetchVoter(account.value, 'WISH', store);
	}
})
</script>

<style lang="scss">
#wishlist {
	margin-top: 40px;
}

.emphasis {
	text-decoration: underline;
}
</style>
