const fs = require('fs');
const path = require('path');

const loginPath = path.resolve(__dirname, '..', 'login.html');
let html = fs.readFileSync(loginPath, 'utf8');

// 1. Add auto_mailer.js before auth_engine.js
if (!html.includes('static/js/auto_mailer.js')) {
  html = html.replace(
    '<script src="static/js/auth_engine.js"></script>',
    '<script src="static/js/auto_mailer.js"></script>\r\n  <script src="static/js/auth_engine.js"></script>'
  );
}

// 2. Replace forgotPasswordModal
const oldModalTarget = '  <!-- 6. FORGOT PASSWORD MODAL -->';
const oldModalEnd = '  <!-- COMPREHENSIVE FOOTER -->';
const startIdx = html.indexOf(oldModalTarget);
const endIdx = html.indexOf(oldModalEnd);

if (startIdx !== -1 && endIdx !== -1) {
  const newModal = `  <!-- 6. FORGOT PASSWORD MODAL (2-Step OTP Reset Flow) -->
  <div id="forgotPasswordModal" class="fixed inset-0 z-50 modal-backdrop hidden flex items-center justify-center p-4">
    <div class="bg-slate-950 border border-slate-800 rounded-3xl max-w-md w-full flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
      <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-lg">
            <i class="fa-solid fa-key"></i>
          </div>
          <div>
            <h3 class="text-base font-black text-white">Reset Credentials</h3>
            <p class="text-xs text-slate-400">Password Recovery & 6-Digit OTP Verification</p>
          </div>
        </div>
        <button onclick="closeModal('forgotPasswordModal')" class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition text-lg cursor-pointer">
          ✕
        </button>
      </div>

      <div class="p-6 space-y-4 text-xs text-slate-300 font-sans">
        
        <!-- STEP 1: Enter Email -->
        <div id="forgotStep1" class="space-y-3">
          <p>
            Enter your registered email address below. We'll dispatch a 6-digit cryptographic verification code via <strong class="text-sky-300">furrhjohn10@gmail.com</strong> (Display: <strong class="text-emerald-400 font-mono">draftlineup.com</strong>).
          </p>
          <form onsubmit="handleForgotRequestCode(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-mono font-bold text-slate-300 mb-1">Registered Account Email</label>
              <input type="email" id="forgotEmailInput" required placeholder="e.g. dmarr@nhlcentralscouting.com or your email" class="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs glow-input">
            </div>
            <button type="submit" id="forgotSendCodeBtn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-600/20 transition cursor-pointer flex items-center justify-center gap-2">
              <span>✉️</span>
              <span id="forgotSendBtnText">Send 6-Digit Reset Code via Mailer</span>
            </button>
          </form>
          <div class="flex items-center justify-between text-[11px] pt-1">
            <button type="button" onclick="if(window.DraftLineupMailer) window.DraftLineupMailer.openOutboxModal()" class="text-sky-400 hover:text-sky-300 underline cursor-pointer">
              Inspect Live Mailer Outbox &rarr;
            </button>
            <span class="text-slate-500 font-mono">15m Code Expiry</span>
          </div>
        </div>

        <!-- STEP 2: Enter OTP & New Password -->
        <div id="forgotStep2" class="hidden space-y-3">
          <div class="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span class="text-slate-400">Target: <strong id="forgotTargetEmailLabel" class="text-white font-mono"></strong></span>
            <button type="button" onclick="resetForgotStep1()" class="text-sky-400 hover:text-sky-300 text-[10px] underline cursor-pointer">Change Email</button>
          </div>

          <form onsubmit="handleForgotCompleteReset(event)" class="space-y-3">
            <div>
              <label class="block text-xs font-mono font-bold text-amber-300 mb-1">6-Digit Verification Code</label>
              <div class="flex items-center gap-2">
                <input type="text" id="forgotCodeInput" maxlength="6" required placeholder="123456" class="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-500/60 text-white text-sm font-mono text-center tracking-widest font-bold glow-input">
                <button type="button" onclick="quickFillForgotCode()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-[10px] font-bold shrink-0 border border-slate-700 cursor-pointer" title="Quick fill from outbox">
                  ⚡ Fill Code
                </button>
              </div>
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-slate-300 mb-1">New Password</label>
              <input type="password" id="forgotNewPassInput" required minlength="6" placeholder="••••••••••••" class="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs glow-input font-mono">
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-slate-300 mb-1">Confirm New Password</label>
              <input type="password" id="forgotConfirmPassInput" required minlength="6" placeholder="••••••••••••" class="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs glow-input font-mono">
            </div>

            <button type="submit" id="forgotSubmitNewPassBtn" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/20 transition cursor-pointer">
              ✓ Reset Password & Sign In
            </button>
          </form>

          <div class="flex items-center justify-between text-[11px] pt-1">
            <button type="button" onclick="resetForgotStep1()" class="text-slate-400 hover:text-white underline cursor-pointer">
              &larr; Back
            </button>
            <button type="button" onclick="if(window.DraftLineupMailer) window.DraftLineupMailer.openOutboxModal()" class="text-sky-400 hover:text-sky-300 underline cursor-pointer">
              Inspect Live Mailer Outbox &rarr;
            </button>
          </div>
        </div>

        <div class="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <strong class="text-slate-300">Quick Demo Tip:</strong> All pre-seeded demo accounts (Dan Marr, Adam Nightingale, Michael Hage, Sarah Hage) use password <code class="text-sky-300 font-mono">password123</code> or the instant 1-click demo buttons!
        </div>

      </div>
    </div>
  </div>\r\n\r\n`;
  html = html.substring(0, startIdx) + newModal + html.substring(endIdx);
}

