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
				<span class="q-ml-sm"
					>You must be a part of this group in order to cast a vote. Would you
					like to join the group?</span
				>
				<p>
					<strong
						>Please note that your vote weight is proportional to your staked
						TLOS balance.</strong
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
import { computed, ref } from 'vue';
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
	setTimeout(() => fetchVoter(account, 'WISH', store), 1000);
	setTimeout(() => fetchVoter(account, 'WISH', store), 3000);
};
</script>
