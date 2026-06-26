document.addEventListener('DOMContentLoaded', function () {
    loadPricing();
    loadHistory();
    setupTabs();

    document.getElementById('eggPricingForm').addEventListener('submit', function (e) {
        e.preventDefault();
        updateEggPrices();
    });

    document.getElementById('chickenPricingForm').addEventListener('submit', function (e) {
        e.preventDefault();
        updateChickenPrices();
    });

    document.getElementById('refreshChartBtn').addEventListener('click', function () {
        loadPricing();
        loadHistory();
        alert('Refreshed!');
    });
});

async function loadPricing() {
    try {
        const pricing = await DB.getAll('pricing');
        const p = pricing && pricing.length > 0 ? pricing[0] : { egg_tray: 0, egg_piece: 0, dressed_chicken: 0, undressed_chicken: 0 };

        document.getElementById('eggTrayPriceDisplay').textContent = 'R' + (p.egg_tray || 0).toFixed(2);
        document.getElementById('eggPiecePriceDisplay').textContent = 'R' + (p.egg_piece || 0).toFixed(2);
        document.getElementById('dressedPriceDisplay').textContent = 'R' + (p.dressed_chicken || 0).toFixed(2);
        document.getElementById('undressedPriceDisplay').textContent = 'R' + (p.undressed_chicken || 0).toFixed(2);

        document.getElementById('eggTrayPriceInput').value = p.egg_tray || 0;
        document.getElementById('eggPiecePriceInput').value = p.egg_piece || 0;
        document.getElementById('dressedChickenPriceInput').value = p.dressed_chicken || 0;
        document.getElementById('undressedChickenPriceInput').value = p.undressed_chicken || 0;

        if (p.last_updated) {
            document.getElementById('lastPriceUpdate').textContent = formatDate(p.last_updated);
        }
    } catch (error) {
        console.error('Error loading pricing:', error);
    }
}

async function loadHistory() {
    try {
        const history = await DB.getAll('pricingHistory') || [];
        const container = document.getElementById('priceHistoryContainer');
        container.innerHTML = '';

        if (!history || history.length === 0) {
            container.innerHTML = '<div class="empty-state"><span class="empty-icon">📊</span><p>No price history</p></div>';
            return;
        }

        document.getElementById('totalUpdates').textContent = history.length;

        const sorted = history.sort(function (a, b) { return new Date(b.last_updated) - new Date(a.last_updated); });
        sorted.forEach(function (h) {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML =
                '<div class="history-header">' +
                '<span class="history-type">Price Update</span>' +
                '<span class="history-date">' + formatDate(h.last_updated) + '</span>' +
                '</div>' +
                '<div class="history-details">' +
                'Tray: R' + h.egg_tray.toFixed(2) + ' | ' +
                'Egg: R' + h.egg_piece.toFixed(2) + ' | ' +
                'Dressed: R' + h.dressed_chicken.toFixed(2) + ' | ' +
                'Undressed: R' + h.undressed_chicken.toFixed(2) +
                '</div>';
            container.appendChild(div);
        });
    } catch (error) {
        console.error('Error loading price history:', error);
    }
}

function setupTabs() {
    document.querySelectorAll('.pricing-tabs .tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
            document.querySelectorAll('.pricing-tabs .tab-btn').forEach(function (b) {
                b.classList.remove('active');
            });
            this.classList.add('active');

            document.querySelectorAll('.tab-content').forEach(function (tc) {
                tc.classList.remove('active');
            });
            document.getElementById(this.dataset.tab + '-tab').classList.add('active');

            if (this.dataset.tab === 'history') {
                loadHistory();
            }
        });
    });
}

async function updateEggPrices() {
    const tray = parseFloat(document.getElementById('eggTrayPriceInput').value);
    const piece = parseFloat(document.getElementById('eggPiecePriceInput').value);

    if (isNaN(tray) || isNaN(piece) || tray <= 0 || piece <= 0) {
        alert('Please enter valid prices');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/pricing', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                egg_tray: tray,
                egg_piece: piece,
                dressed_chicken: parseFloat(document.getElementById('dressedChickenPriceInput').value) || 0,
                undressed_chicken: parseFloat(document.getElementById('undressedChickenPriceInput').value) || 0
            })
        });
        const result = await response.json();
        if (result.success) {
            alert('Pricing updated!');
            loadPricing();
            loadHistory();
        } else {
            alert('Error updating pricing');
        }
    } catch (error) {
        alert('Error updating pricing');
    }
}

async function updateChickenPrices() {
    const dressed = parseFloat(document.getElementById('dressedChickenPriceInput').value);
    const undressed = parseFloat(document.getElementById('undressedChickenPriceInput').value);

    if (isNaN(dressed) || isNaN(undressed) || dressed <= 0 || undressed <= 0) {
        alert('Please enter valid prices');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/pricing', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                egg_tray: parseFloat(document.getElementById('eggTrayPriceInput').value) || 0,
                egg_piece: parseFloat(document.getElementById('eggPiecePriceInput').value) || 0,
                dressed_chicken: dressed,
                undressed_chicken: undressed
            })
        });
        const result = await response.json();
        if (result.success) {
            alert('Pricing updated!');
            loadPricing();
            loadHistory();
        } else {
            alert('Error updating pricing');
        }
    } catch (error) {
        alert('Error updating pricing');
    }
}