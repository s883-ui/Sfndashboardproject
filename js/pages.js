/* =====================================================================
   pages.js — الصفحات نفسها
   ---------------------------------------------------------------------
   P = object فيه كل الصفحات. كل صفحة function بترجّع الـ HTML بتاعها.
   الاسم بعد P. لازم يبقى نفس الـ id اللي في القايمة (NAV في app.js)
   معظم الجداول بتستخدم listView (في components.js) اللي بيعمل:
   البحث، والـ tabs، والفلاتر، والبحث المتقدم، والـ pagination، وعمود المعرف، وأزرار الإجراءات.
   ===================================================================== */
const P={};
const sOpts=list=>list.map(s=>[s.id,T(s.name)]);
const H=(...a)=>L(...a);                          // اختصار
const daysLeft=n=>n<0?`<span style="color:var(--danger)">${L(`منتهي منذ ${fmt(-n)} يوم`,`Expired ${-n} d ago`)}</span>`:`<span style="${n<=10?'color:var(--warn)':''}">${L(`متبقي ${fmt(n)} يوم`,`${n} days left`)}</span>`;
const sChip=(map,k)=>`<span class="chip ${map[k][0]}">${T(map[k][1])}</span>`;

/* ---------- المتدربين: البحث والفلاتر والعرض (بنستخدمهم في لوحة التحكم وصفحة المتدربين) ---------- */
const trText=t=>[t.id,t.name.ar,t.name.en,t.goal.ar,t.goal.en,t.plan].join(' ');
function trFilters(only){const all=[
 {k:'coach',icon:'sports',label:L('المدرب','Coach'),opts:sOpts(TRAINERS),test:(r,v)=>r.coach===v},
 {k:'goal',icon:'flag',label:L('الهدف','Goal'),opts:GOALS.map(g=>[g.k,T(g)]),test:(r,v)=>r.goal.k===v},
 {k:'pkg',icon:'card_membership',label:L('الباقة','Package'),opts:PKGS.map(p=>[p.k,T(p)]),test:(r,v)=>r.pkg.k===v,adv:1},
 {k:'adh',icon:'speed',label:L('الالتزام','Adherence'),opts:[['90',L('90% فأكثر','90%+')],['75',L('75% فأكثر','75%+')],['lt50',L('أقل من 50%','Below 50%')]],test:(r,v)=>v==='lt50'?r.adh<50:r.adh>=+v,adv:1},
 {k:'left',icon:'event',label:L('مدة الاشتراك','Membership'),opts:[['7',L('ينتهي خلال 7 أيام','Ends within 7 days')],['30',L('ينتهي خلال 30 يوم','Ends within 30 days')],['exp',L('منتهي','Expired')]],test:(r,v)=>v==='exp'?r.left<0:r.left>=0&&r.left<=+v,adv:1},
 {k:'nut',icon:'nutrition',label:L('أخصائي التغذية','Nutritionist'),opts:sOpts(NUTS),test:(r,v)=>r.nut===v,adv:1},
 {k:'branch',icon:'location_on',label:L('الفرع','Branch'),opts:BRANCHES.map(b=>[b.k,T(b)]),test:(r,v)=>r.branch.k===v,adv:1},
 {k:'gender',icon:'wc',label:L('النوع','Gender'),opts:[['m',L('ذكر','Male')],['f',L('أنثى','Female')]],test:(r,v)=>r.gender===v,adv:1}];
 return only?all.filter(f=>only.includes(f.k)):all}
function trDetail(t){const c=staffOf(t.coach),n=staffOf(t.nut);
 return modalHead(T(t.name),`${idCell(t.id)} ${chip(t.status)}`)+dl([[L('الهدف','Goal'),T(t.goal)],[L('المدرب','Coach'),T(c.name)],[L('أخصائي التغذية','Nutritionist'),T(n.name)],[L('الخطة الغذائية','Diet plan'),`<span dir="ltr">${t.plan}</span>`],[L('الباقة','Package'),T(t.pkg)],[L('الاشتراك','Membership'),daysLeft(t.left)],[L('الفرع','Branch'),T(t.branch)],[L('السن','Age'),fmt(t.age)]])+
 `<h4>${L('نسبة الالتزام','Adherence')}</h4>${adhBar(t.adh)}<h4>${L('آخر نشاط','Last activity')}</h4><p class="muted" style="margin:0">${T(t.last)}</p>
 <div class="actions" style="margin-top:18px">${btn('edit_note',L('تعديل الخطة','Edit plan'),'primary sm')}${btn('forum',L('عرض المحادثات','View chats'),'sm',`closeModal();go('chats')`)}</div>`}

/* ===================== 1) لوحة التحكم ===================== */
P.dashboard=()=>{
 const days=S.lang==='ar'?['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة']:['Sat','Sun','Mon','Tue','Wed','Thu','Fri'];
 setTimeout(()=>{
  const o=baseOpts();o.scales.x.stacked=true;o.scales.y.stacked=true;
  mk('weekChart',{type:'bar',data:{labels:days,datasets:[
   {label:L('تمارين القوة','Strength'),data:[52,61,58,70,74,66,48],backgroundColor:PAL()[0],borderRadius:6,maxBarThickness:34},
   {label:L('التغذية والماكروز','Nutrition'),data:[40,45,43,52,55,50,38],backgroundColor:PAL()[1],borderRadius:6,maxBarThickness:34},
   {label:L('الكارديو','Cardio'),data:[22,25,24,30,31,28,20],backgroundColor:PAL()[2],borderRadius:6,maxBarThickness:34}]},options:o});
  const g=baseOpts();delete g.scales;g.cutout='72%';
  mk('goalChart',{type:'doughnut',data:{labels:[L('خسارة دهون','Fat loss'),L('زيادة عضل','Muscle gain'),L('لياقة وتأهيل','Fitness & rehab'),L('تغذية علاجية','Therapeutic')],datasets:[{data:[48,32,14,6],backgroundColor:PAL(),borderWidth:0}]},options:g});
 });
 const goals=[[L('خسارة دهون وبناء عضل','Fat loss & muscle'),48],[L('زيادة الكتلة العضلية','Muscle gain'),32],[L('لياقة وتأهيل حركي','Fitness & rehab'),14],[L('تغذية علاجية','Therapeutic nutrition'),6]];
 return head([L('الرئيسية','Home'),L('لوحة التحكم','Dashboard')],L('نظرة عامة على الصالة','Gym overview'),L('متابعة المتدربين والالتزام بالخطط الغذائية والتدريب اليومي.','Track trainees, diet adherence and today\'s training activity.'),
   btn('download',L('تصدير التقرير','Export report')))+
 `<div class="grid g4 mb">
  ${kpi({hero:1,label:L('المشتركين النشطين','Active members'),icon:'how_to_reg',val:fmt(1842),trend:'+12.4%',foot:L('هذا الشهر، 142 تسجيل جديد','this month, 142 new sign-ups')})}
  ${kpi({label:L('الالتزام بالخطط الغذائية','Diet plan adherence'),icon:'restaurant',val:'89.2%',trend:'+3.8%',foot:L('1,240 وجبة مسجلة اليوم','1,240 meals logged today')})}
  ${kpi({label:L('الجلسات المكتملة اليوم','Sessions completed today'),icon:'fitness_center',val:fmt(428),unit:'/ '+fmt(450),foot:L('95% من المستهدف','95% of today\'s target')})}
  ${kpi({label:L('تنبيهات المتابعة','Follow-up alerts'),icon:'warning',val:fmt(14),unit:L('حالة','cases'),down:1,trend:L('مراجعة خلال 24 ساعة','review within 24h')})}
 </div>
 ${aiBanner('dash',L('توصية اليوم','Today\'s recommendation'),L('استجابة المشتركين لخطط التنشيف منخفضة الكارب تحسنت <b>18%</b> في آخر 14 يوم. يُفضّل تطبيق التعديل التلقائي على <b>28 مشترك</b> لتجنب ثبات الوزن.','Response to low-carb cutting plans improved by <b>18%</b> over the last 14 days. Apply the automatic adjustment to <b>28 members</b> to avoid a weight plateau.'),L('مراجعة التوصيات (28)','Review suggestions (28)'))}
 <div class="grid g-main mb">
  <div class="card"><div class="card-head"><div><h2>${L('النشاط والالتزام الأسبوعي','Weekly activity & adherence')}</h2><div class="sub">${L('الجلسات المنجزة حسب نوع النشاط','Completed sessions by activity type')}</div></div></div>
   <div class="legend mb"><span><i style="background:var(--lime)"></i>${L('تمارين القوة','Strength')} 45%</span><span><i style="background:var(--lime40)"></i>${L('التغذية والماكروز','Nutrition')} 35%</span><span><i style="background:var(--muted)"></i>${L('الكارديو','Cardio')} 20%</span></div>
   <div class="chart-box"><canvas id="weekChart" aria-label="weekly chart"></canvas></div>
   <div class="note">${ic('verified')}${L('أعلى التزام كان يوم الأربعاء بنسبة 94.2%.','Wednesday had the highest adherence at 94.2%.')}</div></div>
  <div class="card"><div class="card-head"><div><h2>${L('توزيع الأهداف','Goals breakdown')}</h2><div class="sub">${L('تصنيف المشتركين حسب الهدف','Members by goal')}</div></div></div>
   <div class="chart-box sm"><canvas id="goalChart" aria-label="goals chart"></canvas></div>
   <div class="goal-list">${goals.map((g,i)=>`<div class="goal-row"><span class="dot" style="background:${['var(--lime)','var(--lime40)','var(--muted)','var(--border)'][i]}"></span>${g[0]}<b>${g[1]}%</b></div>`).join('')}</div>
   <div class="stat-pair"><div><b>${L('6.4 شهور','6.4 mo')}</b><span>${L('متوسط مدة الاشتراك','Avg. membership length')}</span></div><div><b>82%</b><span>${L('نسبة الاستبقاء','Retention')}</span></div></div></div>
 </div>
 ${listView({key:'dash',title:L('أحدث تفاعلات المتدربين','Latest trainee activity'),sub:L('الأكثر نشاطاً أو اللي محتاجين تدخل المدرب','Most active, or needing a coach to step in'),
  rows:TRAINEES,per:5,text:trText,placeholder:L('ابحث بالاسم أو الرقم التعريفي (#SF-...)','Search name or ID (#SF-...)'),unit:['متدرب','trainees'],
  tabs:[['all',L('الكل','All')],['follow',L('يحتاج متابعة','Needs follow-up'),t=>t.status==='follow'],['upd',L('برامج محدثة','Updated plans'),t=>t.upd],['exp',L('قريب الانتهاء','Expiring soon'),t=>t.left>=0&&t.left<=10]],
  filters:trFilters(['coach','pkg','adh','branch','nut']),detail:trDetail,
  columns:[idCol(),{h:L('المشترك','Member'),cell:t=>person(T(t.name),T(t.goal))},{h:L('المدرب','Coach'),cell:t=>`<span class="small">${T(staffOf(t.coach).name)}</span>`},
   {h:L('الخطة الغذائية','Diet plan'),cell:t=>`<span class="small" dir="ltr">${t.plan}</span>`},{h:L('الالتزام','Adherence'),cell:t=>adhBar(t.adh)},{h:L('الحالة','Status'),cell:t=>chip(t.status)},{h:L('آخر نشاط','Last activity'),cell:t=>`<span class="small muted">${T(t.last)}</span>`}]})}`;
};

