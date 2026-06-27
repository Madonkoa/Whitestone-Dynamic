// js/permissions.js - Frontend permission management
const API_URL = 'http://localhost:5500';
const token = localStorage.getItem('token');

// Check if current user has a specific permission
async function hasPermission(permissionName) {
    try {
        const res = await fetch(`${API_URL}/api/employees/${userId}/permissions`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) return false;
        const data = await res.json();
        return data.permissions.some(p => p.name === permissionName);
    } catch (error) {
        console.warn('Permission check failed:', error);
        return false;
    }
}

// Get all permissions for a user
async function getUserPermissions(userId) {
    try {
        const res = await fetch(`${API_URL}/api/employees/${userId}/permissions`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.permissions || [];
    } catch (error) {
        console.warn('Failed to get permissions:', error);
        return [];
    }
}

// Render permission checkboxes in a grid
function renderPermissionGrid(containerId, permissions, userPermissions) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Group permissions by module
    const grouped = {};
    permissions.forEach(p => {
        if (!grouped[p.module]) grouped[p.module] = [];
        grouped[p.module].push(p);
    });

    let html = '<div class="permission-grid">';
    Object.keys(grouped).sort().forEach(module => {
        html += `<div class="permission-module">
            <h4>${module}</h4>
            <div class="permission-items">`;
        grouped[module].forEach(p => {
            const checked = userPermissions.some(up => up.name === p.name) ? 'checked' : '';
            html += `
                <label class="permission-item">
                    <input type="checkbox" ${checked} value="${p.name}" data-permission="${p.name}">
                    <span>${p.description}</span>
                </label>
            `;
        });
        html += `</div></div>`;
    });
    html += '</div>';

    container.innerHTML = html;
}
