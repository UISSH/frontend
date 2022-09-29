<template>
  <!--  todo https://github.com/ajaxorg/ace -->
  <q-card class="shadow-0 rounded-borders q-pa-none">
    <q-card-section class="q-pa-none">
      <q-banner v-if="ui.errMsg.show" class="bg-warning">
        <div class="flex justify-between items-center">
          <div>{{ ui.errMsg.msg }}</div>
          <q-btn
            dense
            flat
            icon="close"
            @click="ui.errMsg.show = false"
          ></q-btn>
        </div>
      </q-banner>

      <v-ace-editor
        v-model:value="content"
        :lang="props.lang"
        :options="ui.aceOption"
        :print-margin="false"
        style="min-height: calc(100vh - 180px)"
        theme="dracula"
        @change="configContentChanged"
      />
    </q-card-section>
    <q-card-actions align="around" class="q-gutter-md">
      <q-btn
        color="primary"
        icon="o_done"
        label="ok"
        @click="requestPatchWebsite"
      ></q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
import {VAceEditor} from "vue3-ace-editor/index";
import "ace-builds/src-noconflict/mode-nginx";
import "ace-builds/src-noconflict/theme-xcode";
import "ace-builds/src-noconflict/theme-dracula";
import workerJsonUrl from "file-loader?esModule=false!ace-builds/src-noconflict/worker-json.js";

import {onMounted, onUnmounted, ref} from "vue";
import {updateWebConfig} from "src/api/website";
import {errorLoading, hideLoading, showLoading} from "src/utils/loading";
import {useQuasar} from "quasar";
import ace from "ace-builds";

ace.config.setModuleUrl("ace/mode/json_worker", workerJsonUrl);

export default {
  name: "WebServerConfig",
  components: {VAceEditor},
  props: {
    pk: {
      type: String,
      default: "-1",
    },
    lang: {
      type: String,
      default: "nginx",
    },
    data: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const content = ref("");
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
    onMounted(() => {
      content.value = props.data;
    });

    onUnmounted(() => {
      content.value = "";
    });

    function requestPatchWebsite() {
      let _old = content.value;
      showLoading($q);

      updateWebConfig(props.pk, content.value)
        .then((res) => {
          content.value = res.web_server_config;
        })
        .catch((err) => {
          errorLoading($q, err);
          console.log(err.response.status);
          if (err.response.status === 400) {
            ui.value.errMsg.msg = err.response.data.web_server_config;
            ui.value.errMsg.show = true;
            content.value = _old;
          }
        })
        .finally(() => {
          hideLoading($q);
        });
    }

    function configContentChanged(data) {
      console.log(content.value);
    }

    return {props, content, configContentChanged, ui, requestPatchWebsite};
  },
};
</script>

<style scoped>
.rounded-borders {
  border-radius: 8px !important;
}
</style>
