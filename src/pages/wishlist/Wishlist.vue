<template>
	<div
		v-if="ballots"
		id="wishlist"
	>
		<ballot-filters
			@onSortChange="onSortChange"
		/>
		<wishlist-item
			v-for="ballot in sortedBallots"
			:ballot="ballot"
			:fetchBallots="fetchBallots"
			:form="form"
			@toggleJoinModal="toggleJoinModal"
			@castVote="castVote"
			:voterVotes="voterVotes"
			:key="ballot.ballot_name"
			:shortDescription="true"
		/>
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
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import WishlistItem from './WishlistItem.vue';
import BallotFilters from './BallotFilters.vue';
import { BALLOT_SORT_MAP } from './constants/sort';
import {
	fetchBallots,
	fetchVoter,
	fetchVoterVotes,
	getCastVoteActions,
	getJoinAndVoteActions,
	joinGroupAction
} from './util';
import { ref, onMounted, onUnmounted, computed } from 'vue';

const interval: any = ref(null);
const ballots = ref(null);
const form = ref(false);
const voter = ref(null);
const voterVotes = ref(null);
const sort = ref('highest-approval');
const castVoteData = ref({
	ballot_name: null,
	option: []
});

const store = useStore();
const account = computed(() => {
	return store.getters['accounts/account'];
});

const toggleJoinModal = () => {
	form.value = !form.value;
};

const onSortChange = ({ value: newValue }: { value: string }) => {
	sort.value = newValue;
	getBallots()
};

const castVote = (type: string, ballot: any) => {
	if (!voter.value) {
		castVoteData.value = {
			ballot_name: ballot.ballot_name,
			option: [type]
		};
		toggleJoinModal();
		return;
	}
	const castVoteActions = getCastVoteActions(
		account.value,
		ballot.ballot_name,
		type
	);
	store.$api.signTransaction(castVoteActions);
	castVoteData.value = { ballot_name: null, option: null };
	setTimeout(fetchEverything, 1000);
	setTimeout(fetchEverything, 3000);
};

const getBallots = async () => {
	ballots.value = await fetchBallots();
};

const getVoter = async () => {
	voter.value = await fetchVoter(account.value, 'WISH');
};

const getVoterVotes = async () => {
	voterVotes.value = await fetchVoterVotes(account.value);
};

const fetchEverything = async () => {
	getVoter();
	getVoterVotes();
};

onMounted(() => {
	getBallots()
	fetchEverything();
	interval.value = setInterval(fetchEverything, 10000);
});

onUnmounted(() => {
	clearInterval(interval.value);
});

const sortedBallots = computed(() => {
	if (!ballots.value) return null;
	const sortedBallots = ballots.value.sort(BALLOT_SORT_MAP[sort.value]);
	return sortedBallots;
});

const joinAndVote = async () => {
	const joinAndVoteActions = getJoinAndVoteActions(
		account.value,
		castVoteData.value.ballot_name,
		castVoteData.value.option
	);
	await store.$api.signTransaction(joinAndVoteActions);
	castVoteData.value = { ballot_name: null, option: null };
};

const joinGroup = async () => {
	const actions = joinGroupAction(account.value);
	await store.$api.signTransaction(actions);
	setTimeout(fetchEverything, 1000);
	setTimeout(fetchEverything, 3000);
};
</script>

<style lang="scss">
#wishlist {
	margin-top: 40px;
}
</style>