/* ===================== 2) المتدربين ===================== */
P.trainees=()=>{const c=k=>TRAINEES.filter(t=>t.status===k).length;
 return head([L('الرئيسية','Home'),L('المتدربين','Trainees')],L('سجل المتدربين','Trainee records'),L('متابعة المؤشرات الصحية ونسب الالتزام وإدارة اشتراكات المتدربين.','Monitor health indicators, adherence and trainee memberships.'),
  btn('checklist',L('إجراءات جماعية','Bulk actions'),'ghost')+btn('download',L('تصدير البيانات','Export data'))+btn('person_add',L('إضافة متدرب','Add trainee'),'primary'))+
 `<div class="grid g4 mb">${kpi({hero:1,label:L('النشطين حالياً','Currently active'),icon:'groups',val:fmt(1842),trend:'+12.4%',foot:L('هذا الشهر','this month')})}
  ${kpi({label:L('عضويات تنتهي خلال 7 أيام','Memberships ending in 7 days'),icon:'event_repeat',val:fmt(28),foot:L('تحتاج تذكير واتساب','need a WhatsApp reminder')})}
  ${kpi({label:L('حالات تحتاج تدخل','Cases needing action'),icon:'assignment_late',val:fmt(c('follow')),down:1,trend:L('انخفاض التزام حاد','sharp adherence drop')})}
  ${kpi({label:L('متوسط الالتزام العام','Average adherence'),icon:'speed',val:'84.6%',trend:L('معدل ممتاز','excellent')})}</div>
 ${aiBanner('tr',L('تحليل سلوك المتدربين','Trainee behaviour insight'),L('التزام متدربي <b>باقة القوة المسائية</b> نزل 11% في الويك إند. يُقترح إرسال رسائل تشجيعية وتعديل مواعيد التذكير.','Adherence in the <b>evening strength group</b> dropped 11% over the weekend. Send encouragement messages and adjust reminder times.'),L('تطبيق الإجراء','Apply action'))}
 ${listView({key:'trainees',rows:TRAINEES,per:8,text:trText,placeholder:L('ابحث بالاسم، الهدف، أو الرقم التعريفي (#SF-...)','Search by name, goal or ID (#SF-...)'),unit:['متدرب','trainees'],
  tabs:[['all',L('الكل','All')],...Object.keys(STATUS).map(k=>[k,T(STATUS[k][1]),t=>t.status===k])],filters:trFilters(),detail:trDetail,
  columns:[idCol(),{h:L('المتدرب','Trainee'),cell:t=>person(T(t.name),`${t.gender==='f'?L('أنثى','Female'):L('ذكر','Male')} • ${fmt(t.age)} ${L('سنة','y')}`)},{h:L('الحالة','Status'),cell:t=>chip(t.status)},
   {h:L('الهدف والخطة','Goal & plan'),cell:t=>`<b class="small">${T(t.goal)}</b><div class="small muted" dir="ltr" style="text-align:start">${t.plan}</div>`},{h:L('المدرب','Coach'),cell:t=>`<span class="small">${T(staffOf(t.coach).name)}</span>`},
   {h:L('الالتزام','Adherence'),cell:t=>adhBar(t.adh)},{h:L('آخر نشاط','Last activity'),cell:t=>`<span class="small muted">${T(t.last)}</span>`},{h:L('الباقة','Package'),cell:t=>`<b class="small">${T(t.pkg)}</b><div class="small">${daysLeft(t.left)}</div>`}],
  card:t=>`<div class="card pcard"><div class="pcard-top">${idCell(t.id)}${chip(t.status)}</div>${person(T(t.name),T(t.goal))}<div class="small muted">${T(staffOf(t.coach).name)} • ${T(t.pkg)}</div>${adhBar(t.adh)}<div class="small muted">${T(t.last)}</div><div class="pcard-foot"><span class="small">${daysLeft(t.left)}</span>${rowActions('trainees',t.id)}</div></div>`})}`;
};

/* ===================== 3) البرامج التدريبية (زي الصورة 8) ===================== */
function progDetail(p){const c=progCat(p.cat);return modalHead(T(p.name),`${idCell(p.id)} <span class="chip ok">${T(c[1])}</span>`)+`<p class="muted">${T(p.desc)}</p>`+
 dl([[L('المستوى','Level'),T(LVL[p.lvl])],[L('الجدول','Schedule'),L(`${p.days} أيام/أسبوع • ${p.weeks} أسبوع`,`${p.days} days/wk • ${p.weeks} weeks`)],[L('المدرب المسؤول','Coach'),T(staffOf(p.coach).name)],[L('المتدربين','Trainees'),fmt(p.members)],[L('الالتزام','Adherence'),p.adh+'%']])+`<div class="actions" style="margin-top:18px">${btn('person_add',L('تعيين لمتدرب','Assign'),'primary sm')}${btn('content_copy',L('نسخ البرنامج','Duplicate'),'sm')}</div>`}
P.programs=()=>head([L('الرئيسية','Home'),L('التدريب','Training'),L('الخطط والبرامج التدريبية','Training programs')],L('مكتبة البرامج والخطط التدريبية','Training program library'),L('تصميم وإدارة البرامج الرياضية، متابعة توزيع التمارين، وتخصيص الجداول للمشتركين والمدربين.','Design and manage programs, track exercise distribution and assign schedules.'),
  btn('neurology',L('توليد خطة مخصصة بالذكاء الاصطناعي','Generate with AI'),'ghost')+btn('fitness_center',L('مكتبة التمارين المعتمدة (450+)','Exercise library (450+)'))+btn('add',L('إنشاء برنامج تدريبي جديد','New program'),'primary'))+
 `<div class="grid g4 mb">${kpi({label:L('إجمالي البرامج النشطة','Active programs'),icon:'inventory_2',val:fmt(64),unit:L('برنامج','programs'),trend:'+6',foot:L('معدلة ومضافة هذا الشهر','added this month')})}
  ${kpi({label:L('المتدربون المسجلون بالخطط','Enrolled trainees'),icon:'groups',val:fmt(1720),unit:L('مشترك','members'),foot:L('93.4% من إجمالي النشطين','93.4% of active members')})}
  ${kpi({hero:1,label:L('معدل إتمام التمارين الأسبوعي','Weekly completion'),icon:'check_circle',val:'87.8%',trend:L('أداء ممتاز','excellent')})}
  ${kpi({label:L('برامج تتطلب تحديث أو مراجعة','Programs to review'),icon:'priority_high',val:fmt(5),down:1,trend:L('تجاوزت 90 يوماً','over 90 days old')})}</div>
 ${aiBanner('prog',L('محلل الأحمال التدريبية التلقائي','Automatic training load analyzer'),L('رصد المحلل ارتفاعاً في مؤشر الإجهاد العضلي لدى <b>18 متدرباً</b> في برنامج القوة البدنية بنسبة إجهاد <b>79%</b>. يُنصح بأسبوع استشفاء تخفيفي (Deload Week) لتجنب الإصابات.','The analyzer flagged high muscle fatigue for <b>18 trainees</b> in the strength program (<b>79%</b>). A deload week is recommended to prevent injuries.'),L('تطبيق أسبوع الاستشفاء (Deload)','Apply deload week'))}
 ${listView({key:'prog',view:'grid',rows:PROGRAMS,per:6,text:p=>[p.id,p.name.ar,p.name.en,p.desc.ar,p.desc.en].join(' '),placeholder:L('البحث باسم البرنامج، الهدف، أو الكود الرياضي (#PRG-...)','Search program, goal or code (#PRG-...)'),unit:['برنامج','programs'],
  tabs:[['all',L('جميع البرامج','All programs')],...PROG_CATS.map(([k,t])=>[k,T(t),p=>p.cat===k])],detail:progDetail,
  filters:[{k:'lvl',icon:'speed',label:L('مستوى الصعوبة','Difficulty'),opts:Object.keys(LVL).map(k=>[k,T(LVL[k])]),test:(r,v)=>r.lvl===v},
   {k:'days',icon:'calendar_month',label:L('أيام التدريب','Training days'),opts:[[3,L('3 أيام','3 days')],[4,L('4 أيام','4 days')],[5,L('5 أيام','5 days')]],test:(r,v)=>r.days===+v},
   {k:'coach',icon:'sports',label:L('المدرب المسؤول','Coach'),opts:sOpts(TRAINERS),test:(r,v)=>r.coach===v},
   {k:'weeks',icon:'date_range',label:L('مدة البرنامج','Duration'),opts:[['6',L('6 أسابيع أو أقل','6 weeks or less')],['10',L('7 - 10 أسابيع','7–10 weeks')],['11',L('أكتر من 10 أسابيع','Over 10 weeks')]],test:(r,v)=>v==='6'?r.weeks<=6:v==='10'?r.weeks>6&&r.weeks<=10:r.weeks>10,adv:1},
   {k:'mem',icon:'groups',label:L('عدد المتدربين','Trainees'),opts:[['200',L('200 فأكثر','200+')],['100',L('100 فأكثر','100+')],['lt100',L('أقل من 100','Under 100')]],test:(r,v)=>v==='lt100'?r.members<100:r.members>=+v,adv:1},
   {k:'adh',icon:'speed',label:L('الالتزام','Adherence'),opts:[['90',L('90% فأكثر','90%+')],['85',L('85% فأكثر','85%+')]],test:(r,v)=>r.adh>=+v,adv:1}],
  columns:[idCol(),{h:L('البرنامج','Program'),cell:p=>`<b class="small">${T(p.name)}</b><div class="small muted">${T(progCat(p.cat)[1])}</div>`},{h:L('المستوى','Level'),cell:p=>`<span class="chip">${T(LVL[p.lvl])}</span>`},
   {h:L('الجدول','Schedule'),cell:p=>`<span class="small">${L(`${p.days} أيام • ${p.weeks} أسبوع`,`${p.days} d/wk • ${p.weeks} wk`)}</span>`},{h:L('المدرب','Coach'),cell:p=>`<span class="small">${T(staffOf(p.coach).name)}</span>`},
   {h:L('المتدربين','Trainees'),cell:p=>fmt(p.members)},{h:L('الالتزام','Adherence'),cell:p=>adhBar(p.adh)}],
  card:p=>{const c=progCat(p.cat);return `<article class="card pcard2"><div class="p-hero cat-${p.cat} ${p.img?'has-img':''}">${p.img?`<img src="${p.img}" alt="${esc(T(p.name))}">`:''}<span class="chip hero-chip">${T(c[1])}</span><span class="idc on-dark">#${p.id}</span>${p.img?'':`<span class="ms hero-ic" aria-hidden="true">${c[2]}</span>`}
   <div class="hero-foot"><span class="chip dark">${ic('calendar_month')}${L(`${p.days} أيام / أسبوع • ${p.weeks} أسابيع`,`${p.days} d/wk • ${p.weeks} wk`)}</span><span class="chip dark">${ic('speed')}${T(LVL[p.lvl])}</span></div></div>
   <div class="r-body"><h3>${T(p.name)}</h3><p class="small muted" style="margin:0">${T(p.desc)}</p><div class="small muted">${ic('person')} ${T(staffOf(p.coach).name)}</div>
   <div class="mini-stats"><div><b>${fmt(p.members)}</b>${L('متدرب','trainees')}</div><div><b>${p.adh}%</b>${L('الالتزام','adherence')}</div></div>
   <div class="pcard-foot">${btn('person_add',L('تعيين لمتدرب','Assign'),'sm')}${rowActions('prog',p.id)}</div></div></article>`}})}`;

/* ===================== 4) الأنظمة الغذائية ===================== */
const dietCat=k=>DIET_CATS.find(c=>c[0]===k);
const macroBar=p=>{const tot=p.p*4+p.c*4+p.f*9,pp=Math.round(p.p*400/tot),pc=Math.round(p.c*400/tot);return `<div class="macro-bar"><i style="width:${pp}%;background:var(--lime)"></i><i style="width:${pc}%;background:var(--lime40)"></i><i style="width:${100-pp-pc}%;background:var(--muted)"></i></div>`};
function dietDetail(p){return modalHead(T(p.name),`${idCell(p.id)} <span class="chip ok">${T(dietCat(p.cat)[1])}</span>`)+`<div class="big-num" style="font-size:36px">${fmt(p.kcal)} <span class="small muted">${L('سعرة / يوم','kcal / day')}</span></div><div style="margin:12px 0">${macroBar(p)}</div>`+
 dl([[L('بروتين','Protein'),p.p+L(' جم',' g')],[L('كارب','Carbs'),p.c+L(' جم',' g')],[L('دهون','Fat'),p.f+L(' جم',' g')],[L('عدد الوجبات','Meals'),fmt(p.meals)],[L('الأخصائي','Nutritionist'),T(staffOf(p.by).name)],[L('المشتركين','Members'),fmt(p.members)]])+`<div class="actions" style="margin-top:18px">${btn('person_add',L('تعيين لمتدرب','Assign'),'primary sm')}</div>`}
