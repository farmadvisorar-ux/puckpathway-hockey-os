/**
 * DraftLineup.com - Core Platform Engine (v3.0 Major Upgrade)
 * Universal telemetry, Command Palette (Ctrl+K), Audio Synthesizer, Toast System, and Search Index
 */

(function (global) {
  'use strict';

  // --- Audio Synthesizer (Web Audio API) ---
  const playSound = (type = 'click') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'click') {
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.16); // G5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      }
    } catch (e) {
      // Audio context silenced or blocked
    }
  };

  // --- Toast Notification System ---
  const toast = (title, message, type = 'info', duration = 3500) => {
    let container = document.getElementById('draftlineup-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'draftlineup-toast-container';
      container.className = 'fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none';
      document.body.appendChild(container);
    }

    const toastEl = document.createElement('div');
    const borderColors = {
      success: 'border-emerald-500/60 bg-slate-900/95 text-emerald-300',
      info: 'border-cyan-500/60 bg-slate-900/95 text-cyan-300',
      warning: 'border-amber-500/60 bg-slate-900/95 text-amber-300',
      error: 'border-red-500/60 bg-slate-900/95 text-red-300'
    };

    const icons = {
      success: '✓',
      info: '⚡',
      warning: '⚠',
      error: '✕'
    };

    toastEl.className = `pointer-events-auto p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 transform translate-y-4 opacity-0 flex items-start gap-3 ${borderColors[type] || borderColors.info}`;
    toastEl.innerHTML = `
      <div className="w-6 h-6 rounded-full bg-slate-800 border border-current flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
        ${icons[type] || '⚡'}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-slate-100 leading-snug">${title}</h4>
        ${message ? `<p className="text-xs text-slate-300 mt-0.5 leading-relaxed">${message}</p>` : ''}
      </div>
      <button className="text-slate-400 hover:text-slate-100 text-xs font-bold shrink-0 ml-1" onclick="this.parentElement.remove()">✕</button>
    `;

    container.appendChild(toastEl);
    playSound(type === 'error' ? 'alert' : type === 'success' ? 'success' : 'click');

    setTimeout(() => {
      toastEl.classList.remove('translate-y-4', 'opacity-0');
    }, 10);

    setTimeout(() => {
      toastEl.classList.add('opacity-0', 'translate-y-2');
      setTimeout(() => toastEl.remove(), 300);
    }, duration);
  };

  // --- Global Command Palette (Ctrl + K / Cmd + K) ---
  const initCommandPalette = () => {
    if (document.getElementById('draftlineup-cmd-modal')) return;

    const modal = document.createElement('div');
    modal.id = 'draftlineup-cmd-modal';
    modal.className = 'fixed inset-0 z-[10000] hidden items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150';
    modal.innerHTML = `
      <div className="relative w-full max-w-xl bg-slate-900 border border-cyan-500/30 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[80vh]">
        <!-- Search Header -->
        <div className="p-4 border-b border-slate-800 bg-slate-950/90 flex items-center gap-3">
          <svg className="w-5 h-5 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
          <input
            id="draftlineup-cmd-input"
            type="text"
            placeholder="Search DraftLineup.com (2,974 athletes, draft board, suites...)"
            className="w-full bg-transparent text-sm font-medium text-slate-100 placeholder-slate-500 outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono text-slate-400">ESC</kbd>
        </div>

        <!-- Results Body -->
        <div id="draftlineup-cmd-results" className="p-3 overflow-y-auto flex-1 space-y-1 text-sm">
          <div className="px-3 py-1 text-xs font-semibold text-slate-500 uppercase tracking-wider">DraftLineup Suites</div>
          <a href="app.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-cyan-600/20 hover:border-cyan-500/40 border border-transparent transition text-slate-200 group">
            <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">⚡</span>
            <div className="flex-1">
              <div className="font-semibold text-slate-100 group-hover:text-cyan-300">DraftLineup Dashboard</div>
              <div className="text-xs text-slate-400">Command Hub & live telemetry</div>
            </div>
            <span className="text-xs font-mono text-slate-500 group-hover:text-cyan-400">app.html ↵</span>
          </a>
          <a href="draft.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-600/20 hover:border-red-500/40 border border-transparent transition text-slate-200 group">
            <span className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">🎯</span>
            <div className="flex-1">
              <div className="font-semibold text-slate-100 group-hover:text-red-300">Draft Board & Trade Machine</div>
              <div className="text-xs text-slate-400">32-team Entry Draft war room & trade curve</div>
            </div>
            <span className="text-xs font-mono text-slate-500 group-hover:text-red-400">draft.html ↵</span>
          </a>
          <a href="portal.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-600/20 hover:border-emerald-500/40 border border-transparent transition text-slate-200 group">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">💰</span>
            <div className="flex-1">
              <div className="font-semibold text-slate-100 group-hover:text-emerald-300">NIL & Transfer Portal War Room</div>
              <div className="text-xs text-slate-400">Collegiate portal intelligence & DraftLineup NIL Index™</div>
            </div>
            <span className="text-xs font-mono text-slate-500 group-hover:text-emerald-400">portal.html ↵</span>
          </a>
          <a href="scout.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-amber-600/20 hover:border-amber-500/40 border border-transparent transition text-slate-200 group">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">🔭</span>
            <div className="flex-1">
              <div className="font-semibold text-slate-100 group-hover:text-amber-300">Master Scouting Directory</div>
              <div className="text-xs text-slate-400">2,974 verified athletes, scouts & evaluation ledgers</div>
            </div>
            <span className="text-xs font-mono text-slate-500 group-hover:text-amber-400">scout.html ↵</span>
          </a>
          <a href="rink3d.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-600/20 hover:border-blue-500/40 border border-transparent transition text-slate-200 group">
            <span className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">🏒</span>
            <div className="flex-1">
              <div className="font-semibold text-slate-100 group-hover:text-blue-300">3D Virtual Rink & Practice Simulator</div>
              <div className="text-xs text-slate-400">WebGL spatial play execution & goalie sightline cones</div>
            </div>
            <span className="text-xs font-mono text-slate-500 group-hover:text-blue-400">rink3d.html ↵</span>
          </a>
          <a href="film.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-600/20 hover:border-purple-500/40 border border-transparent transition text-slate-200 group">
            <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">🎥</span>
            <div className="flex-1">
              <div className="font-semibold text-slate-100 group-hover:text-purple-300">Tactical Film Studio</div>
              <div className="text-xs text-slate-400">60 FPS video telestration & optical velocity</div>
            </div>
            <span className="text-xs font-mono text-slate-500 group-hover:text-purple-400">film.html ↵</span>
          </a>
          <a href="community.html" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-sky-600/20 hover:border-sky-500/40 border border-transparent transition text-slate-200 group">
            <span className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs">🌐</span>
            <div className="flex-1">
              <div className="font-semibold text-slate-100 group-hover:text-sky-300">DraftLineup Social Wire</div>
              <div className="text-xs text-slate-400">Social feed, commitment announcements & recruiting DMs</div>
            </div>
            <span className="text-xs font-mono text-slate-500 group-hover:text-sky-400">community.html ↵</span>
          </a>
        </div>

        <!-- Footer Bar -->
        <div className="p-3 border-t border-slate-800 bg-slate-950/90 text-xs text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">↑</kbd> <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">↓</kbd> Navigate</span>
            <span><kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">↵</kbd> Select</span>
          </div>
          <span className="text-cyan-400 font-bold">DraftLineup.com OS</span>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#draftlineup-cmd-input');

    const openModal = () => {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      input.value = '';
      input.focus();
      playSound('click');
    };

    const closeModal = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };

    // Keyboard shortcut listeners (Ctrl+K, Cmd+K, Esc)
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (modal.classList.contains('hidden')) {
          openModal();
        } else {
          closeModal();
        }
      } else if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  };

  // Export DraftLineup & BlueLine Global Objects
  const api = {
    version: '3.0.0',
    domain: 'DraftLineup.com',
    toast,
    playSound,
    initCommandPalette
  };

  global.DraftLineup = api;
  global.BlueLine = api; // Backwards compatibility

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCommandPalette);
  } else {
    initCommandPalette();
  }

})(window);
