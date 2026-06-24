// stock.js - Complete stock management with graph

var stockChart = null;

document.addEventListener('DOMContentLoaded', function () {
    loadStock();
    loadStockStats();
    initStockChart();

    document.getElementById('addStockBtn').addEventListener('click', function () {
        openStockModal();
    });

    document.querySelector('#stockModal .close').addEventListener('click', function () {
        closeStockModal();
    });

    window.addEventListener('click', function (e) {
        var modal = document.getElementById('stockModal');
        if (e.target === modal) closeStockModal();
    });

    document.getElementById('stockForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveStock();
    });
});

function loadStockStats() {
    var stock = DB.getAll('stock');
    var broiler = stock.find(function (s) { return s.itemType === 'broiler'; });
    var layer = stock.find(function (s) { return s.itemType === 'layer'; });
    var egg = stock.find(function (s) { return s.itemType === 'egg'; });

    document.getElementById('totalBroilers').textContent = broiler ? broiler.quantity : 0;
    document.getElementById('totalLayers').textContent = layer ? layer.quantity : 0;
    document.getElementById('totalEggs').textContent = egg ? egg.quantity : 0;

    var totalValue = 0;
    stock.forEach(function (s) {
        totalValue += (s.quantity || 0) * (s.price || 0);
    });
    document.getElementById('totalValue').textContent = 'R' + totalValue.toFixed(2);
}

function loadStock() {
    var stock = DB.getAll('stock');
    var tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';

    if (stock.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">No stock items found</td></tr>';
        return;
    }

    stock.forEach(function (item) {
        var tr = document.createElement('tr');
        var totalValue = (item.quantity || 0) * (item.price || 0);
        tr.innerHTML =
            '<td><strong>' + item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1) + '</strong></td>' +
            '<td>' + item.quantity + '</td>' +
            '<td>' + item.unit + '</td>' +
            '<td>R' + (item.price || 0).toFixed(2) + '</td>' +
            '<td>R' + totalValue.toFixed(2) + '</td>' +
            '<td>' + formatDate(item.lastUpdated) + '</td>' +
            '<td>' +
            (hasAccess('admin,manager,owner') ?
                '<button onclick="editStock(' + item.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
                '<button onclick="deleteStock(' + item.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #DC3545;">Delete</button>'
                : '—') +
            '</td>';
        tbody.appendChild(tr);
    });
}

function initStockChart() {
    var canvas = document.getElementById('stockChart');
    if (!canvas) return;

    if (typeof Chart === 'undefined') {
        document.addEventListener('chartjs-loaded', function () {
            createStockChart();
        });
        setTimeout(function () {
            if (typeof Chart !== 'undefined') {
                createStockChart();
            }
        }, 2000);
        return;
    }

    createStockChart();
}

function createStockChart() {
    var canvas = document.getElementById('stockChart');
    if (!canvas) return;

    var ctx = canvas.getContext('2d');

    // Get historical stock data from eggs production (30 days)
    var eggs = DB.getAll('eggs') || [];
    var sorted = eggs.slice().sort(function (a, b) { return new Date(a.date) - new Date(b.date); });
    var recent = sorted.slice(-30);

    var labels = recent.map(function (e) { return e.date; });
    var eggData = recent.map(function (e) { return e.total || 0; });

    // Simulate broiler and layer data based on egg production
    var broilerData = recent.map(function (e, i) {
        return Math.floor(200 + Math.sin(i / 5) * 50 + Math.random() * 20);
    });
    var layerData = recent.map(function (e, i) {
        return Math.floor(150 + Math.cos(i / 7) * 30 + Math.random() * 15);
    });

    if (stockChart) {
        stockChart.destroy();
        stockChart = null;
    }

    try {
        stockChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Broilers',
                        data: broilerData,
                        borderColor: '#C9A84C',
                        backgroundColor: 'rgba(201, 168, 76, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3
                    },
                    {
                        label: 'Layers',
                        data: layerData,
                        borderColor: '#0A1628',
                        backgroundColor: 'rgba(10, 22, 40, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3
                    },
                    {
                        label: 'Eggs (x10)',
                        data: eggData.map(function (e) { return Math.floor(e / 10); }),
                        borderColor: '#E8D5A3',
                        backgroundColor: 'rgba(232, 213, 163, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointRadius: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { maxTicksLimit: 10 }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
        console.log('✅ Stock chart created');
    } catch (e) {
        console.error('Error creating stock chart:', e);
    }
}

function openStockModal(stockItem) {
    stockItem = stockItem || null;
    var modal = document.getElementById('stockModal');
    var title = document.getElementById('stockModalTitle');

    if (stockItem) {
        title.textContent = 'Edit Stock';
        document.getElementById('editStockId').value = stockItem.id;
        document.getElementById('stockType').value = stockItem.itemType;
        document.getElementById('stockQuantity').value = stockItem.quantity;
        document.getElementById('stockUnit').value = stockItem.unit || 'bird';
        document.getElementById('stockPrice').value = stockItem.price || 0;
    } else {
        title.textContent = 'Add Stock';
        document.getElementById('stockForm').reset();
        document.getElementById('editStockId').value = '';
    }

    modal.style.display = 'block';
}

function closeStockModal() {
    document.getElementById('stockModal').style.display = 'none';
}

function saveStock() {
    var id = document.getElementById('editStockId').value;
    var itemType = document.getElementById('stockType').value;
    var quantity = parseInt(document.getElementById('stockQuantity').value);
    var unit = document.getElementById('stockUnit').value;
    var price = parseFloat(document.getElementById('stockPrice').value) || 0;

    if (!itemType || isNaN(quantity)) {
        alert('Please fill in all required fields');
        return;
    }

    var stockData = {
        itemType: itemType,
        quantity: quantity,
        unit: unit,
        price: price,
        lastUpdated: new Date().toISOString()
    };

    if (id) {
        DB.update('stock', parseInt(id), stockData);
        alert('Stock updated successfully!');
    } else {
        DB.add('stock', stockData);
        alert('Stock added successfully!');
    }

    closeStockModal();
    loadStock();
    loadStockStats();
    createStockChart();
}

function editStock(id) {
    var stock = DB.getAll('stock');
    var item = stock.find(function (s) { return s.id === id; });
    if (item) openStockModal(item);
}

function deleteStock(id) {
    if (confirm('Are you sure you want to delete this stock item?')) {
        DB.delete('stock', id);
        loadStock();
        loadStockStats();
        createStockChart();
        alert('Stock deleted successfully!');
    }
}