P.nutrition=()=>head([L('الرئيسية','Home'),L('التغذية','Nutrition'),L('الأنظمة الغذائية','Diet plans')],L('مكتبة الأنظمة الغذائية','Diet plan library'),L('إدارة الأنظمة الغذائية وضبط توزيع الماكروز والسعرات لكل متدرب.','Manage diet plans and fine-tune macros and calories for each trainee.'),
  btn('menu_book',L('قاعدة الأغذية (2,400+)','Food database (2,400+)'),'ghost')+btn('auto_awesome',L('خطة ماكروز بالـ AI','AI macro plan'))+btn('add',L('نظام غذائي جديد','New diet plan'),'primary'))+
 `<div class="grid g4 mb">${kpi({hero:1,label:L('الأنظمة النشطة','Active diet plans'),icon:'restaurant_menu',val:fmt(48),trend:'+4',foot:L('هذا الشهر','this month')})}
  ${kpi({label:L('الملتزمين بالحميات','Trainees on diets'),icon:'verified',val:fmt(1590),trend:'86.3%',foot:L('نسبة الالتزام','adherence')})}
  ${kpi({label:L('متوسط العجز اليومي','Avg. daily deficit'),icon:'local_fire_department',val:'-420',unit:'kcal',foot:L('ضمن النطاق الآمن','within the safe range')})}
  ${kpi({label:L('تنبيهات حساسية','Allergy alerts'),icon:'warning',val:fmt(8),down:1,trend:L('جلوتين / لاكتوز','gluten / lactose')})}</div>
 ${aiBanner('nut',L('تنبيه ثبات الوزن','Weight plateau alert'),L('<b>23 متدرب</b> على تدوير الكارب وزنهم ثابت أكتر من أسبوعين. يُقترح يوم Refeed أو تعديل الماكروز 5%.','<b>23 trainees</b> on carb cycling have plateaued for over two weeks. Schedule a refeed day or adjust macros by 5%.'),L('مراجعة المقترحات (23)','Review suggestions (23)'))}
 ${listView({key:'diets',view:'grid',rows:DIETS,per:6,text:p=>[p.id,p.name.ar,p.name.en].join(' '),placeholder:L('ابحث باسم النظام أو الرقم التعريفي (#NUT-...)','Search plan name or ID (#NUT-...)'),unit:['نظام','plans'],
  tabs:[['all',L('كل الأنظمة','All plans')],...DIET_CATS.map(([k,t])=>[k,T(t),p=>p.cat===k])],detail:dietDetail,
  filters:[{k:'kcal',icon:'local_fire_department',label:L('السعرات','Calories'),opts:[['lo',L('أقل من 1,900','Under 1,900')],['mid',L('1,900 - 2,300','1,900–2,300')],['hi',L('أكتر من 2,300','Over 2,300')]],test:(r,v)=>v==='lo'?r.kcal<1900:v==='mid'?r.kcal>=1900&&r.kcal<=2300:r.kcal>2300},
   {k:'meals',icon:'restaurant',label:L('الوجبات','Meals'),opts:[[3,L('3 وجبات','3 meals')],[4,L('4 وجبات','4 meals')],[5,L('5 وجبات','5 meals')]],test:(r,v)=>r.meals===+v},
   {k:'by',icon:'nutrition',label:L('الأخصائي','Nutritionist'),opts:sOpts(NUTS),test:(r,v)=>r.by===v},
   {k:'p',icon:'egg',label:L('البروتين','Protein'),opts:[['170',L('170 جم فأكثر','170 g+')],['150',L('150 جم فأكثر','150 g+')]],test:(r,v)=>r.p>=+v,adv:1},
   {k:'c',icon:'grain',label:L('الكارب','Carbs'),opts:[['low',L('منخفض (أقل من 100 جم)','Low (under 100 g)')],['high',L('عالي (300 جم فأكثر)','High (300 g+)')]],test:(r,v)=>v==='low'?r.c<100:r.c>=300,adv:1},
   {k:'adh',icon:'speed',label:L('الالتزام','Adherence'),opts:[['90',L('90% فأكثر','90%+')],['85',L('85% فأكثر','85%+')]],test:(r,v)=>r.adh>=+v,adv:1}],
  columns:[idCol(),{h:L('النظام','Plan'),cell:p=>`<b class="small">${T(p.name)}</b><div class="small muted">${T(dietCat(p.cat)[1])}</div>`},{h:L('السعرات','Calories'),cell:p=>`<b>${fmt(p.kcal)}</b> <span class="small muted">kcal</span>`},
   {h:L('الماكروز (ب/ك/د)','Macros (P/C/F)'),cell:p=>`<span class="small" dir="ltr">${p.p} / ${p.c} / ${p.f} g</span>`},{h:L('الوجبات','Meals'),cell:p=>fmt(p.meals)},{h:L('الأخصائي','Nutritionist'),cell:p=>`<span class="small">${T(staffOf(p.by).name)}</span>`},{h:L('الالتزام','Adherence'),cell:p=>adhBar(p.adh)}],
  card:p=>`<div class="card pcard"><div class="pcard-top">${idCell(p.id)}<span class="chip ok">${T(dietCat(p.cat)[1])}</span></div>
   <h3>${T(p.name)}</h3><div><span class="kpi-val" style="font-size:26px">${fmt(p.kcal)}</span> <span class="muted small">${L('سعرة / يوم','kcal / day')}</span></div>${macroBar(p)}
   <div class="legend"><span><i style="background:var(--lime)"></i>${L('بروتين','Protein')} ${p.p}${L('جم','g')}</span><span><i style="background:var(--lime40)"></i>${L('كارب','Carbs')} ${p.c}${L('جم','g')}</span><span><i style="background:var(--muted)"></i>${L('دهون','Fat')} ${p.f}${L('جم','g')}</span></div>
   <div class="small muted">${ic('verified_user')} ${T(staffOf(p.by).name)} • ${L(`${p.meals} وجبات`,`${p.meals} meals`)}</div>
   <div class="pcard-foot"><span class="small">${fmt(p.members)} ${L('مشترك','members')} • <b style="color:var(--accent-text)">${p.adh}%</b></span>${rowActions('diets',p.id)}</div></div>`})}`;
// ===================== 5) حاسبة السعرات (جديدة) =====================
// الصفحة فيها الفورم بس، والنتيجة بتترسم في calcResult() تحت
// عشان لما المستخدم يكتب رقم نحدّث النتيجة من غير ما نرسم الفورم من جديد (فالكتابة متقطعش)
P.calories=()=>{
 const c=S.calc;
 return head([L('الرئيسية','Home'),L('التغذية','Nutrition'),L('حاسبة السعرات','Calorie calculator')],L('حاسبة السعرات والماكروز','Calorie & macro calculator'),L('احسب احتياج المتدرب اليومي من السعرات وتوزيع البروتين والكارب والدهون حسب هدفه.','Work out a trainee\'s daily calories and protein, carb and fat split for their goal.'),'')+
 `<div class="grid g2">
 <div class="card"><div class="card-head"><div><h2>${L('بيانات المتدرب','Trainee details')}</h2><div class="sub">${L('النتايج بتتحدث أول ما تغيّر أي رقم','Results update as you type')}</div></div></div>
  <div class="form-grid">
   <label class="full">${L('النوع','Sex')}<div class="seg"><button class="${c.sex==='m'?'on':''}" onclick="setCalc('sex','m',1)">${L('ذكر','Male')}</button><button class="${c.sex==='f'?'on':''}" onclick="setCalc('sex','f',1)">${L('أنثى','Female')}</button></div></label>
   <label>${L('السن (سنة)','Age (years)')}<input type="number" inputmode="numeric" min="14" max="90" value="${c.age}" oninput="setCalc('age',this.value)"></label>
   <label>${L('الوزن (كجم)','Weight (kg)')}<input type="number" inputmode="decimal" min="35" max="250" value="${c.weight}" oninput="setCalc('weight',this.value)"></label>
   <label>${L('الطول (سم)','Height (cm)')}<input type="number" inputmode="numeric" min="130" max="230" value="${c.height}" oninput="setCalc('height',this.value)"></label>
   <label>${L('مستوى النشاط','Activity level')}<select onchange="setCalc('act',this.value)">
    ${[['1.2',L('قليل الحركة','Sedentary')],['1.375',L('خفيف (1-3 أيام)','Light (1–3 days)')],['1.55',L('متوسط (3-5 أيام)','Moderate (3–5 days)')],['1.725',L('عالي (6-7 أيام)','High (6–7 days)')],['1.9',L('رياضي محترف','Athlete')]].map(([v,t])=>`<option value="${v}" ${c.act===v?'selected':''}>${t}</option>`).join('')}</select></label>
   <label class="full">${L('الهدف','Goal')}<div class="seg"><button class="${c.goal==='cut'?'on':''}" onclick="setCalc('goal','cut',1)">${L('تنشيف','Lose fat')}</button><button class="${c.goal==='keep'?'on':''}" onclick="setCalc('goal','keep',1)">${L('ثبات','Maintain')}</button><button class="${c.goal==='bulk'?'on':''}" onclick="setCalc('goal','bulk',1)">${L('تضخيم','Gain muscle')}</button></div></label>
  </div></div>
 <div class="card" id="calcOut"></div></div>`;
};
// الحساب بمعادلة Mifflin-St Jeor:
//   BMR (الحرق وانت مرتاح) = 10×الوزن + 6.25×الطول − 5×السن + 5 للراجل (أو −161 للست)
//   TDEE (الحرق الكلي) = BMR × معامل النشاط
//   الهدف: تنشيف −500، ثبات 0، تضخيم +300
//   البروتين 2 جم لكل كيلو، الدهون 25% من السعرات، والكارب هو الباقي
// ولو الأرقام غلط بنعرض حالة Error بدل النتيجة
function calcResult(){
 const c=S.calc,a=+c.age,w=+c.weight,h=+c.height,box=document.getElementById('calcOut'); if(!box) return;
 killCharts();
 if(!(a>=14&&a<=90&&w>=35&&w<=250&&h>=130&&h<=230)){box.innerHTML=`<div class="error">${ic('error')}<b>${L('الأرقام دي خارج النطاق','These values are out of range')}</b><p>${L('السن من 14 لـ 90، الوزن من 35 لـ 250 كجم، والطول من 130 لـ 230 سم.','Age 14–90, weight 35–250 kg, height 130–230 cm.')}</p></div>`;return}
 const bmr=10*w+6.25*h-5*a+(c.sex==='m'?5:-161), tdee=bmr*(+c.act), adj={cut:-500,keep:0,bulk:300}[c.goal], kcal=Math.round((tdee+adj)/10)*10;
 const p=Math.round(w*(c.goal==='keep'?1.6:2)), f=Math.round(kcal*0.25/9), cb=Math.max(0,Math.round((kcal-p*4-f*9)/4)), bmi=(w/((h/100)**2)).toFixed(1);
 box.innerHTML=`<div class="card-head"><div><h2>${L('الاحتياج اليومي','Daily target')}</h2><div class="sub">${L('معادلة Mifflin-St Jeor','Mifflin-St Jeor equation')}</div></div><span class="chip ok">BMI ${bmi}</span></div>
  <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap"><div style="flex:1;min-width:180px"><div class="big-num">${fmt(kcal)}</div><div class="muted">${L('سعرة في اليوم','kcal per day')}</div>
   <div class="mini-stats" style="margin-top:14px"><div><b>${fmt(Math.round(bmr))}</b>${L('معدل الحرق الأساسي','BMR')}</div><div><b>${fmt(Math.round(tdee))}</b>${L('الحرق الكلي','TDEE')}</div></div></div>
   <div class="chart-box sm" style="width:180px;height:180px"><canvas id="macroChart" aria-label="macros"></canvas></div></div>
  <div class="res-grid"><div><b style="color:var(--accent-text)">${p} ${L('جم','g')}</b><span>${L('بروتين','Protein')} • ${fmt(p*4)} kcal</span></div><div><b>${cb} ${L('جم','g')}</b><span>${L('كربوهيدرات','Carbs')} • ${fmt(cb*4)} kcal</span></div><div><b>${f} ${L('جم','g')}</b><span>${L('دهون','Fat')} • ${fmt(f*9)} kcal</span></div></div>
  <div class="note">${ic('info')}${L('الأرقام تقديرية للتخطيط، وأخصائي التغذية بيراجعها قبل اعتماد الخطة.','Estimates for planning; a nutritionist reviews them before the plan is approved.')}</div>
  <div class="actions" style="margin-top:14px">${btn('save',L('حفظ في ملف المتدرب','Save to trainee profile'),'primary sm')}${btn('restaurant',L('إنشاء نظام غذائي','Create diet plan'),'sm')}</div>`;
 const o=baseOpts();delete o.scales;o.cutout='68%';
 mk('macroChart',{type:'doughnut',data:{labels:[L('بروتين','Protein'),L('كارب','Carbs'),L('دهون','Fat')],datasets:[{data:[p*4,cb*4,f*9],backgroundColor:[css('--lime'),css('--lime40'),css('--muted')],borderWidth:0}]},options:o});
}


