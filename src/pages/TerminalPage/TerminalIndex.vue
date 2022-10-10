<template>
  <q-page>
    <q-card class="no-border-radius shadow-0">
      <q-tabs
        v-model="tab"
        align="left"
        class="bg-blue-grey-2"
        dense
        indicator-color="red"
        inline-label
        outside-arrows
      >

        <q-tab icon="home" name="home"></q-tab>
        <q-tab v-for="item in activeTerminalIndex" :key="item" :label="instanceOfTerminalOpened[item].name" :name="item"
               no-caps>
          <q-icon class="q-pa-sm q-ml-sm" name="close" size="16px" @click.stop="closeTerminalTab(item)"></q-icon>
        </q-tab>
      </q-tabs>


      <q-tab-panels v-model="tab" :keep-alive-include="activeTerminalIndex" animated keep-alive>
        <!--   Host   -->
        <q-tab-panel class="bg-blue-grey-1 q-pa-none " name="home" style="height: calc(100vh -  86px)">
          <terminal-management @openNewTerminalTab="openNewTerminalTab"></terminal-management>
        </q-tab-panel>

        <!--   Instance   -->
        <q-tab-panel v-for="uuidhex in activeTerminalIndex" :key="uuidhex"
                     :name="uuidhex" style="height: calc(100vh -  130px);width: 100%;background-color: #282a36">
          <terminal-instance v-model:title="instanceOfTerminalOpened[uuidhex].name"
                             :auth="instanceOfTerminalOpened[uuidhex].auth"
                             :uuid="uuidhex"></terminal-instance>
        </q-tab-panel>


      </q-tab-panels>

    </q-card>
    <q-footer v-if="tab!=='home'">
      <terminal-footer :activated="globalActivatedShell" :currentUuidHex="tab"></terminal-footer>
    </q-footer>
  </q-page>

</template>

<script>

import {onBeforeUnmount, onMounted, ref} from "vue";
import TerminalInstance from "components/Terminal/TerminalInstance";
import TerminalManagement from "components/Terminal/TerminalManagement";
import TerminalFooter from "components/Terminal/TerminalFooter";
import {generateUUID4} from "src/utils/generate";


export default {
  name: "TerminalIndex",
  components: {TerminalInstance, TerminalManagement, TerminalFooter},
  setup() {

    //{
    //   "uuid_hex":{'name': '', 'auth': {}}
    // }
    const instanceOfTerminalOpened = ref({})
    // [uuid_hex...]
    const activeTerminalIndex = ref([])
    const globalActivatedShell = ref([])
    const tab = ref('home') // uuidHex


    function syncGlobalShellOptions() {
      /*
      * Update the activated terminal in the terminal selection box.
      * */
      globalActivatedShell.value = []
      for (let uuidHex of activeTerminalIndex.value) {
        globalActivatedShell.value.push({"label": instanceOfTerminalOpened.value[uuidHex].name, "value": uuidHex})

      }

    }

    function openNewTerminalTab(data) {
      let _key = generateUUID4()
      instanceOfTerminalOpened.value[_key] = data
      activeTerminalIndex.value.push(_key)
      tab.value = _key
      // globalActivatedShell.value.push({"label": data.name, "value": _key})
      syncGlobalShellOptions()
    }


    function closeTerminalTab(v) {
      // delete v from activeTerminalIndex
      activeTerminalIndex.value = activeTerminalIndex.value.filter((val => val !== v))
      syncGlobalShellOptions()
      tab.value = 'home'
    }


    onMounted(() => {


    })

    onBeforeUnmount(() => {

    })

    return {
      tab,
      instanceOfTerminalOpened,
      activeTerminalIndex,
      closeTerminalTab,
      openNewTerminalTab,
      globalActivatedShell

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
