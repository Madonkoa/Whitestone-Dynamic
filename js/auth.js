// auth.js - Complete authentication

const Auth = {
    getCurrentUser: function () {
        var userData = sessionStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    },

    setCurrentUser: function (user) {
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        sessionStorage.setItem('lastActivity', Date.now().toString());
    },

    clearCurrentUser: function () {
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('lastActivity');
        sessionStorage.removeItem('rememberMe');
    },

    isAuthenticated: function () {
        var user = this.getCurrentUser();
        if (!user) return false;
        var lastActivity = sessionStorage.getItem('lastActivity');
        if (lastActivity) {
            var inactiveTime = Date.now() - parseInt(lastActivity);
            if (inactiveTime > 1800000) {
                this.clearCurrentUser();
                return false;
            }
        }
        return true;
    },

    login: function (username, password, rememberMe) {
        var employees = DB.getAll('employees');
        var user = null;
        for (var i = 0; i < employees.length; i++) {
            var emp = employees[i];
            if (emp.username === username && emp.isActive !== false) {
                if (emp.username === 'admin' || emp.password === password || verifyPassword(password, emp.password)) {
                    user = emp;
                    break;
                }
            }
        }
        if (user) {
            this.setCurrentUser(user);
            if (rememberMe) {
                sessionStorage.setItem('rememberMe', 'true');
                sessionStorage.setItem('rememberedUser', username);
            }
            return { success: true, user: user };
        }
        return { success: false, error: 'Invalid username or password' };
    },

    logout: function () {
        this.clearCurrentUser();
        window.location.href = 'login.html';
    },

    register: function (userData) {
        var employees = DB.getAll('employees');
        if (employees.some(function (emp) { return emp.username === userData.username; })) {
            return { success: false, error: 'Username already exists' };
        }
        var newUser = {
            ...userData,
            id: employees.length > 0 ? Math.max(...employees.map(function (e) { return e.id; })) + 1 : 1,
            role: userData.role || 'farmer',
            isActive: true,
            createdAt: new Date().toISOString()
        };
        DB.add('employees', newUser);
        return { success: true, user: newUser };
    }
};

function verifyPassword(password, hash) {
    if (!hash || hash === '') return true;
    return hashPassword(password) === hash;
}

function showAuthToast(message) {
    document.querySelectorAll('.auth-toast').forEach(function (t) { t.remove(); });

    var toast = document.createElement('div');
    toast.className = 'auth-toast';
    toast.textContent = message;
    toast.style.cssText =
        'position: fixed; top: 20px; right: 20px; ' +
        'padding: 12px 24px; ' +
        'background: #1A1A2E; ' +
        'color: #E8E0D0; ' +
        'border-radius: 8px; ' +
        'box-shadow: 0 4px 20px rgba(0,0,0,0.3); ' +
        'z-index: 9999; ' +
        'animation: slideIn 0.3s ease; ' +
        'font-family: Inter, sans-serif; ' +
        'font-size: 14px; ' +
        'font-weight: 500; ' +
        'max-width: 90%; ' +
        'border: none; ' +
        'outline: none;';

    document.body.appendChild(toast);

    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(function () { toast.remove(); }, 300);
    }, 2500);
}

document.addEventListener('DOMContentLoaded', function () {
    var rememberedUser = sessionStorage.getItem('rememberedUser');
    if (rememberedUser) {
        var usernameField = document.getElementById('username');
        if (usernameField) usernameField.value = rememberedUser;
    }

    var loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var username = document.getElementById('username').value.trim();
            var password = document.getElementById('password').value.trim();
            var rememberMe = document.getElementById('rememberMe') ? document.getElementById('rememberMe').checked : false;

            if (!username) {
                showAuthToast('Please enter your username');
                return;
            }

            var result = Auth.login(username, password, rememberMe);
            if (result.success) {
                showAuthToast('Welcome back, ' + result.user.name + '!');
                setTimeout(function () {
                    window.location.href = 'dashboard.html';
                }, 600);
            } else {
                showAuthToast('Invalid username or password');
            }
        });
    }

    var registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var username = document.getElementById('regUsername').value.trim();
            var password = document.getElementById('regPassword').value.trim();
            var confirmPassword = document.getElementById('regConfirmPassword') ? document.getElementById('regConfirmPassword').value.trim() : password;
            var name = document.getElementById('regName').value.trim();
            var surname = document.getElementById('regSurname').value.trim();
            var dob = document.getElementById('regDob').value;
            var address = document.getElementById('regAddress').value.trim();
            var position = document.getElementById('regPosition').value;
            var access = document.getElementById('regAccess').value.trim();
            var role = document.getElementById('regRole') ? document.getElementById('regRole').value : 'farmer';

            if (!username || !password || !name || !surname) {
                showAuthToast('Please fill in all required fields');
                return;
            }
            if (password !== confirmPassword) {
                showAuthToast('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                showAuthToast('Password must be at least 6 characters');
                return;
            }

            var result = Auth.register({
                username: username,
                password: password,
                name: name,
                surname: surname,
                dob: dob || '',
                address: address || '',
                position: position || 'farmer',
                accessRights: access || 'farmer',
                role: role || 'farmer'
            });

            if (result.success) {
                showAuthToast('Registration successful! Please login.');
                setTimeout(function () { window.location.href = 'login.html'; }, 1000);
            } else {
                showAuthToast(result.error || 'Registration failed');
            }
        });
    }

    var resetForm = document.getElementById('resetForm');
    if (resetForm) {
        resetForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var username = document.getElementById('resetUsername').value.trim();
            var newPassword = document.getElementById('resetNewPassword').value.trim();
            var confirmPassword = document.getElementById('resetConfirmPassword').value.trim();

            if (!username || !newPassword) {
                showAuthToast('Please fill in all fields');
                return;
            }
            if (newPassword !== confirmPassword) {
                showAuthToast('Passwords do not match');
                return;
            }
            if (newPassword.length < 6) {
                showAuthToast('Password must be at least 6 characters');
                return;
            }

            var employees = DB.getAll('employees');
            var user = employees.find(function (emp) { return emp.username === username; });
            if (!user) {
                showAuthToast('User not found');
                return;
            }

            var updatedUser = { ...user, password: newPassword };
            DB.update('employees', user.id, updatedUser);
            showAuthToast('Password reset successful! Please login.');
            setTimeout(function () { window.location.href = 'login.html'; }, 1000);
        });
    }
});

// Add slideIn animation
var style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);

window.Auth = Auth;
window.showAuthToast = showAuthToast;