/* ===================== 6) الوصفات الصحية: فلترة وبحث متقدم وصفحات ===================== */
const recHero=r=>r.img?`<img src="${r.img}" alt="${esc(T(r.name))}">`:`<span aria-hidden="true">${r.emoji}</span>`;
const macros4=r=>`<div class="macros4"><div><b>${r.kcal}</b>kcal</div><div><b>${r.p}${L('جم','g')}</b>${L('بروتين','Protein')}</div><div><b>${r.c}${L('جم','g')}</b>${L('كارب','Carbs')}</div><div><b>${r.f}${L('جم','g')}</b>${L('دهون','Fat')}</div></div>`;
function recDetail(r){return modalHead(`${T(r.name)}`,`${idCell(r.id)} <span class="chip ok">${T(MEAL_T[r.mt])}</span>`)+(r.img?`<img class="modal-img" src="${r.img}" alt="">`:`<div class="r-hero" style="border-radius:14px;margin-bottom:14px">${recHero(r)}</div>`)+macros4(r)+
 `<h4>${L('المكونات','Ingredients')}</h4><ul>${T(r.ing).map(i=>`<li>${i}</li>`).join('')}</ul><h4>${L('طريقة التحضير','Method')}</h4><ol>${T(r.steps).map(i=>`<li>${i}</li>`).join('')}</ol>`}
function openRecipe(id){openModal(recDetail(RECIPES.find(x=>x.id===id)))}
P.recipes=()=>head([L('الرئيسية','Home'),L('التغذية','Nutrition'),L('وصفات صحية','Healthy recipes')],L('وصفات صحية جاهزة','Healthy ready recipes'),L('وجبات متوازنة بمكونات سهلة ومحسوبة السعرات، تقدر تضيفها لخطة أي متدرب.','Balanced, calorie-counted meals with simple ingredients, ready to add to any trainee\'s plan.'),btn('add',L('وصفة جديدة','New recipe'),'primary'))+
 listView({key:'rec',view:'grid',rows:RECIPES,per:6,text:r=>[r.id,r.name.ar,r.name.en,...r.ing.ar,...r.ing.en].join(' '),placeholder:L('ابحث باسم الوصفة أو مكوّن (مثلاً: فراخ، شوفان)','Search recipe or ingredient (e.g. chicken, oats)'),unit:['وصفة','recipes'],
  tabs:[['all',L('كل الوصفات','All recipes')],...Object.keys(MEAL_T).map(k=>[k,T(MEAL_T[k]),r=>r.mt===k])],detail:recDetail,
  filters:[{k:'kcal',icon:'local_fire_department',label:L('السعرات','Calories'),opts:[['300',L('300 أو أقل','300 or less')],['450',L('450 أو أقل','450 or less')],['600',L('600 أو أقل','600 or less')]],test:(r,v)=>r.kcal<=+v},
   {k:'time',icon:'schedule',label:L('وقت التحضير','Prep time'),opts:[['10',L('10 دقايق أو أقل','10 min or less')],['20',L('20 دقيقة أو أقل','20 min or less')],['35',L('35 دقيقة أو أقل','35 min or less')]],test:(r,v)=>r.time<=+v},
   {k:'p',icon:'egg',label:L('البروتين','Protein'),opts:[['20',L('20 جم فأكثر','20 g+')],['30',L('30 جم فأكثر','30 g+')],['40',L('40 جم فأكثر','40 g+')]],test:(r,v)=>r.p>=+v,adv:1},
   {k:'c',icon:'grain',label:L('الكارب','Carbs'),opts:[['20',L('20 جم أو أقل','20 g or less')],['40',L('40 جم أو أقل','40 g or less')]],test:(r,v)=>r.c<=+v,adv:1},
   {k:'f',icon:'water_drop',label:L('الدهون','Fat'),opts:[['10',L('10 جم أو أقل','10 g or less')],['15',L('15 جم أو أقل','15 g or less')]],test:(r,v)=>r.f<=+v,adv:1}],
  card:r=>`<article class="card rcard"><div class="r-hero">${recHero(r)}<span class="chip">${T(MEAL_T[r.mt])}</span><span class="idc on-dark r-id">#${r.id}</span></div>
  <div class="r-body"><h3>${T(r.name)}</h3><p class="muted small" style="margin:0">${T(r.desc)}</p>${macros4(r)}
  <div class="meta"><span>${ic('schedule')}${L(`${r.time} دقيقة`,`${r.time} min`)}</span><span>${ic('restaurant')}${L('حصة واحدة','1 serving')}</span></div>
  <div class="pcard-foot">${btn('menu_book',L('عرض الوصفة','View recipe'),'primary sm',`openRecipe('${r.id}')`)}${btn('playlist_add',L('إضافة لخطة','Add to plan'),'sm ghost')}</div></div></article>`});

/* ===================== 7) المدربين / أخصائيو التغذية (زي الصورة 10) ===================== */
function staffDetail(s){const sp=SPEC[s.spec],list=TRAINEES.filter(t=>(s.kind==='t'?t.coach:t.nut)===s.id);
 return modalHead(T(s.name),`${idCell(s.id)} ${sChip(STAFF_ST,s.status)}`)+`<p class="muted" style="margin-top:0">${T(sp.title)} — ${T(sp.bio)}</p>`+
 dl([[L('التخصص','Specialty'),T(sp)],[L('الخبرة','Experience'),L(`${s.years} سنة`,`${s.years} yrs`)],[L('المتدربين','Trainees'),fmt(s.members)],[L('التقييم','Rating'),`★ ${s.rating}`],[L('السعة المستخدمة','Capacity used'),s.status==='leave'?'—':s.cap+'%']])+
 `<h4>${L('عينة من المتدربين المسؤول عنهم','Sample of assigned trainees')}</h4>${list.length?list.slice(0,5).map(t=>`<div class="mini-row">${person(T(t.name),'#'+t.id)}${chip(t.status)}</div>`).join(''):`<p class="muted small">${L('مفيش متدربين متسجلين في البيانات التجريبية.','No trainees in the sample data.')}</p>`}
 <div class="actions" style="margin-top:18px">${btn('assignment_ind',L('توزيع مهام','Assign tasks'),'primary sm')}${btn('calendar_month',L('جدول المناوبات','Shift schedule'),'sm')}</div>`}
function staffPage(kind){const isT=kind==='t',rows=isT?TRAINERS:NUTS,key=isT?'trainers':'nuts',specs=Object.keys(SPEC).filter(k=>SPEC[k].kind===kind);
 const pend=REQUESTS.filter(r=>r.role===kind&&r.status==='pending').length, mem=rows.reduce((a,s)=>a+s.members,0), avg=(rows.reduce((a,s)=>a+s.rating,0)/rows.length).toFixed(2);
 const m1=isT?L('معدل التزام المتدربين','Trainee adherence'):L('معدل الالتزام الغذائي','Diet adherence'), m2=isT?L('جلسات الشهر ده','Sessions this month'):L('تعديلات الخطط الشهر ده','Plan edits this month');
 const title=isT?L('سجل المدربين المعتمدين','Certified coaches'):L('سجل أخصائيي التغذية','Nutritionists'), unit=isT?['مدرب','coaches']:['أخصائي','nutritionists'];
 return head([L('الرئيسية','Home'),L('الكادر','Staff'),isT?L('المدربين','Coaches'):L('أخصائيو التغذية','Nutritionists')],`${title} <span class="chip ok" style="font-size:13px;vertical-align:middle">${fmt(rows.length)} ${L(unit[0],unit[1])}</span>`,
  isT?L('إدارة المدربين وأخصائيي التأهيل، توزيع المتدربين، ومتابعة مؤشرات الأداء والتقييم.','Manage coaches and rehab specialists, assign trainees and track performance.'):L('إدارة دكاترة وأخصائيي التغذية، توزيع الحالات، ومتابعة الالتزام الغذائي.','Manage nutritionists, assign cases and track diet adherence.'),
  btn('calendar_month',L('جدولة مناوبات الإشراف','Schedule shifts'),'ghost')+btn('download',L('تصدير السجل (PDF/Excel)','Export (PDF/Excel)'))+btn('person_add',isT?L('إضافة مدرب','Add coach'):L('إضافة أخصائي تغذية','Add nutritionist'),'primary'))+
 `<div class="grid g4 mb">${kpi({hero:1,label:L('إجمالي الكادر','Total staff'),icon:'badge',val:fmt(rows.length),trend:'+2',foot:L('هذا الربع','this quarter')})}
  ${kpi({label:L('الطاقة الاستيعابية','Capacity'),icon:'group',val:fmt(mem),unit:'/ '+fmt(rows.length*130),foot:L(`${Math.round(mem/(rows.length*130)*100)}% إشغال`,`${Math.round(mem/(rows.length*130)*100)}% utilised`)})}
  ${kpi({label:L('متوسط التقييم','Average rating'),icon:'star',val:avg,unit:'/ 5',foot:L('ممتاز جداً','excellent')})}
  ${kpi({label:L('طلبات انضمام معلقة','Pending applications'),icon:'pending_actions',val:fmt(pend),down:1,trend:L('تحتاج مراجعة','need review'),foot:`<a href="#requests" onclick="go('requests');return false" class="lnk">${L('عرض الطلبات','View requests')}</a>`})}</div>
 ${aiBanner(key,L('نظام الذكاء الاصطناعي لتوزيع الأحمال','AI load balancer'),isT?L('<b>3 مدربين</b> عدّوا 95% من سعتهم. يقترح النظام نقل <b>24 متدرب جديد</b> للمدربين الأقل ضغطاً لتحقيق توازن تشغيلي.','<b>3 coaches</b> are above 95% capacity. Move <b>24 new trainees</b> to less loaded coaches.'):L('<b>د. محمد رجب</b> و<b>د. سارة المنصور</b> فوق 95% من السعة. يُقترح توجيه الحالات الجديدة لأخصائيي إنقاص الوزن.','<b>Dr. Ragab</b> and <b>Dr. El-Mansour</b> are above 95% capacity. Route new cases to weight-loss nutritionists.'),L('مراجعة التوزيع المقترح','Review proposed split'))}
 ${listView({key,view:'grid',rows,per:6,unit,text:s=>[s.id,s.name.ar,s.name.en,SPEC[s.spec].ar,SPEC[s.spec].en,SPEC[s.spec].title.ar,SPEC[s.spec].title.en].join(' '),placeholder:L('ابحث بالاسم، التخصص الدقيق، أو كود الوظيفة','Search name, specialty or job code'),detail:staffDetail,
  tabs:[['all',L('الكل','All')],...specs.map(k=>[k,T(SPEC[k]),s=>s.spec===k])],
  filters:[{k:'st',icon:'event_available',label:L('الحالة','Status'),opts:Object.keys(STAFF_ST).map(k=>[k,T(STAFF_ST[k][1])]),test:(r,v)=>r.status===v},
   {k:'exp',icon:'workspace_premium',label:L('مستوى الخبرة','Experience'),opts:[['lt5',L('أقل من 5 سنين','Under 5 yrs')],['5',L('5 - 10 سنين','5–10 yrs')],['10',L('أكتر من 10 سنين','Over 10 yrs')]],test:(r,v)=>v==='lt5'?r.years<5:v==='5'?r.years>=5&&r.years<=10:r.years>10},
   {k:'rate',icon:'star',label:L('نطاق التقييم','Rating'),opts:[['4.9',L('4.9 فما فوق','4.9+')],['4.85',L('4.85 فما فوق','4.85+')]],test:(r,v)=>r.rating>=+v},
   {k:'mem',icon:'groups',label:L('عدد المتدربين','Trainees'),opts:[['100',L('100 فأكثر','100+')],['50',L('50 - 99','50–99')],['lt50',L('أقل من 50','Under 50')]],test:(r,v)=>v==='lt50'?r.members<50:v==='50'?r.members>=50&&r.members<100:r.members>=100,adv:1},
   {k:'cap',icon:'battery_horiz_075',label:L('السعة','Capacity'),opts:[['room',L('عنده مكان (أقل من 70%)','Has room (under 70%)')],['near',L('قرب يكتمل (90% فأكثر)','Nearly full (90%+)')]],test:(r,v)=>r.status!=='leave'&&(v==='room'?r.cap<70:r.cap>=90),adv:1}],
  columns:[idCol(),{h:isT?L('المدرب','Coach'):L('الأخصائي','Nutritionist'),cell:s=>person(T(s.name),T(SPEC[s.spec].title))},{h:L('التخصص','Specialty'),cell:s=>`<span class="chip">${T(SPEC[s.spec])}</span>`},
   {h:L('المتدربين','Trainees'),cell:s=>fmt(s.members)},{h:L('الخبرة','Experience'),cell:s=>L(`${fmt(s.years)} سنة`,`${s.years} yrs`)},{h:L('التقييم','Rating'),cell:s=>`<b>★ ${s.rating}</b>`},
   {h:L('السعة','Capacity'),cell:s=>s.status==='leave'?'<span class="muted">—</span>':adhBar(s.cap)},{h:L('الحالة','Status'),cell:s=>sChip(STAFF_ST,s.status)}],
  card:s=>{const sp=SPEC[s.spec];return `<article class="card scard"><div class="pcard-top"><span class="chip ${STAFF_ST[s.status][0]}"><span class="dot-s"></span>${T(STAFF_ST[s.status][1])}${s.status!=='leave'?` (${L('سعة','cap')} ${s.cap}%)`:''}</span>${idCell(s.id)}</div>
   <div class="s-person"><span class="avatar lg">${initials(T(s.name))}<i class="ms vb">verified</i></span><div><h3>${T(s.name)}</h3><div class="s-title">${T(sp.title)}</div></div></div>
   <p class="small muted" style="margin:0">${T(sp.bio)}</p>
   <div class="s-stats"><div><span>${L('المتدربون','Trainees')}</span><b>${fmt(s.members)} ${L('نشط','active')}</b></div><div><span>${L('الخبرة','Experience')}</span><b>${L(`${fmt(s.years)} سنة`,`${s.years} yrs`)}</b></div><div><span>${L('التقييم العام','Rating')}</span><b>★ ${s.rating}</b></div></div>
   <div class="metric"><div class="mrow"><span>${m1}</span><b>${s.k1}%</b></div><div class="bar"><i style="width:${s.k1}%"></i></div></div>
   <div class="metric"><div class="mrow"><span>${m2}</span><b>${fmt(isT?s.k2*4:s.k2)}</b></div><div class="bar alt"><i style="width:${Math.min(100,s.k2*2)}%"></i></div></div>
   <div class="tags" dir="ltr">${sp.tags.map(t=>`<span class="chip">${t}</span>`).join('')}</div>
   <div class="pcard-foot"><button class="btn sm grow" onclick="lsOpen('${key}','${s.id}')">${ic('visibility')}${L('عرض الملف وتوزيع المهام','Profile & tasks')}</button><button class="icon-btn" aria-label="${L('المزيد','More')}">${ic('more_vert')}</button></div></article>`}})}`;
}
P.trainers=()=>staffPage('t');
P.nutritionists=()=>staffPage('n');

