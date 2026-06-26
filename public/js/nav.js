function setupNavigation() {
    const user = getCurrentUser();
    if (!user) return;

    const navItems = document.querySelectorAll('.nav-menu li a');
    const hiddenPages = {
        'farmer': ['employees.html', 'sales.html', 'customers.html', 'pricing.html', 'equipment.html'],
        'sales': ['employees.html', 'stock.html', 'feed.html', 'coops.html', 'eggs.html', 'chickens.html', 'batches.html', 'security.html', 'equipment.html'],
        'accountant': ['stock.html', 'feed.html', 'coops.html', 'eggs.html', 'chickens.html', 'batches.html', 'security.html', 'equipment.html'],
        'foreman': ['employees.html', 'sales.html', 'customers.html', 'pricing.html'],
        'manager': ['pricing.html']
    };

    const role = user.role || 'farmer';
    const hide = hiddenPages[role] || [];

    navItems.forEach(function (item) {
        const href = item.getAttribute('href');
        if (href && href !== '#') {
            const page = href.split('/').pop();
            if (hide.includes(page)) {
                item.style.display = 'none';
            } else {
                item.style.display = 'flex';
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
});