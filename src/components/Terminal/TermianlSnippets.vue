<script setup>
import EditSnippet from 'src/components/Terminal/EditSnippet'
import {onMounted, ref} from "vue";
import {getKVList} from "src/api/kvStorage";
import {listResStruct, TERMINAL_SNIPPET_PREFIX} from "src/utils/struct";
import {hideLoading, showLoading} from "src/utils/loading";
import {useQuasar} from "quasar";
import {snippetStore} from "stores/snippet";

const editProps = ref({
  name: '',
  value: ''
})

const $q = useQuasar()

const resData = ref(listResStruct())
const editMode = ref(false)
const params = {
  page: 1,
  search: TERMINAL_SNIPPET_PREFIX,
}
const snippet = snippetStore()

function onUpdatePagination(page) {
  params.value.page = page;
  requestInstance();
}

function requestInstance() {
  showLoading($q)
  getKVList(params).then(res => {

    resData.value = res
    snippet.items = []
    for (let item of res.results) {
      snippet.items.push({
        label: item.key.replace(TERMINAL_SNIPPET_PREFIX, ""),
        value: item.value
      })
    }

  }).finally(() => {
    hideLoading($q)
  })

}

function edit(item) {
  let _editProps = editProps.value
  _editProps.name = item.key.replace(TERMINAL_SNIPPET_PREFIX, '')
  _editProps.value = item.value
  editMode.value = true
}

function closeEditMode() {
  editMode.value = false
  requestInstance()
}

onMounted(() => {
  requestInstance()
})

</script>

<template>
  <q-card v-if="!editMode" class="no-border-radius no-shadow">

    <q-card-section>
      <div class="flex justify-between">
        <div class="text-h6">Snippets</div>
        <q-btn color="dark" icon="add" style="border-radius:16px" text-color="" @click="edit({key:'',value:null})">
        </q-btn>
      </div>
    </q-card-section>

    <q-card-section>
      <div v-if="resData.results.length>0" class="flex q-gutter-sm">
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

  <q-card v-else class="no-border-radius no-shadow">
    <q-card-section>
      <edit-snippet :name="editProps.name" :value="editProps.value" @close="closeEditMode()"></edit-snippet>
    </q-card-section>
  </q-card>
</template>


