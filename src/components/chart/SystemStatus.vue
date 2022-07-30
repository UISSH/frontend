<template>
  <q-card class="shadow-0 ">
    <q-card-section class="text-uppercase ">
      {{ $t("status") }}
    </q-card-section>
    <q-card-section>
      <div class="flex q-gutter-sm justify-around">
        <div class="text-center">
          <q-circular-progress
            :class="`text-${Public.getSystemStatusColor(serverStatus.loadAverage.per_core_used)} q-ma-md`"
            :color="Public.getSystemStatusColor(serverStatus.loadAverage.per_core_used)"
            :value="Number(serverStatus.loadAverage.per_core_used)"
            font-size="16px"
            show-value
            size="96px"
            track-color="grey-3"
          >
            {{ serverStatus.loadAverage.per_core_used }}%
            <q-tooltip v-if="serverStatus.loadAverage.info">
              <div v-for="item in  serverStatus.loadAverage.info" :key="item" class="text-body2 text-capitalize">
                {{ item.period }} : {{ item.average }}
              </div>
            </q-tooltip>
          </q-circular-progress>
          <div class="text-capitalize">{{ $t('linux.load average') }}</div>
        </div>
        <div class="text-center">
          <q-circular-progress
            :class="`text-${Public.getSystemStatusColor(serverStatus.cpu.used)} q-ma-md`"
            :color="Public.getSystemStatusColor(serverStatus.cpu.used)"
            :value="Number(serverStatus.cpu.used)"
            font-size="16px"
            show-value
            size="96px"
            track-color="grey-3"
          >
            {{ serverStatus.cpu.used }}%
            <q-tooltip>
              <div v-for="(value,item) in  serverStatus.cpu.info_1" :key="item" class="text-body2 text-capitalize">
                {{ item }} :{{ value }}
              </div>
            </q-tooltip>
          </q-circular-progress>
          <div class="text-uppercase">{{ $t('cpu') }}</div>
        </div>
        <div class="text-center">
          <q-circular-progress

            :class="`text-${Public.getSystemStatusColor(serverStatus.memory.used)} q-ma-md`"
            :color="Public.getSystemStatusColor(serverStatus.memory.used)"
            :value="Number(serverStatus.memory.used)"

            font-size="16px"
            show-value
            size="96px"
            track-color="grey-3"
          >
            {{ serverStatus.memory.used }}%
            <q-tooltip>
              <div v-for="(value,item) in  serverStatus.memory.info" :key="item" class="text-body2 text-capitalize">
                {{ item }} : {{ humanStorageSize(value ? Number(value) : 0) }}
              </div>
            </q-tooltip>
          </q-circular-progress>
          <div class="text-uppercase"> {{ $t('ram') }}</div>
        </div>
        <div class="text-center">
          <q-circular-progress

            :class="`text-${Public.getSystemStatusColor(serverStatus.disk.used)} q-ma-md`"
            :color="Public.getSystemStatusColor(serverStatus.disk.used)"
            :value="Number(serverStatus.disk.used)"
            font-size="16px"
            show-value
            size="96px"
            track-color="grey-3"
          >
            {{ serverStatus.disk.used }}%
            <q-tooltip v-if=" serverStatus.disk.info">
              <div class="text-body2 text-capitalize">total : {{ serverStatus.disk.info.total_space_gb }} GiB</div>
              <div class="text-body2 text-capitalize">available : {{ serverStatus.disk.info.available }}%</div>
              <div class="text-body2 text-capitalize">used : {{ serverStatus.disk.info.used }}%</div>
              <div class="text-body2 text-capitalize">available : {{ serverStatus.disk.info.space_left_gb }} GiB</div>
              <div class="text-body2 text-capitalize">used: {{ serverStatus.disk.info.used_space_gb }} GiB</div>
            </q-tooltip>
          </q-circular-progress>
          <div class="text-capitalize"> {{ $t('linux.disk') }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
  <q-card class="shadow-0 ">

    <q-table
      :columns="columns"

      :rows="serverStatus.systemInfo.rows"
      :rows-per-page-options="[6,12,20]"

      hide-header
      row-key="name"
      title="System info"
    >

    </q-table>
  </q-card>


</template>

<script>
import {onBeforeUnmount, onMounted, ref} from "vue";
import {format, useQuasar} from "quasar";
import createWebsocket from "src/utils/websocket";
import {errorLoading} from "src/utils/loading";

const columns = [
  {
    name: 'name',
    required: true,
    label: 'name',
    align: 'left',
    field: 'name',
  }, {
    name: 'value',
    required: true,
    label: 'value',
    align: 'left',
    field: 'value',
  },
]
const ui = ref({
  systemStatus: {
    cpu: {
      total: 45
    },
    ram: {
      total: 45
    },
    ens: {
      total: 45
    },
  }
})
const data = ref({

  intervalID: [
    //  {id:0,mark:""}
  ]
})
const Public = {
  getSystemStatusColor: (val) => {
    if (val < 33) {
      return 'positive'
    } else if (val >= 33 && val < 66) {
      return 'warning'
    } else {
      return 'negative'
    }
  }
}
export default {
  name: "SystemStatus",
  components: {},
  setup() {
    const {capitalize, humanStorageSize} = format
    const $q = useQuasar()
    let serverStatus = ref({
      cpu: {
        used: 0,
        info_0: null,
        info_1: null
      },
      memory: {
        used: 0,
        info: null
      },
      disk: {
        used: 0,
        info: null,
      },
      loadAverage: {
        used: 0,
        per_core_used: 0,
        info: null
      },
      systemInfo: {
        rows: []
      }

    })
    let serverStatusSocket;
    let filter = ref('')

    function calcTotalCPU(cpu) {
      return Number(cpu.user) + Number(cpu.nice) + Number(cpu.idle) + Number(cpu.system)
        + Number(cpu.iowait) + Number(cpu.irq) + Number(cpu.softirq)
    }

    function setCPUTime(cpu_time) {
      let cpu = serverStatus.value.cpu
      if (cpu.info_0 == null) {
        cpu.info_0 = cpu_time
      } else {
        let total_0 = calcTotalCPU(cpu.info_0)
        delete cpu_time['_qtype']
        cpu.info_1 = cpu_time
        let total_1 = calcTotalCPU(cpu.info_1)
        cpu.used = ((1 - (Number(cpu.info_1.idle) - Number(cpu.info_0.idle)) / (total_1 - total_0)) * 100).toFixed(2)
        cpu.info_0 = cpu_time
      }

    }

    function setMemoryInfo(memory_info) {
      let memory = serverStatus.value.memory
      delete memory_info['_qtype']
      memory.info = memory_info
      memory.used = ((
        Number(memory_info.memory_total) - Number(memory_info.buffers)
        - Number(memory_info.memory_free)
        - Number(memory_info.cached)
      ) / Number(memory_info.memory_total) * 100).toFixed(2)

    }

    function setDisk(_disk) {
      let disk_info = serverStatus.value.disk
      disk_info.used = _disk.used
      delete _disk['_qtype']
      disk_info.info = _disk

    }

    function setLoadAverage(load_list) {
      let loadAverage = serverStatus.value.loadAverage
      let item = load_list.filter(item => item.period === '1m')[0]
      loadAverage.used = (Number(item.average) * 100).toFixed(0)
      loadAverage.per_core_used = (Number(item.average) / Number(item.cpu_logical_cores) * 100).toFixed(2)
      loadAverage.info = load_list
    }

    function setSystemInfo(system_info) {
      delete system_info['_qtype']
      let system_list = []
      for (let _key in system_info) {
        if (_key === "uuid") {
          continue
        }
        if (system_info[_key]) {
          let item = {"name": _key, "value": system_info[_key]}
          if (item.name === "physical_memory") {
            item.value = humanStorageSize(item.value)
          }
          system_list.push(item)
        }

      }
      serverStatus.value.systemInfo.rows = system_list


    }

    function initTerminal() {


      serverStatusSocket = createWebsocket("server_status");

      serverStatusSocket.addEventListener('error', function (event) {
        console.log('WebSocket error: ', event)
        console.error("无法建立 WebSocket 连接。")
        errorLoading($q, {"response": "无法建立 WebSocket 连接。", "message": "获取主机状态错误"})
      });
      serverStatusSocket.onopen = function (e) {
        console.log(e)
      }
      serverStatusSocket.onclose = function (e) {
        console.log("连接被远程主机强制关闭")
      }
      serverStatusSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);

        if (data.code === 201) {
          let sql = "select *, 'cpu_time' as _qtype from cpu_time ;"
          sql += "select *,(select cpu_logical_cores from system_info) as cpu_logical_cores , 'load_average' as _qtype from load_average;"
          sql += "select *, 'memory_info' as _qtype from memory_info;"

          sql += "select system_info.*,kernel_info.version,'system_info' as _qtype  from  system_info,kernel_info;"
          sql += " select printf('%.2f',((blocks - blocks_available * 1.0) * blocks_size)/1073741824) as used_space_gb, " +
            "printf('%.2f',(1.0 * blocks_available * blocks_size / 1073741824)) as space_left_gb, " +
            "printf('%.2f',(1.0 * blocks * blocks_size / 1073741824)) as total_space_gb, " +
            "printf('%.2f',(((blocks - blocks_available * 1.0) * blocks_size)/1073741824)/(1.0 * blocks * blocks_size / 1073741824)) * 100 as 'used', " +
            "printf('%.2f',(1.0 * blocks_available * blocks_size / 1073741824)/(1.0 * blocks * blocks_size / 1073741824)) * 100 as 'available' " +
            " , 'disk' as _qtype from mounts  " +
            "where path = '/';"

          serverStatusSocket.send(JSON.stringify({
            'query_sql': sql,
            'interval': 1
          }))
        } else {

          let cpu_time = data.message.out.filter(item => item._qtype === 'cpu_time')[0]
          let memory_info = data.message.out.filter(item => item._qtype === 'memory_info')[0]
          let disk = data.message.out.filter(item => item._qtype === 'disk')[0]
          let load_average = data.message.out.filter(item => item._qtype === 'load_average')
          let system_info = data.message.out.filter(item => item._qtype === 'system_info')[0]
          setCPUTime(cpu_time)
          setMemoryInfo(memory_info)
          setDisk(disk)
          setLoadAverage(load_average)
          setSystemInfo(system_info)
        }
      };

      window.serverStatusSocket = serverStatusSocket;
    }


    onBeforeUnmount(() => {
      for (let item of data.value.intervalID) {
        console.debug(`onBeforeUnmount clear job [${item.mark}] interval id:${item.id} `)
        clearInterval(item.id)
      }
      window.serverStatusSocket.close()
      window.serverStatusSocket = null
    })

    onMounted(() => {
      initTerminal()
    })
    return {ui, data, Public, serverStatus, columns, filter, humanStorageSize}
  }
}
</script>

<style lang="sass">

</style>
