/* =====================================================================
   components.js — القطع اللي بتتكرر (Reusable components)
   ---------------------------------------------------------------------
   كل function هنا بترجّع "نص HTML". بدل ما نكتب كارت الأرقام 30 مرة،
   بنكتبه مرة واحدة هنا وننادي kpi({...}) في أي صفحة.
   علامة ` ` (backtick) بتخلينا نكتب HTML ونحط جواه قيم بـ ${...}
   ===================================================================== */

// كارت رقم: label = العنوان، val = الرقم، trend = نسبة التغيير، hero = لو عايزه الكارت الأخضر
function kpi(o){return `<div class="card kpi ${o.hero?'hero':''}">
  <div class="kpi-top"><span>${o.label}</span><span class="kpi-ico">${ic(o.icon)}</span></div>
  <div class="kpi-val">${o.val}${o.unit?`<small>${o.unit}</small>`:''}</div>
  <div class="kpi-foot">${o.trend?`<span class="trend ${o.down?'down':''}">${ic(o.down?'trending_down':'trending_up')}${o.trend}</span> `:''}${o.foot||''}</div></div>`}
// المسار الصغير فوق العنوان: الرئيسية > المتدربين
function crumbs(parts){return `<div class="crumbs">${parts.map((p,i)=>i?`${ic('chevron_right','flip')}${p}`:p).join('')}</div>`}
// رأس الصفحة: المسار + العنوان + الوصف + الزراير
function head(cr,title,lead,actions){return `${crumbs(cr)}<div class="page-head"><div><h1>${title}</h1><p class="lead">${lead}</p></div><div class="actions">${actions||''}</div></div>`}
// زرار. on = الكود اللي يشتغل لما يتداس (لو فاضي الزرار مش بيعمل حاجة، زي الـ example)
const btn=(icon,label,cls='',on='')=>`<button class="btn ${cls}" ${on?`onclick="${on}"`:''}>${icon?ic(icon):''}${label}</button>`;
// شريط توصية الـ AI. لو المستخدم داس "تجاهل" بنسجل ده في S.hidden فميرجعش يظهر
function aiBanner(key,title,text,cta){ if(S.hidden[key]) return '';
 return `<div class="ai mb"><div class="ai-ico">${ic('neurology')}</div><div class="ai-body">
  <div class="ai-title">${title}<span class="chip ok">FitPulse AI</span></div><p>${text}</p>
  <div class="actions">${btn('auto_fix_high',cta,'primary sm')}${btn('',L('تجاهل','Dismiss'),'ghost sm',`hideBanner('${key}')`)}</div></div></div>`}
// حالة Empty: رسالة + زرار لما مفيش نتايج
function emptyState(title,text,action){return `<div class="empty">${ic('search_off')}<b>${title}</b><p>${text}</p>${action||''}</div>`}
// شريط الالتزام الملون
function adhBar(v){const cls=v<50?'lo':v<75?'mid':'';return `<div class="adh ${cls}"><div class="bar"><i style="width:${v}%"></i></div><b>${v}%</b></div>`}
// صورة دايرية بأول حرفين + الاسم + سطر صغير تحته
function person(name,sub){return `<div class="person"><span class="avatar sm">${initials(name)}</span><div><b>${name}</b><span>${sub}</span></div></div>`}
// الـ tabs: list = [[المفتاح، الاسم، العدد], ...]، cur = المختار، on(k) = الكود اللي يشتغل لما تدوس
function tabs(list,cur,on){return `<div class="tabs" role="tablist">${list.map(([k,label,n])=>`<button class="tab ${k===cur?'on':''}" role="tab" aria-selected="${k===cur}" onclick="${on(k)}">${label}${n!=null?` <b>${fmt(n)}</b>`:''}</button>`).join('')}</div>`}
// أرقام الصفحات. on(i) = الكود اللي يفتح الصفحة رقم i. unit = اسم العناصر (متدرب، مدرب...)
function pager(total,per,p,on,unit){const pages=Math.max(1,Math.ceil(total/per));let b='';for(let i=1;i<=pages;i++)b+=`<button class="${i===p?'on':''}" onclick="${on(i)}" aria-label="${i}">${fmt(i)}</button>`;
 const from=total?(p-1)*per+1:0,to=Math.min(total,p*per);
 return `<div class="pager"><span>${L(`عرض ${fmt(from)} - ${fmt(to)} من إجمالي ${fmt(total)} ${unit?unit[0]:''}`,`Showing ${from}–${to} of ${total} ${unit?unit[1]:''}`)}</span><div class="pages">
  <button ${p<=1?'disabled':''} onclick="${on(p-1)}" aria-label="prev">${ic('chevron_left','flip')}</button>${b}
  <button ${p>=pages?'disabled':''} onclick="${on(p+1)}" aria-label="next">${ic('chevron_right','flip')}</button></div></div>`}

