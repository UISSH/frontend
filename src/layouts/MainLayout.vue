<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-blue-grey" elevated>
      <q-toolbar>
        <q-btn
          aria-label="Menu"
          dense
          flat
          icon="menu"
          round
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <q-btn flat icon="arrow_back" @click="$router.back()"></q-btn>
        </q-toolbar-title>

        <q-btn
          class="text-caption"
          flat
          href="https://github.com/UISSH/"
          no-caps
          dense
          target="_blank"
          type="a"
          >alpha v{{ pkJson.version }}
        </q-btn>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      :width="256"
      class="bg-grey-2"
      show-if-above
    >
      <q-list>
        <q-item-label header> Keep simple </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>
    </q-drawer>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, ref } from "vue";
import EssentialLink from "components/EssentialLink.vue";
import pkJson from "../../package.json";

const linksList = [
  {
    title: "Overview",
    caption: "summary",
    route: {
      name: "overview",
    },
    icon: "scatter_plot",
  },
  // {
  //   title: 'DNS',
  //   caption: 'DNS management',
  //   icon: 'dns',
  //
  // },
  {
    title: "Website",
    caption: "Website",
    route: {
      name: "website",
    },
    icon: "web",
  },
  {
    title: "Database",
    caption: "database",
    route: {
      name: "database",
    },
    icon: "sym_o_database",
  },
  {
    title: "Files",
    caption: "FileBrowser",
    icon: "donut_small",
    route: {
      name: "fileBrowser",
      params: {
        directory: "/",
      },
    },
  },
  {
    title: "Terminal",
    caption: "Terminal",
    icon: "o_terminal",
    route: {
      name: "terminal",
      params: {
        directory: "/",
      },
    },
  },
  // {
  //   title: 'Backup',
  //   caption: 'DNS management',
  //   icon: 'cloud',
  // },
  // {
  //   title: 'Settings',
  //   caption: 'DNS management',
  //   icon: 'settings',
  // },
];

export default defineComponent({
  name: "MainLayout",

  components: {
    EssentialLink,
  },

  setup() {
    const leftDrawerOpen = ref(false);

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
      pkJson,
    };
  },
});
</script>
