<template>
    <div class="catalogue-view">
        <div
            class="d-flex justify-content-between align-items-center mb-4 mt-3"
        >
            <h2>Inventory Catalogue</h2>
            <button
                class="btn"
                :class="showForm ? 'btn-secondary' : 'btn-primary'"
                @click="showForm = !showForm"
            >
                {{ showForm ? "Cancel" : "+ Add New Product" }}
            </button>
        </div>

        <div class="card mb-4 shadow-sm border-primary" v-if="showForm">
            <div class="card-body">
                <h5 class="card-title text-primary mb-3">Create Product</h5>
                <form @submit.prevent="submitProduct" class="row g-3">
                    <div class="col-md-3">
                        <label class="form-label fw-bold">Name</label>
                        <input
                            type="text"
                            class="form-control"
                            v-model="newProduct.name"
                            placeholder="e.g. Wooden Horse"
                            required
                        />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold">SKU (Артикул)</label>
                        <input
                            type="text"
                            class="form-control"
                            v-model="newProduct.sku"
                            placeholder="e.g. WH-100"
                            required
                        />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold">Price ($)</label>
                        <input
                            type="number"
                            step="0.01"
                            class="form-control"
                            v-model="newProduct.price"
                            required
                        />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-bold">Initial Stock</label>
                        <input
                            type="number"
                            class="form-control"
                            v-model="newProduct.quantity"
                            required
                        />
                    </div>
                    <div class="col-12 mt-4">
                        <button type="submit" class="btn btn-success px-4">
                            Save to Database
                        </button>
                    </div>
                </form>
            </div>
        </div>

        <div class="card shadow-sm">
            <div class="card-body p-0">
                <table class="table table-striped table-hover mb-0">
                    <thead class="table-dark">
                        <tr>
                            <th class="ps-3">SKU</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock Level</th>
                            <th class="text-end pe-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="products.length === 0">
                            <td colspan="5" class="text-center py-5 text-muted">
                                No products found in the database. Add one
                                above!
                            </td>
                        </tr>
                        <tr
                            v-for="product in products"
                            :key="product.id"
                            class="align-middle"
                        >
                            <td class="ps-3 fw-bold font-monospace">
                                {{ product.sku }}
                            </td>
                            <td>{{ product.name }}</td>
                            <td>${{ product.price }}</td>
                            <td>
                                <span
                                    class="badge"
                                    :class="
                                        product.quantity > 5
                                            ? 'bg-success'
                                            : 'bg-danger'
                                    "
                                >
                                    {{ product.quantity }} in stock
                                </span>
                            </td>
                            <td class="text-end pe-3">
                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    @click="removeProduct(product.id)"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "@/api/client";

// --- State ---
const products = ref([]);
const showForm = ref(false);

// Template for a new product
const newProduct = ref({
    name: "",
    sku: "",
    price: 0,
    quantity: 0,
});

// --- Methods ---
const loadProducts = async () => {
    try {
        products.value = await api.getProducts();
    } catch (error) {
        alert("Error loading catalogue: " + error.message);
    }
};

const submitProduct = async () => {
    try {
        // 1. Send to FastAPI
        await api.createProduct(newProduct.value);

        // 2. Reload the table with the new data
        await loadProducts();

        // 3. Reset the UI
        showForm.value = false;
        newProduct.value = { name: "", sku: "", price: 0, quantity: 0 };
    } catch (error) {
        alert("Could not save product: " + error.message);
    }
};

const removeProduct = async (id) => {
    if (!confirm("Are you sure? This will delete the item permanently."))
        return;

    try {
        await api.deleteProduct(id);
        await loadProducts(); // Refresh the list
    } catch (error) {
        alert("Error deleting product: " + error.message);
    }
};

// --- Lifecycle ---
// Run this the moment the page loads
onMounted(() => {
    loadProducts();
});
</script>
