document.addEventListener('DOMContentLoaded', function () {
    loadEquipment();

    document.getElementById('addEquipmentBtn').addEventListener('click', function () {
        openModal();
    });

    document.querySelector('#equipmentModal .close').addEventListener('click', function () {
        closeModal();
    });

    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('equipmentModal')) {
            closeModal();
        }
    });

    document.getElementById('equipmentForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveEquipment();
    });
});

async function loadEquipment() {
    try {
        const equipment = await DB.getAll('equipment');
        const grid = document.getElementById('equipmentGrid');
        grid.innerHTML = '';

        if (!equipment || equipment.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">No equipment found</p>';
            return;
        }

        equipment.forEach(function (item) {
            const card = document.createElement('div');
            card.className = 'equipment-card';
            card.innerHTML =
                '<h3>' + item.name + '</h3>' +
                '<p><strong>Condition:</strong> <span class="status-badge ' + getStatusClass(item.condition) + '">' + (item.condition || 'Unknown') + '</span></p>' +
                '<p><strong>Purchase:</strong> ' + formatDate(item.purchase_date) + '</p>' +
                '<p><strong>Last Maintenance:</strong> ' + formatDate(item.last_maintenance) + '</p>' +
                (item.notes ? '<p><small>' + item.notes + '</small></p>' : '') +
                '<div style="margin-top: 10px;">' +
                '<button onclick="editEquipment(' + item.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
                '<button onclick="deleteEquipment(' + item.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #dc3545;">Delete</button>' +
                '</div>';
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading equipment:', error);
    }
}

function openModal(item) {
    const modal = document.getElementById('equipmentModal');
    const title = document.getElementById('equipmentModalTitle');

    if (item) {
        title.textContent = 'Edit Equipment';
        document.getElementById('editEquipmentId').value = item.id;
        document.getElementById('equipmentName').value = item.name;
        document.getElementById('equipmentCondition').value = item.condition || 'Good';
        document.getElementById('equipmentPurchase').value = item.purchase_date || '';
        document.getElementById('equipmentMaintenance').value = item.last_maintenance || '';
        document.getElementById('equipmentNotes').value = item.notes || '';
    } else {
        title.textContent = 'Add Equipment';
        document.getElementById('equipmentForm').reset();
        document.getElementById('editEquipmentId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('equipmentModal').style.display = 'none';
}

async function saveEquipment() {
    const id = document.getElementById('editEquipmentId').value;
    const name = document.getElementById('equipmentName').value.trim();
    const condition = document.getElementById('equipmentCondition').value;
    const purchase_date = document.getElementById('equipmentPurchase').value;
    const last_maintenance = document.getElementById('equipmentMaintenance').value;
    const notes = document.getElementById('equipmentNotes').value.trim();

    if (!name || !condition) {
        alert('Please fill in all fields');
        return;
    }

    const data = { name, condition, purchase_date: purchase_date || '', last_maintenance: last_maintenance || '', notes: notes || '' };

    try {
        if (id) {
            await DB.update('equipment', parseInt(id), data);
            alert('Equipment updated!');
        } else {
            await DB.add('equipment', data);
            alert('Equipment added!');
        }
        closeModal();
        loadEquipment();
    } catch (error) {
        alert('Error saving equipment');
    }
}

function editEquipment(id) {
    DB.getAll('equipment').then(list => {
        const item = list.find(e => e.id === id);
        if (item) openModal(item);
    });
}

async function deleteEquipment(id) {
    if (confirm('Delete this equipment?')) {
        await DB.delete('equipment', id);
        loadEquipment();
    }
}