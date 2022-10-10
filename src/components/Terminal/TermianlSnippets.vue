<script setup>
import EditSnippet from 'src/components/Terminal/EditSnippet'
import {onMounted, ref} from "vue";
import {getKVList} from "src/api/kvStorage";
import {listResStruct, TERMINAL_SNIPPET_PREFIX} from "src/utils/struct";

const editProps = ref({
  name: '',
  content: ''
})

const resData = ref(listResStruct())
const show = ref(false)
const params = {
  page: 1,
  search: TERMINAL_SNIPPET_PREFIX,
}

function onUpdatePagination(page) {
  params.value.page = page;
  requestInstance();
}

function requestInstance() {
  getKVList(params).then(res => {
    resData.value = res;
  })

}

function edit(item) {
  console.log(item)
  editProps.value.name = item.key.replace(TERMINAL_SNIPPET_PREFIX, '')
  editProps.value.content = item.value
  show.value = true
}

onMounted(() => {
  requestInstance()
})

</script>

<template>
  <q-card class="no-border-radius no-shadow">

    <q-card-section>
      <input autocomplete="new-password" hidden type="password">
      <div class="flex justify-between">
        <div class="text-h6">Snippets</div>
        <q-btn color="dark" icon="add" style="border-radius:16px" text-color="">
        </q-btn>
      </div>
    </q-card-section>
    <q-card-section v-if="show">
      <edit-snippet :content="editProps.content" :name="editProps.name" @close="show=false"></edit-snippet>
    </q-card-section>
    <q-card-section>
      <div v-if="resData.results.length>0">
        <div v-for="item in resData.results" :key="item.key">
          <q-btn :label="item.key.replace(TERMINAL_SNIPPET_PREFIX,'')" color="blue-grey" @click="edit(item)"></q-btn>
        </div>
      </div>
      <div v-else class="q-pa-md text-center">
        Empty
      </div>

    </q-card-section>
    <q-card-actions align="center">
      <q-pagination
        v-model="resData.pagination.current_page"
        :max="resData.pagination.total_pages"
        color="grey-8"
        direction-links
        size="md"
        @update:model-value="onUpdatePagination"
      />
    </q-card-actions>

  </q-card>
</template>


