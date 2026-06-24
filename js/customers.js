// customers.js - Complete customer management

document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 Customers page loaded');
    loadCustomers();
    loadCustomerStats();

    // Search and filter
    var searchInput = document.getElementById('customerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', loadCustomers);
    }

    var typeFilter = document.getElementById('customerTypeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', loadCustomers);
    }

    // Add Customer Button
    var addBtn = document.getElementById('addCustomerBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            openCustomerModal();
        });
    }

    // Modal close
    var closeBtn = document.querySelector('#customerModal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            closeCustomerModal();
        });
    }

    window.addEventListener('click', function (e) {
        var modal = document.getElementById('customerModal');
        if (e.target === modal) {
            closeCustomerModal();
        }
    });

    // Form submit
    var form = document.getElementById('customerForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            saveCustomer();
        });
    }
});

function loadCustomerStats() {
    console.log('📊 Loading customer stats...');
    var customers = DB.getAll('customers') || [];
    console.log('📊 Customers found:', customers.length);

    document.getElementById('totalCustomers').textContent = customers.length;

    var totalRevenue = customers.reduce(function (sum, c) { return sum + (c.totalPurchases || 0); }, 0);
    document.getElementById('customerRevenue').textContent = 'R' + totalRevenue.toFixed(2);

    var wholesale = customers.filter(function (c) { return c.type === 'wholesale'; });
    document.getElementById('wholesaleCount').textContent = wholesale.length;

    var regular = customers.filter(function (c) { return c.type === 'regular'; });
    document.getElementById('regularCount').textContent = regular.length;

    var vip = customers.filter(function (c) { return c.type === 'vip'; });
    document.getElementById('vipCount').textContent = vip.length;

    var avg = customers.length > 0 ? totalRevenue / customers.length : 0;
    document.getElementById('avgPurchase').textContent = 'R' + avg.toFixed(2);

    console.log('✅ Stats loaded - Total:', customers.length, 'Revenue:', totalRevenue);
}

