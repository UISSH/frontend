<template>
  <q-page class="q-gutter-md bg-blue-grey-1">
    <q-card class="shadow-0">

      <q-card-section class="flex justify-between">
        <q-input v-model="params.directory" color="dark" style="width: 50%" @keydown.enter="enterDirectory">
          <template v-slot:prepend>
            <q-btn dense flat icon="home" @click="backToPrevious('/')"></q-btn>
            <q-btn :disable="params.directory==='/'" dense flat icon="o_arrow_back" @click="backToPrevious()"></q-btn>
          </template>
          <template v-slot:append>
            <q-btn color="dark" icon="o_refresh" flat @click="enterDirectory"></q-btn>
            <div style="width: 8px"></div>
          </template>

        </q-input>
        <q-input v-model="params.operation_command" clearable color="white" label="cmd" standout
                 style="width: 50%" @keydown.enter="requestExecuteCMD"></q-input>

      </q-card-section>
      <q-table v-model:selected="tableSelected"
               :columns="columns"
               :loading="tableData.pagination.loading"
               :rows="tableData.results"
               :rows-per-page-options="[100,200,500]"
               class="q-pa-none shadow-0"
               dense
               row-key="path"
               selection="multiple"
      >
        <template v-slot:top>
          <div class="flex justify-between" style="width: 100%">
            <q-input v-model="params.search" :debounce="350" color="dark"
                     dense label="搜索" @update:model-value="onSearch">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
            <q-file v-model="uploadFileData"
                    color="dark" dense filled label="upload" max-file-size="20971520" @rejected="onRejected">
              <template v-slot:prepend>
                <q-icon name="cloud_upload"/>
              </template>
              <template v-slot:after>
                <q-btn :disable="uploadFileData==null" flat icon="o_upload" @click="requestUploadFile"></q-btn>
              </template>

            </q-file>

          </div>
        </template>
        <template v-slot:body-cell-filename="props">
          <q-td :props="props">
            <div v-if="props.row.type === 'directory'" class="flex q-gutter-sm items-center no-wrap"
                 style="cursor: pointer" @click="openFolder(props.row.path)">
              <q-icon name="o_folder_open" size="24px"></q-icon>
              <span>{{ props.value }}</span>
            </div>
            <div v-else class="flex q-gutter-sm items-center no-wrap" style="cursor: pointer"
                 @click="editFile(props.row.path)">
              <q-icon name="o_description" size="24px"></q-icon>
              <span>{{ props.value }}</span></div>
          </q-td>
        </template>
        <template v-slot:body-cell-uid="props">
          <q-td :props="props">
            {{ props.value }} ({{ users[props.value] }})
          </q-td>
        </template>
        <template v-slot:body-cell-gid="props">
          <q-td :props="props">
            {{ props.value }} ({{ users[props.value] }})
          </q-td>
        </template>
        <template v-slot:body-cell-size="props">
          <q-td :props="props">
            <div v-if="props.row.type === 'directory'"> -</div>
            <div v-else> {{ props.value }}</div>
          </q-td>
        </template>

        <template v-slot:body-cell-action="props">

          <q-td :props="props">
            <div class="flex no-wrap q-gutter-xs justify-end">
              <div v-if="props.row.type==='directory'"></div>
              <div v-else>
                <q-btn :href="requestDownloadFile(props.value)" dense flat icon="download" target="_blank"
                       type="a"></q-btn>
              </div>
            </div>
          </q-td>

        </template>
      </q-table>

    </q-card>
  </q-page>
</template>

<script>
import {nextTick, onMounted, ref} from "vue";
import {listResStruct} from "src/utils/struct";
import {executeCMD, getDownloadFileUrl, getUsers, listDirectory, uploadFile} from "src/api/filebrowser";
import {date, format, useQuasar} from "quasar";
import {errorLoading, hideLoading, showLoading} from "src/utils/loading";
import {useRoute, useRouter} from "vue-router";

