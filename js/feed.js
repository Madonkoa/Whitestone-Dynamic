// feed.js - Complete feed management with working tabs

document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 Feed page loaded');

    loadFeedStats();
    loadFeedHistory();
    setupFeedTabs();

    // Set default dates
    var feedDate = document.getElementById('feedDate');
    if (feedDate) {
        feedDate.value = new Date().toISOString().split('T')[0];
    }
    var stockDate = document.getElementById('stockDate');
    if (stockDate) {
        stockDate.value = new Date().toISOString().split('T')[0];
    }

    // Real-time computation for consumption
    var feedBags = document.getElementById('feedBags');
    if (feedBags) {
        feedBags.addEventListener('input', computeFeedAmount);
    }
    var feedBagSize = document.getElementById('feedBagSize');
    if (feedBagSize) {
        feedBagSize.addEventListener('change', computeFeedAmount);
    }

    // Real-time computation for stock
    var stockBags = document.getElementById('stockBags');
    if (stockBags) {
        stockBags.addEventListener('input', computeStockTotals);
    }
    var stockBagSize = document.getElementById('stockBagSize');
    if (stockBagSize) {
        stockBagSize.addEventListener('change', computeStockTotals);
    }
    var stockCost = document.getElementById('stockCost');
    if (stockCost) {
        stockCost.addEventListener('input', computeStockTotals);
    }

    // Form submissions
    var consumptionForm = document.getElementById('feedConsumptionForm');
    if (consumptionForm) {
        consumptionForm.addEventListener('submit', function (e) {
            e.preventDefault();
            recordFeedConsumption();
        });
    }

    var stockForm = document.getElementById('feedStockForm');
    if (stockForm) {
        stockForm.addEventListener('submit', function (e) {
            e.preventDefault();
            recordFeedStock();
        });
    }
});

// ============================================
// SETUP TABS - FIXED
// ============================================
function setupFeedTabs() {
    console.log('📊 Setting up feed tabs...');
    var tabs = document.querySelectorAll('.feed-tabs .tab-btn');
    console.log('📊 Tabs found:', tabs.length);

    tabs.forEach(function (btn) {
        btn.addEventListener('click', function () {
            console.log('📊 Tab clicked:', this.dataset.tab);

            // Remove active from all tabs
            tabs.forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            // Hide all tab content
            var contents = document.querySelectorAll('.tab-content');
            contents.forEach(function (tc) {
                tc.classList.remove('active');
            });

            // Show the target tab content
            var targetId = this.dataset.tab + '-tab';
            var target = document.getElementById(targetId);
            if (target) {
                target.classList.add('active');
                console.log('✅ Showing tab:', targetId);
            } else {
                console.error('❌ Tab content not found:', targetId);
            }

            // If history tab, reload data
            if (this.dataset.tab === 'history') {
                loadFeedHistory();
            }
        });
    });

    // Make sure first tab is active by default
    var firstTab = document.querySelector('.feed-tabs .tab-btn.active');
    if (!firstTab) {
        var firstBtn = document.querySelector('.feed-tabs .tab-btn');
        if (firstBtn) {
            firstBtn.classList.add('active');
            var firstContent = document.getElementById(firstBtn.dataset.tab + '-tab');
            if (firstContent) {
                firstContent.classList.add('active');
            }
        }
    }
}

// ============================================
// LOAD FEED STATS
// ============================================
function loadFeedStats() {
    console.log('📊 Loading feed stats...');

    // Total feed stock
    var feed = DB.getAll('feed');
    var totalKg = feed.reduce(function (sum, f) { return sum + (f.quantityKg || 0); }, 0);
    var totalStockEl = document.getElementById('totalFeedStock');
    if (totalStockEl) totalStockEl.textContent = totalKg + ' kg';

    // Today's consumption
    var consumption = DB.get('feedConsumption') || [];
    var today = new Date().toDateString();
    var todayConsumption = consumption
        .filter(function (c) { return new Date(c.date).toDateString() === today; })
        .reduce(function (sum, c) { return sum + (c.totalKg || 0); }, 0);
    var todayConsumptionEl = document.getElementById('todayConsumption');
    if (todayConsumptionEl) todayConsumptionEl.textContent = todayConsumption + ' kg';

    // Total feed cost
    var stockRecords = DB.get('feedStockRecords') || [];
    var totalCost = stockRecords.reduce(function (sum, r) { return sum + (r.totalCost || 0); }, 0);
    var totalCostEl = document.getElementById('totalFeedCost');
    if (totalCostEl) totalCostEl.textContent = 'R' + totalCost.toFixed(2);

    // Average daily usage (last 30 days)
    var last30Days = consumption.filter(function (c) {
        var d = new Date(c.date);
        var thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return d >= thirtyDaysAgo;
    });
    var avgDaily = last30Days.length > 0 ? Math.round(last30Days.reduce(function (sum, c) { return sum + c.totalKg; }, 0) / last30Days.length) : 0;
    var avgDailyEl = document.getElementById('avgDailyUsage');
    if (avgDailyEl) avgDailyEl.textContent = avgDaily + ' kg';

    console.log('✅ Feed stats loaded:', { totalKg, todayConsumption, totalCost, avgDaily });
}

