document.addEventListener('DOMContentLoaded', function () {
    loadStock();

    document.getElementById('addStockBtn').addEventListener('click', function () {
        openModal();
    });

    document.querySelector('#stockModal .close').addEventListener('click', function () {
        closeModal();
    });

    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('stockModal')) {
            closeModal();
        }
    });

    document.getElementById('stockForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveStock();
    });
});

async function loadStock() {
    try {
        const stock = await DB.getAll('stock');
        const tbody = document.getElementById('stockTableBody');
        tbody.innerHTML = '';

        if (!stock || stock.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No stock items found</td></tr>';
            return;
        }

        stock.forEach(function (item) {
            const tr = document.createElement('tr');
            const total = (item.quantity || 0) * (item.price || 0);
            tr.innerHTML =
                '<td><strong>' + (item.item_type || 'Unknown') + '</strong></td>' +
                '<td>' + (item.quantity || 0) + '</td>' +
                '<td>' + (item.unit || 'N/A') + '</td>' +
                '<td>R' + (item.price || 0).toFixed(2) + '</td>' +
                '<td>R' + total.toFixed(2) + '</td>' +
                '<td>' + formatDate(item.last_updated) + '</td>' +
                '<td>' +
                '<button onclick="editStock(' + item.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
                '<button onclick="deleteStock(' + item.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #dc3545;">Delete</button>' +
                '</td>';
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading stock:', error);
    }
}

function openModal(item) {
    const modal = document.getElementById('stockModal');
    const title = document.getElementById('stockModalTitle');

    if (item) {
        title.textContent = 'Edit Stock';
        document.getElementById('editStockId').value = item.id;
        document.getElementById('stockType').value = item.item_type;
        document.getElementById('stockQuantity').value = item.quantity;
        document.getElementById('stockUnit').value = item.unit || 'bird';
        document.getElementById('stockPrice').value = item.price || 0;
    } else {
        title.textContent = 'Add Stock';
        document.getElementById('stockForm').reset();
        document.getElementById('editStockId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('stockModal').style.display = 'none';
}

async function saveStock() {
    const id = document.getElementById('editStockId').value;
    const item_type = document.getElementById('stockType').value;
    const quantity = parseInt(document.getElementById('stockQuantity').value);
    const unit = document.getElementById('stockUnit').value;
    const price = parseFloat(document.getElementById('stockPrice').value) || 0;

    if (!item_type || isNaN(quantity)) {
        alert('Please fill in all fields');
        return;
    }

    const data = { item_type, quantity, unit, price };

    try {
        if (id) {
            await DB.update('stock', parseInt(id), data);
            alert('Stock updated!');
        } else {
            await DB.add('stock', data);
            alert('Stock added!');
        }
        closeModal();
        loadStock();
    } catch (error) {
        alert('Error saving stock');
    }
}

function editStock(id) {
    // Load stock item by ID
    DB.getAll('stock').then(list => {
        const item = list.find(s => s.id === id);
        if (item) openModal(item);
    });
}

async function deleteStock(id) {
    if (confirm('Delete this stock item?')) {
        await DB.delete('stock', id);
        loadStock();
    }
}