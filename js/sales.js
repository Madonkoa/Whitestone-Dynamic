// sales.js - Complete sales management for eggs and chickens

document.addEventListener('DOMContentLoaded', function () {
    loadSalesStats();
    loadAllSalesHistory();

    document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('chickenSaleDate').value = new Date().toISOString().split('T')[0];

    loadPricingIntoForms();

    document.getElementById('eggSalesForm').addEventListener('submit', function (e) {
        e.preventDefault();
        recordEggSale();
    });

    document.getElementById('chickenSalesForm').addEventListener('submit', function (e) {
        e.preventDefault();
        recordChickenSale();
    });

    document.querySelectorAll('.sales-tabs .tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.sales-tabs .tab-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(function (tc) {
                tc.classList.remove('active');
            });
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');

            if (this.dataset.tab === 'history') {
                loadAllSalesHistory();
            }
        });
    });

    document.getElementById('crates').addEventListener('input', calculateEggTotal);
    document.getElementById('pieces').addEventListener('input', calculateEggTotal);
    document.getElementById('pricePerCrate').addEventListener('input', calculateEggTotal);

    document.getElementById('chickenQuantity').addEventListener('input', calculateChickenTotal);
    document.getElementById('chickenPrice').addEventListener('input', calculateChickenTotal);
});

function loadPricingIntoForms() {
    var pricing = DB.get('pricing');
    if (pricing) {
        document.getElementById('pricePerCrate').value = pricing.eggTray || 120;
        document.getElementById('chickenPrice').value = pricing.dressedChicken || 90;
    }
}

function calculateEggTotal() {
    var crates = parseInt(document.getElementById('crates').value) || 0;
    var pieces = parseInt(document.getElementById('pieces').value) || 0;
    var price = parseFloat(document.getElementById('pricePerCrate').value) || 0;

    var totalEggs = (crates * 30) + pieces;
    var total = crates * price;

    document.getElementById('totalEggsSale').textContent = totalEggs;
    document.getElementById('grandTotal').textContent = 'R' + total.toFixed(2);
}

function calculateChickenTotal() {
    var quantity = parseInt(document.getElementById('chickenQuantity').value) || 0;
    var price = parseFloat(document.getElementById('chickenPrice').value) || 0;

    var total = quantity * price;

    document.getElementById('totalChickensSale').textContent = quantity;
    document.getElementById('chickenGrandTotal').textContent = 'R' + total.toFixed(2);
}

function recordEggSale() {
    var buyerName = document.getElementById('buyerName').value.trim();
    var saleDate = document.getElementById('saleDate').value;
    var eggSize = document.getElementById('eggSize').value;
    var crates = parseInt(document.getElementById('crates').value) || 0;
    var pieces = parseInt(document.getElementById('pieces').value) || 0;
    var pricePerCrate = parseFloat(document.getElementById('pricePerCrate').value) || 0;
    var notes = document.getElementById('saleNotes').value.trim();

    if (!buyerName || !saleDate || crates === 0) {
        alert('Please fill in all required fields');
        return;
    }

    var totalEggs = (crates * 30) + pieces;
    var total = crates * pricePerCrate;

    var sale = {
        id: Date.now(),
        type: 'egg',
        buyerName: buyerName,
        saleDate: saleDate,
        eggSize: eggSize,
        crates: crates,
        pieces: pieces,
        pricePerCrate: pricePerCrate,
        totalEggs: totalEggs,
        total: total,
        notes: notes,
        recordedAt: new Date().toISOString()
    };

    DB.add('sales', sale);

    // Update customer
    updateCustomerPurchases(buyerName, total);

    // Update stock
    var stock = DB.getAll('stock');
    var eggStock = stock.find(function (s) { return s.itemType === 'egg'; });
    if (eggStock) {
        var newQuantity = Math.max(0, (eggStock.quantity || 0) - Math.ceil(totalEggs / 30));
        DB.update('stock', eggStock.id, {
            itemType: 'egg',
            quantity: newQuantity,
            unit: 'tray',
            price: eggStock.price,
            lastUpdated: new Date().toISOString()
        });
    }

    alert('Egg sale recorded: ' + totalEggs + ' eggs for R' + total.toFixed(2));
    document.getElementById('eggSalesForm').reset();
    document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('totalEggsSale').textContent = '0';
    document.getElementById('grandTotal').textContent = 'R0.00';
    loadPricingIntoForms();
    loadSalesStats();
    loadAllSalesHistory();
}

