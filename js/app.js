// ============================================
// PASSWORD HASHING
// ============================================

function hashPassword(password) {
    if (!password) return '';
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'hash_' + Math.abs(hash).toString(16);
}

// ============================================
// DATABASE HANDLER
// ============================================

const DB = {
    get: function (key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from localStorage:', e);
            return null;
        }
    },
    set: function (key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to localStorage:', e);
            return false;
        }
    },
    getAll: function (key) {
        return this.get(key) || [];
    },
    add: function (key, item) {
        const items = this.getAll(key);
        item.id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        items.push(item);
        this.set(key, items);
        return item;
    },
    update: function (key, id, updatedItem) {
        const items = this.getAll(key);
        const index = items.findIndex(i => i.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updatedItem };
            this.set(key, items);
            return true;
        }
        return false;
    },
    delete: function (key, id) {
        const items = this.getAll(key);
        const filtered = items.filter(i => i.id !== id);
        this.set(key, filtered);
        return true;
    },
    find: function (key, predicate) {
        const items = this.getAll(key);
        return items.find(predicate);
    },
    filter: function (key, predicate) {
        const items = this.getAll(key);
        return items.filter(predicate);
    }
};

// ============================================
// PERMISSIONS DEFINITIONS
// ============================================

const PERMISSIONS = {
    DASHBOARD: 'dashboard',
    EMPLOYEES_VIEW: 'employees_view',
    EMPLOYEES_CRUD: 'employees_crud',
    STOCK_VIEW: 'stock_view',
    STOCK_CRUD: 'stock_crud',
    FEED_VIEW: 'feed_view',
    FEED_CRUD: 'feed_crud',
    COOPS_VIEW: 'coops_view',
    COOPS_CRUD: 'coops_crud',
    EGGS_VIEW: 'eggs_view',
    EGGS_CRUD: 'eggs_crud',
    SALES_VIEW: 'sales_view',
    SALES_CRUD: 'sales_crud',
    CHICKENS_VIEW: 'chickens_view',
    CHICKENS_CRUD: 'chickens_crud',
    CUSTOMERS_VIEW: 'customers_view',
    CUSTOMERS_CRUD: 'customers_crud',
    BATCHES_VIEW: 'batches_view',
    BATCHES_CRUD: 'batches_crud',
    PRICING_VIEW: 'pricing_view',
    PRICING_CRUD: 'pricing_crud',
    SECURITY_VIEW: 'security_view',
    SECURITY_CRUD: 'security_crud',
    EQUIPMENT_VIEW: 'equipment_view',
    EQUIPMENT_CRUD: 'equipment_crud'
};

// ============================================
// ROLE PERMISSIONS
// ============================================

