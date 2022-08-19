<template>
  <q-card v-if="ui.card === 0" class="card shadow-0 bg-grey-1">
    <q-card-section v-if="ui.card_0.loading" class="text-center">
      <q-circular-progress
        class="q-ma-md"
        color="blue-grey-2"
        indeterminate
        size="64px"
      />
      <div>Loading ...</div>
    </q-card-section>
    <div v-else>
      <q-card-section class="q-ma-none q-pa-sm bg-blue-grey-1">
        Select Application
      </q-card-section>

      <q-card-section class="q-gutter-sm">
        <!--suppress JSValidateTypes -->
        <q-option-group
          v-model="ui.card_0.application.model"
          :options="ui.card_0.application.options"
          color="blue-grey"
          inline
          no-caps
          @update:model-value="Public.onSelectApplication"
        >
          <template v-slot:label="opt">
            <div class="row items-center">
              <span class="text-body2">{{ opt.label }}</span>
              <!--              <q-icon class="q-ml-sm" color="teal" name="help" size="1.5em" @click.stop="()=>{}"/>-->
            </div>
          </template>
        </q-option-group>
        <div class="q-pa-sm text-caption">{{ ui.card_0.description }}</div>
      </q-card-section>

      <q-card-section class="flex q-gutter-md justify-end"> </q-card-section>
      <q-card-actions class="justify-end">
        <q-btn
          :disable="ui.card_0.application.model == null"
          :label="$t('next')"
          color="blue"
          icon="done"
          @click="ui.card = 1"
        ></q-btn>
      </q-card-actions>
    </div>
  </q-card>

  <q-card v-if="ui.card === 1" class="card shadow-0 bg-grey-1 q-pa-sm">
    <q-card-section class="flex justify-between">
      <div class="text-body1 text-capitalize">{{ $t("basic") }}</div>
    </q-card-section>

    <q-card-section class="q-gutter-sm">
      <q-input
        v-model="data.form.websiteForm.name"
        :label="$t('name')"
        color="dark"
        dense
      ></q-input>
      <q-input
        v-model="data.form.websiteForm.domain"
        :label="$t('domain')"
        color="dark"
        dense
      ></q-input>
      <q-input
        v-model="data.form.websiteForm.index_root"
        :label="$t('directory')"
        color="dark"
        dense
        readonly
      ></q-input>
    </q-card-section>
    <q-card-section v-if="ui.card_1.createDatabaseToggle" class="q-gutter-sm">
      <div>Create DataBase</div>
      <q-input
        v-model="data.form.dataBaseForm.name"
        :label="$t('DB Name')"
        color="dark"
        dense
      ></q-input>
      <q-input
        v-model="data.form.dataBaseForm.username"
        :label="$t('DB User')"
        color="dark"
        dense
      ></q-input>
      <q-input
        v-model="data.form.dataBaseForm.password"
        :label="$t('DB Password')"
        color="dark"
        dense
      ></q-input>
    </q-card-section>
    <q-card-section v-if="ui.card_1.sslToggle">
      <div>{{ $t("Enable SSL") }}</div>
      <q-select
        v-model="ui.card_1.sslOption.model"
        :label="$t('Providers')"
        :options="ui.card_1.sslOption.options"
        color="dark"
        dense
      />
    </q-card-section>
    <q-card-section class="flex q-gutter-md justify-end">
      <q-toggle
        v-model="ui.card_1.createDatabaseToggle"
        :label="$t('Create DataBase')"
        color="dark"
        dense
        icon="storage"
      ></q-toggle>
      <q-toggle
        v-if="data.form.websiteForm.domain"
        v-model="ui.card_1.sslToggle"
        :label="$t('Enable SSL')"
        color="green"
        dense
        icon="security"
        @update:model-value="requestVerifyDomainRecords"
      ></q-toggle>
      <!--      <q-toggle v-model="ui.card_1.enableBackupToggle" color="blue-grey" icon="cloud"-->
      <!--                label="Enable Cloud Backup"></q-toggle>-->
      <!--      <q-toggle v-model="ui.card_1.enableBackupToggle" color="grey" icon="cloud_off"-->
      <!--                label="Enable Local Backup"></q-toggle>-->
    </q-card-section>
    <q-card-actions class="justify-between">
      <q-btn
        color="grey"
        icon="arrow_back"
        label="back"
        @click="ui.card -= 1"
      ></q-btn>
      <q-btn
        :label="$t('next')"
        color="blue"
        icon="done"
        @click="ui.card += 1"
      ></q-btn>
    </q-card-actions>
  </q-card>

  <q-card v-if="ui.card === 2" class="card shadow-0 bg-grey-1 q-pa-sm">
    <q-card-section class="flex justify-between">
      <div class="text-body1">
        {{ ui.application.name }}
      </div>
    </q-card-section>

    <q-card-section class="q-gutter-sm">
      <div v-for="item in ui.application.parameter" :key="item.name">
        <q-input
          v-model="data.form.websiteForm.application_config[item.name]"
          :hint="item.description.default"
          :label="item.label.default"
          color="dark"
        ></q-input>
      </div>
    </q-card-section>
    <q-card-section class="flex q-gutter-md justify-end">
      <!--
          <q-toggle v-model="data.form.sslToggle" label="Enable SSL"></q-toggle>
          <q-toggle v-model="data.form.sslToggle" label="Force SSL"></q-toggle>
      -->
    </q-card-section>
    <q-card-actions class="justify-between">
      <q-btn
        color="grey"
        icon="arrow_back"
        label="back"
        @click="ui.card -= 1"
      ></q-btn>
      <q-btn
        color="blue"
        icon="done"
        label="Commit"
        @click="commitFormData"
      ></q-btn>
    </q-card-actions>
  </q-card>
