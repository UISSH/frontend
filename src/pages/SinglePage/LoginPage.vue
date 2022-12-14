<template>
  <q-layout>
    <q-page class="flex flex-center full-height full-width bg-blue-grey-1">
      <div class="q-gutter-sm">
        <q-card class="apple-card card">
          <q-card-section class="bg-blue-grey-2">
            <div class="text-body1 text-center text-capitalize">
              login your server
            </div>
          </q-card-section>

          <q-card-section class="q-pa-lg q-gutter-sm">
            <q-input
              v-model="data.apiUrl"
              :color="showWarning() ? 'warning' : 'blue-grey'"
              dense
              label="API"
              @update:model-value="updateApiUrl"
            >
              <template v-slot:append>
                <q-btn flat icon="done" @click="setApiUrl()" @keydown.enter="setApiUrl()">
                  <q-tooltip> Click to take effect</q-tooltip>
                </q-btn>
              </template>
            </q-input>
            <div v-if="ui.showForm">
              <q-input
                v-model="data.loginForm.username"
                color="blue-grey"
                label="username"
                @keydown.enter="onLogin"
              ></q-input>
              <q-input
                v-model="data.loginForm.password"
                color="blue-grey"
                label="password"
                type="password"
                @keydown.enter="onLogin"
              ></q-input>
            </div>
          </q-card-section>
          <q-card-actions v-if="ui.showForm" align="between" class="q-pa-md">
            <q-btn
              :loading="ui.loginBtn.loading"
              color="blue"
              label="login"

              @click="onLogin"
            ></q-btn>
            <q-btn color="grey" label="forget password"></q-btn>
          </q-card-actions>
        </q-card>
        <q-banner
          v-if="showWarning()"
          class="text-center bg-transparent"
          dense
          rounded
        >
          <div style="opacity: 0.6">
            <q-icon color="red" name="o_lock_open" size="18px"></q-icon>
            <span class="q-ml-sm text-red text-caption"
            >Data is not encrypted during transmission.</span
            >
          </div>
        </q-banner>
      </div>
    </q-page>
  </q-layout>
</template>

<script>
import {onMounted, ref} from "vue";
import {requestLogin} from "src/api/account";
import {useRoute, useRouter} from "vue-router";
import {errorLoading} from "src/utils/loading";
import {useQuasar} from "quasar";

export default {
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const route = useRoute();
    const $q = useQuasar();

    const ui = ref({
      loginBtn: {
        loading: false,
      },
      showForm: true,
    });
    const data = ref({
      loginForm: {
        username: null,
        password: null,
      },
      apiUrl: "",
    });

    onMounted(() => {
      data.value.apiUrl = window.localStorage.getItem("api_url");
      if (route.query.hasOwnProperty("apiUrl")) {
        if (route.query.apiUrl !== data.value.apiUrl) {
          ui.value.showForm = false;
        }
        data.value.apiUrl = route.query.apiUrl;
      }
    });

    function updateApiUrl(val) {
      ui.value.showForm =
        window.localStorage.getItem("api_url") === data.value.apiUrl;
    }

    function getCurrentApi() {
      return window.localStorage.getItem("api_url");
    }

    function setApiUrl() {
      window.localStorage.setItem("api_url", data.value.apiUrl);
      window.location.href = "/";
    }

    function showWarning() {
      if (data.value.apiUrl === "/") {
        return window.location.protocol === "http:";
      } else {
        return !data.value.apiUrl.includes("https://");
      }
    }

    async function onLogin() {
      ui.value.loginBtn.loading = true;
      try {
        let res = await requestLogin(data.value.loginForm);
        console.log(res);
        await router.push({name: "overview"});
      } catch (err) {
        ui.value.loginBtn.loading = false;
        errorLoading($q, err);
      }
    }

    return {
      ui,
      data,
      onLogin,
      setApiUrl,
      getCurrentApi,
      updateApiUrl,
      showWarning,
    };
  },
};
</script>

<style scoped>
.card {
  min-height: 320px;
  min-width: 360px;
}
</style>
