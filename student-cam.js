/* [3] أنماط: أزرار الكاميرا/السماعة/المايك باهتة عند عدم التفعيل + نافذة إشعار الخصوصية */
(function () {
  /* خط يدوي (رقعة) لزرّي الإلغاء والإرسال */
  if (!document.getElementById('stuCamFont')) {
    var fl = document.createElement('link'); fl.id = 'stuCamFont'; fl.rel = 'stylesheet';
    fl.href = 'https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@400;700&display=swap';
    document.head.appendChild(fl);
  }
  var old = document.getElementById('stuCamCss'); if (old) old.remove();
  var st = document.createElement('style'); st.id = 'stuCamCss';
  st.textContent =
    '#camBtn:not(.on),#micBtn:not(.on):not(.live):not(.hint),#spkBtn.off,#msgBtn:not(.on):not(:has(.cb-badge.on)){opacity:.42;filter:grayscale(.65)}' +
    '#camBtn:not(.on):hover,#micBtn:hover,#spkBtn.off:hover,#msgBtn:hover{opacity:.85}' +
    '#camBtn.on{color:#4ade80}#camBtn.on svg{stroke:#4ade80}' +

    /* ===== النافذة الصغيرة ===== */
    '#stuCamNote{position:fixed;left:10px;bottom:64px;width:190px;height:113px;min-width:120px;min-height:80px;z-index:99990;border-radius:10px;overflow:hidden;background:#000;border:2px solid #7f1d1d;box-shadow:0 6px 20px rgba(0,0,0,.6);direction:rtl;font-family:Cairo,system-ui,sans-serif}' +
    '#stuCamNote video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}' +
    '#stuCamNote.back video{transform:none}' +
    '#stuCamNote .sn-t{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:5px;padding:5px 34px;height:32px;background:linear-gradient(180deg,rgba(0,0,0,.7),transparent);color:#fff;font-size:10px;font-weight:700;cursor:move;touch-action:none;z-index:3}' +
    '#stuCamNote .sn-t span{flex:1}' +
    '#stuCamNote .sn-mx{background:rgba(15,23,42,.8);color:#fff;border:0;border-radius:4px;width:20px;height:16px;font-size:11px;line-height:1;cursor:pointer;padding:0}' +
    '#stuCamNote .sn-d{width:8px;height:8px;border-radius:50%;background:#b91c1c;animation:snp 1.2s infinite}@keyframes snp{50%{opacity:.25}}' +

    /* مقابض تغيير الحجم */
    '#stuCamNote .sn-rz{position:absolute;bottom:0;width:20px;height:20px;z-index:5;touch-action:none}' +
    '#stuCamNote .sn-rz-se{right:0;cursor:se-resize;background:linear-gradient(135deg,transparent 55%,#fff 55%,#fff 65%,transparent 65%,transparent 75%,#fff 75%,#fff 85%,transparent 85%)}' +
    '#stuCamNote .sn-rz-sw{left:0;cursor:sw-resize;background:linear-gradient(225deg,transparent 55%,#fff 55%,#fff 65%,transparent 65%,transparent 75%,#fff 75%,#fff 85%,transparent 85%)}' +
    '#stuCamNote .sn-rz-e,#stuCamNote .sn-rz-w{top:34px;bottom:22px;width:12px;height:auto;background:none}#stuCamNote .sn-rz-e{right:0;cursor:ew-resize}#stuCamNote .sn-rz-w{left:0;cursor:ew-resize}#stuCamNote .sn-rz-s{left:22px;right:22px;bottom:0;width:auto;height:10px;background:none;cursor:ns-resize}#stuCamNote .sn-rz:hover{background:rgba(255,255,255,.18)}' +

    /* أزرار الزاويتين: تدوير (يسار) وإغلاق (يمين) */
    '#stuCamNote .sn-cb{position:absolute;top:5px;z-index:8;box-sizing:border-box;width:22px;height:22px;border-radius:50%;border:0;padding:0;margin:0;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;background:rgba(15,23,42,.8)}' +
    '#stuCamNote .sn-cb svg{width:12px;height:12px;fill:none;stroke:#fff;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}' +
    '#stuCamNote .sn-cf{left:5px}' +
    '#stuCamNote .sn-cx{right:5px;background:rgba(20,83,45,.92)}' +
    '#stuCamNote .sn-cb:hover{filter:brightness(1.25)}' +

    /* زر الالتقاط: 26px أحمر داكن متدرج وبداخله كاميرا */
    '#stuCamNote .sn-shot{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);z-index:8;box-sizing:border-box;width:26px;height:26px;border-radius:50%;padding:0;margin:0;cursor:pointer;display:flex;align-items:center;justify-content:center;border:1.5px solid rgba(203,213,225,.45);background:radial-gradient(circle at 35% 30%,#b91c1c 0%,#7f1d1d 55%,#450a0a 100%);box-shadow:0 0 0 1.5px rgba(15,23,42,.8),0 0 0 3px rgba(148,163,184,.25)}' +
    '#stuCamNote .sn-shot svg{width:13px;height:13px;fill:none;stroke:rgba(255,255,255,.92);stroke-width:2.1;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}' +
    '#stuCamNote .sn-shot:active{transform:translateX(-50%) scale(.92)}' +

    /* حلقة الفوكس */
    '#stuCamNote .sn-fx{position:absolute;width:70px;height:70px;margin:-35px 0 0 -35px;border:2px solid #fde047;border-radius:50%;pointer-events:none;display:none;z-index:7;box-shadow:0 0 0 1px rgba(0,0,0,.35)}' +
    '#stuCamNote .sn-fx.go{display:block;animation:snfx .9s ease-out forwards}' +
    '@keyframes snfx{0%{transform:scale(1.5);opacity:0}25%{opacity:1}60%{transform:scale(1);opacity:1}100%{transform:scale(1);opacity:0}}' +

    /* معاينة اللقطة قبل الإرسال (مخفية افتراضيًا) */
    '#stuCamNote .sn-pv{display:none;position:absolute;left:0;top:0;right:0;bottom:0;background:#000;z-index:9}' +
    '#stuCamNote .sn-pv img{width:100%;height:100%;object-fit:contain;display:block}' +
    '#stuCamNote .sn-pb{display:none;position:absolute;left:0;right:0;bottom:22px;justify-content:center;align-items:center;gap:16px;z-index:10}' +

    /* زرّا إلغاء / إرسال: مستطيل بحواف دائرية + تدرج + خط يدوي */
    '#stuCamNote .sn-pb button{box-sizing:border-box;height:42px;min-width:112px;padding:0 18px 0 12px;margin:0;border:0;border-radius:21px;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;color:#fff;font-family:"Aref Ruqaa","Katibeh","Reem Kufi",Cairo,cursive;font-size:20px;font-weight:700;line-height:1;letter-spacing:0;text-shadow:0 1px 2px rgba(0,0,0,.4);box-shadow:0 4px 14px rgba(0,0,0,.45),inset 0 1px 0 rgba(255,255,255,.28);transition:transform .12s,filter .12s}' +
    '#stuCamNote .sn-pb button:active{transform:scale(.94)}' +
    '#stuCamNote .sn-pb button:hover{filter:brightness(1.12)}' +
    '#stuCamNote .sn-pb .sn-ic{width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;flex:0 0 24px}' +
    '#stuCamNote .sn-pb .sn-ic svg{width:13px;height:13px;fill:none;stroke:#fff;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}' +
    '#stuCamNote .sn-pb .sn-re{background:linear-gradient(135deg,#9a3412 0%,#7f1d1d 55%,#450a0a 100%)}' +
    '#stuCamNote .sn-pb .sn-sd{background:linear-gradient(135deg,#16a34a 0%,#15803d 50%,#14532d 100%)}' +
    '#stuCamNote .sn-pb button:disabled{opacity:.5;cursor:default;filter:none}' +
    '#stuCamNote.prev .sn-pv{display:block}#stuCamNote.prev .sn-pb{display:flex}' +
    '#stuCamNote.prev .sn-shot,#stuCamNote.prev .sn-cb,#stuCamNote.prev .sn-fx{display:none !important}' +

    /* رسالة النتيجة */
    '#stuCamNote .sn-ok{position:absolute;top:-70px;color:#fff;background:#16a34a;border-radius:18px;padding:6px 16px;font:700 14px Cairo,system-ui,sans-serif;display:none}' +

    /* ===== وضع التقاط الصورة (ملء الشاشة) ===== */
    '#stuCamNote.cap{left:0 !important;top:0 !important;right:0 !important;bottom:0 !important;width:100vw !important;height:100vh !important;height:100dvh !important;border-radius:0;border-width:0;z-index:2147483000}' +
    '#stuCamNote.cap video{object-fit:contain;background:#000}' +
    '#stuCamNote.cap .sn-t,#stuCamNote.cap .sn-rz{display:none}' +
    '#stuCamNote.cap::after{content:"";position:absolute;left:0;right:0;bottom:0;height:110px;background:linear-gradient(0deg,rgba(0,0,0,.55),transparent);pointer-events:none;z-index:6}' +
    '#stuCamNote.cap .sn-cb{top:12px;width:26px;height:26px}' +
    '#stuCamNote.cap .sn-cb svg{width:15px;height:15px}' +
    '#stuCamNote.cap .sn-cf{left:12px}' +
    '#stuCamNote.cap .sn-cx{right:12px}' +
    '#stuCamNote.cap .sn-shot{width:38px;height:38px;bottom:18px;border-width:2px;box-shadow:0 0 0 3px rgba(15,23,42,.8),0 0 0 5px rgba(148,163,184,.25),0 0 0 9px rgba(15,23,42,.3)}' +
    '#stuCamNote.cap .sn-shot svg{display:none}' +
    '#stuCamNote.cap .sn-ok{position:fixed;top:14px;left:50%;transform:translateX(-50%);z-index:11}';
  document.head.appendChild(st);
})();
/* student-cam.js — كاميرا + صوت الطالب إلى المعلم (WebRTC) مع لقطات احتياطية
   زر #camBtn: ضغطة = تشغيل (فيديو + صوت)، ضغطة ثانية = إيقاف.
   المسارات (مسموحة في القواعد): camOn/<id> ، s2t_cam_offer/<id> ، s2t_cam_ice/<id> (يكتبها الطالب)
                                  t2s_cam_answer/<id> ، t2s_cam_ice/<id> (يكتبها المعلم)
   اللقطات camShot/<id> احتياطي إلى أن يتصل البث الحي (تتوقف حين يتصل). */
