document.addEventListener('DOMContentLoaded', function () {
    loadChickens();
    loadStats();

    document.getElementById('addChickenBtn').addEventListener('click', function () {
        openModal();
    });

    document.querySelector('#chickenModal .close').addEventListener('click', function () {
        closeModal();
    });

    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('chickenModal')) {
            closeModal();
        }
    });

    document.getElementById('chickenForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveChicken();
    });
});

async function loadChickens() {
    try {
        const chickens = await DB.getAll('chickens');
        const tbody = document.getElementById('chickenTableBody');
        tbody.innerHTML = '';

        if (!chickens || chickens.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No chickens found</td></tr>';
            return;
        }

        chickens.forEach(function (c) {
            const statusText = c.sold ? 'Sold' : (c.ready_for_sale ? 'Ready' : 'Growing');
            const statusClass = c.sold ? 'status-poor' : (c.ready_for_sale ? 'status-good' : 'status-fair');
            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td><strong>' + (c.batch || 'N/A') + '</strong></td>' +
                '<td>' + (c.type || 'N/A') + '</td>' +
                '<td>' + (c.quantity || 0) + '</td>' +
                '<td>' + (c.age || 0) + ' weeks</td>' +
                '<td><span class="status-badge ' + getStatusClass(c.health) + '">' + (c.health || 'Good') + '</span></td>' +
                '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                '<td>' +
                '<button onclick="editChicken(' + c.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
                '<button onclick="deleteChicken(' + c.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #dc3545;">Delete</button>' +
                '</td>';
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading chickens:', error);
    }
}

async function loadStats() {
    try {
        const chickens = await DB.getAll('chickens') || [];
        let broilers = 0, layers = 0, sold = 0, available = 0;

        chickens.forEach(function (c) {
            if (c.sold) {
                sold += c.quantity || 0;
            } else {
                available += c.quantity || 0;
                if (c.type === 'broiler') broilers += c.quantity || 0;
                else if (c.type === 'layer') layers += c.quantity || 0;
            }
        });

        document.getElementById('chickenBroilers').textContent = broilers;
        document.getElementById('chickenLayers').textContent = layers;
        document.getElementById('chickenSold').textContent = sold;
        document.getElementById('chickenAvailable').textContent = available;
    } catch (error) {
        console.error('Error loading chicken stats:', error);
    }
}

function openModal(chicken) {
    const modal = document.getElementById('chickenModal');
    const title = document.getElementById('chickenModalTitle');

    if (chicken) {
        title.textContent = 'Edit Chickens';
        document.getElementById('editChickenId').value = chicken.id;
        document.getElementById('chickenBatch').value = chicken.batch || '';
        document.getElementById('chickenTypeSelect').value = chicken.type || 'broiler';
        document.getElementById('chickenQuantityField').value = chicken.quantity || 0;
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

function closeModal() {
    document.getElementById('chickenModal').style.display = 'none';
}

async function saveChicken() {
    const id = document.getElementById('editChickenId').value;
    const batch = document.getElementById('chickenBatch').value.trim();
    const type = document.getElementById('chickenTypeSelect').value;
    const quantity = parseInt(document.getElementById('chickenQuantityField').value);
    const age = parseFloat(document.getElementById('chickenAge').value);
    const health = document.getElementById('chickenHealth').value;

    if (!batch || !quantity || isNaN(age)) {
        alert('Please fill in all fields');
        return;
    }

    const data = {
        batch, type, quantity, age, health,
        ready_for_sale: type === 'broiler' && age >= 6 ? 1 : 0,
        egg_production: type === 'layer' ? Math.round(quantity * 0.7) : 0,
        sold: 0
    };

    try {
        if (id) {
            await DB.update('chickens', parseInt(id), data);
            alert('Chickens updated!');
        } else {
            await DB.add('chickens', data);
            alert('Chickens added!');
        }
        closeModal();
        loadChickens();
        loadStats();
    } catch (error) {
        alert('Error saving chickens');
    }
}

function editChicken(id) {
    DB.getAll('chickens').then(list => {
        const c = list.find(ch => ch.id === id);
        if (c) openModal(c);
    });
}

async function deleteChicken(id) {
    if (confirm('Delete this record?')) {
        await DB.delete('chickens', id);
        loadChickens();
        loadStats();
    }
}