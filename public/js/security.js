document.addEventListener('DOMContentLoaded', function () {
    loadIncidents();

    document.getElementById('addIncidentBtn').addEventListener('click', function () {
        openModal();
    });

    document.querySelector('#incidentModal .close').addEventListener('click', function () {
        closeModal();
    });

    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('incidentModal')) {
            closeModal();
        }
    });

    document.getElementById('incidentForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveIncident();
    });
});

async function loadIncidents() {
    try {
        const incidents = await DB.getAll('security');
        const grid = document.getElementById('securityGrid');
        grid.innerHTML = '';

        if (!incidents || incidents.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">No security incidents</p>';
            return;
        }

        incidents.sort(function (a, b) { return new Date(b.date_reported) - new Date(a.date_reported); });

        incidents.forEach(function (inc) {
            const resolved = inc.resolved === 1 || inc.resolved === true;
            const card = document.createElement('div');
            card.className = 'security-card';
            card.innerHTML =
                '<h3>' + inc.incident_type + '</h3>' +
                '<p><strong>Reported:</strong> ' + formatDate(inc.date_reported) + '</p>' +
                '<p>' + inc.description + '</p>' +
                '<p><strong>Status:</strong> <span class="status-badge ' + (resolved ? 'status-good' : 'status-poor') + '">' + (resolved ? '✅ Resolved' : '⚠️ Pending') + '</span></p>' +
                '<div style="margin-top: 10px;">' +
                '<button onclick="editIncident(' + inc.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
                '<button onclick="deleteIncident(' + inc.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #dc3545;">Delete</button>' +
                '</div>';
            grid.appendChild(card);
        });
    } catch (error) {
        console.error('Error loading security incidents:', error);
    }
}

function openModal(incident) {
    const modal = document.getElementById('incidentModal');
    const title = document.getElementById('incidentModalTitle');

    if (incident) {
        title.textContent = 'Edit Incident';
        document.getElementById('editIncidentId').value = incident.id;
        document.getElementById('incidentType').value = incident.incident_type;
        document.getElementById('incidentDescription').value = incident.description || '';
        document.getElementById('incidentResolved').value = incident.resolved ? 1 : 0;
    } else {
        title.textContent = 'Report Incident';
        document.getElementById('incidentForm').reset();
        document.getElementById('editIncidentId').value = '';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('incidentModal').style.display = 'none';
}

async function saveIncident() {
    const id = document.getElementById('editIncidentId').value;
    const incident_type = document.getElementById('incidentType').value;
    const description = document.getElementById('incidentDescription').value.trim();
    const resolved = parseInt(document.getElementById('incidentResolved').value);

    if (!incident_type || !description) {
        alert('Please fill in all fields');
        return;
    }

    const data = { incident_type, description, resolved };

    try {
        if (id) {
            await DB.update('security', parseInt(id), data);
            alert('Incident updated!');
        } else {
            await DB.add('security', data);
            alert('Incident reported!');
        }
        closeModal();
        loadIncidents();
    } catch (error) {
        alert('Error saving incident');
    }
}

function editIncident(id) {
    DB.getAll('security').then(list => {
        const inc = list.find(i => i.id === id);
        if (inc) openModal(inc);
    });
}

async function deleteIncident(id) {
    if (confirm('Delete this incident?')) {
        await DB.delete('security', id);
        loadIncidents();
    }
}