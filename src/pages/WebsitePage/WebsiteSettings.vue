<template>
  <q-page class="">
    <div v-if="data.website_id">
      <website-settings :website_id="data.website_id"></website-settings>
    </div>
  </q-page>
</template>

<script>
import WebsiteSettings from "components/website/WebsiteSettings";
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";

export default {
  name: "WebsiteSettingsPage",
  components: { WebsiteSettings },
  setup() {
    let data = ref({
      website_id: null,
    });
    let route = useRoute();

    onMounted(() => {
      data.value.website_id = route.params.id;
    });
    return {
      data,
    };
  },
};
</script>

<style scoped></style>