// ===== الرقم التعريفي وأزرار الإجراءات (زي الصورة 7) =====
const idCell=id=>`<span class="idc">#${id}</span>`;
const idCol=()=>({h:L('المعرف','ID'),cell:r=>idCell(r.id)});
function rowActions(key,id){return `<div class="row-actions">
 <button class="ia" title="${L('عرض','View')}" aria-label="${L('عرض','View')}" onclick="lsOpen('${key}','${id}')">${ic('visibility')}</button>
 <button class="ia" title="${L('تعديل','Edit')}" aria-label="${L('تعديل','Edit')}">${ic('edit_note')}</button>
 <button class="ia" title="${L('المزيد','More')}" aria-label="${L('المزيد','More')}">${ic('more_vert')}</button></div>`}

// ===== نافذة منبثقة (Modal) =====
function openModal(html,wide){document.getElementById('modal-root').innerHTML=`<div class="modal-bg" onclick="if(event.target===this)closeModal()"><div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true">${html}</div></div>`;const b=document.querySelector('.modal .icon-btn');if(b)b.focus()}
function closeModal(){document.getElementById('modal-root').innerHTML=''}
const modalHead=(title,sub)=>`<div class="card-head"><div>${sub||''}<h2 style="margin-top:6px">${title}</h2></div><button class="icon-btn" onclick="closeModal()" aria-label="${L('إغلاق','Close')}">${ic('close')}</button></div>`;
// قايمة "عنوان: قيمة" جوه الـ modal
const dl=pairs=>`<div class="dl">${pairs.map(([k,v])=>`<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;

/* =====================================================================
   listView — "محرك" الجداول: بحث + tabs + فلاتر + بحث متقدم + جدول/كروت + Pagination
   ---------------------------------------------------------------------
   بتاخد إعدادات (c) وبترجع الـ HTML كله. كل جدول ليه key، وحالته محفوظة في S.L[key].
   c.rows: البيانات | c.text(r): النص اللي بندوّر فيه | c.tabs: [[key,label,filterFn]]
   c.filters: [{k,label,icon,opts:[[value,label]],test(r,v),adv}]  adv=1 يعني يظهر في "البحث المتقدم"
   c.columns: [{h, cell(r)}] للجدول | c.card(r) للكروت | c.detail(r) للـ modal لما تدوس "عرض"
   ===================================================================== */
