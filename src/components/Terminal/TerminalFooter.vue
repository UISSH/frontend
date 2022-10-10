<script setup>
import {ref} from "vue";
import {globalShellCommandStore} from "stores/example-store";

defineEmits(['send'])

const props = defineProps({
  'activated': {
    type: [Object],
    required: true
  },
  'currentUuidHex': {
    type: String,
    required: true
  }
})

const GShellCommand = globalShellCommandStore()

const globalShell = ref({
  command: '',
  selectAll: false,
  selected: [],// ['uuidHex','uuidHex',...]
  options: []
})

function sendCommand() {
  let g = globalShell.value
  if (g.selected.length <= 0) {
    GShellCommand.updateMsg(props.currentUuidHex, g.command)
  } else if (g.selectAll) {
    GShellCommand.updateMsg(['all'], g.command)
  } else {
    GShellCommand.updateMsg(g.selected, g.command)
    g.command = ''
  }
}
</script>

<template>
  <div class="flex justify-between no-wrap">
    <q-btn-dropdown color="primary" icon="density_medium">

      <div class="column no-wrap q-pa-md" style="min-width: 360px;min-height: 360px">
        <div class="col-12">
          <div class="text-h6 q-mb-sm">Target</div>
          <q-option-group
            v-model="globalShell.selected"
            :options="props.activated"
            inline
            type="checkbox"
          />
        </div>

        <div class="col-12">
          <div class="text-h6 q-mb-sm">Snippets</div>
          <q-option-group
            v-model="globalShell.selected"
            :options="props.activated"
            inline
            type="checkbox"
          />
        </div>
      </div>
    </q-btn-dropdown>
    <q-input v-model="globalShell.command" dark dense filled style="width: 100%"
             @keydown.enter="sendCommand"></q-input>
    <q-btn icon="send" @click="sendCommand" @keydown.enter="sendCommand"></q-btn>
  </div>
</template>

<style scoped>
.card-box {
  min-width: 300px;

}
</style>
