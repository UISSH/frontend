<template>
  <div class="">
    <q-dialog
      v-model="ui.dialog.ftpAccountSettings"
    >
      <div>
        <account-setting ref="accountSettingRef" :data="ui.accountSetting.data"></account-setting>

      </div>
    </q-dialog>

  </div>
  <div v-if="!ui.status.installed" class="flex flex-center bg-blue-grey-2" style="height: 100vh">
    <q-card class="apple-card-shadow ">
      <q-card-section class="flex bg-primary text-white justify-between items-center  ">
        <div class="text-body1"> Install ftpserver</div>
        <q-btn flat href="https://github.com/fclairamb/ftpserver" icon="fab fa-github" target="_blank" type="a"
        >
        </q-btn>
      </q-card-section>
      <q-card-section>
        Software needs to be installed to continue.
      </q-card-section>
      <q-card-actions align="right">
        <q-btn :loading="ui.loading.requestInstall" color="primary" label="install" @click="requestInstall"></q-btn>
      </q-card-actions>
    </q-card>

  </div>
  <div v-else>
    <q-banner class=" bg-blue-grey-2 text-dark ">
      <div class="flex justify-between items-center no-wrap">
        <div class="flex q-gutter-sm items-baseline no-wrap">
          <q-badge :color="ui.status.run_status ? 'green':'red'" rounded>
            <q-tooltip>
              run status
            </q-tooltip>
          </q-badge>
          <div class="q-gutter-sm items-baseline">ftp:{{ getFTPHost() }}</div>
        </div>

        <div class="flex q-gutter-xs">
          <q-btn dense flat icon="o_add" @click="clickEditor(undefined)"></q-btn>
          <q-btn :loading="ui.loading.requestSyncFtpServerAccount" dense flat icon="o_sync"
                 @click="requestSyncFtpServerAccount">
            <q-tooltip>sync account data to ftp server.</q-tooltip>
          </q-btn>
          <q-btn v-if="ui.status.run_status" :loading="ui.loading.requestStopServer" dense flat icon="o_power_settings_new"
                 @click="requestStopServer"
          ></q-btn>
          <q-btn v-else :loading="ui.loading.requestStartServer" dense flat icon="o_play_circle"
                 @click="requestStartServer"></q-btn>
          <q-btn :loading="ui.loading.requestInstance" dense flat icon="o_refresh" @click="requestInstance"></q-btn>
        </div>


      </div>
    </q-banner>
    <q-table
      v-model:selected="tableSelected"
      :columns="columns"
      :loading="tableData.pagination.loading"
      :rows="tableData.results"
      class="q-pa-none shadow-0"
      hide-pagination
      row-key="id"

    >
      <template v-slot:body-cell-action="props">
        <q-td :props="props">

          <div class="">
            <q-btn dense flat icon="settings" rounded @click="clickEditor(props.row)"></q-btn>
            <q-btn :loading="ui.loading.requestDeleteAccount" dense flat icon="delete" rounded
                   @click="requestDeleteAccount(props.row.id)"></q-btn>
          </div>
        </q-td>
      </template>
    </q-table>
    <div
      v-if="tableData.pagination.total_pages > 0"
      class="row justify-center q-mt-md"
    >
      <q-pagination
        v-model="tableData.pagination.current_page"
        :max="tableData.pagination.total_pages"
        color="grey-8"
        direction-links
        size="md"
        @update:model-value="onUpdatePagination"
      />
    </div>
    <q-banner class="text-warning text-caption  text-right q-mt-sm">Please use a client that supports
      tls.
    </q-banner>
  </div>
</template>

<script>


import {nextTick, onMounted, ref} from "vue";
import {listResStruct} from "src/utils/struct";
import {
  deleteAccount,
  installFtpServer,
  listFtpServer,
  pingFtpServer,
  reloadFtpServer,
  startFtpServer,
  stopFtpServer,
  syncFtpServerAccount
} from "src/api/ftpserver";
import AccountSetting from "components/FTPServer/AccountSetting";

