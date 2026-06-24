// batches.js - Complete batch management

document.addEventListener('DOMContentLoaded', function () {
    loadBatchesTable();
    loadBatchStats();

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

function loadBatchStats() {
    var batches = DB.getAll('batches') || [];
    document.getElementById('totalBatches').textContent = batches.length;

    var active = batches.filter(function (b) { return b.status === 'Active'; });
    document.getElementById('activeBatches').textContent = active.length;

    var completed = batches.filter(function (b) { return b.status === 'Completed'; });
    document.getElementById('completedBatches').textContent = completed.length;

    var totalBirds = batches.reduce(function (sum, b) { return sum + (b.quantity || 0); }, 0);
    document.getElementById('totalBatchBirds').textContent = totalBirds;
}

function loadBatchesTable() {
    var batches = DB.getAll('batches') || [];
    var tbody = document.getElementById('batchTableBody');
    tbody.innerHTML = '';

    if (batches.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">No batches found</td></tr>';
        return;
    }

    batches.sort(function (a, b) { return new Date(b.startDate) - new Date(a.startDate); });

    batches.forEach(function (b) {
        var tr = document.createElement('tr');
        var statusClass = b.status === 'Active' ? 'status-good' : b.status === 'Completed' ? 'status-fair' : '';
        tr.innerHTML =
            '<td><strong>' + b.batchNumber + '</strong></td>' +
            '<td>' + b.type + '</td>' +
            '<td>' + b.quantity + '</td>' +
            '<td>' + b.age + ' weeks</td>' +
            '<td><span class="status-badge ' + statusClass + '">' + b.status + '</span></td>' +
            '<td>' + formatDate(b.startDate) + '</td>' +
            '<td>' +
            '<button onclick="editBatch(' + b.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
            '<button onclick="deleteBatch(' + b.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #DC3545;">Delete</button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

function openBatchModal(batch) {
    batch = batch || null;
    var modal = document.getElementById('batchModal');
    var title = document.getElementById('batchModalTitle');

    if (batch) {
        title.textContent = 'Edit Batch';
        document.getElementById('editBatchId').value = batch.id;
        document.getElementById('batchNumber').value = batch.batchNumber;
        document.getElementById('batchType').value = batch.type;
        document.getElementById('batchQuantity').value = batch.quantity;
        document.getElementById('batchAge').value = batch.age;
        document.getElementById('batchStatus').value = batch.status;
        document.getElementById('batchStartDate').value = batch.startDate;
        document.getElementById('batchNotes').value = batch.notes || '';
    } else {
        title.textContent = 'Add Batch';
        document.getElementById('batchForm').reset();
        document.getElementById('editBatchId').value = '';
        document.getElementById('batchStatus').value = 'Active';
        document.getElementById('batchStartDate').value = new Date().toISOString().split('T')[0];
    }

    modal.style.display = 'block';
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
    loadBatchesTable();
    loadBatchStats();
}

function editBatch(id) {
    var batches = DB.getAll('batches');
    var batch = batches.find(function (b) { return b.id === id; });
    if (batch) openBatchModal(batch);
}

function deleteBatch(id) {
    if (confirm('Are you sure you want to delete this batch?')) {
        DB.delete('batches', id);
        loadBatchesTable();
        loadBatchStats();
        alert('Batch deleted successfully!');
    }
}