</template>

<script>
import { onMounted, onUnmounted, ref, toRaw, watchEffect } from "vue";
import {
  createWebsite,
  enableWebsiteSSL,
  listApplication,
  verifyDomainRecords,
} from "src/api/website";
import { userInfo } from "src/utils/struct";
import { generateDBPassword } from "src/utils/generate";
import { errorLoading, hideLoading, showLoading } from "src/utils/loading";
import { useQuasar } from "quasar";
import { createDataBaseInstance, createNewDatabase } from "src/api/database";
import { createApplicationInstance } from "src/api/application";

const _ui = {
  card: 0,
  application: {
    name: "StaticPages",
    key: "NginxApplication",
    parameter: [
      {
        attr: {},
        name: "name",
        label: { default: "title", "en-US": "title" },
        value: "new website!",
        required: true,
        description: {
          default: "your website title",
          "en-US": "your website title",
        },
      },
      {
        attr: {},
        name: "text",
        label: { default: "text", "en-US": "text" },
        required: true,
        value: "与君初相识，犹如故人归。嗨，别来无恙！ <br> Hello World！",
        description: {
          default: "what about do u you say?",
          "en-US": "what about do u you say?",
        },
      },
      {
        attr: {},
        name: "email",
        label: { default: "email", "en-US": "email" },
        value: null,
        required: false,
        description: {
          default: "your contact information",
          "en-US": "your contact information",
        },
      },
    ],
  },
  card_0: {
    loading: true,
    application: {
      checked: {},
      data: {},
      model: null,
      options: [],
    },
    description: "",
  },
  card_1: {
    sslToggle: false,
    createDatabaseToggle: false,
    enableBackupToggle: false,
    sslOption: {
      model: "Let's Encrypt",
      options: ["Let's Encrypt"],
    },
  },
};
const ui = ref(_ui);

const _data = {
  form: {
    websiteForm: {
      name: "",
      domain: "",
      ssl_enable: false,
      index_root: null,
      application: null,
      application_config: {},
    },
    dataBaseForm: {
      name: "",
      username: "",
      password: "",
    },
    domain: "",
    path: "",
  },
  applicationForm: {},
};

