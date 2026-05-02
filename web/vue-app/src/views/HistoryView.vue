<template>
    <div class="history-view mt-3">
        <h2 class="mb-4">Sales History</h2>

        <div class="card shadow-sm">
            <div class="card-body p-0">
                <div
                    v-if="history.length === 0"
                    class="p-5 text-center text-muted"
                >
                    No transactions found. Make a sale in the Terminal first!
                </div>

                <div class="list-group list-group-flush">
                    <div
                        v-for="tx in history"
                        :key="tx.id"
                        class="list-group-item p-4"
                    >
                        <div
                            class="d-flex w-100 justify-content-between align-items-center mb-2"
                        >
                            <h5 class="mb-0 text-primary">
                                Receipt #{{ tx.id }}
                            </h5>
                            <span class="badge bg-light text-dark border">
                                {{ formatDate(tx.timestamp) }}
                            </span>
                        </div>

                        <p
                            class="mb-2 text-secondary font-monospace"
                            style="white-space: pre-line"
                        >
                            {{ tx.items_summary.split(", ").join("\n") }}
                        </p>

                        <h4 class="text-success mb-0">
                            ${{ tx.total_amount.toFixed(2) }}
                        </h4>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { api } from "@/api/client";

const history = ref([]);

const loadHistory = async () => {
    try {
        history.value = await api.getHistory();
    } catch (error) {
        alert("Error loading history: " + error.message);
    }
};

// Helper to make the database timestamp look nice
const formatDate = (dateString) => {
    const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
};

onMounted(() => {
    loadHistory();
});
</script>
