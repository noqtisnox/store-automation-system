<template>
  <div class="dashboard-view mt-4">
    <h2 class="mb-4">Store Analytics</h2>
    
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card shadow-sm border-success bg-success text-white h-100">
          <div class="card-body">
            <h5 class="card-title">Total Revenue</h5>
            <h2 class="display-4">${{ totalRevenue.toFixed(2) }}</h2>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card shadow-sm border-primary bg-primary text-white h-100">
          <div class="card-body">
            <h5 class="card-title">Total Transactions</h5>
            <h2 class="display-4">{{ totalTransactions }}</h2>
          </div>
        </div>
      </div>
    </div>

    <div class="card shadow-sm">
      <div class="card-body">
        <h5 class="card-title mb-4">Revenue Over Time</h5>
        <div style="height: 300px;" v-if="chartData.labels.length > 0">
          <Line :data="chartData" :options="chartOptions" />
        </div>
        <div v-else class="text-center text-muted py-5">
          Loading chart data...
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/api/client'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'vue-chartjs'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const history = ref([])
const totalRevenue = ref(0)
const totalTransactions = ref(0)

const chartData = ref({ labels: [], datasets: [] })
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } }
}

const loadAnalytics = async () => {
  try {
    const data = await api.getHistory()
    history.value = data
    
    totalTransactions.value = data.length
    totalRevenue.value = data.reduce((sum, tx) => sum + tx.total_amount, 0)

    const revenueByDate = {}
    
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

    sortedData.forEach(tx => {
      const dateString = new Date(tx.timestamp).toLocaleDateString()
      if (!revenueByDate[dateString]) revenueByDate[dateString] = 0
      revenueByDate[dateString] += tx.total_amount
    })

    chartData.value = {
      labels: Object.keys(revenueByDate),
      datasets: [
        {
          label: 'Daily Revenue ($)',
          backgroundColor: '#198754',
          borderColor: '#198754',
          borderWidth: 3,
          data: Object.values(revenueByDate),
          tension: 0.3
        }
      ]
    }

  } catch (error) {
    console.error('Error loading analytics:', error)
  }
}

onMounted(() => {
  loadAnalytics()
})
</script>