/* [1] ننتظر جاهزية Firebase وزر الكاميرا (حتى 40 ثانية) بدل الاستسلام بعد 3 ثوانٍ */
(function waitReady(n) {
  if (window.firebase && firebase.apps && firebase.apps.length && document.getElementById('camBtn')) { init(); return; }
  if (n > 80) return; setTimeout(function () { waitReady(n + 1); }, 500);
})(0);
function init() {
  (function () {
    var db = firebase.database(), RTC = db.ref('rooms/live/rtc'), btn = document.getElementById('camBtn');
    var stream = null, pc = null, shotT = 0, offs = [], warned = false, live = false, facing = 'user', note = null, pending = null;
    var video = document.createElement('video'); video.muted = true; video.playsInline = true; video.autoplay = true;
    var cv = document.createElement('canvas');
    var spk = document.getElementById('spkBtn'); if (spk && spk.parentNode && btn.previousElementSibling !== spk) spk.parentNode.insertBefore(btn, spk.nextSibling);   /* زر الكاميرا بجوار السماعة */
    function sid() { return window.__stuMe ? window.__stuMe().id : ''; }
    function err(e) { console.error('[cam]', e); if (!warned) { warned = true; alert('تعذّر إرسال الكاميرا للمعلم: ' + (e && e.code || e && e.message || e)); } }

    /* مسار الفيديو الحالي + تطبيق قيود بأمان (بعض الأجهزة لا تدعم الفوكس فنتجاهل بصمت) */
    function vTrack() { return stream && stream.getVideoTracks()[0]; }
    function tryConstraints(c) { var t = vTrack(); if (!t || !t.applyConstraints) return Promise.resolve(false); return t.applyConstraints(c).then(function () { return true; }, function () { return false; }); }

    /* إلغاء اللقطة المعلّقة وإخفاء المعاينة */
    function clearPrev() {
      if (pending) { try { URL.revokeObjectURL(pending.url); } catch (e) { } pending = null; }
      if (note) {
        note.classList.remove('prev');
        var im = note.querySelector('.sn-pv img'); if (im) im.removeAttribute('src');
        var sd = note.querySelector('.sn-sd'); if (sd) sd.disabled = false;
      }
    }

    /* [4] نافذة الخصوصية: تدوير (أعلى اليسار) + إغلاق (أعلى اليمين) + زر الالتقاط (أسفل المنتصف) */
    function setCap(on) {
      if (!note) return;
      clearPrev();
      note.classList.toggle('cap', !!on);
      if (on) {
        /* دقة أعلى لصورة أوضح + فوكس مستمر */
        tryConstraints({ width: { ideal: 1280 }, height: { ideal: 720 } }).then(function () { return tryConstraints({ advanced: [{ focusMode: 'continuous' }] }); });
      } else {
        tryConstraints({ width: { ideal: 640 }, height: { ideal: 480 } });
      }
    }
    /* فوكس باللمس: نحسب موضع اللمسة داخل الصورة الفعلية (مع object-fit:contain والمرآة) ثم نطلب من الكاميرا التركيز عليه */
    function tapFocus(e) {
      if (!note || !note.classList.contains('cap') || note.classList.contains('prev')) return;
      var v = note.querySelector('video'), W = note.clientWidth, H = note.clientHeight;
      if (!v.videoWidth) return;
      var ar = v.videoWidth / v.videoHeight, rw = W, rh = W / ar;
      if (rh > H) { rh = H; rw = H * ar; }
      var ox = (W - rw) / 2, oy = (H - rh) / 2, px = e.clientX - ox, py = e.clientY - oy;
      if (px < 0 || py < 0 || px > rw || py > rh) return;
      var x = px / rw, y = py / rh; if (facing === 'user') x = 1 - x;
      var ring = note.querySelector('.sn-fx');
      ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
      ring.classList.remove('go'); void ring.offsetWidth; ring.classList.add('go');
      tryConstraints({ advanced: [{ focusMode: 'single-shot', pointsOfInterest: [{ x: x, y: y }] }] }).then(function (ok) {
        if (!ok) return tryConstraints({ advanced: [{ pointsOfInterest: [{ x: x, y: y }] }] });
      });
    }
    function showNote() {
      hideNote();
      note = document.createElement('div'); note.id = 'stuCamNote';
      note.innerHTML = '<video autoplay playsinline muted></video>' +
        '<div class="sn-t"><i class="sn-d"></i><span></span><button class="sn-mx" type="button">▢</button></div>' +
        '<i class="sn-rz sn-rz-se" data-rz="se"></i><i class="sn-rz sn-rz-sw" data-rz="sw"></i><i class="sn-rz sn-rz-e" data-rz="e"></i><i class="sn-rz sn-rz-w" data-rz="w"></i><i class="sn-rz sn-rz-s" data-rz="s"></i>' +
        '<button class="sn-cb sn-cf" type="button"><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 0-15-6.7L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"/><path d="M16 16h5v5"/></svg></button>' +
        '<button class="sn-cb sn-cx" type="button"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button>' +
        '<button class="sn-shot" type="button"><svg viewBox="0 0 24 24"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></button>' +
        '<i class="sn-fx"></i>' +
        '<div class="sn-pv"><img alt=""></div>' +
        '<div class="sn-pb">' +
          '<button class="sn-re" type="button"><i class="sn-ic"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></i><span>إلغاء</span></button>' +
          '<button class="sn-sd" type="button"><i class="sn-ic"><svg viewBox="0 0 24 24"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg></i><span>إرسال</span></button>' +
        '</div>' +
        '<b class="sn-ok"></b>';
      note.querySelector('video').srcObject = stream;
      note.querySelector('video').addEventListener('click', tapFocus);
      note.querySelector('.sn-cf').onclick = flip;
      note.querySelector('.sn-cx').onclick = function () { if (note.classList.contains('cap')) setCap(false); else stop(); };
      note.querySelector('.sn-shot').onclick = function () { if (note.classList.contains('cap')) takePhoto(); else setCap(true); };
      note.querySelector('.sn-re').onclick = function () { clearPrev(); };      /* إلغاء اللقطة والعودة للكاميرا */
      note.querySelector('.sn-sd').onclick = sendPhoto;                         /* إرسال للمدرس */
      document.body.appendChild(note); floatify(note);
    }
    /* [6] التقاط الصورة: نجمّد اللقطة ونعرضها للمعاينة (لا إرسال هنا) */
    function takePhoto() {
      var v = note && note.querySelector('video'); if (!v || !v.videoWidth) return;
      var c = document.createElement('canvas'), k = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight));
      c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k); c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      c.toBlob(function (b) {
        if (!b || !note) return;
        try { note.style.filter = 'brightness(2)'; setTimeout(function () { if (note) note.style.filter = ''; }, 120); } catch (e) { }
        clearPrev();
        pending = { blob: b, url: URL.createObjectURL(b) };
        note.querySelector('.sn-pv img').src = pending.url;
        note.classList.add('prev');
      }, 'image/jpeg', 0.92);
    }
    /* إرسال اللقطة المعاينة للمدرس كملف في نافذة الرسائل */
    function sendPhoto() {
      if (!note || !pending) return;
      var ok = note.querySelector('.sn-ok'), sd = note.querySelector('.sn-sd');
      var f = new File([pending.blob], 'صورة_' + Date.now().toString(36) + '.jpg', { type: 'image/jpeg' });
      sd.disabled = true;
      var p = (window.ChatBox && ChatBox.sendFile) ? ChatBox.sendFile(f, 2) : Promise.reject(new Error('حدّث chatbox.js في صفحة الطالب (v=26)'));
      Promise.resolve(p).then(function (r) {
        if (!r) throw new Error('انتظر لحظة وأعد المحاولة');
        if (!note) return;
        ok.textContent = '✓'; ok.style.background = ''; ok.style.display = 'block';
        setTimeout(function () { ok.style.display = 'none'; setCap(false); }, 1100);
      }).catch(function (er) {
        if (!note) return;
        sd.disabled = false;
        ok.textContent = 'تعذّر الإرسال: ' + (er && er.message || ''); ok.style.background = '#dc2626'; ok.style.display = 'block';
        setTimeout(function () { if (ok) { ok.style.display = 'none'; ok.style.background = ''; } }, 2500);
      });
    }
    /* [5] سحب + تغيير حجم + تكبير للنافذة: الحافة تتبع المؤشر مباشرة، ويُثبَّت المؤشر على المقبض فلا يصل لأي لوحة رسم */
    function floatify(n) {
      var MINW = 120, MINH = 80, saved = null;
      function toLT() { var r = n.getBoundingClientRect(); n.style.left = r.left + 'px'; n.style.top = r.top + 'px'; n.style.bottom = 'auto'; n.style.right = 'auto'; }
      var hd = n.querySelector('.sn-t'), dr = null;
      hd.addEventListener('pointerdown', function (e) { if (e.target.closest('button')) return; toLT(); var r = n.getBoundingClientRect(); dr = { x: e.clientX, y: e.clientY, l: r.left, t: r.top }; try { hd.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); e.stopPropagation(); });
      hd.addEventListener('pointermove', function (e) { if (!dr) return; var l = dr.l + e.clientX - dr.x, t = dr.t + e.clientY - dr.y; n.style.left = Math.max(0, Math.min(innerWidth - 60, l)) + 'px'; n.style.top = Math.max(0, Math.min(innerHeight - 40, t)) + 'px'; saved = null; });
      ['pointerup', 'pointercancel'].forEach(function (ev) { hd.addEventListener(ev, function () { dr = null; }); });
      n.querySelectorAll('[data-rz]').forEach(function (h) {
        var rs = null, dir = h.dataset.rz;
        h.addEventListener('pointerdown', function (e) { toLT(); var r = n.getBoundingClientRect(); rs = { x: e.clientX, y: e.clientY, l: r.left, w: r.width, h: r.height }; try { h.setPointerCapture(e.pointerId); } catch (x) { } e.preventDefault(); e.stopPropagation(); });
        h.addEventListener('pointermove', function (e) {
          if (!rs) return; var dx = e.clientX - rs.x, dy = e.clientY - rs.y, nh = rs.h, nw = rs.w, nl = rs.l;
          if (dir.indexOf('s') >= 0) nh = Math.max(MINH, rs.h + dy);
          if (dir.indexOf('e') >= 0) nw = Math.max(MINW, rs.w + dx);
          if (dir.indexOf('w') >= 0) { nw = Math.max(MINW, rs.w - dx); nl = rs.l + (rs.w - nw); }
          n.style.width = nw + 'px'; n.style.height = nh + 'px'; n.style.left = nl + 'px'; saved = null;
        });
        ['pointerup', 'pointercancel'].forEach(function (ev) { h.addEventListener(ev, function () { rs = null; }); });
      });
      var mx = n.querySelector('.sn-mx');
      mx.onclick = function () {
        if (saved) { n.style.left = saved.l; n.style.top = saved.t; n.style.width = saved.w; n.style.height = saved.h; saved = null; mx.textContent = '▢'; return; }
        toLT(); saved = { l: n.style.left, t: n.style.top, w: n.style.width, h: n.style.height };
        var W = Math.min(innerWidth - 16, 640), H = Math.min(innerHeight - 70, Math.round(W * 0.75));
        n.style.left = Math.round((innerWidth - W) / 2) + 'px'; n.style.top = '8px'; n.style.width = W + 'px'; n.style.height = H + 'px'; mx.textContent = '❐';
      };
    }
    function hideNote() {
      if (pending) { try { URL.revokeObjectURL(pending.url); } catch (e) { } pending = null; }
      if (note) { note.remove(); note = null; }
      var o = document.getElementById('stuCamNote'); if (o) o.remove();
    }
    /* تبديل الكاميرا الأمامية/الخلفية دون قطع البث: نستبدل مسار الفيديو في الاتصال */
    async function flip() {
      var want = facing === 'user' ? 'environment' : 'user';
      var big = note && note.classList.contains('cap');
      try {
        var ns = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: want }, width: big ? 1280 : 640, height: big ? 720 : 480 } });
        var nt = ns.getVideoTracks()[0];
        stream.getVideoTracks().forEach(function (t) { stream.removeTrack(t); t.stop(); });
        stream.addTrack(nt); facing = want;
        video.srcObject = stream;
        if (pc) pc.getSenders().forEach(function (sn) { if (sn.track && sn.track.kind === 'video') { try { sn.replaceTrack(nt); } catch (e) { } } });
        if (note) { note.classList.toggle('back', facing === 'environment'); note.querySelector('video').srcObject = stream; }
        if (big) tryConstraints({ advanced: [{ focusMode: 'continuous' }] });
      } catch (e) { alert('تعذّر تبديل الكاميرا: ' + (e && e.message || e)); }
    }

    async function start() {
      var id = sid(); if (!id) { alert('لم يكتمل دخولك بعد — انتظر قليلًا ثم أعد المحاولة'); return; }
      /* [2] الفيديو أولًا (فوري) ثم نحاول إضافة الصوت بمهلة 8 ثوانٍ حتى لا يعلق الزر عند نافذة إذن المايك */
      try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: 640, height: 480, frameRate: { max: 24 } } }); }
      catch (e2) { stream = null; alert('خطأ الكاميرا: ' + (e2 && e2.message || e2)); return; }
      try {
        var au = await Promise.race([navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }), new Promise(function (_, rj) { setTimeout(function () { rj(new Error('timeout')); }, 8000); })]);
        au.getAudioTracks().forEach(function (t) { stream.addTrack(t); });
      } catch (e3) { console.warn('[cam] بدون صوت:', e3 && e3.message); }
      video.srcObject = stream; try { await video.play(); } catch (e) { }
      btn.classList.add('on'); live = false; warned = false; showNote();

      /* لقطات احتياطية كل ثانيتين إلى أن يتصل البث الحي */
      shotT = setInterval(function () {
        if (live || !video.videoWidth) return;
        cv.width = 320; cv.height = 240; cv.getContext('2d').drawImage(video, 0, 0, 320, 240);
        RTC.child('camShot/' + id).set({ d: cv.toDataURL('image/jpeg', 0.5), ts: Date.now() }).catch(err);
      }, 2000);

      /* البث الحي */
      try {
        await RTC.child('s2t_cam_ice/' + id).remove();
        pc = new RTCPeerConnection({ iceServers: (window.CUSTOM_ICE && window.CUSTOM_ICE.length) ? window.CUSTOM_ICE : [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun.cloudflare.com:3478' }, { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' }, { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }, { urls: 'turns:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }] });
        stream.getTracks().forEach(function (t) { pc.addTrack(t, stream); });
        pc.onicecandidate = function (e) { if (e.candidate) RTC.child('s2t_cam_ice/' + id).push(e.candidate.toJSON()).catch(err); };
        pc.onconnectionstatechange = function () { live = pc && pc.connectionState === 'connected'; if (live) RTC.child('camShot/' + id).remove().catch(function () { }); };
        var offer = await pc.createOffer(); await pc.setLocalDescription(offer);
        var mark = offer.sdp.length;
        await RTC.child('s2t_cam_offer/' + id).set({ type: offer.type, sdp: offer.sdp, m: mark });
        await RTC.child('camOn/' + id).set({ on: true, ts: Date.now() });
        var aR = RTC.child('t2s_cam_answer/' + id), iR = RTC.child('t2s_cam_ice/' + id), got = false, myPc = pc;
        var acb = async function (sn) {
          var a = sn.val(); if (!a || !a.sdp || a.m !== mark || got || myPc !== pc) return;
          got = true;
          try { await myPc.setRemoteDescription(new RTCSessionDescription({ type: a.type, sdp: a.sdp })); } catch (e) { got = false; return; }
          var icb = function (s) { var c = s.val(); if (c) myPc.addIceCandidate(new RTCIceCandidate(c)).catch(function () { }); };
          iR.on('child_added', icb); offs.push(function () { iR.off('child_added', icb); });
        };
        aR.on('value', acb); offs.push(function () { aR.off('value', acb); });
      } catch (e) { err(e); }
    }

    function stop() {
      clearInterval(shotT); shotT = 0; live = false;
      offs.forEach(function (f) { try { f(); } catch (e) { } }); offs = [];
      try { pc && pc.close(); } catch (e) { } pc = null;
      if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
      hideNote(); var id = sid(); btn.classList.remove('on');
      if (id) { RTC.child('camOn/' + id).set({ on: false, ts: Date.now() }).catch(function () { }); RTC.child('s2t_cam_offer/' + id).remove().catch(function () { }); RTC.child('camShot/' + id).remove().catch(function () { }); }
    }

    btn.addEventListener('click', function () { (stream ? Promise.resolve(stop()) : start()).catch(function (e) { err(e); try { stop(); } catch (x) { } }); });
    window.addEventListener('beforeunload', function () { try { stop(); } catch (e) { } });
  })();
}