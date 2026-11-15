/* student-cam.js — لقطات كاميرا الطالب إلى المعلم (JPEG كل ثانية) في rooms/live/rtc/camShot/<id>
   [1] يكتب فقط بعد نجاح تشغيل الكاميرا  [2] يُظهر سبب فشل الكتابة (قواعد Firebase) بدل الصمت  [3] يتوقف عند إغلاق الكاميرا */
window.addEventListener('load', function () {
  setTimeout(function () {
    if (!window.firebase || !firebase.apps.length) return;
    var db = firebase.database();
    var RTC = db.ref('rooms/live/rtc');
    var $btn = document.getElementById('camBtn');
    if (!$btn) return;
    var video = document.createElement('video'); video.autoplay = true; video.playsInline = true; video.muted = true;
    var canvas = document.createElement('canvas'), timer = 0, stream = null, warned = false;
    function stop() { clearInterval(timer); timer = 0; if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } }
    $btn.addEventListener('click', async function () {
      if (timer) { stop(); return; }                       /* ضغطة ثانية = إيقاف */
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream; await video.play().catch(function () { });
        var mySid = window.__stuMe ? window.__stuMe().id : 'student1';
        timer = setInterval(function () {
          if (!video.videoWidth) return;
          canvas.width = 320; canvas.height = 240;
          canvas.getContext('2d').drawImage(video, 0, 0, 320, 240);
          RTC.child('camShot/' + mySid).set({ d: canvas.toDataURL('image/jpeg', 0.5), ts: Date.now() }).catch(function (e) {
            console.error('[camShot] فشل الإرسال:', e && e.code || e);
            if (!warned) { warned = true; alert('تعذّر إرسال الكاميرا للمعلم: ' + (e && e.code || e)); }
          });
        }, 1000);
      } catch (err) { alert('خطأ: ' + err.message); }
    });
  }, 3000);
});