const ROLE_PERMISSIONS = {
    owner: [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.EMPLOYEES_VIEW, PERMISSIONS.EMPLOYEES_CRUD,
        PERMISSIONS.STOCK_VIEW, PERMISSIONS.STOCK_CRUD,
        PERMISSIONS.FEED_VIEW, PERMISSIONS.FEED_CRUD,
        PERMISSIONS.COOPS_VIEW, PERMISSIONS.COOPS_CRUD,
        PERMISSIONS.EGGS_VIEW, PERMISSIONS.EGGS_CRUD,
        PERMISSIONS.SALES_VIEW, PERMISSIONS.SALES_CRUD,
        PERMISSIONS.CHICKENS_VIEW, PERMISSIONS.CHICKENS_CRUD,
        PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_CRUD,
        PERMISSIONS.BATCHES_VIEW, PERMISSIONS.BATCHES_CRUD,
        PERMISSIONS.PRICING_VIEW, PERMISSIONS.PRICING_CRUD,
        PERMISSIONS.SECURITY_VIEW, PERMISSIONS.SECURITY_CRUD,
        PERMISSIONS.EQUIPMENT_VIEW, PERMISSIONS.EQUIPMENT_CRUD
    ],
    manager: [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.EMPLOYEES_VIEW,
        PERMISSIONS.STOCK_VIEW, PERMISSIONS.STOCK_CRUD,
        PERMISSIONS.FEED_VIEW, PERMISSIONS.FEED_CRUD,
        PERMISSIONS.COOPS_VIEW, PERMISSIONS.COOPS_CRUD,
        PERMISSIONS.EGGS_VIEW, PERMISSIONS.EGGS_CRUD,
        PERMISSIONS.SALES_VIEW, PERMISSIONS.SALES_CRUD,
        PERMISSIONS.CHICKENS_VIEW, PERMISSIONS.CHICKENS_CRUD,
        PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_CRUD,
        PERMISSIONS.BATCHES_VIEW, PERMISSIONS.BATCHES_CRUD,
        PERMISSIONS.PRICING_VIEW,
        PERMISSIONS.SECURITY_VIEW, PERMISSIONS.SECURITY_CRUD,
        PERMISSIONS.EQUIPMENT_VIEW, PERMISSIONS.EQUIPMENT_CRUD
    ],
    foreman: [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.STOCK_VIEW,
        PERMISSIONS.FEED_VIEW, PERMISSIONS.FEED_CRUD,
        PERMISSIONS.COOPS_VIEW, PERMISSIONS.COOPS_CRUD,
        PERMISSIONS.EGGS_VIEW, PERMISSIONS.EGGS_CRUD,
        PERMISSIONS.CHICKENS_VIEW, PERMISSIONS.CHICKENS_CRUD,
        PERMISSIONS.BATCHES_VIEW, PERMISSIONS.BATCHES_CRUD,
        PERMISSIONS.SECURITY_VIEW,
        PERMISSIONS.EQUIPMENT_VIEW, PERMISSIONS.EQUIPMENT_CRUD
    ],
    farmer: [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.FEED_VIEW,
        PERMISSIONS.COOPS_VIEW,
        PERMISSIONS.EGGS_VIEW,
        PERMISSIONS.CHICKENS_VIEW,
        PERMISSIONS.BATCHES_VIEW,
        PERMISSIONS.SECURITY_VIEW
    ],
    sales: [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.SALES_VIEW, PERMISSIONS.SALES_CRUD,
        PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_CRUD,
        PERMISSIONS.PRICING_VIEW
    ],
    accountant: [
        PERMISSIONS.DASHBOARD,
        PERMISSIONS.EMPLOYEES_VIEW,
        PERMISSIONS.SALES_VIEW,
        PERMISSIONS.CUSTOMERS_VIEW,
        PERMISSIONS.PRICING_VIEW, PERMISSIONS.PRICING_CRUD
    ]
};

// ============================================
// ACCESS CONTROL FUNCTIONS
// ============================================

function hasPermission(permission) {
    var user = getCurrentUser();
    if (!user) return false;

    // OWNER HAS ALL PERMISSIONS - Check position, role, AND username
    if (user.position === 'Owner' || user.role === 'owner' || user.username === 'admin') {
        return true;
    }

    // MANAGER has most permissions (but not employee CRUD)
    if (user.position === 'Manager' || user.role === 'manager') {
        if (permission === PERMISSIONS.EMPLOYEES_VIEW) return true;
        if (permission === PERMISSIONS.EMPLOYEES_CRUD) return false;
        if (permission === PERMISSIONS.PRICING_CRUD) return false;
        return true;
    }

    var userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
}

function canViewPage(page) {
    var user = getCurrentUser();
    if (!user) return false;

    // OWNER CAN VIEW EVERYTHING
    if (user.position === 'Owner' || user.role === 'owner' || user.username === 'admin') {
        return true;
    }

    var pageMap = {
        'dashboard.html': PERMISSIONS.DASHBOARD,
        'employees.html': PERMISSIONS.EMPLOYEES_VIEW,
        'stock.html': PERMISSIONS.STOCK_VIEW,
        'feed.html': PERMISSIONS.FEED_VIEW,
        'coops.html': PERMISSIONS.COOPS_VIEW,
        'eggs.html': PERMISSIONS.EGGS_VIEW,
        'sales.html': PERMISSIONS.SALES_VIEW,
        'chickens.html': PERMISSIONS.CHICKENS_VIEW,
        'customers.html': PERMISSIONS.CUSTOMERS_VIEW,
        'batches.html': PERMISSIONS.BATCHES_VIEW,
        'pricing.html': PERMISSIONS.PRICING_VIEW,
        'security.html': PERMISSIONS.SECURITY_VIEW,
        'equipment.html': PERMISSIONS.EQUIPMENT_VIEW
    };

    var required = pageMap[page];
    if (!required) return false;
    return hasPermission(required);
}

