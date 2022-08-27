<template>
  <div class="text-right">
    <q-icon size="16px" name="o_online_prediction" :color="connectStatus"></q-icon>
  </div>
  <div
    class="flex flex-center bg-dark" style="height: calc(100% - 40px)"
  >

    <div class="xterm" :id="uid"></div>
  </div>
</template>

<script>
import {onBeforeUnmount, onMounted, onUnmounted, ref} from "vue";
import {generateUUID4} from "src/utils/generate";
import {FitAddon} from "xterm-addon-fit";
import {WebLinksAddon} from "xterm-addon-web-links";
import {Terminal} from "xterm";
import {Cookies} from "quasar";
import {ACCESS_TOKEN} from "src/utils/mutation-types";

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
    title: {
      type: String
    },
    auth: {
      type: Object,
    }
  },
  setup(props, {emit}) {

    const title = ref()
    const v = ref()
    const uid = generateUUID4()
    const term = new Terminal();
    const connectStatus = ref('green')
    let terminalSocket;

    function init() {
      let element = document.getElementById(uid);
      term.loadAddon(new WebLinksAddon());
      term.open(element);
    }

    function initTerminal() {
      term.writeln("try connecting remote server...");
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
        term.writeln("The websocket connection was closed.");
        connectStatus.value = 'red'
      };
      terminalSocket.onmessage = function (e) {
        const data = JSON.parse(e.data);
        if (data.code === 201) {
          terminalSocket.send(
            JSON.stringify({
              message: "",
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

    onMounted(() => {
      init()
      initTerminal()
    })

    onUnmounted(() => {
      terminalSocket.close()
    })

    return {props, v, uid,connectStatus}


  }
}
</script>

<style scoped>

</style>
