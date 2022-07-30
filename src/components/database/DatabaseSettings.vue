<template>
  <q-card class="shadow-0">
    <q-tabs
      v-model="tab"
      align="justify"
      class="bg-blue-grey-2"
      dense
      indicator-color="blue"
      inline-label
      mobile-arrows
      narrow-indicator
      outside-arrows
    >
      <q-btn color="blue-grey-2" flat icon="arrow_back" text-color="dark" @click="$router.back()"></q-btn>
      <q-tab label="settings" name="settings"/>
      <q-tab label="backup" name="backup"/>
    </q-tabs>
    <q-separator/>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="settings">

        <q-card class="apple-card">
          <div class="bg-blue-grey-1 flex justify-between q-pa-md items-center content-center rounded-borders">
            <div class="text-body1 text-capitalize">{{ ui.database.data.name }} Settings</div>
            <div>
              <q-btn color="dark" flat icon="o_refresh" @click="requestGetDatabase"></q-btn>
            </div>
          </div>
          <q-card-section>
            <q-input v-model="ui.database.data.name" color="dark" label="database name" readonly></q-input>
            <q-input v-model="ui.database.data.username" color="dark" label="username"></q-input>
            <q-input v-model="ui.database.data.password" :type="ui.database.isPwd ? 'password' : 'text'" color="dark"
                     label="password">
              <template v-slot:append>
                <q-icon
                  :name="ui.isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="ui.database.isPwd = !ui.database.isPwd"
                />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn class="text-capitalize" color="positive" icon="o_done" label="commit" no-caps
                   @click="requestUpdateDatabase"></q-btn>
          </q-card-actions>

        </q-card>
      </q-tab-panel>
      <q-tab-panel name="backup">
        <q-card class="apple-card">
          <div class="bg-blue-grey-1 flex justify-between q-pa-md items-center content-center rounded-borders">
            <div class="text-body1">Backups archive</div>
            <div class="flex q-gutter-sm">
              <q-btn flat icon="o_add" @click="requestExportBackup()">
                <q-tooltip>Create a new backup</q-tooltip>
              </q-btn>

              <q-file v-model="ui.uploadFile.data" accept="application/sql"
                      color="dark" dense filled label="upload">
                <template v-slot:prepend>
                  <q-icon name="cloud_upload"/>
                </template>
                <template v-slot:after>
                  <q-btn :disable="ui.uploadFile.data==null" flat icon="o_upload" @click="requestUploadFile"></q-btn>
                </template>
              </q-file>
              <q-btn color="dark" flat icon="o_refresh" @click="requestListDirectory"></q-btn>
            </div>
          </div>
          <q-table
            :columns="columns"
            :rows="tableData"
            :rows-per-page-options="[10]"
            class="q-pa-none shadow-0"
            hide-
            row-key="path"
          >
            <template v-slot:body-cell-path="props">
              <q-td :props="props">
                <div class="flex q-gutter-sm no-wrap items-center">
                  <div>
                    <q-btn dense flat icon="o_folder" @click="enterFolder(props.value)">
                      <q-tooltip>
                        Open the directory where the file is located.
                      </q-tooltip>
                    </q-btn>
                    <q-btn dense flat icon="o_edit_note" @click="editFile(props.value)">
                      <q-tooltip>
                        Edit this file.
                      </q-tooltip>
                    </q-btn>
                  </div>
                  <div>
                    {{ props.value }}
                  </div>
                </div>

              </q-td>
            </template>
            <template v-slot:body-cell-action="props">
              <q-td :props="props">
                <q-btn color="info" flat icon="o_rotate_left" label="recover" no-caps
                       @click="requestImportBackup(props.value)"></q-btn>
                <q-btn :href="requestDownloadFile(props.value)" color="dark" flat icon="o_download" label="download"
                       no-caps target="_blank" type="a"></q-btn>
              </q-td>
            </template>
          </q-table>

        </q-card>


      </q-tab-panel>

    </q-tab-panels>
  </q-card>

</template>

<script>


import {onMounted, ref} from "vue";
import {exportBackup, getDatabase, importBackup, updateDatabase} from "src/api/database";
import {errorLoading, hideLoading, showLoading} from "src/utils/loading";
import {date, format, useQuasar} from "quasar";
import {getDownloadFileUrl, listDirectory, uploadFile} from "src/api/filebrowser";
import {useRouter} from "vue-router";


