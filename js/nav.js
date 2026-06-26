// nav.js - Dynamic navigation based on user role

function setupNavigation() {
    var user = getCurrentUser();
    if (!user) {
        console.log('🔐 No user logged in');
        return;
    }

    console.log('🔐 Setting up navigation for:', user.username, 'Role:', user.position, user.role);

    var navItems = document.querySelectorAll('.nav-menu li a');
    var pages = {
        'dashboard.html': PERMISSIONS.DASHBOARD,
        'employees.html': PERMISSIONS.EMPLOYEES_VIEW,
        'stock.html': PERMISSIONS.STOCK_VIEW,
        'feed.html': PERMISSIONS.FEED_VIEW,
        'coops.html': PERMISSIONS.COOPS_VIEW,
        'eggs.html': PERMISSIONS.EGGS_VIEW,
        'sales.html': PERMISSIONS.SALES_VIEW,
        'chickens.html': PERMISSIONS.CHICKENS_VIEW,
        'customers.html': PERMISSIONS.CUSTOMERS_VIEW,
        'batches.html': PERMISSIONS.BATCHES_VIEW,
        'pricing.html': PERMISSIONS.PRICING_VIEW,
        'security.html': PERMISSIONS.SECURITY_VIEW,
        'equipment.html': PERMISSIONS.EQUIPMENT_VIEW
    };

    // OWNER SEES EVERYTHING - check position, role, AND username
    var isOwner = user.position === 'Owner' || user.role === 'owner' || user.username === 'admin';

    if (isOwner) {
        console.log('👑 Owner detected - showing all navigation');
        navItems.forEach(function (item) {
            item.style.display = 'flex';
        });
        return;
    }

    // For everyone else, hide based on permissions
    navItems.forEach(function (item) {
        var href = item.getAttribute('href');
        if (href && href !== '#' && pages[href]) {
            if (!hasPermission(pages[href])) {
                item.style.display = 'none';
                console.log('❌ Hiding:', href);
            } else {
                console.log('✅ Showing:', href);
            }
        }
    });
}

// Call this after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
});