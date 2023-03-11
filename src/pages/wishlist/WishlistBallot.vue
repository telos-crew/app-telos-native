<template>
  <div>
    Hello there
    {{ $route.params.ballot_name }}
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router';

const { params } = useRoute()
const { ballot_name } = params

</script>

<style lang="scss">

</style>
