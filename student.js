/* ════════════════════════════════════════════════════════════════════ *
 *  student.js — الطالب (مشاهدة فقط)                                    *
 *  يستقبل: session {order, current} + slideImgs/{id} من المدرس.          *
 *  يُرسل: joinRequests / onlineStudents / handRaised.                     *
 *  لا يرسم ولا يعدّل على الشرائح. (الصوت والملفات: مراحل لاحقة)           *
 * ════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    const SECRET = '135';   /* تنبيه: يُفحص هنا فقط — الحماية الحقيقية في قواعد Firebase */

    /* ── Firebase + الغرفة التجريبية (?room=test) ── */
    firebase.initializeApp({
        apiKey: 'AIzaSyB7E4NsGQbCehVSQ3Kj97yExRZwpHzTOl8',
        databaseURL: 'https://myclaive-default-rtdb.firebaseio.com'
    });
    const db = firebase.database();
    const ROOM = (new URLSearchParams(location.search).get('room') || '').replace(/[.#$\[\]\/]/g, '_');
    const BASE = ROOM ? 'rooms/' + ROOM + '/' : '';
    const ref = p => db.ref(BASE + p);
    const $ = id => document.getElementById(id);
    const toArr = o => Array.isArray(o) ? o.filter(Boolean) : Object.values(o || {});

    if (ROOM) $('brandName').textContent = 'تجريبي: ' + ROOM;

    /* ── حالة الطالب ── */
    const myId = 's' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
    let myName = '', myPhone = '';
    let approved = false, entered = false;
    let order = [];            /* ترتيب الشرائح من المدرس */
    const pagesData = {};      /* id → { bg, g, s:strokes, i:images, w, h, ts } */
    const imgSrc = {};         /* مفتاح الصورة → dataURL */
    let teacherCur = null;     /* شريحة المدرس الحالية */
    let active = null;         /* الشريحة المعروضة عندي */
    let fitMode = 'one', scale = 1;   /* one = 100% مثل المدرس (الافتراضي) | width | page | free */
    let segs = [];             /* رسم القلم المباشر الذي لم تصل صفحته بعد */
    let shapePrev = null;      /* معاينة الشكل أثناء سحبه */
    let shownSlide = null;
    let handUp = false;

    function toast(msg, cls) {
        const t = document.createElement('div');
        t.className = 'toast ' + (cls || '');
        t.textContent = msg;
        $('toastBox').appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 500); }, 3500);
    }
    const store = {
        get: k => { try { return localStorage.getItem(k) || ''; } catch (_) { return ''; } },
        set: (k, v) => { try { localStorage.setItem(k, v); } catch (_) { } }
    };

    /* ════════ الدخول ════════ */
    $('studentName').value = store.get('mc_name');
    $('studentPhone').value = store.get('mc_phone');

    function submitEntry() {
        const name = $('studentName').value.trim();
        const phone = $('studentPhone').value.trim();
        const sec = $('studentSecret').value.trim();
        if (!name) { $('studentName').focus(); toast('الرجاء إدخال الاسم', 'a'); return; }
        if (sec !== SECRET) { $('secretErr').style.display = 'block'; return; }
        $('secretErr').style.display = 'none';
        myName = name; myPhone = phone;
        store.set('mc_name', name); store.set('mc_phone', phone);

        $('formPart').style.display = 'none';
        $('waitPart').style.display = 'block';

        ref('joinRequests/' + myId).set({ id: myId, name: myName, phone: myPhone, ts: Date.now() });
        ref('joinRequests/' + myId).onDisconnect().remove();

        ref('approvedStudents/' + myId).on('value', snap => {
            if (snap.exists() && !approved) { approved = true; enter(); }
            else if (!snap.exists() && approved) {                /* أُخرجتُ من الحصة */
                approved = false;
                alert('تم إخراجك من الحصة من قِبل المدرس.');
                location.reload();
            }
        });
    }
    function quickEntry() {
        const ua = navigator.userAgent;
        const dev = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows PC' : /Macintosh/.test(ua) ? 'Mac' : 'طالب';
        if (!$('studentName').value.trim()) $('studentName').value = dev;
        if (!$('studentPhone').value.trim()) $('studentPhone').value = '000';
        $('studentSecret').value = SECRET;
        submitEntry();
    }
    $('entryBtn').addEventListener('click', submitEntry);
    $('quickBtn').addEventListener('click', quickEntry);
    $('studentSecret').addEventListener('keydown', e => { if (e.key === 'Enter') submitEntry(); });

    function enter() {
        if (entered) return; entered = true;
        $('entryScreen').classList.add('hidden');
        toast('✅ مرحبًا ' + myName);
        ref('joinRequests/' + myId).remove();

        /* الحضور: يُعاد تسجيله عند كل إعادة اتصال */
        db.ref('.info/connected').on('value', s => {
            if (!s.val()) return;
            const p = ref('onlineStudents/' + myId);
            p.onDisconnect().remove();
            p.set({ name: myName, online: true });
            ref('handRaised/' + myId).onDisconnect().remove();
        });
        ref('onlineStudents').on('value', s => { $('cnt').textContent = Object.keys(s.val() || {}).length; });
        /* المدرس قد ينزل يدي */
        ref('handRaised/' + myId).on('value', s => { handUp = !!s.val(); $('handBtn').classList.toggle('on', handUp); });

        connectAudio(); watchMicPermission(); listenShare();
        listen();
        let sec = 0;
        setInterval(() => {
            sec++;
            $('sessionTimer').textContent = String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');
        }, 1000);
    }


    /* ════════ الصوت (WebRTC) ════════ */
    const ICE = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478' },
        { urls: 'turn:openrelay.metered.ca:80', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turns:openrelay.metered.ca:443', username: 'openrelayproject', credential: 'openrelayproject' }
    ];
    let tPc = null, sPc = null, sStream = null, micOn = false, micAllowed = false;

    /* استقبال صوت المدرس */
    function connectAudio() {
        ref('rtc/t2s_offer/' + myId).on('value', async snap => {
            const off = snap.val(); if (!off || !off.sdp) return;
            if (tPc) { try { tPc.close(); } catch (e) {} }
            const pc = tPc = new RTCPeerConnection({ iceServers: ICE });
            pc.ontrack = e => { try { e.receiver.jitterBufferTarget = 200; } catch (er) {} const a = $('audioEl'); a.srcObject = e.streams[0]; a.play().catch(() => toast('اضغط على الشاشة لتشغيل صوت المدرس', 'a')); };
            pc.onicecandidate = e => { if (e.candidate) ref('rtc/s2t_ice/' + myId).push(e.candidate.toJSON()); };
            pc.onconnectionstatechange = () => {
                if (tPc === pc && ['failed', 'disconnected'].includes(pc.connectionState)) setTimeout(() => { if (tPc === pc) ref('rtc/join_notify').push(myId); }, 3000);
            };
            ref('rtc/t2s_ice/' + myId).off();
            ref('rtc/t2s_ice/' + myId).on('child_added', s => {
                const c = s.val(); s.ref.remove();
                if (c && tPc === pc) pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
            });
            await pc.setRemoteDescription(new RTCSessionDescription(off));
            const ans = await pc.createAnswer({ offerToReceiveAudio: true, offerToReceiveVideo: false });
            await pc.setLocalDescription(ans);
            ref('rtc/s2t_answer/' + myId).set({ sdp: ans.sdp, type: ans.type, ts: Date.now() });
        });
        document.addEventListener('click', () => { const a = $('audioEl'); if (a.srcObject && a.paused) a.play().catch(() => {}); });
    }

    /* مايك الطالب: طلب ← سماح المدرس ← إرسال */
    let lvAn = null, lvCtx = null, selfMuted = false, wasAllowed = false;
    function setMicState(st) {
        const b = $('micBtn');
        b.classList.toggle('on', st === 'requesting');
        b.classList.toggle('live', st === 'allowed');
        b.classList.toggle('muted', st === 'muted');
        const txt = { idle: 'مايك', requesting: 'بانتظار الإذن', allowed: 'يُسمع', muted: 'مكتوم' }[st];
        b.innerHTML = '<svg viewBox="0 0 24 24" class="mic-svg"><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg><span>' + txt + '</span><b class="mic-dots"><i></i><i></i><i></i><i></i></b>';
        if (st === 'allowed' && sStream && !lvAn) {
            try {
                lvCtx = new (window.AudioContext || window.webkitAudioContext)();
                lvAn = lvCtx.createAnalyser(); lvAn.fftSize = 256;
                lvCtx.createMediaStreamSource(sStream).connect(lvAn);
                (function lp() {
                    if (!lvAn) return;
                    const d = new Uint8Array(lvAn.frequencyBinCount); lvAn.getByteFrequencyData(d);
                    let sum = 0; for (let i = 0; i < d.length; i++) sum += d[i];
                    const lv = Math.min(4, Math.round(sum / d.length / 14));
                    document.querySelectorAll('#micBtn .mic-dots i').forEach((el, k) => el.classList.toggle('lit', k < lv));
                    requestAnimationFrame(lp);
                })();
            } catch (e) {}
        }
        if (st !== 'allowed' && lvAn) { lvAn = null; try { lvCtx.close(); } catch (e) {} lvCtx = null; }
    }
    async function openMic() {
        sStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, sampleRate: 48000, channelCount: 1 }, video: false });
        micOn = true;
    }
    function stopMic() {                         /* إيقاف كامل (يعود الزر رماديًا) */
        micOn = false; selfMuted = false; wasAllowed = false;
        if (sStream) { sStream.getTracks().forEach(t => t.stop()); sStream = null; }
        if (sPc) { try { sPc.close(); } catch (e) {} sPc = null; }
        ref('micRequests/' + myId).remove(); ref('micSelf/' + myId).remove();
        ref('rtc/s2t_stu_offer/' + myId).remove(); ref('rtc/s2t_stu_ice/' + myId).remove();
        setMicState('idle');
    }
    function watchMicPermission() {
        ref('micPermissions/' + myId).on('value', async snap => {
            micAllowed = !!(snap.val() && snap.val().allowed);
            if (micAllowed) {
                wasAllowed = true;
                if (!micOn && !selfMuted) {                          /* المدرس فعّل مايكي مباشرة */
                    try { await openMic(); } catch (e) { toast('تعذر تشغيل المايك: ' + e.message, 'a'); return; }
                }
                if (!micOn) return;
                setMicState(selfMuted ? 'muted' : 'allowed');
                ref('micRequests/' + myId).remove();
                if (!sPc) await startMicRTC();
            } else {
                if (wasAllowed) stopMic();                           /* المدرس أوقفه */
                else setMicState(micOn ? 'requesting' : 'idle');
            }
        });
    }
    async function startMicRTC() {
        if (sPc) return;
        const pc = sPc = new RTCPeerConnection({ iceServers: ICE });
        sStream.getTracks().forEach(t => pc.addTrack(t, sStream));
        pc.getSenders().forEach(sn => { try { const pr = sn.getParameters(); if (!pr.encodings || !pr.encodings.length) pr.encodings = [{}]; pr.encodings[0].maxBitrate = 96000; pr.encodings[0].priority = 'high'; sn.setParameters(pr).catch(() => {}); } catch (e) {} });
        pc.onicecandidate = e => { if (e.candidate) ref('rtc/s2t_stu_ice/' + myId).push(e.candidate.toJSON()); };
        pc.onconnectionstatechange = () => {
            if (sPc === pc && ['failed', 'disconnected'].includes(pc.connectionState)) {
                try { pc.close(); } catch (e) {} sPc = null;
                if (micAllowed && micOn) setTimeout(startMicRTC, 3000);
            }
        };
        ref('rtc/t2s_stu_ice/' + myId).off();
        ref('rtc/t2s_stu_ice/' + myId).on('child_added', s => {
            const c = s.val(); s.ref.remove();
            if (c && sPc === pc) pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
        });
        ref('rtc/t2s_stu_answer/' + myId).off();
        ref('rtc/t2s_stu_answer/' + myId).on('value', s => {
            const a = s.val();
            if (a && a.sdp && sPc === pc && pc.signalingState === 'have-local-offer') pc.setRemoteDescription(new RTCSessionDescription(a)).catch(() => {});
        });
        const off = await pc.createOffer({ offerToReceiveAudio: false });
        await pc.setLocalDescription(off);
        ref('rtc/s2t_stu_offer/' + myId).set({ sdp: off.sdp, type: off.type, ts: Date.now() });
    }
    async function toggleMic() {
        if (!approved) return;
        if (!micOn) {                                   /* طلب الكلام */
            try { await openMic(); } catch (e) { alert('تعذر تشغيل الميكروفون:\n' + e.message); return; }
            if (micAllowed) { setMicState('allowed'); if (!sPc) await startMicRTC(); return; }
            setMicState('requesting');
            ref('micRequests/' + myId).set({ studentId: myId, studentName: myName, ts: Date.now() });
            ref('micRequests/' + myId).onDisconnect().remove();
        } else if (!micAllowed) {                       /* ألغى طلبه */
            stopMic();
        } else {                                        /* كتم/إلغاء كتم من عندي — له الأولوية على المدرس */
            selfMuted = !selfMuted;
            if (sStream) sStream.getAudioTracks().forEach(t => { t.enabled = !selfMuted; });
            if (selfMuted) ref('micSelf/' + myId).set(true); else ref('micSelf/' + myId).remove();
            setMicState(selfMuted ? 'muted' : 'allowed');
        }
    }
    $('micBtn').addEventListener('click', toggleMic);


    /* ════════ ما يُظهره المدرس: vis + الملف + الحفظ ════════ */
    let vis = { board: true, file: false, save: false }, fileMeta = null, viewMode = 'board';
    const fileBg = {}, fileStr = {};
    function buildFile(n) {
        const im = fileBg[n]; if (!fileMeta || !im) return;
        const st = fileStr[n] || { s: [], ts: 0 };
        pagesData['F' + n] = { bg: '#ffffff', g: 0, s: st.s, i: [], w: fileMeta.bw, h: fileMeta.bh, ts: st.ts, zoom: fileMeta.zoom || 1, bgImg: im };
        if (viewMode === 'file' && String(fileMeta.cur) === String(n)) renderMain();
    }
    function applyVis() {
        const fileOk = !!(vis.file && fileMeta && fileMeta.n);
        if (!fileOk && viewMode === 'file') viewMode = 'board';
        $('fileBtn').style.display = fileOk ? '' : 'none';
        $('fileBtn').textContent = viewMode === 'file' ? '🖍 السبورة' : '📄 الملف';
        $('saveBtn').style.display = vis.save ? '' : 'none';
        if (!vis.save) $('saveMenu').style.display = 'none';
        const hide = viewMode === 'board' && !vis.board;
        $('hiddenMsg').style.display = hide ? 'flex' : 'none';
        wrap.style.visibility = hide ? 'hidden' : '';
        $('fileView').style.display = 'none';
        renderMain();
    }
    function listenShare() {
        ref('vis').on('value', snap => {
            const v = snap.val() || { board: true, file: false, save: false };
            if (v.file && !vis.file) viewMode = 'file';          /* أظهر المدرس الملف → انتقل إليه */
            if (!v.file) viewMode = 'board';
            vis = { board: v.board !== false, file: !!v.file, save: !!v.save };
            applyVis();
        });
        ref('fileShare/meta').on('value', snap => {
            const m = snap.val(), was = !!(fileMeta && fileMeta.n);
            fileMeta = m;
            if (!m) { for (const k in fileBg) { delete fileBg[k]; delete fileStr[k]; delete pagesData['F' + k]; } }
            else { Object.keys(fileBg).forEach(buildFile); if (vis.file && !was) viewMode = 'file'; }
            applyVis();
        });
        ref('fileShare/pages').on('value', snap => {                 /* خلفيات الصفحات */
            const v = snap.val() || {};
            Object.keys(v).forEach(n => {
                if (fileBg[n] && fileBg[n]._ts === v[n].ts) return;
                const im = new Image(); im._ts = v[n].ts; fileBg[n] = im;
                im.onload = () => buildFile(n); im.src = v[n].d;
            });
        });
        const strk = s => { try { const o = unpack(s.val().j); fileStr[s.key] = { s: o.s || [], ts: s.val().ts || 0 }; } catch (e) { return; }
            segs = segs.filter(g => g.sl !== 'F' + s.key || g.t > fileStr[s.key].ts);
            if (shapePrev && shapePrev.sl === 'F' + s.key && shapePrev.t <= fileStr[s.key].ts) shapePrev = null;
            buildFile(s.key); };
        ref('fileShare/strokes').on('child_added', strk);
        ref('fileShare/strokes').on('child_changed', strk);
        $('fileBtn').addEventListener('click', () => { viewMode = viewMode === 'file' ? 'board' : 'file'; applyVis(); });
    }

    /* ── الحفظ (بإذن المدرس) ── */
    function b64bytes(d) { const b = atob(d.split(',')[1]), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
    function makePdf(pages) {            /* pages: [{d: jpegDataURL, w, h}] */
        const enc = new TextEncoder(), parts = [], off = []; let len = 0;
        const add = x => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; };
        const obj = (id, fn) => { off[id] = len; add(id + ' 0 obj\n'); fn(); add('\nendobj\n'); };
        add('%PDF-1.4\n');
        const n = pages.length, kids = pages.map((_, i) => (3 + 3 * i) + ' 0 R').join(' ');
        obj(1, () => add('<< /Type /Catalog /Pages 2 0 R >>'));
        obj(2, () => add('<< /Type /Pages /Kids [' + kids + '] /Count ' + n + ' >>'));
        pages.forEach((p, i) => {
            const pid = 3 + 3 * i, cid = pid + 1, iid = pid + 2, W = Math.round(p.w * 0.75), H = Math.round(p.h * 0.75);
            const content = 'q ' + W + ' 0 0 ' + H + ' 0 0 cm /Im0 Do Q';
            obj(pid, () => add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /XObject << /Im0 ' + iid + ' 0 R >> >> /Contents ' + cid + ' 0 R >>'));
            obj(cid, () => add('<< /Length ' + content.length + ' >>\nstream\n' + content + '\nendstream'));
            const jb = b64bytes(p.d);
            obj(iid, () => { add('<< /Type /XObject /Subtype /Image /Width ' + p.w + ' /Height ' + p.h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jb.length + ' >>\nstream\n'); add(jb); add('\nendstream'); });
        });
        const total = 3 + 3 * n, xref = len;
        let x = 'xref\n0 ' + total + '\n0000000000 65535 f \n';
        for (let i = 1; i < total; i++) x += String(off[i]).padStart(10, '0') + ' 00000 n \n';
        add(x + 'trailer\n<< /Size ' + total + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF');
        return new Blob(parts, { type: 'application/pdf' });
    }
    function download(blob, name) {
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 30000);
    }
    const stamp = () => new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    function slideJpeg(id, k) {
        const pg = pagesData[id]; if (!pg) return null;
        const cv = document.createElement('canvas'); cv.width = Math.round(pg.w * k); cv.height = Math.round(pg.h * k);
        paintPage(cv.getContext('2d'), pg, k);
        return { d: cv.toDataURL('image/jpeg', 0.92), w: cv.width, h: cv.height, cv };
    }
    const SAVE = {
        slide() { const r = slideJpeg(active, 2); if (!r) return; r.cv.toBlob(b => download(b, 'slide-' + stamp() + '.png'), 'image/png'); },
        slides() { const pgs = order.map(id => slideJpeg(id, 1.5)).filter(Boolean); if (!pgs.length) return toast('لا توجد شرائح', 'a'); download(makePdf(pgs), 'slides-' + stamp() + '.pdf'); },
        file() {
            const ks = Object.keys(fileBg).map(Number).filter(k => pagesData['F' + k]).sort((x, y) => x - y); if (!ks.length) return toast('لا توجد صفحات ملف', 'a');
            const pgs = ks.map(k => slideJpeg('F' + k, 1500 / pagesData['F' + k].w)).filter(Boolean);
            download(makePdf(pgs), ((fileMeta && fileMeta.name) || 'file').replace(/\.[^.]+$/, '') + '-' + stamp() + '.pdf');
            if (fileMeta && ks.length < (fileMeta.n || 0)) toast('تم حفظ الصفحات التي فتحها المدرس فقط (' + ks.length + ' من ' + fileMeta.n + ')', 'a');
        }
    };
    $('saveBtn').addEventListener('click', e => {
        e.stopPropagation(); const m = $('saveMenu');
        if (m.style.display !== 'none') { m.style.display = 'none'; return; }
        const items = [];
        if (vis.board) items.push(['slide', '🖼 حفظ الشريحة الحالية (صورة)'], ['slides', '📑 حفظ كل الشرائح (PDF)']);
        if (vis.file && Object.keys(fileBg).length) items.push(['file', '📄 حفظ الملف (PDF)']);
        if (!items.length) { toast('لا يوجد ما يُحفظ الآن', 'a'); return; }
        m.innerHTML = items.map(i => '<button data-k="' + i[0] + '">' + i[1] + '</button>').join('');
        const r = $('saveBtn').getBoundingClientRect();
        m.style.display = 'flex'; m.style.left = Math.max(6, r.left) + 'px'; m.style.bottom = (window.innerHeight - r.top + 6) + 'px';
    });
    $('saveMenu').addEventListener('click', e => { const b = e.target.closest('button[data-k]'); if (!b) return; $('saveMenu').style.display = 'none'; SAVE[b.dataset.k](); });
    document.addEventListener('click', () => { $('saveMenu').style.display = 'none'; });

    /* ════════ استقبال الشرائح (متجهات) ════════ */
    function listen() {
        ref('session').on('value', snap => {
            const d = snap.val();
            order = d ? toArr(d.order) : [];
            const cur = d ? d.current : null;
            if (cur && cur !== teacherCur) { teacherCur = cur; active = cur; }   /* المدرس انتقل → أتبعه */
            if (active && order.indexOf(active) === -1) active = (teacherCur && order.indexOf(teacherCur) !== -1) ? teacherCur : (order[0] || null);
            renderList(); renderMain();
        });
        ref('slidesData').on('child_added', onPage);
        ref('slidesData').on('child_changed', onPage);
        ref('slidesData').on('child_removed', s => { delete pagesData[s.key]; renderList(); renderMain(); });
        ref('slideImages').on('child_added', onImgData);
        ref('slideImages').on('child_changed', onImgData);
        ref('live').on('child_added', onLive);
        ref('liveShape').on('value', onLiveShape);
        ref('view').on('value', snap => { tView = snap.val(); applyView(); });
    }

    /* تمرير المدرس → أحاكيه (ما دمت على شريحته). الإحداثيات بوحدات الصفحة */
    let tView = null;
    function applyView() {
        const id = curId(), pg = pagesData[id];
        if (!tView || !pg || (viewMode !== 'file' && active !== teacherCur) || tView.sl !== id) return;
        wrap.scrollTop = Math.round(tView.y * scale);
        const maxX = box.offsetWidth - wrap.clientWidth;      /* RTL: scrollLeft بين -maxX و0 */
        if (maxX > 0) wrap.scrollLeft = Math.max(-maxX, Math.min(0, Math.round(tView.x * scale - maxX)));
    }

    /* فك ضغط النقاط (f:[x,y,...] → [{x,y}]) */
    function unpack(str) {
        return JSON.parse(str, (k, v) => {
            if (k === 'points' && v && Array.isArray(v.f)) {
                const out = [];
                for (let i = 0; i + 1 < v.f.length; i += 2) out.push({ x: v.f[i], y: v.f[i + 1] });
                return out;
            }
            return v;
        });
    }

    function onPage(snap) {
        const v = snap.val();
        if (!v || !v.j) return;
        let pg;
        try { pg = unpack(v.j); } catch (e) { console.warn('صفحة تالفة', e); return; }
        pg.w = v.w || 794; pg.h = v.h || 1123; pg.ts = v.ts || 0;
        pagesData[snap.key] = pg;
        /* الصفحة الجديدة تشمل كل ما رُسم قبل وقتها */
        segs = segs.filter(g => g.sl !== snap.key || g.t > pg.ts);
        if (shapePrev && shapePrev.sl === snap.key && shapePrev.t <= pg.ts) shapePrev = null;
        paintThumb(snap.key);
        if (snap.key === active) renderMain();
        renderList();
    }
    function onImgData(snap) {
        const v = snap.val();
        if (v && v.d) { imgSrc[snap.key] = v.d; repaintAll(); }
    }
    function onLive(snap) {
        const d = snap.val();
        if (!d || !d.p || !d.p.length) return;
        const pg = pagesData[d.sl];
        if (pg && d.t <= pg.ts) return;                  /* دخل سابقًا في الصفحة */
        segs.push(d);
        if (segs.length > 3000) segs.shift();
        if (d.sl === curId() && pagesData[d.sl]) { setLiveTransform(); drawSeg(d, lastPt); }
    }
    function onLiveShape(snap) {
        const d = snap.val();
        if (!d) { shapePrev = null; redrawLive(); return; }
        const pg = pagesData[d.sl];
        if (pg && d.t <= pg.ts) return;
        try { shapePrev = { sl: d.sl, t: d.t, shape: JSON.parse(d.s) }; } catch (_) { return; }
        if (d.sl === curId()) redrawLive();
    }

    /* ════════ الرسم ════════ */
    const wrap = $('viewWrap'), box = $('slideBox');
    const baseCv = $('baseCv'), baseCx = baseCv.getContext('2d');
    const liveCv = $('liveCv'), liveCx = liveCv.getContext('2d');
    const dpr = () => Math.min(2, window.devicePixelRatio || 1);
    let curK = 1, lastPt = {};

    /* صفحة كاملة على سياق معيّن: الخلفية + الشبكة + الصور + الرسم (نفس كود المدرس) */
    function paintPage(ctx, pg, k) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.setTransform(k, 0, 0, k, 0, 0);
        ctx.fillStyle = pg.bg || '#0a101d';
        ctx.fillRect(0, 0, pg.w, pg.h);
        if (pg.bgImg && pg.bgImg.complete && pg.bgImg.naturalWidth) ctx.drawImage(pg.bgImg, 0, 0, pg.w, pg.h);
        if (pg.g) {
            ctx.fillStyle = 'rgba(56,189,248,0.08)';
            for (let x = 0; x < pg.w; x += 20) ctx.fillRect(x, 0, 1, pg.h);
            for (let y = 0; y < pg.h; y += 20) ctx.fillRect(0, y, pg.w, 1);
        }
        const imgs = (pg.i || []).map(im => ({ src: imgSrc[im.k], x: im.x, y: im.y, w: im.w, h: im.h, rotation: im.rotation })).filter(im => im.src);
        if (imgs.length) MCR.drawImagesOnCtx(ctx, imgs);
        MCR.drawStrokesOnCtx(ctx, pg.s || []);
    }

    /* رسم قطعة قلم مباشرة فوق الصفحة */
    function drawSeg(d, last) {
        const p = d.p, n = p.length / 2;
        liveCx.save();
        liveCx.lineCap = 'round'; liveCx.lineJoin = 'round';
        liveCx.strokeStyle = d.c; liveCx.fillStyle = d.c; liveCx.lineWidth = d.w || 4;
        if (d.k === 'fh') { liveCx.shadowBlur = 15; liveCx.shadowColor = d.c; liveCx.globalAlpha = (d.o != null ? d.o : 0.1); }
        else liveCx.globalAlpha = (d.o != null ? d.o : 1);
        const prev = last[d.id];
        if (n === 1 && !prev) {
            liveCx.beginPath(); liveCx.arc(p[0], p[1], Math.max(1, (d.w || 4) / 2), 0, Math.PI * 2); liveCx.fill();
        } else {
            liveCx.beginPath();
            let i = 0;
            if (prev) liveCx.moveTo(prev.x, prev.y); else { liveCx.moveTo(p[0], p[1]); i = 1; }
            for (; i < n; i++) liveCx.lineTo(p[2 * i], p[2 * i + 1]);
            liveCx.stroke();
        }
        last[d.id] = { x: p[p.length - 2], y: p[p.length - 1] };
        liveCx.restore();
    }
    function setLiveTransform() { liveCx.setTransform(curK, 0, 0, curK, 0, 0); }
    function redrawLive() {
        const id = curId(), pg = pagesData[id];
        liveCx.setTransform(1, 0, 0, 1, 0, 0);
        liveCx.clearRect(0, 0, liveCv.width, liveCv.height);
        lastPt = {};
        if (!pg) return;
        setLiveTransform();
        segs.forEach(d => { if (d.sl === id && d.t > pg.ts) drawSeg(d, lastPt); });
        if (shapePrev && shapePrev.sl === id && shapePrev.t > pg.ts) {
            liveCx.save(); MCR.drawShape(liveCx, shapePrev.shape); liveCx.restore();
        }
    }

    function computeScale(pg) {
        const W = wrap.offsetWidth, H = wrap.clientHeight, sb = (wrap.offsetWidth - wrap.clientWidth) || 9;
        let mode = fitMode;
        wrap.classList.toggle('fit-width', mode === 'width');
        wrap.style.overflowX = (mode === 'width') ? 'hidden' : 'auto';
        wrap.style.background = (mode === 'width') ? (pg.bg || '') : '';   /* عند ملاءمة العرض تمتد خلفية السبورة */
        if (mode === 'one') scale = 1;
        else if (mode === 'width') { scale = W / pg.w; if (pg.h * scale > H) scale = (W - sb) / pg.w; }
        else if (mode === 'page') scale = Math.min((wrap.clientWidth - 8) / pg.w, (H - 8) / pg.h);
        if (pg.zoom) { mode = 'one'; scale = pg.zoom; wrap.style.overflowX = 'auto'; wrap.classList.remove('fit-width'); wrap.style.background = ''; }
        scale = Math.max(0.1, Math.min(5, scale));
        const next = { one: 'ملاءمة العرض', width: 'الصفحة كاملة', page: '100%', free: '100%', auto: 'ملاءمة العرض' };
        $('fitBtn').textContent = next[mode] || '100%';
        $('fitBtn').dataset.mode = mode;
    }

    const curId = () => (viewMode === 'file' && fileMeta) ? 'F' + fileMeta.cur : active;
    function renderMain() {
        const empty = $('viewEmpty'), id = curId();
        const pg = id && pagesData[id];
        if (!pg) {
            box.style.display = 'none'; empty.style.display = '';
            empty.textContent = order.length ? '⏳ جاري تحميل الشريحة...' : '⏳ بانتظار المدرس لبدء الشرح...';
            return;
        }
        empty.style.display = 'none';
        const changed = shownSlide !== id;
        if (changed) { shownSlide = id; wrap.scrollTop = 0; wrap.scrollLeft = 0; }
        computeScale(pg);
        box.style.display = 'block';
        box.style.width = Math.round(pg.w * scale) + 'px';
        box.style.height = Math.round(pg.h * scale) + 'px';
        /* دقة الكانفس = حجم العرض × دقة الشاشة (بحد أقصى 4096) فيبقى الرسم حادًّا */
        curK = Math.min(scale * dpr(), 4096 / Math.max(pg.w, pg.h));
        const cw = Math.round(pg.w * curK), ch = Math.round(pg.h * curK);
        if (baseCv.width !== cw) baseCv.width = cw;
        if (baseCv.height !== ch) baseCv.height = ch;
        if (liveCv.width !== cw) liveCv.width = cw;
        if (liveCv.height !== ch) liveCv.height = ch;
        paintPage(baseCx, pg, curK);
        redrawLive();
        $('zoomVal').textContent = Math.round(scale * 100) + '%';
        if (viewMode !== 'file') $('curNum').textContent = order.indexOf(active) + 1;
        if (changed) applyView();
    }

    /* ════════ قائمة الشرائح (مصغّرات من نفس الرسم) ════════ */
    const thumbs = {};   /* id → { cv, ts } */
    const THUMB_W = 232;
    function thumbOf(id) {
        if (!thumbs[id]) {
            const cv = document.createElement('canvas');
            cv.width = THUMB_W; cv.height = Math.round(THUMB_W * 1123 / 794);
            thumbs[id] = { cv: cv, ts: -1 };
        }
        return thumbs[id];
    }
    function paintThumb(id, force) {
        const pg = pagesData[id]; if (!pg) return;
        const t = thumbOf(id);
        if (!force && t.ts === pg.ts) return;
        t.ts = pg.ts;
        t.cv.height = Math.round(THUMB_W * pg.h / pg.w);
        paintPage(t.cv.getContext('2d'), pg, THUMB_W / pg.w);
    }
    function renderList() {
        const list = $('slidesList');
        list.innerHTML = '';
        order.forEach((id, i) => {
            const c = document.createElement('div');
            c.className = 'slide-card' + (id === active ? ' active' : '');
            if (pagesData[id]) { paintThumb(id); c.appendChild(thumbOf(id).cv); }
            else { const ph = document.createElement('div'); ph.className = 'ph'; ph.textContent = '...'; c.appendChild(ph); }
            const n = document.createElement('span'); n.className = 'slide-num'; n.textContent = i + 1; c.appendChild(n);
            if (id === teacherCur) { const t = document.createElement('span'); t.className = 'slide-teacher'; t.textContent = 'المدرس'; c.appendChild(t); }
            c.addEventListener('click', () => { active = id; if (viewMode === 'file') { viewMode = 'board'; applyVis(); } renderList(); renderMain(); });
            list.appendChild(c);
        });
        $('slidesCount').textContent = order.length;
        $('totNum').textContent = order.length;
        $('curNum').textContent = order.indexOf(active) + 1;
        $('followBtn').style.display = (active && teacherCur && active !== teacherCur && order.indexOf(teacherCur) !== -1) ? '' : 'none';
        const act = list.querySelector('.slide-card.active');
        if (act && act.scrollIntoView) act.scrollIntoView({ block: 'nearest' });
    }

    /* إعادة رسم الكل (عند اكتمال صورة/خط) */
    let rafId = 0;
    function repaintAll() {
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
            rafId = 0;
            Object.keys(pagesData).forEach(id => paintThumb(id, true));
            renderMain();
        });
    }
    MCR.onImageLoad = repaintAll;
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(repaintAll);
    window.addEventListener('resize', () => requestAnimationFrame(renderMain));

    /* ════════ الأزرار ════════ */
    function step(d) {
        const i = order.indexOf(active) + d;
        if (i < 0 || i >= order.length) return;
        active = order[i]; renderList(); renderMain();
    }
    $('prevBtn').addEventListener('click', () => step(-1));
    $('nextBtn').addEventListener('click', () => step(1));
    $('zoomIn').addEventListener('click', () => { fitMode = 'free'; scale *= 1.15; renderMainFree(); });
    $('zoomOut').addEventListener('click', () => { fitMode = 'free'; scale /= 1.15; renderMainFree(); });
    function renderMainFree() {            /* تكبير يدوي: نحفظ المقياس ثم نرسم */
        const keep = scale; renderMainWithScale(keep);
    }
    function renderMainWithScale(sc) {
        const pg = pagesData[active]; if (!pg) return;
        scale = Math.max(0.1, Math.min(5, sc));
        box.style.width = Math.round(pg.w * scale) + 'px';
        box.style.height = Math.round(pg.h * scale) + 'px';
        wrap.classList.remove('fit-width'); wrap.style.overflowX = 'auto';
        curK = Math.min(scale * dpr(), 4096 / Math.max(pg.w, pg.h));
        baseCv.width = liveCv.width = Math.round(pg.w * curK);
        baseCv.height = liveCv.height = Math.round(pg.h * curK);
        paintPage(baseCx, pg, curK); redrawLive();
        $('zoomVal').textContent = Math.round(scale * 100) + '%';
        $('fitBtn').textContent = '100%'; $('fitBtn').dataset.mode = 'free';
    }
    $('fitBtn').addEventListener('click', () => {
        const m = $('fitBtn').dataset.mode || 'one';
        fitMode = (m === 'one') ? 'width' : (m === 'width') ? 'page' : 'one';
        renderMain();
    });
    $('followBtn').addEventListener('click', () => { if (teacherCur) { active = teacherCur; renderList(); renderMain(); } });
    $('fsBtn').addEventListener('click', () => {
        document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen().catch(() => { });
    });
    $('handBtn').addEventListener('click', () => {
        if (!approved) return;
        handUp = !handUp;
        $('handBtn').classList.toggle('on', handUp);
        if (handUp) ref('handRaised/' + myId).set(true); else ref('handRaised/' + myId).remove();
    });
    const panel = $('slidesPanel');
    if (window.innerWidth < 700) panel.classList.add('hide');
    $('panelBtn').addEventListener('click', () => { panel.classList.toggle('hide'); requestAnimationFrame(renderMain); });
})();
