// ============================================================
// SALES.JS - COMPLETE FIXED FILE
// ============================================================

// ============================================================
// STATE
// ============================================================

let allSales = [];
let currentPage = 1;
const itemsPerPage = 10;

// ============================================================
// API CONFIGURATION
// ============================================================

const API_BASE = '/api';

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('Sales page loading...');
    
    // Set current date
    const now = new Date();
    const dateDisplay = document.getElementById('currentDate');
    if (dateDisplay) {
        dateDisplay.textContent = now.toLocaleDateString('en-ZA', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    // Set default dates
    const today = now.toISOString().split('T')[0];
    const saleDate = document.getElementById('saleDate');
    const chickenSaleDate = document.getElementById('chickenSaleDate');
    if (saleDate) saleDate.value = today;
    if (chickenSaleDate) chickenSaleDate.value = today;

    // Load sales
    loadSales();

    // Set up form listeners
    setupForms();
});

// ============================================================
// LOAD SALES FROM API
// ============================================================

async function loadSales() {
    console.log('Loading sales from API...');
    
    try {
        // Fetch sales
        const response = await fetch(API_BASE + '/sales');
        if (!response.ok) {
            throw new Error('HTTP ' + response.status);
        }
        allSales = await response.json();
        console.log('Loaded ' + allSales.length + ' sales');
        renderAll();
        
    } catch (error) {
        console.error('Failed to load sales:', error);
        // Try localStorage
        const cached = localStorage.getItem('whitestone_sales');
        if (cached) {
            try {
                allSales = JSON.parse(cached);
                console.log('Using cached data');
                renderAll();
            } catch (e) {
                allSales = [];
                renderAll();
            }
        } else {
            allSales = [];
            renderAll();
        }
    }
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================

function renderAll() {
    renderStats();
    renderHistory();
    saveToCache();
}

function renderStats() {
    let totalEggs = 0;
    let totalChickens = 0;
    let totalRevenue = 0;
    let monthlyRevenue = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    allSales.forEach(function(sale) {
        const qty = parseInt(sale.quantity) || 0;
        const amount = parseFloat(sale.amount) || 0;
        
        if (sale.type === 'egg') {
            totalEggs += qty;
        } else if (sale.type === 'chicken') {
            totalChickens += qty;
        }
        totalRevenue += amount;

        try {
            const saleDate = new Date(sale.date);
            if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
                monthlyRevenue += amount;
            }
        } catch (e) {}
    });

    // Update UI
    const eggEl = document.getElementById('totalEggSales');
    const chickenEl = document.getElementById('totalChickenSales');
    const revenueEl = document.getElementById('totalRevenue');
    const monthEl = document.getElementById('monthlyRevenue');
    const countEl = document.getElementById('totalSalesCount');

    if (eggEl) eggEl.textContent = totalEggs.toLocaleString();
    if (chickenEl) chickenEl.textContent = totalChickens.toLocaleString();
    if (revenueEl) revenueEl.textContent = 'R' + totalRevenue.toFixed(2);
    if (monthEl) monthEl.textContent = 'R' + monthlyRevenue.toFixed(2);
    if (countEl) countEl.textContent = allSales.length;
}

