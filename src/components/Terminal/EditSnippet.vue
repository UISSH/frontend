<script setup>


import ace from "ace-builds";
import "ace-builds/src-noconflict/theme-tomorrow_night_eighties";
import "ace-builds/src-noconflict/mode-sh";
import workerJsonUrl from "file-loader?esModule=false!ace-builds/src-noconflict/worker-json.js";
import {VAceEditor} from "vue3-ace-editor/index";

import {onMounted, ref} from "vue";
import {createKV, getKV, updateKV} from "src/api/kvStorage";
import {useQuasar} from "quasar";
import {errorLoading, hideLoading, showLoading} from "src/utils/loading";
import {TERMINAL_SNIPPET_PREFIX} from "src/utils/struct";

ace.config.setModuleUrl("ace/mode/json_worker", workerJsonUrl);
const data = ref({
  name: '',
  content: '',
  created: false
})
const props = defineProps(['name', 'content'])
defineEmits(['close'])
const $q = useQuasar()

function getValue() {
  showLoading($q)
  getKV(TERMINAL_SNIPPET_PREFIX + data.value.name).then(res => {
    data.value.content = res.value
  }).catch(err => {
    errorLoading($q, err)
  }).finally(() => {
    hideLoading($q)
  })

}

function updateValue() {
  if (data.value.name == null || data.value.name.trim() === '') {
    return
  }

  showLoading($q)
  if (data.value.created) {
    createKV(TERMINAL_SNIPPET_PREFIX + data.value.name, data.value.content).then(res => {
      data.value.created = false
    }).finally(() => {
      hideLoading($q)
    })
  } else {
    updateKV(TERMINAL_SNIPPET_PREFIX + data.value.name, data.value.content).finally(() => {
      hideLoading($q)
    })
  }
}


onMounted(() => {

  if (props.name) {
    data.value.name = props.name
    getValue()
  } else {
    data.value.created = true
  }

})

</script>

<template>
  <q-card class="shadow-0">
    <q-card-section class="bg-grey-2 q-pa-sm">
      <div class="row items-center justify-between">
        <div class="col-4">
          <q-input v-model="data.name" color="dark" dense label="name"></q-input>
        </div>
        <div class="col-2"></div>
        <div class="col-2">
          <div class="flex justify-end">
            <q-btn color="dark" dense flat icon="save" @click="updateValue">
            </q-btn>
            <q-btn color="dark" dense flat icon="o_close" @click="$emit('close')"></q-btn>
          </div>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-none">
      <!--
              https://ace.c9.io/build/kitchen-sink.html
      -->
      <v-ace-editor
        v-model:value="data.content"
        :options="{ useWorker: true,wrap: true }"
        :print-margin="false"
        lang="sh"
        style="min-height: 450px;"
        theme="tomorrow_night_eighties"
      />
    </q-card-section>

  </q-card>
</template>


<style scoped>

</style>
