import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "pos",
      // We use component lazy-loading so the app loads faster
      component: () => import("@/views/PosView.vue"),
    },
    {
      path: "/catalogue",
      name: "catalogue",
      component: () => import("@/views/CatalogueView.vue"),
    },
    {
      path: "/history",
      name: "history",
      component: () => import("@/views/HistoryView.vue"),
    },
  ],
});

export default router;
