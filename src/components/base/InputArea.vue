<template>

  <div class="flex justify-end items-baseline no-wrap">
    <div><input :type="props.type" :value="props.value" class="q-field__input q-pa-sm text-right"></div>
    <div>
      <q-icon :color="ui.color" name="o_copy" size="16px" style="cursor: pointer"
              @click="Public.copy(props.value)"></q-icon>
    </div>
  </div>
</template>

<script>

import {onMounted, ref} from "vue";
import {copyToClipboard} from 'quasar'


export default {
  name: "InputArea",
  props: {
    value: String,
    type: {
      type: String,
      default: "text"
    }
  },
  setup(props) {
    const ui = ref({
      color: "dark"
    })
    const Public = {
      copy(val) {
        copyToClipboard(val)
          .then(() => {
            ui.value.color = "green"
            setTimeout(() => {
              ui.value.color = "dark"
            }, 1000)
          })
          .catch(() => {
            ui.value.color = "red"
            setTimeout(() => {
              ui.value.color = "dark"
            }, 1000)
          })
      }
    }

    return {ui, props, Public}
  }
}
</script>

<style scoped>

</style>
