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
import axios from "axios";
import { mapGetters } from "vuex";
import WishlistItem from "./WishlistItem.vue";
import BallotFilters from "./BallotFilters.vue";
import { BALLOT_SORT_MAP } from './constants/sort';

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
      const action = [
      {
          account: "telos.decide",
          name: "refresh",
          data: {
            voter: this.account,
          },
        },
        {
          account: "telos.decide",
          name: "castvote",
          data: {
            voter: this.account,
            ballot_name: ballot.ballot_name,
            options: [type],
          },
        },
      ];
      this.$store.$api.signTransaction(action);
      this.castVoteData = { ballot_name: null, option: null };
    },
    async joinAndVote() {
      const action = [
        {
          account: "telos-decide",
          name: "regvoter",
          data: {
            voter: this.account,
            treasury_symbol: "4,WISH",
          },
        },
        {
          account: "telos-decide",
          name: "castvote",
          data: {
            voter: this.account,
            ballot_name: this.castVoteData.ballot_name,
            options: [this.castVoteDatatype],
          },
        },
      ];
      await this.$store.$api.signTransaction(action);
      this.castVoteData = { ballot_name: null, option: null };
    },
    async joinGroup() {
      const action = [
        {
          account: "telos-decide",
          name: "regvoter",
          data: {
            voter: this.account,
            treasury_symbol: "4,WISH",
          },
        },
      ];
      await this.$store.$api.signTransaction(action);
      setTimeout(() => {
        this.fetchEverything();
      }, 2000);
      setTimeout(() => {
        this.fetchEverything();
      }, 4000);
    },
    async fetchBallots() {
      // const { rows: ballotData } = await this.$store.$api.getTableRows({
      //   code: "telos.decide",
      //   scope: "telos.decide",
      //   table: "ballots",
      //   index_position: "4",
      //   key_type: "i64",
      //   upper_bound: "VOTE",
      //   lower_bound: "VOTE",
      // });
      const { data: { data: ballotData } } = await axios({
        method: "GET",
        url: `http://localhost:3888/ballots/search/wish.gen.`
      })
      console.log("ballots: ", ballotData);
      this.ballots = ballotData;
    },
    async fetchVoter() {
      const { rows: voters } = await this.$store.$api.getTableRows({
        code: "telos.decide",
        scope: this.account,
        table: "voters",
        upper_bound: "VOTE",
        lower_bound: "VOTE",
      });
      this.voter = voters[0];
    },
    async fetchVoterVotes() {
      const {
        data: {
          votes: { data },
        },
      } = await axios({
        method: "GET",
        url: `http://localhost:3888/votes/${this.account}/4,WISH`,
      });
      this.voterVotes = data;
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
