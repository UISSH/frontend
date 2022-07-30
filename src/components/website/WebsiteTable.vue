<template>
  <q-dialog v-model="ui.NewWebsiteDialog.show">
    <div class="bg-blue-grey-1" style="min-width: 360px">
      <div class="flex justify-between bg-blue-grey">
        <div class="text-body1 text-white q-pa-md">Add new website</div>
        <q-btn v-close-popup color="white" flat icon="close"></q-btn>
      </div>
      <div class="flex flex-center">
        <NewWebsite></NewWebsite>
      </div>

    </div>

  </q-dialog>
  <div class="flex justify-between">
    <div class="q-gutter-sm">
      <q-btn :label="$t('new website')" color="blue" icon="add" @click="ui.NewWebsiteDialog.show = true"></q-btn>
      <q-btn v-if="ui.StartWebsiteBtn.show" :label="$t('start')" color="green"
             icon="play_arrow" @click="requestApplicationAction('start')"></q-btn>
      <q-btn v-if="ui.StopWebsiteBtn.show" :label="$t('stop')" color="grey" icon="stop"
             @click="requestApplicationAction('stop')"></q-btn>
      <q-btn v-if="ui.DeleteWebsiteBtn.show" :label="$t('delete')" color="red" icon="delete"
             @click="requestDeleteWebsite"></q-btn>
    </div>
    <div>
      <q-btn color="white" flat icon="sync" text-color="dark" @click="requestInstance"></q-btn>
    </div>
  </div>


  <q-table

    v-model:selected="tableSelected"
    :columns="columns"
    :loading="tableData.pagination.loading"
    :rows="tableData.results"
    class="q-pa-none shadow-0"
    color="blue-grey"
    flat
    hide-pagination
    row-key="id"
    selection="multiple"
  >

    <template v-slot:header-cell="props">
      <q-th class="text-body1 text-purple ">
        <q-td :class="`flex ${Public.formatColumnAlignCss(props.col.align)} no-wrap`" :props="props">
          {{ $t(props.col.label.toLowerCase()) }}
        </q-td>
      </q-th>
    </template>

    <template v-slot:body-cell-domain="props">
      <q-td :props="props">
        <div class="flex justify-start items-center q-gutter-sm no-wrap" style="cursor: pointer">
          <div @click="Public.openDomain(props.row.ssl_enable,props.value)">{{ props.value }}</div>
          <q-icon :color="props.row.ssl_enable ?'green' :'blue-grey'" name="public"
                  @click="Public.openDomain(props.row.ssl_enable,props.value)"></q-icon>
        </div>

      </q-td>
    </template>

    <template v-slot:body-cell-application="props">
      <q-td :props="props">
        <div class="flex justify-end items-center q-gutter-sm" style="cursor: pointer">
          <div>{{ props.value ? props.value.replace('Application', '') : '' }}</div>

          <q-icon color="blue-grey" name="o_settings" @click="toWebsiteSettings(props.key)"></q-icon>
        </div>

      </q-td>
    </template>

    <template v-slot:body-cell-database="props">
      <q-td v-if="props.value" :props="props" @click="Public.alert(props.row.database_id)">
        <div class="flex justify-end items-center q-gutter-sm" style="cursor: pointer">
          <div>{{ props.value }}</div>
          <q-icon color="blue-grey" name="o_storage"></q-icon>
        </div>

      </q-td>
      <q-td v-else>
        <div class="flex justify-end items-center q-gutter-sm">
          <q-icon color="blue-grey" name="o_remove"></q-icon>
        </div>

      </q-td>
    </template>
    <template v-slot:body-cell-path="props">
      <q-td :props="props" @click="enterFolder(props.value)">
        <div class="flex justify-end items-center q-gutter-sm no-wrap" style="cursor: pointer">
          <div>{{ props.value }}</div>
          <q-icon color="blue-grey" name="o_folder"></q-icon>
        </div>

      </q-td>
    </template>

    <template v-slot:body-cell-ssl="props">
      <q-td :props="props">
        <div class="flex justify-end items-center q-gutter-sm" style="cursor: pointer">
          <q-toggle :model-value="props.row.ssl_enable" checkedIcon="enhanced_encryption"
                    color="green"
                    unchecked-icon="no_encryption"
                    @click="requestPutWebsite(props.row)"></q-toggle>
        </div>

      </q-td>
    </template>

  </q-table>
  <div v-if="tableData.pagination.total_pages>0" class="row justify-center q-mt-md">
    <q-pagination
      v-model="tableData.pagination.current_page"
      :max="tableData.pagination.total_pages"
      color="grey-8"
      direction-links
      size="md"
      @update:model-value="onUpdatePagination"
    />
  </div>


