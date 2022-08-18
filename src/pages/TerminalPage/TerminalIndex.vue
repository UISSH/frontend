<template>
  <q-page>
    <div class="flex justify-between q-gutter-sm q-pa-sm bg-blue-grey-2 ">
      <div class="flex q-gutter-md q-ml-md">
        <q-input dense color="blue-grey" label="host" v-model="auth.hostname"></q-input>
        <q-input dense color="blue-grey" label="username" v-model="auth.username"></q-input>
        <q-input dense color="blue-grey" label="password" type="password" v-model="auth.password"></q-input>
      </div>
      <q-btn label="login" icon="o_play_circle_outline" flat @click="initTerminal"></q-btn>
    </div>

    <div class="flex flex-center " style="width: calc(100vw - 320px);height: calc(100vh - 120px)">
      <div class="xterm " style="width:100%;height: 100%" id="terminal"></div>
    </div>
    <q-footer>
      <link href="/static/css/xterm.css" rel="stylesheet"/>
    </q-footer>

  </q-page>

</template>

<script>
import {Terminal} from 'xterm';
import {onMounted, ref} from "vue";
import {WebLinksAddon} from 'xterm-addon-web-links';
import {FitAddon} from 'xterm-addon-fit';
import {ACCESS_TOKEN} from "src/utils/mutation-types";
import {Cookies} from "quasar";

const term = new Terminal();


function init() {
  let element = document.getElementById('terminal')
  let fitAddon = new FitAddon()
  term.loadAddon(new WebLinksAddon());
  term.loadAddon(fitAddon);
  term.open(element);
  fitAddon.fit()

  function resizeScreen() {
    // console.log("size", size);
    try {
      fitAddon.fit();
    } catch (e) {
      console.log("e", e.message);
    }
  }

  window.addEventListener("resize", resizeScreen)
}

export default {
  name: "DemoPage",
  setup() {
    const auth = ref({
      "hostname": "127.0.0.1",
      "port": "22",
      "username": "root",
      "password": "",
      "private_key": "",
      "private_key_password": "",
    })
    onMounted(() => {
      init()
    })

    function initTerminal() {

      if (window.hasOwnProperty('terminalSocket')) {
        window.terminalSocket.close()
      }

      term.writeln('try connecting remote server...')
      let url = window.localStorage.getItem("api_url").replace("http", "ws")
        + '/ws/terminal/?token='
        + Cookies.get(ACCESS_TOKEN)

      const terminalSocket = new WebSocket(url);

      terminalSocket.addEventListener('error', function (event) {
        console.log('WebSocket error: ', event);
        term.writeln("无法建立 WebSocket 连接。")
      });
      terminalSocket.onopen = function (e) {
        console.log(e)
        terminalSocket.send(JSON.stringify(auth.value))
      }
      terminalSocket.onclose = function (e) {
        term.writeln("The connection was forcibly closed by the remote host.")
      }
      terminalSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        console.log(data)
        if (data.code === 201) {
          terminalSocket.send(JSON.stringify({
            'message': ''
          }))
          term.clear()

        }
        term.write(data.message);
      };
      //获取从ssh通道获取的outdata

      //输入shelldata并发送到后台
      term.onData(data => {
        terminalSocket.send(JSON.stringify({
          'message': data
        }));
      })
      window.terminalSocket = terminalSocket;
    }

    return {auth, initTerminal}
  }
}
</script>

<style scoped>

.card-size {
  padding: 16px;
  min-height: 360px;
  min-width: 360px;
}


</style>
