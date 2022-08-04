<!--表格代码规范-->
<template>
  <div>
    <q-dialog v-model="ui.DatabaseDialog.show">
      <div class="bg-blue-grey-1" style="min-width: 360px">
        <div class="flex justify-between bg-blue-grey">
          <div class="text-body1 text-white q-pa-md">Add database</div>
          <q-btn v-close-popup color="white" flat icon="close"></q-btn>
        </div>
        <div class="flex flex-center">
          <new-database></new-database>
        </div>
      </div>

    </q-dialog>

    <q-table v-model:selected="tableSelected"
             :columns="columns"
             :loading="tableData.pagination.loading"
             :rows="tableData.results"
             class="q-pa-none shadow-0"
             hide-pagination
             row-key="id"
             selection="multiple"
    >
      <template v-slot:top>
        <div class="flex justify-between q-gutter-sm" style="width: 100%">
          <div class="flex q-gutter-sm">
            <q-btn color="blue-grey" icon="o_add" @click="ui.DatabaseDialog.show=true"></q-btn>

            <q-btn :href="ui.PHPMyAdmin.url" color="yellow-10" icon="o_login" target="_blank" type="a">
              <q-tooltip>open phpmyadmin</q-tooltip>
            </q-btn>
            <q-btn v-if="tableSelected.length===1" color="red" icon="o_remove"
                   @click="ui.DatabaseDialog.show=true"></q-btn>
            <q-btn v-if="tableSelected.length===1" color="blue-grey-2" icon="o_settings" text-color="dark"
                   @click="ui.DatabaseDialog.show=true"></q-btn>
            <!--            <q-btn color="blue-grey-1" text-color="dark" icon="o_backup" @click="ui.DatabaseDialog.show=true"></q-btn>-->
            <!--            <q-btn color="blue-grey" icon="o_drive_file_move" @click="ui.DatabaseDialog.show=true"></q-btn>-->
          </div>
          <q-btn :loading="tableData.pagination.loading" flat icon="o_sync" @click="requestInstance"></q-btn>
        </div>
      </template>
      <template v-slot:body-cell-website="props">
        <q-td :props="props">
          <div class="flex justify-start">
            <q-btn :disable="props.website == null" color="blue-grey" dense flat icon="o_public">
              <q-tooltip v-if="props.website"> click to go to website</q-tooltip>
              <q-tooltip v-else> this database is a standalone resource</q-tooltip>
            </q-btn>

          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div class="flex justify-end q-gutter-sm items-baseline">
            <div>{{ props.value }}</div>
            <div>
              <q-icon name="o_settings" size="18px" @click="toDatabaseSettings(props.key)"></q-icon>
            </div>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-username="props">
        <q-td :props="props">
          <div class="flex justify-end">
            <input-area :value="props.value" type="text"></input-area>
          </div>
        </q-td>
      </template>
      <template v-slot:body-cell-password="props">
        <q-td :props="props">
          <div class="flex justify-end">
            <input-area :value="props.value" type="password"></input-area>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <!--        class CreateStatus(IntegerChoices):
                PENDING = 0, "pending"
                SUCCESS = 1, "success"
                FAILED = 2, "failed"-->
        <q-td :props="props">
          <div v-if="props.row.create_status===1">
            <q-icon color="green" name="o_check_circle" size="24px">
              <q-tooltip>created in the system.</q-tooltip>
            </q-icon>
          </div>
          <div v-else-if="props.row.create_status===0" class="flex justify-end">
            <q-icon color="warning" name="o_settings_backup_restore"
                    size="24px" style="cursor: pointer" @click="requestCreateDatabaseInstance(props.row.id)">
              <q-tooltip>not yet created click to create now.</q-tooltip>
            </q-icon>
          </div>

          <div v-else>
            <q-icon color="red" name="o_error" size="24px" style="cursor: pointer"
                    @click="requestCreateDatabaseInstance(props.row.id)">
              <q-tooltip>create error, click to try to recreate.</q-tooltip>
            </q-icon>
          </div>
        </q-td>
      </template>
    </q-table>
    <div v-if="tableData.pagination.total_pages>0" class="row justify-center q-mt-md">
      <q-pagination
        v-model="tableData.pagination.current_page"
        :max="tableData.pagination.total_pages"
        :max-pages="10"
        color="grey-8"
        direction-links
        size="md"
        @update:model-value="onUpdatePagination"
      />
    </div>
  </div>
</template>
<script>
import {nextTick, onMounted, ref} from "vue";
import {listResStruct} from "src/utils/struct";
import {createDataBaseInstance, listDatabase} from "src/api/database";
import InputArea from "components/base/InputArea";
import NewDatabase from "components/database/NewDatabase";
import {useRouter} from "vue-router";


export default {
  name: "DatabaseTable",
  components: {InputArea, NewDatabase},
  setup(props, {emit}) {
    const router = useRouter()

    function t(msg) {

      return msg
    }

    const ui = ref({
      DatabaseDialog: {
        show: false
      },
      PHPMyAdmin: {
        url: null
      }
    })

    const columns = [
      {name: 'website', label: t('website'), align: 'left', field: 'website',},
      {name: 'name', label: t('name'), field: 'name',},
      {name: 'username', label: t('username'), field: 'username',},
      {name: 'password', label: t('password'), field: 'password', type: "password"},
      {name: 'database_type_text', label: `${t('database')} ${t('type')}`, field: 'database_type_text',},
      {name: 'status', label: `${t('status')}`, field: 'create_status_text',},
    ]
    const tableData = ref(listResStruct())
    const params = ref({
      'page': 1,
      'search': null
    })
    const tableSelected = ref([])

    function onSearch(key) {
      params.value.search = key
      requestInstance()
    }

    function onUpdatePagination(page) {
      params.value.page = page
      requestInstance()
    }

    function getPHPMyAdminUrl() {
      let url = window.localStorage.getItem("api_url")
      if (url === "/") {
        url = window.location.href
      }
      let domain = (new URL(url));
      return domain.protocol + "//" + domain.hostname + ":8080"
    }

    function requestCreateDatabaseInstance(pk) {
      createDataBaseInstance(pk).then(res => {
        requestInstance()
      }).catch(err => {

      })
    }

    function requestInstance() {
      // 终点改写这里
      tableData.value.pagination.loading = true
      // requestXXXX 替换为实际的函数
      listDatabase(params.value).then(res => {
        tableData.value = res
        tableData.value.pagination.loading = true
      }).catch(err => {

      }).finally(() => {
        setTimeout(() => {
          nextTick(() => {
            tableData.value.pagination.loading = false
          })
        }, 200)
      })
    }

    function toDatabaseSettings(id) {
      console.log(id)
      router.push({"name": "databaseSettings", params: {"id": id}})
    }


    onMounted(() => {
      tableData.value.data = []
      ui.value.PHPMyAdmin.url = getPHPMyAdminUrl()
      nextTick(() => {
        requestInstance()
      })

    })
    return {
      /* 导出这一行 */
      tableData,
      params,
      tableSelected,
      onSearch,
      onUpdatePagination,
      columns,
      requestInstance,
      ui,
      requestCreateDatabaseInstance,
      toDatabaseSettings
    }
  }
}
</script>

<style scoped>

</style>