</template>

<script>
import {nextTick, onMounted, ref, toRaw, watchEffect} from "vue";
import NewWebsite from "components/website/NewWebsite";
import {openURL, useQuasar} from "quasar";
import {listResStruct} from "src/utils/struct";

import {deleteWebsite, listWebsite, putWebsite} from "src/api/website";
import {errorLoading, hideLoading, showLoading} from "src/utils/loading";
import {doApplication} from "src/api/application";
import {useRouter} from "vue-router";

let $q;

const columns = [

  {name: 'domain', label: 'Domain', align: 'left', field: 'domain',},
  {name: 'application', label: 'Application', field: 'application', align: 'right'},
  {name: 'database', label: 'Database', field: 'database_name'},
  {name: 'path', label: 'Path', field: 'index_root'},
  {name: 'ssl', label: 'SSL', field: 'ssl_enable'},
  {name: 'status', label: 'Status', field: 'status'}
]


const ui = ref({
  websiteTable: {
    loading: false
  },
  NewWebsiteDialog: {
    show: false
  },
  DeleteWebsiteBtn: {
    show: false
  },
  StopWebsiteBtn: {
    show: false
  },
  StartWebsiteBtn: {
    show: false
  }
})


const Public = {

  alert: function (obj) {
    alert(obj)
  },
  formatColumnAlignCss: function (align) {
    if (align === "center") {
      return "justify-center"
    } else if (align === "left") {
      return "justify-start"
    } else {
      return "justify-end"
    }
  },

  openDomain(enableSSL, domain) {

    let url = "http://" + domain
    if (enableSSL) {
      url = "https://" + domain
    }
    openURL(url)
  },


}

export default {
  name: "WebsiteTable",
  components: {NewWebsite},
  setup() {
    $q = useQuasar()
    const router = useRouter()
    const tableData = ref(listResStruct())
    const params = ref({
      'page': 1,
      'search': null
    })
    const tableSelected = ref([])

    watchEffect(() => {
      let _bool = tableSelected.value.length === 1
      ui.value.DeleteWebsiteBtn.show = _bool
      ui.value.StopWebsiteBtn.show = _bool
      ui.value.StartWebsiteBtn.show = _bool
    })

    function toWebsiteSettings(id){
      router.push({"name":"websiteSettings",params:{"id":id}})
    }

    function enterFolder(path) {

      router.push({
        name: 'fileBrowser',
        params: {
          'directory': path
        }
      })
    }

    function onUpdatePagination(page) {
      params.value.page = page
      requestInstance()
    }

    function onSearch(key) {
      params.value.search = key
      requestInstance()
    }

    function requestInstance() {
      // 终点改写这里
      tableData.value.pagination.loading = true
      // requestXXXX 替换为实际的函数
      listWebsite(params.value).then(res => {
        tableData.value = res
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        nextTick(() => {
          tableData.value.pagination.loading = false
          tableSelected.value = []
        })
      })
    }

    function requestDeleteWebsite() {
      showLoading($q)
      deleteWebsite(tableSelected.value[0].id).then(res => {
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)
        requestInstance()
      })

    }

    function requestPutWebsite(row) {
      row.ssl_enable = !row.ssl_enable
      let data = toRaw(row)
      showLoading($q)
      putWebsite(data.id, data).then(res => {
        console.log({'putWebsite': res})
      }).catch(err => {
        errorLoading($q, err)
        console.error({'putWebsite': err})
      }).finally(() => {
        hideLoading($q)
        requestInstance()
      })
    }

    function requestApplicationAction(action) {
      showLoading($q)
      doApplication(tableSelected.value[0].id, action).then((res) => {
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)

      })
    }

    onMounted(() => {
      tableData.value.data = []
      nextTick(() => {
        requestInstance()
      })
    })
    return {
      tableData, params, tableSelected, onSearch, onUpdatePagination, columns,
      ui, Public, requestInstance, requestPutWebsite, requestDeleteWebsite, requestApplicationAction,toWebsiteSettings,enterFolder
    }
  }
}
</script>

<style scoped>


</style>