function renderHistory() {
    const container = document.getElementById('allSalesContainer');
    if (!container) return;

    // Sort by date (newest first)
    const sorted = allSales.slice().sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    if (sorted.length === 0) {
        container.innerHTML = 
            '<div class="empty-state">' +
                '<span class="empty-icon">📊</span>' +
                '<p>No sales recorded yet</p>' +
                '<span class="empty-sub">Start selling eggs or chickens</span>' +
            '</div>';
        return;
    }

    // Build HTML
    let html = '';
    sorted.forEach(function(sale) {
        try {
            const date = new Date(sale.date);
            const formattedDate = date.toLocaleDateString('en-ZA', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const typeEmoji = sale.type === 'egg' ? '🥚' : '🐔';
            const typeLabel = sale.type === 'egg' ? 'Egg Sale' : 'Chicken Sale';
            const unitLabel = sale.type === 'egg' ? 'eggs' : 'chickens';
            const qty = parseInt(sale.quantity) || 0;
            const amount = parseFloat(sale.amount) || 0;
            const status = sale.status || 'completed';
            const customer = sale.customer || 'Unknown';
            const description = sale.description || '';

            html += 
                '<div class="history-item" data-id="' + sale.id + '">' +
                    '<div class="history-item-header">' +
                        '<span class="history-type">' + typeEmoji + ' ' + typeLabel + '</span>' +
                        '<span class="history-date">📅 ' + formattedDate + '</span>' +
                        '<span class="history-status ' + status + '">' + status + '</span>' +
                        '<button class="history-delete" onclick="deleteSale(\'' + sale.id + '\')" title="Delete sale">🗑️</button>' +
                    '</div>' +
                    '<div class="history-item-body">' +
                        '<span class="history-customer"><strong>' + customer + '</strong></span>' +
                        (description ? '<span class="history-description">' + description + '</span>' : '') +
                        '<span class="history-quantity">' + qty.toLocaleString() + ' ' + unitLabel + '</span>' +
                        '<span class="history-amount">R' + amount.toFixed(2) + '</span>' +
                    '</div>' +
                '</div>';
        } catch (e) {
            console.warn('Error rendering sale:', e);
        }
    });

    container.innerHTML = html;
}

function saveToCache() {
    try {
        localStorage.setItem('whitestone_sales', JSON.stringify(allSales));
    } catch (e) {}
}

// ============================================================
// DELETE SALE
// ============================================================

function deleteSale(saleId) {
    if (!confirm('Are you sure you want to delete this sale?')) return;
    
    allSales = allSales.filter(function(s) { return s.id !== saleId; });
    
    // Try to delete from API
    fetch(API_BASE + '/sales/' + saleId, {
        method: 'DELETE'
    }).catch(function(e) {
        console.warn('API delete failed:', e);
    });
    
    renderAll();
    showToast('🗑️ Sale deleted successfully', 'success');
}

// ============================================================
// SHOW TOAST
// ============================================================

function showToast(message, type) {
    type = type || 'success';
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification ' + type;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(function() {
        toast.classList.add('show');
    }, 10);

    setTimeout(function() {
        toast.classList.remove('show');
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}

// ============================================================
// FORM SETUP
// ============================================================

function setupForms() {
    // Egg sale form
    const eggForm = document.getElementById('eggSalesForm');
    if (eggForm) {
        eggForm.addEventListener('submit', handleEggSale);
    }

    // Chicken sale form
    const chickenForm = document.getElementById('chickenSalesForm');
    if (chickenForm) {
        chickenForm.addEventListener('submit', handleChickenSale);
    }

    // Live summary updates
    const crates = document.getElementById('crates');
    const pieces = document.getElementById('pieces');
    const pricePerCrate = document.getElementById('pricePerCrate');
    if (crates) crates.addEventListener('input', updateEggSummary);
    if (pieces) pieces.addEventListener('input', updateEggSummary);
    if (pricePerCrate) pricePerCrate.addEventListener('input', updateEggSummary);

    const chickenQty = document.getElementById('chickenQuantity');
    const chickenPrice = document.getElementById('chickenPrice');
    if (chickenQty) chickenQty.addEventListener('input', updateChickenSummary);
    if (chickenPrice) chickenPrice.addEventListener('input', updateChickenSummary);
}

// ============================================================
// HANDLE EGG SALE
// ============================================================

function handleEggSale(e) {
    e.preventDefault();

    const buyerName = document.getElementById('buyerName').value.trim();
    const saleDate = document.getElementById('saleDate').value;
    const eggSize = document.getElementById('eggSize').value;
    const crates = parseInt(document.getElementById('crates').value) || 0;
    const pieces = parseInt(document.getElementById('pieces').value) || 0;
    const pricePerCrate = parseFloat(document.getElementById('pricePerCrate').value) || 0;
    const notes = document.getElementById('saleNotes').value.trim();

    if (!buyerName) {
        showToast('Please enter a buyer name', 'error');
        return;
    }
    if (crates <= 0) {
        showToast('Please enter a valid number of crates', 'error');
        return;
    }
    if (pricePerCrate <= 0) {
        showToast('Please enter a valid price per crate', 'error');
        return;
    }

    const totalEggs = (crates * 30) + pieces;
    const totalAmount = crates * pricePerCrate;

    const saleData = {
        type: 'egg',
        customer: buyerName,
        date: saleDate || new Date().toISOString().split('T')[0],
        description: eggSize + ' eggs' + (notes ? ' - ' + notes : ''),
        quantity: totalEggs,
        amount: totalAmount,
        status: 'completed'
    };

    // Save to API
    fetch(API_BASE + '/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
    })
    .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
    })
    .then(function(newSale) {
        allSales.unshift(newSale);
        renderAll();
        e.target.reset();
        document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('crates').value = 1;
        document.getElementById('pieces').value = 0;
        showToast('✅ Egg sale recorded for ' + buyerName + ' - R' + totalAmount.toFixed(2), 'success');
    })
    .catch(function(error) {
        console.error('Failed to record egg sale:', error);
        showToast('❌ Failed to record egg sale', 'error');
    });
}

