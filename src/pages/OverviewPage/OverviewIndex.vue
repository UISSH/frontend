<template>
  <q-page class="q-gutter-md bg-blue-grey-1">
    <SystemStatus></SystemStatus>
    <q-card class="shadow-0 ">
      <q-card-section class="text-uppercase">
        {{ $t("charts") }}
      </q-card-section>
      <q-card-section>
        <NetworkTrafficChart></NetworkTrafficChart>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import {onMounted, ref} from "vue";
import NetworkTrafficChart from "components/chart/NetworkTrafficChart";
import SystemStatus from "components/chart/SystemStatus";

const ui = ref({
  systemStatus: {
    cpu: {
      total: 45,
    },
    ram: {
      total: 45,
    },
    ens: {
      total: 45,
    },
  },
});

const Private = {};

const Public = {
  getSystemStatusColor: (val) => {
    if (val < 33) {
      return "positive";
    } else if (val >= 33 && val < 66) {
      return "warning";
    } else {
      return "negative";
    }
  },
};

const data = ref({});
export default {
  name: "OverviewIndex",
  components: {NetworkTrafficChart, SystemStatus},
  setup() {
    onMounted(() => {
    });
    return {ui, data, Public};
  },
};
</script>

<style scoped></style>
