document.addEventListener('DOMContentLoaded', function () {
    loadFeed();
    loadConsumption();
    setupTabs();

    document.getElementById('feedConsumptionForm').addEventListener('submit', function (e) {
        e.preventDefault();
        recordConsumption();
    });

    document.getElementById('feedStockForm').addEventListener('submit', function (e) {
        e.preventDefault();
        recordStock();
    });
});

async function loadFeed() {
    try {
        const feed = await DB.getAll('feed');
        const container = document.getElementById('feedGrid');
        container.innerHTML = '';

        if (!feed || feed.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">No feed items found</p>';
            return;
        }

        let totalKg = 0;
        feed.forEach(function (item) {
            totalKg += item.quantity_kg || 0;
            const card = document.createElement('div');
            card.className = 'feed-card';
            card.innerHTML =
                '<h3>' + item.feed_type + '</h3>' +
                '<p><strong>Quantity:</strong> ' + (item.quantity_kg || 0) + ' kg</p>' +
                '<p><small>Updated: ' + formatDate(item.last_updated) + '</small></p>';
            container.appendChild(card);
        });

        document.getElementById('totalFeedStock').textContent = totalKg + ' kg';
    } catch (error) {
        console.error('Error loading feed:', error);
    }
}

async function loadConsumption() {
    try {
        const records = await DB.getAll('feedConsumption') || [];
        const container = document.getElementById('recentFeedRecords');
        container.innerHTML = '';

        if (!records || records.length === 0) {
            container.innerHTML = '<p style="color: #888;">No feed consumption records</p>';
            return;
        }

        const recent = records.slice(0, 5);
        recent.forEach(function (r) {
            const div = document.createElement('div');
            div.className = 'feed-record-item';
            div.innerHTML =
                '<strong>' + formatDate(r.date) + '</strong> - ' + r.feed_type +
                ' <span style="float: right;">' + r.total_kg + ' kg</span>' +
                (r.condition ? '<br><small style="color: #888;">' + r.condition + '</small>' : '');
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading consumption:', error);
    }
}

function setupTabs() {
    document.querySelectorAll('.feed-tabs .tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.feed-tabs .tab-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(function (tc) {
                tc.classList.remove('active');
            });
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');
        });
    });
}

async function recordConsumption() {
    const feed_type = document.getElementById('feedTypeConsumption').value;
    const date = document.getElementById('feedDate').value;
    const bags = parseInt(document.getElementById('feedBags').value) || 0;
    const bag_size = parseInt(document.getElementById('feedBagSize').value) || 50;
    const condition = document.getElementById('feedCondition').value.trim();

    if (!feed_type || !date || bags === 0) {
        alert('Please fill in all fields');
        return;
    }

    const total_kg = bags * bag_size;
    const data = { feed_type, date, bags, bag_size, total_kg, condition: condition || 'Normal' };

    try {
        await DB.add('feedConsumption', data);
        alert('Consumption recorded!');
        document.getElementById('feedConsumptionForm').reset();
        document.getElementById('computedFeedAmount').textContent = '0 kg';
        loadFeed();
        loadConsumption();
    } catch (error) {
        alert('Error recording consumption');
    }
}

async function recordStock() {
    const feed_type = document.getElementById('stockFeedType').value;
    const date = document.getElementById('stockDate').value;
    const bags = parseInt(document.getElementById('stockBags').value) || 0;
    const bag_size = parseInt(document.getElementById('stockBagSize').value) || 50;
    const cost = parseFloat(document.getElementById('stockCost').value) || 0;
    const supplier = document.getElementById('stockSupplier').value.trim() || 'Supplier';

    if (!feed_type || !date || bags === 0) {
        alert('Please fill in all fields');
        return;
    }

    const total_kg = bags * bag_size;
    const total_cost = bags * cost;
    const data = { feed_type, date, bags, bag_size, total_kg, total_cost, supplier };

    try {
        await DB.add('feedStockRecords', data);
        alert('Stock recorded!');
        document.getElementById('feedStockForm').reset();
        document.getElementById('computedTotalKg').textContent = '0 kg';
        document.getElementById('computedTotalCost').textContent = 'R0.00';
        loadFeed();
    } catch (error) {
        alert('Error recording stock');
    }
}

// Add computed amount listeners
document.getElementById('feedBags').addEventListener('input', function () {
    const bags = parseInt(this.value) || 0;
    const size = parseInt(document.getElementById('feedBagSize').value) || 50;
    document.getElementById('computedFeedAmount').textContent = (bags * size) + ' kg';
});

document.getElementById('stockBags').addEventListener('input', function () {
    const bags = parseInt(this.value) || 0;
    const size = parseInt(document.getElementById('stockBagSize').value) || 50;
    const cost = parseFloat(document.getElementById('stockCost').value) || 0;
    document.getElementById('computedTotalKg').textContent = (bags * size) + ' kg';
    document.getElementById('computedTotalCost').textContent = 'R' + (bags * cost).toFixed(2);
});

document.getElementById('stockCost').addEventListener('input', function () {
    const bags = parseInt(document.getElementById('stockBags').value) || 0;
    const cost = parseFloat(this.value) || 0;
    document.getElementById('computedTotalCost').textContent = 'R' + (bags * cost).toFixed(2);
});