function loadCustomers() {
    console.log('📊 Loading customers table...');
    var customers = DB.getAll('customers') || [];
    console.log('📊 Customers in table:', customers.length);

    var searchTerm = '';
    var typeFilter = 'all';

    var searchInput = document.getElementById('customerSearch');
    if (searchInput) {
        searchTerm = searchInput.value.toLowerCase();
    }

    var filterSelect = document.getElementById('customerTypeFilter');
    if (filterSelect) {
        typeFilter = filterSelect.value;
    }

    // Filter
    var filtered = customers.filter(function (c) {
        var matchesSearch = c.name.toLowerCase().includes(searchTerm) ||
            (c.phone && c.phone.includes(searchTerm)) ||
            (c.email && c.email.toLowerCase().includes(searchTerm));
        var matchesType = typeFilter === 'all' || c.type === typeFilter;
        return matchesSearch && matchesType;
    });

    // Sort by total purchases (highest first)
    filtered.sort(function (a, b) { return (b.totalPurchases || 0) - (a.totalPurchases || 0); });

    var tbody = document.getElementById('customerTableBody');
    if (!tbody) {
        console.error('❌ customerTableBody not found!');
        return;
    }

    tbody.innerHTML = '';

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #888;">🔍 No customers found</td></tr>';
        return;
    }

    filtered.forEach(function (c, index) {
        var tr = document.createElement('tr');
        var typeIcon = c.type === 'wholesale' ? '⭐' : c.type === 'vip' ? '👑' : '🔄';
        var typeClass = c.type === 'wholesale' ? 'status-good' : c.type === 'vip' ? 'status-fair' : '';
        var initials = c.name.split(' ').map(function (n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
        var colors = ['#C9A84C', '#0A1628', '#28A745', '#17A2B8', '#6F42C1', '#FD7E14'];
        var color = colors[index % colors.length];

        tr.innerHTML =
            '<td>' + (index + 1) + '</td>' +
            '<td>' +
            '<div class="customer-name-cell">' +
            '<div class="customer-avatar" style="background: ' + color + ';">' + initials + '</div>' +
            '<div>' +
            '<div class="customer-name"><strong>' + c.name + '</strong></div>' +
            '<div class="customer-since">Since ' + (c.createdAt ? formatDate(c.createdAt) : 'N/A') + '</div>' +
            '</div>' +
            '</div>' +
            '</td>' +
            '<td>' +
            (c.phone ? '<div class="customer-phone">📞 ' + c.phone + '</div>' : '') +
            (c.email ? '<div class="customer-email">✉️ ' + c.email + '</div>' : '') +
            '</td>' +
            '<td><span class="status-badge ' + typeClass + '">' + typeIcon + ' ' + (c.type || 'regular') + '</span></td>' +
            '<td class="customer-total">R' + (c.totalPurchases || 0).toFixed(2) + '</td>' +
            '<td>' + (c.lastPurchase ? formatDate(c.lastPurchase) : 'Never') + '</td>' +
            '<td class="customer-actions">' +
            '<button onclick="editCustomer(' + c.id + ')" class="btn-edit">✏️</button>' +
            '<button onclick="deleteCustomer(' + c.id + ')" class="btn-delete">🗑️</button>' +
            '</td>';
        tbody.appendChild(tr);
    });

    console.log('✅ Customers table loaded:', filtered.length, 'customers');
}

function openCustomerModal(customer) {
    customer = customer || null;
    var modal = document.getElementById('customerModal');
    if (!modal) {
        console.error('❌ customerModal not found!');
        return;
    }

    var title = document.getElementById('customerModalTitle');
    var editId = document.getElementById('editCustomerId');
    var name = document.getElementById('custName');
    var phone = document.getElementById('custPhone');
    var email = document.getElementById('custEmail');
    var address = document.getElementById('custAddress');
    var type = document.getElementById('custType');

    if (customer) {
        title.textContent = '✏️ Edit Customer';
        editId.value = customer.id;
        name.value = customer.name;
        phone.value = customer.phone || '';
        email.value = customer.email || '';
        address.value = customer.address || '';
        type.value = customer.type || 'regular';
    } else {
        title.textContent = '➕ Add New Customer';
        editId.value = '';
        name.value = '';
        phone.value = '';
        email.value = '';
        address.value = '';
        type.value = 'regular';
    }

    modal.style.display = 'block';
}

function closeCustomerModal() {
    var modal = document.getElementById('customerModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function saveCustomer() {
    var id = document.getElementById('editCustomerId').value;
    var name = document.getElementById('custName').value.trim();
    var phone = document.getElementById('custPhone').value.trim();
    var email = document.getElementById('custEmail').value.trim();
    var address = document.getElementById('custAddress').value.trim();
    var type = document.getElementById('custType').value;

    if (!name) {
        alert('Please enter customer name');
        return;
    }

    var customerData = {
        name: name,
        phone: phone || '',
        email: email || '',
        address: address || '',
        type: type || 'regular',
        totalPurchases: 0,
        lastPurchase: null,
        createdAt: new Date().toISOString()
    };

    if (id) {
        var existing = DB.find('customers', function (c) { return c.id === parseInt(id); });
        if (existing) {
            customerData.totalPurchases = existing.totalPurchases || 0;
            customerData.lastPurchase = existing.lastPurchase || null;
            customerData.createdAt = existing.createdAt || new Date().toISOString();
        }
        DB.update('customers', parseInt(id), customerData);
        alert('✅ Customer updated successfully!');
    } else {
        DB.add('customers', customerData);
        alert('✅ Customer added successfully!');
    }

    closeCustomerModal();
    loadCustomers();
    loadCustomerStats();
}

function editCustomer(id) {
    var customers = DB.getAll('customers');
    var customer = customers.find(function (c) { return c.id === id; });
    if (customer) openCustomerModal(customer);
}

function deleteCustomer(id) {
    if (confirm('Are you sure you want to delete this customer?')) {
        DB.delete('customers', id);
        loadCustomers();
        loadCustomerStats();
        alert('✅ Customer deleted successfully!');
    }
}