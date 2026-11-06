/* ════════════════════════════════════════════════════════════════════ *
 *  chatbox.js — صندوق الرسائل العائم (نسخة محسنة ومصححة)             *
 * ════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    const CB = window.ChatBox = {};
    const MAXFILE = 2.5 * 1024 * 1024, MAXVOICE = 120;
    let cfg = null, role = 'a', win = null, ui = {}, cur = null, shown = false, collapsed = false;
    const msgs = {}, attached = {}, seen = {}, unread = {}, ack = {}, got = {};
    const t0 = Date.now();
    let actx = null, rec = null, recTick = null, recStart = 0, lastSend = 0;

    const CSS = `
#cbx{position:fixed;z-index:99990;display:none;flex-direction:column;background:#0b1424;border:1px solid #5c1a1a;border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,.6),0 0 0 1px rgba(56,189,248,.08);color:#e2e8f0;font-family:inherit;direction:rtl;overflow:hidden;min-width:320px;min-height:350px;width:400px;height:500px;user-select:none;-webkit-user-select:none;pointer-events:auto;}
#cbx.show{display:flex}
#cbx.col{height:auto!important;min-height:0}
#cbx.col .cb-body,#cbx.col .cb-chips,#cbx.col .cb-grip{display:none}
#cbx *{box-sizing:border-box}
.cb-head{display:flex;align-items:center;gap:8px;padding:2px 10px;min-height:26px;background:linear-gradient(135deg,#4a0808,#7f1d1d);color:#fee2e2;cursor:grab;touch-action:none;flex-shrink:0;border-bottom:2px solid #ea580c;}
.cb-head:active{cursor:grabbing}
.cb-av{width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cb-av svg{width:11px;height:11px;fill:none;stroke:#fff;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.cb-ti{flex:1;min-width:0;display:flex;flex-direction:row;align-items:center;gap:10px;white-space:nowrap;overflow:hidden;}
.cb-ti b{font-size:11.5px;color:#fff;text-shadow:0 1px 2px #000;overflow:hidden;text-overflow:ellipsis;}
.cb-ti small{font-size:12px;color:#fca5a5;display:none;} 
.cb-hb{background:transparent;border:0;color:#fca5a5;border-radius:5px;padding:0 5px;height:20px;cursor:pointer;font-family:inherit;font-size:11px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;transition:background .2s}.cb-btns{display:flex;align-items:center;gap:0;flex-shrink:0}
.cb-hb:hover{background:rgba(255,255,255,.14);color:#fff}
.cb-hb.danger:hover{background:#ef4444;}
.cb-hb svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.cb-chips{display:flex;gap:6px;padding:8px 10px;overflow-x:auto;background:#091020;border-bottom:1px solid #1a2d4d;flex-shrink:0;scrollbar-width:thin;scrollbar-color:#24406a transparent}
.cb-chip{flex-shrink:0;display:inline-flex;align-items:center;gap:5px;background:#12213a;border:1px solid #1f3a63;color:#cbd5e1;border-radius:14px;padding:5px 12px;font-size:13px;cursor:pointer;font-family:inherit;transition:.2s;}
.cb-chip:hover{background:#1a2d4d;}
.cb-chip.on{background:#c2410c;border-color:#ea580c;color:#fff7ed}.cb-chip i{width:8px;height:8px;border-radius:50%;background:#475569}.cb-chip i.on{background:#22c55e}
.cb-chip em{font-style:normal;background:#38bdf8;color:#06202e;border-radius:9px;padding:0 6px;font-size:11px;font-weight:800}
.cb-body{flex:1;min-height:0;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:10px;background:radial-gradient(circle at 20% 0,#0f1c33,#0a111f 60%);user-select:text;-webkit-user-select:text;scrollbar-width:thin;scrollbar-color:#24406a transparent}
.cb-empty{margin:auto;text-align:center;color:#64748b;font-size:13.5px;line-height:1.9;padding:20px}.cb-empty svg{width:48px;height:48px;fill:none;stroke:#334e7a;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round;margin-bottom:8px}
.cb-m{max-width:85%;width:fit-content;padding:5px 10px 3px;border-radius:12px;font-size:14px;line-height:1.45;word-break:break-word;display:flex;flex-direction:column;gap:3px;position:relative}
.cb-ed{background:none;border:none;color:inherit;opacity:.7;cursor:pointer;font:inherit;font-size:11px;padding:0 4px}.cb-ed:hover{opacity:1;text-decoration:underline}.cb-ted{font-size:10px;opacity:.7}
.cb-m.me{align-self:flex-start;background:#7f1d1d;color:#ffe4e4;border-top-right-radius:4px}
.cb-m.ot{align-self:flex-end;background:#14532d;color:#dcfce7;border-top-left-radius:4px}
.cb-m.all{border:1px dashed rgba(251,191,36,.55)}
.cb-tag{font-size:11px;color:#fbbf24;font-weight:700}
.cb-tx{white-space:pre-wrap}
.cb-ts{font-size:10.5px;opacity:.6;align-self:flex-end}
.cb-img{max-width:100%;max-height:250px;border-radius:9px;cursor:zoom-in;display:block;background:#000}
.cb-file{display:flex;align-items:center;gap:10px;background:rgba(0,0,0,.25);border-radius:10px;padding:8px 10px}
.cb-fi{width:38px;height:42px;border-radius:7px;background:#c2410c;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cb-fn{flex:1;min-width:0;font-size:13px}.cb-fn b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}.cb-fn small{opacity:.6;font-size:11px}
.cb-act{display:flex;gap:6px;flex-wrap:wrap}
.cb-a{background:rgba(255,255,255,.12);border:0;color:#fff;border-radius:7px;padding:5px 12px;font-size:12px;cursor:pointer;text-decoration:none;font-family:inherit;display:inline-flex;align-items:center;gap:5px;transition:.2s;}
.cb-a:hover{background:rgba(255,255,255,.25)}.cb-a svg{width:14px;height:14px;fill:none;stroke:currentColor;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
.cb-au{width:100%;min-width:230px;height:38px;filter:invert(.9) hue-rotate(160deg)}
.cb-comp{display:flex;align-items:flex-end;gap:8px;padding:10px;background:#091020;border-top:1px solid #1a2d4d;flex-shrink:0}
.cb-ib{width:40px;height:40px;border-radius:50%;border:0;background:#13294a;color:#7dd3fc;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.2s;}
.cb-ib:hover{background:#1b3c6e;transform:scale(1.05);}
.cb-ib#cbAttach{background:#1e3a8a;color:#93c5fd;}
.cb-ib#cbMic{background:#7c2d12;color:#fdba74;}
.cb-ib.send{background:#16a34a;color:#fff;}
.cb-ib.send:hover{background:#15803d;}
.cb-ib.rec{background:#dc2626;color:#fff;animation:cbPulse 1s infinite;}
@keyframes cbPulse{50%{box-shadow:0 0 0 6px rgba(239,68,68,.3)}}
.cb-ib svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.cb-ta{flex:1;min-width:0;resize:none;border:1px solid #1f3a63;background:#060d18;color:#e8eef8;border-radius:20px;padding:10px 14px;font-family:inherit;font-size:14px;line-height:1.5;max-height:120px;height:40px;outline:none;overflow-y:auto;scrollbar-width:none;user-select:text;-webkit-user-select:text;transition:.2s;}
.cb-ta:focus{border-color:#ea580c;box-shadow:0 0 0 2px rgba(234,88,12,.2);}
.cb-recbar{flex:1;display:none;align-items:center;gap:8px;color:#fca5a5;font-size:14px;min-width:0}
.cb-comp.recing .cb-ta,.cb-comp.recing #cbAttach{display:none}.cb-comp.recing .cb-recbar{display:flex}
.cb-dot{width:10px;height:10px;border-radius:50%;background:#ef4444;animation:cbPulse 1s infinite}
.cb-cancel{background:transparent;border:0;color:#94a3b8;cursor:pointer;font-family:inherit;font-size:13px;margin-inline-start:auto;transition:.2s;}
.cb-cancel:hover{color:#fff;}
.cb-grip{position:absolute;right:0;bottom:0;width:28px;height:28px;cursor:nwse-resize;touch-action:none;opacity:.8;z-index:10}
.cb-grip:before{content:"";position:absolute;right:6px;bottom:6px;width:12px;height:12px;border-right:2px solid #5a7bb0;border-bottom:2px solid #5a7bb0;border-radius:0 0 3px 0}
#cbLight{position:fixed;inset:0;z-index:99995;background:rgba(2,6,14,.92);display:none;flex-direction:column;align-items:center;justify-content:center;gap:10px;direction:rtl}
#cbLight.show{display:flex}
#cbLight .lw{flex:1;min-height:0;width:100%;overflow:auto;display:flex;touch-action:pan-x pan-y pinch-zoom}
#cbLight img{margin:auto;max-width:96vw;max-height:84vh;cursor:zoom-in;display:block}
#cbLight.z img{max-width:none;max-height:none;width:200%;cursor:zoom-out}
#cbLight .lb{display:flex;gap:10px;padding-bottom:12px}
.cb-err{background:#7f1d1d;color:#fee2e2;font-size:12px;line-height:1.6;padding:8px 12px;flex-shrink:0;display:none}.cb-err.on{display:block}
.cb-badge{position:absolute;top:-5px;inset-inline-end:-5px;min-width:18px;height:18px;border-radius:9px;background:#ef4444;color:#fff;font-size:11px;font-weight:800;line-height:18px;text-align:center;padding:0 5px;pointer-events:none;display:none}
.cb-badge.on{display:block;animation:cbPulse 1.4s 3}
`;
    const IC = {
        fix: '<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>',
        chat: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
        clip: '<svg viewBox="0 0 24 24"><path d="M21.4 11.6 12.2 20.8a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5"/></svg>',
        mic: '<svg viewBox="0 0 24 24"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
        stop: '<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>',
        send: '<svg viewBox="0 0 24 24"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
        down: '<svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>',
        close: '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        dl: '<svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        open: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>'
    };

    const $ = s => win.querySelector(s);
    const esc = s => { const d = document.createElement('div'); d.textContent = s == null ? '' : s; return d.innerHTML; };
    const fmt = ts => { const d = new Date(ts); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };
    const fsize = n => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
    const fail = e => { if (!ui.err) return; const c = (e && (e.code || '')) + ' ' + ((e && e.message) || ''); let u = ''; try { u = cfg.diag ? cfg.diag() : ''; } catch (x) {} ui.err.textContent = 'تعذّر الوصول للرسائل — ' + c.trim() + (u ? ' | ' + u : ''); ui.err.classList.add('on'); ui.err.style.userSelect = 'text'; };
    const say = m => { try { if (cfg.say) cfg.say(m); } catch (e) {} };

    function build() {
        const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
        win = document.createElement('div'); win.id = 'cbx';
        win.innerHTML =
            '<div class="cb-head" id="cbHead"><div class="cb-av">' + IC.chat + '</div><div class="cb-ti"><b id="cbTitle"></b><small id="cbSub"></small></div>' +
            '<div class="cb-btns"><button class="cb-hb" id="cbClear" style="display:none" title="مسح المحادثة">مسح</button>' +
            '<button class="cb-hb" id="cbCol" title="تصغير/تكبير">' + IC.down + '</button>' +
            '<button class="cb-hb danger" id="cbClose" title="إغلاق">' + IC.close + '</button></div></div>' +
            '<div class="cb-err" id="cbErr"></div><div class="cb-chips" id="cbChips" style="display:none"></div>' +
            '<div class="cb-body" id="cbBody"></div>' +
            '<div class="cb-comp" id="cbComp">' +
            '<button class="cb-ib" id="cbAttach" title="إرسال ملف أو صورة">' + IC.clip + '</button>' +
            '<textarea class="cb-ta" id="cbTa" rows="1" placeholder="اكتب رسالة…"></textarea>' +
            '<div class="cb-recbar"><span class="cb-dot"></span><span id="cbRt">0:00</span><span>جارٍ التسجيل…</span><button class="cb-cancel" id="cbCancel">إلغاء</button></div>' +
            '<button class="cb-ib" id="cbMic" title="رسالة صوتية">' + IC.mic + '</button>' +
            '<button class="cb-ib send" id="cbSend" title="إرسال">' + IC.send + '</button>' +
            '<input type="file" id="cbFile" style="display:none" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip">' +
            '</div><div class="cb-grip" id="cbGrip" title="تغيير الحجم"></div>';
        document.body.appendChild(win);
        const lb = document.createElement('div'); lb.id = 'cbLight';
        lb.innerHTML = '<div class="lw"><img id="cbLimg" alt=""></div><div class="lb"><a class="cb-a" id="cbLdl">' + IC.dl + ' تحميل</a><button class="cb-a" id="cbLcl">إغلاق</button></div>';
        document.body.appendChild(lb);
        ui = { err: $('#cbErr'), body: $('#cbBody'), chips: $('#cbChips'), ta: $('#cbTa'), title: $('#cbTitle'), sub: $('#cbSub'), comp: $('#cbComp'), light: lb };
        initGeom(); bindDrag(); bindUI();
    }

    function initGeom() {
        const vw = innerWidth, vh = innerHeight, small = vw < 640;
        let g = null; try { g = JSON.parse(localStorage.getItem('cbx2_' + role) || 'null'); } catch (e) {}
        const w = small ? Math.min(vw - 12, 340) : Math.min((g && g.w) || 400, vw - 20), h = small ? Math.round(vh * .5) : Math.min((g && g.h) || 500, vh - 20);
        const l = small ? Math.round((vw - w) / 2) : Math.max(0, Math.min((g && g.l != null ? g.l : 220), vw - w)), t = small ? vh - h - 64 : Math.max(0, Math.min((g && g.t != null ? g.t : vh - h - 70), vh - 60));
        Object.assign(win.style, { width: w + 'px', height: h + 'px', left: l + 'px', top: t + 'px' });
    }
    function saveGeom() { try { localStorage.setItem('cbx2_' + role, JSON.stringify({ l: win.offsetLeft, t: win.offsetTop, w: win.offsetWidth, h: win.offsetHeight })); } catch (e) {} }
    
    function bindDrag() {
        const head = $('#cbHead');
        head.addEventListener('pointerdown', e => {
            if (e.target.closest('button')) return;
            e.preventDefault(); e.stopPropagation(); 
            const sx = e.clientX, sy = e.clientY, sl = win.offsetLeft, st = win.offsetTop;
            head.setPointerCapture(e.pointerId);
            const mv = ev => { win.style.left = Math.max(-win.offsetWidth + 80, Math.min(innerWidth - 80, sl + ev.clientX - sx)) + 'px'; win.style.top = Math.max(0, Math.min(innerHeight - 40, st + ev.clientY - sy)) + 'px'; };
            const up = () => { head.removeEventListener('pointermove', mv); head.removeEventListener('pointerup', up); saveGeom(); };
            head.addEventListener('pointermove', mv); head.addEventListener('pointerup', up);
        });
        const grip = $('#cbGrip');
        grip.addEventListener('pointerdown', e => {
            e.preventDefault(); e.stopPropagation();
            const sx = e.clientX, sy = e.clientY, sw = win.offsetWidth, sh = win.offsetHeight;
            grip.setPointerCapture(e.pointerId);
            const mv = ev => { win.style.width = Math.max(260, Math.min(innerWidth - win.offsetLeft, sw + ev.clientX - sx)) + 'px'; win.style.height = Math.max(180, Math.min(innerHeight - win.offsetTop, sh + ev.clientY - sy)) + 'px'; };
            const up = () => { grip.removeEventListener('pointermove', mv); grip.removeEventListener('pointerup', up); saveGeom(); };
            grip.addEventListener('pointermove', mv); grip.addEventListener('pointerup', up);
        });
    }

    function bindUI() {
        $('#cbCol').addEventListener('click', () => { collapsed = !collapsed; win.classList.toggle('col', collapsed); });
        $('#cbClose').addEventListener('click', () => { CB.toggle(); }); 
        $('#cbSend').addEventListener('click', sendText);
        ui.ta.addEventListener('keydown', e => { if (e.key !== 'Enter') return; e.preventDefault(); if (e.altKey || e.shiftKey) { const a = ui.ta, s = a.selectionStart, n = a.selectionEnd; a.value = a.value.slice(0, s) + '\n' + a.value.slice(n); a.selectionStart = a.selectionEnd = s + 1; a.dispatchEvent(new Event('input')); } else sendText(); });
        ui.ta.addEventListener('input', () => { ui.ta.style.height = '40px'; ui.ta.style.height = Math.min(120, ui.ta.scrollHeight) + 'px'; });
        $('#cbAttach').addEventListener('click', () => $('#cbFile').click());
        $('#cbFile').addEventListener('change', e => { const f = e.target.files[0]; e.target.value = ''; if (f) sendFile(f); });
        $('#cbMic').addEventListener('click', () => rec ? stopRec(true) : startRec());
        $('#cbCancel').addEventListener('click', () => stopRec(false));
        let armed = 0;
        $('#cbClear').addEventListener('click', e => {
            if (!armed) { e.target.textContent = 'تأكيد'; armed = setTimeout(() => { armed = 0; $('#cbClear').textContent = 'مسح'; }, 3000); return; }
            clearTimeout(armed); armed = 0; $('#cbClear').textContent = 'مسح'; clearConv();
        });
        ui.chips.addEventListener('click', e => { const c = e.target.closest('.cb-chip'); if (c) switchTo(c.dataset.k); });
        ui.body.addEventListener('click', e => {
            const im = e.target.closest('img.cb-img'); if (im) return lightbox(im.src, im.dataset.name);
            const fx = e.target.closest('[data-fix]'); if (fx) { const m = find(fx.dataset.fix); if (m && m.file && cfg.onCorrect) cfg.onCorrect(m.file, cur); return; }
            const ed = e.target.closest('[data-ed]'); if (ed) { const m = find(ed.dataset.ed); if (m) { editKey = ed.dataset.ed; ui.ta.value = m.text || ''; ui.ta.focus(); ui.ta.dispatchEvent(new Event('input')); ui.ta.placeholder = 'تعديل الرسالة… (Enter للحفظ)'; } return; }
            const b = e.target.closest('[data-open]'); if (b) { const m = find(b.dataset.open); if (m && m.file && cfg.onOpenFile) cfg.onOpenFile(m.file); }
        });
        ui.light.addEventListener('click', e => { if (e.target.id === 'cbLimg') ui.light.classList.toggle('z'); else if (e.target === ui.light || e.target.id === 'cbLcl' || e.target.classList.contains('lw')) ui.light.classList.remove('show', 'z'); });
        document.addEventListener('keydown', e => { if (e.key === 'Escape') ui.light.classList.remove('show', 'z'); });
    }
    function lightbox(src, name) { const dl = document.getElementById('cbLdl'); dl.href = src; dl.download = name || 'image.jpg'; document.getElementById('cbLimg').src = src; ui.light.classList.add('show'); ui.light.classList.remove('z'); }

    function pathOf(conv) { return conv === 'all' ? 'chatAll' : 'chat/' + conv; }
    function store(conv) { return msgs[conv] || (msgs[conv] = {}); }
    function find(k) { for (const c in msgs) if (msgs[c][k]) return msgs[c][k]; return null; }
    function listFor(conv) {
        let a = Object.keys(store(conv)).map(k => Object.assign({ k, conv }, msgs[conv][k]));
        if (role === 's') a = a.concat(Object.keys(store('all')).map(k => Object.assign({ k, conv: 'all' }, msgs.all[k])));
        return a.sort((x, y) => (x.ts || 0) - (y.ts || 0));
    }
    function attach(conv) {
        if (attached[conv]) return; attached[conv] = true;
        const r = cfg.ref(pathOf(conv));
        r.on('child_added', s => { store(conv)[s.key] = s.val() || {}; got[conv] = (got[conv] || 0) + 1; onMsg(conv, s.key); if (shown && conv === cur) head(); }, fail);
        r.on('child_changed', s => { store(conv)[s.key] = s.val() || {}; if (visible(role === 's' ? cur : conv)) render(); }, fail);
        r.on('child_removed', s => { delete store(conv)[s.key]; recount(conv); if (visible(conv)) render(); });
    }
    function visible(conv) { return shown && !collapsed && (role === 's' || cur === conv); }
    function recount(conv) {
        const s = seen[conv] || 0; let n = 0;
        const arr = role === 's' ? listFor(cur) : Object.keys(store(conv)).map(k => msgs[conv][k]);
        arr.forEach(m => { if (m.from !== role && (m.ts || 0) > s) n++; });
        unread[conv] = n; fire();
    }
    function onMsg(conv, k) {
        const m = msgs[conv][k];
        if (role === 't' && m.from === 's' && cfg.onLast) cfg.onLast(m);
        if (visible(role === 's' ? cur : conv)) { appendOne(Object.assign({ k, conv }, m)); markSeen(conv); }
        else {
            if (m.from !== role && (m.ts || 0) > (seen[conv] || 0)) { unread[conv] = (unread[conv] || 0) + 1; if ((m.ts || 0) > t0 - 2000) beep(); }
            if (shown && role === 't') drawChips();
        }
        fire();
    }
    function markSeen(conv) {
        let mx = 0; const arr = role === 's' ? listFor(cur) : Object.keys(store(conv)).map(k => msgs[conv][k]);
        arr.forEach(m => { if ((m.ts || 0) > mx) mx = m.ts; });
        seen[conv] = mx; unread[conv] = 0; if (role === 's') { seen.all = mx; unread.all = 0; } fire();
    }
    function fire() {
        let tot = 0; Object.keys(unread).forEach(k => { tot += unread[k] || 0; });
        if (cfg.onUnread) cfg.onUnread(tot, unread);
    }
    function beep() {
        try { actx = actx || new (window.AudioContext || window.webkitAudioContext)(); const o = actx.createOscillator(), g = actx.createGain(); o.frequency.value = 880; g.gain.value = .04; o.connect(g); g.connect(actx.destination); o.start(); o.stop(actx.currentTime + .12); } catch (e) {}
    }

    function node(m) {
        const mine = m.from === role, d = document.createElement('div');
        d.className = 'cb-m ' + (mine ? 'me' : 'ot') + (m.conv === 'all' ? ' all' : ''); d.dataset.k = m.k;
        let h = '';

        if (m.text) h += '<div class="cb-tx">' + esc(m.text) + (m.edited ? ' <span class="cb-ted">(معدّلة)</span>' : '') + '</div>';
        if (m.file) {
            const f = m.file;
            if (/^image\//.test(f.type)) h += '<img class="cb-img" src="' + f.data + '" data-name="' + esc(f.name) + '" alt="">' +
                '<div class="cb-act"><a class="cb-a" href="' + f.data + '" download="' + esc(f.name) + '">' + IC.dl + ' تحميل</a>' + (role === 't' ? '<button class="cb-a" data-open="' + m.k + '">' + IC.open + ' فتح في الملفات</button>' + (m.from === 's' ? '<button class="cb-a" data-fix="' + m.k + '">' + IC.fix + ' تصحيح</button>' : '') : '') + '</div>';
            else h += '<div class="cb-file"><div class="cb-fi">' + esc((f.name.split('.').pop() || 'FILE').slice(0, 4).toUpperCase()) + '</div><div class="cb-fn"><b>' + esc(f.name) + '</b><small>' + fsize(f.size || 0) + '</small></div></div>' +
                '<div class="cb-act"><a class="cb-a" href="' + f.data + '" download="' + esc(f.name) + '">' + IC.dl + ' تحميل</a>' + (role === 't' && /pdf/.test(f.type) ? '<button class="cb-a" data-open="' + m.k + '">' + IC.open + ' فتح في الملفات</button>' + (m.from === 's' ? '<button class="cb-a" data-fix="' + m.k + '">' + IC.fix + ' تصحيح</button>' : '') : '') + '</div>';
        }
        if (m.voice) h += '<audio class="cb-au" controls preload="metadata" src="' + m.voice.data + '"></audio>';
        h += '<span class="cb-ts">' + fmt(m.ts || Date.now()) + (mine && m.text && !m.file && !m.voice && m.conv !== 'all' ? '<button class="cb-ed" data-ed="' + m.k + '">تعديل</button>' : '') + (mine ? '<b class="cb-st">' + (ack[m.k] === 'ok' ? ' ✓' : ack[m.k] === 'err' ? ' ✗ لم تُرسل' : ack[m.k] === 'wait' ? ' …' : '') + '</b>' : '') + '</span>';
        d.innerHTML = h; return d;
    }
    function emptyEl() {
        const e = document.createElement('div'); e.className = 'cb-empty';
        e.innerHTML = IC.chat + '<br>' + (role === 's' ? 'اكتب سؤالك للمدرس،<br>أو أرسل صورة / ملفًا / رسالة صوتية' : (!cur ? 'اضغط على ظرف أي طالب<br>في لوحة الطلاب لفتح محادثته' : 'لا توجد رسائل بعد.<br>اكتب ردك أو أرسل ملفًا'));
        return e;
    }
    function render() {
        const arr = cur ? listFor(cur) : []; ui.body.innerHTML = '';
        if (!arr.length) ui.body.appendChild(emptyEl()); else arr.forEach(m => ui.body.appendChild(node(m)));
        ui.body.scrollTop = ui.body.scrollHeight;
    }
    function appendOne(m) {
        const em = ui.body.querySelector('.cb-empty'); if (em) em.remove();
        const near = ui.body.scrollHeight - ui.body.scrollTop - ui.body.clientHeight < 160 || m.from === role;
        ui.body.appendChild(node(m)); if (near) ui.body.scrollTop = ui.body.scrollHeight;
    }
    function peers() { return (cfg.getPeers ? cfg.getPeers() : []); }
    function convOf(p) { return p.id + '_' + (p.sess || ''); }
    function drawChips() {
        return;   /* الاسم يظهر في الشريط الأحمر فقط */
        const ps = peers(); let h = '';
        ps.forEach(p => { const k = convOf(p), n = unread[k] || 0; h += '<button class="cb-chip' + (cur === k ? ' on' : '') + '" data-k="' + k + '"><i class="' + (p.on ? 'on' : '') + '"></i>' + esc(p.name || 'طالب') + (n ? '<em>' + n + '</em>' : '') + '</button>'; });
        ui.chips.innerHTML = h;
    }
    function head() {
        if (role === 's') { ui.title.textContent = 'Mr. Farag Physics4u'; ui.sub.textContent = 'رمز ' + String(cur || '').slice(-5) + ' · وصل ' + (got[cur] || 0); return; }
        if (!cur) { ui.title.textContent = 'الرسائل'; ui.sub.textContent = 'اختر طالبًا'; $('#cbClear').style.display = 'none'; return; }
        const p = peers().find(x => convOf(x) === cur); ui.title.textContent = p ? p.name : 'طالب'; ui.sub.textContent = (p && p.on ? 'متصل' : 'غير متصل') + ' · رمز ' + String(cur).slice(-5) + ' · وصل ' + (got[cur] || 0); $('#cbClear').style.display = '';
    }
    function switchTo(conv) {
        cur = conv; if (role === 't') { if (conv) attach(conv); drawChips(); } head(); render(); if (conv) markSeen(conv);
    }

    function post(obj) {
        const now = Date.now(); if (now - lastSend < 700) { say('انتظر لحظة…'); return false; } lastSend = now;
        obj.from = role; obj.nm = (cfg.me && cfg.me.name) || (role === 't' ? 'المدرس' : 'طالب'); obj.ts = now;
        const conv = role === 's' ? cfg.convKey() : cur; if (!conv) return false;
        const pr = cfg.ref(pathOf(conv)).push(obj);
        if (pr && pr.then) { const k = pr.key; ack[k] = 'wait'; pr.then(() => { ack[k] = 'ok'; stamp(k); }, e => { ack[k] = 'err'; stamp(k); fail(e); }); }
        return true;
    }
    CB.sendTo = function (conv, obj) {
        obj.from = role; obj.nm = (cfg.me && cfg.me.name) || 'المدرس'; obj.ts = Date.now();
        const pr = cfg.ref(pathOf(conv)).push(obj);
        return (pr && pr.then) ? pr : Promise.resolve();
    };
    function stamp(k) { const n = ui.body && ui.body.querySelector('[data-k="' + k + '"] .cb-st'); if (n) n.textContent = ack[k] === 'ok' ? ' ✓' : ack[k] === 'err' ? ' ✗ لم تُرسل' : ' …'; }
    let editKey = null;
    function sendText() {
        const v = ui.ta.value.trim(); if (!v) return;
        if (editKey) {
            const conv = role === 's' ? cfg.convKey() : cur, k = editKey; editKey = null; ui.ta.placeholder = '';
            const pr = cfg.ref(pathOf(conv)).child(k).update({ text: v.slice(0, 1000), edited: true });
            if (pr && pr.catch) pr.catch(fail); ui.ta.value = ''; ui.ta.style.height = '40px'; return;
        } if (post({ text: v.slice(0, 1000) })) { ui.ta.value = ''; ui.ta.style.height = '40px'; } }
    function readAsData(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(f); }); }
    async function shrink(f) {
        const url = await readAsData(f);
        return new Promise(res => {
            const im = new Image(); im.onload = () => {
                let w = im.width, h = im.height, M = 1400; if (Math.max(w, h) > M) { const k = M / Math.max(w, h); w = Math.round(w * k); h = Math.round(h * k); }
                const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(im, 0, 0, w, h);
                res(c.toDataURL('image/jpeg', .82));
            }; im.onerror = () => res(url); im.src = url;
        });
    }
    async function sendFile(f) {
        try {
            let data, type = f.type || 'application/octet-stream', name = f.name || 'file', size = f.size;
            if (/^image\//.test(type) && type !== 'image/gif') { data = await shrink(f); type = 'image/jpeg'; size = Math.round(data.length * .75); name = name.replace(/\.[^.]+$/, '') + '.jpg'; }
            else { if (f.size > MAXFILE) { say('الملف كبير — الحد الأقصى 2.5 ميجا'); return; } data = await readAsData(f); }
            if (data.length > 3400000) { say('الملف كبير — الحد الأقصى 2.5 ميجا'); return; }
            post({ file: { name: name.slice(0, 80), type, size, data } });
        } catch (e) { say('تعذر قراءة الملف'); }
    }
    async function startRec() {
        if (!navigator.mediaDevices || !window.MediaRecorder) { say('المتصفح لا يدعم التسجيل الصوتي'); return; }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
            const mt = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'].find(t => MediaRecorder.isTypeSupported(t)) || '';
            const chunks = []; const mr = new MediaRecorder(stream, mt ? { mimeType: mt, audioBitsPerSecond: 32000 } : { audioBitsPerSecond: 32000 });
            rec = { mr, stream, chunks, send: false };
            mr.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
            mr.onstop = async () => {
                stream.getTracks().forEach(t => t.stop());
                if (!rec || !rec.send || !chunks.length) { rec = null; return; }
                const blob = new Blob(chunks, { type: mr.mimeType || mt || 'audio/webm' }); const dur = Math.round((Date.now() - recStart) / 1000); rec = null;
                if (blob.size > 1800000) { say('التسجيل طويل جدًا'); return; }
                const data = await readAsData(blob); post({ voice: { data, type: blob.type, dur } });
            };
            recStart = Date.now(); mr.start(); ui.comp.classList.add('recing'); const mb = $('#cbMic'); mb.classList.add('rec'); mb.innerHTML = IC.stop;
            recTick = setInterval(() => { const s = Math.round((Date.now() - recStart) / 1000); $('#cbRt').textContent = Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); if (s >= MAXVOICE) stopRec(true); }, 250);
        } catch (e) { say('لم يُسمح باستخدام المايك — فعّله من إعدادات المتصفح'); }
    }
    function stopRec(send) {
        if (!rec) return; rec.send = !!send; clearInterval(recTick); try { rec.mr.stop(); } catch (e) {}
        ui.comp.classList.remove('recing'); const mb = $('#cbMic'); mb.classList.remove('rec'); mb.innerHTML = IC.mic; $('#cbRt').textContent = '0:00';
    }
    function clearConv() { if (role !== 't' || !cur || cur === 'all') return; cfg.ref(pathOf(cur)).remove(); msgs[cur] = {}; unread[cur] = 0; render(); fire(); }

    CB.init = function (c) {
        if (cfg) return; cfg = c; role = c.role; build();
        if (role === 's') { cur = cfg.convKey(); attach(cur); attach('all'); head(); render(); $('#cbClear').style.display = 'none'; }
        else { cur = null; ui.chips.style.display = 'none'; head(); render(); }
    };
    CB.refresh = function () { if (!cfg || role !== 't') return; peers().forEach(p => attach(convOf(p))); if (shown) { drawChips(); head(); } };
    CB.open = function (conv) {
        if (!cfg) return; shown = true; win.classList.add('show'); collapsed = false; win.classList.remove('col');
        if (role === 't') { if (conv) cur = conv; else if (!cur && peers().length) cur = convOf(peers()[0]); peers().forEach(p => attach(convOf(p))); switchTo(cur); } else switchTo(cur);
        setTimeout(() => ui.ta.focus(), 50);
    };
    CB.toggle = function (conv) { if (!cfg) return; if (shown && !collapsed && (!conv || conv === cur)) { shown = false; win.classList.remove('show'); } else CB.open(conv); };
    CB.attach = function () {      /* رفع الواجب مباشرة بدون فتح نافذة الرسائل */
        if (role === 's') { cur = cfg.convKey(); attach(cur); }
        const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*,application/pdf';
        i.onchange = async () => { if (i.files && i.files[0]) { await sendFile(i.files[0]); say('تم رفع الواجب ✓'); } };
        i.click();
    };
    CB.convFor = convOf;
    CB.unread = k => unread[k] || 0;
    CB.isOpen = () => shown;
})();