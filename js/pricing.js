var eggChart = null;
var chickenChart = null;

function formatPricingDate(dateString) {
    if (!dateString) return 'N/A';
    try {
        var date = new Date(dateString);
        return date.toLocaleDateString('en-ZA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateString;
    }
}

function showPricingToast(message, type) {
    type = type || 'info';
    var existing = document.querySelectorAll('.toast');
    existing.forEach(function (t) { t.remove(); });

    var toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;

    var colors = { success: '#28A745', error: '#DC3545', info: '#0A1628' };
    toast.style.cssText =
        'position: fixed; top: 20px; right: 20px; padding: 14px 24px; ' +
        'background: ' + (colors[type] || colors.info) + '; color: white; ' +
        'border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); ' +
        'z-index: 2000; animation: slideIn 0.3s ease; font-family: Inter, sans-serif; ' +
        'font-size: 14px; font-weight: 500;';

    document.body.appendChild(toast);
    setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
}

function loadPricingData() {
    console.log('📊 Loading pricing data...');
    var pricing = DB.get('pricing');

    if (!pricing) {
        console.error('❌ No pricing data found! Creating default...');
        pricing = {
            eggTray: 120.00,
            eggPiece: 2.00,
            dressedChicken: 90.00,
            undressedChicken: 85.00,
            lastUpdated: new Date().toISOString()
        };
        DB.set('pricing', pricing);
    }

    console.log('📊 Current pricing:', pricing);

    document.getElementById('eggTrayPriceDisplay').textContent = 'R' + pricing.eggTray.toFixed(2);
    document.getElementById('eggPiecePriceDisplay').textContent = 'R' + pricing.eggPiece.toFixed(2);
    document.getElementById('dressedPriceDisplay').textContent = 'R' + pricing.dressedChicken.toFixed(2);
    document.getElementById('undressedPriceDisplay').textContent = 'R' + pricing.undressedChicken.toFixed(2);

    document.getElementById('eggTrayPriceInput').value = pricing.eggTray.toFixed(2);
    document.getElementById('eggPiecePriceInput').value = pricing.eggPiece.toFixed(2);
    document.getElementById('dressedChickenPriceInput').value = pricing.dressedChicken.toFixed(2);
    document.getElementById('undressedChickenPriceInput').value = pricing.undressedChicken.toFixed(2);

    if (pricing.lastUpdated) {
        document.getElementById('lastPriceUpdate').textContent = formatPricingDate(pricing.lastUpdated);
    }

    calculateChanges(pricing);
}

function calculateChanges(pricing) {
    var history = DB.get('priceHistory') || [];

    if (history.length < 2) {
        document.getElementById('eggTrayChange').textContent = '— No data';
        document.getElementById('eggPieceChange').textContent = '— No data';
        document.getElementById('dressedChange').textContent = '— No data';
        document.getElementById('undressedChange').textContent = '— No data';
        return;
    }

    var prev = history[history.length - 2];
    if (!prev || !prev.pricing) return;

    var old = prev.pricing;

    if (old.eggTray > 0) {
        var change = ((pricing.eggTray - old.eggTray) / old.eggTray * 100);
        var el = document.getElementById('eggTrayChange');
        el.textContent = (change >= 0 ? '▲' : '▼') + ' ' + Math.abs(change).toFixed(1) + '%';
        el.style.color = change >= 0 ? '#28A745' : '#DC3545';
    }

    if (old.eggPiece > 0) {
        var change = ((pricing.eggPiece - old.eggPiece) / old.eggPiece * 100);
        var el = document.getElementById('eggPieceChange');
        el.textContent = (change >= 0 ? '▲' : '▼') + ' ' + Math.abs(change).toFixed(1) + '%';
        el.style.color = change >= 0 ? '#28A745' : '#DC3545';
    }

    if (old.dressedChicken > 0) {
        var change = ((pricing.dressedChicken - old.dressedChicken) / old.dressedChicken * 100);
        var el = document.getElementById('dressedChange');
        el.textContent = (change >= 0 ? '▲' : '▼') + ' ' + Math.abs(change).toFixed(1) + '%';
        el.style.color = change >= 0 ? '#28A745' : '#DC3545';
    }

    if (old.undressedChicken > 0) {
        var change = ((pricing.undressedChicken - old.undressedChicken) / old.undressedChicken * 100);
        var el = document.getElementById('undressedChange');
        el.textContent = (change >= 0 ? '▲' : '▼') + ' ' + Math.abs(change).toFixed(1) + '%';
        el.style.color = change >= 0 ? '#28A745' : '#DC3545';
    }
}

function updateEggPrices() {
    console.log('🔄 Updating egg prices...');

    var trayPrice = parseFloat(document.getElementById('eggTrayPriceInput').value);
    var piecePrice = parseFloat(document.getElementById('eggPiecePriceInput').value);

    if (!isNaN(trayPrice) && trayPrice > 0) {
        document.getElementById('eggTrayPriceInput').value = trayPrice.toFixed(2);
    }
    if (!isNaN(piecePrice) && piecePrice > 0) {
        document.getElementById('eggPiecePriceInput').value = piecePrice.toFixed(2);
    }

    if (isNaN(trayPrice) || isNaN(piecePrice) || trayPrice <= 0 || piecePrice <= 0) {
        showPricingToast('Please enter valid prices', 'error');
        return;
    }

    var pricing = DB.get('pricing');
    if (!pricing) {
        showPricingToast('Error loading pricing data', 'error');
        return;
    }

    var oldTray = pricing.eggTray;
    var oldPiece = pricing.eggPiece;

    if (oldTray === trayPrice && oldPiece === piecePrice) {
        showPricingToast('No changes detected', 'info');
        return;
    }

    pricing.eggTray = trayPrice;
    pricing.eggPiece = piecePrice;
    pricing.lastUpdated = new Date().toISOString();
    DB.set('pricing', pricing);
    console.log('✅ Pricing updated:', pricing);

    var history = DB.get('priceHistory') || [];
    history.push({
        id: Date.now(),
        type: 'Eggs',
        pricing: JSON.parse(JSON.stringify(pricing)),
        details: 'Tray: R' + oldTray.toFixed(2) + ' → R' + trayPrice.toFixed(2) + ', Piece: R' + oldPiece.toFixed(2) + ' → R' + piecePrice.toFixed(2),
        date: new Date().toISOString()
    });
    DB.set('priceHistory', history);
    console.log('✅ History updated, entries:', history.length);

    showPricingToast('Egg prices updated successfully!', 'success');
    loadPricingData();
    loadPriceHistoryData();
    updateChartsData();
    updateInsightsData();
}

function updateChickenPrices() {
    console.log('🔄 Updating chicken prices...');

    var dressed = parseFloat(document.getElementById('dressedChickenPriceInput').value);
    var undressed = parseFloat(document.getElementById('undressedChickenPriceInput').value);

    if (!isNaN(dressed) && dressed > 0) {
        document.getElementById('dressedChickenPriceInput').value = dressed.toFixed(2);
    }
    if (!isNaN(undressed) && undressed > 0) {
        document.getElementById('undressedChickenPriceInput').value = undressed.toFixed(2);
    }

    if (isNaN(dressed) || isNaN(undressed) || dressed <= 0 || undressed <= 0) {
        showPricingToast('Please enter valid prices', 'error');
        return;
    }

    var pricing = DB.get('pricing');
    if (!pricing) {
        showPricingToast('Error loading pricing data', 'error');
        return;
    }

    var oldDressed = pricing.dressedChicken;
    var oldUndressed = pricing.undressedChicken;

    if (oldDressed === dressed && oldUndressed === undressed) {
        showPricingToast('No changes detected', 'info');
        return;
    }

    pricing.dressedChicken = dressed;
    pricing.undressedChicken = undressed;
    pricing.lastUpdated = new Date().toISOString();
    DB.set('pricing', pricing);
    console.log('✅ Pricing updated:', pricing);

    var history = DB.get('priceHistory') || [];
    history.push({
        id: Date.now(),
        type: 'Chickens',
        pricing: JSON.parse(JSON.stringify(pricing)),
        details: 'Dressed: R' + oldDressed.toFixed(2) + ' → R' + dressed.toFixed(2) + ', Undressed: R' + oldUndressed.toFixed(2) + ' → R' + undressed.toFixed(2),
        date: new Date().toISOString()
    });
    DB.set('priceHistory', history);
    console.log('✅ History updated, entries:', history.length);

    showPricingToast('Chicken prices updated successfully!', 'success');
    loadPricingData();
    loadPriceHistoryData();
    updateChartsData();
    updateInsightsData();
}

function loadPriceHistoryData() {
    console.log('📊 Loading price history...');
    var container = document.getElementById('priceHistoryContainer');
    var history = DB.get('priceHistory') || [];

    console.log('📊 Price history entries found:', history.length);

    document.getElementById('totalUpdates').textContent = history.length;

    if (history.length === 0) {
        container.innerHTML =
            '<div class="empty-state">' +
            '<span class="empty-icon">📊</span>' +
            '<p>No price updates recorded yet</p>' +
            '<span class="empty-sub">Update prices to start tracking history</span>' +
            '</div>';
        return;
    }

    var sorted = history.slice().sort(function (a, b) {
        return new Date(b.date) - new Date(a.date);
    });

    var html = '';
    for (var i = 0; i < sorted.length; i++) {
        var item = sorted[i];
        var typeClass = 'initial-type';
        var typeIcon = '📋';
        var bgColor = '#f0f4f8';
        var borderColor = '#dde4ec';

        if (item.type === 'Eggs') {
            typeClass = 'egg-type';
            typeIcon = '🥚';
            bgColor = 'rgba(201, 168, 76, 0.08)';
            borderColor = 'rgba(201, 168, 76, 0.2)';
        } else if (item.type === 'Chickens') {
            typeClass = 'chicken-type';
            typeIcon = '🐔';
            bgColor = 'rgba(10, 22, 40, 0.06)';
            borderColor = 'rgba(10, 22, 40, 0.12)';
        }

        var changes = item.details.split(', ');
        var changeHtml = '';
        for (var j = 0; j < changes.length; j++) {
            var parts = changes[j].split('→');
            if (parts.length === 2) {
                var label = parts[0].split(':')[0] || '';
                var oldVal = parts[0].split(':')[1] || '';
                var newVal = parts[1] || '';
                var isIncrease = parseFloat(newVal) > parseFloat(oldVal);
                changeHtml += '<div class="price-change-item">' +
                    '<span class="change-label">' + label.trim() + '</span>' +
                    '<span class="change-old">' + oldVal.trim() + '</span>' +
                    '<span class="change-arrow">→</span>' +
                    '<span class="change-new ' + (isIncrease ? 'increase' : 'decrease') + '">' + newVal.trim() + '</span>' +
                    '</div>';
            }
        }

        html += '<div class="history-card" style="background: ' + bgColor + '; border-left: 4px solid ' + borderColor + ';">' +
            '<div class="history-card-header">' +
            '<span class="history-type-badge ' + typeClass + '">' + typeIcon + ' ' + item.type + '</span>' +
            '<span class="history-date">' + formatPricingDate(item.date) + '</span>' +
            '</div>' +
            '<div class="history-card-body">' +
            changeHtml +
            '</div>' +
            '</div>';
    }
    container.innerHTML = html;
    console.log('✅ Price history loaded');
}

function initCharts() {
    console.log('📊 Initializing charts...');

    if (typeof Chart === 'undefined') {
        console.log('⏳ Chart.js not loaded, waiting...');
        document.addEventListener('chartjs-loaded', function () {
            console.log('✅ Chart.js loaded event received');
            createCharts();
        });
        setTimeout(function () {
            if (typeof Chart !== 'undefined') {
                createCharts();
            }
        }, 3000);
        return;
    }

    createCharts();
}

function createCharts() {
    console.log('📊 Creating charts...');
    createEggChart();
    createChickenChart();
    updateInsightsData();
    console.log('✅ Charts created successfully');
}

function createEggChart() {
    var canvas = document.getElementById('eggPriceChart');
    if (!canvas) {
        console.error('❌ Egg chart canvas not found');
        return;
    }

    var ctx = canvas.getContext('2d');
    var data = getChartData();

    if (eggChart) {
        eggChart.destroy();
        eggChart = null;
    }

    // If we have less than 2 data points, show a message
    if (data.eggTrayData.length < 2) {
        console.log('⚠️ Not enough data for egg chart');
        var parent = canvas.parentElement;
        parent.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;"><span style="font-size: 48px; display: block;">📊</span><p>Update prices to see trends</p><span style="font-size: 12px;">Need at least 2 price updates</span></div>';
        return;
    }

    try {
        eggChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Tray Price',
                        data: data.eggTrayData,
                        borderColor: '#C9A84C',
                        backgroundColor: 'rgba(201, 168, 76, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#C9A84C',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Per Egg',
                        data: data.eggPieceData,
                        borderColor: '#0A1628',
                        backgroundColor: 'rgba(10, 22, 40, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#0A1628',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': R' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            callback: function (v) { return 'R' + v.toFixed(2); },
                            stepSize: 10
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
        console.log('✅ Egg chart created');
    } catch (e) {
        console.error('❌ Error creating egg chart:', e);
    }
}

function createChickenChart() {
    var canvas = document.getElementById('chickenPriceChart');
    if (!canvas) {
        console.error('❌ Chicken chart canvas not found');
        return;
    }

    var ctx = canvas.getContext('2d');
    var data = getChartData();

    if (chickenChart) {
        chickenChart.destroy();
        chickenChart = null;
    }

    // If we have less than 2 data points, show a message
    if (data.dressedData.length < 2) {
        console.log('⚠️ Not enough data for chicken chart');
        var parent = canvas.parentElement;
        parent.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;"><span style="font-size: 48px; display: block;">📊</span><p>Update prices to see trends</p><span style="font-size: 12px;">Need at least 2 price updates</span></div>';
        return;
    }

    try {
        chickenChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [
                    {
                        label: 'Dressed',
                        data: data.dressedData,
                        borderColor: '#C9A84C',
                        backgroundColor: 'rgba(201, 168, 76, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#C9A84C',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Undressed',
                        data: data.undressedData,
                        borderColor: '#0A1628',
                        backgroundColor: 'rgba(10, 22, 40, 0.1)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#0A1628',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': R' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            callback: function (v) { return 'R' + v.toFixed(2); },
                            stepSize: 10
                        }
                    },
                    x: {
                        grid: { display: false }
                    }
                },
                interaction: { intersect: false, mode: 'index' }
            }
        });
        console.log('✅ Chicken chart created');
    } catch (e) {
        console.error('❌ Error creating chicken chart:', e);
    }
}

