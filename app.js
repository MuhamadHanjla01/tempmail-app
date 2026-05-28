/**
 * ═══════════════════════════════════════════════════════════════════
 *  TempMail Pro — Premium Temporary Email Client
 *  Powered by Mail.tm API
 *  Vanilla JS · No Dependencies · Production-Ready
 * ═══════════════════════════════════════════════════════════════════
 */

(() => {
  'use strict';

  /* ──────────────────────────────────────────────────────────────────
   *  CONSTANTS
   * ────────────────────────────────────────────────────────────────── */

  const API_BASE = 'https://api.mail.tm';

  const STORAGE_KEYS = {
    session:       'tempmail_session',
    theme:         'tempmail_theme',
    autoRefresh:   'tempmail_auto_refresh',
    refreshRate:   'tempmail_refresh_rate',
    soundEnabled:  'tempmail_sound',
    readMessages:  'tempmail_read',
  };

  const DEFAULT_REFRESH_RATE = 10_000;  // 10 seconds
  const TOAST_DURATION        = 3500;
  const MAX_RETRIES            = 3;
  const SKELETON_COUNT         = 5;


  /* ──────────────────────────────────────────────────────────────────
   *  STATE
   * ────────────────────────────────────────────────────────────────── */

  const state = {
    email:          null,
    password:       null,
    token:          null,
    accountId:      null,
    messages:       [],
    selectedId:     null,
    readIds:        new Set(),
    refreshTimer:   null,
    autoRefresh:    true,
    refreshRate:    DEFAULT_REFRESH_RATE,
    soundEnabled:   true,
    searchQuery:    '',
    mobileView:     'inbox',   // 'inbox' | 'message'
    isLoading:      false,
    lastKnownCount: 0,
  };


  /* ──────────────────────────────────────────────────────────────────
   *  UTILITY HELPERS
   * ────────────────────────────────────────────────────────────────── */

  /**
   * Generate a user-friendly random username.
   * Produces strings like "user_a1b2c3" or "temp_xy7k9m".
   */
  function generateUsername() {
    const prefixes = ['user', 'temp', 'mail', 'inbox', 'box', 'dash'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const chars  = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let suffix   = '';
    for (let i = 0; i < 6; i++) {
      suffix += chars[Math.floor(Math.random() * chars.length)];
    }
    return `${prefix}_${suffix}`;
  }

  /**
   * Generate a strong-enough random password for the throwaway account.
   */
  function generatePassword() {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let pw = '';
    for (let i = 0; i < 16; i++) {
      pw += charset[Math.floor(Math.random() * charset.length)];
    }
    return pw;
  }

  /**
   * Format a date string into a human-friendly relative timestamp.
   *  - < 1 min   → "Just now"
   *  - < 60 min  → "X min ago"
   *  - Today     → "Today 3:45 PM"
   *  - Yesterday → "Yesterday 3:45 PM"
   *  - Else      → "May 28, 2026"
   */
  function formatTimestamp(dateStr) {
    const date = new Date(dateStr);
    const now  = new Date();
    const diffMs  = now - date;
    const diffMin = Math.floor(diffMs / 60_000);

    if (diffMin < 1)  return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;

    const timeStr = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);

    if (date >= today)     return `Today ${timeStr}`;
    if (date >= yesterday) return `Yesterday ${timeStr}`;

    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }

  /**
   * Extract a short preview from message intro / text body.
   */
  function getPreview(msg) {
    const raw = msg.intro || msg.text || '';
    return raw.length > 90 ? raw.slice(0, 90) + '…' : raw;
  }

  /**
   * Sanitise sender display: "Name <email>" → "Name" or just email.
   */
  function senderName(from) {
    if (!from) return 'Unknown';
    if (typeof from === 'string') return from;
    if (from.name) return from.name;
    if (from.address) return from.address;
    return 'Unknown';
  }

  /**
   * Sanitise sender email address.
   */
  function senderAddress(from) {
    if (!from) return '';
    if (typeof from === 'string') return from;
    return from.address || '';
  }

  /** Debounce helper */
  function debounce(fn, ms) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
  }


  /* ──────────────────────────────────────────────────────────────────
   *  NOTIFICATION SOUND (Web Audio API — no external files)
   * ────────────────────────────────────────────────────────────────── */

  const Sound = (() => {
    let audioCtx = null;

    function getContext() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioCtx;
    }

    /**
     * Play a short pleasant two-tone notification beep.
     */
    function playNotification() {
      if (!state.soundEnabled) return;
      try {
        const ctx  = getContext();
        const now  = ctx.currentTime;

        // Two-tone: first note then higher note
        [440, 580].forEach((freq, i) => {
          const osc  = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type       = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.15, now + i * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
          osc.connect(gain).connect(ctx.destination);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.25);
        });
      } catch {
        // Audio not available — silently ignore
      }
    }

    return { playNotification };
  })();


  /* ──────────────────────────────────────────────────────────────────
   *  LOCAL STORAGE
   * ────────────────────────────────────────────────────────────────── */

  const Storage = {
    get(key)       { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, val)  { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} },
    remove(key)    { try { localStorage.removeItem(key); } catch {} },

    saveSession() {
      this.set(STORAGE_KEYS.session, {
        email:     state.email,
        password:  state.password,
        token:     state.token,
        accountId: state.accountId,
      });
    },

    loadSession() {
      return this.get(STORAGE_KEYS.session);
    },

    clearSession() {
      this.remove(STORAGE_KEYS.session);
      this.remove(STORAGE_KEYS.readMessages);
    },

    saveReadIds() {
      this.set(STORAGE_KEYS.readMessages, [...state.readIds]);
    },

    loadReadIds() {
      const arr = this.get(STORAGE_KEYS.readMessages);
      if (Array.isArray(arr)) state.readIds = new Set(arr);
    },

    savePreferences() {
      this.set(STORAGE_KEYS.autoRefresh, state.autoRefresh);
      this.set(STORAGE_KEYS.refreshRate, state.refreshRate);
      this.set(STORAGE_KEYS.soundEnabled, state.soundEnabled);
    },

    loadPreferences() {
      const ar = this.get(STORAGE_KEYS.autoRefresh);
      const rr = this.get(STORAGE_KEYS.refreshRate);
      const sn = this.get(STORAGE_KEYS.soundEnabled);
      if (ar !== null) state.autoRefresh  = ar;
      if (rr !== null) state.refreshRate  = rr;
      if (sn !== null) state.soundEnabled = sn;
    },
  };


  /* ──────────────────────────────────────────────────────────────────
   *  API LAYER — with retry + exponential backoff
   * ────────────────────────────────────────────────────────────────── */

  const API = (() => {

    /**
     * Core fetch wrapper with retry logic.
     * Handles 429 (rate limit) and 5xx with exponential back-off.
     */
    async function request(endpoint, options = {}, retries = MAX_RETRIES) {
      const url = `${API_BASE}${endpoint}`;
      const headers = { 'Content-Type': 'application/json', ...options.headers };
      if (state.token && !options.skipAuth) {
        headers['Authorization'] = `Bearer ${state.token}`;
      }

      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const res = await fetch(url, { ...options, headers });

          // 401 Unauthorized — token likely expired
          if (res.status === 401 && state.email && state.password) {
            const refreshed = await refreshToken();
            if (refreshed) {
              headers['Authorization'] = `Bearer ${state.token}`;
              continue;
            }
            throw new Error('Session expired. Please generate a new email.');
          }

          // 429 Rate-limited or 5xx Server error — retry with backoff
          if (res.status === 429 || res.status >= 500) {
            if (attempt < retries) {
              const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
              await sleep(delay);
              continue;
            }
            throw new Error(
              res.status === 429
                ? 'Rate limited — please wait a moment and try again.'
                : `Server error (${res.status}). Please try again later.`
            );
          }

          // 404 on account verify → account gone
          if (res.status === 404 && endpoint === '/me') {
            throw new Error('ACCOUNT_GONE');
          }

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body['hydra:description'] || body.message || `Request failed (${res.status})`);
          }

          // DELETE returns 204 No Content
          if (res.status === 204) return null;
          return await res.json();

        } catch (err) {
          if (err.message === 'ACCOUNT_GONE') throw err;
          if (err.name === 'TypeError' && attempt < retries) {
            // Network error — retry
            const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            await sleep(delay);
            continue;
          }
          if (attempt === retries) throw err;
        }
      }
    }

    function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    /**
     * Try to refresh the JWT token using stored credentials.
     */
    async function refreshToken() {
      try {
        const data = await request('/token', {
          method: 'POST',
          body: JSON.stringify({ address: state.email, password: state.password }),
          skipAuth: true,
        }, 1);
        if (data && data.token) {
          state.token = data.token;
          Storage.saveSession();
          return true;
        }
      } catch {
        return false;
      }
      return false;
    }

    /* ── Public API Methods ──────────────────────────────────────── */

    async function getDomains() {
      const data = await request('/domains', {}, 2);
      return (data && data['hydra:member']) || [];
    }

    async function createAccount(address, password) {
      return request('/accounts', {
        method: 'POST',
        body: JSON.stringify({ address, password }),
        skipAuth: true,
      });
    }

    async function getToken(address, password) {
      const data = await request('/token', {
        method: 'POST',
        body: JSON.stringify({ address, password }),
        skipAuth: true,
      });
      return data.token;
    }

    async function getMessages() {
      const data = await request('/messages');
      return (data && data['hydra:member']) || [];
    }

    async function getMessage(id) {
      return request(`/messages/${id}`);
    }

    async function deleteMessage(id) {
      return request(`/messages/${id}`, { method: 'DELETE' });
    }

    async function getMe() {
      return request('/me');
    }

    return { getDomains, createAccount, getToken, getMessages, getMessage, deleteMessage, getMe };
  })();


  /* ──────────────────────────────────────────────────────────────────
   *  UI — DOM references & rendering helpers
   * ────────────────────────────────────────────────────────────────── */

  const UI = (() => {

    /* ── Cached DOM nodes ──────────────────────────────────────── */
    const $ = (sel) => document.querySelector(sel);
    const dom = {};

    function cacheElements() {
      dom.emailDisplay     = $('#email-display');
      dom.copyBtn          = $('#copy-btn');
      dom.newEmailBtn      = $('#new-email-btn');
      dom.refreshBtn       = $('#refresh-btn');
      dom.autoRefreshBtn   = $('#auto-refresh-btn');
      dom.autoRefreshIcon  = dom.autoRefreshBtn?.querySelector('.icon') || dom.autoRefreshBtn?.querySelector('i');
      dom.refreshSelect    = $('#refresh-rate');
      dom.themeToggle      = $('#theme-toggle');
      dom.soundToggle      = $('#sound-toggle');
      dom.searchInput      = $('#search-input');
      dom.messageList      = $('#message-list');
      dom.messageView      = $('#message-view');
      dom.emptyState       = $('#empty-state');
      dom.inboxCount       = $('#inbox-count');
      dom.unreadBadge      = $('#unread-badge');
      dom.toastContainer   = $('#toast-container');
      dom.mobileInboxTab   = $('#mobile-inbox-tab');
      dom.mobileMessageTab = $('#mobile-message-tab');
      dom.inboxPanel       = $('#inbox-panel');
      dom.messagePanel     = $('#message-panel');
    }

    /* ── Toast Notifications ─────────────────────────────────── */

    function showToast(message, type = 'info') {
      if (!dom.toastContainer) return;

      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;

      const icons = { success: '✓', error: '✕', info: 'ℹ' };
      toast.innerHTML = `
        <span class="toast__icon">${icons[type] || 'ℹ'}</span>
        <span class="toast__message">${escapeHtml(message)}</span>
        <button class="toast__close" aria-label="Close">&times;</button>
      `;

      toast.querySelector('.toast__close').addEventListener('click', () => dismissToast(toast));
      dom.toastContainer.appendChild(toast);

      // Trigger entrance animation
      requestAnimationFrame(() => toast.classList.add('toast--visible'));

      setTimeout(() => dismissToast(toast), TOAST_DURATION);
    }

    function dismissToast(toast) {
      toast.classList.remove('toast--visible');
      toast.classList.add('toast--exit');
      toast.addEventListener('transitionend', () => toast.remove(), { once: true });
      // Fallback removal
      setTimeout(() => { if (toast.parentNode) toast.remove(); }, 500);
    }

    /* ── Skeleton Loaders ────────────────────────────────────── */

    function showSkeletons() {
      if (!dom.messageList) return;
      dom.messageList.innerHTML = '';
      for (let i = 0; i < SKELETON_COUNT; i++) {
        const skel = document.createElement('div');
        skel.className = 'message-item skeleton';
        skel.innerHTML = `
          <div class="skeleton-line skeleton-line--short"></div>
          <div class="skeleton-line skeleton-line--long"></div>
          <div class="skeleton-line skeleton-line--medium"></div>
        `;
        dom.messageList.appendChild(skel);
      }
    }

    /* ── Message List Rendering ──────────────────────────────── */

    function renderMessages() {
      if (!dom.messageList) return;

      const filtered = getFilteredMessages();

      // Empty state
      if (filtered.length === 0) {
        dom.messageList.innerHTML = '';
        if (dom.emptyState) dom.emptyState.style.display = 'flex';
        updateBadge();
        return;
      }

      if (dom.emptyState) dom.emptyState.style.display = 'none';

      // Build list
      dom.messageList.innerHTML = '';
      filtered.forEach(msg => {
        const isRead     = state.readIds.has(msg.id);
        const isSelected = state.selectedId === msg.id;

        const item = document.createElement('div');
        item.className = `message-item${isRead ? '' : ' message-item--unread'}${isSelected ? ' message-item--active' : ''}`;
        item.dataset.id = msg.id;

        item.innerHTML = `
          <div class="message-item__header">
            <span class="message-item__sender">${escapeHtml(senderName(msg.from))}</span>
            <span class="message-item__time">${formatTimestamp(msg.createdAt)}</span>
          </div>
          <div class="message-item__subject">${escapeHtml(msg.subject || '(No subject)')}</div>
          <div class="message-item__preview">${escapeHtml(getPreview(msg))}</div>
          <button class="message-item__delete" title="Delete message" aria-label="Delete message">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        `;

        // Click handler — open message
        item.addEventListener('click', (e) => {
          if (e.target.closest('.message-item__delete')) return;
          openMessage(msg.id);
        });

        // Delete handler
        item.querySelector('.message-item__delete').addEventListener('click', (e) => {
          e.stopPropagation();
          handleDeleteMessage(msg.id);
        });

        dom.messageList.appendChild(item);
      });

      updateBadge();
    }

    function updateBadge() {
      const unread = state.messages.filter(m => !state.readIds.has(m.id)).length;
      if (dom.unreadBadge) {
        dom.unreadBadge.textContent = unread;
        dom.unreadBadge.style.display = unread > 0 ? 'inline-flex' : 'none';
      }
      if (dom.inboxCount) {
        dom.inboxCount.textContent = `(${state.messages.length})`;
      }
    }

    /* ── Message Detail View ─────────────────────────────────── */

    function renderMessageView(msg) {
      if (!dom.messageView) return;

      const fromAddr = senderAddress(msg.from);
      const toList   = (msg.to || []).map(t => t.address || t).join(', ');

      dom.messageView.innerHTML = `
        <div class="message-detail">
          <div class="message-detail__header">
            <h2 class="message-detail__subject">${escapeHtml(msg.subject || '(No subject)')}</h2>
            <div class="message-detail__meta">
              <div class="message-detail__from">
                <strong>From:</strong> ${escapeHtml(senderName(msg.from))}
                ${fromAddr ? `<span class="message-detail__email">&lt;${escapeHtml(fromAddr)}&gt;</span>` : ''}
              </div>
              <div class="message-detail__to"><strong>To:</strong> ${escapeHtml(toList || state.email)}</div>
              <div class="message-detail__date"><strong>Date:</strong> ${formatTimestamp(msg.createdAt)}</div>
            </div>
          </div>
          <div class="message-detail__body" id="message-body"></div>
          ${renderAttachments(msg)}
        </div>
      `;

      // Render body — HTML in sandboxed iframe, else plain text
      const bodyContainer = dom.messageView.querySelector('#message-body');
      if (msg.html && msg.html.length > 0) {
        const htmlContent = Array.isArray(msg.html) ? msg.html.join('') : msg.html;
        const iframe = document.createElement('iframe');
        iframe.className = 'message-detail__iframe';
        iframe.setAttribute('sandbox', 'allow-same-origin');
        iframe.setAttribute('referrerpolicy', 'no-referrer');
        iframe.srcdoc = buildSafeHtml(htmlContent);
        bodyContainer.appendChild(iframe);

        // Auto-resize iframe once loaded
        iframe.addEventListener('load', () => {
          try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            iframe.style.height = doc.documentElement.scrollHeight + 'px';
          } catch {
            iframe.style.height = '500px';
          }
        });
      } else {
        bodyContainer.innerHTML = `<pre class="message-detail__text">${escapeHtml(msg.text || 'No content')}</pre>`;
      }
    }

    /**
     * Build safe HTML for the sandboxed iframe, with basic styling.
     */
    function buildSafeHtml(htmlContent) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
              line-height: 1.6;
              color: #e0e0e0;
              background: transparent;
              padding: 16px;
              word-wrap: break-word;
              overflow-wrap: break-word;
            }
            img { max-width: 100%; height: auto; }
            a { color: #818cf8; }
            table { max-width: 100%; border-collapse: collapse; }
            pre { white-space: pre-wrap; }
          </style>
        </head>
        <body>${htmlContent}</body>
        </html>
      `;
    }

    /**
     * Render attachments section if any.
     */
    function renderAttachments(msg) {
      if (!msg.attachments || msg.attachments.length === 0) return '';

      const items = msg.attachments.map(att => {
        const size   = att.size ? `(${formatFileSize(att.size)})` : '';
        const dlUrl  = att.downloadUrl
          ? `${API_BASE}${att.downloadUrl}`
          : '#';
        return `
          <a href="${dlUrl}" target="_blank" rel="noopener noreferrer" class="attachment">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
            </svg>
            <span>${escapeHtml(att.filename || 'Attachment')}</span>
            <span class="attachment__size">${size}</span>
          </a>
        `;
      }).join('');

      return `
        <div class="message-detail__attachments">
          <h3>Attachments</h3>
          <div class="attachment-list">${items}</div>
        </div>
      `;
    }

    function formatFileSize(bytes) {
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function showDefaultView() {
      if (!dom.messageView) return;
      dom.messageView.innerHTML = `
        <div class="message-view__empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" opacity="0.3">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
            <polyline points="22,6 12,13 2,6"></polyline>
          </svg>
          <p>Select a message to read</p>
        </div>
      `;
    }

    /* ── Email Display ───────────────────────────────────────── */

    function setEmailDisplay(email) {
      if (dom.emailDisplay) {
        dom.emailDisplay.textContent = email || 'Generating...';
        dom.emailDisplay.title       = email || '';
      }
    }

    /* ── Auto-Refresh Icon ───────────────────────────────────── */

    function updateAutoRefreshUI() {
      if (dom.autoRefreshBtn) {
        dom.autoRefreshBtn.classList.toggle('active', state.autoRefresh);
        dom.autoRefreshBtn.title = state.autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF';
      }
    }

    /* ── Theme ───────────────────────────────────────────────── */

    function applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      Storage.set(STORAGE_KEYS.theme, theme);
      if (dom.themeToggle) {
        dom.themeToggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      }
    }

    function getCurrentTheme() {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }

    /* ── Mobile Tabs ─────────────────────────────────────────── */

    function setMobileView(view) {
      state.mobileView = view;
      if (dom.inboxPanel)  dom.inboxPanel.classList.toggle('panel--active', view === 'inbox');
      if (dom.messagePanel) dom.messagePanel.classList.toggle('panel--active', view === 'message');
      if (dom.mobileInboxTab) dom.mobileInboxTab.classList.toggle('tab--active', view === 'inbox');
      if (dom.mobileMessageTab) dom.mobileMessageTab.classList.toggle('tab--active', view === 'message');
    }

    /* ── Refresh Rate Dropdown ───────────────────────────────── */

    function updateRefreshSelect() {
      if (dom.refreshSelect) {
        dom.refreshSelect.value = String(state.refreshRate);
      }
    }

    /* ── Sound Toggle ────────────────────────────────────────── */

    function updateSoundToggle() {
      if (dom.soundToggle) {
        dom.soundToggle.classList.toggle('active', state.soundEnabled);
        dom.soundToggle.title = state.soundEnabled ? 'Sound ON' : 'Sound OFF';
      }
    }

    /* ── Utility ─────────────────────────────────────────────── */

    function escapeHtml(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }

    return {
      cacheElements, showToast, showSkeletons, renderMessages, renderMessageView,
      showDefaultView, setEmailDisplay, updateAutoRefreshUI, applyTheme,
      getCurrentTheme, setMobileView, updateRefreshSelect, updateSoundToggle,
      updateBadge, dom,
    };
  })();


  /* ──────────────────────────────────────────────────────────────────
   *  CORE APPLICATION LOGIC
   * ────────────────────────────────────────────────────────────────── */

  function getFilteredMessages() {
    if (!state.searchQuery) return state.messages;
    const q = state.searchQuery.toLowerCase();
    return state.messages.filter(m =>
      (m.subject && m.subject.toLowerCase().includes(q)) ||
      (senderName(m.from).toLowerCase().includes(q)) ||
      (senderAddress(m.from).toLowerCase().includes(q))
    );
  }

  /**
   * Initialize: restore session or create new email.
   */
  async function init() {
    UI.cacheElements();
    Storage.loadPreferences();
    Storage.loadReadIds();

    // Theme — apply immediately (already applied via inline script, but reinforce)
    const savedTheme = Storage.get(STORAGE_KEYS.theme) || 'dark';
    UI.applyTheme(savedTheme);

    // UI state
    UI.updateAutoRefreshUI();
    UI.updateRefreshSelect();
    UI.updateSoundToggle();
    UI.showSkeletons();
    UI.showDefaultView();

    // Try restoring session
    const session = Storage.loadSession();
    if (session && session.email && session.token) {
      state.email     = session.email;
      state.password  = session.password;
      state.token     = session.token;
      state.accountId = session.accountId;

      UI.setEmailDisplay(state.email);

      try {
        // Verify account is still alive
        await API.getMe();
        await fetchMessages();
        startAutoRefresh();
        UI.showToast('Session restored', 'success');
        return;
      } catch (err) {
        if (err.message === 'ACCOUNT_GONE') {
          UI.showToast('Previous email expired. Generating new one…', 'info');
        } else {
          UI.showToast('Session refresh failed. Creating new email…', 'info');
        }
        Storage.clearSession();
      }
    }

    // No valid session — create new email
    await generateNewEmail();
  }

  /**
   * Generate a new temporary email from scratch.
   */
  async function generateNewEmail() {
    UI.setEmailDisplay('Generating...');
    UI.showSkeletons();

    try {
      // 1) Fetch available domains
      const domains = await API.getDomains();
      if (!domains.length) {
        throw new Error('No domains available. Please try again later.');
      }
      const domain = domains[0].domain;

      // 2) Generate friendly username + password
      const username = generateUsername();
      const address  = `${username}@${domain}`;
      const password = generatePassword();

      // 3) Create account
      const account = await API.createAccount(address, password);

      // 4) Get JWT token
      const token = await API.getToken(address, password);

      // 5) Update state
      state.email     = address;
      state.password  = password;
      state.token     = token;
      state.accountId = account.id;
      state.messages  = [];
      state.selectedId = null;
      state.readIds   = new Set();
      state.lastKnownCount = 0;
      state.searchQuery = '';

      // 6) Persist
      Storage.saveSession();
      Storage.saveReadIds();

      // 7) Update UI
      UI.setEmailDisplay(address);
      UI.renderMessages();
      UI.showDefaultView();
      startAutoRefresh();

      if (UI.dom.searchInput) UI.dom.searchInput.value = '';

      UI.showToast('New email generated!', 'success');

    } catch (err) {
      console.error('generateNewEmail:', err);
      UI.showToast(err.message || 'Failed to generate email', 'error');
      UI.setEmailDisplay('Error — click "New Email" to retry');
    }
  }

  /**
   * Fetch messages from the API and update state.
   */
  async function fetchMessages(silent = false) {
    if (state.isLoading) return;
    state.isLoading = true;

    if (!silent) {
      // Add a subtle loading indicator to the refresh button
      if (UI.dom.refreshBtn) UI.dom.refreshBtn.classList.add('loading');
    }

    try {
      const messages = await API.getMessages();

      // Sort newest first
      messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Detect new messages
      const newCount = messages.length - state.lastKnownCount;
      if (newCount > 0 && state.lastKnownCount > 0) {
        UI.showToast(`${newCount} new message${newCount > 1 ? 's' : ''} received!`, 'info');
        Sound.playNotification();
      }

      state.messages = messages;
      state.lastKnownCount = messages.length;

      UI.renderMessages();

    } catch (err) {
      if (!silent) {
        console.error('fetchMessages:', err);
        UI.showToast('Failed to fetch messages', 'error');
      }
    } finally {
      state.isLoading = false;
      if (UI.dom.refreshBtn) UI.dom.refreshBtn.classList.remove('loading');
    }
  }

  /**
   * Open a specific message by ID.
   */
  async function openMessage(id) {
    state.selectedId = id;
    state.readIds.add(id);
    Storage.saveReadIds();
    UI.renderMessages();

    // Show loading state in the message view
    if (UI.dom.messageView) {
      UI.dom.messageView.innerHTML = `
        <div class="message-view__loading">
          <div class="spinner"></div>
          <p>Loading message...</p>
        </div>
      `;
    }

    // Switch to message panel on mobile
    UI.setMobileView('message');

    try {
      const msg = await API.getMessage(id);
      if (state.selectedId === id) {
        UI.renderMessageView(msg);
      }
    } catch (err) {
      console.error('openMessage:', err);
      UI.showToast('Failed to load message', 'error');
      UI.showDefaultView();
    }
  }

  /**
   * Delete a message.
   */
  async function handleDeleteMessage(id) {
    try {
      await API.deleteMessage(id);
      state.messages = state.messages.filter(m => m.id !== id);
      state.readIds.delete(id);
      Storage.saveReadIds();

      if (state.selectedId === id) {
        state.selectedId = null;
        UI.showDefaultView();
      }

      UI.renderMessages();
      UI.showToast('Message deleted', 'success');
    } catch (err) {
      console.error('deleteMessage:', err);
      UI.showToast('Failed to delete message', 'error');
    }
  }

  /**
   * Copy email address to clipboard.
   */
  async function copyEmail() {
    if (!state.email) return;
    try {
      await navigator.clipboard.writeText(state.email);
      UI.showToast('Email copied to clipboard!', 'success');

      // Animate the copy button
      if (UI.dom.copyBtn) {
        UI.dom.copyBtn.classList.add('copied');
        setTimeout(() => UI.dom.copyBtn.classList.remove('copied'), 1500);
      }
    } catch {
      // Fallback for older browsers
      const ta = document.createElement('textarea');
      ta.value = state.email;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        UI.showToast('Email copied to clipboard!', 'success');
      } catch {
        UI.showToast('Failed to copy email', 'error');
      }
      document.body.removeChild(ta);
    }
  }

  /* ──────────────────────────────────────────────────────────────────
   *  AUTO-REFRESH MANAGEMENT
   * ────────────────────────────────────────────────────────────────── */

  function startAutoRefresh() {
    stopAutoRefresh();
    if (!state.autoRefresh) return;
    state.refreshTimer = setInterval(() => fetchMessages(true), state.refreshRate);
  }

  function stopAutoRefresh() {
    if (state.refreshTimer) {
      clearInterval(state.refreshTimer);
      state.refreshTimer = null;
    }
  }

  function toggleAutoRefresh() {
    state.autoRefresh = !state.autoRefresh;
    Storage.savePreferences();
    UI.updateAutoRefreshUI();

    if (state.autoRefresh) {
      startAutoRefresh();
      UI.showToast('Auto-refresh enabled', 'info');
    } else {
      stopAutoRefresh();
      UI.showToast('Auto-refresh disabled', 'info');
    }
  }


  /* ──────────────────────────────────────────────────────────────────
   *  EVENT BINDINGS
   * ────────────────────────────────────────────────────────────────── */

  function bindEvents() {
    // Copy email
    if (UI.dom.copyBtn) {
      UI.dom.copyBtn.addEventListener('click', copyEmail);
    }

    // New email
    if (UI.dom.newEmailBtn) {
      UI.dom.newEmailBtn.addEventListener('click', () => {
        if (state.messages.length > 0) {
          if (!confirm('You have existing messages. Generate a new email? This will clear your current inbox.')) {
            return;
          }
        }
        Storage.clearSession();
        generateNewEmail();
      });
    }

    // Manual refresh
    if (UI.dom.refreshBtn) {
      UI.dom.refreshBtn.addEventListener('click', () => fetchMessages(false));
    }

    // Auto-refresh toggle
    if (UI.dom.autoRefreshBtn) {
      UI.dom.autoRefreshBtn.addEventListener('click', toggleAutoRefresh);
    }

    // Refresh rate
    if (UI.dom.refreshSelect) {
      UI.dom.refreshSelect.addEventListener('change', (e) => {
        state.refreshRate = parseInt(e.target.value, 10) || DEFAULT_REFRESH_RATE;
        Storage.savePreferences();
        if (state.autoRefresh) startAutoRefresh();
      });
    }

    // Theme toggle
    if (UI.dom.themeToggle) {
      UI.dom.themeToggle.addEventListener('click', () => {
        const next = UI.getCurrentTheme() === 'dark' ? 'light' : 'dark';
        UI.applyTheme(next);
      });
    }

    // Sound toggle
    if (UI.dom.soundToggle) {
      UI.dom.soundToggle.addEventListener('click', () => {
        state.soundEnabled = !state.soundEnabled;
        Storage.savePreferences();
        UI.updateSoundToggle();
        UI.showToast(state.soundEnabled ? 'Sound enabled' : 'Sound muted', 'info');
      });
    }

    // Search
    if (UI.dom.searchInput) {
      UI.dom.searchInput.addEventListener('input', debounce((e) => {
        state.searchQuery = e.target.value.trim();
        UI.renderMessages();
      }, 200));
    }

    // Mobile tabs
    if (UI.dom.mobileInboxTab) {
      UI.dom.mobileInboxTab.addEventListener('click', () => UI.setMobileView('inbox'));
    }
    if (UI.dom.mobileMessageTab) {
      UI.dom.mobileMessageTab.addEventListener('click', () => UI.setMobileView('message'));
    }

    // Keyboard shortcut: Escape goes back to inbox on mobile
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.mobileView === 'message') {
        UI.setMobileView('inbox');
      }
    });

    // Visibility change — pause/resume auto-refresh when tab is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stopAutoRefresh();
      } else if (state.autoRefresh) {
        fetchMessages(true);
        startAutoRefresh();
      }
    });
  }


  /* ──────────────────────────────────────────────────────────────────
   *  BOOTSTRAP
   * ────────────────────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { bindEvents(); init(); });
  } else {
    bindEvents();
    init();
  }

})();
