/* ============================================================
   [CAM] — كاميرا الطالب (النسخة المصححة)
   ============================================================ */
window.addEventListener('load', function() {
  // ننتظر 3 ثواني لضمان تحميل Firebase وتسجيل دخول الطالب
  setTimeout(function() {
    if (!window.firebase || !firebase.apps.length) return;
    var db = firebase.database();
    var RTC = db.ref('rooms/live/rtc'); // المسار الصحيح الذي يقرأ منه المعلم

    var $btn   = document.getElementById('camBtn');
    var $ovl   = document.getElementById('camOverlay');
    var $vid   = document.getElementById('camPreview');
    var $st    = document.getElementById('camState');
    var $tog   = document.getElementById('camToggle');
    var $close = document.getElementById('camClose');
    
    if (!$btn || !$ovl) return;

    var stream = null;
    var pc = null;
    var sid = '';

    function getSid() {
      if (sid) return sid;
      try { if (window.__stuMe) sid = (window.__stuMe().id || '').trim(); } catch (_) {}
      return sid;
    }

    var ICE = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' }
      ]
    };

    async function startCam() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 480, height: 360, facingMode: 'user' },
          audio: false
        });
      } catch (e) {
        $btn.classList.add('denied');
        if ($st) $st.textContent = 'تعذّر الوصول للكاميرا: ' + (e.name || 'خطأ');
        return;
      }
      
      if ($vid) $vid.srcObject = stream;
      $btn.classList.add('on');
      if ($st) $st.textContent = 'الكاميرا تعمل';
      if ($tog) $tog.textContent = 'إيقاف';
      
      var mySid = getSid();
      if (!mySid) {
        alert('خطأ: لم يتم العثور على معرّف الطالب!');
        return;
      }

      // إرسال إشارة التشغيل للمعلم
      RTC.child('camOn/' + mySid).set({ on: true, at: Date.now() });

      pc = new RTCPeerConnection(ICE);
      stream.getTracks().forEach(function(t) { pc.addTrack(t, stream); });

      pc.onicecandidate = function(e) {
        if (e.candidate) RTC.child('s2t_stu_ice/' + mySid).push(e.candidate.toJSON());
      };

      // استقبال الـ answer من المعلم
      RTC.child('t2s_stu_answer/' + mySid).on('value', async function(snap) {
        var ans = snap.val();
        if (ans && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(ans));
        }
      });

      // استقبال ICE من المعلم
      RTC.child('t2s_stu_ice/' + mySid).on('child_added', function(s) {
        var c = s.val();
        if (c) pc.addIceCandidate(new RTCIceCandidate(c)).catch(function(){});
      });

      // إرسال الـ offer للمعلم
      var offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      RTC.child('s2t_stu_offer/' + mySid).set(offer.toJSON());
    }

    function stopCam() {
      if (stream) { stream.getTracks().forEach(function(t) { t.stop(); }); stream = null; }
      if ($vid) $vid.srcObject = null;
      $btn.classList.remove('on');
      if ($st) $st.textContent = 'الكاميرا مغلقة';
      if ($tog) $tog.textContent = 'تشغيل';
      
      if (pc) { try { pc.close(); } catch (_) {} pc = null; }
      
      var mySid = getSid();
      if (mySid) {
        RTC.child('camOn/' + mySid).remove();
        RTC.child('s2t_stu_offer/' + mySid).remove();
        RTC.child('t2s_stu_answer/' + mySid).remove();
        RTC.child('s2t_stu_ice/' + mySid).remove();
        RTC.child('t2s_stu_ice/' + mySid).remove();
      }
    }

    $btn.addEventListener('click', function() {
      if ($ovl) $ovl.style.display = 'flex';
      if (!stream) startCam();
    });

    if ($tog) $tog.addEventListener('click', function() { stream ? stopCam() : startCam(); });
    if ($close) $close.addEventListener('click', function() { if ($ovl) $ovl.style.display = 'none'; });

    window.addEventListener('beforeunload', function() { try { stopCam(); } catch (_) {} });
  }, 3000);
});