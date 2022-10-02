<template>
  <q-card class="no-border-radius" style="height: 100%">
    <q-card-section>
      <input autocomplete="new-password" hidden type="password">
      <div class="flex justify-between">
        <div class="text-h6">Host</div>
        <q-btn-dropdown color="dark" icon="add" style="border-radius:16px" text-color="">
          <q-card style="min-width: 420px">
            <q-card-section class="bg-blue-grey-1 text-dark ">
              <div class="flex q-gutter-sm items-center">
                <q-icon name="o_terminal" size="24px"></q-icon>
                <div class="text-h6">Host</div>
              </div>
            </q-card-section>

            <q-card-section class="q-gutter-sm">
              <q-input v-model="data.newSSH.name" color="dark" label="name"></q-input>
              <div class="row">
                <q-input v-model="data.newSSH.hostname" class="col-10" color="dark" label="host"></q-input>
                <q-input v-model="data.newSSH.port" class="col-2" color="dark" label="port"></q-input>
              </div>
              <q-input
                v-model="data.newSSH.username" class="col-6" color="dark"
                label="username"></q-input>
              <div v-if="!data.newSSH.keyLogin" class="row">

                <q-input
                  v-model="data.newSSH.password" class="col-12" color="dark" label="password"
                  type="password"></q-input>
              </div>

              <div v-if="data.newSSH.keyLogin" class="row">
                <q-file v-model="data.newSSH.private_key_file"
                        class="col-6"
                        color="dark"
                        label="key"
                        @update:model-value="updatePrivateKey"

                />
                <q-input v-model="data.newSSH.private_key_password" class="col-6" color="dark"
                         label="key password"></q-input>
              </div>

              <q-toggle v-model="data.newSSH.keyLogin" color="dark" label="Enable Keys Login"></q-toggle>
            </q-card-section>
            <q-card-actions class="justify-around">
              <q-btn class="text-capitalize" color="dark" icon="o_bolt" icon-right="" label="connect"
                     no-caps @click="connectSSH"/>
              <q-btn color="dark" icon="o_add" icon-right="" label="add" @click="addSSH"/>
              <q-btn v-close-popup class="text-capitalize" color="dark" icon="cancel" icon-right="" label="cancel"
                     no-caps></q-btn>
            </q-card-actions>
          </q-card>
        </q-btn-dropdown>
      </div>

      <q-separator class="q-mt-sm q-mb-sm"></q-separator>
      <div class=" flex q-gutter-sm">
        <div v-for="name in Object.keys(SSHClient)" :key="name">
          <div class="flex justify-between bg-blue-grey rounded-borders" style="width: 300px">
            <q-btn :label="name" flat style="min-width: 268px" text-color="white" @click="clickSSHClient(name)"/>
            <q-btn-dropdown flat style="max-width: 8px" text-color="white">
              <q-list>
                <q-item v-close-popup clickable @click="deleteSSH(name)">

                  <q-item-section>Delete</q-item-section>
                  <q-item-section avatar>
                    <q-icon color="red" name="o_delete"/>
                  </q-item-section>

                </q-item>
                <q-item v-ripple clickable @click="addBookmark(name)">
                  <q-item-section>Bookmark</q-item-section>
                  <q-item-section avatar>
                    <q-icon color="red" name="bookmark_border"/>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </div>
        </div>
      </div>


    </q-card-section>
  </q-card>

</template>

<script>
import {onMounted, onUnmounted, ref, toRaw} from "vue";
import KVStorage from "src/utils/kv-storage";
import {useRoute} from "vue-router";
import {shortcutStore} from "stores/shortcut";

export default {
  name: "TerminalManagement",
  setup(props, {emit}) {
    const shortcut = shortcutStore()
    const route = useRoute()
    const ui = ref({
      showDelete: false
    })
    const data = ref({
      newSSH: {
        name: '',
        port: 22,
        hostname: '',
        username: '',
        password: '',
        keyLogin: false,
        private_key_file: [],
        private_key: '',
        private_key_password: ''

      }
    })

    let SSHClient = ref({})
    let kv = new KVStorage("SSH_CLIENT")
    kv.init().then(val => {
      if (val == null) {
        SSHClient.value = {}
      } else {
        SSHClient.value = JSON.parse(val)
        if (route.params.hasOwnProperty('name') && route.params.name) {
          clickSSHClient(route.params.name)
          delete route.params['name']
        }
      }
    })


    function updatePrivateKey(val) {
      val.text().then((text) => {
        data.value.newSSH.private_key = text;
      });
    }

    function loadingSSHClient() {

      let res = kv.getItem()
      // let res = window.localStorage.getItem("SSH_CLIENT")
      if (res == null) {
        SSHClient.value = {}
      } else {
        SSHClient.value = JSON.parse(res)

      }
    }

    function saveSSHClient() {

      let _data = toRaw(SSHClient.value)
      //window.localStorage.setItem("SSH_CLIENT", JSON.stringify(_data))
      kv.setItem(JSON.stringify(_data))

    }

    function addBookmark(name) {
      let instance = SSHClient.value[name]
      let desc = `${instance.root}@${instance.hostname}`
      let router = {'name': 'terminal', params: {'name': name}}
      shortcut.addOrUpdateItem(name, "o_terminal", name, desc, 'terminal', router)

    }

    function clickSSHClient(name) {
      data.value.newSSH = SSHClient.value[name]
      connectSSH()
    }

    function addSSH() {
      let _data = JSON.stringify(toRaw(data.value.newSSH))
      _data = JSON.parse(_data)
      SSHClient.value[_data.name] = _data
      saveSSHClient()
    }

    function deleteSSH(name) {
      delete SSHClient.value[name]
      saveSSHClient()
    }

    function connectSSH() {
      let _newSSH = toRaw(data.value).newSSH
      let auth = {
        hostname: _newSSH.hostname,
        port: _newSSH.port,
        username: _newSSH.username,
        password: _newSSH.password,
        private_key: _newSSH.private_key,
        private_key_password: _newSSH.private_key_password,
      }
      emit("openNewTerminalTab", {'name': _newSSH.name, 'auth': auth})
    }

    onMounted(() => {
      console.log(route.params)


    })

    onUnmounted(() => {
      saveSSHClient()
    })

    return {ui, data, connectSSH, addSSH, deleteSSH, clickSSHClient, updatePrivateKey, SSHClient, addBookmark}
  }
}
</script>

<style scoped>

</style>
