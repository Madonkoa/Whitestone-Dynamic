// employees.js - Employee management

document.addEventListener('DOMContentLoaded', function() {
    loadEmployees();
    
    if (!hasAccess('admin,manager,owner')) {
        document.getElementById('addEmployeeBtn').style.display = 'none';
    }
    
    document.getElementById('addEmployeeBtn').addEventListener('click', function() {
        openEmployeeModal();
    });
    
    document.querySelector('#employeeModal .close').addEventListener('click', function() {
        closeModal();
    });
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('employeeModal');
        if (e.target === modal) closeModal();
    });
    
    document.getElementById('employeeForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveEmployee();
    });
});

function loadEmployees() {
    const employees = DB.getAll('employees');
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';
    
    employees.forEach(emp => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.username}</td>
            <td>${emp.name}</td>
            <td>${emp.surname}</td>
            <td>${emp.position || 'Farmer'}</td>
            <td>${emp.accessRights || 'farmer'}</td>
            <td>${emp.isActive !== false ? '✅ Active' : '❌ Inactive'}</td>
            <td>
                ${hasAccess('admin,manager,owner') ? `
                    <button onclick="editEmployee(${emp.id})" class="primary-btn" style="padding: 5px 10px; font-size: 12px; margin-right: 5px;">Edit</button>
                    <button onclick="deleteEmployee(${emp.id})" class="primary-btn" style="padding: 5px 10px; font-size: 12px; background: #dc3545;">Delete</button>
                ` : '—'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function openEmployeeModal(employee = null) {
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
        document.getElementById('empAccess').value = employee.accessRights || 'farmer';
    } else {
        title.textContent = 'Add New Employee';
        document.getElementById('employeeForm').reset();
        document.getElementById('editEmployeeId').value = '';
        document.getElementById('empPassword').required = true;
    }
    
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('employeeModal').style.display = 'none';
}

function saveEmployee() {
    const id = document.getElementById('editEmployeeId').value;
    const username = document.getElementById('empUsername').value.trim();
    const password = document.getElementById('empPassword').value;
    const name = document.getElementById('empName').value.trim();
    const surname = document.getElementById('empSurname').value.trim();
    const dob = document.getElementById('empDob').value;
    const address = document.getElementById('empAddress').value.trim();
    const position = document.getElementById('empPosition').value;
    const access = document.getElementById('empAccess').value.trim();
    
    if (!username || !name || !surname) {
        alert('Please fill in required fields');
        return;
    }
    
    const employeeData = {
        username, name, surname,
        dob: dob || '',
        address: address || '',
        position: position || 'farmer',
        accessRights: access || 'farmer',
        isActive: true
    };
    
    if (password) employeeData.password = password;
    
    if (id) {
        DB.update('employees', parseInt(id), employeeData);
        alert('Employee updated successfully!');
    } else {
        const employees = DB.getAll('employees');
        if (employees.some(emp => emp.username === username)) {
            alert('Username already exists');
            return;
        }
        if (!password) {
            alert('Password is required for new employees');
            return;
        }
        DB.add('employees', employeeData);
        alert('Employee added successfully!');
    }
    
    closeModal();
    loadEmployees();
}

function editEmployee(id) {
    const employees = DB.getAll('employees');
    const employee = employees.find(emp => emp.id === id);
    if (employee) openEmployeeModal(employee);
}

function deleteEmployee(id) {
    if (confirm('Are you sure you want to delete this employee?')) {
        DB.delete('employees', id);
        loadEmployees();
        alert('Employee deleted successfully!');
    }
}