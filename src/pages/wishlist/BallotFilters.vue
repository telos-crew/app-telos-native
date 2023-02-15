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
    <q-btn @click="toggleDialog" color="primary" size="lg">
      Create New
    </q-btn>
  </div>
  <q-dialog v-model="dialog">
   <create-item-form :close="toggleDialog" />
  </q-dialog>
</template>

<script>
import CreateItemForm from "./components/CreateItemForm.vue";

const options = [
  { label: "Highest Approval", value: "highest-approval" },
  { label: "Lowest Approval", value: "lowest-approval" }
];
export default {
  components: {
    CreateItemForm
  },
  data() {
    return {
      options,
      sort: null,
      dialog: false
    };
  },
  methods: {
    toggleDialog () {
      this.dialog = !this.dialog
    }
  },
  watch: {
    sort(newValue) {
      this.$emit("onSortChange", newValue);
    },
  },
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
