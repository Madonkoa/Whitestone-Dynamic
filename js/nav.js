// nav.js - Dynamic navigation based on user role

function setupNavigation() {
    var user = getCurrentUser();
    if (!user) {
        console.log('🔐 No user logged in');
        return;
    }

    console.log('🔐 Setting up navigation for:', user.username, 'Role:', user.position, user.role);

    var navItems = document.querySelectorAll('.nav-menu li a');

    // Owner sees everything
    if (isOwner(user)) {
        console.log('👑 Owner detected - showing all navigation');
        navItems.forEach(function (item) {
            item.style.display = 'flex';
        });
        return;
    }

    // For everyone else, check permissions
    var visibleCount = 0;
    navItems.forEach(function (item) {
        var href = item.getAttribute('href');
        if (href && href !== '#') {
            var permission = PAGE_PERMISSIONS[href];
            if (permission && hasPermission(user, permission)) {
                item.style.display = 'flex';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        }
    });

    console.log('✅ Navigation setup complete. Visible items:', visibleCount);
}

// Call this after DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
});