<template>
  <q-page class="">
    <div v-if="data.pk">
      <database-settings :pk="data.pk"></database-settings>
    </div>
  </q-page>
</template>

<script>
import {useRoute} from "vue-router";
import {onMounted, ref} from "vue";
import DatabaseSettings from "components/database/DatabaseSettings";

export default {
  name: "DatabaseSettingsPage",
  components: {DatabaseSettings},
  setup() {
    let data = ref({
      pk: null,
    });
    let route = useRoute();

    onMounted(() => {
      data.value.pk = route.params.id;
    });
    return {
      data,
    };
  },
};
</script>

<style scoped></style>
