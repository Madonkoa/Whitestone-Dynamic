(function () {
    console.log('📊 Loading Chart.js from CDN...');

    if (typeof Chart !== 'undefined') {
        console.log('✅ Chart.js already loaded');
        return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
    script.onload = function () {
        console.log('✅ Chart.js loaded successfully!');
        document.dispatchEvent(new Event('chartjs-loaded'));
    };
    script.onerror = function () {
        console.error('❌ Failed to load Chart.js, trying fallback...');
        var fallback = document.createElement('script');
        fallback.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.0/chart.umd.min.js';
        fallback.onload = function () {
            console.log('✅ Chart.js loaded from fallback!');
            document.dispatchEvent(new Event('chartjs-loaded'));
        };
        fallback.onerror = function () {
            console.error('❌ Failed to load Chart.js');
        };
        document.head.appendChild(fallback);
    };
    document.head.appendChild(script);
})();