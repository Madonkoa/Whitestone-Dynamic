document.addEventListener('DOMContentLoaded', function () {
    loadStats();
    loadActivity();
});

async function loadStats() {
    try {
        const employees = await DB.getAll('employees');
        document.getElementById('totalEmployees').textContent = employees.length || 0;

        const stock = await DB.getAll('stock');
        const broiler = stock.find(s => s.item_type === 'broiler');
        const layer = stock.find(s => s.item_type === 'layer');
        const egg = stock.find(s => s.item_type === 'egg');

        document.getElementById('totalBroilers').textContent = broiler ? broiler.quantity : 0;
        document.getElementById('totalLayers').textContent = layer ? layer.quantity : 0;
        document.getElementById('totalEggs').textContent = egg ? egg.quantity : 0;

        const feed = await DB.getAll('feed');
        let totalFeed = 0;
        feed.forEach(f => { totalFeed += f.quantity_kg || 0; });
        document.getElementById('totalFeed').textContent = totalFeed + ' kg';

        const sales = await DB.getAll('sales') || [];
        const today = new Date().toDateString();
        let totalToday = 0;
        sales.forEach(s => {
            if (new Date(s.sale_date).toDateString() === today) {
                totalToday += s.total || 0;
            }
        });
        document.getElementById('todaySales').textContent = 'R' + totalToday.toFixed(2);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadActivity() {
    const log = document.getElementById('activityLog');
    try {
        const sales = await DB.getAll('sales') || [];
        const items = sales.slice(0, 5).map(s => {
            return '<div class="activity-item">' +
                '<span class="activity-time">' + formatDate(s.sale_date) + '</span>' +
                '<p>💰 Sale: ' + s.total_eggs + ' eggs to ' + s.buyer_name + ' (R' + s.total.toFixed(2) + ')</p>' +
                '</div>';
        });
        log.innerHTML = items.length ? items.join('') : '<p>No recent activity</p>';
    } catch (error) {
        log.innerHTML = '<p>Error loading activity</p>';
    }
}