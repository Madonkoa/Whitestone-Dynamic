document.addEventListener('DOMContentLoaded', function () {
    loadEmployees();

    document.getElementById('addEmployeeBtn').addEventListener('click', function () {
        openModal();
    });

    document.querySelector('#employeeModal .close').addEventListener('click', function () {
        closeModal();
    });

    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('employeeModal')) {
            closeModal();
        }
    });

    document.getElementById('employeeForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveEmployee();
    });
});

async function loadEmployees() {
    try {
        const employees = await DB.getAll('employees');
        const tbody = document.getElementById('employeeTableBody');
        tbody.innerHTML = '';

        if (!employees || employees.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">No employees found</td></tr>';
            return;
        }

        employees.forEach(function (emp) {
            const tr = document.createElement('tr');
            const roleMap = {
                'owner': '👑 Owner',
                'manager': '📋 Manager',
                'foreman': '🔧 Foreman',
                'farmer': '🌾 Farmer',
                'sales': '💰 Sales',
                'accountant': '📊 Accountant'
            };
            const roleDisplay = roleMap[emp.role] || emp.position || 'Farmer';

            tr.innerHTML =
                '<td>' + emp.id + '</td>' +
                '<td>' + emp.username + '</td>' +
                '<td>' + emp.name + '</td>' +
                '<td>' + emp.surname + '</td>' +
                '<td>' + roleDisplay + '</td>' +
                '<td>' + (emp.access_rights || 'farmer') + '</td>' +
                '<td>' + (emp.is_active !== 0 ? '✅ Active' : '❌ Inactive') + '</td>' +
                '<td>' +
                '<button onclick="editEmployee(' + emp.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
                '<button onclick="deleteEmployee(' + emp.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #dc3545;">Delete</button>' +
                '</td>';
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error('Error loading employees:', error);
    }
}

function openModal(employee) {
    const modal = document.getElementById('employeeModal');
    const title = document.getElementById('modalTitle');

    if (employee) {
        title.textContent = 'Edit Employee';
        document.getElementById('editEmployeeId').value = employee.id;
        document.getElementById('empUsername').value = employee.username;
        document.getElementById('empPassword').value = '';
        document.getElementById('empName').value = employee.name;
        document.getElementById('empSurname').value = employee.surname;
        document.getElementById('empDob').value = employee.dob || '';
        document.getElementById('empAddress').value = employee.address || '';
        document.getElementById('empPosition').value = employee.position || 'farmer';
        document.getElementById('empAccess').value = employee.access_rights || 'farmer';
        document.getElementById('empRole').value = employee.role || 'farmer';
    } else {
        title.textContent = 'Add New Employee';
        document.getElementById('employeeForm').reset();
        document.getElementById('editEmployeeId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

async function saveEmployee() {
    const id = document.getElementById('editEmployeeId').value;
    const username = document.getElementById('empUsername').value.trim();
    const password = document.getElementById('empPassword').value;
    const name = document.getElementById('empName').value.trim();
    const surname = document.getElementById('empSurname').value.trim();
    const dob = document.getElementById('empDob').value;
    const address = document.getElementById('empAddress').value.trim();
    const position = document.getElementById('empPosition').value;
    const access = document.getElementById('empAccess').value.trim();
    const role = document.getElementById('empRole').value;

    if (!username || !name || !surname) {
        alert('Please fill in required fields');
        return;
    }

    const data = {
        username, name, surname, dob: dob || '', address: address || '',
        position: position || 'farmer',
        access_rights: access || 'farmer',
        role: role || 'farmer',
        is_active: 1
    };

    if (password) data.password = password;

    try {
        if (id) {
            await DB.update('employees', parseInt(id), data);
            alert('Employee updated!');
        } else {
            if (!password) {
                alert('Password is required for new employees');
                return;
            }
            await DB.add('employees', data);
            alert('Employee added!');
        }
        closeModal();
        loadEmployees();
    } catch (error) {
        alert('Error saving employee');
        console.error(error);
    }
}

function editEmployee(id) {
    // Fetch employee data by ID
    const employees = DB.getAll('employees').then(list => {
        const emp = list.find(e => e.id === id);
        if (emp) openModal(emp);
    });
}

async function deleteEmployee(id) {
    if (confirm('Delete this employee?')) {
        await DB.delete('employees', id);
        loadEmployees();
    }
}