function getChartData() {
    var period = parseInt(document.getElementById('chartPeriod').value) || 30;
    var history = DB.get('priceHistory') || [];
    var current = DB.get('pricing') || {};

    var labels = [];
    var eggTrayData = [];
    var eggPieceData = [];
    var dressedData = [];
    var undressedData = [];

    var now = new Date();
    now.setHours(0, 0, 0, 0);

    for (var i = period - 1; i >= 0; i--) {
        var d = new Date(now);
        d.setDate(d.getDate() - i);
        labels.push(d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' }));

        var eggTray = null, eggPiece = null, dressed = null, undressed = null;

        for (var j = history.length - 1; j >= 0; j--) {
            var hd = new Date(history[j].date);
            hd.setHours(0, 0, 0, 0);

            if (hd <= d && history[j].pricing) {
                if (eggTray === null && history[j].pricing.eggTray !== undefined) {
                    eggTray = history[j].pricing.eggTray;
                }
                if (eggPiece === null && history[j].pricing.eggPiece !== undefined) {
                    eggPiece = history[j].pricing.eggPiece;
                }
                if (dressed === null && history[j].pricing.dressedChicken !== undefined) {
                    dressed = history[j].pricing.dressedChicken;
                }
                if (undressed === null && history[j].pricing.undressedChicken !== undefined) {
                    undressed = history[j].pricing.undressedChicken;
                }
                if (eggTray !== null && eggPiece !== null && dressed !== null && undressed !== null) break;
            }
        }

        eggTrayData.push(eggTray !== null ? eggTray : current.eggTray || 0);
        eggPieceData.push(eggPiece !== null ? eggPiece : current.eggPiece || 0);
        dressedData.push(dressed !== null ? dressed : current.dressedChicken || 0);
        undressedData.push(undressed !== null ? undressed : current.undressedChicken || 0);
    }

    return {
        labels: labels,
        eggTrayData: eggTrayData,
        eggPieceData: eggPieceData,
        dressedData: dressedData,
        undressedData: undressedData
    };
}

function updateChartsData() {
    if (eggChart && chickenChart) {
        var data = getChartData();
        eggChart.data.labels = data.labels;
        eggChart.data.datasets[0].data = data.eggTrayData;
        eggChart.data.datasets[1].data = data.eggPieceData;
        eggChart.update();

        chickenChart.data.labels = data.labels;
        chickenChart.data.datasets[0].data = data.dressedData;
        chickenChart.data.datasets[1].data = data.undressedData;
        chickenChart.update();

        updateInsightsData();
        console.log('✅ Charts updated');
    } else {
        console.log('⚠️ Charts not initialized, reinitializing...');
        // Recreate charts
        setTimeout(function () {
            if (typeof Chart !== 'undefined') {
                createCharts();
            } else {
                initCharts();
            }
        }, 500);
    }
}

function updateInsightsData() {
    var history = DB.get('priceHistory') || [];

    if (history.length === 0) {
        document.getElementById('priceStability').textContent = 'Not enough data';
        document.getElementById('highestPrice').textContent = 'No data yet';
        document.getElementById('priceChanges').textContent = 'No changes recorded';
        document.getElementById('averagePrice').textContent = 'No data yet';
        return;
    }

    var eggPrices = history
        .filter(function (h) { return h.pricing && h.pricing.eggTray > 0; })
        .map(function (h) { return h.pricing.eggTray; });

    if (eggPrices.length > 0) {
        var avg = eggPrices.reduce(function (a, b) { return a + b; }, 0) / eggPrices.length;
        var variance = eggPrices.reduce(function (a, b) { return a + Math.pow(b - avg, 2); }, 0) / eggPrices.length;
        var stability = variance < 10 ? 'Very Stable' : variance < 50 ? 'Moderate' : 'Volatile';
        document.getElementById('priceStability').textContent = stability + ' (Eggs)';

        var maxEgg = Math.max.apply(null, eggPrices);
        document.getElementById('highestPrice').textContent = 'R' + maxEgg.toFixed(2) + ' (Eggs)';

        var changes = history.filter(function (h, i) {
            if (i === 0) return false;
            var prev = history[i - 1];
            return h.pricing && prev.pricing && h.pricing.eggTray !== prev.pricing.eggTray;
        });
        document.getElementById('priceChanges').textContent = changes.length + ' changes total';

        var avgEgg = eggPrices.reduce(function (a, b) { return a + b; }, 0) / eggPrices.length;
        document.getElementById('averagePrice').textContent = 'R' + avgEgg.toFixed(2) + ' (Eggs)';
    }
}

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Pricing page loading...');

    loadPricingData();
    loadPriceHistoryData();

    document.querySelectorAll('.input-with-icon input').forEach(function (input) {
        input.addEventListener('blur', function () {
            var val = parseFloat(this.value);
            if (!isNaN(val) && val > 0) {
                this.value = val.toFixed(2);
            }
        });
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                var val = parseFloat(this.value);
                if (!isNaN(val) && val > 0) {
                    this.value = val.toFixed(2);
                }
            }
        });
    });

    setTimeout(function () {
        if (typeof Chart !== 'undefined') {
            initCharts();
        } else {
            document.addEventListener('chartjs-loaded', function () {
                initCharts();
            });
            setTimeout(function () {
                if (typeof Chart !== 'undefined') {
                    initCharts();
                }
            }, 3000);
        }
    }, 500);

    document.getElementById('eggPricingForm').addEventListener('submit', function (e) {
        e.preventDefault();
        updateEggPrices();
    });

    document.getElementById('chickenPricingForm').addEventListener('submit', function (e) {
        e.preventDefault();
        updateChickenPrices();
    });

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

            if (this.dataset.tab === 'graphs') {
                setTimeout(function () {
                    if (eggChart) { eggChart.resize(); eggChart.update(); }
                    if (chickenChart) { chickenChart.resize(); chickenChart.update(); }
                }, 200);
            }

            if (this.dataset.tab === 'history') {
                loadPriceHistoryData();
            }
        });
    });

    document.getElementById('chartPeriod').addEventListener('change', function () {
        updateChartsData();
    });

    document.getElementById('refreshChartBtn').addEventListener('click', function () {
        loadPricingData();
        loadPriceHistoryData();
        updateChartsData();
        showPricingToast('Chart refreshed!', 'success');
    });

    console.log('✅ Pricing page ready');
});