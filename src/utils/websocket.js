import {Cookies} from "quasar";
import {ACCESS_TOKEN} from "src/utils/mutation-types";

let wsAddress = localStorage.getItem("api_url").replace("http", "ws");

if (wsAddress === "/") {
  wsAddress =
    window.location.protocol.replace("http", "ws") +
    "//" +
    window.location.host;
} else {
  if (wsAddress.charAt(wsAddress.length - 1) === "/") {
    // http://127.0.0.1:8000/  => http://127.0.0.1:8000
    wsAddress = wsAddress.substring(0, wsAddress.length - 1);
  }
}

console.log({wsAddress: wsAddress});
export default function createWebsocket(path) {
  let url = `${wsAddress}/ws/${path}/?token=${Cookies.get(ACCESS_TOKEN)}`;
  console.log({wsAddress_url: url});
  return new WebSocket(url);
}
