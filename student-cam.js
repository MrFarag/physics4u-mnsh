
/* [3] أنماط: أزرار الكاميرا/السماعة/المايك باهتة عند عدم التفعيل + نافذة إشعار الخصوصية (≈5×3 سم) */
(function () {
  var st = document.createElement('style'); st.id = 'stuCamCss';
  st.textContent =
    '#camBtn:not(.on),#micBtn:not(.on):not(.live),#spkBtn.off{opacity:.42;filter:grayscale(.65)}' +
    '#camBtn.on{color:#4ade80}#camBtn.on svg{stroke:#4ade80}' +
    '#stuCamNote{position:fixed;left:10px;bottom:64px;width:190px;height:113px;z-index:99990;border-radius:10px;overflow:hidden;background:#000;border:2px solid #ef4444;box-shadow:0 6px 20px rgba(0,0,0,.6);direction:rtl;font-family:Cairo,system-ui,sans-serif}' +
    '#stuCamNote video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}' +
    '#stuCamNote.back video{transform:none}' +
    '#stuCamNote .sn-t{position:absolute;top:0;left:0;right:0;display:flex;align-items:center;gap:5px;padding:3px 7px;background:linear-gradient(180deg,rgba(0,0,0,.75),transparent);color:#fff;font-size:10px;font-weight:700}' +
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
    function sid() { return window.__stuMe ? window.__stuMe().id : ''; }
    function err(e) { console.error('[cam]', e); if (!warned) { warned = true; alert('تعذّر إرسال الكاميرا للمعلم: ' + (e && e.code || e && e.message || e)); } }


    /* [4] نافذة الخصوصية: تُظهر للطالب أن كاميرته تعمل وما يراه المعلم، مع تبديل الأمامية/الخلفية وإيقاف فوري */
    function showNote() {
      hideNote();
      note = document.createElement('div'); note.id = 'stuCamNote';
      note.innerHTML = '<video autoplay playsinline muted></video><div class="sn-t"><i class="sn-d"></i>كاميرتك مفعّلة — المعلم يراك' + (stream && stream.getAudioTracks().length ? ' 🎤' : '') + '</div><div class="sn-b"><button class="sn-f" type="button">🔄 خلفية/أمامية</button><button class="sn-x" type="button">إيقاف</button></div>';
      note.querySelector('video').srcObject = stream;
      note.querySelector('.sn-x').onclick = function () { stop(); };
      note.querySelector('.sn-f').onclick = flip;
      document.body.appendChild(note);
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
