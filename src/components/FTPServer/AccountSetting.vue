<template>
  <q-card class="card-box shadow-0 ">
    <q-card-section class="bg-blue-grey text-white flex justify-between items-center">
      <div>FTP Server Account Settings</div>
      <q-btn dense flat href="https://github.com/fclairamb/ftpserver#config-file" icon="o_help_outline" target="_blank"
             type="a"></q-btn>

    </q-card-section>
    <q-card-section>
      <q-item-label>FTP Account</q-item-label>
      <q-input v-model="postData.username" color="dark" label="username"></q-input>
      <q-input v-model="postData.password" color="dark" label="password"></q-input>

    </q-card-section>

    <q-card-section>
      <q-item-label>
        Drive Settings
      </q-item-label>
      <q-option-group
        v-model="group"
        :options="options"
        class="q-mt-sm"
        color="dark"
        inline
        @update:model-value="updateFileSystem"
      />


      <q-input v-model="postData.params" color="dark" hint="json" label="params" type="textarea"/>

    </q-card-section>
    <q-card-actions align="right" class="bg-white">
      <q-btn v-close-popup flat icon="o_cancel" label="cancel"></q-btn>
      <q-btn :loading="ui.loading.done" flat icon="o_done" label="ok" @click="done()"></q-btn>
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
.card-box {

  min-width: 360px;
  width: 80vw;
  max-width: 530px;

}

</style>