function canEdit(page) {
    var user = getCurrentUser();
    if (!user) return false;

    // OWNER CAN EDIT EVERYTHING
    if (user.position === 'Owner' || user.role === 'owner' || user.username === 'admin') {
        return true;
    }

    var pageMap = {
        'employees.html': PERMISSIONS.EMPLOYEES_CRUD,
        'stock.html': PERMISSIONS.STOCK_CRUD,
        'feed.html': PERMISSIONS.FEED_CRUD,
        'coops.html': PERMISSIONS.COOPS_CRUD,
        'eggs.html': PERMISSIONS.EGGS_CRUD,
        'sales.html': PERMISSIONS.SALES_CRUD,
        'chickens.html': PERMISSIONS.CHICKENS_CRUD,
        'customers.html': PERMISSIONS.CUSTOMERS_CRUD,
        'batches.html': PERMISSIONS.BATCHES_CRUD,
        'pricing.html': PERMISSIONS.PRICING_CRUD,
        'security.html': PERMISSIONS.SECURITY_CRUD,
        'equipment.html': PERMISSIONS.EQUIPMENT_CRUD
    };

    var required = pageMap[page];
    if (!required) return false;
    return hasPermission(required);
}

// ============================================
// MAKE FUNCTIONS GLOBALLY AVAILABLE
// ============================================

window.DB = DB;
window.PERMISSIONS = PERMISSIONS;
window.ROLE_PERMISSIONS = ROLE_PERMISSIONS;
window.hashPassword = hashPassword;
window.hasPermission = hasPermission;
window.canViewPage = canViewPage;
window.canEdit = canEdit;
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.clearCurrentUser = clearCurrentUser;
window.isAuthenticated = isAuthenticated;
window.hasAccess = hasAccess;
window.logout = logout;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.getStatusClass = getStatusClass;

// ============================================
// DATABASE INITIALIZATION
// ============================================

