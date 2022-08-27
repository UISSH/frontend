<template>
  <q-page>
    <q-card class="no-border-radius shadow-0">
      <q-tabs
        v-model="tab"
        dense
        class="bg-blue-grey-2"
        inline-label
        indicator-color="red"
        align="left"
        outside-arrows
      >

        <q-tab icon="home" name="home"></q-tab>
        <q-tab v-for="item in activeTerminalIndex" :key="item" :name="item" no-caps
               :label="sshInstance[item].name">
          <q-btn @click.stop="closeTerminalTab(item)" class="q-ml-sm" flat dense icon="close"></q-btn>
        </q-tab>
      </q-tabs>
      <q-tab-panels v-model="tab" keep-alive :keep-alive-include="activeTerminalIndex" animated>

        <q-tab-panel v-for="item in activeTerminalIndex" :key="item"
                     :name="item" style="height: calc(100vh -  90px)" class="bg-dark">
          <terminal-instance v-model:title="sshInstance[item].name" :auth="sshInstance[item].auth"></terminal-instance>
        </q-tab-panel>

        <q-tab-panel class="bg-blue-grey-1 q-pa-none " style="height: calc(100vh -  86px)" name="home">
          <terminal-management @openNewTerminalTab="openNewTerminalTab"></terminal-management>
        </q-tab-panel>
      </q-tab-panels>

    </q-card>
    <q-footer>
      <link href="/static/css/xterm.css" rel="stylesheet"/>
    </q-footer>
  </q-page>
</template>

<script>

import {onBeforeUnmount, onMounted, ref, toRaw} from "vue";
import TerminalInstance from "components/Terminal/TerminalInstance";
import TerminalManagement from "components/Terminal/TerminalManagement";
import {generateUUID4} from "src/utils/generate";


export default {
  name: "DemoPage",
  components: {TerminalInstance, TerminalManagement},
  setup() {

    // {'name':'','auth':{]}
    const sshInstance = ref({})

    const activeTerminalIndex = ref([])

    const tab = ref('home')

    function openNewTerminalTab(data) {
      let _key = generateUUID4()
      console.log(_key)
      sshInstance.value[_key] = data
      activeTerminalIndex.value.push(_key)
      tab.value = _key

    }

    function closeTerminalTab(v) {
      // delete v from activeTerminalIndex
      activeTerminalIndex.value = activeTerminalIndex.value.filter((val => val !== v))
      tab.value = 'home'
    }


    onMounted(() => {


    })

    onBeforeUnmount(() => {

    })

    return {tab, sshInstance, activeTerminalIndex, closeTerminalTab, openNewTerminalTab}
  }
}
</script>

<style scoped>
.card-size {
  padding: 16px;
  min-height: 360px;
  min-width: 360px;
}
</style>
