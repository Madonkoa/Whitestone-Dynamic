// coops.js - Complete coop management

document.addEventListener('DOMContentLoaded', function () {
    console.log('🔄 Coops page loaded');

    // Check if coops exist, create if not
    var existingCoops = DB.get('coops');
    if (!existingCoops || existingCoops.length === 0) {
        console.log('⚠️ No coops found, creating default...');
        createDefaultCoops();
    }

    loadCoops();
    loadCoopStats();

    // ADD COOP BUTTON
    document.getElementById('addCoopBtn').addEventListener('click', function () {
        console.log('➕ Add Coop button clicked');
        openCoopModal();
    });

    // MODAL CLOSE
    document.querySelector('#coopModal .close').addEventListener('click', function () {
        closeCoopModal();
    });

    window.addEventListener('click', function (e) {
        var modal = document.getElementById('coopModal');
        if (e.target === modal) {
            closeCoopModal();
        }
    });

    // FORM SUBMIT
    document.getElementById('coopForm').addEventListener('submit', function (e) {
        e.preventDefault();
        console.log('📝 Coop form submitted');
        saveCoop();
    });
});

// ============================================
// LOAD COOP STATS
// ============================================
function loadCoopStats() {
    console.log('📊 Loading coop stats...');
    var coops = DB.getAll('coops');
    console.log('📊 Coops in stats:', coops ? coops.length : 0);

    if (!coops || coops.length === 0) {
        document.getElementById('totalCoops').textContent = '0';
        document.getElementById('totalCoopBirds').textContent = '0';
        document.getElementById('healthyZones').textContent = '0';
        return;
    }

    // Count unique coops
    var coopNumbers = {};
    coops.forEach(function (c) {
        coopNumbers[c.coopNumber] = true;
    });
    document.getElementById('totalCoops').textContent = Object.keys(coopNumbers).length;

    // Total birds
    var totalBirds = coops.reduce(function (sum, c) { return sum + (c.currentStock || 0); }, 0);
    document.getElementById('totalCoopBirds').textContent = totalBirds;

    // Healthy zones
    var healthy = coops.filter(function (c) {
        return c.healthStatus === 'Good' || c.healthStatus === 'Excellent';
    });
    document.getElementById('healthyZones').textContent = healthy.length;

    console.log('✅ Stats: Coops:', Object.keys(coopNumbers).length, 'Birds:', totalBirds, 'Healthy:', healthy.length);
}

// ============================================
// LOAD COOPS
// ============================================
function loadCoops() {
    console.log('📊 Loading coops display...');
    var coops = DB.getAll('coops');
    console.log('📊 Coops to display:', coops ? coops.length : 0);

    var grid = document.getElementById('coopGrid');
    if (!grid) {
        console.error('❌ coopGrid not found!');
        return;
    }

    grid.innerHTML = '';

    if (!coops || coops.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #6a8a9c; padding: 40px;">🏠 No coop zones found. Click "Add Coop" to create one!</p>';
        return;
    }

    // Group by coop number
    var grouped = {};
    coops.forEach(function (coop) {
        if (!grouped[coop.coopNumber]) grouped[coop.coopNumber] = [];
        grouped[coop.coopNumber].push(coop);
    });

    console.log('📊 Grouped coops:', Object.keys(grouped).length);

    // Build HTML
    var html = '';
    Object.keys(grouped).sort().forEach(function (coopNum) {
        var zones = grouped[coopNum];
        var totalStock = zones.reduce(function (sum, z) { return sum + (z.currentStock || 0); }, 0);

        // Health summary
        var healthCounts = {};
        zones.forEach(function (z) {
            var h = z.healthStatus || 'Good';
            healthCounts[h] = (healthCounts[h] || 0) + 1;
        });
        var healthSummary = Object.keys(healthCounts).map(function (h) {
            return h + ': ' + healthCounts[h];
        }).join(', ');

        html += '<div class="coop-section">';
        html += '<div class="coop-header">';
        html += '<h3>🏠 Coop ' + coopNum + '</h3>';
        html += '<div class="coop-summary">';
        html += '<span>Total: <strong>' + totalStock + '</strong> birds</span>';
        html += '<span>|</span>';
        html += '<span>Zones: ' + zones.length + '</span>';
        html += '<span>|</span>';
        html += '<span>Health: ' + healthSummary + '</span>';
        html += '</div></div>';

        html += '<div class="coop-zones">';
        zones.forEach(function (zone) {
            var healthClass = zone.healthStatus === 'Good' || zone.healthStatus === 'Excellent' ? 'status-good' :
                zone.healthStatus === 'Fair' ? 'status-fair' : 'status-poor';
            html += '<div class="coop-card">';
            html += '<div class="coop-card-header">';
            html += '<h4>Zone ' + zone.zoneLetter + '</h4>';
            html += '<span class="status-badge ' + healthClass + '">' + (zone.healthStatus || 'Good') + '</span>';
            html += '</div>';
            html += '<p><strong>Stock:</strong> ' + (zone.currentStock || 0) + ' birds</p>';
            html += '<p><small>Last checked: ' + formatDate(zone.lastChecked) + '</small></p>';
            if (zone.notes) {
                html += '<p><small>📝 ' + zone.notes + '</small></p>';
            }
            if (hasAccess('admin,manager,owner')) {
                html += '<div style="margin-top: 10px;">';
                html += '<button onclick="editCoop(' + zone.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; margin-right: 5px;">Edit</button>';
                html += '<button onclick="deleteCoop(' + zone.id + ')" class="primary-btn" style="padding: 4px 10px; font-size: 11px; background: #DC3545;">Delete</button>';
                html += '</div>';
            }
            html += '</div>';
        });
        html += '</div></div>';
    });

    grid.innerHTML = html;
    console.log('✅ Coops displayed successfully!');
}

