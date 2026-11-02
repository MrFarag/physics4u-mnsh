(function () {
    'use strict';
    const H = window.HOME, $ = id => document.getElementById(id);
    const q = new URLSearchParams(location.search), ROOM = (q.get('room') || '').replace(/[.#$\[\]\/]/g, '_');
    const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const waLink = t => 'https://wa.me/' + H.whatsapp + '?text=' + encodeURIComponent(t);
    $('tName').textContent = H.teacher;
    if (ROOM) { $('roomTag').textContent = 'تجريبي: ' + ROOM; $('joinBtn').href = 'index.html?room=' + encodeURIComponent(ROOM); }

    $('sched').innerHTML = '<b>مواعيد الحصص</b>' + H.schedule.map(s => '<div><span>' + esc(s.day) + ' ' + esc(s.time) + '</span><span>' + esc(s.title) + '</span></div>').join('');

    H.courses.forEach(c => {
        const d = document.createElement('div'); d.className = 'card';
        d.innerHTML = '<div class="thumb" style="background:linear-gradient(135deg,' + c.color + ',#0a101d)">' + c.icon + '</div><div class="cbody"><h3>' + esc(c.title) + '</h3><div class="meta">' + esc(c.level) + ' · ' + c.lessons + ' حصة · ' + c.hours + ' ساعة</div><div class="row"><span class="price">' + (c.price ? c.price + ' ج.م' : 'مجاني') + '</span><button class="btn blue small">اشترك</button></div></div>';
        d.querySelector('button').onclick = () => window.open(waLink('أريد الاشتراك في دورة: ' + c.title), '_blank');
        $('courseGrid').appendChild(d);
    });

    function openVideo(v) {
        $('mbody').innerHTML = '<h3 style="margin-bottom:10px">' + esc(v.title) + '</h3>' + (v.video
            ? '<iframe src="https://www.youtube.com/embed/' + encodeURIComponent(v.video) + '?rel=0" allowfullscreen></iframe>'
            : '<div class="soon"><big>🎬</big>هذا الفيديو عيّنة تجريبية — سيُضاف المحتوى الحقيقي قريبًا</div>');
        $('modal').classList.add('on');
    }
    function media(list, grid, tint) {
        list.forEach((v, i) => {
            const d = document.createElement('div'); d.className = 'card'; d.style.cursor = 'pointer';
            d.innerHTML = '<div class="thumb" style="background:linear-gradient(135deg,hsl(' + ((i * 47 + tint) % 360) + ',55%,32%),#0a101d)"><div class="play">▶</div><span class="dur">' + v.mins + ' د</span></div><div class="cbody"><h3>' + esc(v.title) + '</h3>' + (v.level ? '<div class="meta">' + esc(v.level) + '</div>' : '') + '</div>';
            d.onclick = () => openVideo(v);
            $(grid).appendChild(d);
        });
    }
    media(H.freeLessons, 'freeGrid', 200); media(H.videos, 'vidGrid', 30);
    $('mx').onclick = () => { $('modal').classList.remove('on'); $('mbody').innerHTML = ''; };
    $('modal').onclick = e => { if (e.target === $('modal')) $('mx').onclick(); };

    /* حالة البث: المدرس يكتب ping_t كل 6 ثوانٍ — إن تغيّرت القيمة خلال 15 ثانية فهو متصل الآن */
    let liveTimer = null, first = true;
    function setLive(on) {
        $('liveDot').classList.toggle('on', on);
        $('liveTxt').textContent = on ? 'المدرس في بث مباشر الآن' : 'لا يوجد بث حاليًا';
        $('liveSub').textContent = on ? 'اضغط للدخول — سيقبلك المدرس بعد التسجيل.' : 'راجع مواعيد الحصص أدناه، وتابع الدروس المجانية.';
    }
    setLive(false);
    try {
        firebase.initializeApp({ apiKey: 'AIzaSyB7E4NsGQbCehVSQ3Kj97yExRZwpHzTOl8', databaseURL: 'https://myclaive-default-rtdb.firebaseio.com' });
        firebase.database().ref((ROOM ? 'rooms/' + ROOM + '/' : '') + 'ping_t').on('value', () => {
            if (first) { first = false; return; }   /* القيمة الأولى قديمة محفوظة، لا تعني بثًا */
            setLive(true); clearTimeout(liveTimer); liveTimer = setTimeout(() => setLive(false), 15000);
        });
    } catch (e) { /* بدون اتصال: يبقى "لا يوجد بث" */ }
})();
