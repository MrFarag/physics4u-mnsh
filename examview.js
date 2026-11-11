/* عرض الاختبار (A4) — مشترك بين المدرس والطالب: نافذة عائمة قابلة للسحب وتغيير الأبعاد */
(function () {
    'use strict';
    const CSS = '.xw{position:fixed;z-index:300;display:flex;flex-direction:column;background:#0b1424;border:1px solid #5c1a1a;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.6);resize:both;overflow:hidden;min-width:300px;min-height:260px;direction:rtl;font:12px system-ui,"Segoe UI",Tahoma,Cairo,sans-serif;color:#e2e8f0}' +
        '.xw *{box-sizing:border-box}.xw-bar{display:flex;align-items:center;gap:12px;padding:10px 12px;min-height:54px;background:linear-gradient(135deg,#4a0808,#7f1d1d);border-bottom:2px solid #ea580c;cursor:move;flex-shrink:0;user-select:none;touch-action:none}' +
        '.xw-bar b{color:#fee2e2;font-size:14px;white-space:nowrap}.xw-bar input{width:52px;font-size:14px;background:#12213a;border:1px solid #1f3a63;color:#e2e8f0;border-radius:6px;padding:2px 4px;font:inherit}' +
        '.xw-b{background:#ea580c;color:#fff;border:0;border-radius:8px;padding:7px 14px;font:700 13px inherit;cursor:pointer;white-space:nowrap}.xw-b.g{background:#1f3a63}.xw-b:disabled{opacity:.5}' +
        '.xw-main{flex:1;display:flex;min-height:0}.xw-side{width:150px;flex-shrink:0;overflow:auto;padding:6px;background:#0d1a30;border-left:1px solid #1f3a63;display:flex;flex-direction:column;gap:4px}' +
        '.xw-side h4{margin:6px 0 2px;color:#e6c75a;font-size:11px}.xw-side .ch{background:#12213a;border:1px solid #1f3a63;color:#e2e8f0;border-radius:999px;padding:3px 8px;font:inherit;cursor:pointer;text-align:right}.xw-side .ch.on{background:#7f1d1d;border-color:#ea580c}' +
        '.xw-res{font-size:11px;border-top:1px dashed #1f3a63;padding-top:4px}.xw-res div{padding:2px 0}.xw-res i{color:#94a3b8;font-style:normal;cursor:pointer;text-decoration:underline}.xw-res p{margin:2px 0;background:#12213a;padding:4px;border-radius:6px;white-space:pre-wrap}' +
        '.xw-sc{flex:1;overflow:auto;background:#334155;direction:ltr;position:relative;cursor:grab;scrollbar-width:thin}.xw-sc.pan{cursor:grabbing;user-select:none}.xw-pgw{position:relative}' +
        '.xw-foot{display:none;align-items:center;gap:6px;padding:5px 8px;background:linear-gradient(135deg,#4a0808,#7f1d1d);border-top:2px solid #ea580c;flex-shrink:0;overflow-x:auto;white-space:nowrap}.xw-foot .ch{background:#12213a;border:1px solid #1f3a63;color:#e2e8f0;border-radius:999px;padding:3px 10px;font:inherit;cursor:pointer;flex-shrink:0}.xw-foot .ch.on{background:#ea580c;border-color:#fdba74}.xw-foot .ch.off{opacity:.5}' +
        '.xw-warn{position:absolute;left:50%;bottom:16px;transform:translateX(-50%);background:rgba(254,243,199,.96);color:#92400e;border:1px solid #f59e0b;border-radius:999px;padding:6px 18px;font:700 14px Cairo,system-ui,sans-serif;box-shadow:0 6px 24px rgba(0,0,0,.35);animation:xwf .6s ease;z-index:5;display:flex;gap:8px;align-items:center;pointer-events:none}.xw-warn b{font:700 20px/1 monospace;color:#b91c1c;direction:ltr}@keyframes xwf{from{opacity:0;transform:translate(-50%,10px)}to{opacity:1;transform:translate(-50%,0)}}' +
        '.xw-pg{position:absolute;left:0;top:0;width:794px;min-height:1123px;transform-origin:0 0;background:#fff;box-shadow:0 4px 22px rgba(0,0,0,.55);color:#111;direction:rtl;text-align:right;padding:16px 30px;font:16px/1.6 Cairo,"Segoe UI",Tahoma,sans-serif}' +
        '.xw-ex{flex:1;display:flex;align-items:center;gap:14px;min-width:0}.xw.anc{resize:none}.xw.anc .xw-bar{cursor:default}.xw-cells{display:flex;gap:6px;align-items:center;flex:1;min-width:0;overflow:hidden;direction:ltr}.xw-cells span{display:inline-flex;gap:5px;align-items:center;white-space:nowrap;flex-shrink:0;height:26px;padding:0 8px;background:rgba(255,255,255,.04);border:1px solid rgba(230,199,90,.18);border-radius:6px}.xw-cells span:nth-child(4){flex-shrink:1;min-width:0}.xw-cells span:nth-child(4) b{overflow:hidden;text-overflow:ellipsis;max-width:100px}.xw-cells i{font-style:normal;color:#fca5a5;font-size:11px;line-height:1}.xw-cells input{width:46px;height:22px;background:#12213a;border:1px solid #1f3a63;color:#e2e8f0;border-radius:5px;padding:0 4px;font:700 13px inherit;text-align:center}.xw-cells b{color:#fef3c7;font-size:13px;line-height:1}.xw-cells .tm{font:700 15px/1 monospace;color:#fde68a;direction:ltr}.xw-sel{background:#12213a;border:1px solid #1f3a63;color:#e2e8f0;border-radius:6px;padding:3px 6px;font:inherit;font-size:13px;cursor:pointer;outline:none;max-width:110px}.xw-sel:hover{border-color:#ea580c}' +
        '.xp-hd{display:flex;align-items:stretch;gap:0;height:36px;border:2px solid #111;border-radius:6px;padding:0;margin-bottom:14px;font-size:13px;white-space:nowrap;overflow:hidden}.xp-hd span{display:flex;gap:4px;align-items:center;justify-content:center;padding:0 6px;border-left:1px solid #999;flex:1 1 0;width:0;min-width:0;overflow:hidden;text-overflow:ellipsis}.xp-hd span:first-child{border-left:0}.xp-hd i{font-style:normal;color:#666;font-size:11px;line-height:1;flex-shrink:0}.xp-hd b{font-weight:700;line-height:1;overflow:hidden;text-overflow:ellipsis}' +
        '.xp-hd .tm{font:700 15px/1 monospace;color:#b91c1c;direction:ltr}' +
        '.xp-q{margin:0 0 8px;padding-bottom:6px;border-bottom:1px dashed #bbb}.xp-r{display:flex;gap:14px;align-items:center}.xp-t{flex:1;min-width:0}.xp-f{flex:0 0 250px;text-align:center}.xp-f img{max-height:120px;max-width:250px;width:auto;margin:0 auto}.xp-n{font-weight:900;color:#7f1d1d;font-size:14px;line-height:1.3}.xp-q img{display:block;max-width:100%}' +
        '.xp-o{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:4px}.xp-o label{display:flex;align-items:center;gap:5px;border:1.5px solid #cbd5e1;border-radius:8px;padding:2px 6px;cursor:pointer;min-height:32px}.xp-o label.ok{border-color:#16a34a;background:#dcfce7}.xp-o input{appearance:none;-webkit-appearance:none;width:16px;height:16px;flex-shrink:0;margin:0;border:2px solid #64748b;border-radius:50%;background:transparent}.xp-o input:checked{background:radial-gradient(circle,#2563eb 0 38%,transparent 42%);border-color:#2563eb}.xp-o label:has(input:checked){border-color:#2563eb;background:rgba(37,99,235,.10)}.xp-o b{color:#7f1d1d}.xp-o img{max-width:100%}' +
        '.xp-e textarea{width:100%;min-height:110px;margin-top:4px;border:1.5px solid #94a3b8;border-radius:8px;padding:8px;font:16px/1.6 Cairo,Tahoma,sans-serif;direction:rtl;resize:vertical}' +
        '.xw-gb{position:fixed;z-index:300;display:flex;align-items:center;gap:10px;padding:6px 12px;background:linear-gradient(135deg,#4a0808,#7f1d1d);border-bottom:2px solid #ea580c;font:12.5px system-ui,Cairo,sans-serif;color:#fde68a;direction:rtl;flex-wrap:wrap;min-height:44px}.xw-gb b{color:#fee2e2;font-size:14px}.xw-gb label{display:inline-flex;gap:4px;align-items:center;cursor:pointer}.xw-gb input:not([type=checkbox]){width:130px;background:#12213a;border:1px solid #1f3a63;color:#e2e8f0;border-radius:6px;padding:5px 7px;direction:ltr}.xw-gb .xw-b.g.on{background:#b45309}' +
        '.xw-pop{position:fixed;z-index:310;display:none;width:88px;padding:5px 6px 6px;background:rgba(255,251,235,.97);border:1px solid #d4af37;border-radius:10px;box-shadow:0 6px 18px rgba(0,0,0,.45);text-align:center}.xw-pop .ph{cursor:move;margin:-5px -6px 4px;padding:3px;background:#fde68a;border-radius:9px 9px 0 0;color:#92400e;font:700 11px system-ui,Cairo,sans-serif;user-select:none;touch-action:none}.xw-pop input{width:52px;text-align:center;border:1px solid #e5d9a8;border-radius:6px;background:#fff;font:700 17px Georgia,serif;color:#b91c1c;padding:2px;outline:0}.xw-pop input.pm{font-size:14px;color:#334155}.xw-pop hr{border:0;border-top:2px solid #b91c1c;margin:3px 10px}.xw-pop .ok{margin-top:5px;width:100%;padding:4px}' +
        '.xs-btn{position:fixed;top:44px;left:50%;transform:translateX(-50%);z-index:299;background:#ea580c;color:#fff;border:0;border-radius:999px;padding:8px 22px;font:700 14px Cairo,system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.5);cursor:pointer}';
    function css() { if (document.getElementById('xwCss')) return; const s = document.createElement('style'); s.id = 'xwCss'; s.textContent = CSS; document.head.appendChild(s); }
    const LT = ['أ', 'ب', 'ج', 'د'], KD = { lesson: 'Lesson', sec: 'Section', ch: 'Ch' };
    const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const fmt = s => { s = Math.max(0, Math.round(s)); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };

    /* نافذة عائمة */
    function win(o) {
        css(); const w = document.createElement('div'); w.className = 'xw';
        const W = Math.min(innerWidth - 20, o.w || 700), H = Math.min(innerHeight - 20, o.h || 800), anc = o.anchor ? (typeof o.anchor === 'function' ? o.anchor : () => document.getElementById(o.anchor)) : null;
        w.style.cssText += ';width:' + W + 'px;height:' + H + 'px;left:' + Math.max(4, o.x != null ? o.x : (innerWidth - W) / 2) + 'px;top:' + Math.max(4, o.y != null ? o.y : 10) + 'px';
        w.innerHTML = '<div class="xw-bar"><b>' + esc(o.title || '') + '</b><span class="xw-ex"></span></div><div class="xw-main"><div class="xw-side" style="display:' + (o.side ? '' : 'none') + '"></div><div class="xw-sc"><div class="xw-pgw"></div></div></div><div class="xw-foot"></div>';
        document.body.appendChild(w); let ancRaf = 0, ancStop = false;
        if (anc) {
            w.classList.add('anc');
            const place = () => {
                if (ancStop) return;
                const el = anc(); if (!el) { ancRaf = requestAnimationFrame(place); return; }
                const r = el.getBoundingClientRect();
                if (r.width < 50) { ancRaf = requestAnimationFrame(place); return; }
                /* تحديث فقط إذا تغيّر الموقع لتفادي إعادة الرسم غير الضرورية */
                if (w._lastL !== r.left || w._lastT !== r.top || w._lastW !== r.width || w._lastH !== r.height) {
                    w.style.left = r.left + 'px'; w.style.top = r.top + 'px'; w.style.width = r.width + 'px'; w.style.height = r.height + 'px';
                    w._lastL = r.left; w._lastT = r.top; w._lastW = r.width; w._lastH = r.height;
                }
                /* أثناء سحب الفاصل لا تلتقط النافذة الماوس إطلاقًا */
                const dr = !!window.__mcSplitDragging; if (w._dr !== dr) { w._dr = dr; w.style.pointerEvents = dr ? 'none' : ''; }
                ancRaf = requestAnimationFrame(place);
            };
            place();
            addEventListener('resize', () => { w._lastL = null; });
        }
        ['mousedown', 'mousemove', 'mouseup', 'pointerdown', 'pointermove', 'pointerup', 'touchstart', 'touchmove', 'touchend', 'click', 'dblclick', 'contextmenu', 'wheel', 'keydown'].forEach(ev => w.addEventListener(ev, e => e.stopPropagation()));
        const bar = w.querySelector('.xw-bar'); let d = null;
        bar.addEventListener('pointerdown', e => { if (anc || e.target.closest('button,input') || window.__mcSplitDragging) return; d = { x: e.clientX - w.offsetLeft, y: e.clientY - w.offsetTop }; bar.setPointerCapture(e.pointerId); });
        bar.addEventListener('pointermove', e => { if (!d || window.__mcSplitDragging) return; w.style.left = Math.max(-w.offsetWidth + 80, Math.min(innerWidth - 80, e.clientX - d.x)) + 'px'; w.style.top = Math.max(0, Math.min(innerHeight - 40, e.clientY - d.y)) + 'px'; });
        bar.addEventListener('pointerup', () => { d = null; });
        const sc = w.querySelector('.xw-sc'), pgw = w.querySelector('.xw-pgw'), M = 6;
        let first = true;
        const fit = () => { const pg = pgw.firstElementChild; if (!pg) return; const k = Math.min(1.25, Math.max(0.2, (sc.clientWidth - 24) / 794)), ph = Math.max(pg.offsetHeight, 1123) * k; pg.style.transform = 'scale(' + k + ')'; pg.style.left = Math.max(12, (sc.clientWidth - 794 * k) / 2) + 'px'; pg.style.top = '12px'; pgw.style.width = Math.max(794 * k + 24, sc.clientWidth - 2) + 'px'; pgw.style.height = ph + 24 + 'px'; if (first && sc.clientWidth) { first = false; sc.scrollLeft = 0; sc.scrollTop = 0; } };
        if (window.ResizeObserver) new ResizeObserver(fit).observe(sc);
        let pn = null;
        sc.addEventListener('pointerdown', e => { if (e.button || e.target.closest('input,textarea,label,button,.ee') || window.__mcSplitDragging) return; pn = { x: e.clientX, y: e.clientY, l: sc.scrollLeft, t: sc.scrollTop }; sc.classList.add('pan'); sc.setPointerCapture(e.pointerId); });
        sc.addEventListener('pointermove', e => { if (!pn || window.__mcSplitDragging) return; sc.scrollLeft = pn.l - (e.clientX - pn.x); sc.scrollTop = pn.t - (e.clientY - pn.y); });
        const pe = () => { pn = null; sc.classList.remove('pan'); }; sc.addEventListener('pointerup', pe); sc.addEventListener('pointercancel', pe);
        return { el: w, ex: w.querySelector('.xw-ex'), side: w.querySelector('.xw-side'), foot: w.querySelector('.xw-foot'), pgw, fit, set(pg) { pgw.innerHTML = ''; pgw.appendChild(pg); if (window.ResizeObserver) new ResizeObserver(fit).observe(pg); fit(); }, close() { if (ancRaf) cancelAnimationFrame(ancRaf); ancStop = true; w.remove(); } };
    }

    function cells(m, dur) { m = m || {}; const c = (l, v) => '<span><i>' + l + '</i><b>' + esc(v || '—') + '</b></span>'; return '<div class="xw-cells">' + c('Ch', m.ch) + c('Sec', m.sec) + c('Lesson No.', m.lessonNo) + c('Lesson Title', m.title) + c('Test Kind', KD[m.kind] || m.kind) + '<span><i>⏱</i><b class="tm">' + fmt((dur || 0) * 60) + '</b></span></div>'; }
    /* صفحة A4: صف معلومات واحد + 4 اختيارات + سؤال مقالي */
    function page(ex, o) {
        o = o || {}; const m = ex.meta || {}, pg = document.createElement('div'); pg.className = 'xw-pg';
        const cell = (l, v) => '<span><i>' + l + '</i><b>' + esc(v || '—') + '</b></span>';
        let h = o.nohd ? '' : '<div class="xp-hd">' + cell('Ch', m.ch) + cell('Sec', m.sec) + cell('Lesson No.', m.lessonNo) + cell('Lesson Title', m.title) + cell('Test Kind', KD[m.kind] || m.kind) + '<span><i>⏱</i><b class="tm">' + fmt((ex.dur || 0) * 60) + '</b></span></div>';
        let n = 0;
        (ex.items || []).forEach((it, i) => {
            n++; const row = '<div class="xp-r"><div class="xp-t"><img src="' + it.img + '"/></div>' + (it.fig ? '<div class="xp-f"><img src="' + it.fig + '"/></div>' : '') + '</div>';
            if (it.t === 'm') h += '<div class="xp-q"><div class="xp-n">السؤال ' + n + ' — اختياري</div>' + row + '<div class="xp-o">' + it.o.map((src, j) => '<label class="' + (o.key && o.key[i] === j ? 'ok' : '') + '"><input type="radio" name="xq' + i + '" value="' + j + '"' + (o.ro ? ' disabled' : '') + '/><b>' + LT[j] + '</b><img src="' + src + '"/></label>').join('') + '</div></div>';
            else h += '<div class="xp-q xp-e"><div class="xp-n">السؤال ' + n + ' — مقالي (اكتب الحل في المربع)</div>' + row + '<textarea placeholder="اكتب إجابتك هنا…"' + (o.ro ? ' disabled' : '') + '></textarea></div>';
        });
        pg.innerHTML = h; return pg;
    }
    function collect(pg, ex) {
        const m = [], out = { m: m, e: '' };
        (ex.items || []).forEach((it, i) => { if (it.t === 'm') { const c = pg.querySelector('input[name="xq' + i + '"]:checked'); m.push(c ? +c.value : -1); } else out.e = (pg.querySelector('textarea').value || '').slice(0, 5000); });
        return out;
    }

    /* ───── جهة الطالب ───── */
    let sBtn = null, sWin = null, sTimer = 0;
    window.MCExamStudent = function (v) {
        css();
        if (sBtn) { sBtn.remove(); sBtn = null; }
        if (!v || !v.items || !v.id) { if (sWin && !sWin.done) { sWin.close(); sWin = null; clearInterval(sTimer); } return; }
        let done = false; try { done = !!localStorage.getItem('mc_exam_' + v.id); } catch (e) { }
        if (done || sWin) return;
        try { const me = window.__stuMe && window.__stuMe(); if (v.to && me && !v.to[me.id]) return; } catch (e) { }
        sBtn = document.createElement('button'); sBtn.className = 'xs-btn'; sBtn.textContent = '📝 تحميل الاختبار وبدء الحل — ' + v.dur + ' دقيقة';
        sBtn.onclick = () => { sBtn.remove(); sBtn = null; start(v); };
        document.body.appendChild(sBtn);
    };
    function start(v) {
        const w = win({ title: '', anchor: () => document.getElementById('viewWrap') || document.getElementById('slideBox') || document.body }), pg = page(v, { nohd: true });
        w.ex.innerHTML = cells(v.meta, v.dur); const tm = w.ex.querySelector('.tm'), sub = document.createElement('button'); sub.className = 'xw-b'; sub.textContent = 'إنهاء وإرسال';
        w.el.querySelector('.xw-bar').appendChild(sub); w.set(pg); sWin = w; let left = v.dur * 60, sent = false, arm = 0;
        const send = async () => {
            if (sent) return; sent = true; clearInterval(sTimer); const a = collect(pg, v);
            pg.querySelectorAll('input,textarea').forEach(x => x.disabled = true);
            try {
                const me = window.__stuMe ? window.__stuMe() : { id: 'x', name: '' };
                await window.__stuRef('examSub/' + v.id + '/' + me.id).set({ id: me.id, name: me.name || '', phone: me.phone || '', m: a.m, e: a.e, ts: Date.now() });
                try { localStorage.setItem('mc_exam_' + v.id, '1'); } catch (e) { }
                sub.textContent = 'تم الإرسال ✓'; sub.disabled = true; w.done = true; setTimeout(() => { w.close(); sWin = null; }, 1800);
            } catch (e) { sent = false; sub.textContent = 'تعذّر الإرسال — أعد المحاولة'; sub.disabled = false; }
        };
        sub.onclick = () => { if (!arm) { arm = 1; sub.textContent = 'تأكيد الإرسال'; setTimeout(() => { if (!sent) { arm = 0; sub.textContent = 'إنهاء وإرسال'; } }, 3000); return; } send(); };
        let wn = null;
        sTimer = setInterval(() => {
            left--; tm.textContent = fmt(left);
            if (left <= 30 && left > 0 && !sent) { if (!wn) { wn = document.createElement('div'); wn.className = 'xw-warn'; w.el.appendChild(wn); } wn.innerHTML = '⏳ باقي من الوقت <b>' + fmt(left) + '</b> وسيُغلق الاختبار ويُرسَل تلقائيًا'; }
            if (left <= 0) { if (wn) wn.remove(); send(); }
        }, 1000);
    }
    window.MCExamView = { cells: cells, win: win, page: page, collect: collect, fmt: fmt };
})();
