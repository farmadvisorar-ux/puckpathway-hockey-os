const fs = require('fs');
const path = require('path');

const signupPath = path.resolve(__dirname, '..', 'signup.html');
let html = fs.readFileSync(signupPath, 'utf8');

if (!html.includes('static/js/auto_mailer.js')) {
  html = html.replace(
    '<script src="static/js/auth_engine.js"></script>',
    '<script src="static/js/auto_mailer.js"></script>\r\n  <script src="static/js/auth_engine.js"></script>'
  );
}

// Add mailer dispatch to handleSignupSubmit
if (!html.includes('DraftLineupMailer.sendSignupConfirmation')) {
  const targetCode = '        localStorage.setItem(\'blueline_registered_users\', JSON.stringify(accs));\r\n      } catch(err) {}';
  const replacementCode = `        localStorage.setItem('blueline_registered_users', JSON.stringify(accs));
      } catch(err) {}

      // Dispatch automated sign-up confirmation auto-responder
      if (window.DraftLineupMailer && typeof window.DraftLineupMailer.sendSignupConfirmation === 'function') {
        window.DraftLineupMailer.sendSignupConfirmation(newUser);
      }`;
  
  if (html.includes("localStorage.setItem('blueline_registered_users', JSON.stringify(accs));")) {
    html = html.replace(
      /localStorage\.setItem\('blueline_registered_users', JSON\.stringify\(accs\)\);\s*\} catch\(err\) \{\}/,
      `localStorage.setItem('blueline_registered_users', JSON.stringify(accs));\r\n      } catch(err) {}\r\n\r\n      // Dispatch automated sign-up confirmation auto-responder\r\n      if (window.DraftLineupMailer && typeof window.DraftLineupMailer.sendSignupConfirmation === 'function') {\r\n        window.DraftLineupMailer.sendSignupConfirmation(newUser);\r\n      }`
    );
  }
}

fs.writeFileSync(signupPath, html, 'utf8');
console.log('Successfully updated signup.html with auto-mailer dispatch!');
