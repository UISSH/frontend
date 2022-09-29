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
               :label="instanceOfTerminalOpened[item].name">
          <q-icon class="q-pa-sm q-ml-sm" size="16px" @click.stop="closeTerminalTab(item)" name="close"></q-icon>
        </q-tab>
      </q-tabs>
      <q-tab-panels v-model="tab" keep-alive :keep-alive-include="activeTerminalIndex" animated>

        <q-tab-panel class="bg-blue-grey-1 q-pa-none " style="height: calc(100vh -  86px)" name="home">
          <terminal-management @openNewTerminalTab="openNewTerminalTab"></terminal-management>
        </q-tab-panel>

        <q-tab-panel v-for="uuidhex in activeTerminalIndex" :key="uuidhex"
                     :name="uuidhex" style="height: calc(100vh -  130px);width: 100%;background-color: #282a36">
          <terminal-instance :uuid="uuidhex" v-model:title="instanceOfTerminalOpened[uuidhex].name"
                             :auth="instanceOfTerminalOpened[uuidhex].auth"></terminal-instance>
        </q-tab-panel>


      </q-tab-panels>

    </q-card>
    <q-footer  v-if="tab!=='home'">
      <div class="flex justify-between no-wrap">
        <q-btn-dropdown color="primary" icon="density_medium">
          <q-card>
            <q-card-section class="q-pl-sm ">
              <q-option-group
                :options="globalShell.options"
                type="checkbox"
                v-model="globalShell.selected"
              />
            </q-card-section>

          </q-card>
        </q-btn-dropdown>
        <q-input style="width: 100%"  filled dense dark v-model="globalShell.command"
                 @keydown.enter="sendCommand"></q-input>
        <q-btn icon="send" @click="sendCommand" @keydown.enter="sendCommand"></q-btn>
      </div>
    </q-footer>
  </q-page>

</template>

<script>

import {onBeforeUnmount, onMounted, ref, toRaw, watch} from "vue";
import TerminalInstance from "components/Terminal/TerminalInstance";
import TerminalManagement from "components/Terminal/TerminalManagement";
import {generateUUID4} from "src/utils/generate";
import {globalShellCommand} from "stores/example-store";


export default {
  name: "TerminalIndex",
  components: {TerminalInstance, TerminalManagement},
  setup() {
    const GShellCommand = globalShellCommand()

    //{
    //   "uuid_hex":{'name': '', 'auth': {}}
    // }
    const instanceOfTerminalOpened = ref({})
    // [uuid_hex...]
    const activeTerminalIndex = ref([])

    const tab = ref('home') // uuidHex

    const globalShell = ref({
      command: '',
      selectAll: false,
      selected: [],// ['uuidHex','uuidHex',...]
      options: []
    })

    function syncGlobalShellOptions() {
      globalShell.value.options = []
      for(let uuidHex of activeTerminalIndex.value){
         globalShell.value.options.push({"label": instanceOfTerminalOpened.value[uuidHex].name, "value": uuidHex})

      }

    }

    function openNewTerminalTab(data) {
      let _key = generateUUID4()
      instanceOfTerminalOpened.value[_key] = data
      activeTerminalIndex.value.push(_key)
      tab.value = _key
      // globalShell.value.options.push({"label": data.name, "value": _key})
      syncGlobalShellOptions()
    }


    function closeTerminalTab(v) {
      // delete v from activeTerminalIndex
      activeTerminalIndex.value = activeTerminalIndex.value.filter((val => val !== v))
      globalShell.value.selected = globalShell.value.selected.filter((val => val !== v))
      syncGlobalShellOptions()
      tab.value = 'home'
    }

    function sendCommand() {

      if (globalShell.value.selected.length <= 0) {
        GShellCommand.updateMsg([tab.value], globalShell.value.command)
      } else {
        GShellCommand.updateMsg(globalShell.value.selected, globalShell.value.command)
      }
      globalShell.value.command = ''
    }


    onMounted(() => {


    })

    onBeforeUnmount(() => {

    })

    return {
      tab,
      instanceOfTerminalOpened,
      activeTerminalIndex,
      globalShell,
      closeTerminalTab,
      openNewTerminalTab,
      sendCommand

    }
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