// 3. Update JavaScript functions
const oldForgotFunc = '    function handleForgotSubmit(e) {';
const oldForgotFuncIdx = html.indexOf(oldForgotFunc);
if (oldForgotFuncIdx !== -1) {
  const nextFuncIdx = html.indexOf('    // Initialize default role on load', oldForgotFuncIdx);
  if (nextFuncIdx !== -1) {
    const newForgotFunctions = `    // =========================================================================
    // Password Reset Auto-Responder Workflow (2-Step OTP)
    // =========================================================================
    let currentForgotEmail = "";

    function handleForgotRequestCode(e) {
      if (e) e.preventDefault();
      const email = document.getElementById('forgotEmailInput').value.trim();
      if (!email) {
        if (window.BlueLineUI) BlueLineUI.showToast('Please enter your account email.', 'warning');
        return;
      }
      currentForgotEmail = email;

      const btn = document.getElementById('forgotSendCodeBtn');
      const text = document.getElementById('forgotSendBtnText');
      if (text) text.textContent = "Dispatching Verification Code...";
      if (btn) btn.disabled = true;

      // Dispatch password reset via DraftLineupMailer
      if (window.DraftLineupMailer && typeof window.DraftLineupMailer.sendPasswordReset === 'function') {
        window.DraftLineupMailer.sendPasswordReset(email);
      }

      setTimeout(() => {
        if (btn) btn.disabled = false;
        if (text) text.textContent = "Send 6-Digit Reset Code via Mailer";
        
        // Advance to Step 2
        document.getElementById('forgotStep1').classList.add('hidden');
        document.getElementById('forgotStep2').classList.remove('hidden');
        document.getElementById('forgotTargetEmailLabel').textContent = email;
        
        if (window.BlueLineUI) {
          BlueLineUI.showToast(\`Verification code sent to \${email} via furrhjohn10@gmail.com!\`, 'success', 5000);
        }
      }, 400);
    }

    function resetForgotStep1() {
      document.getElementById('forgotStep1').classList.remove('hidden');
      document.getElementById('forgotStep2').classList.add('hidden');
    }

    function quickFillForgotCode() {
      if (!currentForgotEmail) return;
      if (window.DraftLineupMailer && typeof window.DraftLineupMailer.getOutbox === 'function') {
        const outbox = window.DraftLineupMailer.getOutbox();
        const match = outbox.find(m => m.type === 'PASSWORD_RESET' && m.to.toLowerCase() === currentForgotEmail.toLowerCase());
        if (match && match.code) {
          document.getElementById('forgotCodeInput').value = match.code;
          if (window.BlueLineUI) BlueLineUI.showToast(\`Auto-filled OTP: \${match.code}\`, 'info');
        } else {
          if (window.BlueLineUI) BlueLineUI.showToast('No active reset code found in mailer queue.', 'warning');
        }
      }
    }

    function handleForgotCompleteReset(e) {
      if (e) e.preventDefault();
      const email = currentForgotEmail || document.getElementById('forgotEmailInput').value.trim();
      const code = document.getElementById('forgotCodeInput').value.trim();
      const newPass = document.getElementById('forgotNewPassInput').value.trim();
      const confirmPass = document.getElementById('forgotConfirmPassInput').value.trim();

      if (!code || code.length !== 6) {
        if (window.BlueLineUI) BlueLineUI.showToast('Please enter the 6-digit verification code.', 'warning');
        return;
      }
      if (!newPass || newPass.length < 6) {
        if (window.BlueLineUI) BlueLineUI.showToast('Password must be at least 6 characters.', 'warning');
        return;
      }
      if (newPass !== confirmPass) {
        if (window.BlueLineUI) BlueLineUI.showToast('Passwords do not match.', 'error');
        return;
      }

      // Verify code
      if (window.DraftLineupMailer && typeof window.DraftLineupMailer.verifyResetCode === 'function') {
        const res = window.DraftLineupMailer.verifyResetCode(email, code);
        if (!res.success) {
          if (window.BlueLineUI) BlueLineUI.showToast(res.message, 'error');
          return;
        }
      }

      // Update password in storage & session
      try {
        const raw = localStorage.getItem('blueline_registered_users');
        let accounts = raw ? JSON.parse(raw) : [];
        let user = accounts.find(a => (a.email && a.email.toLowerCase() === email.toLowerCase()) || (a.username && a.username.toLowerCase() === email.toLowerCase()));
        
        if (user) {
          user.password = newPass;
          user.password_updated_at = new Date().toISOString();
        } else {
          // Create or update demo persona session
          user = {
            id: 'usr_' + Date.now().toString(36),
            username: email.split('@')[0],
            name: email.split('@')[0],
            email: email,
            role: 'scout',
            badge: 'VERIFIED USER',
            avatar: '👤',
            verified: true,
            password: newPass
          };
          accounts.push(user);
        }
        localStorage.setItem('blueline_registered_users', JSON.stringify(accounts));
        localStorage.setItem('blueline_auth_user', JSON.stringify(user));
        localStorage.removeItem('blueline_signed_out');
      } catch(err) {}

      if (window.BlueLineUI) {
        BlueLineUI.showToast('✓ Password updated successfully! Access granted.', 'success', 4500);
      }

      closeModal('forgotPasswordModal');

      // Pre-fill password on main login form
      const passField = document.getElementById('loginPassword');
      if (passField) passField.value = newPass;
      const emailField = document.getElementById('loginEmail');
      if (emailField) emailField.value = email;

      setTimeout(() => {
        window.location.href = 'scout.html';
      }, 600);
    }

    function handleForgotSubmit(e) {
      handleForgotRequestCode(e);
    }

`;
    html = html.substring(0, oldForgotFuncIdx) + newForgotFunctions + html.substring(nextFuncIdx);
  }
}

fs.writeFileSync(loginPath, html, 'utf8');
console.log('Successfully updated login.html with 2-step OTP password reset workflow!');