const columns = [
  {name: 'filename', label: 'filename', align: 'left', field: 'filename',},
  {name: 'size', label: 'size', align: 'left', field: 'size', format: val => format.humanStorageSize(val)},
  {name: 'mode', label: 'mode', align: 'left', field: 'mode',},
  {name: 'uid', label: 'uid', align: 'left', field: 'uid',},
  {name: 'gid', label: 'gid', align: 'left', field: 'gid',},
  {name: 'action', label: 'action', align: 'right', field: 'path',},
  {
    name: 'mtime',
    label: 'mtime',
    align: 'right',
    field: 'mtime',
    format: val => date.formatDate(val * 1000, 'YYYY-MM-DD HH:mm:ss')
  },
]
export default {
  name: "FileManger",
  setup(props, {emit}) {
    const $q = useQuasar()
    const route = useRoute()
    const router = useRouter()
    const users = {}
    const tableData = ref(listResStruct())
    const params = ref({
      'directory': "/root",
      'search': null,
      'operation_command': 'ls',
    })

    const uploadFileData = ref(null)
    const tableSelected = ref([])

    function onSearch(key) {
      params.value.search = key
      requestInstance()
    }

    function requestExecuteCMD() {
      let data = {current_directory: params.value.directory, operation_command: params.value.operation_command}
      showLoading($q)
      executeCMD(data).then(res => {
        requestInstance()
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)
      })
    }

    function onUpdatePagination(page) {
      params.value.page = page
      requestInstance()
    }

    function editFile(path) {
      router.push({
        name: "plainTextEditing",
        params: {
          'path': path
        }
      })
    }

    function enterDirectory() {
      router.push({
        name: 'fileBrowser',
        params: {
          'directory': params.value.directory
        }
      })
      requestInstance()
    }

    function requestInstance() {
      // 终点改写这里
      tableData.value.pagination.loading = true
      // requestXXXX 替换为实际的函数
      listDirectory(params.value.directory).then(res => {
        if (!users.hasOwnProperty("0")) {
          getUsers()
        }
        tableData.value.results = res
      }).catch(err => {

      }).finally(() => {
        nextTick(() => {
          tableData.value.pagination.loading = false
        })
      })
    }

    function backToPrevious(path) {
      let directory = ''
      if (Boolean(path)) {
        directory = path
      } else {
        directory = params.value.directory
        let i = directory.lastIndexOf('/')
        if (i === 0) {
          directory = '/'
        } else {
          directory = directory.substring(0, i)
        }
      }
      params.value.directory = directory
      console.log(params.value.directory)
      enterDirectory()
    }

    function requestUploadFile() {
      showLoading($q)

      uploadFile(params.value.directory, uploadFileData.value).then(async res => {
        console.log(res)
        await requestInstance()
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)
      })
    }

    function requestGetUsers() {
      getUsers().then(res => {
        for (const item of res) {
          users[item.uid] = item.username
        }
        console.log(users)
      })
    }

    function openFolder(folder) {
      params.value.directory = folder
      enterDirectory()
    }

    function requestDownloadFile(path) {
      return getDownloadFileUrl(path)
    }

    onMounted(() => {
      requestGetUsers()
      let directory = '/'
      if (route.params.hasOwnProperty('directory')) {
        directory = route.params.directory
      }
      params.value.directory = directory
      tableData.value.data = []
      nextTick(() => {
        requestInstance()
      })


    })

    function onRejected(rejectedEntries) {
      // Notify plugin needs to be installed
      // https://quasar.dev/quasar-plugins/notify#Installation
      $q.notify({
        type: 'negative',
        message: `file size exceeds 20 mb.`
      })
    }

    return {
      /* 导出这一行 */
      tableData,
      params,
      tableSelected,
      onSearch,
      onUpdatePagination,
      columns,
      openFolder,
      requestInstance,
      backToPrevious,
      users,
      requestDownloadFile,
      requestUploadFile,
      uploadFileData,
      requestExecuteCMD,
      onRejected,
      editFile,
      enterDirectory
    }
  }
}
</script>

<style scoped>

</style>

