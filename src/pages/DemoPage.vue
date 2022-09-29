<template>
  <q-page class="">
    <ftp-sever-table></ftp-sever-table>
  </q-page>
</template>

<script>

import {nextTick, ref} from "vue";
import {listResStruct} from "src/utils/struct";
import ftpSeverTable from "components/FTPServer/FtpSeverTable";

const columns = [{name: "name", label: "名称", align: "left", field: "name"}];
export default {
  name: "yourName",
  components: {ftpSeverTable},
  setup(props, {emit}) {
    const tableData = ref(listResStruct());
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

    function requestInstance() {
      // 终点改写这里
      tableData.value.pagination.loading = true;
      // requestXXXX 替换为实际的函数
      requestXXXX(params.value)
        .then((res) => {
          tableData.value = res;
        })
        .catch((err) => {
        })
        .finally(() => {
          nextTick(() => {
            tableData.value.pagination.loading = false;
          });
        });
    }

    return {
      /* 导出这一行 */
      tableData,
      params,
      tableSelected,
      onSearch,
      onUpdatePagination,
      columns,
    };
  },
};
</script>

<style scoped>
.card-size {
  padding: 16px;
  min-height: 360px;
  min-width: 360px;
}
</style>
