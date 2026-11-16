
/* [3] أنماط: أزرار الكاميرا/السماعة/المايك باهتة عند عدم التفعيل + نافذة إشعار الخصوصية (≈5×3 سم) */
(function () {
  var st = document.createElement('style'); st.id = 'stuCamCss';
  st.textContent =
    '#camBtn:not(.on),#micBtn:not(.on):not(.live):not(.hint),#spkBtn.off,#msgBtn:not(.on):not(:has(.cb-badge.on)){opacity:.42;filter:grayscale(.65)}' +
    '#camBtn:not(.on):hover,#micBtn:hover,#spkBtn.off:hover,#msgBtn:hover{opacity:.85}' +
    '#camBtn.on{color:#4ade80}#camBtn.on svg{stroke:#4ade80}' +
    '#stuCamNote{position:fixed;left:10px;bottom:64px;width:190px;height:113px;min-width:120px;min-height:80px;z-index:99990;border-radius:10px;overflow:hidden;background:#000;border:2px solid #ef4444;box-shadow:0 6px 20px rgba(0,0,0,.6);direction:rtl;font-family:Cairo,system-ui,sans-serif}' +
    '#stuCamNote video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}' +
    '#stuCamNote.back video{transform:none}' +
    '#stuCamNote .sn-t{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:5px;padding:3px 7px;background:linear-gradient(180deg,rgba(0,0,0,.75),transparent);color:#fff;font-size:10px;font-weight:700}' +
    '#stuCamNote .sn-t{cursor:move;touch-action:none;z-index:3}#stuCamNote .sn-t span{flex:1}' +
    '#stuCamNote .sn-mx{background:rgba(15,23,42,.8);color:#fff;border:0;border-radius:4px;width:20px;height:16px;font-size:11px;line-height:1;cursor:pointer;padding:0}' +
    '#stuCamNote .sn-rz{position:absolute;bottom:0;width:20px;height:20px;z-index:5;touch-action:none}' +
    '#stuCamNote .sn-rz-se{right:0;cursor:se-resize;background:linear-gradient(135deg,transparent 55%,#fff 55%,#fff 65%,transparent 65%,transparent 75%,#fff 75%,#fff 85%,transparent 85%)}' +
    '#stuCamNote .sn-rz-sw{left:0;cursor:sw-resize;background:linear-gradient(225deg,transparent 55%,#fff 55%,#fff 65%,transparent 65%,transparent 75%,#fff 75%,#fff 85%,transparent 85%)}' +
    '#stuCamNote .sn-rz-e,#stuCamNote .sn-rz-w{top:26px;bottom:22px;width:12px;height:auto;background:none}#stuCamNote .sn-rz-e{right:0;cursor:ew-resize}#stuCamNote .sn-rz-w{left:0;cursor:ew-resize}#stuCamNote .sn-rz-s{left:22px;right:22px;bottom:0;width:auto;height:10px;background:none;cursor:ns-resize}#stuCamNote .sn-rz:hover{background:rgba(255,255,255,.18)}' +
    '#stuCamNote.cap .sn-rz{display:none}' +
    '#stuCamNote .sn-b{z-index:4;bottom:14px}#stuCamNote .sn-b button{flex:1 1 0;min-width:0;height:30px;font-size:12px;padding:0 2px;white-space:nowrap}' +
    '#stuCamNote .sn-cap{display:none}' +
    '#stuCamNote.cap{left:0 !important;top:0 !important;right:0 !important;bottom:0 !important;width:100vw !important;height:100vh !important;border-radius:0;border-width:0;z-index:2147483000}' +
    '#stuCamNote.cap video{object-fit:contain;background:#000}#stuCamNote.cap .sn-b,#stuCamNote.cap .sn-rz,#stuCamNote.cap .sn-mx{display:none}' +
    '#stuCamNote.cap .sn-cap{display:flex;position:absolute;left:0;right:0;bottom:0;height:170px;align-items:center;justify-content:center;gap:34px;background:linear-gradient(0deg,rgba(0,0,0,.65),transparent);z-index:9}' +
    '#stuCamNote .sn-shot{width:120px;height:120px;border-radius:50%;border:5px solid #fff;background:#ef4444;cursor:pointer;padding:0;box-shadow:0 0 0 3px rgba(0,0,0,.4)}#stuCamNote .sn-shot:active{transform:scale(.93)}' +
    '#stuCamNote .sn-cf{border:0;border-radius:50%;width:76px;height:76px;background:rgba(15,23,42,.85);color:#fff;font-size:30px;cursor:pointer}#stuCamNote .sn-cx{border:0;border-radius:38px;height:76px;min-width:76px;padding:0 24px;background:rgba(15,23,42,.85);color:#fff;font:700 17px Cairo,system-ui,sans-serif;cursor:pointer}' +
    '#stuCamNote .sn-ok{position:absolute;top:-70px;color:#fff;background:#16a34a;border-radius:18px;padding:6px 16px;font:700 14px Cairo,system-ui,sans-serif;display:none}' +
    '#stuCamNote .sn-d{width:8px;height:8px;border-radius:50%;background:#ef4444;animation:snp 1.2s infinite}@keyframes snp{50%{opacity:.25}}' +
    '#stuCamNote .sn-b{position:absolute;bottom:4px;left:4px;right:4px;display:flex;gap:4px}' +
    '#stuCamNote .sn-b button{flex:1;border:0;border-radius:6px;padding:3px 0;font:700 10px Cairo,system-ui,sans-serif;cursor:pointer;color:#fff;background:rgba(15,23,42,.78)}' +
    '#stuCamNote .sn-b button.sn-x{background:rgba(220,38,38,.85)}';
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
    var stream = null, pc = null, shotT = 0, offs = [], warned = false, live = false, facing = 'user', note = null;
    var video = document.createElement('video'); video.muted = true; video.playsInline = true; video.autoplay = true;
    var cv = document.createElement('canvas');
    var spk = document.getElementById('spkBtn'); if (spk && spk.parentNode && btn.previousElementSibling !== spk) spk.parentNode.insertBefore(btn, spk.nextSibling);   /* زر الكاميرا بجوار السماعة */
    function sid() { return window.__stuMe ? window.__stuMe().id : ''; }
    function err(e) { console.error('[cam]', e); if (!warned) { warned = true; alert('تعذّر إرسال الكاميرا للمعلم: ' + (e && e.code || e && e.message || e)); } }


    /* [4] نافذة الخصوصية: تُظهر للطالب أن كاميرته تعمل وما يراه المعلم، مع تبديل الأمامية/الخلفية وإيقاف فوري */
    function showNote() {
      hideNote();
      note = document.createElement('div'); note.id = 'stuCamNote';
      note.innerHTML = '<video autoplay playsinline muted></video><div class="sn-t"><i class="sn-d"></i><span></span><button class="sn-mx" type="button" title="تكبير / استعادة">▢</button></div><i class="sn-rz sn-rz-se" data-rz="se"></i><i class="sn-rz sn-rz-sw" data-rz="sw"></i><i class="sn-rz sn-rz-e" data-rz="e"></i><i class="sn-rz sn-rz-w" data-rz="w"></i><i class="sn-rz sn-rz-s" data-rz="s"></i><div class="sn-b"><button class="sn-p" type="button" title="التقاط صورة وإرسالها للمدرس">📸 صورة</button><button class="sn-f" type="button" title="تبديل الكاميرا الأمامية/الخلفية">🔄 تدوير</button><button class="sn-x" type="button">إيقاف</button></div><div class="sn-cap"><button class="sn-shot" type="button" title="التقط وأرسل"></button><button class="sn-cf" type="button" title="تبديل الكاميرا">🔄</button><button class="sn-cx" type="button">إلغاء</button><b class="sn-ok"></b></div>';
      note.querySelector('video').srcObject = stream;
      note.querySelector('.sn-x').onclick = function () { stop(); };
      note.querySelector('.sn-f').onclick = flip;
      note.querySelector('.sn-p').onclick = function () { note.classList.add('cap'); };
      note.querySelector('.sn-cx').onclick = function () { note.classList.remove('cap'); };
      note.querySelector('.sn-shot').onclick = takePhoto;
      note.querySelector('.sn-cf').onclick = flip;
      document.body.appendChild(note); floatify(note);
    }
    /* [6] التقاط صورة: المعاينة تملأ الشاشة (وضع cap) ثم نرسل الإطار الحالي للمدرس كملف في نافذة الرسائل */
    function takePhoto() {
      var v = note && note.querySelector('video'); if (!v || !v.videoWidth) return;
      var c = document.createElement('canvas'), k = Math.min(1, 1280 / Math.max(v.videoWidth, v.videoHeight));
      c.width = Math.round(v.videoWidth * k); c.height = Math.round(v.videoHeight * k); c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
      var ok = note.querySelector('.sn-ok');
      c.toBlob(function (b) {
        if (!b) return;
        var f = new File([b], 'صورة_' + Date.now().toString(36) + '.jpg', { type: 'image/jpeg' });
        try { note.style.filter = 'brightness(2)'; setTimeout(function () { if (note) note.style.filter = ''; }, 120); } catch (e) { }
        var p = (window.ChatBox && ChatBox.sendFile) ? ChatBox.sendFile(f, 2) : Promise.reject(new Error('حدّث chatbox.js في صفحة الطالب (v=26)'));
        Promise.resolve(p).then(function (r) { if (!r) throw new Error('انتظر لحظة وأعد المحاولة'); ok.textContent = 'تم إرسال الصورة للمدرس ✓'; }, function (er) { ok.textContent = 'تعذّر الإرسال: ' + (er && er.message || ''); ok.style.background = '#dc2626'; })
          .then(function () { ok.style.display = 'block'; setTimeout(function () { ok.style.display = 'none'; ok.style.background = ''; if (note) note.classList.remove('cap'); }, 1300); });
      }, 'image/jpeg', 0.9);
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
    function hideNote() { if (note) { note.remove(); note = null; } var o = document.getElementById('stuCamNote'); if (o) o.remove(); }
    /* تبديل الكاميرا الأمامية/الخلفية دون قطع البث: نستبدل مسار الفيديو في الاتصال */
    async function flip() {
      var want = facing === 'user' ? 'environment' : 'user';
      try {
        var ns = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: want }, width: 640, height: 480 } });
        var nt = ns.getVideoTracks()[0];
        stream.getVideoTracks().forEach(function (t) { stream.removeTrack(t); t.stop(); });
        stream.addTrack(nt); facing = want;
        video.srcObject = stream;
        if (pc) pc.getSenders().forEach(function (sn) { if (sn.track && sn.track.kind === 'video') { try { sn.replaceTrack(nt); } catch (e) { } } });
        if (note) { note.classList.toggle('back', facing === 'environment'); note.querySelector('video').srcObject = stream; }
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
