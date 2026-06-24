// chickens.js - Complete chicken management

document.addEventListener('DOMContentLoaded', function () {
    loadChickens();
    loadChickenStats();

    document.getElementById('addChickenBtn').addEventListener('click', function () {
        openChickenModal();
    });

    document.querySelector('#chickenModal .close').addEventListener('click', function () {
        closeChickenModal();
    });

    window.addEventListener('click', function (e) {
        var modal = document.getElementById('chickenModal');
        if (e.target === modal) closeChickenModal();
    });

    document.getElementById('chickenForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveChicken();
    });
});

function loadChickenStats() {
    var chickens = DB.getAll('chickens') || [];
    var broilers = chickens.filter(function (c) { return c.type === 'broiler' && !c.sold; });
    var layers = chickens.filter(function (c) { return c.type === 'layer' && !c.sold; });
    var sold = chickens.filter(function (c) { return c.sold; });
    var available = chickens.filter(function (c) { return !c.sold; });

    document.getElementById('chickenBroilers').textContent = broilers.reduce(function (s, c) { return s + c.quantity; }, 0);
    document.getElementById('chickenLayers').textContent = layers.reduce(function (s, c) { return s + c.quantity; }, 0);
    document.getElementById('chickenSold').textContent = sold.reduce(function (s, c) { return s + c.quantity; }, 0);
    document.getElementById('chickenAvailable').textContent = available.reduce(function (s, c) { return s + c.quantity; }, 0);
}

function loadChickens() {
    var chickens = DB.getAll('chickens') || [];
    var tbody = document.getElementById('chickenTableBody');
    tbody.innerHTML = '';

    if (chickens.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #888;">No chickens found</td></tr>';
        return;
    }

    chickens.forEach(function (c) {
        var tr = document.createElement('tr');
        var statusText = c.sold ? 'Sold' : (c.readyForSale ? 'Ready' : 'Growing');
        var statusClass = c.sold ? 'status-poor' : (c.readyForSale ? 'status-good' : 'status-fair');
        tr.innerHTML =
            '<td><strong>' + (c.batch || 'N/A') + '</strong></td>' +
            '<td>' + c.type.charAt(0).toUpperCase() + c.type.slice(1) + '</td>' +
            '<td>' + c.quantity + '</td>' +
            '<td>' + (c.age || 0) + ' weeks</td>' +
            '<td><span class="status-badge ' + getStatusClass(c.health) + '">' + (c.health || 'Good') + '</span></td>' +
            '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
            '<td>' +
            '<button onclick="editChicken(' + c.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
            '<button onclick="deleteChicken(' + c.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #DC3545;">Delete</button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

function openChickenModal(chicken) {
    chicken = chicken || null;
    var modal = document.getElementById('chickenModal');
    var title = document.getElementById('chickenModalTitle');

    if (chicken) {
        title.textContent = 'Edit Chickens';
        document.getElementById('editChickenId').value = chicken.id;
        document.getElementById('chickenBatch').value = chicken.batch || '';
        document.getElementById('chickenTypeSelect').value = chicken.type;
        document.getElementById('chickenQuantityField').value = chicken.quantity;
        document.getElementById('chickenAge').value = chicken.age || 0;
        document.getElementById('chickenHealth').value = chicken.health || 'Good';
    } else {
        title.textContent = 'Add Chickens';
        document.getElementById('chickenForm').reset();
        document.getElementById('editChickenId').value = '';
        document.getElementById('chickenHealth').value = 'Good';
    }

    modal.style.display = 'block';
}

function closeChickenModal() {
    document.getElementById('chickenModal').style.display = 'none';
}

function saveChicken() {
    var id = document.getElementById('editChickenId').value;
    var batch = document.getElementById('chickenBatch').value.trim();
    var type = document.getElementById('chickenTypeSelect').value;
    var quantity = parseInt(document.getElementById('chickenQuantityField').value);
    var age = parseFloat(document.getElementById('chickenAge').value);
    var health = document.getElementById('chickenHealth').value;

    if (!batch || !quantity || isNaN(age)) {
        alert('Please fill in all required fields');
        return;
    }

    var chickenData = {
        batch: batch,
        type: type,
        quantity: quantity,
        age: age,
        health: health,
        readyForSale: type === 'broiler' && age >= 6,
        eggProduction: type === 'layer' ? Math.round(quantity * 0.7) : 0,
        sold: false,
        addedAt: new Date().toISOString()
    };

    if (id) {
        DB.update('chickens', parseInt(id), chickenData);
        alert('Chickens updated successfully!');
    } else {
        DB.add('chickens', chickenData);
        alert('Chickens added successfully!');
    }

    closeChickenModal();
    loadChickens();
    loadChickenStats();
}

function editChicken(id) {
    var chickens = DB.getAll('chickens');
    var chicken = chickens.find(function (c) { return c.id === id; });
    if (chicken) openChickenModal(chicken);
}

function deleteChicken(id) {
    if (confirm('Are you sure you want to delete this record?')) {
        DB.delete('chickens', id);
        loadChickens();
        loadChickenStats();
        alert('Record deleted successfully!');
    }
}