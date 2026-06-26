// currency.js - Shared currency formatting
// Place this in a separate file or include in each page

function formatCurrency(amount) {
    if (amount === undefined || amount === null) return 'R0.00';
    var num = parseFloat(amount);
    if (isNaN(num)) return 'R0.00';
    var parts = num.toFixed(2).split('.');
    var integerPart = parts[0];
    var decimalPart = parts[1];
    // Add space for thousands
    var withSpaces = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return 'R' + withSpaces + '.' + decimalPart;
}
