// employees.js - Employee management with force owner access

document.addEventListener('DOMContentLoaded', function () {
    console.log('👤 Employee page loaded');

    // Get current user
    var user = getCurrentUser();
    console.log('👤 Current user:', user);

    // FORCE: If user is Owner, show everything regardless
    var isOwner = false;
    if (user) {
        if (user.position === 'Owner' || user.role === 'owner' || user.username === 'admin') {
            isOwner = true;
            console.log('👑 Owner detected - full access to employees');
        }
    }

    if (isOwner) {
        // Show the add button
        var addBtn = document.getElementById('addEmployeeBtn');
        if (addBtn) addBtn.style.display = 'block';

        // Load employees
        loadEmployees();
        setupEmployeeForm();
        return;
    }

    // For non-owners, check permissions normally
    if (!canViewPage('employees.html')) {
        var contentSection = document.querySelector('.content-section');
        if (contentSection) {
            contentSection.innerHTML =
                '<div class="empty-state">' +
                '<span class="empty-icon">🔒</span>' +
                '<p>Access Denied</p>' +
                '<span class="empty-sub">You do not have permission to view employees</span>' +
                '</div>';
        }
        return;
    }

    loadEmployees();
    setupEmployeeForm();
});

function setupEmployeeForm() {
    var addBtn = document.getElementById('addEmployeeBtn');
    if (addBtn) {
        addBtn.addEventListener('click', function () {
            openEmployeeModal();
        });
    }

    var closeBtn = document.querySelector('#employeeModal .close');
    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            closeModal();
        });
    }

    window.addEventListener('click', function (e) {
        var modal = document.getElementById('employeeModal');
        if (e.target === modal) closeModal();
    });

    var form = document.getElementById('employeeForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            saveEmployee();
        });
    }
}

function loadEmployees() {
    console.log('📊 Loading employees...');
    var employees = DB.getAll('employees');
    console.log('📊 Employees found:', employees.length);

    var tbody = document.getElementById('employeeTableBody');
    if (!tbody) {
        console.error('❌ employeeTableBody not found!');
        return;
    }

    tbody.innerHTML = '';

    var user = getCurrentUser();
    var isOwner = user && (user.position === 'Owner' || user.role === 'owner' || user.username === 'admin');
    var showActions = isOwner || canEdit('employees.html');

    if (employees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px; color: #888;">No employees found</td></tr>';
        return;
    }

    employees.forEach(function (emp) {
        var tr = document.createElement('tr');
        var roleBadge = '';
        switch (emp.role) {
            case 'owner': roleBadge = '👑 Owner'; break;
            case 'manager': roleBadge = '📋 Manager'; break;
            case 'foreman': roleBadge = '🔧 Foreman'; break;
            case 'farmer': roleBadge = '🌾 Farmer'; break;
            case 'sales': roleBadge = '💰 Sales'; break;
            case 'accountant': roleBadge = '📊 Accountant'; break;
            default: roleBadge = emp.position || 'Farmer';
        }

        tr.innerHTML =
            '<td>' + emp.id + '</td>' +
            '<td>' + emp.username + '</td>' +
            '<td>' + emp.name + '</td>' +
            '<td>' + emp.surname + '</td>' +
            '<td>' + roleBadge + '</td>' +
            '<td>' + (emp.accessRights || 'farmer') + '</td>' +
            '<td>' + (emp.isActive !== false ? '✅ Active' : '❌ Inactive') + '</td>' +
            '<td>' +
            (showActions ?
                '<button onclick="editEmployee(' + emp.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
                '<button onclick="deleteEmployee(' + emp.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #DC3545;">Delete</button>'
                : '—') +
            '</td>';
        tbody.appendChild(tr);
    });

    console.log('✅ Employees loaded successfully');
}

function openEmployeeModal(employee) {
    var modal = document.getElementById('employeeModal');
    var title = document.getElementById('modalTitle');
    var editId = document.getElementById('editEmployeeId');
    var username = document.getElementById('empUsername');
    var password = document.getElementById('empPassword');
    var name = document.getElementById('empName');
    var surname = document.getElementById('empSurname');
    var dob = document.getElementById('empDob');
    var address = document.getElementById('empAddress');
    var position = document.getElementById('empPosition');
    var access = document.getElementById('empAccess');
    var role = document.getElementById('empRole');

    if (employee) {
        title.textContent = '✏️ Edit Employee';
        editId.value = employee.id;
        username.value = employee.username;
        password.value = '';
        password.required = false;
        name.value = employee.name;
        surname.value = employee.surname;
        dob.value = employee.dob || '';
        address.value = employee.address || '';
        position.value = employee.position || 'farmer';
        access.value = employee.accessRights || 'farmer';
        if (role) role.value = employee.role || 'farmer';
    } else {
        title.textContent = '➕ Add New Employee';
        document.getElementById('employeeForm').reset();
        editId.value = '';
        password.required = true;
        if (role) role.value = 'farmer';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

function saveEmployee() {
    var id = document.getElementById('editEmployeeId').value;
    var username = document.getElementById('empUsername').value.trim();
    var password = document.getElementById('empPassword').value;
    var name = document.getElementById('empName').value.trim();
    var surname = document.getElementById('empSurname').value.trim();
    var dob = document.getElementById('empDob').value;
    var address = document.getElementById('empAddress').value.trim();
    var position = document.getElementById('empPosition').value;
    var access = document.getElementById('empAccess').value.trim();
    var role = document.getElementById('empRole') ? document.getElementById('empRole').value : 'farmer';

    if (!username || !name || !surname) {
        alert('Please fill in required fields');
        return;
    }

    var employeeData = {
        username: username,
        name: name,
        surname: surname,
        dob: dob || '',
        address: address || '',
        position: position || 'farmer',
        accessRights: access || 'farmer',
        role: role || 'farmer',
        isActive: true
    };

    if (password) {
        employeeData.password = hashPassword(password);
    }

    if (id) {
        var existing = DB.find('employees', function (e) { return e.id === parseInt(id); });
        if (existing && existing.createdAt) {
            employeeData.createdAt = existing.createdAt;
        }
        DB.update('employees', parseInt(id), employeeData);
        alert('✅ Employee updated successfully!');
    } else {
        var employees = DB.getAll('employees');
        if (employees.some(function (e) { return e.username === username; })) {
            alert('⚠️ Username already exists');
            return;
        }
        if (!password) {
            alert('⚠️ Password is required for new employees');
            return;
        }
        employeeData.password = hashPassword(password);
        employeeData.createdAt = new Date().toISOString();
        DB.add('employees', employeeData);
        alert('✅ Employee added successfully!');
    }

    closeModal();
    loadEmployees();
}

function editEmployee(id) {
    var employees = DB.getAll('employees');
    var employee = employees.find(function (e) { return e.id === id; });
    if (employee) openEmployeeModal(employee);
}

function deleteEmployee(id) {
    if (confirm('⚠️ Are you sure you want to delete this employee?')) {
        DB.delete('employees', id);
        loadEmployees();
        alert('✅ Employee deleted successfully!');
    }
}