// ============================================================
// SALES.JS - COMPLETE API-INTEGRATED VERSION
// ============================================================

// ============================================================
// CONFIGURATION
// ============================================================

// DETECT API BASE URL AUTOMATICALLY
const API_BASE = (() => {
    // If you're running on a specific port, set it here
    // Example: 'http://localhost:3000/api'
    // Or use relative path: '/api'
    return '/api';
})();

const API_ENDPOINTS = {
    sales: `${API_BASE}/sales`,
    stats: `${API_BASE}/sales/stats`,
    sale: (id) => `${API_BASE}/sales/${id}`
};

// ============================================================
// STATE
// ============================================================

let allSales = [];
let isLoading = false;
let currentFilter = 'all';
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Sales page initializing...');

    // Set current date in header
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

    // Set default dates on forms
    const today = now.toISOString().split('T')[0];
    const saleDate = document.getElementById('saleDate');
    const chickenSaleDate = document.getElementById('chickenSaleDate');
    if (saleDate) saleDate.value = today;
    if (chickenSaleDate) chickenSaleDate.value = today;

    // Load sales from API
    fetchSales();

    // Set up event listeners
    setupFormListeners();
    setupTabListeners();
    setupNavListener();

    console.log('✅ Sales page initialized');
});

// ============================================================
// API CALLS
// ============================================================

/**
 * FETCH ALL SALES FROM API
 */
