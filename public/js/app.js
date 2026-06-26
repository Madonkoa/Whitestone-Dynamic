// ============================================
// API CONFIGURATION
// ============================================

const API_BASE = 'http://localhost:3000/api';

// ============================================
// API CALL FUNCTION
// ============================================

async function apiCall(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');

    if (!token && !endpoint.includes('auth/')) {
        console.error('❌ No token found');
        return { error: 'Not authenticated' };
    }

    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(API_BASE + '/' + endpoint, options);
        const result = await response.json();

        if (!response.ok) {
            console.error('API Error:', response.status, result);
            return { error: result.error || 'API Error' };
        }

        return result;
    } catch (error) {
        console.error('Network Error:', error);
        return { error: 'Network error - is backend running?' };
    }
}

// ============================================
// DATABASE HANDLER - FIXED
// ============================================

const DB = {
    // Get all records from a table
    getAll: async function (table) {
        // Map frontend table names to API endpoints
        const endpointMap = {
            'employees': 'employees',
            'customers': 'customers',
            'stock': 'stock',
            'feed': 'feed',
            'feedConsumption': 'feed/consumption',
            'feedStockRecords': 'feed/stock',
            'coops': 'coops',
            'eggs': 'eggs',
            'sales': 'sales/eggs',
            'chickenSales': 'sales/chickens',
            'chickens': 'chickens',
            'batches': 'batches',
            'equipment': 'equipment',
            'security': 'security',
            'pricing': 'pricing',
            'pricingHistory': 'pricing/history'
        };

        const endpoint = endpointMap[table];
        if (!endpoint) {
            console.warn('⚠️ Unknown table:', table);
            return [];
        }

        const result = await apiCall(endpoint, 'GET');

        // ALWAYS return an array
        if (result && Array.isArray(result)) {
            return result;
        }

        if (result && result.data && Array.isArray(result.data)) {
            return result.data;
        }

        if (result && typeof result === 'object' && !result.error) {
            return [result];
        }

        return [];
    },

    // Get a single record by ID
    get: async function (table, id) {
        const results = await this.getAll(table);
        if (!results || results.length === 0) return null;
        return results.find(item => item.id === id) || null;
    },

    // Add a new record
    add: async function (table, data) {
        const endpointMap = {
            'employees': 'employees',
            'customers': 'customers',
            'stock': 'stock',
            'feed': 'feed',
            'feedConsumption': 'feed/consumption',
            'feedStockRecords': 'feed/stock',
            'coops': 'coops',
            'eggs': 'eggs',
            'sales': 'sales/eggs',
            'chickenSales': 'sales/chickens',
            'chickens': 'chickens',
            'batches': 'batches',
            'equipment': 'equipment',
            'security': 'security'
        };

        const endpoint = endpointMap[table];
        if (!endpoint) {
            console.warn('⚠️ Unknown table:', table);
            return null;
        }

        const result = await apiCall(endpoint, 'POST', data);
        return result && !result.error ? result : null;
    },

    // Update a record
    update: async function (table, id, data) {
        const endpointMap = {
            'employees': 'employees',
            'customers': 'customers',
            'stock': 'stock',
            'feed': 'feed',
            'coops': 'coops',
            'eggs': 'eggs',
            'sales': 'sales/eggs',
            'chickenSales': 'sales/chickens',
            'chickens': 'chickens',
            'batches': 'batches',
            'equipment': 'equipment',
            'security': 'security',
            'pricing': 'pricing'
        };

        const endpoint = endpointMap[table];
        if (!endpoint) {
            console.warn('⚠️ Unknown table:', table);
            return null;
        }

        const result = await apiCall(endpoint + '/' + id, 'PUT', data);
        return result && !result.error ? result : null;
    },

    // Delete a record
    delete: async function (table, id) {
        const endpointMap = {
            'employees': 'employees',
            'customers': 'customers',
            'stock': 'stock',
            'feed': 'feed',
            'coops': 'coops',
            'eggs': 'eggs',
            'sales': 'sales/eggs',
            'chickenSales': 'sales/chickens',
            'chickens': 'chickens',
            'batches': 'batches',
            'equipment': 'equipment',
            'security': 'security'
        };

        const endpoint = endpointMap[table];
        if (!endpoint) {
            console.warn('⚠️ Unknown table:', table);
            return false;
        }

        const result = await apiCall(endpoint + '/' + id, 'DELETE');
        return result && !result.error;
    }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCurrentUser() {
    try {
        const data = sessionStorage.getItem('currentUser');
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

function isAuthenticated() {
    return getCurrentUser() !== null && localStorage.getItem('token') !== null;
}

function logout() {
    sessionStorage.clear();
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-ZA');
    } catch {
        return dateString;
    }
}

function formatCurrency(amount) {
    return 'R' + parseFloat(amount || 0).toFixed(2);
}

function getStatusClass(status) {
    const map = {
        'Good': 'status-good',
        'Fair': 'status-fair',
        'Poor': 'status-poor',
        'Critical': 'status-poor',
        'Excellent': 'status-good',
        'Broken': 'status-poor'
    };
    return map[status] || 'status-fair';
}

// ============================================
// EXPOSE GLOBALLY
// ============================================

window.DB = DB;
window.apiCall = apiCall;
window.API_BASE = API_BASE;
window.getCurrentUser = getCurrentUser;
window.isAuthenticated = isAuthenticated;
window.logout = logout;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.getStatusClass = getStatusClass;

// ============================================
// DOCUMENT READY
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 App initializing...');

    const user = getCurrentUser();
    if (user) {
        const nameEl = document.getElementById('userDisplay');
        const roleEl = document.getElementById('userRoleDisplay');
        if (nameEl) nameEl.textContent = user.name || user.username;
        if (roleEl) roleEl.textContent = user.position || 'User';
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleDateString('en-ZA', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    const protectedPages = ['dashboard.html', 'employees.html', 'stock.html', 'feed.html', 'coops.html', 'eggs.html', 'sales.html', 'chickens.html', 'customers.html', 'batches.html', 'pricing.html', 'security.html', 'equipment.html'];
    const currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage) && !isAuthenticated()) {
        window.location.href = 'login.html';
    }

    console.log('✅ App initialized');
});

// Add slide in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);