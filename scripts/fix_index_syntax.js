const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(indexPath, 'utf8');

// Use function replacement so JS regex / replace tokens like $' are NOT expanded
const searchStr = content.substring(content.indexOf("if (rolePrice)"), content.indexOf("function setPaymentMethod"));

const goodBlock = `if (rolePrice) rolePrice.textContent = '$' + priceVal.toFixed(2) + ' / mo';\r
      const totalDue = isAnnual ? info.annualTotal : info.monthly;\r
      if (totalPrice) totalPrice.textContent = '$' + totalDue.toFixed(2) + (isAnnual ? ' / year' : ' / month');\r
      if (btnText) btnText.textContent = 'Pay $' + totalDue.toFixed(2) + ' & Launch Dashboard';\r
    }\r
\r
    `;

content = content.replace(searchStr, () => goodBlock);
fs.writeFileSync(indexPath, content, 'utf8');
console.log('Fixed using functional replacement!');
