<template>
  <div v-if="ballots" id="wishlist">
    <ballot-filters @onCreateItemFormSuccess="setTimeout(fetchEverything, 2000)" @onSortChange="onSortChange" />
    <wishlist-item
      v-for="ballot in sortedBallots"
      :ballot="ballot"
      :fetchBallots="fetchBallots"
      :form="form"
      @toggleJoinModal="toggleJoinModal"
      @castVote="castVote"
      :voterVotes="voterVotes"
      :key="ballot.ballot_name"
    />
    <q-dialog v-model="form" persistent>
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
          <q-btn flat label="Cancel" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import WishlistItem from "./WishlistItem.vue";
import BallotFilters from "./BallotFilters.vue";
import { BALLOT_SORT_MAP } from './constants/sort';
import { fetchBallots, fetchVoter, fetchVoterVotes, getCastVoteActions, getJoinAndVoteActions } from "./util";

export default {
  components: {
    WishlistItem,
    BallotFilters,
  },
  data() {
    return {
      interval: null,
      ballots: null,
      sortedBalots: null,
      form: null,
      voter: null,
      voterVotes: null,
      sort: "highest-approval",
      castVoteData: {
        ballot_name: null,
        option: null,
      },
    };
  },
  methods: {
    toggleJoinModal() {
      this.form = !this.form;
    },
    onSortChange({ value: newValue }) {
      this.sort = newValue
    },
    castVote(type, ballot) {
      if (!this.voter) {
        this.castVoteData = {
          ballot_name: ballot.ballot_name,
          option: type,
        };
        this.toggleJoinModal();
        return;
      }
      const castVoteActions = getCastVoteActions(this.account, ballot.ballot_name, type)
      this.$store.$api.signTransaction(castVoteActions);
      this.castVoteData = { ballot_name: null, option: null };
    },
    async joinAndVote() {
      const joinAndVoteActions = getJoinAndVoteActions(this.account, this.castVoteData.ballot_name, this.castVoteData.option)
      await this.$store.$api.signTransaction(joinAndVoteActions);
      this.castVoteData = { ballot_name: null, option: null };
    },
    async joinGroup() {
      const joinGroupAction = joinGroupAction(this.account)
      await this.$store.$api.signTransaction(joinGroupAction);
      setTimeout(() => {
        this.fetchEverything();
      }, 2000);
      setTimeout(() => {
        this.fetchEverything();
      }, 4000);
    },
    async fetchBallots() {
      this.ballots = await fetchBallots()
    },
    async fetchVoter () {
      if (!this.account) return
      this.voter = await fetchVoter(this.account, '4,VOTE')
    },
    async fetchVoterVotes() {
      if (!this.account) return
      this.voterVotes = await fetchVoterVotes(this.account);
    },
    async fetchEverything() {
      this.fetchBallots();
      this.fetchVoter();
      this.fetchVoterVotes();
    },
  },
  computed: {
    ...mapGetters({
      account: "accounts/account",
    }),
    sortedBallots() {
      const sortedBallots = [...this.ballots];
      sortedBallots.sort(BALLOT_SORT_MAP[this.sort])
      return sortedBallots
    },
  },
  mounted() {
    this.fetchEverything();

    this.interval = setInterval(() => {
      this.fetchEverything();
    }, 10000);
  },
  unmounted() {
    clearInterval(this.interval);
  },
};
</script>

<style lang="scss">
#wishlist {
  margin-top: 40px;
}
</style>
