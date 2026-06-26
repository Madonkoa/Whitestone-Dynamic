document.addEventListener('DOMContentLoaded', function () {
    loadCustomers();
    loadStats();

    document.getElementById('addCustomerBtn').addEventListener('click', function () {
        openModal();
    });

    document.querySelector('#customerModal .close').addEventListener('click', function () {
        closeModal();
    });

    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('customerModal')) {
            closeModal();
        }
    });

    document.getElementById('customerForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveCustomer();
    });

    document.getElementById('customerSearch').addEventListener('input', loadCustomers);
    document.getElementById('customerTypeFilter').addEventListener('change', loadCustomers);
});

async function loadCustomers() {
    try {
        let customers = await DB.getAll('customers') || [];
        const search = document.getElementById('customerSearch').value.toLowerCase();
        const filter = document.getElementById('customerTypeFilter').value;

        if (search) {
            customers = customers.filter(function (c) {
                return c.name.toLowerCase().includes(search) ||
                    (c.phone && c.phone.includes(search)) ||
                    (c.email && c.email.toLowerCase().includes(search));
            });
        }

        if (filter !== 'all') {
            customers = customers.filter(function (c) { return c.type === filter; });
        }

        const tbody = document.getElementById('customerTableBody');
        tbody.innerHTML = '';

        if (!customers || customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No customers found</td></tr>';
            return;
        }

        customers.sort(function (a, b) { return (b.total_purchases || 0) - (a.total_purchases || 0); });

        customers.forEach(function (c, i) {
            const typeClass = c.type === 'wholesale' ? 'status-good' : c.type === 'vip' ? 'status-fair' : '';
            const typeIcon = c.type === 'wholesale' ? '⭐' : c.type === 'vip' ? '👑' : '🔄';
            const initials = c.name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
            const colors = ['#C9A84C', '#0A1628', '#28A745', '#17A2B8', '#6F42C1', '#FD7E14'];
            const color = colors[i % colors.length];

            const tr = document.createElement('tr');
            tr.innerHTML =
                '<td>' + (i + 1) + '</td>' +
                '<td>' +
                '<div class="customer-name-cell">' +
                '<div class="customer-avatar" style="background: ' + color + ';">' + initials + '</div>' +
                '<div><div class="customer-name"><strong>' + c.name + '</strong></div></div>' +
                '</div>' +
                '</td>' +
                '<td>' +
                (c.phone ? '<div class="customer-phone">📞 ' + c.phone + '</div>' : '') +
                (c.email ? '<div class="customer-email">✉️ ' + c.email + '</div>' : '') +
                '</td>' +
                '<td><span class="status-badge ' + typeClass + '">' + typeIcon + ' ' + (c.type || 'regular') + '</span></td>' +
                '<td class="customer-total">R' + (c.total_purchases || 0).toFixed(2) + '</td>' +
                '<td>' + (c.last_purchase ? formatDate(c.last_purchase) : 'Never') + '</td>' +
                '<td class="customer-actions">' +
                '<button onclick="editCustomer(' + c.id + ')" class="btn-edit">✏️</button>' +
                '<button onclick="deleteCustomer(' + c.id + ')" class="btn-delete">🗑️</button>' +
                '</td>';
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

async function loadStats() {
    try {
        const customers = await DB.getAll('customers') || [];
        document.getElementById('totalCustomers').textContent = customers.length;

        let totalRevenue = 0, wholesale = 0, regular = 0, vip = 0;
        customers.forEach(function (c) {
            totalRevenue += c.total_purchases || 0;
            if (c.type === 'wholesale') wholesale++;
            else if (c.type === 'vip') vip++;
            else regular++;
        });

        document.getElementById('customerRevenue').textContent = 'R' + totalRevenue.toFixed(2);
        document.getElementById('wholesaleCount').textContent = wholesale;
        document.getElementById('regularCount').textContent = regular;
        document.getElementById('vipCount').textContent = vip;
        document.getElementById('avgPurchase').textContent = 'R' + (customers.length > 0 ? totalRevenue / customers.length : 0).toFixed(2);
    } catch (error) {
        console.error('Error loading customer stats:', error);
    }
}

function openModal(customer) {
    const modal = document.getElementById('customerModal');
    const title = document.getElementById('customerModalTitle');

    if (customer) {
        title.textContent = 'Edit Customer';
        document.getElementById('editCustomerId').value = customer.id;
        document.getElementById('custName').value = customer.name;
        document.getElementById('custPhone').value = customer.phone || '';
        document.getElementById('custEmail').value = customer.email || '';
        document.getElementById('custAddress').value = customer.address || '';
        document.getElementById('custType').value = customer.type || 'regular';
    } else {
        title.textContent = 'Add Customer';
        document.getElementById('customerForm').reset();
        document.getElementById('editCustomerId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('customerModal').style.display = 'none';
}

async function saveCustomer() {
    const id = document.getElementById('editCustomerId').value;
    const name = document.getElementById('custName').value.trim();
    const phone = document.getElementById('custPhone').value.trim();
    const email = document.getElementById('custEmail').value.trim();
    const address = document.getElementById('custAddress').value.trim();
    const type = document.getElementById('custType').value;

    if (!name) {
        alert('Please enter customer name');
        return;
    }

    const data = { name, phone: phone || '', email: email || '', address: address || '', type: type || 'regular' };

    try {
        if (id) {
            await DB.update('customers', parseInt(id), data);
            alert('Customer updated!');
        } else {
            await DB.add('customers', data);
            alert('Customer added!');
        }
        closeModal();
        loadCustomers();
        loadStats();
    } catch (error) {
        alert('Error saving customer');
    }
}

function editCustomer(id) {
    DB.getAll('customers').then(list => {
        const c = list.find(cust => cust.id === id);
        if (c) openModal(c);
    });
}

async function deleteCustomer(id) {
    if (confirm('Delete this customer?')) {
        await DB.delete('customers', id);
        loadCustomers();
        loadStats();
    }
}