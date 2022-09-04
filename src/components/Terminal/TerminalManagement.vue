<template>
  <q-card class="no-border-radius" style="height: 100%">
    <q-card-section>
      <input type="password" hidden autocomplete="new-password">
      <div class="flex justify-between">
        <div class="text-h6">Host</div>
        <q-btn-dropdown style="border-radius:16px" color="dark" text-color="" icon="add">
          <q-card style="min-width: 420px">
            <q-card-section class="bg-blue-grey-1 text-dark ">
              <div class="flex q-gutter-sm items-center">
                <q-icon size="24px" name="o_terminal"></q-icon>
                <div class="text-h6  ">Host</div>
              </div>
            </q-card-section>

            <q-card-section class="q-gutter-sm">
              <q-input label="name" color="dark" v-model="data.newSSH.name" @update:model-value="log"></q-input>
              <div class="row">
                <q-input class="col-10" label="host" color="dark" v-model="data.newSSH.hostname"></q-input>
                <q-input class="col-2" label="port" color="dark" v-model="data.newSSH.port"></q-input>
              </div>
              <q-input
                class="col-6" label="username" color="dark"
                v-model="data.newSSH.username"></q-input>
              <div v-if="!data.newSSH.keyLogin" class="row">

                <q-input
                  class="col-12" label="password" type="password" color="dark"
                  v-model="data.newSSH.password"></q-input>
              </div>

              <div v-if="data.newSSH.keyLogin" class="row">

                <q-file class="col-6"
                        v-model="data.newSSH.private_key_file"
                        label="key"
                        color="dark"
                        @update:model-value="updatePrivateKey"

                />
                <q-input class="col-6" label="key password" color="dark"
                         v-model="data.newSSH.private_key_password"></q-input>
              </div>

              <q-toggle color="dark" label="Enable Keys Login" v-model="data.newSSH.keyLogin"></q-toggle>
            </q-card-section>
            <q-card-actions class="justify-around">
              <q-btn class="text-capitalize" label="connect" @click="connectSSH" icon="o_bolt" icon-right=""
                     color="dark" no-caps/>
              <q-btn label="add" icon="o_add" icon-right="" @click="addSSH" color="dark"/>
              <q-btn class="text-capitalize" label="cancel" v-close-popup no-caps color="dark" icon-right=""
                     icon="cancel"></q-btn>
            </q-card-actions>
          </q-card>
        </q-btn-dropdown>
      </div>

      <q-separator class="q-mt-sm q-mb-sm"></q-separator>
      <div class="flex q-gutter-md">
        <div v-for="i in Object.keys(SSHClient)" :key="i">
          <q-btn-dropdown split color="blue-grey-1" text-color="dark" :label="i"
                          style="min-width: 300px" @click="clickSSHClient(i)">
            <q-list>
              <q-item clickable v-close-popup>
                <q-item-section>
                  <q-item-label @click="deleteSSH(i)">Delete</q-item-label>
                </q-item-section>
              </q-item>


            </q-list>
          </q-btn-dropdown>

        </div>
      </div>


    </q-card-section>
  </q-card>

</template>

<script>
import {onMounted, onUnmounted, ref, toRaw} from "vue";

export default {
  name: "TerminalManagement",
  setup(props, {emit}) {
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

    function updatePrivateKey(val) {
      val.text().then((text) => {
        data.value.newSSH.private_key = text;
      });
    }

    function loadingSSHClient() {
      let res = window.localStorage.getItem("SSH_CLIENT")
      console.log({"loadingSSHClient": JSON.parse(res)})
      if (res == null) {
        SSHClient.value = {}
      } else {
        SSHClient.value = JSON.parse(res)
      }
    }

    function saveSSHClient() {
      let _data = toRaw(SSHClient.value)
      window.localStorage.setItem("SSH_CLIENT", JSON.stringify(_data))

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
      loadingSSHClient()
    })

    onUnmounted(() => {
      saveSSHClient()
    })

    function log(){
      console.log(data.value.newSSH)
    }


    return {ui, data, connectSSH, addSSH, deleteSSH, clickSSHClient, updatePrivateKey,SSHClient,log}
  }
}
</script>

<style scoped>

</style>
