import {defineStore} from "pinia";
import {getKV, updateKV} from "src/api/kvStorage";


/*
* 点击快捷方式即可进入对应的操作,用户可以收藏自己频繁的操作为快捷方式.
* icon ref:https://quasar.dev/vue-components/icon#introduction
* router ref:https://router.vuejs.org/guide/essentials/navigation.html#navigate-to-a-different-location
* pinia ref:https://pinia.vuejs.org/core-concepts/#option-stores
* |---------UI-----------|
* |icon | name  | action |
* |---------UI---------- |

* */

const UNIQUE_KEY = 'SHORTCUT_DATA_V1'
/*
let cateDetail = {name: 'all', icon: "o_home", description: 'all '}
let items = {
  'hkdsfkhaf': {
    uniqueKey: 'hkdsfkhaf',
    icon: "o_home",
    name: 'index',
    description: "enter home",
    cate: "nav",
    router: {name: 'terminal'}
  }
}
*/
export const shortcutStore = defineStore("shortcut", {
  state: () => {
    return {
      cate: [/* [cateDetail] */], items: { /* items */}
    }
  }, getters: {}, actions: {

    async syncFromCloud() {
      let val = await getKV(UNIQUE_KEY)

      if (val.value === null) {
        this.cate = {name: 'all', icon: "o_home", description: 'all '}
        this.items = {
          'hkdsfkhaf': {
            uniqueKey: 'hkdsfkhaf',
            icon: "o_home",
            name: 'index',
            description: "enter home",
            cate: "nav",
            router: {name: 'terminal'}
          }
        }
      } else {
        let _data = JSON.parse(val.value)
        this.cate = _data.cate
        this.items = _data.items
      }
    },
    async syncToCloud() {

      let _val = JSON.stringify({
        cate: this.cate,
        items: this.items
      })
      await updateKV(UNIQUE_KEY, _val)
    },
    async addOrUpdateItem(uniqueKey, icon, name, description, cate, router) {
      let item = this.items[uniqueKey]
      item.icon = icon
      item.name = icon
      item.uniqueKey = uniqueKey
      item.description = icon
      item.cate = icon
      item.router = icon
      await this.syncToCloud()
    },

    async deleteItem(uniqueKey) {
      delete this.items[uniqueKey]
      await this.syncToCloud()
    },
    debounce: {
      // debounce the action syncToCloud by 300ms
      syncToCloud: 300,
      syncFromCloud: 300,
    },

  }
})
