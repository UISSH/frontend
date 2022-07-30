import request from '../utils/request'

const api = {
  application: '/api/Application',
  website: '/api/Website'

}


export function listApplication() {
  return request({
    url: `${api.application}/list_application/`
  })
}

export function listWebsite(params) {
  return request({
    url: api.website,
    params: params
  })

}

export function getWebsite(pk) {
  return request({
    url: `${api.website}/${pk}/`
  })
}

export function deleteWebsite(pk) {
  return request({
    url: `${api.website}/${pk}/`,
    method: 'delete'
  })
}

export function getWebsiteCertificate(pk) {
  return request({
    url: `${api.website}/${pk}/get_ssl_info/`,

  })
}

export function putWebsite(instance, data) {
  return request({
    url: `${api.website}/${instance}/`,
    method: 'put',
    data: data
  })

}


export function patchWebsite(instance, data) {
  return request({
    url: `${api.website}/${instance}/`,
    method: 'patch',
    data: data
  })
}

export function createWebsite(data) {
  return request({
    url: `${api.website}/`,
    method: 'post',
    data: data
  })
}

export function attachDatabase(dbPk) {
  return request({
    url: `${api.website}/`,
    method: 'patch',
    data: {}
  })

}
