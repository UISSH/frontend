<template>
  <q-card class="shadow-0">
    <q-card-section class="flex q-gutter-sm">
      <div v-if="ui.lasted.iBytes">
        IN: {{ format.humanStorageSize(ui.lasted.iBytes) }}
      </div>

      <div v-if="ui.option.series[0].data.slice(-1)">
        {{
          format.humanStorageSize(ui.option.series[0].data.slice(-1)[0][1])
        }}
        /sec
      </div>
      <div v-if="ui.lasted.oBytes">
        OUT: {{ format.humanStorageSize(ui.lasted.oBytes) }}
      </div>
      <div v-if="ui.option.series[1].data.slice(-1)">
        {{
          format.humanStorageSize(ui.option.series[1].data.slice(-1)[0][1])
        }}
        /sec
      </div>
    </q-card-section>
    <q-card-section>
      <v-chart :option="ui.option" class="chart"/>
    </q-card-section>
  </q-card>
</template>

<script>
import {use} from "echarts/core";
import {CanvasRenderer} from "echarts/renderers";

import {LineChart} from "echarts/charts";
import {UniversalTransition} from "echarts/features";
import {format} from "quasar";
import {GridComponent, LegendComponent, TitleComponent, ToolboxComponent, TooltipComponent,} from "echarts/components";

import VChart, {THEME_KEY} from "vue-echarts";

import {onBeforeUnmount, onMounted, ref} from "vue";
import {graphic} from "echarts";
import createWebsocket from "src/utils/websocket";
// destructuring to keep only what is needed
const {humanStorageSize} = format;

use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
]);

export default {
  name: "NetworkTrafficChart",
  components: {
    VChart,
  },
  provide: {
    [THEME_KEY]: "",
  },
  setup() {
    const __option = {
      tooltip: {
        trigger: "axis",
        valueFormatter: (val) => {
          return humanStorageSize(val) + "/sec";
        },
      },
      legend: {
        data: ["IN", "OUT"],
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },

      xAxis: {
        type: "time",
        data: [],
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: (val) => {
            return `${humanStorageSize(val)}/sec`;
          },
        },
      },
      series: [
        {
          name: "IN",
          type: "line",
          smooth: true,
          circle: "circle",
          itemStyle: {color: "#52a9ff"},
          areaStyle: {
            color: new graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: "rgba(30, 144, 255,1)",
                },
                {offset: 1, color: "rgba(30, 144, 255,.4)"},
              ],
              false
            ),
          },
          lineStyle: {width: 1, color: "#52a9ff"},
          data: [[Date.now(), 0]],
        },
        {
          name: "OUT",
          type: "line",
          smooth: true,
          circle: "circle",
          itemStyle: {color: "#f7b851"},
          areaStyle: {
            color: new graphic.LinearGradient(
              0,
              0,
              0,
              1,
              [
                {
                  offset: 0,
                  color: "rgba(255, 140, 0,1)",
                },
                {offset: 1, color: "rgba(255, 140, 0,.4)"},
              ],
              false
            ),
          },
          lineStyle: {width: 1, color: "#f7b851"},
          data: [[Date.now(), 0]],
        },
      ],
    };
    const interval = ref(2);
    let websocket = createWebsocket("server_status");
    const ui = ref({
      option: __option,
      interval: 120,
      lasted: {
        iBytes: null,
        oBytes: null,
      },
    });

    const data = ref({
      // {"id":0,"mark":""}
      intervalID: [],
    });
    websocket.onmessage = function (e) {
      const data = JSON.parse(e.data);
      if (data.code === 201) {
        let sql =
          "select *, 'interface_details' as _qtype  from  interface_details where interface != 'lo';";
        let query = {
          query_sql: sql,
          interval: interval.value,
        };
        websocket.send(JSON.stringify(query));
      } else {
        let net_interface = data.message.out[0];
        let xData = ui.value.option.xAxis.data;
        let INData = ui.value.option.series[0].data;
        let OUTData = ui.value.option.series[1].data;
        let lasted = ui.value.lasted;

        if (lasted.oBytes == null) {
          lasted.iBytes = Number(net_interface.ibytes);
          lasted.oBytes = Number(net_interface.obytes);
        } else {
          let _time = Date.now();

          let i_speed =
            (Number(net_interface.ibytes) - lasted.iBytes) / interval.value;
          let o_speed =
            (Number(net_interface.obytes) - lasted.oBytes) / interval.value;

          if (INData.length > 10) {
            INData.shift();
            xData.shift();
            OUTData.shift();
          }
          xData.push(_time);
          INData.push([_time, i_speed]);
          OUTData.push([_time, o_speed]);
          lasted.iBytes = Number(net_interface.ibytes);
          lasted.oBytes = Number(net_interface.obytes);
        }
      }
    };

    onBeforeUnmount(() => {
      websocket.close();
    });

    onMounted(() => {
      // let i = setInterval(Private._loadingNetChartData, 1000)
      // data.value.intervalID.push({id: i, mark: "_loadingNetChartData"})
    });

    onBeforeUnmount(() => {
      ui.value = {
        option: __option,
        interval: 120,
        lasted: {
          iBytes: null,
          oBytes: null,
        },
      };
    });

    return {
      ui,
      interval,
      format,
    };
  },
};
</script>

<style scoped>
.chart {
  height: 400px;
}
</style>
