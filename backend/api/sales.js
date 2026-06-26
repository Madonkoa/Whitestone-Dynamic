const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/sales.json');

function readSales() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            const defaultData = [
                { id: '1', type: 'egg', customer: 'Mary Molefe', quantity: 347, amount: 1595.00, date: '2026-06-24', description: 'large eggs', status: 'completed' },
                { id: '2', type: 'egg', customer: 'Peter Mokoena', quantity: 375, amount: 1260.00, date: '2026-06-23', description: 'small eggs', status: 'completed' },
                { id: '3', type: 'egg', customer: 'Thabo Nkosi', quantity: 388, amount: 1980.00, date: '2026-06-22', description: 'xl eggs', status: 'completed' },
                { id: '4', type: 'chicken', customer: 'Sipho Zulu', quantity: 45, amount: 4500.00, date: '2026-06-20', description: 'broilers', status: 'completed' }
            ];
            fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
            return defaultData;
        }
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
        return [];
    }
}

function writeSales(sales) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(sales, null, 2));
        return true;
    } catch (error) {
        return false;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

function calculateStats(sales) {
    let totalEggs = 0, totalChickens = 0, totalRevenue = 0, monthlyRevenue = 0;
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    sales.forEach(sale => {
        const qty = parseInt(sale.quantity) || 0;
        const amount = parseFloat(sale.amount) || 0;
        if (sale.type === 'egg') totalEggs += qty;
        else if (sale.type === 'chicken') totalChickens += qty;
        totalRevenue += amount;
        try {
            const saleDate = new Date(sale.date);
            if (saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear) {
                monthlyRevenue += amount;
            }
        } catch (e) {}
    });

    return { totalEggs, totalChickens, totalRevenue, monthlyRevenue, totalTransactions: sales.length };
}

router.get('/', (req, res) => {
    try {
        res.json(readSales());
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sales' });
    }
});

router.get('/stats', (req, res) => {
    try {
        const sales = readSales();
        res.json(calculateStats(sales));
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

router.get('/:id', (req, res) => {
    try {
        const sales = readSales();
        const sale = sales.find(s => s.id === req.params.id);
        if (!sale) return res.status(404).json({ error: 'Sale not found' });
        res.json(sale);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch sale' });
    }
});

router.post('/', (req, res) => {
    try {
        const sales = readSales();
        const { type, customer, quantity, amount, date, description, status } = req.body;
        if (!type || !customer || !quantity || !amount) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const newSale = {
            id: generateId(),
            type,
            customer,
            quantity: parseInt(quantity),
            amount: parseFloat(amount),
            date: date || new Date().toISOString().split('T')[0],
            description: description || '',
            status: status || 'completed'
        };
        sales.unshift(newSale);
        writeSales(sales);
        res.status(201).json(newSale);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create sale' });
    }
});

router.put('/:id', (req, res) => {
    try {
        const sales = readSales();
        const index = sales.findIndex(s => s.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Sale not found' });
        const { type, customer, quantity, amount, date, description, status } = req.body;
        sales[index] = { ...sales[index], type: type || sales[index].type, customer: customer || sales[index].customer, quantity: quantity !== undefined ? parseInt(quantity) : sales[index].quantity, amount: amount !== undefined ? parseFloat(amount) : sales[index].amount, date: date || sales[index].date, description: description !== undefined ? description : sales[index].description, status: status || sales[index].status };
        writeSales(sales);
        res.json(sales[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update sale' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        const sales = readSales();
        const index = sales.findIndex(s => s.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Sale not found' });
        const deleted = sales.splice(index, 1);
        writeSales(sales);
        res.json({ message: 'Sale deleted successfully', deleted: deleted[0] });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete sale' });
    }
});

module.exports = router;
