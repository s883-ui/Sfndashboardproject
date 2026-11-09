/* =====================================================================
   app.js — "المحرك": بيربط كل حاجة ببعض
   ---------------------------------------------------------------------
   - skeleton: شكل الـ Loading
   - renderSide / renderTop: بيرسموا القايمة الجانبية والشريط اللي فوق
   - render: بيرسم الصفحة الحالية
   - route: الـ Router، بيقرا اللي بعد # في اللينك ويفتح الصفحة المناسبة
   - toggleLang / toggleTheme: زرار اللغة وزرار المظهر
   - Handlers: الـ functions اللي الزراير والبحث بينادوها
   ===================================================================== */

function skeleton(){return `<div class="skel" style="height:16px;width:180px;margin-bottom:12px"></div><div class="skel" style="height:32px;width:min(420px,80%);margin-bottom:24px"></div>
 <div class="grid g4 mb">${'<div class="skel" style="height:128px;border-radius:18px"></div>'.repeat(4)}</div>
 <div class="grid g-main"><div class="skel" style="height:320px;border-radius:18px"></div><div class="skel" style="height:320px;border-radius:18px"></div></div>`}

// ===== عناصر القايمة الجانبية =====
// id = اسم الصفحة (نفس اسمها في P). g = عنوان مجموعة. sub = صفحات فرعية (زي التقارير)
const NAV=[
 {g:{ar:'الرئيسية',en:'Main'}},
 {id:'dashboard',ic:'grid_view',t:{ar:'لوحة التحكم',en:'Dashboard'}},
 {id:'reports',ic:'monitoring',t:{ar:'التقارير',en:'Reports'},sub:[
   {id:'reports-staff',t:{ar:'أداء الكادر',en:'Staff performance'}}]},
 {g:{ar:'المتدربين والتدريب',en:'Members & training'}},
 {id:'trainees',ic:'group',t:{ar:'المتدربين',en:'Trainees'},badge:'1,842'},
 {id:'requests',ic:'how_to_reg',t:{ar:'طلبات التسجيل',en:'Registration requests'},count:()=>REQUESTS.filter(r=>r.status==='pending').length},
 {id:'programs',ic:'exercise',t:{ar:'البرامج التدريبية',en:'Training programs'}},
 {g:{ar:'التغذية',en:'Nutrition'}},
 {id:'nutrition',ic:'restaurant',t:{ar:'الأنظمة الغذائية',en:'Diet plans'}},
 {id:'calories',ic:'calculate',t:{ar:'حاسبة السعرات',en:'Calorie calculator'}},
 {id:'recipes',ic:'menu_book',t:{ar:'وصفات صحية جاهزة',en:'Healthy recipes'}},
 {g:{ar:'الكادر',en:'Staff'}},
 {id:'trainers',ic:'sports',t:{ar:'المدربين',en:'Coaches'}},
 {id:'nutritionists',ic:'nutrition',t:{ar:'أخصائيو التغذية',en:'Nutritionists'}},
 {g:{ar:'الإدارة',en:'Management'}},
 {id:'users',ic:'manage_accounts',t:{ar:'المستخدمين',en:'Users'}},
  {id:'gyms',ic:'storefront',t:{ar:'الجيمات المتعاقدة',en:'Partner gyms'},isNew:1},
 {id:'subscriptions',ic:'credit_card',t:{ar:'الاشتراكات والفواتير',en:'Subscriptions & billing'}},
 {id:'ai',ic:'neurology',t:{ar:'تحليلات الذكاء الاصطناعي',en:'AI insights'}},
 {g:{ar:'الدعم والتواصل',en:'Support'}},
 {id:'tickets',ic:'support_agent',t:{ar:'تذاكر الدعم',en:'Support tickets'},count:()=>TICKETS.filter(t=>t.status==='open').length},
 {id:'chats',ic:'forum',t:{ar:'متابعة المحادثات',en:'Chat monitoring'},count:()=>CHATS.filter(c=>c.flag).length},
 {id:'settings',ic:'settings',t:{ar:'الإعدادات',en:'Settings'}},
];
// ===== القايمة الجانبية =====
// بنلف على NAV ونعمل لينك لكل صفحة. الصفحة المفتوحة (S.page) بتاخد class="active"
// "التقارير" ليها صفحات فرعية بتتفتح وتتقفل بالسهم
function navLink(n,cls=''){const on=S.page===n.id, c=n.count?n.count():0;
 return `<a href="#${n.id}" class="${cls} ${on?'active':''}" ${on?'aria-current="page"':''} onclick="toggleNav(false);go('${n.id}');return false;">${n.ic?ic(n.ic):'<span class="sub-dot"></span>'}<span>${T(n.t)}</span>${n.badge?`<span class="badge">${n.badge}</span>`:c?`<span class="badge alert">${fmt(c)}</span>`:n.isNew?`<span class="new">${L('جديد','New')}</span>`:''}</a>`}
