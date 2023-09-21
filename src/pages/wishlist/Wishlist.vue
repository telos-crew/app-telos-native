<template>
	<div
		v-if="ballots && results"
		id="wishlist"
	>
		<ballot-filters
			@onSortChange="onSortChange"
		/>
		<wishlist-item
			v-for="ballot in sortedBallots"
			:ballot="ballot"
			:results="results"
			@castVote="castVote"
			:voterVotes="voterVotes"
			:key="ballot.ballot_name"
			:shortDescription="true"
		/>
	</div>
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
import WishlistItem from './WishlistItem.vue';
import BallotFilters from './BallotFilters.vue';
import { OUTCOME_SORT_MAP } from './constants/sort';
import {
	fetchBallots,
	fetchVoterVotes,
	getCastVoteActions,
	fetchResults

} from './util';
import { ref, onMounted, onUnmounted, computed } from 'vue';

const emit = defineEmits(['toggleJoinModal', 'castVote']);
const interval: any = ref(null);
const ballots = ref(null);
const voterVotes = ref(null);
const results = ref(null);
const sort = ref('highest-approval');
const castVoteData = ref({
	ballot_name: null,
	option: []
});

const store = useStore();

const account = computed(() => {
	return store.getters['accounts/account'];
});

const voter = computed(() => {
	return store.getters['wishlist/voter'];
});

const onSortChange = ({ value: newValue }: { value: string }) => {
	sort.value = newValue;
	getBallots()
};

const castVote = async (type: string, ballot: any) => {
	if (!voter.target) {
		castVoteData.value = {
			ballot_name: ballot.ballot_name,
			option: [type]
		};
		return emit('toggleJoinModal')
	}
	const castVoteActions = getCastVoteActions(
		account.value,
		ballot.ballot_name,
		type
	);
	await store.$api.signTransaction(castVoteActions);
	console.log('signed')
	castVoteData.value = { ballot_name: null, option: null };
	setTimeout(fetchEverything, 4000);
	setTimeout(fetchEverything, 7000);
	setTimeout(fetchEverything, 10000);
};

const getBallots = async () => {
	ballots.value = await fetchBallots();
};

const getVoterVotes = async () => {
	voterVotes.value = await fetchVoterVotes(account.value);
};

const getResults = async () => {
	results.value = await fetchResults();
};

const fetchEverything = async () => {
	getVoterVotes();
	getResults()
};

onMounted(() => {
	getBallots()
	fetchEverything();
	// interval.value = setInterval(fetchEverything, 10000);
});

onUnmounted(() => {
	clearInterval(interval.value);
});

const sortedBallots = computed(() => {
	if (!ballots.value) return null;
	// const sortedBallots = ballots.value.sort(OUTCOME_SORT_MAP[sort.value]);
	const sortedBallots = ballots.value.sort(
		OUTCOME_SORT_MAP(results.value)[sort.value]
	)
	return sortedBallots;
});
</script>

<style lang="scss">
#wishlist {
	margin-top: 40px;
}
</style>