// ============================================
// COMPUTE FEED AMOUNT
// ============================================
function computeFeedAmount() {
    var bags = parseInt(document.getElementById('feedBags').value) || 0;
    var size = parseInt(document.getElementById('feedBagSize').value) || 0;
    var total = bags * size;
    var el = document.getElementById('computedFeedAmount');
    if (el) el.textContent = total + ' kg';
}

// ============================================
// COMPUTE STOCK TOTALS
// ============================================
function computeStockTotals() {
    var bags = parseInt(document.getElementById('stockBags').value) || 0;
    var size = parseInt(document.getElementById('stockBagSize').value) || 0;
    var cost = parseFloat(document.getElementById('stockCost').value) || 0;

    var totalKgEl = document.getElementById('computedTotalKg');
    if (totalKgEl) totalKgEl.textContent = (bags * size) + ' kg';

    var totalCostEl = document.getElementById('computedTotalCost');
    if (totalCostEl) totalCostEl.textContent = 'R' + (bags * cost).toFixed(2);
}

// ============================================
// RECORD FEED CONSUMPTION
// ============================================
function recordFeedConsumption() {
    console.log('📝 Recording feed consumption...');

    var feedType = document.getElementById('feedTypeConsumption').value;
    var date = document.getElementById('feedDate').value;
    var bags = parseInt(document.getElementById('feedBags').value) || 0;
    var size = parseInt(document.getElementById('feedBagSize').value) || 0;
    var condition = document.getElementById('feedCondition').value.trim();

    if (!feedType || !date || bags === 0) {
        alert('⚠️ Please fill in all required fields');
        return;
    }

    var totalKg = bags * size;
    var record = {
        id: Date.now(),
        feedType: feedType,
        date: date,
        bags: bags,
        size: size,
        totalKg: totalKg,
        condition: condition || 'Normal',
        recordedAt: new Date().toISOString()
    };

    // Save consumption record
    var consumption = DB.get('feedConsumption') || [];
    consumption.unshift(record);
    DB.set('feedConsumption', consumption);
    console.log('✅ Consumption saved:', record);

    // Update feed stock (deduct from inventory)
    var feed = DB.getAll('feed');
    var existing = feed.find(function (f) { return f.feedType === feedType; });
    if (existing) {
        var newQuantity = Math.max(0, (existing.quantityKg || 0) - totalKg);
        DB.update('feed', existing.id, {
            feedType: feedType,
            quantityKg: newQuantity,
            lastUpdated: new Date().toISOString()
        });
        console.log('✅ Feed stock updated:', { feedType, newQuantity });
    }

    showFeedToast('✅ Feed consumption recorded: ' + totalKg + 'kg of ' + feedType);

    // Reset form
    document.getElementById('feedConsumptionForm').reset();
    document.getElementById('feedDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('computedFeedAmount').textContent = '0 kg';

    loadFeedStats();
    loadFeedHistory();
}

// ============================================
// RECORD FEED STOCK
// ============================================
function recordFeedStock() {
    console.log('📝 Recording feed stock...');

    var feedType = document.getElementById('stockFeedType').value;
    var date = document.getElementById('stockDate').value;
    var bags = parseInt(document.getElementById('stockBags').value) || 0;
    var size = parseInt(document.getElementById('stockBagSize').value) || 0;
    var cost = parseFloat(document.getElementById('stockCost').value) || 0;
    var supplier = document.getElementById('stockSupplier') ? document.getElementById('stockSupplier').value.trim() : 'AgriFeed Co.';

    if (!feedType || !date || bags === 0) {
        alert('⚠️ Please fill in all required fields');
        return;
    }

    var totalKg = bags * size;
    var totalCost = bags * cost;

    // Save stock record
    var stockRecords = DB.get('feedStockRecords') || [];
    stockRecords.unshift({
        id: Date.now(),
        feedType: feedType,
        date: date,
        bags: bags,
        size: size,
        totalKg: totalKg,
        totalCost: totalCost,
        supplier: supplier,
        recordedAt: new Date().toISOString()
    });
    DB.set('feedStockRecords', stockRecords);
    console.log('✅ Stock record saved:', { feedType, totalKg, totalCost });

    // Update feed stock (add to inventory)
    var feed = DB.getAll('feed');
    var existing = feed.find(function (f) { return f.feedType === feedType; });

    if (existing) {
        DB.update('feed', existing.id, {
            feedType: feedType,
            quantityKg: (existing.quantityKg || 0) + totalKg,
            lastUpdated: new Date().toISOString()
        });
    } else {
        DB.add('feed', {
            feedType: feedType,
            quantityKg: totalKg,
            lastUpdated: new Date().toISOString()
        });
    }
    console.log('✅ Feed stock updated:', { feedType, totalKg });

    showFeedToast('✅ Feed stock recorded: ' + totalKg + 'kg of ' + feedType + ' (R' + totalCost.toFixed(2) + ')');

    // Reset form
    document.getElementById('feedStockForm').reset();
    document.getElementById('stockDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('computedTotalKg').textContent = '0 kg';
    document.getElementById('computedTotalCost').textContent = 'R0.00';

    loadFeedStats();
    loadFeedHistory();
}

// ============================================
// LOAD FEED HISTORY - FIXED
// ============================================
function loadFeedHistory() {
    console.log('📊 Loading feed history...');
    var container = document.getElementById('feedHistoryContainer');
    if (!container) {
        console.error('❌ feedHistoryContainer not found!');
        return;
    }

    var consumption = DB.get('feedConsumption') || [];
    var stockRecords = DB.get('feedStockRecords') || [];

    var allRecords = [];

    consumption.forEach(function (r) {
        allRecords.push({
            type: 'consumption',
            date: r.date,
            feedType: r.feedType,
            details: r.totalKg + 'kg consumed (' + r.bags + ' bags)',
            condition: r.condition || 'Normal',
            amount: r.totalKg,
            recordedAt: r.recordedAt
        });
    });

    stockRecords.forEach(function (r) {
        allRecords.push({
            type: 'stock',
            date: r.date,
            feedType: r.feedType,
            details: r.totalKg + 'kg added (' + r.bags + ' bags) - R' + r.totalCost.toFixed(2),
            condition: 'Stock arrived',
            amount: r.totalKg,
            recordedAt: r.recordedAt
        });
    });

    var totalRecordsEl = document.getElementById('totalFeedRecords');
    if (totalRecordsEl) {
        totalRecordsEl.textContent = allRecords.length;
    }

    if (allRecords.length === 0) {
        container.innerHTML =
            '<div class="empty-state">' +
            '<span class="empty-icon">📊</span>' +
            '<p>No feed records yet</p>' +
            '<span class="empty-sub">Record consumption or stock</span>' +
            '</div>';
        console.log('⚠️ No feed records found');
        return;
    }

    allRecords.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    var html = '';
    var displayCount = Math.min(allRecords.length, 20);

    for (var i = 0; i < displayCount; i++) {
        var r = allRecords[i];
        var icon = r.type === 'consumption' ? '📉' : '📈';
        var color = r.type === 'consumption' ? '#DC3545' : '#28A745';
        var typeLabel = r.type === 'consumption' ? 'CONSUMPTION' : 'STOCK';

        html += '<div class="feed-history-card" style="border-left: 4px solid ' + color + ';">' +
            '<div class="feed-history-left">' +
            '<div class="feed-history-type">' + icon + ' ' + r.feedType + '</div>' +
            '<div class="feed-history-details">' + r.details + '</div>' +
            '<div class="feed-history-date">' + formatDate(r.date) + '</div>' +
            '</div>' +
            '<div class="feed-history-right">' +
            '<div class="feed-history-amount">' + r.amount + ' kg</div>' +
            '<div class="feed-history-status">' + r.condition + '</div>' +
            '</div>' +
            '</div>';
    }

    container.innerHTML = html;
    console.log('✅ Feed history loaded:', allRecords.length, 'records');
}

// ============================================
// TOAST NOTIFICATION
// ============================================
function showFeedToast(message) {
    var existing = document.querySelectorAll('.toast');
    existing.forEach(function (t) { t.remove(); });

    var toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.textContent = message;
    toast.style.cssText =
        'position: fixed; top: 20px; right: 20px; padding: 14px 24px; ' +
        'background: #28A745; color: white; border-radius: 8px; ' +
        'box-shadow: 0 4px 20px rgba(0,0,0,0.15); z-index: 2000; ' +
        'animation: slideIn 0.3s ease; font-family: Inter, sans-serif; ' +
        'font-size: 14px; font-weight: 500;';

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
}