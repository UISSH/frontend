<template>
  <drop-zone @files-dropped="uploadFile">
    <div class="flex  q-gutter-sm items-center content-center q-mb-sm ">
      <q-btn color="white" dense flat icon="o_fit_screen" style="background-color: #282a36"
             @click="resizeRemoteTerminal">
        <q-tooltip>fit window size</q-tooltip>
      </q-btn>
      <div class="text-green ">{{ props.auth.username }}@{{ props.auth.hostname }}:{{ props.auth.port }}</div>
      <q-icon :color="connectStatus" name="o_online_prediction" size="18px"></q-icon>

    </div>
    <q-separator class="bg-white q-mb-sm"></q-separator>
    <div class="flex flex-center " style="height: calc(100vh - 200px);">
      <div :id="props.uuid" style="width: 100%;height: 100%"></div>
    </div>
  </drop-zone>

</template>

<script>
import {defineComponent, onMounted, onUnmounted, ref, toRaw} from "vue";
import {generateUUID4} from "src/utils/generate";
import {FitAddon} from "xterm-addon-fit";
import {WebLinksAddon} from "xterm-addon-web-links";
import {Terminal} from "xterm";
import {Cookies, useQuasar} from "quasar";
import {ACCESS_TOKEN} from "src/utils/mutation-types";
import DropZone from "src/components/Terminal/DropZone"

import 'xterm/css/xterm.css'
import {globalShellCommandStore} from "stores/example-store";
import {uploadFileToSFTP} from "src/api/terminal";
import {errorLoading, hideLoading, showLoading} from "src/utils/loading";


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

// const auth = ref({
//   hostname: "127.0.0.1",
//   port: "22",
//   username: "root",
//   password: "",
//   private_key: "",
//   private_key_password: "",
// });
export default defineComponent({
  name: "TerminalInstance",
  components: {DropZone},
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
    const $q = useQuasar()
    const GShellCommand = globalShellCommandStore()
    const term = new Terminal({
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: basicTheme,
      cursorBlink: true
    });
    const connectStatus = ref('green')
    const fitAddon = new FitAddon();
    let currentWorkDir = '/tmp'
    let droppedFiles = null

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
        if (data.hasOwnProperty('work_dir')) {
          currentWorkDir = data.work_dir
          requestUploadFile()
        } else {
          term.write(data.message)
        }
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

        if (state.uuidHex.includes('all') || state.uuidHex.includes(props.uuid)) {
          terminalSocket.send(
            JSON.stringify({
              message: state.command + " \r",
            })
          );
        }
      }
    )

    function getWorkDir() {
      terminalSocket.send(
        JSON.stringify({
          message: '',
          method: 'get_work_dir'
        })
      );
    }

    function uploadFile(e) {

      droppedFiles = e
      getWorkDir()

    }

    function requestUploadFile() {
      if (droppedFiles == null || droppedFiles.length <= 0) {
        return
      }
      let file = droppedFiles[0]
      showLoading($q)
      uploadFileToSFTP(toRaw(props.auth), currentWorkDir + "/" + file.name, file).then(res => {
      }).catch(err => {
        errorLoading($q, err)
      }).finally(() => {
        hideLoading($q)
      })
    }


    onMounted(() => {
      init()
      initTerminal()

    })

    onUnmounted(() => {
      window.removeEventListener("resize", resizeScreen)
      terminalSocket.close()
    })

    return {props, v, connectStatus, resizeRemoteTerminal, uploadFile, getWorkDir}


  }
})
</script>

<style scoped>

</style>
