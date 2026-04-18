<template>
    <div>
        <nav
            v-if="$route.name !== 'login'"
            class="navbar navbar-expand-lg navbar-dark bg-dark mb-4"
        >
            <div class="container-fluid">
                <span class="navbar-brand border-end pe-3 me-3"
                    >🏪 Store AutoSys</span
                >
                <div class="navbar-nav me-auto">
                    <RouterLink class="nav-link" to="/">Terminal</RouterLink>
                    <RouterLink class="nav-link" to="/catalogue"
                        >Catalogue</RouterLink
                    >
                    <RouterLink class="nav-link" to="/history"
                        >History</RouterLink
                    >
                </div>
                <div class="d-flex">
                    <button
                        class="btn btn-outline-light btn-sm"
                        @click="logout"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </nav>

        <div class="container">
            <RouterView />
        </div>
    </div>
</template>

<script setup>
import { RouterLink, RouterView, useRouter } from "vue-router";

const router = useRouter();

const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
};
</script>
