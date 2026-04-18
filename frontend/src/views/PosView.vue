<template>
  <div class="pos-view mt-3">
    
    <div class="row d-print-none">
      
      <div class="col-md-8">
        <h2 class="mb-4">Terminal</h2>
        <div class="row g-3">
          <div v-if="products.length === 0" class="col-12 text-muted">
            No products available. Add some in the Catalogue first!
          </div>
          <div class="col-sm-6 col-lg-4" v-for="product in products" :key="product.id">
            <div class="card shadow-sm h-100 border-0 bg-white" :class="{ 'opacity-50': product.quantity === 0 }">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title text-truncate" :title="product.name">{{ product.name }}</h5>
                <p class="text-muted small mb-2">SKU: {{ product.sku }}</p>
                <h4 class="text-success mb-3">${{ product.price }}</h4>
                <div class="mt-auto">
                  <p class="small mb-1" :class="product.quantity > 0 ? 'text-secondary' : 'text-danger'">
                    Stock: {{ product.quantity }}
                  </p>
                  <button class="btn w-100" :class="product.quantity > 0 ? 'btn-primary' : 'btn-secondary'" @click="addToCart(product)" :disabled="product.quantity === 0">
                    {{ product.quantity > 0 ? 'Add to Cart' : 'Out of Stock' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow border-primary sticky-top" style="top: 20px;">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Current Order</h5>
          </div>
          <div class="card-body p-0">
            <ul class="list-group list-group-flush" style="max-height: 400px; overflow-y: auto;">
              <li v-if="cart.length === 0" class="list-group-item text-center py-4 text-muted">
                Cart is empty
              </li>
              <li v-for="(item, index) in cart" :key="index" class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="my-0">{{ item.name }}</h6>
                  <small class="text-muted">Qty: {{ item.quantity_bought }} x ${{ item.price }}</small>
                </div>
                <div class="text-end">
                  <div class="fw-bold">${{ (item.price * item.quantity_bought).toFixed(2) }}</div>
                  <button class="btn btn-sm btn-link text-danger p-0 border-0 text-decoration-none" @click="removeFromCart(index)">Remove</button>
                </div>
              </li>
            </ul>
          </div>
          <div class="card-footer bg-light">
            <div class="d-flex justify-content-between mb-3 fs-5">
              <strong>Total:</strong>
              <strong>${{ cartTotal.toFixed(2) }}</strong>
            </div>
            <button class="btn btn-success w-100 btn-lg" @click="processCheckout" :disabled="cart.length === 0">
              Complete Checkout
            </button>
          </div>
        </div>
      </div>

    </div> <div class="print-receipt d-none d-print-block" v-if="lastReceipt">
      <div class="text-center mb-4 border-bottom border-2 border-dark pb-3">
        <h2 class="fw-bold mb-0">🏪 Store AutoSys</h2>
        <p class="text-muted mb-0">123 Retail Avenue, Web City</p>
        <p class="mb-0 mt-2 fw-bold">Receipt #{{ lastReceipt.id }}</p>
        <small>{{ lastReceipt.date }}</small>
      </div>
      
      <table class="table table-sm border-bottom border-dark mb-3 w-100">
        <thead>
          <tr>
            <th class="text-start">Item</th>
            <th class="text-center">Qty</th>
            <th class="text-end">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in lastReceipt.items" :key="index">
            <td class="text-start">{{ item.name }}</td>
            <td class="text-center">{{ item.quantity_bought }}</td>
            <td class="text-end">${{ (item.price * item.quantity_bought).toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="d-flex justify-content-between fs-4 fw-bold mb-4">
        <span>TOTAL:</span>
        <span>${{ lastReceipt.total.toFixed(2) }}</span>
      </div>
      
      <div class="text-center mt-5">
        <p class="mb-1">Thank you for your purchase!</p>
        <p class="small text-muted">Returns accepted within 30 days with receipt.</p>
        <svg id="barcode" class="mt-2"></svg>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { api } from "@/api/client";

const products = ref([]);
const cart = ref([]);

// Calculate total dynamically
const cartTotal = computed(() => {
    return cart.value.reduce(
        (total, item) => total + item.price * item.quantity_bought,
        0,
    );
});

const loadProducts = async () => {
    try {
        products.value = await api.getProducts();
    } catch (error) {
        alert("Error loading products: " + error.message);
    }
};

const addToCart = (product) => {
    const existingItem = cart.value.find(
        (item) => item.product_id === product.id,
    );

    if (existingItem) {
        if (existingItem.quantity_bought < product.quantity) {
            existingItem.quantity_bought++;
        } else {
            alert(`Cannot add more. Only ${product.quantity} in stock.`);
        }
    } else {
        cart.value.push({
            product_id: product.id,
            name: product.name,
            price: product.price,
            quantity_bought: 1,
        });
    }
};

const removeFromCart = (index) => {
    cart.value.splice(index, 1);
};

const lastReceipt = ref(null)

const processCheckout = async () => {
  try {
    const payload = cart.value.map(item => ({
      product_id: item.product_id,
      quantity_bought: item.quantity_bought
    }))

    const response = await api.checkout(payload)
    
    lastReceipt.value = {
      id: response.transaction_id, 
      date: new Date().toLocaleString(),
      items: [...cart.value],
      total: cartTotal.value
    }
    
    cart.value = [] 
    await loadProducts() 
    
    setTimeout(() => {
      window.print()
    }, 150)

  } catch (error) {
    alert('Checkout failed: ' + error.message)
  }
}

onMounted(() => {
    loadProducts();
});
</script>

<style>
@media print {
  @page {
    margin: 0; 
  }
  
  body {
    background-color: white !important;
    color: black !important;
  }

  .print-receipt {
    width: 80mm; 
    margin: 0 auto;
    padding: 10mm 5mm;
    font-family: monospace;
  }
}
</style>