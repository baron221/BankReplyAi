const fs = require('fs');
const file = process.argv[2];
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/^pick /, 'edit ');
fs.writeFileSync(file, content);
