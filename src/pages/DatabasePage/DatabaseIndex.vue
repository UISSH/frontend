<template>
  <q-page class="q-gutter-md">
    <databaseTable></databaseTable>
  </q-page>
</template>

<script>
import { ref } from "vue";
import DatabaseTable from "components/database/DatabaseTable";

const ui = ref({});

const data = ref({});
export default {
  name: "DatabaseIndex",
  components: { DatabaseTable },
  setup() {
    return { ui, data };
  },
};
</script>

<style scoped></style>