export default {
  name: "NewWebsite",
  setup(props, { emit }) {
    const $q = useQuasar();
    const data = ref(_data);

    const Public = {
      onSelectApplication(name) {
        console.log({ onSelectApplication: name });
        let app = ui.value.card_0.application;
        ui.value.card_0.description = app.data[name].info.description;
        ui.value.application.key = name;
        ui.value.application.name = app.data[name].info.name;
        ui.value.application.parameter = app.data[name].attr;
        data.value.form.websiteForm.application = name;
        for (let item of ui.value.application.parameter) {
          data.value.form.websiteForm.application_config[item.name] =
            item.value;
        }
      },

      requestListApplication() {
        let card = ui.value.card_0;
        card.loading = true;
        listApplication()
          .then((res) => {
            for (let _key in res) {
              let item = res[_key];
              console.log(item);
              card.application.options.push({
                label: item.info.name,
                value: _key,
              });
            }
            card.application.data = res;
          })
          .catch((err) => {
            errorLoading($q, err);
          })
          .finally(() => {
            card.loading = false;
          });
      },
    };
    onMounted(() => {
      console.log("init NewWebsite component");
      console.log(userInfo());
      ui.value = JSON.parse(JSON.stringify(_ui));
      data.value = JSON.parse(JSON.stringify(_data));

      Public.requestListApplication();
    });

    onUnmounted(() => {});
    let index_root = ref("");

    watchEffect(() => {
      let websiteForm = data.value.form.websiteForm;
      if (websiteForm.domain) {
        websiteForm.index_root = "/var/www/" + websiteForm.domain;
      } else {
        websiteForm.index_root = "";
      }

      websiteForm.ssl_enable = false;
      let databaseForm = data.value.form.dataBaseForm;

      databaseForm.name = "DB_" + websiteForm.name;
      databaseForm.username = generateDBPassword(12);
      databaseForm.password = generateDBPassword(12);
    });

    function requestVerifyDomainRecords(value, evt) {
      if (value) {
        showLoading($q);
        verifyDomainRecords(data.value.form.websiteForm.domain)
          .then((res) => {
            ui.value.card_1.sslToggle = res.result.result_text === "SUCCESS";
            if (!ui.value.card_1.sslToggle) {
              $q.dialog({
                title: "Enable SSL",
                message:
                  "The domain name does not resolve to the backend host.",
                color: "dark",
              });
            }
          })
          .finally(() => {
            hideLoading($q);
          });
      } else {
        ui.value.card_1.sslToggle = value;
      }
    }

    async function requestCreateDatabase(data) {
      let dbRes = await createNewDatabase(data);
      console.log({ dbRes: dbRes });
      await createDataBaseInstance(dbRes.id);
    }

    function commitFormData() {
      console.log(toRaw(data.value.form));
      showLoading($q);
      createWebsite(data.value.form.websiteForm)
        .then(async (res) => {
          console.log({ createWebsite: res });
          let websiteId = res.id;
          let database = toRaw(data.value.form.dataBaseForm);
          database["website"] = websiteId;
          if (ui.value.card_1.createDatabaseToggle) {
            await requestCreateDatabase(database);
          }

          res = await createApplicationInstance(websiteId);
          console.log({ createApplicationInstance: res });

          if (ui.value.card_1.sslToggle) {
            await enableWebsiteSSL(websiteId);
          }

          emit("on-success");
        })
        .catch((err) => {
          errorLoading($q, err);
        })
        .finally(() => {
          hideLoading($q);
        });
    }

    return {
      ui,
      data,
      Public,
      index_root,
      commitFormData,
      requestVerifyDomainRecords,
    };
  },
};
</script>

<style scoped>
.card {
  width: 98vw;
  max-width: 800px;
}
</style>
