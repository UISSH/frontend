<template>
  <q-card class="shadow-0">
    <q-card-section class="bg-blue-grey text-white flex justify-between items-center">
      <div>FTP Server Account Settings</div>
      <q-btn flat dense target="_blank" type="a" href="https://github.com/fclairamb/ftpserver#config-file"
             icon="o_help_outline"></q-btn>

    </q-card-section>
    <q-card-section>
      <q-item-label>FTP Account</q-item-label>
      <q-input color="dark" v-model="postData.username" label="username"></q-input>
      <q-input color="dark" v-model="postData.password" label="password"></q-input>

    </q-card-section>

    <q-card-section>
      <q-item-label>
        Drive Settings
      </q-item-label>
      <q-option-group
        class="q-mt-sm"
        v-model="group"
        :options="options"
        color="dark"
        inline
        @update:model-value="updateFileSystem"
      />


      <q-input type="textarea" v-model="postData.params" color="dark" hint="json" label="params"/>

    </q-card-section>
    <q-card-actions class="bg-white" align="right">
      <q-btn label="cancel" flat icon="o_cancel" v-close-popup></q-btn>
      <q-btn label="ok" flat icon="o_done" :loading="ui.loading.done" @click="done()"></q-btn>
    </q-card-actions>
  </q-card>

</template>

<script>
import {onMounted, ref, toRaw} from "vue";
import {patchAccount, postAccount, reloadFtpServer, syncFtpServerAccount} from "src/api/ftpserver";
import {useQuasar} from "quasar";
import {errorLoading, hideLoading, showLoading} from "src/utils/loading";

const fileSystemParams = {
  'os': {
    "basePath": "/tmp"
  },
  'dropbox': {
    "token": "dropbox token"
  },
  'gdrive': {
    "google_client_id": "***.apps.googleusercontent.com",
    "google_client_secret": "****",
    "base_path": "ftp"
  },
  's3': {
    "endpoint": "https://s3.amazonaws.com",
    "region": "eu-west-1",
    "bucket": "my-bucket",
    "access_key_id": "AKIA....",
    "secret_access_key": "IDxd....",
    "disable_ssl": "false",
    "path_style": "false"
  },
  'sftp': {
    "username": "user",
    "password": "password",
    "hostname": "192.168.168.11:22"
  }


}

export default {
  name: "AccountSetting",
  props: ['data'],
  setup(props) {
    const $q = useQuasar()
    const ui = ref({
      loading: {
        done: false
      }
    })

    const postData = ref({
      "username": "",
      "password": "",
      "file_system": "os",
      "params": JSON.stringify({"basePath": "/tmp"}, null, 4)
    })
    const group = ref('os');
    onMounted(() => {

      if (props.data === undefined) {
        return
      }
      postData.value = props.data
      if (postData.value.params == null) {
        postData.value.params = JSON.stringify(fileSystemParams[postData.value.file_system], null, 4)
      } else {
        group.value = postData.value.file_system
      }
    })


    function done() {

      showLoading($q)

      if (postData.value.hasOwnProperty('id')) {
        let _data = toRaw(postData.value)
        let pk = _data.id
        delete _data.id

        patchAccount(pk, _data).then(async res => {
          console.log(res)
          await syncFtpServerAccount()
          await reloadFtpServer()


        }).catch(err => {
          errorLoading($q, err)
        }).finally(() => {
          hideLoading($q)
        })
      } else {
        console.log(postData.value)

        postAccount(postData.value).then(async res => {
          await syncFtpServerAccount()
          await reloadFtpServer()

        }).catch(err => {

          errorLoading($q, err)

        }).finally(() => {
          hideLoading($q)

        })

      }
    }


    return {
      options: [
        {
          label: 'local',
          value: 'os'
        },
        {
          label: 'dropbox',
          value: 'dropbox'
        },
        {
          label: 'gdrive',
          value: 'gdrive'
        },
        {
          label: 's3',
          value: 's3'
        },
        {
          label: 'sftp',
          value: 'sftp'
        }
      ],
      postData,
      group,
      updateFileSystem(val) {
        postData.value.file_system = val
        console.log(fileSystemParams[val])
        postData.value.params = JSON.stringify(fileSystemParams[val], null, 2)
      }, done, ui

    }
  }
}
</script>

<style scoped>

</style>
