document.addEventListener('DOMContentLoaded', function () {
    loadCoops();

    document.getElementById('addCoopBtn').addEventListener('click', function () {
        openModal();
    });

    document.querySelector('#coopModal .close').addEventListener('click', function () {
        closeModal();
    });

    window.addEventListener('click', function (e) {
        if (e.target === document.getElementById('coopModal')) {
            closeModal();
        }
    });

    document.getElementById('coopForm').addEventListener('submit', function (e) {
        e.preventDefault();
        saveCoop();
    });
});

async function loadCoops() {
    try {
        const coops = await DB.getAll('coops');
        const grid = document.getElementById('coopGrid');
        grid.innerHTML = '';

        if (!coops || coops.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #888; padding: 40px;">No coops found</p>';
            return;
        }

        // Group by coop number
        const grouped = {};
        coops.forEach(function (c) {
            if (!grouped[c.coop_number]) grouped[c.coop_number] = [];
            grouped[c.coop_number].push(c);
        });

        let totalBirds = 0;
        let healthyZones = 0;

        Object.keys(grouped).sort().forEach(function (num) {
            const zones = grouped[num];
            let total = 0;
            zones.forEach(function (z) { total += z.current_stock || 0; totalBirds += z.current_stock || 0; if (z.health_status === 'Good' || z.health_status === 'Excellent') healthyZones++; });

            const section = document.createElement('div');
            section.className = 'coop-section';

            let zonesHtml = '';
            zones.forEach(function (z) {
                const healthClass = z.health_status === 'Good' || z.health_status === 'Excellent' ? 'status-good' : z.health_status === 'Fair' ? 'status-fair' : 'status-poor';
                zonesHtml +=
                    '<div class="coop-card">' +
                    '<div class="coop-card-header">' +
                    '<h4>Zone ' + z.zone_letter + '</h4>' +
                    '<span class="status-badge ' + healthClass + '">' + (z.health_status || 'Good') + '</span>' +
                    '</div>' +
                    '<p><strong>Stock:</strong> ' + (z.current_stock || 0) + ' birds</p>' +
                    '<p><small>Last checked: ' + formatDate(z.last_checked) + '</small></p>' +
                    (z.notes ? '<p><small>' + z.notes + '</small></p>' : '') +
                    '<div style="margin-top: 10px;">' +
                    '<button onclick="editCoop(' + z.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>' +
                    '<button onclick="deleteCoop(' + z.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #dc3545;">Delete</button>' +
                    '</div>' +
                    '</div>';
            });

            section.innerHTML =
                '<div class="coop-header">' +
                '<h3>🏠 Coop ' + num + '</h3>' +
                '<div class="coop-summary">' +
                '<span>Total: <strong>' + total + '</strong> birds</span>' +
                '<span>|</span>' +
                '<span>Zones: ' + zones.length + '</span>' +
                '</div>' +
                '</div>' +
                '<div class="coop-zones">' + zonesHtml + '</div>';
            grid.appendChild(section);
        });

        document.getElementById('totalCoops').textContent = Object.keys(grouped).length;
        document.getElementById('totalCoopBirds').textContent = totalBirds;
        document.getElementById('healthyZones').textContent = healthyZones;
    } catch (error) {
        console.error('Error loading coops:', error);
    }
}

function openModal(coop) {
    const modal = document.getElementById('coopModal');
    const title = document.getElementById('coopModalTitle');

    if (coop) {
        title.textContent = 'Edit Coop Zone';
        document.getElementById('editCoopId').value = coop.id;
        document.getElementById('coopNumber').value = coop.coop_number;
        document.getElementById('coopZone').value = coop.zone_letter;
        document.getElementById('coopStock').value = coop.current_stock || 0;
        document.getElementById('coopHealth').value = coop.health_status || 'Good';
        document.getElementById('coopNotes').value = coop.notes || '';
    } else {
        title.textContent = 'Add Coop Zone';
        document.getElementById('coopForm').reset();
        document.getElementById('editCoopId').value = '';
        document.getElementById('coopHealth').value = 'Good';
    }

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('coopModal').style.display = 'none';
}

async function saveCoop() {
    const id = document.getElementById('editCoopId').value;
    const coop_number = parseInt(document.getElementById('coopNumber').value);
    const zone_letter = document.getElementById('coopZone').value;
    const current_stock = parseInt(document.getElementById('coopStock').value) || 0;
    const health_status = document.getElementById('coopHealth').value;
    const notes = document.getElementById('coopNotes').value.trim();

    if (!coop_number || !zone_letter) {
        alert('Please fill in all fields');
        return;
    }

    const data = { coop_number, zone_letter, current_stock, health_status, notes };

    try {
        if (id) {
            await DB.update('coops', parseInt(id), data);
            alert('Coop updated!');
        } else {
            await DB.add('coops', data);
            alert('Coop added!');
        }
        closeModal();
        loadCoops();
    } catch (error) {
        alert('Error saving coop');
    }
}

function editCoop(id) {
    DB.getAll('coops').then(list => {
        const coop = list.find(c => c.id === id);
        if (coop) openModal(coop);
    });
}

async function deleteCoop(id) {
    if (confirm('Delete this coop zone?')) {
        await DB.delete('coops', id);
        loadCoops();
    }
}