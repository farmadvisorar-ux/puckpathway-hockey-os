const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

let updated = 0;
for (const file of htmlFiles) {
  const filePath = path.join(rootDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  if (content.includes('custom.css')) {
    continue;
  }

  // Insert before </head>
  if (content.includes('</head>')) {
    content = content.replace('</head>', '  <link rel="stylesheet" href="static/css/custom.css">\n</head>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Linked custom.css in: ${file}`);
    updated++;
  } else {
    console.warn(`Could not find </head> in ${file}`);
  }
}

console.log(`Total HTML files updated: ${updated}`);
