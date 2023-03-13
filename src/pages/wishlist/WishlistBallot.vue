<template>
  <div>
    <wishlist-item
      v-if="ballot"
      :ballot="ballot"
      :fetchBallots="fetchBallots"
      :form="form"
      @toggleJoinModal="toggleJoinModal"
      @castVote="castVote"
      :voterVotes="voterVotes"
      :key="ballot.ballot_name"
    />
    Hello there
    {{ $route.params.ballot_name }}
    {{ ballot }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { fetchBallot } from './util';

const { params } = useRoute()
const { ballot_name } = params
const ballot = ref(null)
console.log('1 ballot_name', ballot_name)
onMounted(async () => {
  console.log('2 ballot_name', ballot_name)
  ballot.value = await fetchBallot(ballot_name)
})

</script>

<style lang="scss">

</style>
