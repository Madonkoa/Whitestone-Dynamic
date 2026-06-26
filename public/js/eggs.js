document.addEventListener('DOMContentLoaded', function () {
    loadProduction();
    loadStats();
    loadBatches();

    document.getElementById('prodDate').value = new Date().toISOString().split('T')[0];

    document.querySelectorAll('.mode-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.mode-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            const grid = document.querySelector('.egg-sizes-grid');
            const display = document.querySelector('.total-display');
            if (this.dataset.mode === 'total') {
                grid.style.display = 'none';
                display.style.display = 'none';
            } else {
                grid.style.display = 'grid';
                display.style.display = 'block';
            }
        });
    });

    ['smallEggs', 'mediumEggs', 'largeEggs', 'xlEggs'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', calculateTotal);
    });

    document.getElementById('productionForm').addEventListener('submit', function (e) {
        e.preventDefault();
        recordProduction();
    });
});

function calculateTotal() {
    const small = parseInt(document.getElementById('smallEggs').value) || 0;
    const medium = parseInt(document.getElementById('mediumEggs').value) || 0;
    const large = parseInt(document.getElementById('largeEggs').value) || 0;
    const xl = parseInt(document.getElementById('xlEggs').value) || 0;
    document.getElementById('totalEggsDisplay').textContent = (small + medium + large + xl) + ' eggs';
}

async function loadProduction() {
    try {
        const eggs = await DB.getAll('eggs');
        const container = document.getElementById('recentProduction');
        container.innerHTML = '';

        if (!eggs || eggs.length === 0) {
            container.innerHTML = '<p style="color: #888;">No production records found</p>';
            return;
        }

        const recent = eggs.sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 5);
        recent.forEach(function (r) {
            const div = document.createElement('div');
            div.className = 'production-record';
            div.innerHTML =
                '<div class="production-header">' +
                '<strong>' + formatDate(r.date) + '</strong>' +
                '<span class="production-total">' + r.total + ' eggs</span>' +
                '</div>' +
                '<div class="production-details">' +
                (r.small_eggs > 0 ? '🥚 Small: ' + r.small_eggs + ' ' : '') +
                (r.medium_eggs > 0 ? '🥚 Medium: ' + r.medium_eggs + ' ' : '') +
                (r.large_eggs > 0 ? '🥚 Large: ' + r.large_eggs + ' ' : '') +
                (r.xl_eggs > 0 ? '🥚 XL: ' + r.xl_eggs : '') +
                '</div>' +
                (r.notes ? '<div class="production-notes">' + r.notes + '</div>' : '');
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading production:', error);
    }
}

async function loadStats() {
    try {
        const eggs = await DB.getAll('eggs');
        const today = new Date().toDateString();
        let todayTotal = 0;
        let total = 0;
        let count = 0;

        eggs.forEach(function (e) {
            total += e.total || 0;
            count++;
            if (new Date(e.date).toDateString() === today) {
                todayTotal += e.total || 0;
            }
        });

        document.getElementById('todayProduction').textContent = todayTotal;
        document.getElementById('periodAverage').textContent = count > 0 ? Math.round(total / count) : 0;
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadBatches() {
    try {
        const batches = await DB.getAll('batches');
        const select = document.getElementById('batchSelect');
        select.innerHTML = '';

        if (batches && batches.length > 0) {
            batches.forEach(function (b) {
                const option = document.createElement('option');
                option.value = b.id;
                option.textContent = b.batch_number + ' - ' + b.type + ' (' + b.status + ')';
                select.appendChild(option);
            });
        } else {
            select.innerHTML = '<option value="">No batches available</option>';
        }
    } catch (error) {
        console.error('Error loading batches:', error);
    }
}

async function recordProduction() {
    const date = document.getElementById('prodDate').value;
    const notes = document.getElementById('prodNotes').value.trim();
    const batch_id = parseInt(document.getElementById('batchSelect').value) || 1;

    const small = parseInt(document.getElementById('smallEggs').value) || 0;
    const medium = parseInt(document.getElementById('mediumEggs').value) || 0;
    const large = parseInt(document.getElementById('largeEggs').value) || 0;
    const xl = parseInt(document.getElementById('xlEggs').value) || 0;
    const total = small + medium + large + xl;

    if (total === 0) {
        alert('Please enter the number of eggs produced');
        return;
    }

    const data = { date, batch_id, small_eggs: small, medium_eggs: medium, large_eggs: large, xl_eggs: xl, total, notes: notes || 'Normal production' };

    try {
        await DB.add('eggs', data);
        alert('Production recorded: ' + total + ' eggs!');
        document.getElementById('productionForm').reset();
        document.getElementById('prodDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('totalEggsDisplay').textContent = '0 eggs';
        document.querySelectorAll('.egg-sizes-grid input').forEach(function (input) { input.value = 0; });
        loadProduction();
        loadStats();
    } catch (error) {
        alert('Error recording production');
    }
}