// ============================================
// CREATE DEFAULT COOPS
// ============================================
function createDefaultCoops() {
    console.log('🔄 Creating default coops...');
    var coops = [];
    var stockData = { 1: { A: 45, B: 38, C: 42 }, 2: { A: 35, B: 40, C: 30 }, 3: { A: 25, B: 20, C: 18 } };
    var healthData = { 1: { A: 'Good', B: 'Excellent', C: 'Good' }, 2: { A: 'Good', B: 'Fair', C: 'Good' }, 3: { A: 'Fair', B: 'Good', C: 'Excellent' } };
    var notesData = {
        1: { A: 'Full capacity - healthy flock', B: 'Growing well - excellent condition', C: 'Routine check complete' },
        2: { A: 'Good production - healthy', B: 'Need more space - fair condition', C: 'Health check due' },
        3: { A: 'Young flock - developing well', B: 'Excellent condition', C: 'Ready for sale' }
    };
    for (var coop = 1; coop <= 3; coop++) {
        for (var zone of ['A', 'B', 'C']) {
            coops.push({
                id: coops.length + 1,
                coopNumber: coop,
                zoneLetter: zone,
                currentStock: stockData[coop]?.[zone] || 0,
                healthStatus: healthData[coop]?.[zone] || 'Good',
                lastChecked: new Date().toISOString(),
                notes: notesData[coop]?.[zone] || ''
            });
        }
    }
    DB.set('coops', coops);
    console.log('✅ Default coops created:', coops.length, 'zones');
}

// ============================================
// OPEN MODAL
// ============================================
function openCoopModal(coopItem) {
    console.log('📂 Opening coop modal...');
    var modal = document.getElementById('coopModal');
    if (!modal) return;

    if (coopItem) {
        document.getElementById('coopModalTitle').textContent = '✏️ Edit Coop Zone';
        document.getElementById('editCoopId').value = coopItem.id;
        document.getElementById('coopNumber').value = coopItem.coopNumber;
        document.getElementById('coopZone').value = coopItem.zoneLetter;
        document.getElementById('coopStock').value = coopItem.currentStock || 0;
        document.getElementById('coopHealth').value = coopItem.healthStatus || 'Good';
        document.getElementById('coopNotes').value = coopItem.notes || '';
    } else {
        document.getElementById('coopModalTitle').textContent = '➕ Add New Coop Zone';
        document.getElementById('editCoopId').value = '';
        document.getElementById('coopNumber').value = '';
        document.getElementById('coopZone').value = 'A';
        document.getElementById('coopStock').value = 0;
        document.getElementById('coopHealth').value = 'Good';
        document.getElementById('coopNotes').value = '';
    }

    modal.style.display = 'block';
}

function closeCoopModal() {
    var modal = document.getElementById('coopModal');
    if (modal) modal.style.display = 'none';
}

// ============================================
// SAVE COOP
// ============================================
function saveCoop() {
    console.log('💾 Saving coop...');

    var id = document.getElementById('editCoopId').value;
    var coopNumber = parseInt(document.getElementById('coopNumber').value);
    var zoneLetter = document.getElementById('coopZone').value;
    var currentStock = parseInt(document.getElementById('coopStock').value) || 0;
    var healthStatus = document.getElementById('coopHealth').value;
    var notes = document.getElementById('coopNotes').value.trim();

    if (!coopNumber || isNaN(coopNumber) || coopNumber < 1 || coopNumber > 3) {
        alert('⚠️ Please enter a valid Coop Number (1-3)');
        return;
    }

    var coopData = {
        coopNumber: coopNumber,
        zoneLetter: zoneLetter,
        currentStock: currentStock,
        healthStatus: healthStatus,
        notes: notes,
        lastChecked: new Date().toISOString()
    };

    if (id) {
        DB.update('coops', parseInt(id), coopData);
        alert('✅ Coop zone updated successfully!');
    } else {
        var allCoops = DB.getAll('coops');
        var exists = allCoops.some(function (c) {
            return c.coopNumber === coopNumber && c.zoneLetter === zoneLetter;
        });
        if (exists) {
            alert('⚠️ Coop ' + coopNumber + ' Zone ' + zoneLetter + ' already exists!');
            return;
        }
        DB.add('coops', coopData);
        alert('✅ New coop zone added successfully!');
    }

    closeCoopModal();
    loadCoops();
    loadCoopStats();
}

function editCoop(id) {
    var coops = DB.getAll('coops');
    var coop = coops.find(function (c) { return c.id === id; });
    if (coop) openCoopModal(coop);
}

function deleteCoop(id) {
    if (confirm('⚠️ Are you sure you want to delete this coop zone?')) {
        DB.delete('coops', id);
        loadCoops();
        loadCoopStats();
        alert('✅ Coop zone deleted successfully!');
    }
}