function renderSide(){
 const navHtml=NAV.map(n=>{if(n.g) return `<div class="nav-group">${T(n.g)}</div>`;
  if(n.sub){const inside=n.sub.some(x=>x.id===S.page), open=S.open[n.id]||inside;
   return `<button class="nav-parent ${inside?'inside':''}" aria-expanded="${open}" onclick="toggleSub('${n.id}')">${ic(n.ic)}<span>${T(n.t)}</span>${ic('expand_more','chev')}</button>${open?`<div class="nav-sub">${n.sub.map(x=>navLink(x,'sub')).join('')}</div>`:''}`}
  return navLink(n)}).join('');
 document.getElementById('side').innerHTML=`<div class="brand"><div class="brand-mark">${ic('exercise')}</div><div><div class="brand-name" dir="ltr" style="text-align:start">Smart Fitness<br>&amp; Nutrition</div><div class="brand-sub">${L('منصة الصالات الرياضية','Gym management platform')}</div></div></div>
 <nav class="nav" aria-label="main">${navHtml}</nav>
 <div class="side-foot"><div class="cap"><div class="cap-row"><span>${L('سعة الصالة الآن','Gym capacity now')}</span><b>78%</b></div><div class="bar"><i style="width:78%"></i></div></div>
 <div class="cap"><div class="cap-row" style="margin:0"><span>${L('مزامنة الأجهزة','Device sync')}</span><span class="small"><span class="dot"></span> ${L('متصل','Online')}</span></div></div>
 <div class="side-links"><button>${ic('help_outline')}${L('المساعدة','Help')}</button><button>${ic('logout')}${L('خروج','Log out')}</button></div></div>`;
}
function toggleSub(id){const inside=NAV.find(n=>n.id===id).sub.some(x=>x.id===S.page);S.open[id]=!(S.open[id]||inside);if(inside&&!S.open[id])S.open[id]=false;renderSide()}
// ===== الشريط اللي فوق: زرار ☰ للموبايل، البحث، اللغة، المظهر، الإشعارات، المستخدم =====
function renderTop(){
 const th=document.documentElement.getAttribute('data-theme');
 document.getElementById('top').innerHTML=`<button class="icon-btn menu-btn" onclick="toggleNav(true)" aria-label="${L('القائمة','Menu')}">${ic('menu')}</button>
 <label class="search">${ic('search')}<input placeholder="${L('ابحث عن متدرب أو خطة أو مدرب','Search trainees, plans or coaches')}"></label>
 <div class="top-actions"><button class="lang-btn" onclick="toggleLang()" aria-label="${L('تغيير اللغة','Change language')}">${ic('translate')}${S.lang==='ar'?'EN':'ع'}</button>
 <button class="icon-btn" onclick="toggleTheme()" aria-label="${L('تغيير المظهر','Toggle theme')}">${ic(th==='dark'?'light_mode':'dark_mode')}</button>
 <button class="icon-btn" aria-label="${L('الإشعارات','Notifications')}">${ic('notifications')}<span class="pip"></span></button>
 <div class="user"><span class="avatar">${initials(T(USER.name).replace(/^(كابتن|Coach) /,''))}</span><div class="user-txt"><div class="user-name">${T(USER.name)}</div><div class="user-role">${T(USER.role)}</div></div></div></div>`;
}
// ===== رسم الصفحة الحالية =====
// try/catch: لو حصل أي خطأ وإحنا بنرسم، بنعرض حالة Error بدل ما الصفحة تبقى بيضا
function render(keepScroll){
 killCharts(); const el=document.getElementById('content');
 try{ el.innerHTML=(P[S.page]||P.dashboard)(); if(S.page==='calories') calcResult(); }
 catch(err){ console.error(err); el.innerHTML=`<div class="card error">${ic('error')}<b>${L('حصلت مشكلة في تحميل الصفحة','This page failed to load')}</b><p>${L('اعمل تحديث للصفحة، ولو المشكلة استمرت كلم الدعم الفني.','Reload the page; if it keeps happening, contact support.')}</p>${btn('refresh',L('إعادة التحميل','Reload'),'primary sm','render()')}</div>`; }
 if(!keepScroll) window.scrollTo(0,0);
}
// go('dashboard') بتنقلك لصفحة من الكود
function go(id){
 // بنفتح الصفحة مباشرة من غير ما نعتمد على تغيير اللينك، عشان تشتغل في أي مكان (حتى جوه معاينة الملفات)
 try{ if(location.hash!=='#'+id) history.pushState(null,'','#'+id) }catch(e){}
 openPage(id);
}
// ===== الـ Router =====
// 1) يقرا الـ hash (مثلاً #trainees) ولو مش موجود يفتح dashboard
// 2) يعرض الـ skeleton (Loading)
// 3) بعد 450ms يرسم الصفحة الحقيقية
function route(){ openPage((location.hash||'#dashboard').slice(1)) }
function openPage(id){
 if(id==='reports')id='reports-staff'; const _p=id.split('/'); S.route=_p.slice(1); S.page=P[_p[0]]?_p[0]:'dashboard';
 renderSide(); closeModal(); killCharts();
 document.getElementById('content').innerHTML=skeleton(); window.scrollTo(0,0);
 clearTimeout(route.t); route.t=setTimeout(()=>render(),450);
}
// ===== اللغة =====
// applyLang بتغيّر lang و dir للصفحة كلها: rtl للعربي، ltr للإنجليزي
// toggleLang بتبدّل اللغة، تحفظها في المتصفح، وترسم كل حاجة من جديد
function applyLang(){document.documentElement.lang=S.lang;document.documentElement.dir=S.lang==='ar'?'rtl':'ltr';document.title='Smart Fitness & Nutrition'}
function toggleLang(){S.lang=S.lang==='ar'?'en':'ar';try{localStorage.setItem('sfn-lang',S.lang)}catch(e){};applyLang();renderSide();renderTop();render(true)}
// زرار المظهر: بيحط data-theme="dark" أو "light" والـ CSS بيغيّر الألوان لوحده
function toggleTheme(){const r=document.documentElement;const cur=r.getAttribute('data-theme')||'light';r.setAttribute('data-theme',cur==='light'?'dark':'light');try{localStorage.setItem('sfn-theme2',r.getAttribute('data-theme'))}catch(e){};renderTop();render(true)}
// فتح وقفل الـ sidebar على الموبايل
function toggleNav(open){document.body.classList.toggle('nav-open',open)}