const LISTS={};
function LS(key,view){return S.L[key]||(S.L[key]={q:'',tab:'all',f:{},p:1,view:view||'table',adv:false})}
function listView(c){
 LISTS[c.key]=c; const st=LS(c.key,c.view), k=c.key, tb=c.tabs||[], fl=c.filters||[];
 let rows=c.rows; const td=tb.find(t=>t[0]===st.tab); if(td&&td[2]) rows=rows.filter(td[2]);
 if(st.q.trim()){const q=st.q.trim().toLowerCase(); rows=rows.filter(r=>c.text(r).toLowerCase().includes(q))}
 fl.forEach(f=>{const v=st.f[f.k]; if(v!=null&&v!=='') rows=rows.filter(r=>f.test(r,v))});
 const per=c.per||8,total=rows.length,pages=Math.max(1,Math.ceil(total/per)); if(st.p>pages)st.p=pages;
 const pr=rows.slice((st.p-1)*per,st.p*per), basic=fl.filter(f=>!f.adv), adv=fl.filter(f=>f.adv);
 const advOn=adv.filter(f=>st.f[f.k]).length, any=st.q||Object.values(st.f).some(v=>v);
 const sel=f=>`<label class="field sel">${ic(f.icon||'filter_list')}<select aria-label="${esc(f.label)}" onchange="lsF('${k}','${f.k}',this.value)"><option value="">${f.label}: ${L('الكل','All')}</option>${f.opts.map(([v,t])=>`<option value="${v}" ${String(st.f[f.k]??'')===String(v)?'selected':''}>${f.label}: ${t}</option>`).join('')}</select></label>`;
 const views=c.card&&c.columns?`<div class="seg vt"><button class="${st.view==='table'?'on':''}" onclick="lsView('${k}','table')" aria-label="${L('جدول','Table')}">${ic('table_rows')}</button><button class="${st.view==='grid'?'on':''}" onclick="lsView('${k}','grid')" aria-label="${L('كروت','Cards')}">${ic('grid_view')}</button></div>`:'';
 const bar=`${c.title?`<div class="card-head"><div><h2>${c.title}</h2>${c.sub?`<div class="sub">${c.sub}</div>`:''}</div></div>`:''}
  ${tb.length||views?`<div class="toolbar">${tb.length?tabs(tb.map(([tk,tl,fn])=>[tk,tl,fn?c.rows.filter(fn).length:c.rows.length]),st.tab,v=>`lsTab('${k}','${v}')`):'<span></span>'}${views}</div>`:''}
  <div class="filters"><label class="field grow">${ic('search')}<input id="q-${k}" value="${esc(st.q)}" placeholder="${esc(c.placeholder||L('ابحث...','Search...'))}" oninput="lsQ('${k}',this.value)"></label>
   ${basic.map(sel).join('')}
   ${adv.length?`<button class="btn sm adv-btn ${st.adv?'on':''}" onclick="lsAdv('${k}')" aria-expanded="${st.adv}">${ic('tune')}${L('بحث متقدم','Advanced search')}${advOn?`<b class="count">${fmt(advOn)}</b>`:''}</button>`:''}
   <button class="icon-btn clr" title="${L('مسح الفلاتر','Clear filters')}" aria-label="${L('مسح الفلاتر','Clear filters')}" onclick="lsClear('${k}')" ${any?'':'disabled'}>${ic('filter_alt_off')}</button></div>
  ${st.adv&&adv.length?`<div class="adv-panel"><div class="adv-title">${ic('manage_search')}${L('البحث المتقدم','Advanced search')}</div><div class="adv-grid">${adv.map(sel).join('')}</div></div>`:''}`;
 const empty=emptyState(L('مفيش نتايج مطابقة','No matching results'),L('غيّر كلمة البحث أو الفلاتر، أو امسحهم وابدأ من جديد.','Change the search or filters, or clear them and start over.'),btn('filter_alt_off',L('مسح الفلاتر','Clear filters'),'sm',`lsClear('${k}')`));
 const pg=total?pager(total,per,st.p,i=>`lsP('${k}',${i})`,c.unit):'';
 if(st.view==='grid'&&c.card) return `<div class="card mb">${bar}</div>${total?`<div class="grid ${c.gridCls||'g3'} mb">${pr.map(c.card).join('')}</div><div class="card pager-card">${pg}</div>`:`<div class="card">${empty}</div>`}`;
 const cols=c.columns||[];
 return `<div class="card ${c.cls||''}">${bar}${total?`<div class="table-wrap"><table><thead><tr>${cols.map(x=>`<th>${x.h}</th>`).join('')}${c.actions===false?'':`<th>${L('إجراءات','Actions')}</th>`}</tr></thead><tbody>
  ${pr.map(r=>`<tr>${cols.map(x=>`<td>${x.cell(r)}</td>`).join('')}${c.actions===false?'':`<td>${rowActions(k,r.id)}</td>`}</tr>`).join('')}</tbody></table></div>${pg}`:empty}</div>`;
}

// ===== Charts =====
// بنستخدم مكتبة Chart.js (متضافة في index.html). charts بتحفظ كل الـ charts المرسومة
// عشان نمسحها (killCharts) قبل ما نرسم صفحة جديدة، وإلا هتتراكم في الذاكرة.
let charts=[];
const css=v=>getComputedStyle(document.documentElement).getPropertyValue(v).trim();
function killCharts(){charts.forEach(c=>c.destroy());charts=[]}
// الإعدادات المشتركة لكل الـ charts: الألوان من CSS، وفي العربي المحور بيتقلب (reverse)
function baseOpts(){if(typeof Chart==='undefined')return {scales:{x:{},y:{}},plugins:{}};const t=css('--muted'),g=css('--border');Chart.defaults.font.family="'Readex Pro',system-ui,sans-serif";Chart.defaults.color=t;
 return {responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{rtl:S.lang==='ar',backgroundColor:css('--surface2'),titleColor:css('--text'),bodyColor:css('--text'),borderColor:g,borderWidth:1,padding:10}},
  scales:{x:{reverse:S.lang==='ar',grid:{display:false},border:{color:g}},y:{position:S.lang==='ar'?'right':'left',grid:{color:g},border:{display:false}}}}}
// mk('id', إعدادات) بترسم chart جوه الـ <canvas> اللي ليه الـ id ده
function mk(id,cfg){const el=document.getElementById(id);if(!el||typeof Chart==='undefined')return;charts.push(new Chart(el,cfg))}
const PAL=()=>[css('--lime'),css('--lime40'),css('--muted'),css('--border')];
