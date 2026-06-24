// security.js - Security management

document.addEventListener('DOMContentLoaded', function() {
    loadSecurityIncidents();
    
    document.getElementById('addIncidentBtn').addEventListener('click', function() {
        openIncidentModal();
    });
    
    document.querySelector('#incidentModal .close').addEventListener('click', function() {
        closeIncidentModal();
    });
    
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('incidentModal');
        if (e.target === modal) closeIncidentModal();
    });
    
    document.getElementById('incidentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveIncident();
    });
});

function loadSecurityIncidents() {
    const incidents = DB.getAll('security');
    const grid = document.getElementById('securityGrid');
    grid.innerHTML = '';
    
    if (incidents.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6a8a9c;">No security incidents reported</p>';
        return;
    }
    
    incidents.sort((a, b) => new Date(b.dateReported) - new Date(a.dateReported));
    
    incidents.forEach(incident => {
        const card = document.createElement('div');
        card.className = 'security-card';
        const isResolved = incident.resolved === 1 || incident.resolved === true;
        
        card.innerHTML = `
            <h3>${incident.incidentType}</h3>
            <p><strong>Reported:</strong> ${formatDate(incident.dateReported)}</p>
            <p><strong>Description:</strong> ${incident.description || 'No description provided'}</p>
            <p><strong>Status:</strong> 
                <span class="status-badge ${isResolved ? 'status-good' : 'status-poor'}">
                    ${isResolved ? '✅ Resolved' : '⚠️ Pending'}
                </span>
            </p>
            ${hasAccess('admin,manager,owner') ? `
                <button onclick="editIncident(${incident.id})" class="primary-btn" style="padding: 5px 10px; font-size: 12px; margin-top: 10px;">Edit</button>
                <button onclick="deleteIncident(${incident.id})" class="primary-btn" style="padding: 5px 10px; font-size: 12px; background: #dc3545; margin-top: 10px; margin-left: 5px;">Delete</button>
            ` : ''}
        `;
        grid.appendChild(card);
    });
}

function openIncidentModal(incident = null) {
    const modal = document.getElementById('incidentModal');
    const title = document.getElementById('incidentModalTitle');
    
    if (incident) {
        title.textContent = 'Edit Security Incident';
        document.getElementById('editIncidentId').value = incident.id;
        document.getElementById('incidentType').value = incident.incidentType;
        document.getElementById('incidentDescription').value = incident.description || '';
        document.getElementById('incidentResolved').value = incident.resolved ? 1 : 0;
    } else {
        title.textContent = 'Report Security Incident';
        document.getElementById('incidentForm').reset();
        document.getElementById('editIncidentId').value = '';
        document.getElementById('incidentResolved').value = 0;
    }
    
    modal.style.display = 'block';
}

function closeIncidentModal() {
    document.getElementById('incidentModal').style.display = 'none';
}

function saveIncident() {
    const id = document.getElementById('editIncidentId').value;
    const incidentType = document.getElementById('incidentType').value;
    const description = document.getElementById('incidentDescription').value.trim();
    const resolved = parseInt(document.getElementById('incidentResolved').value);
    
    if (!incidentType || !description) {
        alert('Please fill in all required fields');
        return;
    }
    
    const incidentData = {
        incidentType,
        description,
        resolved,
        dateReported: new Date().toISOString()
    };
    
    if (id) {
        const incidents = DB.getAll('security');
        const existing = incidents.find(i => i.id === parseInt(id));
        if (existing) incidentData.dateReported = existing.dateReported;
        DB.update('security', parseInt(id), incidentData);
        alert('Security incident updated successfully!');
    } else {
        DB.add('security', incidentData);
        alert('Security incident reported successfully!');
    }
    
    closeIncidentModal();
    loadSecurityIncidents();
}

function editIncident(id) {
    const incidents = DB.getAll('security');
    const incident = incidents.find(i => i.id === id);
    if (incident) openIncidentModal(incident);
}

function deleteIncident(id) {
    if (confirm('Are you sure you want to delete this security incident?')) {
        DB.delete('security', id);
        loadSecurityIncidents();
        alert('Security incident deleted successfully!');
    }
}