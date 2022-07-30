import axios from 'axios'

import {ACCESS_TOKEN} from "src/utils/mutation-types";
import {Cookies} from 'quasar'


if (process.env.DEV) {
  console.log(`I'm on a development build`)
  console.log(process.env.API)
}

// 异常拦截处理器
const errorHandler = (error) => {
  const token = Cookies.get(ACCESS_TOKEN)
  if (token == null) {
    window.location.href = "/"
  }
  return Promise.reject(error)
}


let _request = () => {
  let api = window.localStorage.getItem("api_url")
  if (api == null) {
    api = process.env.API
    window.localStorage.setItem("api_url", api)
  }
  console.log("================>" + api)
  let request = axios.create({
    // API 请求的默认前缀
    baseURL: api,
    timeout: 10 * 60 * 1000 // 请求超时时间
  })
  request.interceptors.request.use(config => {
    const token = Cookies.get(ACCESS_TOKEN)
    if (token) {
      config.headers['Authorization'] = 'token ' + token
    }
    const csrfToken = Cookies.get('csrftoken');
    config.headers['X-CSRFToken'] = csrfToken
    return config
  }, errorHandler)


  request.interceptors.response.use((response) => {
    return response.data
  }, errorHandler)
  return request
}

let request = _request()

export default request

export {
  request as axios
}
