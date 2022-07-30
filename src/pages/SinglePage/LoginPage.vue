<template>
  <q-layout>

    <q-page class="flex flex-center full-height full-width bg-blue-grey-1">

      <q-card class="apple-card card  ">
        <q-card-section class="bg-blue-grey-2">
          <div class="text-center">Login</div>
        </q-card-section>
        <q-card-section class="q-pa-lg q-gutter-sm">
          <q-input v-model="data.loginForm.username" color="blue-grey" label="username"></q-input>
          <q-input v-model="data.loginForm.password" color="blue-grey" label="password" type="password"></q-input>

        </q-card-section>
        <q-card-actions align="between" class="q-pa-md">
          <q-btn :loading="ui.loginBtn.loading" color="blue" label="login" @click="onLogin"></q-btn>
          <q-btn color="grey" label="forget password"></q-btn>
        </q-card-actions>
      </q-card>
    </q-page>
  </q-layout>
</template>

<script>


import {ref} from "vue";
import {requestLogin} from "src/api/account";
import {useRouter} from "vue-router";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter()
    const ui = ref({
      loginBtn: {
        loading: false
      }
    })
    const data = ref({
      loginForm: {
        "username": null,
        "password": null,
      }
    })

    async function onLogin() {
      ui.value.loginBtn.loading = true
      try {
        let res = await requestLogin(data.value.loginForm)
        console.log(res)
        await router.push({name: 'overview'})
      } catch (err) {
        ui.value.loginBtn.loading = false
      }

    }

    return {ui, data, onLogin}
  }
}
</script>

<style scoped>

.card {
  min-height: 320px;
  min-width: 360px;
}

</style>
