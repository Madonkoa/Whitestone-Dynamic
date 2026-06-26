document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username) {
                alert('Please enter your username');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();
                if (data.token) {
                    localStorage.setItem('token', data.token);
                    sessionStorage.setItem('currentUser', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.error || 'Login failed');
                }
            } catch (error) {
                alert('Network error - is the backend running?');
                console.error(error);
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const confirm = document.getElementById('regConfirmPassword').value.trim();
            const name = document.getElementById('regName').value.trim();
            const surname = document.getElementById('regSurname').value.trim();
            const position = document.getElementById('regPosition').value;
            const role = document.getElementById('regRole') ? document.getElementById('regRole').value : 'farmer';

            if (!username || !password || !name || !surname) {
                alert('Please fill in all required fields');
                return;
            }
            if (password !== confirm) {
                alert('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                alert('Password must be at least 6 characters');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username, password, name, surname,
                        position: position || 'farmer',
                        role: role || 'farmer',
                        access_rights: role || 'farmer'
                    })
                });

                const data = await response.json();
                if (data.success || data.id) {
                    alert('Registration successful! Please login.');
                    window.location.href = 'login.html';
                } else {
                    alert(data.error || 'Registration failed');
                }
            } catch (error) {
                alert('Network error');
                console.error(error);
            }
        });
    }
});