export default {
  name: "DataBaseSettings",
  components: {},
  props: {
    pk: {
      type: String,
      required: true
    }
  },
  setup: function (props) {
    const columns = [
      {name: 'filename', label: 'filename', align: 'left', field: 'filename',},
      {name: 'size', label: 'size', align: 'left', field: 'size', format: val => format.humanStorageSize(val)},
      {name: "path", label: "path", field: 'path', align: 'left'},

      {name: 'action', label: "action", field: 'path', align: 'center'},
      {
        name: 'mtime', label: 'mtime', field: 'mtime',
        format: val => date.formatDate(val * 1000, 'YYYY-MM-DD HH:mm:ss')
      },
    ]
    const tab = ref('settings')
    // const tab = ref('backup')
    const $q = useQuasar()
    const tableData = ref([])
    const {humanStorageSize} = format
    const ui = ref({
      database: {
        isPwd: true,
        data: {
          "id": -1,
          "own_username": "null",
          "create_status_text": "null",
          "database_type_text": "MariaDB",
          "create_at": "2022-07-21T09:10:43.872892+08:00",
          "update_at": "2022-07-21T09:10:44.769107+08:00",
          "name": null,
          "username": "null",
          "password": "null",
          "database_type": 1,
          "character": "null",
          "collation": "null",
          "authorized_ip": "null",
          "create_status": 1,
          "user": null,
          "website": null
        }
      },

      uploadFile: {
        data: null
      }

    })

    const router = useRouter()

    function requestUpdateDatabase() {
      showLoading($q)
      let databaseFormData = ui.value.database.data
      updateDatabase(databaseFormData.id, {
        name: databaseFormData.name,
        username: databaseFormData.username,
        password: databaseFormData.password
      }).then(async res => {
        await requestGetDatabase()
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)
      })
    }

    function requestDownloadFile(path) {
      return getDownloadFileUrl(path)
    }

    function requestExportBackup() {
      showLoading($q)
      exportBackup(ui.value.database.data.id).then(async res => {
        await requestListDirectory()
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)
      })

    }

    function requestImportBackup(path) {
      showLoading($q)
      importBackup(ui.value.database.data.id, path).then(res => {
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)
      })
    }


    function requestGetDatabase() {
      showLoading($q)
      getDatabase(props.pk).then(res => {
        if (ui.value.database.data.name == null) {
          ui.value.database.data = res
          requestListDirectory()
        } else {
          ui.value.database.data = res
        }
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)

      })
    }

    function requestListDirectory() {
      showLoading($q)
      let dbBackupsDirectory = `/var/db_backups/${ui.value.database.data.name}`
      listDirectory(dbBackupsDirectory).then(res => {
        tableData.value = []
        for (const item of res) {
          console.log(item)
          if (item.type === 'regular') {
            console.log(item)
            tableData.value.push(item)
          }
        }
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)
      })
    }

    function requestUploadFile() {
      showLoading($q)
      let dbBackupsDirectory = `/var/db_backups/${ui.value.database.data.name}`
      uploadFile(dbBackupsDirectory, ui.value.uploadFile.data).then(async res => {
        console.log(res)
        await requestListDirectory()
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)
      })
    }

    function editFile(path) {
      router.push({
        name: "plainTextEditing",
        params: {
          'path': path
        }
      })
    }
    function enterFolder(path) {
      let arrPath = path.split('/')
      arrPath.pop(-1)
      if (path.endsWith("/")) {
        arrPath.pop(-1)
      }
      let folder = arrPath.join("/")
      router.push({
        name: 'fileBrowser',
        params: {
          'directory': folder
        }
      })
    }

    onMounted(() => {
      requestGetDatabase()

    })

    return {
      tab,
      ui,
      requestUpdateDatabase,
      requestGetDatabase,
      requestListDirectory,
      humanStorageSize,
      date,
      requestUploadFile,
      columns, tableData, requestDownloadFile, requestExportBackup, requestImportBackup, enterFolder,editFile
    }
  }
}
</script>

<style scoped>


</style>