async function fetchSales() {
    showLoading(true);
    console.log('📡 Fetching sales from API...');

    try {
        const response = await fetch(API_ENDPOINTS.sales, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle different API response formats
        if (Array.isArray(data)) {
            allSales = data;
        } else if (data.data && Array.isArray(data.data)) {
            allSales = data.data;
        } else if (data.sales && Array.isArray(data.sales)) {
            allSales = data.sales;
        } else {
            throw new Error('Unexpected API response format');
        }

        console.log(`✅ Loaded ${allSales.length} sales from API`);
        renderAll();
        showToast('✅ Sales loaded successfully', 'success');

    } catch (error) {
        console.error('❌ Failed to fetch sales:', error);

        // Try to load from localStorage cache
        const cached = loadFromCache();
        if (cached && cached.length > 0) {
            allSales = cached;
            renderAll();
            showToast('⚠️ Using cached data (API unavailable)', 'warning');
        } else {
            showToast('❌ Failed to load sales data', 'error');
            renderEmptyState();
        }
    }

    showLoading(false);
}

/**
 * FETCH STATS FROM API
 */
async function fetchStats() {
    try {
        const response = await fetch(API_ENDPOINTS.stats, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const stats = await response.json();
        updateStatsUI(stats);
        return stats;

    } catch (error) {
        console.warn('⚠️ Failed to fetch stats, calculating locally:', error);
        // Fallback: calculate from local data
        if (allSales.length > 0) {
            const stats = calculateStats(allSales);
            updateStatsUI(stats);
            return stats;
        }
        return null;
    }
}

/**
 * CREATE NEW SALE VIA API
 */
async function createSale(saleData) {
    console.log('📤 Creating sale via API...', saleData);

    const response = await fetch(API_ENDPOINTS.sales, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(saleData)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Handle different response formats
    if (result.id || result.data?.id) {
        return result.data || result;
    }

    throw new Error('Invalid response format from API');
}

/**
 * DELETE SALE VIA API
 */
async function deleteSaleFromAPI(saleId) {
    console.log(`🗑️ Deleting sale ${saleId} via API...`);

    const response = await fetch(API_ENDPOINTS.sale(saleId), {
        method: 'DELETE',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return true;
}

/**
 * UPDATE SALE VIA API
 */
async function updateSaleFromAPI(saleId, updateData) {
    console.log(`📝 Updating sale ${saleId} via API...`);

    const response = await fetch(API_ENDPOINTS.sale(saleId), {
        method: 'PUT',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result.data || result;
}

// ============================================================
// CACHE HELPERS
// ============================================================

function saveToCache(data) {
    try {
        localStorage.setItem('whitestone_sales_cache', JSON.stringify({
            data: data,
            timestamp: Date.now()
        }));
        console.log('💾 Sales cached');
    } catch (e) {
        console.warn('Failed to cache sales:', e);
    }
}

function loadFromCache() {
    try {
        const cached = localStorage.getItem('whitestone_sales_cache');
        if (cached) {
            const parsed = JSON.parse(cached);
            // Cache valid for 5 minutes
            if (Date.now() - parsed.timestamp < 300000) {
                console.log('📦 Loaded from cache');
                return parsed.data;
            }
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============================================================
// STATS CALCULATION (FALLBACK)
// ============================================================

function calculateStats(data) {
    let totalEggs = 0;
    let totalChickens = 0;
    let totalRevenue = 0;
    let monthlyRevenue = 0;

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    data.forEach(sale => {
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
        } catch (e) { }
    });

    return {
        totalEggs,
        totalChickens,
        totalRevenue,
        monthlyRevenue,
        totalTransactions: data.length
    };
}

// ============================================================
// UI UPDATES
// ============================================================

function updateStatsUI(stats) {
    const eggEl = document.getElementById('totalEggSales');
    const chickenEl = document.getElementById('totalChickenSales');
    const revenueEl = document.getElementById('totalRevenue');
    const monthEl = document.getElementById('monthlyRevenue');
    const countEl = document.getElementById('totalSalesCount');

    if (eggEl) eggEl.textContent = (stats.totalEggs || 0).toLocaleString();
    if (chickenEl) chickenEl.textContent = (stats.totalChickens || 0).toLocaleString();
    if (revenueEl) revenueEl.textContent = `R${(stats.totalRevenue || 0).toFixed(2)}`;
    if (monthEl) monthEl.textContent = `R${(stats.monthlyRevenue || 0).toFixed(2)}`;
    if (countEl) countEl.textContent = (stats.totalTransactions || 0);
}

function showLoading(loading) {
    isLoading = loading;
    const container = document.getElementById('allSalesContainer');
    if (loading && container) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">⏳</span>
                <p>Loading sales data...</p>
                <span class="empty-sub">Please wait</span>
            </div>
        `;
    }
}

// ============================================================
// RENDER FUNCTIONS
// ============================================================

function renderAll() {
    fetchStats();
    renderSalesList();
    saveToCache(allSales);
}

function renderSalesList() {
    const container = document.getElementById('allSalesContainer');
    if (!container) return;

    // Filter and sort
    let filtered = [...allSales];

    // Filter by type
    if (currentFilter !== 'all') {
        filtered = filtered.filter(s => s.type === currentFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => {
        try {
            return new Date(b.date) - new Date(a.date);
        } catch (e) {
            return 0;
        }
    });

    // Paginate
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

    // Update counts
    const countEl = document.getElementById('totalSalesCount');
    if (countEl) countEl.textContent = filtered.length;

    if (paginated.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📊</span>
                <p>${filtered.length === 0 ? 'No sales recorded yet' : 'No matching sales found'}</p>
                <span class="empty-sub">${filtered.length === 0 ? 'Start selling eggs or chickens' : 'Try adjusting your filters'}</span>
            </div>
        `;
        return;
    }

    // Build HTML
    let html = '';
    paginated.forEach(sale => {
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

            html += `
                <div class="history-item" data-id="${sale.id}">
                    <div class="history-item-header">
                        <span class="history-type">${typeEmoji} ${typeLabel}</span>
                        <span class="history-date">📅 ${formattedDate}</span>
                        <span class="history-status ${status}">${status}</span>
                        <button class="history-delete" onclick="deleteSale('${sale.id}')" title="Delete sale">🗑️</button>
                    </div>
                    <div class="history-item-body">
                        <span class="history-customer"><strong>${escapeHtml(customer)}</strong></span>
                        ${description ? `<span class="history-description">${escapeHtml(description)}</span>` : ''}
                        <span class="history-quantity">${qty.toLocaleString()} ${unitLabel}</span>
                        <span class="history-amount">R${amount.toFixed(2)}</span>
                    </div>
                </div>
            `;
        } catch (e) {
            console.warn('Error rendering sale:', e);
        }
    });

    container.innerHTML = html;

    // Update pagination controls
    updatePagination(filtered.length, totalPages);
}

function updatePagination(total, totalPages) {
    const infoEl = document.getElementById('paginationInfo');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (infoEl) {
        infoEl.textContent = `Page ${currentPage} of ${totalPages || 1} (${total} items)`;
    }
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

function renderEmptyState() {
    const container = document.getElementById('allSalesContainer');
    if (container) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">🔌</span>
                <p>Unable to load sales</p>
                <span class="empty-sub">Please check your API connection</span>
                <br><br>
                <button class="btn btn-primary" onclick="fetchSales()">🔄 Retry</button>
            </div>
        `;
    }
}

// ============================================================
// CRUD OPERATIONS
// ============================================================

/**
 * DELETE SALE
 */
async function deleteSale(saleId) {
    if (!confirm('Are you sure you want to delete this sale?')) return;

    showLoading(true);

    try {
        // Delete from API
        await deleteSaleFromAPI(saleId);

        // Remove from local array
        allSales = allSales.filter(s => s.id !== saleId);
        renderAll();
        showToast('🗑️ Sale deleted successfully', 'success');

    } catch (error) {
        console.error('❌ Delete failed:', error);
        showToast(`❌ Failed to delete sale: ${error.message}`, 'error');
    }

    showLoading(false);
}

/**
 * HANDLE EGG SALE
 */
async function handleEggSale(e) {
    e.preventDefault();

    const buyerName = document.getElementById('buyerName').value.trim();
    const saleDate = document.getElementById('saleDate').value;
    const eggSize = document.getElementById('eggSize').value;
    const crates = parseInt(document.getElementById('crates').value) || 0;
    const pieces = parseInt(document.getElementById('pieces').value) || 0;
    const pricePerCrate = parseFloat(document.getElementById('pricePerCrate').value) || 0;
    const notes = document.getElementById('saleNotes').value.trim();

    // Validation
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
        description: `${eggSize} eggs${notes ? ' - ' + notes : ''}`,
        quantity: totalEggs,
        amount: totalAmount,
        status: 'completed',
        crates: crates,
        pieces: pieces,
        pricePerCrate: pricePerCrate
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Saving...';

    try {
        // Save to API
        const newSale = await createSale(saleData);

        // Add to local array
        allSales.unshift(newSale);
        renderAll();

        // Reset form
        e.target.reset();
        document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('crates').value = 1;
        document.getElementById('pieces').value = 0;
        document.getElementById('pricePerCrate').value = '';

        showToast(`✅ Egg sale recorded for ${buyerName} - R${totalAmount.toFixed(2)}`, 'success');

    } catch (error) {
        console.error('❌ Failed to record egg sale:', error);
        showToast(`❌ Failed to record egg sale: ${error.message}`, 'error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Record Egg Sale';
}

/**
 * HANDLE CHICKEN SALE
 */
async function handleChickenSale(e) {
    e.preventDefault();

    const buyerName = document.getElementById('chickenBuyer').value.trim();
    const saleDate = document.getElementById('chickenSaleDate').value;
    const chickenType = document.getElementById('chickenType').value;
    const quantity = parseInt(document.getElementById('chickenQuantity').value) || 0;
    const pricePerChicken = parseFloat(document.getElementById('chickenPrice').value) || 0;
    const status = document.getElementById('chickenStatus').value;
    const notes = document.getElementById('chickenNotes').value.trim();

    // Validation
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
        description: `${chickenType} - ${status}${notes ? ' - ' + notes : ''}`,
        quantity: quantity,
        amount: totalAmount,
        status: 'completed',
        chickenType: chickenType,
        pricePerChicken: pricePerChicken,
        chickenStatus: status
    };

    const submitBtn = e.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Saving...';

    try {
        // Save to API
        const newSale = await createSale(saleData);

        // Add to local array
        allSales.unshift(newSale);
        renderAll();

        // Reset form
        e.target.reset();
        document.getElementById('chickenSaleDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('chickenQuantity').value = 1;
        document.getElementById('chickenPrice').value = '';

        showToast(`✅ Chicken sale recorded for ${buyerName} - R${totalAmount.toFixed(2)}`, 'success');

    } catch (error) {
        console.error('❌ Failed to record chicken sale:', error);
        showToast(`❌ Failed to record chicken sale: ${error.message}`, 'error');
    }

    submitBtn.disabled = false;
    submitBtn.textContent = 'Record Chicken Sale';
}

// ============================================================
// FORM SETUP
// ============================================================

function setupFormListeners() {
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

    console.log('✅ Form listeners set up');
}

function updateEggSummary() {
    const crates = parseInt(document.getElementById('crates').value) || 0;
    const pieces = parseInt(document.getElementById('pieces').value) || 0;
    const pricePerCrate = parseFloat(document.getElementById('pricePerCrate').value) || 0;

    const totalEggs = (crates * 30) + pieces;
    const totalAmount = crates * pricePerCrate;

    const eggsEl = document.getElementById('totalEggsSale');
    const totalEl = document.getElementById('grandTotal');
    if (eggsEl) eggsEl.textContent = totalEggs.toLocaleString();
    if (totalEl) totalEl.textContent = `R${totalAmount.toFixed(2)}`;
}

function updateChickenSummary() {
    const quantity = parseInt(document.getElementById('chickenQuantity').value) || 0;
    const pricePerChicken = parseFloat(document.getElementById('chickenPrice').value) || 0;

    const totalAmount = quantity * pricePerChicken;

    const qtyEl = document.getElementById('totalChickensSale');
    const totalEl = document.getElementById('chickenGrandTotal');
    if (qtyEl) qtyEl.textContent = quantity.toLocaleString();
    if (totalEl) totalEl.textContent = `R${totalAmount.toFixed(2)}`;
}

// ============================================================
// TAB SETUP
// ============================================================

function setupTabListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            this.classList.add('active');
            const tabId = this.dataset.tab + '-tab';
            const tabContent = document.getElementById(tabId);
            if (tabContent) {
                tabContent.classList.add('active');
            }
        });
    });
    console.log('✅ Tab listeners set up');
}

// ============================================================
// NAV SETUP
// ============================================================

function setupNavListener() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('whitestone_token');
                window.location.href = 'login.html';
            }
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            fetchSales();
            showToast('🔄 Refreshing data...', 'info');
        }
    });
}

// ============================================================
// PAGINATION
// ============================================================

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderSalesList();
    }
}

function nextPage() {
    const total = allSales.length;
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderSalesList();
    }
}

function setFilter(filter) {
    currentFilter = filter;
    currentPage = 1;
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    renderSalesList();
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================
// EXPOSE GLOBALLY
// ============================================================

// Pagination functions
window.prevPage = prevPage;
window.nextPage = nextPage;
window.setFilter = setFilter;

// CRUD functions
window.deleteSale = deleteSale;
window.fetchSales = fetchSales;

// Utility
window.showToast = showToast;

// Debug helpers
window.getSales = () => allSales;
window.getStats = () => calculateStats(allSales);

console.log('✅ Sales.js loaded successfully');
console.log(`📍 API Base: ${API_BASE}`);
console.log(`🔗 Endpoints:`, API_ENDPOINTS);