const columns = [
  {name: "username", label: "username", field: "username", align: 'left'},
  {name: "password", label: "password", field: "password", align: 'left'},
  {name: "file_system", label: "file_system", field: "file_system"},
  {name: "action", label: "action", field: "id"},
];
export default {
  name: "FTPSeverTable",
  components: {AccountSetting},
  setup(props, {emit}) {
    const tableData = ref(listResStruct());
    const accountSettingRef = ref(null)
    const ui = ref({
      dialog: {
        ftpAccountSettings: false,
      },
      status: {
        "installed": true,
        "run_status": false
      },
      loading: {
        requestInstance: false,
        requestInstall: false,
        requestSyncFtpServerAccount: false,
        requestPingFtpServer: false,
        requestPostAccount: false,
        requestPatchAccount: false,
        requestDeleteAccount: false,
        requestReloadServer: false,
        requestStartServer: false,
        requestStopServer: false,

      },
      accountSetting: {
        data: undefined
      }
    })
    const params = ref({
      page: 1,
      search: null,
    });
    const tableSelected = ref([]);

    function onSearch(key) {
      params.value.search = key;
      requestInstance();
    }

    function onUpdatePagination(page) {
      params.value.page = page;
      requestInstance();
    }

    function getFTPHost() {
      let host = window.localStorage.getItem("api_url");
      if (host.startsWith("/")) {
        return window.location.host
      } else {
        host = host.split(":")[1]
        return host
      }

    }

    function requestInstall() {
      ui.value.loading.requestInstall = true
      installFtpServer().then(res => {

      }).finally(() => {
        ui.value.loading.requestInstall = false
        requestPingFtpServer()
      })

    }

    function clickEditor(data) {

      ui.value.accountSetting.data = data
      ui.value.dialog.ftpAccountSettings = true
    }

    function requestSyncFtpServerAccount() {
      ui.value.loading.requestSyncFtpServerAccount = true
      syncFtpServerAccount().then(res => {

      }).catch(res => {

      }).finally(() => {
        ui.value.loading.requestSyncFtpServerAccount = false
      })

    }

    function requestPatchAccount() {

    }

    function requestDeleteAccount(pk) {
      ui.value.loading.requestDeleteAccount = true
      deleteAccount(pk).then(async res => {
        await requestReloadServer()
        await requestInstance()
      }).catch(err => {
        console.log(err)
      }).finally(() => {
        ui.value.loading.requestDeleteAccount = false
      })


    }

    function requestStartServer() {
      ui.value.loading.requestStartServer = true
      startFtpServer().then(async res => {
        await requestPingFtpServer()
      }).catch(res => {

      }).finally(() => {
        ui.value.loading.requestStartServer = false
      })

    }

    function requestStopServer() {
      ui.value.loading.requestStopServer = true
      stopFtpServer().then(async res => {
        await requestPingFtpServer()
      }).catch(res => {

      }).finally(() => {
        ui.value.loading.requestStopServer = false
      })

    }

    function requestReloadServer() {
      ui.value.loading.requestReloadServer = true
      reloadFtpServer().then(async res => {
        await requestPingFtpServer()
      }).catch(res => {

      }).finally(() => {
        ui.value.loading.requestReloadServer = false
      })

    }

    function requestPingFtpServer() {
      pingFtpServer().then(res => {
        console.log(res)
        ui.value.status = res
      })
    }

    function requestInstance() {
      // 终点改写这里
      ui.value.loading.requestInstance = true
      tableData.value.pagination.loading = true;
      // requestXXXX 替换为实际的函数
      listFtpServer(params.value)
        .then((res) => {
          tableData.value = res;
        })
        .catch((err) => {
        })
        .finally(() => {
          nextTick(() => {
            tableData.value.pagination.loading = false;
            ui.value.loading.requestInstance = false
          });
        });
    }

    onMounted(() => {
      tableData.value.data = [];
      nextTick(() => {
        requestInstance();
        requestPingFtpServer();
      });

    });
    return {
      /* 导出这一行 */
      tableData,
      params,
      tableSelected,
      accountSettingRef,
      onSearch,
      onUpdatePagination,
      columns,
      getFTPHost,
      ui,
      requestInstance,
      requestInstall,
      requestStopServer,
      requestStartServer,
      requestReloadServer,
      requestSyncFtpServerAccount,
      requestPatchAccount,
      requestDeleteAccount,
      clickEditor

    };
  },
};
</script>

<style scoped>


</style>