// ===== Handlers =====
// كلهم نفس الفكرة: غيّر قيمة في S، وبعدين render(true)
// (true معناها متطلعش لأول الصفحة). refocus بترجّع المؤشر لخانة البحث بعد الرسم
function refocus(id){const i=document.getElementById(id);if(i){i.focus();i.setSelectionRange(i.value.length,i.value.length)}}
// ===== Handlers الجداول (listView) =====
// lsTab = غيّر الـ tab، lsQ = البحث، lsF = فلتر، lsP = رقم الصفحة، lsView = جدول/كروت
// lsAdv = افتح/اقفل البحث المتقدم، lsClear = امسح كل الفلاتر، lsOpen = زرار "عرض" (العين)
function lsTab(k,v){const s=LS(k);s.tab=v;s.p=1;render(true)}
function lsQ(k,v){const s=LS(k);s.q=v;s.p=1;render(true);refocus('q-'+k)}
function lsF(k,f,v){const s=LS(k);s.f[f]=v;s.p=1;render(true)}
function lsP(k,p){LS(k).p=p;render(true);const el=document.getElementById('q-'+k);if(el&&el.closest('.card').scrollIntoView)el.closest('.card').scrollIntoView({block:'start',behavior:'smooth'})}
function lsView(k,v){LS(k).view=v;render(true)}
function lsAdv(k){const s=LS(k);s.adv=!s.adv;render(true)}
function lsClear(k){const s=LS(k);s.q='';s.f={};s.p=1;render(true)}
function lsOpen(k,id){const c=LISTS[k];if(!c||!c.detail)return;const r=c.rows.find(x=>x.id===id);if(r)openModal(c.detail(r))}
// رسالة صغيرة بتظهر تحت وتختفي (toast)
function toast(msg){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.setAttribute('role','status');document.body.appendChild(t)}t.innerHTML=ic('check_circle')+msg;t.className='show';clearTimeout(toast.t);toast.t=setTimeout(()=>t.className='',2600)}
function hideBanner(k){S.hidden[k]=1;render(true)}
function setCalc(k,v,rerender){S.calc[k]=v;if(rerender)render(true);else calcResult()}
// زرار Esc يقفل نافذة الوصفة أو القايمة
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeModal();toggleNav(false)}});

// ===== Init: أول حاجة بتشتغل لما الصفحة تفتح =====
// ترجّع المظهر المحفوظ، تظبط اللغة، ترسم الشريط اللي فوق،
// تسمع لأي تغيير في اللينك (hashchange)، وتفتح أول صفحة
try{const t=localStorage.getItem('sfn-theme2');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}
applyLang(); renderTop(); window.addEventListener('hashchange',route); window.addEventListener('popstate',route); route();
