<template>
  <!--  todo https://github.com/ajaxorg/ace -->
  <q-page class="bg-blue-grey-1">
    <q-card class="shadow-0">
      <q-card-section class="bg-blue-grey-3 q-pa-sm">
        <div class="row items-center">
          <div class="col-8">
            <q-input v-model="data.path" dense outlined readonly>
              <template v-slot:before>
                <div class="no-wrap column items-center">
                  <q-icon name="home"></q-icon>
                  <span class="text-caption">{{ data.type }}</span>
                </div>
              </template>
              <template v-slot:after> </template>
            </q-input>
          </div>
          <div class="col-2"></div>
          <div class="col-2">
            <div class="flex justify-end">
              <q-btn flat icon="save" @click="requestUpdateFileText">
                <q-tooltip>Save changes.</q-tooltip>
              </q-btn>
            </div>
          </div>
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
          :options="ui.aceOption"
          :print-margin="false"
          style="min-height: 600px; height: calc(100vh - 106px)"
          theme="dracula"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { VAceEditor } from "vue3-ace-editor/index";
/*
https://github.com/ajaxorg/ace-builds/blob/master/src-noconflict/ext-modelist.js
*/
import "ace-builds/src-noconflict/mode-nginx";
import "ace-builds/src-noconflict/mode-text";
import "ace-builds/src-noconflict/mode-sql";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-markdown";
import "ace-builds/src-noconflict/mode-css";
import "ace-builds/src-noconflict/mode-python";
import "ace-builds/src-noconflict/mode-php";
import "ace-builds/src-noconflict/theme-dracula";

import { onMounted, onUnmounted, ref } from "vue";
import { useQuasar } from "quasar";
import { getFileText, updateFileText } from "src/api/filebrowser";
import { errorLoading, hideLoading, showLoading } from "src/utils/loading";
import { useRoute } from "vue-router";
import ace from "ace-builds";
import workerJsonUrl from "file-loader?esModule=false!ace-builds/src-noconflict/worker-json.js";
import { detection } from "src/utils/detection-type";

ace.config.setModuleUrl("ace/mode/json_worker", workerJsonUrl);

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
      aceOption: {
        useWorker: true,
        wrap: true,
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
          data.value.type = detection(data.value.path);
          console.log(data.value.type);
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

    function saveContent(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        requestUpdateFileText();
        e.preventDefault();
      }
    }

    onMounted(() => {
      if (route.params.hasOwnProperty("path")) {
        data.value.path = route.params.path;
        requestGetFileText();
      } else {
        ui.value.errMsg = "'path' can not be empty.";
      }

      document.addEventListener("keydown", saveContent, false);
    });

    onUnmounted(() => {
      document.removeEventListener("keydown", saveContent, false);
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
