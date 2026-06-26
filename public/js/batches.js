document.addEventListener('DOMContentLoaded', function () {
    loadBatches();
    loadStats();

    document.getElementById('addBatchBtn').addEventListener('click', function () {
        openModal();
    });

    document.querySelector('#batchModal .close').addEventListener('click', function () {
        closeModal();
    });

    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('batchModal')) {
            closeModal();
        }
    });

    document.getElementById('batchForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveBatch();
    });
});

async function loadBatches() {
    try {
        const batches = await DB.getAll('batches');
        const tbody = document.getElementById('batchTableBody');
        tbody.innerHTML = '';

        if (!batches || batches.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No batches found</td></tr>';
            return;
        }

        batches.sort(function (a, b) { return new Date(b.start_date) - new Date(a.start_date); });

        batches.forEach(function (b) {
            const statusClass = b.status === 'Active' ? 'status-good' : b.status === 'Completed' ? 'status-fair' : '';
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td><strong>' + b.batch_number + '</strong></td>' +
                '<td>' + b.type + '</td>' +
                '<td>' + b.quantity + '</td>' +
                '<td>' + b.age + ' weeks</td>' +
                '<td><span class="status-badge ' + statusClass + '">' + b.status + '</span></td>' +
                '<td>' + formatDate(b.start_date) + '</td>' +
                '<td>' +
                '<button onclick="editBatch(' + b.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
                '<button onclick="deleteBatch(' + b.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #dc3545;">Delete</button>' +
                '</td>';
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading batches:', error);
    }
}

async function loadStats() {
    try {
        const batches = await DB.getAll('batches') || [];
        let total = 0, active = 0, completed = 0, birds = 0;

        batches.forEach(function (b) {
            total++;
            if (b.status === 'Active') active++;
            else if (b.status === 'Completed') completed++;
            birds += b.quantity || 0;
        });

        document.getElementById('totalBatches').textContent = total;
        document.getElementById('activeBatches').textContent = active;
        document.getElementById('completedBatches').textContent = completed;
        document.getElementById('totalBatchBirds').textContent = birds;
    } catch (error) {
        console.error('Error loading batch stats:', error);
    }
}

function openModal(batch) {
    const modal = document.getElementById('batchModal');
    const title = document.getElementById('batchModalTitle');

    if (batch) {
        title.textContent = 'Edit Batch';
        document.getElementById('editBatchId').value = batch.id;
        document.getElementById('batchNumber').value = batch.batch_number;
        document.getElementById('batchType').value = batch.type;
        document.getElementById('batchQuantity').value = batch.quantity;
        document.getElementById('batchAge').value = batch.age;
        document.getElementById('batchStatus').value = batch.status;
        document.getElementById('batchStartDate').value = batch.start_date;
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

function closeModal() {
    document.getElementById('batchModal').style.display = 'none';
}

async function saveBatch() {
    const id = document.getElementById('editBatchId').value;
    const batch_number = document.getElementById('batchNumber').value.trim();
    const type = document.getElementById('batchType').value;
    const quantity = parseInt(document.getElementById('batchQuantity').value);
    const age = parseInt(document.getElementById('batchAge').value);
    const status = document.getElementById('batchStatus').value;
    const start_date = document.getElementById('batchStartDate').value;
    const notes = document.getElementById('batchNotes').value.trim();

    if (!batch_number || !quantity || isNaN(age) || !start_date) {
        alert('Please fill in all fields');
        return;
    }

    const data = { batch_number, type, quantity, age, status, start_date, notes: notes || '' };

    try {
        if (id) {
            await DB.update('batches', parseInt(id), data);
            alert('Batch updated!');
        } else {
            await DB.add('batches', data);
            alert('Batch added!');
        }
        closeModal();
        loadBatches();
        loadStats();
    } catch (error) {
        alert('Error saving batch');
    }
}

function editBatch(id) {
    DB.getAll('batches').then(list => {
        const b = list.find(bat => bat.id === id);
        if (b) openModal(b);
    });
}

async function deleteBatch(id) {
    if (confirm('Delete this batch?')) {
        await DB.delete('batches', id);
        loadBatches();
        loadStats();
    }
}