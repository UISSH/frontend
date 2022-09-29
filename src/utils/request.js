import axios from "axios";

import {ACCESS_TOKEN} from "src/utils/mutation-types";
import {Cookies} from "quasar";

if (process.env.DEV) {
  console.log(`I'm on a development build`);
  console.log(process.env.API);
}

const errorHandler = (error) => {
  if (error.config.url === "/api/User/login/") {
    return Promise.reject(error);
  }
  let token = Cookies.get(ACCESS_TOKEN);
  if (token == null) {
    window.location.href = "/";
  }

  console.log({errerr: error});
  return Promise.reject(error);
};

let _request = () => {
  let api = window.localStorage.getItem("api_url");
  if (api == null) {
    api = process.env.API;
    window.localStorage.setItem("api_url", api);
  }
  console.debug({"api address": api});
  let request = axios.create({
    baseURL: api,
    timeout: 10 * 60 * 1000,
  });
  request.interceptors.request.use((config) => {
    let token = Cookies.get(ACCESS_TOKEN);
    if (token) {
      config.headers["Authorization"] = "token " + token;
    }

    //
    let csrfToken = Cookies.get("csrftoken");
    if (csrfToken) {
      config.headers["X-CSRFToken"] = csrfToken;
    }

    return config;
  }, errorHandler);

  request.interceptors.response.use((response) => {
    return response.data;
  }, errorHandler);
  return request;
};

let request = _request();

export default request;

export {request as axios};
