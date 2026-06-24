// equipment.js - Equipment management

document.addEventListener('DOMContentLoaded', function() {
    loadEquipment();
    
    document.getElementById('addEquipmentBtn').addEventListener('click', function() {
        openEquipmentModal();
    });
    
    document.querySelector('#equipmentModal .close').addEventListener('click', function() {
        closeEquipmentModal();
    });
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('equipmentModal');
        if (e.target === modal) closeEquipmentModal();
    });
    
    document.getElementById('equipmentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEquipment();
    });
});

function loadEquipment() {
    const equipment = DB.getAll('equipment');
    const grid = document.getElementById('equipmentGrid');
    grid.innerHTML = '';
    
    if (equipment.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6a8a9c;">No equipment records found</p>';
        return;
    }
    
    equipment.forEach(item => {
        const card = document.createElement('div');
        card.className = 'equipment-card';
        card.innerHTML = `
            <h3>${item.name}</h3>
            <p><strong>Condition:</strong> 
                <span class="status-badge ${getStatusClass(item.condition)}">
                    ${item.condition || 'Unknown'}
                </span>
            </p>
            <p><strong>Purchase:</strong> ${formatDate(item.purchaseDate)}</p>
            <p><strong>Last Maintenance:</strong> ${formatDate(item.lastMaintenance)}</p>
            ${item.notes ? `<p><small>Notes: ${item.notes}</small></p>` : ''}
            ${hasAccess('admin,manager,owner') ? `
                <button onclick="editEquipment(${item.id})" class="primary-btn" style="padding: 5px 10px; font-size: 12px; margin-top: 10px;">Edit</button>
                <button onclick="deleteEquipment(${item.id})" class="primary-btn" style="padding: 5px 10px; font-size: 12px; background: #dc3545; margin-top: 10px; margin-left: 5px;">Delete</button>
            ` : ''}
        `;
        grid.appendChild(card);
    });
}

function openEquipmentModal(equipmentItem = null) {
    const modal = document.getElementById('equipmentModal');
    const title = document.getElementById('equipmentModalTitle');
    
    if (equipmentItem) {
        title.textContent = 'Edit Equipment';
        document.getElementById('editEquipmentId').value = equipmentItem.id;
        document.getElementById('equipmentName').value = equipmentItem.name;
        document.getElementById('equipmentCondition').value = equipmentItem.condition || 'Good';
        document.getElementById('equipmentPurchase').value = equipmentItem.purchaseDate || '';
        document.getElementById('equipmentMaintenance').value = equipmentItem.lastMaintenance || '';
        document.getElementById('equipmentNotes').value = equipmentItem.notes || '';
    } else {
        title.textContent = 'Add Equipment';
        document.getElementById('equipmentForm').reset();
        document.getElementById('editEquipmentId').value = '';
        document.getElementById('equipmentCondition').value = 'Good';
    }
    
    modal.style.display = 'block';
}

function closeEquipmentModal() {
    document.getElementById('equipmentModal').style.display = 'none';
}

function saveEquipment() {
    const id = document.getElementById('editEquipmentId').value;
    const name = document.getElementById('equipmentName').value.trim();
    const condition = document.getElementById('equipmentCondition').value;
    const purchaseDate = document.getElementById('equipmentPurchase').value;
    const lastMaintenance = document.getElementById('equipmentMaintenance').value;
    const notes = document.getElementById('equipmentNotes').value.trim();
    
    if (!name || !condition) {
        alert('Please fill in all required fields');
        return;
    }
    
    const equipmentData = {
        name,
        condition,
        purchaseDate: purchaseDate || '',
        lastMaintenance: lastMaintenance || '',
        notes: notes || ''
    };
    
    if (id) {
        DB.update('equipment', parseInt(id), equipmentData);
        alert('Equipment updated successfully!');
    } else {
        DB.add('equipment', equipmentData);
        alert('Equipment added successfully!');
    }
    
    closeEquipmentModal();
    loadEquipment();
}

function editEquipment(id) {
    const equipment = DB.getAll('equipment');
    const item = equipment.find(e => e.id === id);
    if (item) openEquipmentModal(item);
}

function deleteEquipment(id) {
    if (confirm('Are you sure you want to delete this equipment record?')) {
        DB.delete('equipment', id);
        loadEquipment();
        alert('Equipment deleted successfully!');
    }
}