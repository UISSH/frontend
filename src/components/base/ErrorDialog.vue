<template>
  <q-dialog>
    <q-card class="apple-card card">
      <q-card-section
        class="q-pa-sm flex justify-between items-center content-center text-body1 bg-warning"
      >
        <span class="text-capitalize"> {{ $t("oops") }}！</span>
        <q-btn v-close-popup dense flat icon="close"></q-btn>
      </q-card-section>
      <q-card-section>
        <div class="text-body1 text-capitalize q-mb-md">
          {{ $t("message") }} : {{ data.message }}
        </div>

        <div v-if="data.code !== 500">
          <textarea
            v-model="data.response"
            class="err_textarea"
            readonly
            rows="12"
          >
          </textarea>
        </div>

        <div v-else class="q-pa-sm bg-blue-grey-1">
          <div v-html="data.response.data"></div>
        </div>
      </q-card-section>
      <q-card-actions></q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import {toRaw} from "vue";

export default {
  name: "ErrorDialog",
  props: {
    err: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    let response = "";
    let code = 1;
    let err = toRaw(props.err);
    console.info({err: err});
    if (props.err.hasOwnProperty("response") && props.err.response) {
      code = err.response.status;
      if (code >= 500) {
        response = err.response;
      } else {
        response = JSON.stringify(err.response, null, 2);
      }
    } else if (err) {
      response = JSON.stringify(err, null, 2);
    } else {
      response = "{}";
    }

    let data = {
      message: props.err.message,
      response: response,
      code: code,
    };
    return {
      props,
      data,
    };
  },
};
</script>

<style scoped>
.card {
  min-height: 100px;
  min-width: 300px;
  width: 100%;
  max-width: 80vw;
}

.err_textarea {
  margin-top: 8px;
  background-color: lightgrey;
  color: red;
  font-size: 0.75rem;
  outline: none;
  width: 100%;
  max-height: 400px;
  height: 100%;

  resize: none;
  border: solid 1px #ccc;

  -moz-box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.2);
  -webkit-box-shadow: inset 0 0 4px rgba(0, 0, 0, 0.2);
  box-shadow: inner 0 0 4px rgba(0, 0, 0, 0.2);
  -webkit-border-radius: 3px;
  -moz-border-radius: 3px;
  border-radius: 3px;
}
</style>