function recordChickenSale() {
    var buyer = document.getElementById('chickenBuyer').value.trim();
    var saleDate = document.getElementById('chickenSaleDate').value;
    var type = document.getElementById('chickenType').value;
    var quantity = parseInt(document.getElementById('chickenQuantity').value) || 0;
    var price = parseFloat(document.getElementById('chickenPrice').value) || 0;
    var status = document.getElementById('chickenStatus').value;
    var notes = document.getElementById('chickenNotes').value.trim();

    if (!buyer || !saleDate || quantity === 0) {
        alert('Please fill in all required fields');
        return;
    }

    var total = quantity * price;

    var chickens = DB.getAll('chickens') || [];
    var available = chickens.filter(function (c) { return c.type === type && !c.sold; });
    var totalAvailable = available.reduce(function (sum, c) { return sum + c.quantity; }, 0);

    if (quantity > totalAvailable) {
        alert('Not enough ' + type + 's available. Available: ' + totalAvailable);
        return;
    }

    var sale = {
        id: Date.now(),
        type: 'chicken',
        buyer: buyer,
        saleDate: saleDate,
        chickenType: type,
        quantity: quantity,
        price: price,
        status: status,
        total: total,
        notes: notes,
        recordedAt: new Date().toISOString()
    };

    DB.add('chickenSales', sale);

    // Update customer
    updateCustomerPurchases(buyer, total);

    var remaining = quantity;
    for (var i = 0; i < available.length && remaining > 0; i++) {
        var chicken = available[i];
        var sold = Math.min(chicken.quantity, remaining);
        var newQuantity = chicken.quantity - sold;
        if (newQuantity === 0) {
            DB.update('chickens', chicken.id, { quantity: 0, sold: true });
        } else {
            DB.update('chickens', chicken.id, { quantity: newQuantity });
        }
        remaining -= sold;
    }

    alert('Chicken sale recorded: ' + quantity + ' ' + type + '(s) for R' + total.toFixed(2));
    document.getElementById('chickenSalesForm').reset();
    document.getElementById('chickenSaleDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('totalChickensSale').textContent = '0';
    document.getElementById('chickenGrandTotal').textContent = 'R0.00';
    loadPricingIntoForms();
    loadSalesStats();
    loadAllSalesHistory();
}

function updateCustomerPurchases(name, amount) {
    var customers = DB.getAll('customers');
    var customer = customers.find(function (c) { return c.name === name; });
    if (customer) {
        var totalPurchases = (customer.totalPurchases || 0) + amount;
        DB.update('customers', customer.id, {
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            type: customer.type,
            totalPurchases: totalPurchases,
            lastPurchase: new Date().toISOString()
        });
    }
}

function loadSalesStats() {
    var eggSales = DB.getAll('sales') || [];
    var chickenSales = DB.getAll('chickenSales') || [];

    var totalEggsSold = eggSales.reduce(function (sum, s) { return sum + (s.totalEggs || 0); }, 0);
    document.getElementById('totalEggSales').textContent = totalEggsSold;

    var totalChickensSold = chickenSales.reduce(function (sum, s) { return sum + (s.quantity || 0); }, 0);
    document.getElementById('totalChickenSales').textContent = totalChickensSold;

    var eggRevenue = eggSales.reduce(function (sum, s) { return sum + (s.total || 0); }, 0);
    var chickenRevenue = chickenSales.reduce(function (sum, s) { return sum + (s.total || 0); }, 0);
    var totalRevenue = eggRevenue + chickenRevenue;
    document.getElementById('totalRevenue').textContent = 'R' + totalRevenue.toFixed(2);

    var now = new Date();
    var month = now.getMonth();
    var year = now.getFullYear();
    var monthlyEgg = eggSales.filter(function (s) {
        var d = new Date(s.saleDate);
        return d.getMonth() === month && d.getFullYear() === year;
    }).reduce(function (sum, s) { return sum + (s.total || 0); }, 0);

    var monthlyChicken = chickenSales.filter(function (s) {
        var d = new Date(s.saleDate);
        return d.getMonth() === month && d.getFullYear() === year;
    }).reduce(function (sum, s) { return sum + (s.total || 0); }, 0);

    document.getElementById('monthlyRevenue').textContent = 'R' + (monthlyEgg + monthlyChicken).toFixed(2);
}

function loadAllSalesHistory() {
    var container = document.getElementById('allSalesContainer');
    var eggSales = DB.getAll('sales') || [];
    var chickenSales = DB.getAll('chickenSales') || [];

    var totalSales = eggSales.length + chickenSales.length;
    document.getElementById('totalSalesCount').textContent = totalSales;

    if (totalSales === 0) {
        container.innerHTML =
            '<div class="empty-state">' +
            '<span class="empty-icon">📊</span>' +
            '<p>No sales recorded yet</p>' +
            '<span class="empty-sub">Start selling eggs or chickens</span>' +
            '</div>';
        return;
    }

    var allSales = [];

    eggSales.forEach(function (s) {
        allSales.push({
            type: 'egg',
            date: s.saleDate,
            buyer: s.buyerName,
            item: s.eggSize + ' eggs',
            quantity: s.totalEggs + ' eggs',
            total: s.total,
            notes: s.notes || '',
            recordedAt: s.recordedAt
        });
    });

    chickenSales.forEach(function (s) {
        allSales.push({
            type: 'chicken',
            date: s.saleDate,
            buyer: s.buyer,
            item: s.chickenType + ' (' + s.status + ')',
            quantity: s.quantity + ' chickens',
            total: s.total,
            notes: s.notes || '',
            recordedAt: s.recordedAt
        });
    });

    allSales.sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    var html = '';
    for (var i = 0; i < allSales.length; i++) {
        var s = allSales[i];
        var typeIcon = s.type === 'egg' ? '🥚' : '🐔';
        var typeClass = s.type === 'egg' ? 'egg-type' : 'chicken-type';

        html += '<div class="history-card" style="border-left: 4px solid ' + (s.type === 'egg' ? 'rgba(201,168,76,0.3)' : 'rgba(10,22,40,0.3)') + ';">' +
            '<div class="history-card-header">' +
            '<span class="history-type-badge ' + typeClass + '">' + typeIcon + ' ' + s.type.toUpperCase() + ' SALE</span>' +
            '<span class="history-date">' + formatDate(s.date) + '</span>' +
            '</div>' +
            '<div class="history-card-body">' +
            '<div><strong>' + s.buyer + '</strong> - ' + s.item + '</div>' +
            '<div>' + s.quantity + '</div>' +
            '<div style="font-weight: 700; color: var(--gold-dark);">R' + s.total.toFixed(2) + '</div>' +
            (s.notes ? '<div style="font-size: 12px; color: var(--text-muted);">📝 ' + s.notes + '</div>' : '') +
            '</div>' +
            '</div>';
    }

    container.innerHTML = html;
}