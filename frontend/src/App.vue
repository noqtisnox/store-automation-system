<template>
    <div>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
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
            </div>
        </nav>

        <div class="container">
            <RouterView />
        </div>
    </div>
</template>

<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<style>
/* You can drop your Bootstrap CDN link in the main index.html file
   so you don't have to install the whole library locally */
</style>