/* ===================== 8) الاشتراكات والفواتير ===================== */
function subDetail(s){const t=trOf(s.m);return modalHead(L('تفاصيل الاشتراك','Subscription details'),`${idCell(s.id)} ${sChip(SUB_ST,s.st)}`)+
 dl([[L('المشترك','Member'),`${T(t.name)} <span class="small muted">#${t.id}</span>`],[L('الباقة','Package'),T(s.pkg)],[L('القيمة','Amount'),cur(s.pkg.price)],[L('دورة الدفع','Billing cycle'),T(s.pkg.cycle)],
  [L('التجديد القادم','Next renewal'),s.left<0?L('منتهي','Expired'):dateIn(s.left)],[L('وسيلة الدفع','Payment method'),`${ic(s.method.ic)} ${T(s.method)}`]])+
 `<div class="actions" style="margin-top:18px">${btn('receipt_long',L('عرض الفاتورة','View invoice'),'sm')}${s.st==='failed'||s.st==='due'?btn('send',L('إرسال تذكير دفع','Send payment reminder'),'primary sm'):''}</div>`}
P.subscriptions=()=>{
 setTimeout(()=>{const o=baseOpts();delete o.scales;o.cutout='70%';mk('revChart',{type:'doughnut',data:{labels:[L('VIP والنخبة','VIP & elite'),L('السنوية','Annual'),L('ربع سنوية','Quarterly'),L('الشهرية','Monthly')],datasets:[{data:[42,31,18,9],backgroundColor:PAL(),borderWidth:0}]},options:o})});
 const mcount=METHODS.map(m=>[m,SUBS.filter(s=>s.method.k===m.k).length]);
 return head([L('الرئيسية','Home'),L('الإدارة','Management'),L('الاشتراكات والفواتير','Subscriptions & billing')],L('إدارة الاشتراكات والفواتير','Subscriptions & billing'),L('متابعة الاشتراكات النشطة والتجديدات وعمليات الدفع.','Track active memberships, renewals and payments.'),
  btn('receipt_long',L('سجل المعاملات','Transactions'),'ghost')+btn('download',L('تقرير مالي','Financial report'))+btn('add_circle',L('اشتراك جديد','New subscription'),'primary'))+
 `<div class="grid g4 mb">${kpi({hero:1,label:L('الإيراد الشهري (MRR)','Monthly revenue (MRR)'),icon:'payments',val:cur(485200),trend:'+14.8%',foot:L('عن الشهر اللي فات','vs last month')})}
  ${kpi({label:L('الاشتراكات النشطة','Active subscriptions'),icon:'card_membership',val:fmt(1842),foot:L('متوسط العمر 6.4 شهور','avg. lifetime 6.4 months')})}
  ${kpi({label:L('تستحق خلال 7 أيام','Due in 7 days'),icon:'event_repeat',val:fmt(138),foot:L('تحتاج تذكير','need a reminder')})}
  ${kpi({label:L('مدفوعات متعثرة','Failed payments'),icon:'credit_card_off',val:fmt(12),down:1,trend:cur(14800)})}</div>
 ${listView({key:'subs',rows:SUBS,per:8,cls:'mb',unit:['اشتراك','subscriptions'],placeholder:L('ابحث باسم المشترك أو رقم الاشتراك (#SUB-...)','Search member or subscription ID (#SUB-...)'),detail:subDetail,
  text:s=>{const t=trOf(s.m);return [s.id,t.id,t.name.ar,t.name.en,s.pkg.ar,s.pkg.en].join(' ')},
  tabs:[['all',L('الكل','All')],...Object.keys(SUB_ST).map(k=>[k,T(SUB_ST[k][1]),s=>s.st===k])],
  filters:[{k:'pkg',icon:'card_membership',label:L('الباقة','Package'),opts:PKGS.map(p=>[p.k,T(p)]),test:(r,v)=>r.pkg.k===v},
   {k:'method',icon:'payments',label:L('وسيلة الدفع','Payment'),opts:METHODS.map(m=>[m.k,T(m)]),test:(r,v)=>r.method.k===v},
   {k:'amt',icon:'sell',label:L('القيمة','Amount'),opts:[['hi',L('5,000 ج.م فأكثر','EGP 5,000+')],['mid',L('1,500 - 5,000','1,500–5,000')],['lo',L('أقل من 1,500','Under 1,500')]],test:(r,v)=>v==='hi'?r.pkg.price>=5000:v==='mid'?r.pkg.price>=1500&&r.pkg.price<5000:r.pkg.price<1500,adv:1},
   {k:'ren',icon:'event',label:L('التجديد','Renewal'),opts:[['7',L('خلال 7 أيام','Within 7 days')],['30',L('خلال 30 يوم','Within 30 days')]],test:(r,v)=>r.left>=0&&r.left<=+v,adv:1},
   {k:'branch',icon:'location_on',label:L('الفرع','Branch'),opts:BRANCHES.map(b=>[b.k,T(b)]),test:(r,v)=>trOf(r.m).branch.k===v,adv:1}],
  columns:[idCol(),{h:L('المشترك','Member'),cell:s=>{const t=trOf(s.m);return person(T(t.name),'#'+t.id)}},{h:L('الباقة','Package'),cell:s=>`<b class="small">${T(s.pkg)}</b>`},
   {h:L('القيمة','Amount'),cell:s=>`<b class="small">${cur(s.pkg.price)}</b><div class="small muted">${T(s.pkg.cycle)}</div>`},{h:L('التجديد القادم','Next renewal'),cell:s=>`<span class="small">${s.left<0?L('منتهي','Expired'):dateIn(s.left)}</span>`},
   {h:L('وسيلة الدفع','Payment'),cell:s=>`<span class="small">${ic(s.method.ic)} ${T(s.method)}</span>`},{h:L('الحالة','Status'),cell:s=>sChip(SUB_ST,s.st)}]})}
 <div class="grid g2"><div class="card"><div class="card-head"><div><h2>${L('توزيع الإيرادات','Revenue split')}</h2><div class="sub">${L('حسب نوع الباقة','By package type')}</div></div></div>
   <div class="chart-box sm"><canvas id="revChart" aria-label="revenue"></canvas></div>
   <div class="goal-list">${[[L('VIP والنخبة','VIP & elite'),42],[L('السنوية','Annual'),31],[L('ربع سنوية','Quarterly'),18],[L('الشهرية','Monthly'),9]].map((g,i)=>`<div class="goal-row"><span class="dot" style="background:${['var(--lime)','var(--lime40)','var(--muted)','var(--border)'][i]}"></span>${g[0]}<b>${g[1]}%</b></div>`).join('')}</div></div>
  <div class="card"><div class="card-head"><div><h2>${L('وسائل الدفع','Payment methods')}</h2><div class="sub">${L('عدد الاشتراكات لكل وسيلة','Subscriptions per method')}</div></div></div>
   ${mcount.map(([m,n])=>`<div style="padding:10px 0;border-bottom:1px solid var(--border)"><div class="goal-row">${ic(m.ic)}${T(m)}<b>${fmt(n)}</b></div><div class="bar" style="margin-top:8px"><i style="width:${Math.round(n/SUBS.length*100)}%"></i></div></div>`).join('')}</div></div>`;
};

