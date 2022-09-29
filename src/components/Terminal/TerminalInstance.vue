<template>
  <div class="flex  q-gutter-sm items-center content-center q-mb-sm ">
    <div class="text-green ">{{ props.auth.username }}@{{ props.auth.hostname }}:{{ props.auth.port }}</div>
    <q-icon size="18px" name="o_online_prediction" :color="connectStatus"></q-icon>
    <q-btn dense style="background-color: #282a36" color="white" flat label="reset"
           @click="resizeRemoteTerminal"></q-btn>
  </div>
  <q-separator class="bg-white q-mb-sm"></q-separator>
  <div class="flex flex-center " style="height: calc(100% - 40px);">
    <div :id="props.uuid" style="width: 100%;height: 100%"></div>
  </div>
</template>

<script>
import {onMounted, onUnmounted, ref} from "vue";
import {generateUUID4} from "src/utils/generate";
import {FitAddon} from "xterm-addon-fit";
import {WebLinksAddon} from "xterm-addon-web-links";
import {Terminal} from "xterm";
import {Cookies} from "quasar";
import {ACCESS_TOKEN} from "src/utils/mutation-types";


import 'xterm/css/xterm.css'
import {globalShellCommand} from "stores/example-store";


let basicTheme = {
  foreground: '#eff0eb',
  background: '#282a36',
  selection: '#97979b33',
  black: '#282a36',
  brightBlack: '#686868',
  red: '#ff5c57',
  brightRed: '#ff5c57',
  green: '#5af78e',
  brightGreen: '#5af78e',
  yellow: '#f3f99d',
  brightYellow: '#f3f99d',
  blue: '#57c7ff',
  brightBlue: '#57c7ff',
  magenta: '#ff6ac1',
  brightMagenta: '#ff6ac1',
  cyan: '#9aedfe',
  brightCyan: '#9aedfe',
  white: '#f1f1f0',
  brightWhite: '#eff0eb'
}

//
// const auth = ref({
//   hostname: "127.0.0.1",
//   port: "22",
//   username: "root",
//   password: "",
//   private_key: "",
//   private_key_password: "",
// });
export default {
  name: "TerminalInstance",
  props: {
    uuid: {
      type: String
    },
    title: {
      type: String
    },
    auth: {
      type: Object,
    }
  },
  setup(props, {emit}) {
    const v = ref()

    const GShellCommand = globalShellCommand()
    const term = new Terminal({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: basicTheme,
      cursorBlink: true
    });
    const connectStatus = ref('green')
    const fitAddon = new FitAddon();


    let terminalSocket;
    let terminalSize = {
      cols: 80,
      rows: 80,
    }

    function init() {
      let element = document.getElementById(props.uuid);
      term.loadAddon(new WebLinksAddon());
      term.loadAddon(fitAddon);
      term.open(element);
      term.onResize(size => {
        terminalSize.cols = size.cols
        terminalSize.rows = size.rows

      });
      fitAddon.fit();

      window.addEventListener("resize", resizeScreen);
    }

    function resizeRemoteTerminal() {
      terminalSocket.send(
        JSON.stringify({
          message: `stty cols ${terminalSize.cols} rows ${terminalSize.rows}  \r`,
        })
      );
    }

    function resizeScreen(size) {
      try {
        fitAddon.fit();
      } catch (e) {
        console.log("e", e.message);
      }
    }


    function initTerminal() {
      //https://www.cnblogs.com/goloving/p/15021509.html
      term.writeln("Try connecting remote server...");
      let url =
        window.localStorage.getItem("api_url").replace("http", "ws") +
        `/ws/terminal/${generateUUID4().replaceAll("-", "")}/?token=` +
        Cookies.get(ACCESS_TOKEN);

      terminalSocket = new WebSocket(url);

      terminalSocket.addEventListener("error", function (event) {
        term.writeln("The WebSocket connection could not be established.");
        connectStatus.value = 'red'
      });
      terminalSocket.onopen = function (e) {
        terminalSocket.send(JSON.stringify(props.auth));
      };
      terminalSocket.onclose = function (e) {
        term.writeln("\r\nThe websocket connection was closed.");
        connectStatus.value = 'red'
      };
      terminalSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.code === 201) {
          terminalSocket.send(
            JSON.stringify({
              message: `stty cols ${terminalSize.cols} rows ${terminalSize.rows}  \r`,
            })
          );
          term.clear();
        } else {
        }

        term.write(data.message);

      };

      term.onData((data) => {
        terminalSocket.send(
          JSON.stringify({
            message: data,
          })
        );
      });
    }

    GShellCommand.$subscribe((mutation, state) => {
        if (state.uuidHex.includes(props.uuid)) {
          terminalSocket.send(
            JSON.stringify({
              message: state.command + " \r",
            })
          );
        }
      }
    )


    onMounted(() => {
      init()
      initTerminal()

    })

    onUnmounted(() => {
      window.removeEventListener("resize", resizeScreen)
      terminalSocket.close()
    })

    return {props, v, connectStatus, resizeRemoteTerminal}


  }
}
</script>

<style scoped>

</style>
