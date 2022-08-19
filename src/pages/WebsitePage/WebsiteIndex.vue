<template>
  <q-page class="q-pa-sm q-gutter-md">
    <websiteTable></websiteTable>
  </q-page>
</template>

<script>
import { ref } from "vue";
import WebsiteTable from "components/website/WebsiteTable";

const ui = ref({});

const data = ref({});
export default {
  name: "WebsiteIndex",
  components: { WebsiteTable },
  setup() {
    return { ui, data };
  },
};
</script>

<style scoped></style>
