// chart.js - Load Chart.js from CDN
// This file dynamically loads the Chart.js library

(function loadChartJS() {
    console.log('Loading Chart.js from CDN...');

    // Check if Chart.js is already loaded
    if (typeof Chart !== 'undefined') {
        console.log('Chart.js already loaded');
        return;
    }

    // Create script element
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.async = true;

    script.onload = function () {
        console.log('Chart.js loaded successfully!');
        // Dispatch event so other scripts know Chart.js is ready
        document.dispatchEvent(new Event('chartjs-loaded'));
    };

    script.onerror = function () {
        console.error('Failed to load Chart.js from CDN');
        // Try alternative CDN
        var altScript = document.createElement('script');
        altScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';
        altScript.async = true;
        altScript.onload = function () {
            console.log('Chart.js loaded from alternative CDN!');
            document.dispatchEvent(new Event('chartjs-loaded'));
        };
        altScript.onerror = function () {
            console.error('Failed to load Chart.js from alternative CDN');
            document.dispatchEvent(new Event('chartjs-error'));
        };
        document.head.appendChild(altScript);
    };

    document.head.appendChild(script);
})();