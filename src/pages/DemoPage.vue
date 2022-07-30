<template>
  <q-page class="flex flex-center bg-blue-grey-1">
    <div class="q-pa-sm apple-card">
      <div class="xterm" id="terminal"></div>
    </div>
    <q-footer>
      <link href="/static/css/xterm.css" rel="stylesheet"/>
    </q-footer>
  </q-page>

</template>

<script>
import {Terminal} from 'xterm';
import {onMounted} from "vue";
import {WebLinksAddon} from 'xterm-addon-web-links';
import {FitAddon} from 'xterm-addon-fit';
import {ACCESS_TOKEN} from "src/utils/mutation-types";
import {Cookies} from "quasar";

const term = new Terminal();
term.loadAddon(new WebLinksAddon());
term.loadAddon(new FitAddon());


function initTerminal() {
  let element = document.getElementById('terminal')
  term.open(element);
  term.writeln('try connecting remote server...')
  let url = 'ws://'
    + "35.78.82.158:8000"
    + '/ws/terminal/?token='
    + Cookies.get(ACCESS_TOKEN)

  const terminalSocket = new WebSocket(url);

  terminalSocket.addEventListener('error', function (event) {
    console.log('WebSocket error: ', event);
    term.writeln("无法建立 WebSocket 连接。")
  });
  terminalSocket.onopen = function (e) {
    console.log(e)
  }
  terminalSocket.onclose = function (e) {
    term.writeln("连接被远程主机强制关闭")
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

export default {
  name: "DemoPage",
  setup() {
    onMounted(() => {
      initTerminal()
    })
    return {}
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
