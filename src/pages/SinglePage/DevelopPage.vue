<template>
  <!--  todo https://github.com/ajaxorg/ace -->
  <div class="q-pa-md bg-blue-grey-1">
    <q-card class="shadow-0">
      <q-card-section class="bg-blue-grey-3">
        <div class="flex no-wrap justify-between">
          <q-input v-model="data.path" dense outlined readonly>
            <template v-slot:before>
              <q-icon name="home"></q-icon>
            </template>
          </q-input>
          <q-btn flat label="save" @click="requestUpdateFileText"></q-btn>
        </div>
      </q-card-section>
      <q-card-section v-if="ui.errMsg.show" class="bg-warning q-pa-sm">
        <div class="flex justify-between items-center">
          <div>{{ ui.errMsg.msg }}</div>
          <q-btn
            dense
            flat
            icon="close"
            @click="ui.errMsg.show = !ui.errMsg.show"
          ></q-btn>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-none">
        <!--
                https://ace.c9.io/build/kitchen-sink.html
        -->
        <v-ace-editor
          v-model:value="data.text"
          :lang="data.type"
          :options="{ fontSize: '18px' }"
          :print-margin="false"
          style="min-height: 600px"
          theme="dracula"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { VAceEditor } from "vue3-ace-editor/index";
import "ace-builds/src-noconflict/mode-nginx";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/theme-dracula";
import { onMounted, ref } from "vue";
import { useQuasar } from "quasar";
import { getFileText, updateFileText } from "src/api/filebrowser";
import { errorLoading, hideLoading, showLoading } from "src/utils/loading";
import { useRoute } from "vue-router";

export default {
  name: "PlainTextEditing",
  components: { VAceEditor },

  setup() {
    const $q = useQuasar();
    const ui = ref({
      errMsg: {
        show: false,
        msg: "Oops...",
      },
    });
    const data = ref({
      text: "",
      type: "text",
      path: null,
    });

    function requestGetFileText() {
      showLoading($q);
      getFileText(data.value.path)
        .then((res) => {
          data.value.text = res.text;
        })
        .catch((err) => {
          errorLoading($q, err);
        })
        .finally(() => {
          hideLoading($q);
        });
    }

    function requestUpdateFileText() {
      if (data.value.path == null) {
        return;
      }

      showLoading($q);
      updateFileText(data.value.path, data.value.text)
        .then((res) => {})
        .catch((err) => {
          errorLoading($q, err);
        })
        .finally(() => {
          hideLoading($q);
        });
    }

    const route = useRoute();

    onMounted(() => {
      if (route.params.hasOwnProperty("path")) {
        data.value.path = route.params.path;
        requestGetFileText();
      } else {
        ui.value.errMsg = "'path' can not be empty.";
      }
    });

    return { ui, data, requestUpdateFileText };
  },
};
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px !important;
}
</style>
