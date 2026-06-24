// dashboard.js - Dashboard functionality

document.addEventListener('DOMContentLoaded', function () {
    loadDashboardStats();
    loadRecentActivity();
});

function loadDashboardStats() {
    // Employees
    var employees = DB.getAll('employees');
    document.getElementById('totalEmployees').textContent = employees.length;

    // Stock
    var stock = DB.getAll('stock');
    var broiler = stock.find(function (s) { return s.itemType === 'broiler'; });
    var layer = stock.find(function (s) { return s.itemType === 'layer'; });
    var egg = stock.find(function (s) { return s.itemType === 'egg'; });

    document.getElementById('totalBroilers').textContent = broiler ? broiler.quantity : 0;
    document.getElementById('totalLayers').textContent = layer ? layer.quantity : 0;
    document.getElementById('totalEggs').textContent = egg ? egg.quantity : 0;

    // Feed
    var feed = DB.getAll('feed');
    var totalFeed = feed.reduce(function (sum, f) { return sum + (f.quantityKg || 0); }, 0);
    document.getElementById('totalFeed').textContent = totalFeed + ' kg';

    // Today's Sales (Eggs + Chickens)
    var eggSales = DB.getAll('sales') || [];
    var chickenSales = DB.getAll('chickenSales') || [];
    var today = new Date().toDateString();

    var todayEggSales = eggSales.filter(function (s) {
        return new Date(s.saleDate).toDateString() === today;
    });
    var todayChickenSales = chickenSales.filter(function (s) {
        return new Date(s.saleDate).toDateString() === today;
    });

    var totalToday = 0;
    todayEggSales.forEach(function (s) { totalToday += (s.total || 0); });
    todayChickenSales.forEach(function (s) { totalToday += (s.total || 0); });

    document.getElementById('todaySales').textContent = 'R' + totalToday.toFixed(2);
}

function loadRecentActivity() {
    var activityLog = document.getElementById('activityLog');
    var activities = [];

    // Get recent egg sales
    var eggSales = DB.getAll('sales') || [];
    eggSales.slice(0, 3).forEach(function (s) {
        if (s.saleDate) {
            activities.push({
                text: '🥚 Egg sale: ' + s.totalEggs + ' eggs to ' + s.buyerName + ' (R' + s.total.toFixed(2) + ')',
                time: new Date(s.saleDate)
            });
        }
    });

    // Get recent chicken sales
    var chickenSales = DB.getAll('chickenSales') || [];
    chickenSales.slice(0, 3).forEach(function (s) {
        if (s.saleDate) {
            activities.push({
                text: '🐔 Chicken sale: ' + s.quantity + ' ' + s.chickenType + '(s) to ' + s.buyer + ' (R' + s.total.toFixed(2) + ')',
                time: new Date(s.saleDate)
            });
        }
    });

    // Get recent egg production
    var eggs = DB.getAll('eggs') || [];
    eggs.slice(0, 2).forEach(function (e) {
        if (e.date) {
            activities.push({
                text: '🥚 Egg production: ' + e.total + ' eggs recorded',
                time: new Date(e.date)
            });
        }
    });

    // Get recent feed records
    var feedConsumption = DB.get('feedConsumption') || [];
    feedConsumption.slice(0, 2).forEach(function (f) {
        if (f.date) {
            activities.push({
                text: '🌾 Feed consumption: ' + f.totalKg + 'kg of ' + f.feedType,
                time: new Date(f.date)
            });
        }
    });

    // Sort by time (most recent first) and take top 5
    activities.sort(function (a, b) { return b.time - a.time; });
    var recent = activities.slice(0, 5);

    if (recent.length === 0) {
        activityLog.innerHTML = '<p>No recent activity</p>';
    } else {
        activityLog.innerHTML = recent.map(function (activity) {
            return '<div class="activity-item">' +
                '<span class="activity-time">' + activity.time.toLocaleDateString() + '</span>' +
                '<p>' + activity.text + '</p>' +
                '</div>';
        }).join('');
    }
}