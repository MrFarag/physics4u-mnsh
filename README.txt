MyClass — الطالب

index.html = الصفحة الرئيسية الدعائية (أول ما يراه الطالب) (بث مباشر + دورات + دروس مجانية + فيديوهات)
live.html  = غرفة الحصة المباشرة (سبورة + صوت المدرس + مايك الطالب بإذن المدرس)

للتجربة مع المدرس التجريبي: افتح test.html (الحصة) أو index.html?room=test (الرئيسية).
للنشر على GitHub Pages ارفع:
  index.html home.css home.js home-data.js live.html student.css student.js render.js
(test.html للتجربة المحلية فقط).

لتغيير الدورات والفيديوهات: عدّل home-data.js فقط (عينات الآن).
  video: معرّف فيديو يوتيوب. رقم الواتس والأسعار والمواعيد في نفس الملف.

render.js منسوخ حرفيًا من دوال الرسم في board.js (المدرس) ليتطابق الرسم.
الحجم ثابت 100% مثل المدرس مع سكرول، وسكرول المدرس ينعكس عند الطالب.
قواعد Firebase يجب أن تسمح بالمسارات: session, slidesData, slideImages, live, liveShape, view, rtc, micRequests, micPermissions
مسارات إضافية في قواعد Firebase: vis, fileShare
زر "📄 الملف" يظهر عند إظهار المدرس للملف، وزر "💾 حفظ" عند سماحه (شرائح PNG/PDF والملف PDF).
مسار إضافي في قواعد Firebase: messages, micSelf

config.js (جديد) + firebase-auth: الحصة الحقيقية تطلب كود اشتراك البث؛ الدروس المدفوعة في home.html مقفلة حتى إدخال كود.
