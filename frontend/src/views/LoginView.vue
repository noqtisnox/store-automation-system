<template>
    <div class="row justify-content-center mt-5 pt-5">
        <div class="col-md-5 col-lg-4">
            <div class="card shadow-lg border-primary">
                <div class="card-header bg-primary text-white text-center py-3">
                    <h4 class="mb-0">🏪 Store AutoSys</h4>
                </div>
                <div class="card-body p-4">
                    <h5 class="card-title text-center mb-4">Staff Login</h5>

                    <form @submit.prevent="handleLogin">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Username</label>
                            <input
                                type="text"
                                class="form-control"
                                v-model="username"
                                required
                                autofocus
                            />
                        </div>

                        <div class="mb-4">
                            <label class="form-label fw-bold">Password</label>
                            <input
                                type="password"
                                class="form-control"
                                v-model="password"
                                required
                            />
                        </div>

                        <div
                            v-if="errorMessage"
                            class="alert alert-danger py-2"
                        >
                            {{ errorMessage }}
                        </div>

                        <button
                            type="submit"
                            class="btn btn-success w-100 btn-lg"
                            :disabled="isLoading"
                        >
                            {{
                                isLoading ? "Authenticating..." : "Secure Login"
                            }}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const username = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const handleLogin = async () => {
    isLoading.value = true;
    errorMessage.value = "";

    try {
        // FastAPI OAuth2 requires form-encoded data, not JSON
        const formData = new URLSearchParams();
        formData.append("username", username.value);
        formData.append("password", password.value);

        const response = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
        });

        if (!response.ok) throw new Error("Invalid credentials");

        const data = await response.json();

        // Save the token and role to the browser's Local Storage
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("role", data.role);

        // Redirect to the Point of Sale terminal
        router.push("/");
    } catch (error) {
        errorMessage.value = "Incorrect username or password.";
    } finally {
        isLoading.value = false;
    }
};
</script>
