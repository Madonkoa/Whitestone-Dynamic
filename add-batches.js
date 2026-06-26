const db = require('./config/database');

console.log('Adding batch examples...');

const batches = [
    {
        batch_number: 'B-2026-0005',
        type: 'Layer',
        quantity: 450,
        age: 32,
        status: 'Active',
        start_date: '2025-11-15',
        notes: 'Peak production, excellent health'
    },
    {
        batch_number: 'B-2026-0006',
        type: 'Broiler',
        quantity: 300,
        age: 6,
        status: 'Growing',
        start_date: '2026-05-10',
        notes: 'Growing well, good feed conversion'
    },
    {
        batch_number: 'B-2026-0007',
        type: 'Layer',
        quantity: 350,
        age: 55,
        status: 'Completed',
        start_date: '2025-07-01',
        notes: 'Completed cycle, good production'
    },
    {
        batch_number: 'B-2026-0008',
        type: 'Broiler',
        quantity: 280,
        age: 8,
        status: 'Sold',
        start_date: '2026-04-01',
        notes: 'Sold to commercial buyer'
    },
    {
        batch_number: 'B-2026-0009',
        type: 'Layer',
        quantity: 200,
        age: 12,
        status: 'Growing',
        start_date: '2026-04-20',
        notes: 'Pullets growing into layers'
    },
    {
        batch_number: 'B-2026-0010',
        type: 'Broiler',
        quantity: 500,
        age: 4,
        status: 'Growing',
        start_date: '2026-05-25',
        notes: 'Day-old chicks, healthy'
    },
    {
        batch_number: 'B-2026-0011',
        type: 'Layer',
        quantity: 400,
        age: 45,
        status: 'Culled',
        start_date: '2026-02-01',
        notes: 'Production dropped below threshold'
    },
    {
        batch_number: 'B-2026-0012',
        type: 'Layer',
        quantity: 250,
        age: 60,
        status: 'Completed',
        start_date: '2025-08-15',
        notes: 'Excellent production history'
    },
    {
        batch_number: 'B-2026-0013',
        type: 'Broiler',
        quantity: 350,
        age: 5,
        status: 'Growing',
        start_date: '2026-05-15',
        notes: 'Vaccinated, good growth'
    },
    {
        batch_number: 'B-2026-0014',
        type: 'Layer',
        quantity: 300,
        age: 15,
        status: 'Active',
        start_date: '2026-03-15',
        notes: 'Entering peak production'
    }
];

let added = 0;
let skipped = 0;

batches.forEach(function(b) {
    db.get('SELECT * FROM batches WHERE batch_number = ?', [b.batch_number], function(err, existing) {
        if (err) {
            console.error('Error checking batch:', err.message);
            return;
        }
        if (existing) {
            console.log('⚠️ Batch ' + b.batch_number + ' already exists, skipping...');
            skipped++;
            return;
        }
        db.run(
            'INSERT INTO batches (batch_number, type, quantity, age, status, start_date, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [b.batch_number, b.type, b.quantity, b.age, b.status, b.start_date, b.notes],
            function(err) {
                if (err) {
                    console.error('Error adding batch:', err.message);
                } else {
                    console.log('✅ Added: ' + b.batch_number + ' (' + b.status + ')');
                    added++;
                }
            }
        );
    });
});

setTimeout(function() {
    console.log('');
    console.log('========================================');
    console.log('✅ BATCH ADDITION COMPLETE!');
    console.log('   Added: ' + added + ' batches');
    console.log('   Skipped: ' + skipped + ' batches (already exist)');
    console.log('========================================');
    console.log('');
    console.log('📌 Now refresh: http://localhost:5501/batches.html');
    process.exit(0);
}, 2000);
