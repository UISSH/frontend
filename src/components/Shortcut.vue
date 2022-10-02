<template>
  <q-card v-if="Object.keys(ui.items)" class="no-shadow">
    <q-card-section>
      <div v-for="item in ui.items" :key="item.uniqueKey" class="flex q-gutter-xs items-center">
        <div class="flex justify-between bg-blue-grey rounded-borders">
          <q-btn :icon="item.icon" :label="item.name" flat text-color="white"
                 @click="navigate(item)"/>
          <q-btn-dropdown flat style="max-width: 8px" text-color="white">
            <q-list>
              <q-item v-close-popup clickable>
                <q-item-section class="text-right">
                  <q-item-label @click="deleteItem(item.uniqueKey)">Delete</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>

      </div>
    </q-card-section>

  </q-card>
</template>

<script>
import {shortcutStore} from "stores/shortcut";
import {onMounted, ref} from "vue";
import {useRouter} from "vue-router";
import {storeToRefs} from "pinia";

export default {
  name: "ShortcutComponent",
  setup() {
    const router = useRouter()
    let shortcut = shortcutStore()

    const {cate, items} = storeToRefs(shortcut)
    let ui = ref({
      cate: cate,
      items: items
    })
    onMounted(async () => {
      await shortcut.syncFromCloud()
    })

    function navigate(item) {
      router.push(item.router)
    }

    function deleteItem(uniqueKey) {
      shortcut.deleteItem(uniqueKey)

    }

    return {
      ui, navigate, deleteItem
    }


  }
}
</script>

<style scoped>

</style>
