/* إعدادات Firebase — عدّلها هنا فقط (نفس القيم في MyClass-Student/config.js) */
window.MC_CONFIG = {
    firebase: {
        apiKey: 'AIzaSyCMPeZt94zKC7HTodF1KwbvOajvWsjvfWk',
        authDomain: 'physics4u-mnsh.firebaseapp.com',
        databaseURL: 'https://physics4u-mnsh-default-rtdb.europe-west1.firebasedatabase.app',
        projectId: 'physics4u-mnsh',
        storageBucket: 'physics4u-mnsh.firebasestorage.app',
        messagingSenderId: '868225281920',
        appId: '1:868225281920:web:1f11cfa68678ffaf619b65'
    },
    liveRoom: 'live'      /* اسم غرفة الحصص الحقيقية (التجريبية: test) */
};


/* خوادم TURN خاصة بك (اختياري — تحسّن اتصال الصوت كثيرًا). مثال بعد إنشاء حساب مجاني في metered.ca:
   window.CUSTOM_ICE = [{urls:'stun:stun.relay.metered.ca:80'},{urls:'turn:global.relay.metered.ca:80',username:'USER',credential:'PASS'},{urls:'turn:global.relay.metered.ca:443',username:'USER',credential:'PASS'},{urls:'turns:global.relay.metered.ca:443?transport=tcp',username:'USER',credential:'PASS'}];
   اتركه فارغًا لاستخدام الخوادم المجانية الافتراضية. */
window.CUSTOM_ICE = window.CUSTOM_ICE || [];
