/* ============================================================
   [CAM] — كاميرا الطالب: تشغيل/إيقاف + إرسال offer للمعلم
   ============================================================ */
(function () {
  'use strict';
  if (!window.firebase) return;

  // معرّف الطالب — من student.js
  let SID = '';
  const getSid = () => {
    if (SID) return SID;
    try { if (window.__stuMe) SID = (window.__stuMe().id || '').trim(); } catch (_) {}
    return SID;
  };

  const $btn   = document.getElementById('camBtn');
  const $ovl   = document.getElementById('camOverlay');
  const $vid   = document.getElementById('camPreview');
  const $st    = document.getElementById('camState');
  const $tog   = document.getElementById('camToggle');
  const $close = document.getElementById('camClose');
  if (!$btn || !$ovl) return;

  let stream = null, pc = null, ref = null;

  const ICE = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun.cloudflare.com:3478' }
    ]
  };

  const getDb = () => {
    try { return firebase.database(); } catch (_) { return null; }
  };

  /* ---------- تشغيل الكاميرا ---------- */
  async function startCam() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 480, height: 360, facingMode: 'user' },
        audio: false
      });
    } catch (e) {
      $btn.classList.add('denied');
      $st.textContent = 'تعذّر الوصول للكاميرا: ' + (e.name || 'خطأ');
      return false;
    }
    $vid.srcObject = stream;
    $btn.classList.add('on');
    $st.textContent = 'الكاميرا تعمل';
    $tog.textContent = 'إيقاف';
    await connectPeer();
    notifyTeacher(true);
    return true;
  }

  /* ---------- إيقاف الكاميرا ---------- */
  function stopCam() {
    if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
    $vid.srcObject = null;
    $btn.classList.remove('on');
    $st.textContent = 'الكاميرا مغلقة';
    $tog.textContent = 'تشغيل';
    if (pc) { try { pc.close(); } catch (_) {} pc = null; }
    if (ref) { ref.remove().catch(() => {}); ref = null; }
    notifyTeacher(false);
  }

  /* ---------- RTCPeerConnection + offer ---------- */
  async function connectPeer() {
    const sid = getSid();
    if (!sid) { console.warn('[cam] لا يوجد sid'); return; }
    const db = getDb();
    if (!db) return;

    ref = db.ref(`live/signals/${sid}`);
    await ref.remove().catch(() => {});

    pc = new RTCPeerConnection(ICE);
    stream.getTracks().forEach(t => pc.addTrack(t, stream));

    pc.onicecandidate = ev => {
      if (ev.candidate) ref.child('offerCandidates').push(ev.candidate.toJSON()).catch(() => {});
    };
    pc.onconnectionstatechange = () => {
      console.log('[cam] peer:', pc.connectionState);
      if (pc.connectionState === 'failed') $st.textContent = 'انقطع الاتصال';
    };

    ref.child('answer').on('value', async snap => {
      const ans = snap.val();
      if (!ans) return;
      if (pc.signalingState !== 'have-local-offer') return;
      try { await pc.setRemoteDescription(new RTCSessionDescription(ans)); } catch (e) { console.warn(e); }
    });

    ref.child('answerCandidates').on('child_added', snap => {
      const c = snap.val();
      if (c) try { pc.addIceCandidate(new RTCIceCandidate(c)); } catch (_) {}
    });

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await ref.child('offer').set(offer.toJSON());
  }

  /* ---------- إشعار المعلم ---------- */
  function notifyTeacher(on) {
    const sid = getSid();
    const db = getDb();
    if (!db || !sid) return;
    db.ref(`live/students/${sid}/cam`).update({ on: !!on, at: Date.now() }).catch(() => {});
  }

  /* ---------- الأزرار ---------- */
  $btn.addEventListener('click', () => {
    $ovl.style.display = 'flex';
    if (!stream) startCam();
  });

  $tog.addEventListener('click', () => { stream ? stopCam() : startCam(); });
  $close.addEventListener('click', () => { $ovl.style.display = 'none'; });

  window.addEventListener('beforeunload', () => { try { stopCam(); } catch (_) {} });

  window.StudentCam = { start: startCam, stop: stopCam, isOn: () => !!stream };
})();