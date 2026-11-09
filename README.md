# SFNE Admin Dashboard

لوحة تحكم Smart Fitness & Nutrition (HTML + CSS + Vanilla JS، من غير build).

## التشغيل
1. افتح المجلد في VS Code.
2. ثبّت إضافة **Live Server** ثم كليك يمين على `index.html` ← *Open with Live Server*.
   (أو من الترمينال: `npx serve .` أو `python -m http.server 5500`)
3. عدّل `js/config.js` وحط عنوان الـ Backend في `SFN_API_BASE`.
4. صفحة **المستخدمين** تحتاج JWT لأدمن: لو ظهر 401 اضغط "ضبط الاتصال والتوكن" والصق التوكن.
   (التوكن بيتحفظ في `localStorage` بالمفتاح `sfn-token`، فلو عندكم لوجين خليه يحفظه بنفس الاسم.)

> الـ Backend لازم يفعّل CORS لعنوان الـ Live Server (مثلاً `http://127.0.0.1:5500`).

## الهيكل
```
index.html
css/style.css
js/config.js       إعدادات الـ API
js/data.js         الـ State + البيانات الوهمية للصفحات القديمة
js/components.js   مكوّنات مشتركة
js/pages.js        الصفحات القديمة
js/users.js        إدارة المستخدمين (مربوطة بالـ API)
js/app.js          الـ Router والقايمة والـ init (لازم يتحمّل أخيراً)
```

## رفعه على GitHub
```bash
git init
git checkout -b feature/user-management
git add .
git commit -m "feat: add Users Management page integrated with Users API"
git remote add origin <repo-url>
git push -u origin feature/user-management
```
بعدها افتح Pull Request من الفرع على `main`.
