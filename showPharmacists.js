const Database = require('better-sqlite3');
const db = new Database('medpress.sqlite');
const pharmacists = db.prepare('SELECT * FROM pharmacists').all();
console.log('Pharmacists:', pharmacists);
db.close(); 