function initDatabase() {
    console.log('🔄 Initializing database...');
    var now = new Date();

    // ============================================
    // EMPLOYEES - WITH ROLES AND ACCESS RIGHTS
    // ============================================
    if (!DB.get('employees')) {
        DB.set('employees', [
            {
                id: 1,
                username: 'admin',
                password: '',
                name: 'Nomagugu',
                surname: 'Admin',
                dob: '1990-01-01',
                address: '123 Main Street',
                position: 'Owner',
                role: 'owner',
                accessRights: 'admin,manager,owner',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                username: 'thabang',
                password: hashPassword('owner123'),
                name: 'Thabang',
                surname: 'Madonko',
                dob: '1988-03-20',
                address: '789 Owner Street',
                position: 'Owner',
                role: 'owner',
                accessRights: 'admin,manager,owner',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                username: 'sarah',
                password: hashPassword('manager123'),
                name: 'Sarah',
                surname: 'Ndlovu',
                dob: '1992-07-10',
                address: '321 Manager Ave',
                position: 'Manager',
                role: 'manager',
                accessRights: 'admin,manager',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 4,
                username: 'david',
                password: hashPassword('foreman123'),
                name: 'David',
                surname: 'Mokoena',
                dob: '1990-05-15',
                address: '555 Farm Road',
                position: 'Production Foreman',
                role: 'foreman',
                accessRights: 'farmer',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 5,
                username: 'joe',
                password: hashPassword('farmer123'),
                name: 'Farmer',
                surname: 'Joe',
                dob: '1985-05-15',
                address: '456 Farm Road',
                position: 'Farmer',
                role: 'farmer',
                accessRights: 'farmer',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 6,
                username: 'grace',
                password: hashPassword('sales123'),
                name: 'Grace',
                surname: 'Nkosi',
                dob: '1994-08-22',
                address: '123 Sales Ave',
                position: 'Sales Representative',
                role: 'sales',
                accessRights: 'sales',
                isActive: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 7,
                username: 'peter',
                password: hashPassword('finance123'),
                name: 'Peter',
                surname: 'Zulu',
                dob: '1987-11-10',
                address: '456 Finance Road',
                position: 'Accountant',
                role: 'accountant',
                accessRights: 'accountant',
                isActive: true,
                createdAt: new Date().toISOString()
            }
        ]);
        console.log('✅ Employees created with roles');
    }

    // ============================================
    // CUSTOMERS
    // ============================================
    if (!DB.get('customers')) {
        DB.set('customers', [
            { id: 1, name: 'Prince Owusu', phone: '0712345678', email: 'prince@email.com', address: '123 City Centre', type: 'wholesale', totalPurchases: 187450, lastPurchase: new Date(now - 86400000 * 2).toISOString(), createdAt: new Date(now - 86400000 * 700).toISOString() },
            { id: 2, name: 'Mary Molefe', phone: '0723456789', email: 'mary@email.com', address: '456 Township Road', type: 'regular', totalPurchases: 45230, lastPurchase: new Date(now - 86400000 * 5).toISOString(), createdAt: new Date(now - 86400000 * 400).toISOString() },
            { id: 3, name: 'Peter Mokoena', phone: '0734567890', email: 'peter@email.com', address: '789 Village Street', type: 'wholesale', totalPurchases: 234780, lastPurchase: new Date(now - 86400000 * 1).toISOString(), createdAt: new Date(now - 86400000 * 600).toISOString() },
            { id: 4, name: 'Thabo Nkosi', phone: '0745678901', email: 'thabo@email.com', address: '321 Suburb Ave', type: 'regular', totalPurchases: 12890, lastPurchase: new Date(now - 86400000 * 10).toISOString(), createdAt: new Date(now - 86400000 * 200).toISOString() },
            { id: 5, name: 'Grace Dlamini', phone: '0756789012', email: 'grace@email.com', address: '654 Rural Road', type: 'vip', totalPurchases: 87650, lastPurchase: new Date(now - 86400000 * 3).toISOString(), createdAt: new Date(now - 86400000 * 500).toISOString() },
            { id: 6, name: 'James Mokoena', phone: '0767890123', email: 'james@email.com', address: '987 Urban Street', type: 'wholesale', totalPurchases: 156780, lastPurchase: new Date(now - 86400000 * 7).toISOString(), createdAt: new Date(now - 86400000 * 550).toISOString() },
            { id: 7, name: 'Lindiwe Zulu', phone: '0778901234', email: 'lindiwe@email.com', address: '147 Town Centre', type: 'regular', totalPurchases: 23450, lastPurchase: new Date(now - 86400000 * 15).toISOString(), createdAt: new Date(now - 86400000 * 300).toISOString() },
            { id: 8, name: 'Sipho Ndlovu', phone: '0789012345', email: 'sipho@email.com', address: '258 Country Lane', type: 'vip', totalPurchases: 54320, lastPurchase: new Date(now - 86400000 * 4).toISOString(), createdAt: new Date(now - 86400000 * 350).toISOString() }
        ]);
        console.log('✅ Customers created');
    }

    // ============================================
    // STOCK
    // ============================================
    if (!DB.get('stock')) {
        DB.set('stock', [
            { id: 1, itemType: 'broiler', quantity: 320, unit: 'bird', price: 85.00, lastUpdated: new Date().toISOString() },
            { id: 2, itemType: 'layer', quantity: 240, unit: 'bird', price: 0, lastUpdated: new Date().toISOString() },
            { id: 3, itemType: 'egg', quantity: 540, unit: 'tray', price: 120.00, lastUpdated: new Date().toISOString() }
        ]);
        console.log('✅ Stock created');
    }

    // ============================================
    // FEED
    // ============================================
    if (!DB.get('feed')) {
        DB.set('feed', [
            { id: 1, feedType: 'Layer Feed Premium', quantityKg: 1850, lastUpdated: new Date().toISOString() },
            { id: 2, feedType: 'Layer Feed Standard', quantityKg: 1200, lastUpdated: new Date().toISOString() },
            { id: 3, feedType: 'Broiler Starter', quantityKg: 900, lastUpdated: new Date().toISOString() },
            { id: 4, feedType: 'Broiler Finisher', quantityKg: 700, lastUpdated: new Date().toISOString() }
        ]);
        console.log('✅ Feed created');
    }

    // ============================================
    // COOPS
    // ============================================
    if (!DB.get('coops')) {
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
        console.log('✅ Coops created');
    }

    // ============================================
    // BATCHES
    // ============================================
    if (!DB.get('batches')) {
        var batches = [];
        var batchTypes = ['Broiler', 'Layer', 'Broiler', 'Layer', 'Broiler'];
        var statuses = ['Active', 'Completed', 'Active', 'Completed', 'Active'];
        for (var i = 1; i <= 20; i++) {
            var d = new Date(now);
            d.setDate(d.getDate() - (i * 25));
            var type = batchTypes[i % batchTypes.length];
            var status = i <= 6 ? 'Active' : statuses[i % statuses.length];
            var quantity = Math.floor(Math.random() * 150) + 80;
            batches.push({
                id: i,
                batchNumber: 'B-' + (2024 + Math.floor(i / 10)) + '-' + String(i).padStart(4, '0'),
                type: type,
                quantity: quantity,
                age: Math.floor(Math.random() * 20) + 2,
                status: status,
                startDate: d.toISOString().split('T')[0],
                notes: status === 'Active' ? 'Currently in production - healthy flock' : 'Batch completed - good yield',
                createdAt: d.toISOString()
            });
        }
        DB.set('batches', batches);
        console.log('✅ Batches created');
    }

    // ============================================
    // EGGS PRODUCTION
    // ============================================
    if (!DB.get('eggs')) {
        var eggs = [];
        var batchNumbers = ['B-2024-0001', 'B-2024-0002', 'B-2024-0003', 'B-2025-0001', 'B-2025-0002', 'B-2025-0003', 'B-2026-0001', 'B-2026-0002'];
        for (var i = 1; i <= 365; i++) {
            var d = new Date(now);
            d.setDate(d.getDate() - i);
            var batch = batchNumbers[i % batchNumbers.length];
            var total = Math.floor(Math.random() * 600) + 200;
            var small = Math.floor(total * (0.05 + Math.random() * 0.08));
            var medium = Math.floor(total * (0.40 + Math.random() * 0.15));
            var large = Math.floor(total * (0.30 + Math.random() * 0.15));
            var xl = total - small - medium - large;
            eggs.push({
                id: i,
                date: d.toISOString().split('T')[0],
                batchId: (i % 8) + 1,
                batchNumber: batch,
                small: Math.max(0, small),
                medium: Math.max(0, medium),
                large: Math.max(0, large),
                xl: Math.max(0, xl),
                total: total,
                notes: ['Good production day', 'Normal production', 'Excellent yield!', 'Average day', 'Slight drop - weather', 'Steady production', 'High quality eggs'][i % 7],
                recordedAt: d.toISOString()
            });
        }
        DB.set('eggs', eggs);
        console.log('✅ Eggs production created (365 days)');
    }

    // ============================================
    // EGG SALES
    // ============================================
    if (!DB.get('sales')) {
        var sales = [];
        var customerNames = ['Prince Owusu', 'Mary Molefe', 'Peter Mokoena', 'Thabo Nkosi', 'Grace Dlamini', 'James Mokoena', 'Lindiwe Zulu', 'Sipho Ndlovu'];
        var sizes = ['medium', 'large', 'small', 'xl'];
        for (var i = 1; i <= 300; i++) {
            var d = new Date(now);
            d.setDate(d.getDate() - (i * 2));
            var buyer = customerNames[i % customerNames.length];
            var size = sizes[i % sizes.length];
            var crates = Math.floor(Math.random() * 25) + 2;
            var pieces = Math.floor(Math.random() * 29);
            var pricePerCrate = size === 'large' ? 145 : size === 'xl' ? 165 : size === 'small' ? 105 : 125;
            var totalEggs = (crates * 30) + pieces;
            sales.push({
                id: i,
                type: 'egg',
                buyerName: buyer,
                saleDate: d.toISOString().split('T')[0],
                eggSize: size,
                crates: crates,
                pieces: pieces,
                pricePerCrate: pricePerCrate,
                totalEggs: totalEggs,
                total: crates * pricePerCrate,
                notes: ['Fresh farm eggs', 'Weekly delivery', 'Regular customer order', 'Bulk purchase', 'Premium quality', 'Special order'][i % 6],
                recordedAt: d.toISOString()
            });
        }
        DB.set('sales', sales);
        console.log('✅ Egg sales created (300)');
    }

    // ============================================
    // CHICKEN SALES
    // ============================================
    if (!DB.get('chickenSales')) {
        var chickenSales = [];
        var chickenBuyers = ['Mrs Phiri', 'Mr Ndlovu', 'Mrs Dlamini', 'Mr Khumalo', 'Mrs Mokoena', 'Mr Zulu', 'Mrs Nkosi', 'Mr Dube'];
        for (var i = 1; i <= 150; i++) {
            var d = new Date(now);
            d.setDate(d.getDate() - (i * 3));
            var buyer = chickenBuyers[i % chickenBuyers.length];
            var type = i % 2 === 0 ? 'broiler' : 'layer';
            var quantity = Math.floor(Math.random() * 25) + 3;
            var price = type === 'broiler' ? 85 : 120;
            var status = i % 3 === 0 ? 'dressed' : 'undressed';
            chickenSales.push({
                id: i,
                type: 'chicken',
                buyer: buyer,
                saleDate: d.toISOString().split('T')[0],
                chickenType: type,
                quantity: quantity,
                price: price,
                status: status,
                total: quantity * price,
                notes: status === 'dressed' ? 'Dressed chicken - ready for cooking' : 'Live chicken - fresh from farm',
                recordedAt: d.toISOString()
            });
        }
        DB.set('chickenSales', chickenSales);
        console.log('✅ Chicken sales created (150)');
    }

    // ============================================
    // CHICKENS
    // ============================================
    if (!DB.get('chickens')) {
        var chickens = [];
        for (var i = 1; i <= 25; i++) {
            var d = new Date(now);
            d.setDate(d.getDate() - (i * 18));
            var type = i % 2 === 0 ? 'broiler' : 'layer';
            var quantity = Math.floor(Math.random() * 120) + 40;
            var age = Math.floor(Math.random() * 22) + 2;
            var health = ['Good', 'Excellent', 'Fair', 'Good', 'Excellent'][i % 5];
            var ready = age >= 6 && type === 'broiler';
            var sold = i > 12;
            chickens.push({
                id: i,
                type: type,
                batch: 'B-' + (2024 + Math.floor(i / 8)) + '-' + String(i).padStart(3, '0'),
                quantity: sold ? Math.floor(quantity * 0.15) : quantity,
                age: age,
                health: health,
                readyForSale: ready,
                eggProduction: type === 'layer' ? Math.round(quantity * 0.75) : 0,
                sold: sold,
                addedAt: d.toISOString()
            });
        }
        DB.set('chickens', chickens);
        console.log('✅ Chickens created');
    }

    // ============================================
    // EQUIPMENT
    // ============================================
    if (!DB.get('equipment')) {
        DB.set('equipment', [
            { id: 1, name: 'Chicken Mesh - Perimeter', condition: 'Good', purchaseDate: '2024-01-15', lastMaintenance: '2025-12-01', notes: '200m perimeter fencing - replaced 2024' },
            { id: 2, name: 'Chicken Mesh - Coop 1', condition: 'Excellent', purchaseDate: '2024-01-15', lastMaintenance: '2025-12-10', notes: 'Coop 1 enclosure - like new' },
            { id: 3, name: 'Water Troughs (Large)', condition: 'Good', purchaseDate: '2024-02-20', lastMaintenance: '2025-11-15', notes: '12 units - 50L each - regular cleaning' },
            { id: 4, name: 'Water Troughs (Small)', condition: 'Fair', purchaseDate: '2024-03-01', lastMaintenance: '2025-10-20', notes: '8 units - 20L each - need replacement soon' },
            { id: 5, name: 'Automatic Feeders', condition: 'Excellent', purchaseDate: '2024-03-10', lastMaintenance: '2025-12-10', notes: '15 automatic feeders - excellent condition' },
            { id: 6, name: 'Manual Feeders', condition: 'Good', purchaseDate: '2024-03-10', lastMaintenance: '2025-11-25', notes: '20 manual feeders - all working' },
            { id: 7, name: 'Incubator', condition: 'Good', purchaseDate: '2024-04-01', lastMaintenance: '2025-11-01', notes: '150 egg capacity - hatching weekly' },
            { id: 8, name: 'Security Cameras', condition: 'Excellent', purchaseDate: '2024-05-15', lastMaintenance: '2025-12-01', notes: '4 cameras - 24/7 monitoring' },
            { id: 9, name: 'Generator', condition: 'Good', purchaseDate: '2024-06-01', lastMaintenance: '2025-11-20', notes: 'Backup power - 5kVA - serviced' },
            { id: 10, name: 'Egg Candler', condition: 'Excellent', purchaseDate: '2024-07-01', lastMaintenance: '2025-12-05', notes: 'Quality checking - daily use' }
        ]);
        console.log('✅ Equipment created');
    }

    // ============================================
    // SECURITY
    // ============================================
    if (!DB.get('security')) {
        var security = [];
        var incidentTypes = ['Predator Attack', 'Theft', 'Trespassing', 'Equipment Damage', 'Vandalism', 'Other'];
        var descriptions = {
            'Predator Attack': 'Jackal spotted near Coop 2 at 2am. Mesh repaired. All birds safe. Security patrol increased.',
            'Theft': 'Attempted theft at back gate. Cameras installed. Police report filed.',
            'Trespassing': 'Suspicious person seen near perimeter. Police notified. No breach.',
            'Equipment Damage': 'Water pump motor burned out. Replaced with spare. Back up operational.',
            'Vandalism': 'Fence cut near Coop 1. Repaired same day. Increased patrols.',
            'Other': 'Minor incident - chicken got out. Returned safely.'
        };
        for (var i = 1; i <= 25; i++) {
            var d = new Date(now);
            d.setDate(d.getDate() - (i * 14));
            var type = incidentTypes[i % incidentTypes.length];
            security.push({
                id: i,
                incidentType: type,
                description: descriptions[type] || 'Incident reported and handled',
                dateReported: d.toISOString(),
                resolved: i > 4 ? 1 : 0
            });
        }
        DB.set('security', security);
        console.log('✅ Security created');
    }

    // ============================================
    // FEED CONSUMPTION
    // ============================================
    if (!DB.get('feedConsumption')) {
        var feedConsumption = [];
        var feedTypes = ['Layer Feed Premium', 'Layer Feed Standard', 'Broiler Starter', 'Broiler Finisher'];
        for (var i = 1; i <= 365; i++) {
            var d = new Date(now);
            d.setDate(d.getDate() - i);
            var feedType = feedTypes[i % feedTypes.length];
            var bags = Math.floor(Math.random() * 10) + 3;
            feedConsumption.push({
                id: i,
                feedType: feedType,
                date: d.toISOString().split('T')[0],
                bags: bags,
                size: 50,
                totalKg: bags * 50,
                condition: ['Good condition', 'Slightly moist - still good', 'Excellent quality', 'Normal', 'Dry & clean', 'Good batch'][i % 6],
                recordedAt: d.toISOString()
            });
        }
        DB.set('feedConsumption', feedConsumption);
        console.log('✅ Feed consumption created (365 days)');
    }

    // ============================================
    // FEED STOCK RECORDS
    // ============================================
    if (!DB.get('feedStockRecords')) {
        var feedStockRecords = [];
        var feedTypes2 = ['Layer Feed Premium', 'Layer Feed Standard', 'Broiler Starter', 'Broiler Finisher'];
        for (var i = 1; i <= 60; i++) {
            var d = new Date(now);
            d.setDate(d.getDate() - (i * 6));
            var feedType = feedTypes2[i % feedTypes2.length];
            var bags = Math.floor(Math.random() * 30) + 15;
            var costPerBag = feedType.includes('Premium') ? 350 : feedType.includes('Starter') ? 280 : 320;
            feedStockRecords.push({
                id: i,
                feedType: feedType,
                date: d.toISOString().split('T')[0],
                bags: bags,
                size: 50,
                totalKg: bags * 50,
                totalCost: bags * costPerBag,
                recordedAt: d.toISOString()
            });
        }
        DB.set('feedStockRecords', feedStockRecords);
        console.log('✅ Feed stock records created');
    }

    // ============================================
    // PRICING
    // ============================================
    var pricingHistory = [];
    var eggTray = 115, eggPiece = 1.90, dressedChicken = 85, undressedChicken = 60;
    for (var i = 365; i >= 0; i--) {
        var d = new Date(now);
        d.setDate(d.getDate() - i);
        eggTray += (Math.random() - 0.45) * 2.5;
        eggTray = Math.max(110, Math.min(145, eggTray));
        eggPiece += (Math.random() - 0.45) * 0.04;
        eggPiece = Math.max(1.80, Math.min(2.40, eggPiece));
        dressedChicken += (Math.random() - 0.45) * 1.5;
        dressedChicken = Math.max(80, Math.min(105, dressedChicken));
        undressedChicken += (Math.random() - 0.45) * 1.2;
        undressedChicken = Math.max(55, Math.min(75, undressedChicken));
        pricingHistory.push({
            eggTray: Math.round(eggTray * 100) / 100,
            eggPiece: Math.round(eggPiece * 100) / 100,
            dressedChicken: Math.round(dressedChicken * 100) / 100,
            undressedChicken: Math.round(undressedChicken * 100) / 100,
            lastUpdated: d.toISOString()
        });
    }

    var currentPricing = pricingHistory[pricingHistory.length - 1];
    DB.set('pricing', currentPricing);

    var history = [];
    for (var i = 0; i < pricingHistory.length; i++) {
        var p = pricingHistory[i];
        var prev = i > 0 ? pricingHistory[i - 1] : null;
        var details = '';
        var type = 'Initial Setup';
        if (i === 0) {
            details = 'Initial setup: Tray R' + p.eggTray.toFixed(2) + ', Egg R' + p.eggPiece.toFixed(2) +
                ', Dressed R' + p.dressedChicken.toFixed(2) + ', Undressed R' + p.undressedChicken.toFixed(2);
        } else if (prev) {
            var changes = [];
            if (p.eggTray !== prev.eggTray) changes.push('Tray: R' + prev.eggTray.toFixed(2) + ' → R' + p.eggTray.toFixed(2));
            if (p.eggPiece !== prev.eggPiece) changes.push('Piece: R' + prev.eggPiece.toFixed(2) + ' → R' + p.eggPiece.toFixed(2));
            if (p.dressedChicken !== prev.dressedChicken) changes.push('Dressed: R' + prev.dressedChicken.toFixed(2) + ' → R' + p.dressedChicken.toFixed(2));
            if (p.undressedChicken !== prev.undressedChicken) changes.push('Undressed: R' + prev.undressedChicken.toFixed(2) + ' → R' + p.undressedChicken.toFixed(2));
            details = changes.join(', ');
            type = changes.length > 0 ? (i % 2 === 0 ? 'Eggs' : 'Chickens') : 'No Change';
        }
        history.push({
            id: Date.now() + i,
            type: type,
            pricing: JSON.parse(JSON.stringify(p)),
            details: details || 'Price update',
            date: p.lastUpdated
        });
    }
    DB.set('priceHistory', history);
    console.log('✅ Price history created');

    console.log('✅ Database complete!');
}

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

