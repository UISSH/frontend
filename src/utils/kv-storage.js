import {deleteKV, getKV, updateKV} from "src/api/kvStorage"

class KVStorage {
  constructor(name) {
    this.name = name
    this.data = null
    this.cloudData = null
  }


  async init() {
    // Get cloud data.
    try {
      this.cloudData = (await getKV(this.name)).value
    } catch (err) {
      this.cloudData = null
      if (err.response.status !== 404) {
        console.error(`Get ${this.name} error`)
      } else {
        console.info(`${this.name} not existed.`)
      }
    }

    // if cloud data exist, sync it to local
    if (this.cloudData != null && this.cloudData !== "{}") {
      window.localStorage.setItem(this.name, this.cloudData)
      this.data = this.cloudData
    } else {
      this.data = window.localStorage.getItem(this.name)
    }


    if (this.data && this.cloudData == null) {
      await this.requestUpdateKV(this.data)
    }
    return new Promise(resolve => {
      resolve(this.data)
    });


  }


  getItem() {
    return this.data
  }

  requestUpdateKV(val) {
    updateKV(this.name, val).then(res => {
      console.info(`sync ${this.name} data successful!`)
    }).catch(err => {
      console.error(`sync ${this.name} data failed!`)
    })
  }

  setItem(val) {
    window.localStorage.setItem(this.name, val)
    this.data = val
    if (this.cloudData == null) {
      this.requestUpdateKV(val)
    } else {
      console.log("updateKV")
      updateKV(this.name, val).then(res => {
        console.info(`sync ${this.name} data successful!`)
      }).catch(err => {
        console.error(`sync ${this.name} data failed!`)
      })
    }
  }

  removeItem(val) {
    window.localStorage.removeItem(this.name)
    if (this.data == null) {
      deleteKV(this.name, val).then(res => {
        console.info(`sync ${this.name} data successful!`)
      }).catch(err => {
        console.error(`sync ${this.name} data failed!`)
      })
    }
  }
}

export default KVStorage
