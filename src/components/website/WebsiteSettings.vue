<template>
  <q-card v-if="data.website" class="shadow-0 q-pa-none">
    <q-tabs
      v-model="tab"
      align="justify"
      class="bg-blue-grey-2"
      dense
      indicator-color="blue"
      inline-label
      mobile-arrows
      narrow-indicator
      outside-arrows
    >
      <q-btn
        color="blue-grey-2"
        flat
        icon="arrow_back"
        text-color="dark"
        @click="$router.back()"
      ></q-btn>
      <q-tab label="Basic" name="basic" />
      <q-tab label="Config" name="config" />
      <q-tab label="Ssl" name="ssl" />
      <!--          <q-tab  label="application" name="application"/>-->
    </q-tabs>
    <q-separator />
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel class="q-gutter-md bg-grey-2" name="basic">
        <div class="bg-white q-pa-md rounded-borders">
          <div class="text-body1 text-capitalize">name</div>
          <div class="q-gutter-sm">
            <q-input
              v-model="data.website.name"
              color="dark"
              dense
              label="name"
            ></q-input>
            <q-input
              v-model="data.website.web_server_type_text"
              color="dark"
              dense
              label="web server"
              readonly
            ></q-input>
          </div>
        </div>

        <div class="bg-white q-pa-md rounded-borders">
          <div class="text-body1 text-capitalize">domain settings</div>
          <div class="q-gutter-md text-right">
            <q-input
              v-model="data.website.domain"
              color="dark"
              dense
              label="domain"
            ></q-input>
            <q-input
              v-model="data.website.extra_domain"
              color="dark"
              dense
              hint="If you modify this, re-enable the SSL configuration to apply for the certificate."
              label="extra domain"
              outlined
              type="textarea"
            ></q-input>
            <q-btn
              icon="done"
              flat
              color="primary"
              @click="requestUpdateWebsiteDomain"
            ></q-btn>
          </div>
        </div>

        <div class="bg-white q-pa-md rounded-borders">
          <div class="text-body1 text-capitalize">path</div>
          <div class="q-gutter-sm">
            <q-input
              v-model="data.website.index_root"
              color="dark"
              dense
              label="folder"
              readonly
            >
              <template v-slot:append>
                <q-btn
                  :to="{
                    name: 'fileBrowser',
                    params: { directory: data.website.index_root },
                  }"
                  icon="o_open_in_new"
                  flat
                ></q-btn>
              </template>
            </q-input>
          </div>
        </div>
      </q-tab-panel>
      <q-tab-panel class="shadow-0 q-pa-none" name="config">
        <web-server-config
          :data="data.website.valid_web_server_config"
          :pk="data.website.id"
        ></web-server-config>
      </q-tab-panel>
      <q-tab-panel name="ssl">
        <div v-if="data.website.ssl_enable">
          <div v-if="data.certificate" class="q-gutter-sm">
            <q-banner class="bg-blue-grey-1 text-center" dense rounded
              ><span class="text-body1 text-dark text-capitalize">issuer</span>
            </q-banner>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                common name
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{ data.certificate.issuer_common_name }}
              </div>
            </div>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                country name
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{ data.certificate.issuer_country_name }}
              </div>
            </div>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                organization name
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{ data.certificate.issuer_organization_name }}
              </div>
            </div>
            <q-banner class="bg-blue-grey-1 text-center" dense rounded
              ><span class="text-body1 text-dark text-capitalize">issued</span>
            </q-banner>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                common name
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{ data.certificate.issued_common_name }}
              </div>
            </div>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                subject alt name
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{ data.certificate.subject_alt_name }}
              </div>
            </div>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                signature algorithm
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{ data.certificate.signature_algorithm }}
              </div>
            </div>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                serial number hex
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{ data.certificate.serial_number_hex }}
              </div>
            </div>

            <q-banner class="bg-blue-grey-1 text-center" dense rounded
              ><span class="text-body1 text-dark text-capitalize">date</span>
            </q-banner>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                not before
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{
                  date.formatDate(
                    data.certificate.not_before,
                    "YYYY-MM-DD HH:mm:ss (Z)"
                  )
                }}
              </div>
            </div>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                not after
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{
                  date.formatDate(
                    data.certificate.not_after,
                    "YYYY-MM-DD HH:mm:ss (Z)"
                  )
                }}
              </div>
            </div>
            <div class="flex no-wrap rounded-borders items-baseline">
              <div
                class="q-pa-sm bg-blue-grey-1 text-dark text-body1 text-capitalize"
                style="min-width: 180px"
              >
                expiration notice
              </div>
              <div
                class="q-pa-sm q-pl-lg bg-grey-1 text-center"
                style="min-width: 120px"
              >
                {{ data.website.ssl_config.certbot.email }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex flex-center">
          <h4>SSL has not been enabled.</h4>
        </div>
      </q-tab-panel>
      <q-tab-panel name="application">
        <div class="text-h6">Movies</div>
        Lorem ipsum dolor sit amet consectetur adipisicing elit.
      </q-tab-panel>
    </q-tab-panels>
  </q-card>

  <q-card v-else>
    <q-card-section> Loading ... </q-card-section>
  </q-card>
</template>

<script>
import { onMounted, ref } from "vue";
import WebServerConfig from "components/website/WebServerConfig";
import {
  getWebsite,
  getWebsiteCertificate,
  patchWebsite,
  updateWebDomainConfig,
} from "src/api/website";
import { errorLoading, hideLoading, showLoading } from "src/utils/loading";
import { date, useQuasar } from "quasar";

export default {
  name: "WebsiteSettings",
  components: { WebServerConfig },
  props: {
    website_id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const $q = useQuasar();
    const data = ref({
      website: null,
      certificate: null,
    });

    onMounted(() => {
      requestWebsite();
    });

    function requestUpdateWebsiteDomain() {
      showLoading($q);
      updateWebDomainConfig(props.website_id, {
        domain: data.value.website.domain,
        extra_domain: data.value.website.extra_domain,
      })
        .then((res) => {
          requestWebsite();
        })
        .catch((err) => {
          errorLoading($q, err);
        })
        .finally(() => {
          hideLoading($q);
        });
    }

    function requestWebsite() {
      showLoading($q);
      getWebsite(props.website_id)
        .then(async (res) => {
          data.value.website = res;
          res = await getWebsiteCertificate(res.id);
          data.value.certificate = res;
        })
        .catch((err) => {
          errorLoading($q, err);
        })
        .finally(() => {
          hideLoading($q);
        });
    }

    return {
      tab: ref("basic"),
      data,
      date,
      requestUpdateWebsiteDomain,
    };
  },
};
</script>

<style scoped></style>