function getCurrentUser() {
    var userData = sessionStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
}

function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
    sessionStorage.setItem('lastActivity', Date.now().toString());
}

function clearCurrentUser() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('lastActivity');
    sessionStorage.removeItem('rememberMe');
}

function isAuthenticated() {
    return getCurrentUser() !== null;
}

function hasAccess(requiredRights) {
    var user = getCurrentUser();
    if (!user) return false;
    var userRights = user.accessRights ? user.accessRights.split(',') : [];
    var required = requiredRights.split(',');
    return required.some(function (right) { return userRights.includes(right.trim()); });
}

function logout() {
    clearCurrentUser();
    window.location.href = 'login.html';
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    var date = new Date(dateString);
    return date.toLocaleDateString('en-ZA');
}

function formatCurrency(amount) {
    return 'R' + parseFloat(amount).toFixed(2);
}

function getStatusClass(status) {
    var map = {
        'Good': 'status-good',
        'Fair': 'status-fair',
        'Poor': 'status-poor',
        'Critical': 'status-poor',
        'Excellent': 'status-good',
        'Broken': 'status-poor'
    };
    return map[status] || 'status-fair';
}

// ============================================
// DOCUMENT READY
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 App initializing...');
    initDatabase();

    var userDisplay = document.getElementById('userDisplay');
    var userRoleDisplay = document.getElementById('userRoleDisplay');
    if (userDisplay) {
        var user = getCurrentUser();
        if (user) {
            userDisplay.textContent = user.name || user.username;
            if (userRoleDisplay) {
                userRoleDisplay.textContent = user.position || 'User';
            }
        }
    }

    var logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    var currentDate = document.getElementById('currentDate');
    if (currentDate) {
        var now = new Date();
        currentDate.textContent = now.toLocaleDateString('en-ZA', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    var protectedPages = ['dashboard.html', 'employees.html', 'stock.html', 'feed.html', 'coops.html', 'eggs.html', 'sales.html', 'security.html', 'equipment.html', 'chickens.html', 'pricing.html', 'customers.html', 'batches.html'];
    var currentPage = window.location.pathname.split('/').pop();

    if (protectedPages.includes(currentPage)) {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
        } else if (!canViewPage(currentPage)) {
            window.location.href = 'dashboard.html';
        }
    }

    console.log('✅ App initialized!');
});

var style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
document.head.appendChild(style);