/* ===================== 9) التقارير (3 صفحات فرعية تحت "الرئيسية") ===================== */
const REP_PAGES=[['reports-staff',{ar:'أداء الكادر',en:'Staff performance'},'sports']];
const repHead=(id,title,lead)=>head([L('الرئيسية','Home'),L('التقارير','Reports'),T(REP_PAGES.find(r=>r[0]===id)[1])],title,lead,btn('calendar_today',L('الربع الثالث 2026','Q3 2026'),'ghost')+btn('download',L('تصدير التقرير','Export report'),'primary'));
P['reports-staff']=()=>{
 const top=[...STAFF].sort((a,b)=>b.members-a.members).slice(0,8);
 setTimeout(()=>{const o=baseOpts();o.indexAxis='y';o.scales.x.reverse=false;o.scales.y.position=S.lang==='ar'?'right':'left';o.scales.x.reverse=S.lang==='ar';mk('staffBar',{type:'bar',data:{labels:top.map(s=>T(s.name)),datasets:[{data:top.map(s=>s.members),backgroundColor:top.map(s=>s.kind==='t'?css('--lime'):css('--lime40')),borderRadius:6,maxBarThickness:22}]},options:o})});
 return repHead('reports-staff',L('أداء الكادر','Staff performance'),L('أحمال المدربين وأخصائيي التغذية، والتقييمات، وأداء الأقسام.','Coach and nutritionist workloads, ratings and department performance.'))+
 `<div class="grid g4 mb">${kpi({hero:1,label:L('كفاءة الكادر','Staff utilisation'),icon:'sports',val:'83.7%',foot:L(`${STAFF.length} مدرب وأخصائي`,`${STAFF.length} coaches & nutritionists`)})}
  ${kpi({label:L('متوسط التقييم','Average rating'),icon:'star',val:'4.91',unit:'/ 5'})}
  ${kpi({label:L('جلسات الشهر ده','Sessions this month'),icon:'event_available',val:fmt(3420),trend:'+6.5%'})}
  ${kpi({label:L('متوسط الرد على المحادثات','Avg. chat response'),icon:'forum',val:L('38 دقيقة','38 min'),down:1,trend:L('5 محادثات متأخرة','5 late chats')})}</div>
 <div class="grid g-main mb"><div class="card"><div class="card-head"><div><h2>${L('أكثر الكادر تحميلاً','Highest workloads')}</h2><div class="sub">${L('عدد المتدربين لكل مختص','Trainees per specialist')}</div></div></div>
   <div class="legend mb"><span><i style="background:var(--lime)"></i>${L('مدربين','Coaches')}</span><span><i style="background:var(--lime40)"></i>${L('أخصائيو تغذية','Nutritionists')}</span></div><div class="chart-box" style="height:320px"><canvas id="staffBar" aria-label="workload"></canvas></div></div>
  <div class="card"><div class="card-head"><div><h2>${L('أداء الأقسام','Department performance')}</h2></div></div>
  ${[['fitness_center',L('بناء الأجسام واللياقة','Bodybuilding & fitness'),95,4.95],['restaurant',L('التغذية الإكلينيكية','Clinical nutrition'),82,4.93],['healing',L('العلاج الطبيعي','Physiotherapy'),76,4.9],['local_fire_department',L('الكارديو والـ HIIT','Cardio & HIIT'),71,4.86]].map(d=>`<div style="padding:12px 0;border-bottom:1px solid var(--border)"><div class="goal-row">${ic(d[0])}${d[1]}<b>★ ${d[3]}</b></div><div class="adh" style="margin-top:8px"><div class="bar"><i style="width:${d[2]}%"></i></div><span class="small">${d[2]}%</span></div></div>`).join('')}</div></div>
 ${listView({key:'repstaff',title:L('ترتيب الكادر','Staff ranking'),rows:STAFF,per:6,unit:['مختص','staff'],placeholder:L('ابحث بالاسم أو الكود','Search name or code'),text:s=>[s.id,s.name.ar,s.name.en].join(' '),detail:staffDetail,
  tabs:[['all',L('الكل','All')],['t',L('مدربين','Coaches'),s=>s.kind==='t'],['n',L('أخصائيو تغذية','Nutritionists'),s=>s.kind==='n']],
  filters:[{k:'rate',icon:'star',label:L('التقييم','Rating'),opts:[['4.9',L('4.9 فما فوق','4.9+')],['4.85',L('4.85 فما فوق','4.85+')]],test:(r,v)=>r.rating>=+v},{k:'st',icon:'event_available',label:L('الحالة','Status'),opts:Object.keys(STAFF_ST).map(k=>[k,T(STAFF_ST[k][1])]),test:(r,v)=>r.status===v,adv:1}],
  columns:[idCol(),{h:L('المختص','Specialist'),cell:s=>person(T(s.name),T(SPEC[s.spec]))},{h:L('المتدربين','Trainees'),cell:s=>fmt(s.members)},{h:L('التقييم','Rating'),cell:s=>`<b>★ ${s.rating}</b>`},{h:L('التزام المتدربين','Trainee adherence'),cell:s=>adhBar(s.k1)},{h:L('الحالة','Status'),cell:s=>sChip(STAFF_ST,s.status)}]})}`;
};

/* ===================== 10) طلبات التسجيل (مدربين وأخصائيي تغذية) ===================== */
const DOCS=[{ar:'البطاقة الشخصية',en:'National ID'},{ar:'الشهادة المهنية',en:'Professional certificate'},{ar:'السيرة الذاتية',en:'CV'}];
function reqDetail(r){return modalHead(T(r.name),`${idCell(r.id)} ${sChip(REQ_ST,r.status)}`)+
 dl([[L('نوع الطلب','Role'),r.role==='t'?L('مدرب','Coach'):L('أخصائي تغذية','Nutritionist')],[L('التخصص','Specialty'),T(SPEC[r.spec])],[L('الخبرة','Experience'),L(`${r.years} سنة`,`${r.years} yrs`)],[L('الشهادة','Certificate'),T(r.cert)],[L('الموبايل','Phone'),`<span dir="ltr">${r.phone}</span>`],[L('تاريخ التقديم','Submitted'),dateIn(-r.days)]])+
 `<h4>${L('المستندات','Documents')}</h4>${DOCS.map((d,i)=>`<div class="mini-row"><span>${ic(i<r.docs?'check_circle':'cancel')} ${T(d)}</span><span class="chip ${i<r.docs?'ok':'bad'}">${i<r.docs?L('مرفوع','Uploaded'):L('ناقص','Missing')}</span></div>`).join('')}
 ${r.status==='pending'?`<div class="actions" style="margin-top:18px">${btn('check',L('قبول الطلب','Approve'),'primary sm',`reqSet('${r.id}','approved')`)}${btn('close',L('رفض','Reject'),'sm',`reqSet('${r.id}','rejected')`)}${btn('mail',L('طلب مستندات ناقصة','Request documents'),'sm ghost')}</div>`:''}`}
function reqSet(id,st){REQUESTS.find(r=>r.id===id).status=st;closeModal();render(true);toast(st==='approved'?L('تم قبول الطلب','Application approved'):L('تم رفض الطلب','Application rejected'))}
P.requests=()=>{const c=k=>REQUESTS.filter(r=>r.status===k).length;
 return head([L('الرئيسية','Home'),L('المتدربين والتدريب','Members & training'),L('طلبات التسجيل','Registration requests')],L('طلبات تسجيل المدربين وأخصائيي التغذية','Coach & nutritionist applications'),L('مراجعة طلبات الانضمام، والتأكد من المستندات، وقبول أو رفض المتقدمين.','Review applications, verify documents, and approve or reject applicants.'),
  btn('refresh',L('تحديث','Refresh'),'ghost','render(true)')+btn('download',L('تصدير','Export')))+
 `<div class="grid g3 mb">${[['pending','schedule',L('قيد الانتظار','Pending'),'warn'],['approved','check',L('مقبول','Approved'),'ok'],['rejected','close',L('مرفوض','Rejected'),'bad']].map(([k,i,t,cl])=>`<button class="card pipe ${S.L.req&&S.L.req.tab===k?'sel':''}" onclick="lsTab('req','${k}')"><div><span class="muted small">${t}</span><div class="kpi-val">${fmt(c(k))}</div></div><span class="pipe-ic ${cl}">${ic(i)}</span></button>`).join('')}</div>
 ${listView({key:'req',rows:REQUESTS,per:8,unit:['طلب','requests'],placeholder:L('ابحث باسم المتقدم أو رقم الطلب (#REQ-...)','Search applicant or request ID (#REQ-...)'),detail:reqDetail,
  text:r=>[r.id,r.name.ar,r.name.en,SPEC[r.spec].ar,SPEC[r.spec].en].join(' '),
  tabs:[['all',L('الكل','All')],...Object.keys(REQ_ST).map(k=>[k,T(REQ_ST[k][1]),r=>r.status===k])],
  filters:[{k:'role',icon:'badge',label:L('نوع الطلب','Role'),opts:[['t',L('مدرب','Coach')],['n',L('أخصائي تغذية','Nutritionist')]],test:(r,v)=>r.role===v},
   {k:'spec',icon:'category',label:L('التخصص','Specialty'),opts:Object.keys(SPEC).map(k=>[k,T(SPEC[k])]),test:(r,v)=>r.spec===v},
   {k:'exp',icon:'workspace_premium',label:L('الخبرة','Experience'),opts:[['5',L('5 سنين فأكثر','5+ yrs')],['10',L('10 سنين فأكثر','10+ yrs')],['lt3',L('أقل من 3 سنين','Under 3 yrs')]],test:(r,v)=>v==='lt3'?r.years<3:r.years>=+v,adv:1},
   {k:'docs',icon:'description',label:L('المستندات','Documents'),opts:[['full',L('مكتملة','Complete')],['miss',L('ناقصة','Missing')]],test:(r,v)=>v==='full'?r.docs===3:r.docs<3,adv:1},
   {k:'d',icon:'event',label:L('تاريخ التقديم','Submitted'),opts:[['3',L('آخر 3 أيام','Last 3 days')],['7',L('آخر أسبوع','Last week')]],test:(r,v)=>r.days<=+v,adv:1}],
  columns:[idCol(),{h:L('المتقدم','Applicant'),cell:r=>person(T(r.name),`<span dir="ltr">${r.phone}</span>`)},{h:L('النوع','Role'),cell:r=>`<span class="chip ${r.role==='t'?'info':'ok'}">${r.role==='t'?L('مدرب','Coach'):L('أخصائي تغذية','Nutritionist')}</span>`},
   {h:L('التخصص','Specialty'),cell:r=>`<span class="small">${T(SPEC[r.spec])}</span>`},{h:L('الخبرة','Experience'),cell:r=>L(`${fmt(r.years)} سنة`,`${r.years} yrs`)},
   {h:L('المستندات','Documents'),cell:r=>`<div class="adh ${r.docs<3?'mid':''}"><div class="bar"><i style="width:${Math.round(r.docs/3*100)}%"></i></div><b>${fmt(r.docs)}/${fmt(3)}</b></div>`},
   {h:L('تاريخ التقديم','Submitted'),cell:r=>`<span class="small">${dateIn(-r.days)}</span>`},{h:L('الحالة','Status'),cell:r=>sChip(REQ_ST,r.status)}]})}`;
};

/* ===================== 11) الجيمات المتعاقدة ===================== */
function gymDetail(g){return modalHead(T(g.name),`${idCell(g.id)} ${sChip(GYM_ST,g.status)}`)+
 dl([[L('المدينة','City'),T(g.city)],[L('الفروع','Branches'),fmt(g.branches)],[L('المشتركين عبر المنصة','Members via platform'),fmt(g.members)],[L('نوع التعاقد','Contract tier'),T(TIERS[g.tier])],[L('نسبة العمولة','Commission'),g.comm+'%'],[L('ينتهي التعاقد','Contract ends'),dateIn(g.end)],[L('التقييم','Rating'),'★ '+g.rating]])+
 `<div class="actions" style="margin-top:18px">${btn('description',L('عرض العقد','View contract'),'sm')}${g.status!=='active'?btn('autorenew',L('تجديد التعاقد','Renew contract'),'primary sm'):''}</div>`}
