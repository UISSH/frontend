<template>
  <q-card class="card q-pa-md">
    <div v-if="ui.step === 'create'">
      <q-card-section class="q-gutter-sm">
        <q-form class="q-gutter-md">
          <q-input
            v-model="data.newDatabaseForm.name"
            :rules="[
              (val) => (val !== null && val !== '') || 'Please type this',
            ]"
            color="dark"
            filled
            hint="database name"
            label="name *"
            lazy-rules
          />

          <q-input
            v-model="data.newDatabaseForm.username"
            :rules="[
              (val) => (val !== null && val !== '') || 'Please type this',
            ]"
            color="dark"
            filled
            label="username *"
            lazy-rules
          />
          <q-input
            v-model="data.newDatabaseForm.password"
            :rules="[
              (val) => (val !== null && val !== '') || 'Please type this',
            ]"
            :type="ui.isPwd ? 'password' : 'text'"
            color="dark"
            filled
            label="password *"
            lazy-rules
          >
            <template v-slot:append>
              <q-icon
                :name="ui.isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="ui.isPwd = !ui.isPwd"
              />
            </template>
          </q-input>
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          color="blue-grey"
          label="Create"
          @click="Public.requestCreateNewDatabase()"
        ></q-btn>
      </q-card-actions>
    </div>
    <div v-else-if="ui.step === 'success'">
      <q-card-section class="flex flex-center">
        <div>
          <q-icon color="green" name="o_check_circle" size="128px"></q-icon>
          <div><span>Created successfully!</span></div>
        </div>
      </q-card-section>
    </div>

    <div v-else-if="ui.step === 'failed'">
      <q-card-section class="flex flex-center">
        <div>
          <q-icon color="red" name="o_error" size="128px"></q-icon>
          <div><span>Oops...created failed!</span></div>
        </div>
      </q-card-section>

      <q-card-section>
        <div class="text-red">Error</div>
        <q-input v-model="ui.errorMsg" readonly type="textarea"></q-input>
      </q-card-section>
    </div>
  </q-card>
</template>

<script>
import {ref} from "vue";
import {createDataBaseInstance, createNewDatabase} from "src/api/database";
import {generateDBPassword} from "src/utils/generate";

export default {
  name: "NewDatabase",
  setup(props, {emit}) {
    const data = ref({
      newDatabaseForm: {
        name: null,
        username: generateDBPassword(8),
        password: generateDBPassword(8),
      },
    });
    const ui = ref({
      step: "create",
      errorMsg: "",
      isPwd: true,
    });

    const Public = {
      requestCreateNewDatabase() {
        createNewDatabase(data.value.newDatabaseForm)
          .then((res) => {
            console.log(res);
            createDataBaseInstance(res.id)
              .then((res) => {
                ui.value.step = "success";
                emit("on-success");
              })
              .catch((err) => {
                ui.value.step = "failed";
                ui.value.errorMsg = JSON.stringify(err.response.data, null, 1);
              });
          })
          .catch((err) => {
            ui.value.step = "failed";
            ui.value.errorMsg = JSON.stringify(err.response.data, null, 1);
          });
      },
    };

    return {ui, data, Public};
  },
};
</script>

<style scoped>
.card {
  width: 98vw;
  max-width: 800px;
}
</style>
