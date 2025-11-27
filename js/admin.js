// Global State
let currentPage = 1;
let totalPages = 1;
const API_BASE = API_BASE_URL + '/admin';

// Charts Instances
let trendChart = null;
let geoChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    loadLogs(1);
});

// --- 1. Load Stats & Charts ---
async function loadStats() {
    try {
        const res = await fetch(`${API_BASE}/stats`);
        const data = await res.json();

        // Update Cards
        document.getElementById('today-pv').innerText = data.today_pv;
        document.getElementById('today-uv').innerText = data.today_uv;
        document.getElementById('total-pv').innerText = data.total_pv;

        // Render Charts
        renderTrendChart(data.trend);
        renderGeoChart(data.geo);

    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

function renderTrendChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');
    const labels = data.map(item => item.date);
    const values = data.map(item => item.count);

    if (trendChart) trendChart.destroy();

    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '访问量',
                data: values,
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderGeoChart(data) {
    const ctx = document.getElementById('geoChart').getContext('2d');
    const labels = data.map(item => item.name || '未知');
    const values = data.map(item => item.value);

    if (geoChart) geoChart.destroy();

    geoChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#0d6efd', '#198754', '#ffc107', '#dc3545', '#6610f2', 
                    '#fd7e14', '#20c997', '#0dcaf0', '#adb5bd', '#6c757d'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// --- 2. Load Logs ---
async function loadLogs(page) {
    try {
        const res = await fetch(`${API_BASE}/logs?page=${page}&limit=20`);
        const data = await res.json();

        currentPage = data.page;
        totalPages = data.totalPages;

        updateLogTable(data.data);
        updatePagination();

    } catch (error) {
        console.error('Failed to load logs:', error);
    }
}

function updateLogTable(logs) {
    const tbody = document.getElementById('logs-body');
    tbody.innerHTML = '';

    if (logs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无数据</td></tr>';
        return;
    }

    logs.forEach(log => {
        const date = new Date(log.visit_time).toLocaleString();
        const shortUa = log.user_agent && log.user_agent.length > 50 
            ? log.user_agent.substring(0, 50) + '...' 
            : (log.user_agent || '-');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-3">${log.id}</td>
            <td><span class="badge bg-light text-dark border">${log.ip_address}</span></td>
            <td>${log.ip_source || '-'}</td>
            <td><code>${log.path}</code></td>
            <td><small>${date}</small></td>
            <td title="${log.user_agent}"><small class="text-muted">${shortUa}</small></td>
        `;
        tbody.appendChild(tr);
    });
}

function updatePagination() {
    document.getElementById('page-info').innerText = `第 ${currentPage} 页 / 共 ${totalPages} 页`;
}

function prevPage() {
    if (currentPage > 1) {
        loadLogs(currentPage - 1);
    }
}

function nextPage() {
    if (currentPage < totalPages) {
        loadLogs(currentPage + 1);
    }
}
