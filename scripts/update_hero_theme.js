const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Replace dark hero title style
content = content.replace(
  `style="color:#0b192c !important; font-weight:900; font-size:3.25rem; line-height:1.15; letter-spacing:-0.03em; margin:0 0 1.25rem;"`,
  `style="font-weight:900; font-size:3.25rem; line-height:1.15; letter-spacing:-0.03em; margin:0 0 1.25rem; background:linear-gradient(180deg, #ffffff 0%, #cbd5e1 75%, #94a3b8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent;"`
);

content = content.replace(
  `style="color:#0284c7 !important;"`,
  `style="background:linear-gradient(135deg, #38bdf8 0%, #818cf8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent;"`
);

content = content.replace(
  `style="color:#1e293b !important; font-size:1.25rem; font-weight:600; line-height:1.6; max-width:820px; margin:0 auto 2rem auto;"`,
  `style="color:#94a3b8 !important; font-size:1.25rem; font-weight:500; line-height:1.6; max-width:820px; margin:0 auto 2rem auto;"`
);

fs.writeFileSync(indexPath, content, 'utf8');
console.log('Successfully updated hero section styling in index.html');