P.gyms=()=>{const tot=GYMS.reduce((a,g)=>a+g.members,0);
 return head([L('الرئيسية','Home'),L('الإدارة','Management'),L('الجيمات المتعاقدة','Partner gyms')],L('الجيمات المتعاقدة معنا','Partner gyms'),L('الصالات الرياضية الشريكة، فروعها، وحالة التعاقد والعمولات.','Partner gyms, their branches, contract status and commissions.'),
  btn('map',L('عرض على الخريطة','Map view'),'ghost')+btn('download',L('تصدير','Export'))+btn('add_business',L('إضافة جيم','Add gym'),'primary'))+
 `<div class="grid g4 mb">${kpi({hero:1,label:L('الجيمات المتعاقدة','Partner gyms'),icon:'storefront',val:fmt(GYMS.length),trend:'+2',foot:L('هذا الربع','this quarter')})}
  ${kpi({label:L('إجمالي الفروع','Total branches'),icon:'location_on',val:fmt(GYMS.reduce((a,g)=>a+g.branches,0)),foot:L(`في ${CITIES.length} محافظات`,`in ${CITIES.length} cities`)})}
  ${kpi({label:L('مشتركين عبر المنصة','Members via platform'),icon:'groups',val:fmt(tot),trend:'+9.3%'})}
  ${kpi({label:L('عقود تحتاج تجديد','Contracts to renew'),icon:'autorenew',val:fmt(GYMS.filter(g=>g.status!=='active').length),down:1,trend:L('خلال 30 يوم','within 30 days')})}</div>
 ${listView({key:'gyms',view:'grid',rows:GYMS,per:6,unit:['جيم','gyms'],placeholder:L('ابحث باسم الجيم أو الكود (#GYM-...)','Search gym or code (#GYM-...)'),detail:gymDetail,text:g=>[g.id,g.name.ar,g.name.en,g.city.ar,g.city.en].join(' '),
  tabs:[['all',L('الكل','All')],...Object.keys(GYM_ST).map(k=>[k,T(GYM_ST[k][1]),g=>g.status===k])],
  filters:[{k:'city',icon:'location_city',label:L('المدينة','City'),opts:CITIES.map(c=>[c.k,T(c)]),test:(r,v)=>r.city.k===v},
   {k:'tier',icon:'workspace_premium',label:L('نوع التعاقد','Tier'),opts:Object.keys(TIERS).map(k=>[k,T(TIERS[k])]),test:(r,v)=>r.tier===v},
   {k:'mem',icon:'groups',label:L('المشتركين','Members'),opts:[['1000',L('1,000 فأكثر','1,000+')],['500',L('500 - 999','500–999')],['lt500',L('أقل من 500','Under 500')]],test:(r,v)=>v==='lt500'?r.members<500:v==='500'?r.members>=500&&r.members<1000:r.members>=1000,adv:1},
   {k:'rate',icon:'star',label:L('التقييم','Rating'),opts:[['4.8',L('4.8 فما فوق','4.8+')],['4.6',L('4.6 فما فوق','4.6+')]],test:(r,v)=>+r.rating>=+v,adv:1},
   {k:'end',icon:'event',label:L('انتهاء التعاقد','Contract end'),opts:[['30',L('خلال 30 يوم','Within 30 days')],['90',L('خلال 90 يوم','Within 90 days')]],test:(r,v)=>r.end<=+v,adv:1}],
  columns:[idCol(),{h:L('الجيم','Gym'),cell:g=>`<div class="person"><span class="kpi-ico">${ic('storefront')}</span><div><b>${T(g.name)}</b><span>${T(g.city)}</span></div></div>`},{h:L('التعاقد','Tier'),cell:g=>`<span class="chip">${T(TIERS[g.tier])}</span>`},
   {h:L('الفروع','Branches'),cell:g=>fmt(g.branches)},{h:L('المشتركين','Members'),cell:g=>fmt(g.members)},{h:L('التقييم','Rating'),cell:g=>`★ ${g.rating}`},{h:L('العمولة','Commission'),cell:g=>g.comm+'%'},
   {h:L('ينتهي التعاقد','Contract ends'),cell:g=>`<span class="small">${dateIn(g.end)}</span>`},{h:L('الحالة','Status'),cell:g=>sChip(GYM_ST,g.status)}],
  card:g=>`<article class="card pcard"><div class="pcard-top">${idCell(g.id)}${sChip(GYM_ST,g.status)}</div>
   <div class="person"><span class="avatar lg gym">${ic('storefront')}</span><div><b style="font-size:16px">${T(g.name)}</b><span>${ic('location_on')} ${T(g.city)} • ${T(TIERS[g.tier])}</span></div></div>
   <div class="s-stats"><div><span>${L('الفروع','Branches')}</span><b>${fmt(g.branches)}</b></div><div><span>${L('المشتركين','Members')}</span><b>${fmt(g.members)}</b></div><div><span>${L('التقييم','Rating')}</span><b>★ ${g.rating}</b></div></div>
   <div class="metric"><div class="mrow"><span>${L('ينتهي التعاقد','Contract ends')}</span><b class="small">${dateIn(g.end)}</b></div><div class="bar ${g.end<30?'alt':''}"><i style="width:${Math.min(100,Math.round(g.end/365*100))}%"></i></div></div>
   <div class="pcard-foot"><span class="small muted">${L('العمولة','Commission')} ${g.comm}%</span>${rowActions('gyms',g.id)}</div></article>`})}`;
};

/* ===================== 12) تذاكر الدعم ===================== */
function bubbles(msgs,who){return `<div class="thread">${msgs.map(m=>`<div class="bubble ${m.from==='m'?'in':'out'}"><div>${esc(T(m.text))}</div><span>${who(m)} • ${ago(m.h)}</span></div>`).join('')}</div>`}
function tkDetail(t){const tr=trOf(t.m);
 return modalHead(T(t.subj),`${idCell(t.id)} ${sChip(TCK_ST,t.status)} ${sChip(PRIO,t.prio)}`)+dl([[L('صاحب الطلب','Requester'),`${T(tr.name)} <span class="small muted">#${tr.id}</span>`],[L('التصنيف','Category'),T(TCK_CAT[t.cat])],[L('المسؤول','Assignee'),t.agent?T(t.agent):L('غير معيّن','Unassigned')]])+
 `<h4>${L('المحادثة','Conversation')}</h4>${bubbles(t.msgs,m=>m.from==='m'?T(tr.name):(t.agent?T(t.agent):L('الدعم','Support')))}
 ${t.status==='closed'?'':`<label class="reply"><textarea id="tk-reply" rows="2" placeholder="${L('اكتب ردك هنا...','Write your reply...')}"></textarea></label>
 <div class="actions" style="margin-top:10px">${btn('send',L('إرسال الرد','Send reply'),'primary sm',`tkReply('${t.id}')`)}${t.status!=='resolved'?btn('task_alt',L('تعليم كمحلولة','Mark resolved'),'sm',`tkStatus('${t.id}','resolved')`):''}${btn('lock',L('إغلاق التذكرة','Close ticket'),'sm ghost',`tkStatus('${t.id}','closed')`)}</div>`}`}
function tkReply(id){const v=document.getElementById('tk-reply').value.trim();if(!v)return;const t=TICKETS.find(x=>x.id===id);t.msgs.push({from:'a',text:{ar:v,en:v},h:0});t.h=0;if(t.status==='open')t.status='progress';if(!t.agent)t.agent=USER.name;render(true);openModal(tkDetail(t))}
function tkStatus(id,st){const t=TICKETS.find(x=>x.id===id);t.status=st;closeModal();render(true);toast(L('تم تحديث حالة التذكرة','Ticket updated'))}
P.tickets=()=>{const c=k=>TICKETS.filter(t=>t.status===k).length;
 return head([L('الرئيسية','Home'),L('الدعم والتواصل','Support'),L('تذاكر الدعم','Support tickets')],L('تذاكر الدعم الفني','Support tickets'),L('شكاوى واستفسارات المشتركين، ومتابعة الرد عليها وحلها.','Member complaints and questions, and tracking their resolution.'),
  btn('download',L('تصدير','Export'),'ghost')+btn('add',L('تذكرة جديدة','New ticket'),'primary'))+
 `<div class="grid g4 mb">${kpi({hero:1,label:L('تذاكر مفتوحة','Open tickets'),icon:'confirmation_number',val:fmt(c('open')),foot:L(`${TICKETS.filter(t=>t.prio==='urgent'&&t.status==='open').length} عاجلة`,`${TICKETS.filter(t=>t.prio==='urgent'&&t.status==='open').length} urgent`)})}
  ${kpi({label:L('قيد المعالجة','In progress'),icon:'pending',val:fmt(c('progress'))})}
  ${kpi({label:L('متوسط أول رد','Avg. first response'),icon:'timer',val:L('42 دقيقة','42 min'),trend:'-12%'})}
  ${kpi({label:L('رضا المشتركين','Satisfaction'),icon:'sentiment_satisfied',val:'4.7',unit:'/ 5'})}</div>
 ${listView({key:'tickets',rows:TICKETS,per:8,unit:['تذكرة','tickets'],placeholder:L('ابحث بالموضوع، اسم المشترك، أو رقم التذكرة (#TCK-...)','Search subject, member or ticket ID (#TCK-...)'),detail:tkDetail,
  text:t=>{const m=trOf(t.m);return [t.id,t.subj.ar,t.subj.en,m.name.ar,m.name.en,m.id].join(' ')},
  tabs:[['all',L('الكل','All')],...Object.keys(TCK_ST).map(k=>[k,T(TCK_ST[k][1]),t=>t.status===k])],
  filters:[{k:'prio',icon:'flag',label:L('الأولوية','Priority'),opts:Object.keys(PRIO).map(k=>[k,T(PRIO[k][1])]),test:(r,v)=>r.prio===v},
   {k:'cat',icon:'category',label:L('التصنيف','Category'),opts:Object.keys(TCK_CAT).map(k=>[k,T(TCK_CAT[k])]),test:(r,v)=>r.cat===v},
   {k:'ag',icon:'support_agent',label:L('المسؤول','Assignee'),opts:[['none',L('غير معيّن','Unassigned')],...AGENTS.map(a=>[a.en,T(a)])],test:(r,v)=>v==='none'?!r.agent:r.agent&&r.agent.en===v,adv:1},
   {k:'h',icon:'schedule',label:L('آخر تحديث','Updated'),opts:[['24',L('آخر 24 ساعة','Last 24 h')],['72',L('آخر 3 أيام','Last 3 days')]],test:(r,v)=>r.h<=+v,adv:1}],
  columns:[idCol(),{h:L('الموضوع','Subject'),cell:t=>`<b class="small">${T(t.subj)}</b><div class="small muted">${T(TCK_CAT[t.cat])}</div>`},{h:L('صاحب الطلب','Requester'),cell:t=>{const m=trOf(t.m);return person(T(m.name),'#'+m.id)}},
   {h:L('الأولوية','Priority'),cell:t=>sChip(PRIO,t.prio)},{h:L('المسؤول','Assignee'),cell:t=>`<span class="small ${t.agent?'':'muted'}">${t.agent?T(t.agent):L('غير معيّن','Unassigned')}</span>`},
   {h:L('آخر تحديث','Updated'),cell:t=>`<span class="small muted">${ago(t.h)}</span>`},{h:L('الحالة','Status'),cell:t=>sChip(TCK_ST,t.status)}]})}`;
};

