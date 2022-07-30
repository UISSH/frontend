import request from "src/utils/request";

const api = {
  database: '/api/Application'

}

export function doApplication(website_id, action) {
  return request({
    url: `${api.database}/${website_id}/app_${action}/`
  })
}
