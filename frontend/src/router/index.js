import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginView.vue"),
    },
    { path: "/", name: "pos", component: () => import("@/views/PosView.vue") },
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

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem("token");

  if (to.name !== "login" && !isAuthenticated) {
    next({ name: "login" });
  } else if (to.name === "login" && isAuthenticated) {
    next({ name: "pos" });
  } else {
    next();
  }
});

export default router;
