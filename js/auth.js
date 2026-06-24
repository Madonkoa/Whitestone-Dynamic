document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username) {
                alert('Please enter your username');
                return;
            }

            const employees = DB.getAll('employees');

            // Find user - admin can login with empty password
            const user = employees.find(function (emp) {
                if (emp.username === username) {
                    // Admin (username 'admin') can login with ANY password or empty
                    if (emp.username === 'admin') {
                        return true;
                    }
                    // Other users need password match
                    return emp.password === password;
                }
                return false;
            });

            if (user && user.isActive !== false) {
                setCurrentUser(user);
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid username or password');
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const name = document.getElementById('regName').value.trim();
            const surname = document.getElementById('regSurname').value.trim();
            const dob = document.getElementById('regDob').value;
            const address = document.getElementById('regAddress').value.trim();
            const position = document.getElementById('regPosition').value;
            const access = document.getElementById('regAccess').value.trim();

            if (!username || !password || !name || !surname) {
                alert('Please fill in all required fields');
                return;
            }

            const employees = DB.getAll('employees');
            if (employees.some(function (emp) { return emp.username === username; })) {
                alert('Username already exists');
                return;
            }

            const newEmployee = {
                username: username,
                password: password,
                name: name,
                surname: surname,
                dob: dob || '',
                address: address || '',
                position: position || 'farmer',
                accessRights: access || 'farmer',
                isActive: true
            };

            DB.add('employees', newEmployee);
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        });
    }
});