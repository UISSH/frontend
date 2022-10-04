<template>
  <q-card v-if="Object.keys(ui.items)" class="no-shadow">
    <q-card-section>
      <div class="flex items-center">
        <q-icon color="red" name="favorite" size="24px"></q-icon>
        <div class="text-body1 q-pa-xs">Favorite</div>
      </div>
    </q-card-section>
    <q-card-section>
      <div class="flex q-gutter-xs items-center">
        <div v-for="item in ui.items" :key="item.uniqueKey" class="flex justify-between bg-blue-grey rounded-borders">
          <q-btn :icon="item.icon" :label="item.name" flat text-color="white"
                 @click="navigate(item)">
            <q-tooltip>
              {{ item.description }}
            </q-tooltip>
          </q-btn>
          <q-btn-dropdown flat style="max-width: 8px" text-color="white">
            <q-list>
              <q-item v-close-popup clickable @click="deleteItem(item.uniqueKey)">
                <q-item-section class="text-right">
                  Delete
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
