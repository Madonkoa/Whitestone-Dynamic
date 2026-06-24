// eggs.js - Complete egg production with batch management

document.addEventListener('DOMContentLoaded', function () {
    loadProductionStats();
    loadRecentProduction();
    loadBatches();

    document.getElementById('prodDate').value = new Date().toISOString().split('T')[0];

    document.querySelectorAll('.mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.mode-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');
            updateEggSizeVisibility(this.dataset.mode);
        });
    });

    ['smallEggs', 'mediumEggs', 'largeEggs', 'xlEggs'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', calculateTotalEggs);
    });

    document.getElementById('productionForm').addEventListener('submit', function (e) {
        e.preventDefault();
        recordProduction();
    });

    document.getElementById('addBatchBtn').addEventListener('click', function () {
        openBatchModal();
    });

    document.querySelector('#batchModal .close').addEventListener('click', function () {
        closeBatchModal();
    });

    window.addEventListener('click', function (e) {
        var modal = document.getElementById('batchModal');
        if (e.target === modal) closeBatchModal();
    });

    document.getElementById('batchForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveBatch();
    });
});

function updateEggSizeVisibility(mode) {
    var grid = document.querySelector('.egg-sizes-grid');
    if (mode === 'total') {
        grid.style.display = 'none';
        document.querySelector('.total-display').style.display = 'none';
    } else {
        grid.style.display = 'grid';
        document.querySelector('.total-display').style.display = 'block';
    }
}

function calculateTotalEggs() {
    var small = parseInt(document.getElementById('smallEggs').value) || 0;
    var medium = parseInt(document.getElementById('mediumEggs').value) || 0;
    var large = parseInt(document.getElementById('largeEggs').value) || 0;
    var xl = parseInt(document.getElementById('xlEggs').value) || 0;
    var total = small + medium + large + xl;
    document.getElementById('totalEggsDisplay').textContent = total + ' eggs';
}

function loadProductionStats() {
    var eggs = DB.getAll('eggs');
    var today = new Date().toDateString();
    var todayRecords = eggs.filter(function (e) { return new Date(e.date).toDateString() === today; });

    var todayTotal = todayRecords.reduce(function (sum, r) { return sum + (r.total || 0); }, 0);
    document.getElementById('todayProduction').textContent = todayTotal;

    var last7Days = eggs.filter(function (e) {
        var d = new Date(e.date);
        var weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return d >= weekAgo;
    });

    var avg = last7Days.length > 0 ? Math.round(last7Days.reduce(function (sum, r) { return sum + (r.total || 0); }, 0) / last7Days.length) : 0;
    document.getElementById('periodAverage').textContent = avg;
}

function recordProduction() {
    var date = document.getElementById('prodDate').value;
    var notes = document.getElementById('prodNotes').value.trim();
    var batchId = document.getElementById('batchSelect').value;
    var mode = document.querySelector('.mode-btn.active').dataset.mode;

    var small = parseInt(document.getElementById('smallEggs').value) || 0;
    var medium = parseInt(document.getElementById('mediumEggs').value) || 0;
    var large = parseInt(document.getElementById('largeEggs').value) || 0;
    var xl = parseInt(document.getElementById('xlEggs').value) || 0;
    var total = small + medium + large + xl;

    if (total === 0) {
        alert('Please enter the number of eggs produced');
        return;
    }

    var record = {
        date: date,
        batchId: batchId,
        small: small,
        medium: medium,
        large: large,
        xl: xl,
        total: total,
        notes: notes || 'Normal production',
        recordedAt: new Date().toISOString()
    };

    DB.add('eggs', record);

    var stock = DB.getAll('stock');
    var eggStock = stock.find(function (s) { return s.itemType === 'egg'; });
    if (eggStock) {
        DB.update('stock', eggStock.id, {
            itemType: 'egg',
            quantity: (eggStock.quantity || 0) + total,
            unit: eggStock.unit,
            price: eggStock.price,
            lastUpdated: new Date().toISOString()
        });
    }

    alert('Production recorded: ' + total + ' eggs!');
    document.getElementById('productionForm').reset();
    document.getElementById('prodDate').value = new Date().toISOString().split('T')[0];
    document.getElementById('totalEggsDisplay').textContent = '0 eggs';
    document.querySelectorAll('.egg-sizes-grid input').forEach(function (input) { input.value = 0; });

    loadProductionStats();
    loadRecentProduction();
}

function loadRecentProduction() {
    var container = document.getElementById('recentProduction');
    var eggs = DB.getAll('eggs');
    var recent = eggs.sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 5);

    if (recent.length === 0) {
        container.innerHTML = '<p style="color: #6a8a9c;">No production records found</p>';
        return;
    }

    container.innerHTML = recent.map(function (record) {
        return '<div class="production-record">' +
            '<div class="production-header">' +
            '<strong>' + formatDate(record.date) + '</strong>' +
            '<span class="production-total">' + record.total + ' eggs</span>' +
            '</div>' +
            '<div class="production-details">' +
            (record.small > 0 ? '🥚 Small: ' + record.small + ' ' : '') +
            (record.medium > 0 ? '🥚 Medium: ' + record.medium + ' ' : '') +
            (record.large > 0 ? '🥚 Large: ' + record.large + ' ' : '') +
            (record.xl > 0 ? '🥚 XL: ' + record.xl : '') +
            '</div>' +
            (record.notes ? '<div class="production-notes">📝 ' + record.notes + '</div>' : '') +
            '</div>';
    }).join('');
}

function loadBatches() {
    var batches = DB.getAll('batches') || [];
    var select = document.getElementById('batchSelect');
    select.innerHTML = '';

    if (batches.length === 0) {
        select.innerHTML = '<option value="">No batches available</option>';
        return;
    }

    batches.forEach(function (batch) {
        var option = document.createElement('option');
        option.value = batch.id;
        option.textContent = batch.batchNumber + ' - ' + batch.type + ' (' + batch.status + ')';
        select.appendChild(option);
    });
}

function openBatchModal() {
    document.getElementById('batchModal').style.display = 'block';
    document.getElementById('batchForm').reset();
    document.getElementById('editBatchId').value = '';
}

function closeBatchModal() {
    document.getElementById('batchModal').style.display = 'none';
}

function saveBatch() {
    var id = document.getElementById('editBatchId').value;
    var batchNumber = document.getElementById('batchNumber').value.trim();
    var type = document.getElementById('batchType').value;
    var quantity = parseInt(document.getElementById('batchQuantity').value);
    var age = parseInt(document.getElementById('batchAge').value);
    var status = document.getElementById('batchStatus').value;
    var startDate = document.getElementById('batchStartDate').value;
    var notes = document.getElementById('batchNotes').value.trim();

    if (!batchNumber || !quantity || isNaN(age) || !startDate) {
        alert('Please fill in all required fields');
        return;
    }

    var batchData = {
        batchNumber: batchNumber,
        type: type,
        quantity: quantity,
        age: age,
        status: status,
        startDate: startDate,
        notes: notes || '',
        createdAt: new Date().toISOString()
    };

    if (id) {
        DB.update('batches', parseInt(id), batchData);
        alert('Batch updated successfully!');
    } else {
        DB.add('batches', batchData);
        alert('Batch added successfully!');
    }

    closeBatchModal();
    loadBatches();
}