// ============================================================
// HANDLE CHICKEN SALE
// ============================================================

function handleChickenSale(e) {
    e.preventDefault();

    const buyerName = document.getElementById('chickenBuyer').value.trim();
    const saleDate = document.getElementById('chickenSaleDate').value;
    const chickenType = document.getElementById('chickenType').value;
    const quantity = parseInt(document.getElementById('chickenQuantity').value) || 0;
    const pricePerChicken = parseFloat(document.getElementById('chickenPrice').value) || 0;
    const status = document.getElementById('chickenStatus').value;
    const notes = document.getElementById('chickenNotes').value.trim();

    if (!buyerName) {
        showToast('Please enter a buyer name', 'error');
        return;
    }
    if (quantity <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }
    if (pricePerChicken <= 0) {
        showToast('Please enter a valid price per chicken', 'error');
        return;
    }

    const totalAmount = quantity * pricePerChicken;

    const saleData = {
        type: 'chicken',
        customer: buyerName,
        date: saleDate || new Date().toISOString().split('T')[0],
        description: chickenType + ' - ' + status + (notes ? ' - ' + notes : ''),
        quantity: quantity,
        amount: totalAmount,
        status: 'completed'
    };

    // Save to API
    fetch(API_BASE + '/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
    })
    .then(function(response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
    })
    .then(function(newSale) {
        allSales.unshift(newSale);
        renderAll();
        e.target.reset();
        document.getElementById('chickenSaleDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('chickenQuantity').value = 1;
        showToast('✅ Chicken sale recorded for ' + buyerName + ' - R' + totalAmount.toFixed(2), 'success');
    })
    .catch(function(error) {
        console.error('Failed to record chicken sale:', error);
        showToast('❌ Failed to record chicken sale', 'error');
    });
}

// ============================================================
// LIVE SUMMARY UPDATES
// ============================================================

function updateEggSummary() {
    const crates = parseInt(document.getElementById('crates').value) || 0;
    const pieces = parseInt(document.getElementById('pieces').value) || 0;
    const pricePerCrate = parseFloat(document.getElementById('pricePerCrate').value) || 0;

    const totalEggs = (crates * 30) + pieces;
    const totalAmount = crates * pricePerCrate;

    const eggsEl = document.getElementById('totalEggsSale');
    const totalEl = document.getElementById('grandTotal');
    if (eggsEl) eggsEl.textContent = totalEggs.toLocaleString();
    if (totalEl) totalEl.textContent = 'R' + totalAmount.toFixed(2);
}

function updateChickenSummary() {
    const quantity = parseInt(document.getElementById('chickenQuantity').value) || 0;
    const pricePerChicken = parseFloat(document.getElementById('chickenPrice').value) || 0;

    const totalAmount = quantity * pricePerChicken;

    const qtyEl = document.getElementById('totalChickensSale');
    const totalEl = document.getElementById('chickenGrandTotal');
    if (qtyEl) qtyEl.textContent = quantity.toLocaleString();
    if (totalEl) totalEl.textContent = 'R' + totalAmount.toFixed(2);
}

// ============================================================
// REFRESH
// ============================================================

function refreshData() {
    showToast('🔄 Refreshing data...', 'info');
    loadSales();
}

// ============================================================
// TAB SWITCHING
// ============================================================

// Keep existing tab switching functionality
document.querySelectorAll('.tab-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.tab-btn').forEach(function(b) {
            b.classList.remove('active');
        });
        document.querySelectorAll('.tab-content').forEach(function(c) {
            c.classList.remove('active');
        });

        this.classList.add('active');
        var tabId = this.dataset.tab + '-tab';
        var tabContent = document.getElementById(tabId);
        if (tabContent) {
            tabContent.classList.add('active');
        }
    });
});

// ============================================================
// LOGOUT
// ============================================================

var logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('whitestone_token');
            window.location.href = 'login.html';
        }
    });
}

console.log('✅ Sales.js loaded');
