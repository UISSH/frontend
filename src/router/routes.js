const routes = [
  {
    path: "/",
    name: "login",
    component: () => import("pages/SinglePage/LoginPage.vue"),
  },

  {
    path: "/d",
    component: () => import("layouts/DebugLayout.vue"),
    children: [{name: 'DemoPage', path: "", component: () => import("pages/DemoPage.vue")}],
  },
  {
    path: "/dev",
    component: () => import("pages/SinglePage/DevelopPage.vue"),
  },
  {
    path: "/Main",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        name: "MainIndex",
        component: () => import("pages/IndexPage.vue"),
      },
      {
        path: "website",
        name: "website",
        component: () => import("pages/WebsitePage/WebsiteIndex.vue"),
      },
      {
        path: "websiteSettings/:id",
        name: "websiteSettings",
        component: () => import("pages/WebsitePage/WebsiteSettings.vue"),
      },
      {
        path: "overview",
        name: "overview",
        component: () => import("pages/OverviewPage/OverviewIndex.vue"),
      },
      {
        path: "database",
        name: "database",
        component: () => import("pages/DatabasePage/DatabaseIndex.vue"),
      },
      {
        path: "databaseSettings/:id",
        name: "databaseSettings",
        component: () => import("pages/DatabasePage/DatabaseSettings.vue"),
      },
      {
        path: "fileBrowser/:directory",
        name: "fileBrowser",
        component: () => import("pages/FileBrowserPage/FileBrowser.vue"),
      },

      {
        path: "terminal",
        name: "terminal",
        component: () => import("pages/TerminalPage/TerminalIndex.vue"),
      },
      {
        path: "plainTextEditing/:path",
        name: "plainTextEditing",
        component: () => import("pages/CommonPage/PlainTextEditing.vue"),
      },
      {
        path: "ftpServer",
        name: "ftpServer",
        component: () => import("pages/FTPServerPage/FTPServerIndex.vue"),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