/* ===================== 13) متابعة المحادثات بين المشتركين والكادر ===================== */
const CH_FLAG={policy:['bad',{ar:'مخالفة سياسة',en:'Policy flag'}],late:['warn',{ar:'بدون رد +24 ساعة',en:'No reply 24h+'}]};
function chatOpen(id){S.chat=id;render(true);const el=document.querySelector('.chat-pane');if(el&&innerWidth<1025)el.scrollIntoView({behavior:'smooth'})}
function chatReview(id){const c=CHATS.find(x=>x.id===id);c.flag='';c.reviewed=true;render(true);toast(L('تم تعليم المحادثة كمراجَعة','Marked as reviewed'))}
P.chats=()=>{const cur=CHATS.find(c=>c.id===S.chat)||CHATS[0];S.chat=cur.id;const m=trOf(cur.m),s=staffOf(cur.s);
 const list=listView({key:'chats',view:'grid',gridCls:'chat-list',rows:CHATS,per:6,unit:['محادثة','chats'],placeholder:L('ابحث باسم المشترك أو المختص','Search member or specialist'),
  text:c=>{const a=trOf(c.m),b=staffOf(c.s);return [c.id,a.name.ar,a.name.en,b.name.ar,b.name.en,a.id].join(' ')},
  tabs:[['all',L('الكل','All')],['t',L('مع المدربين','Coaches'),c=>c.type==='t'],['n',L('مع أخصائيي التغذية','Nutritionists'),c=>c.type==='n'],['flag',L('تحتاج مراجعة','Flagged'),c=>!!c.flag]],
  filters:[{k:'s',icon:'badge',label:L('المختص','Specialist'),opts:sOpts(STAFF),test:(r,v)=>r.s===v,adv:1},{k:'u',icon:'mark_chat_unread',label:L('الرسائل','Messages'),opts:[['1',L('فيها رسائل غير مقروءة','Has unread')]],test:r=>r.unread>0,adv:1}],
  card:c=>{const a=trOf(c.m),b=staffOf(c.s);return `<button class="chat-item ${c.id===cur.id?'on':''}" onclick="chatOpen('${c.id}')"><span class="avatar sm">${initials(T(a.name))}</span>
   <span class="ci-body"><span class="ci-top"><b>${T(a.name)}</b><span class="small muted">${ago(c.h)}</span></span><span class="small muted">${ic(c.type==='t'?'sports':'nutrition')} ${T(b.name)}</span>
   <span class="small ci-last">${esc(T(c.msgs[c.msgs.length-1].text))}</span></span>${c.unread?`<b class="count">${fmt(c.unread)}</b>`:''}${c.flag?`<span class="ci-flag ${CH_FLAG[c.flag][0]}" title="${T(CH_FLAG[c.flag][1])}"></span>`:''}</button>`}});
 return head([L('الرئيسية','Home'),L('الدعم والتواصل','Support'),L('متابعة المحادثات','Chat monitoring')],L('متابعة المحادثات','Chat monitoring'),L('متابعة المحادثات بين المشتركين والمدربين وأخصائيي التغذية، وسرعة الرد، والمحادثات اللي محتاجة مراجعة.','Monitor conversations between members, coaches and nutritionists: response times and flagged chats.'),btn('download',L('تصدير سجل المحادثات','Export chat log'),'ghost'))+
 `<div class="grid g4 mb">${kpi({hero:1,label:L('محادثات نشطة','Active conversations'),icon:'forum',val:fmt(CHATS.length),foot:L('آخر 7 أيام','last 7 days')})}
  ${kpi({label:L('متوسط زمن الرد','Avg. response time'),icon:'timer',val:L('38 دقيقة','38 min'),trend:'-9%'})}
  ${kpi({label:L('تحتاج مراجعة','Flagged'),icon:'flag',val:fmt(CHATS.filter(c=>c.flag==='policy').length),down:1,trend:L('مخالفة سياسة','policy flags')})}
  ${kpi({label:L('بدون رد +24 ساعة','No reply 24h+'),icon:'schedule',val:fmt(CHATS.filter(c=>c.flag==='late').length)})}</div>
 <div class="chat-layout"><div class="chat-side">${list}</div>
  <div class="card chat-pane"><div class="card-head"><div class="person"><span class="avatar">${initials(T(m.name))}</span><div><b>${T(m.name)} ${ic('sync_alt')} ${T(s.name)}</b><span>${idCell(cur.id)} • ${cur.type==='t'?L('محادثة مع مدرب','Coach chat'):L('محادثة مع أخصائي تغذية','Nutritionist chat')}</span></div></div>${cur.flag?sChip(CH_FLAG,cur.flag):cur.reviewed?`<span class="chip ok">${L('تمت المراجعة','Reviewed')}</span>`:''}</div>
   ${cur.flag==='policy'?`<div class="note warn-note">${ic('policy')}${L('رسالة فيها طلب للتواصل خارج التطبيق. السياسة إن كل المتابعة تفضل داخل المنصة.','A message asks to move the conversation off-platform. Policy is to keep all follow-up in the app.')}</div>`:''}
   ${cur.flag==='late'?`<div class="note warn-note">${ic('schedule')}${L('آخر رسالة من المشترك من غير رد من أكتر من 24 ساعة.','The member’s last message has had no reply for over 24 hours.')}</div>`:''}
   ${bubbles(cur.msgs,x=>x.from==='m'?T(m.name):T(s.name))}
   <div class="actions chat-actions">${cur.flag?btn('task_alt',L('تعليم كمراجَعة','Mark reviewed'),'primary sm',`chatReview('${cur.id}')`):''}${btn('notifications_active',L('تنبيه المختص','Notify specialist'),'sm')}${btn('person',L('ملف المشترك','Member profile'),'sm ghost',`openModal(trDetail(trOf('${m.id}')))`)}</div></div></div>`;
};
// ===================== 9) تحليلات الذكاء الاصطناعي =====================
// كارت InBody بيوضح حالة Error: S.sync بيبدأ 'error'، ولما تدوس إعادة المحاولة
// بيبقى 'loading' (skeleton) لمدة ثانية، وبعدين 'ok' (البيانات)
P.ai=()=>{
 const risk=[[TRAINEES[2],1.72,L('خطر تمزق عضلي','Muscle strain risk'),L('انخفاض HRV بنسبة 32%','HRV down 32%'),L('تقليل حجم التمرين 35% لمدة 5 أيام','Cut training volume 35% for 5 days')],
  [TRAINEES[7],1.48,L('إجهاد عصبي','CNS fatigue'),L('نوم عميق 3.8 ساعة فقط','Only 3.8 h deep sleep'),L('تحويل تمرين بكرة لكارديو Zone 2','Switch tomorrow to Zone 2 cardio')],
  [TRAINEES[6],1.65,L('حمل أوتار مفرط','Tendon overload'),L('زيادة الحمل الأسبوعي 48%','Weekly load +48%'),L('استبدال الجري بالسباحة 7 أيام','Swap running for swimming for 7 days')]];
 const stream=[['fitness_center',L('تعديل تلقائي لجدول التمارين','Workout auto-adjusted'),L('تم تقليل أوزان الديدلفت والسكوات 20% لكريم عادل.','Deadlift and squat loads cut 20% for Karim Adel.'),L('منذ 15 دقيقة','15 min ago'),'ok',L('تم التطبيق','Applied')],
  ['restaurant_menu',L('اقتراح يوم Refeed','Refeed day proposed'),L('زيادة 60 جم كارب لنور حسن بعد ثبات وزن 12 يوم.','Add 60 g carbs for Nour Hassan after a 12-day plateau.'),L('منذ 42 دقيقة','42 min ago'),'warn',L('بانتظار الأخصائي','Awaiting nutritionist')],
  ['outgoing_mail',L('رسالة تحفيزية','Motivation message'),L('اتبعتت لـ 12 متدرب ماسجلوش حضور من 4 أيام.','Sent to 12 trainees with no check-in for 4 days.'),L('منذ ساعتين','2 h ago'),'ok',L('اتبعتت','Sent')]];
 let sync='';
 if(S.sync==='loading') sync=`<div class="skel" style="height:22px;width:60%;margin-bottom:10px"></div><div class="skel" style="height:14px;width:90%;margin-bottom:8px"></div><div class="skel" style="height:14px;width:75%"></div>`;
 else if(S.sync==='error') sync=`<div class="error" style="padding:16px 8px">${ic('sync_problem')}<b>${L('فشل الاتصال بموازين InBody','Couldn\'t reach the InBody scales')}</b><p>${L('آخر قراءات من الأجهزة مش متاحة. اتأكد إن الأجهزة متصلة بالشبكة وحاول تاني.','Latest device readings are unavailable. Check the devices are online and try again.')}</p>${btn('refresh',L('إعادة المحاولة','Try again'),'primary sm','retrySync()')}</div>`;
 else sync=`<div class="mini-stats"><div><b>38</b>${L('حالة ثبات وزن','weight plateaus')}</div><div><b>88.4%</b>${L('دقة الالتزام بالماكروز','macro accuracy')}</div><div><b>92%</b>${L('نجاح تدوير الكارب','carb-cycling success')}</div><div><b>84%</b>${L('تغطية المغذيات','micronutrient coverage')}</div></div><div class="note">${ic('check_circle')}${L('تمت المزامنة دلوقتي','Synced just now')}</div>`;
 return head([L('الرئيسية','Home'),L('تحليلات الذكاء الاصطناعي','AI insights')],L('تحليلات الذكاء الاصطناعي','AI insights'),L('توقع مخاطر الإجهاد والإصابات، ومتابعة الاستبقاء، وتوصيات تلقائية للتمرين والتغذية. الـ AI بيقترح بس، والقرار للمتخصص.','Fatigue and injury risk, retention forecasts and automatic suggestions. AI only suggests; a professional makes the call.'),
  btn('ios_share',L('تصدير PDF','Export PDF'),'ghost')+btn('auto_mode',L('تشغيل التحليل الآن','Run analysis now'),'primary'))+
 `<div class="grid g4 mb">${kpi({hero:1,label:L('دقة النماذج','Model accuracy'),icon:'psychology',val:'96.4%',trend:'+2.1%',foot:L('على 42,850 جلسة','on 42,850 sessions')})}
  ${kpi({label:L('انقطاعات تم منعها','Cancellations prevented'),icon:'verified_user',val:fmt(84),foot:L('إيراد محمي ','revenue protected ')+cur(168000)})}
  ${kpi({label:L('مؤشر مخاطر الإصابة','Injury risk index'),icon:'ecg_heart',val:'1.2%',foot:L('18 متدرب في منطقة التحذير','18 trainees in the warning zone')})}
  ${kpi({label:L('خطط اتولدت','Plans generated'),icon:'model_training',val:fmt(412),foot:L('94% اتعتمدت من غير تعديل','94% approved without edits')})}</div>
 <div class="card mb"><div class="card-head"><div><h2>${L('حالات تحتاج مراجعة المتخصص','Cases needing professional review')}</h2><div class="sub">${L('مؤشر الحمل التدريبي ACWR فوق 1.3','Training load ratio (ACWR) above 1.3')}</div></div><span class="chip bad">${L('3 حالات','3 cases')}</span></div>
  <div class="table-wrap"><table><thead><tr><th>${L('المتدرب','Trainee')}</th><th>ACWR</th><th>${L('المؤشر المقلق','Warning sign')}</th><th>${L('توصية الـ AI','AI suggestion')}</th><th></th></tr></thead><tbody>
  ${risk.map(r=>`<tr><td>${person(T(r[0].name),'#'+r[0].id)}</td><td><b style="color:${r[1]>1.5?'var(--danger)':'var(--warn)'}">${r[1]}</b><div class="small muted">${r[2]}</div></td><td class="small">${r[3]}</td><td class="small muted">${r[4]}</td><td>${btn('',L('إرسال للمدرب','Send to coach'),'sm')}</td></tr>`).join('')}</tbody></table></div></div>
 <div class="grid g2"><div class="card"><div class="card-head"><div><h2>${L('سجل إجراءات الـ AI','AI action log')}</h2><div class="sub">${L('آخر القرارات والاقتراحات','Latest decisions and suggestions')}</div></div></div>
  ${stream.map(s=>`<div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)"><span class="kpi-ico">${ic(s[0])}</span><div style="flex:1"><div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center"><b class="small">${s[1]}</b><span class="chip ${s[4]}">${s[5]}</span></div><div class="small muted">${s[2]}</div><div class="small muted">${s[3]}</div></div></div>`).join('')}</div>
  <div class="card"><div class="card-head"><div><h2>${L('الالتزام الغذائي والاستجابة الأيضية','Diet adherence & metabolism')}</h2><div class="sub">${L('بيانات موازين InBody','InBody scale data')}</div></div></div>${sync}</div></div>`;
};
// زرار إعادة المحاولة
function retrySync(){S.sync='loading';render(true);setTimeout(()=>{S.sync='ok';render(true)},1200)}

// ===================== 11) الإعدادات (قيد التطوير زي الـ example) =====================
P.settings=()=>head([L('الرئيسية','Home'),L('الإعدادات','Settings')],L('الإعدادات','Settings'),L('إعدادات الصالة وصلاحيات الوصول والربط التقني.','Gym settings, access permissions and integrations.'),'')+
 `<div class="card wip">${ic('construction')}<h2 style="margin:12px 0 6px">${L('صفحة الإعدادات قيد التطوير','Settings are under development')}</h2><p class="muted" style="margin:0 0 16px">${L('تقدر تتصفح باقي الأقسام من القائمة الجانبية.','You can browse the other sections from the sidebar.')}</p>${btn('grid_view',L('الرجوع للوحة التحكم','Back to dashboard'),'primary',"go('dashboard')")}</div>`;
P.reports=()=>P['reports-staff']();
