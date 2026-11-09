/* =====================================================================
   users.js — صفحة إدارة المستخدمين (User Management) مربوطة بالـ API
   Endpoints: GET/POST/PUT /api/users/... + Toggle-User + Unlock-User
   بتتحمّل بعد pages.js وقبل app.js. بتعرّف P.users وبتستخدم نفس
   components الموجودة (head, btn, chip, pager, openModal, toast ...)
   ===================================================================== */

// ---------- 1) الأدوار والـ hierarchy (rank أقل = صلاحية أعلى) ----------
const ROLES=[['OSuperAdmin',1,'سوبر أدمن المؤسسة','Org Super Admin'],['SuperAdmin',2,'سوبر أدمن','Super Admin'],['Admin',3,'أدمن','Admin'],
 ['GymsOwner',4,'مالك جيم','Gym Owner'],['Professional',4,'أخصائي','Professional'],['Captain',4,'كابتن','Captain'],['Member',4,'عضو','Member']];
const roleName=k=>{const r=ROLES.find(x=>x[0]===k);return r?L(r[2],r[3]):k};
const store={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}}};
// رتبة المستخدم الحالي من الـ JWT (للـ UI بس — الـ backend هو اللي بيفرض القواعد فعلاً)
function umMyRank(){try{const t=store.get('sfn-token').split('.')[1].replace(/-/g,'+').replace(/_/g,'/');const c=JSON.parse(decodeURIComponent(escape(atob(t))));
 const r=[].concat(c.role||c['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']||[]).map(n=>(ROLES.find(x=>x[0]===n)||[0,99])[1]);return r.length?Math.min(...r):null}catch(e){return null}}
const umCanAssign=k=>{const m=umMyRank();return m==null||ROLES.find(x=>x[0]===k)[1]>m};

// ---------- 2) طبقة الـ API ----------
const umBase=()=>(window.SFN_API_BASE||store.get('sfn-api-base')||'')+'/api/users';
async function umApi(path,o={}){
 const h={Accept:'application/json'},t=store.get('sfn-token'); if(t)h.Authorization='Bearer '+t; if(o.body)h['Content-Type']='application/json';
 let res; try{res=await fetch(umBase()+path+(o.query?'?'+o.query:''),{method:o.method||'GET',headers:h,body:o.body?JSON.stringify(o.body):undefined})}
 catch(e){throw {status:0,msg:L('تعذر الاتصال بالسيرفر','Cannot reach the server'),fields:{}}}
 let d=null; if(res.status!==204){try{d=await res.json()}catch(e){}}
 if(res.ok) return d;
 const fields={}; let msg=d&&(d.detail||d.title||d.message)||''; const er=d&&d.errors;
 if(er&&!Array.isArray(er)) Object.entries(er).forEach(([k,v])=>fields[k.charAt(0).toLowerCase()+k.slice(1)]=[].concat(v).join(' '));
 else if(Array.isArray(er)) msg=er.map(e=>e.description||e.message||e).join(' ');
 throw {status:res.status,msg,fields};
}
const umErr=e=>({401:L('انتهت الجلسة أو التوكن غير صالح','Session expired or invalid token'),403:L('ليس لديك صلاحية لتنفيذ هذا الإجراء (أو دور أعلى من رتبتك)','You are not allowed to do this (or the role outranks you)'),
 404:L('المستخدم غير موجود','User not found'),409:L('البريد الإلكتروني مستخدم بالفعل','This email is already in use')}[e.status]||e.msg||L('حدث خطأ غير متوقع','Unexpected error'));
const umErrBox=(e,retry)=>`<div class="error">${ic('error')}<b>${e.status===401?L('غير مصرّح','Unauthorized'):e.status===403?L('ممنوع','Forbidden'):L('حصلت مشكلة','Something went wrong')}</b><p>${esc(umErr(e))}</p>
 ${btn('refresh',L('إعادة المحاولة','Retry'),'sm',retry)} ${e.status===401?btn('key',L('ضبط الاتصال والتوكن','Set API & token'),'sm','umAuth()'):''}</div>`;
function umAuth(){openModal(modalHead(L('إعدادات الاتصال','API connection'))+`<div class="form-grid"><label class="full">API base URL<input id="ua-base" dir="ltr" placeholder="https://api.example.com" value="${esc(store.get('sfn-api-base')||'')}"></label>
 <label class="full">JWT token<input id="ua-tok" dir="ltr" value="${esc(store.get('sfn-token')||'')}"></label></div>
 <div class="actions" style="margin-top:16px">${btn('save',L('حفظ','Save'),'primary','umAuthSave()')}${btn('',L('إلغاء','Cancel'),'ghost','closeModal()')}</div>`)}
function umAuthSave(){store.set('sfn-api-base',document.getElementById('ua-base').value.trim().replace(/\/$/,''));store.set('sfn-token',document.getElementById('ua-tok').value.trim());closeModal();UM.dirty=1;render(true)}

// ---------- 3) حالة القائمة ----------
const UM={start:0,length:10,q:'',sort:'',dir:'asc',f:{},from:'',to:'',adv:false,rows:[],total:0,filt:0,st:'idle',err:null,draw:0,dirty:1,t:null,cur:null,fid:null};
const UM_COLS=[['firstName','الاسم الأول','First name'],['lastName','الاسم الأخير','Last name'],['email','البريد الإلكتروني','Email'],['phoneNumber','الهاتف','Phone'],['roles','الأدوار','Roles'],['isDisabled','الحالة','Status']];
function umQuery(){const p=new URLSearchParams();p.set('draw',UM.draw);p.set('start',UM.start);p.set('length',UM.length);
 if(UM.q.trim()){p.set('searchValue',UM.q.trim());['firstName','lastName','email','phoneNumber'].forEach(c=>p.append('searchableColumns',c))}
 if(UM.sort){p.set('sortColumnName',UM.sort);p.set('sortColumnDirection',UM.dir)}
 Object.entries(UM.f).forEach(([k,v])=>{if(v!=='')p.set(`columnFilters[${k}]`,v)});
 if(UM.from)p.set('startDate',UM.from+'T00:00:00'); if(UM.to)p.set('endDate',UM.to+'T23:59:59'); return p.toString()}
async function umLoad(){const d=++UM.draw;UM.st='loading';umPaint();
 try{const r=await umApi('/users',{query:umQuery()});if(d!==UM.draw)return;UM.rows=r.data||[];UM.total=r.recordsTotal||0;UM.filt=r.recordsFiltered??r.totalCount??0;UM.st='ok';UM.dirty=0}
 catch(e){if(d!==UM.draw)return;UM.st='error';UM.err=e} umPaint()}
const umStatus=u=>`<span class="chip ${u.isDisabled?'bad':'ok'}">${u.isDisabled?L('معطّل','Disabled'):L('نشط','Active')}</span>`;
const umRoles=a=>(a||[]).map(r=>`<span class="chip info">${esc(roleName(r))}</span>`).join(' ')||'—';
const umFind=id=>UM.rows.find(x=>x.id===id)||(UM.cur&&UM.cur.id===id?UM.cur:null);
function umActions(u){return `<div class="row-actions"><button class="ia" title="${L('عرض','View')}" aria-label="${L('عرض','View')}" onclick="go('users/${u.id}')">${ic('visibility')}</button>
 <button class="ia" title="${L('تعديل','Edit')}" aria-label="${L('تعديل','Edit')}" onclick="go('users/${u.id}/edit')">${ic('edit_note')}</button>
 <button class="ia" title="${u.isDisabled?L('تفعيل','Enable'):L('تعطيل','Disable')}" aria-label="toggle" onclick="umConfirm('toggle','${u.id}')">${ic(u.isDisabled?'check_circle':'block')}</button>
 <button class="ia" title="${L('فك القفل','Unlock')}" aria-label="unlock" onclick="umConfirm('unlock','${u.id}')">${ic('lock_open')}</button></div>`}
function umTable(){
 if(UM.st==='error') return umErrBox(UM.err,'umLoad()');
 if(UM.st!=='loading'&&!UM.rows.length) return emptyState(L('لا يوجد مستخدمون','No users found'),L('غيّر البحث أو الفلاتر.','Change the search or filters.'),btn('filter_alt_off',L('مسح الفلاتر','Clear filters'),'sm','umClear()'));
 if(!UM.rows.length) return '<div class="skel" style="height:300px;border-radius:14px"></div>';
 const th=([k,a,e])=>k==='roles'?`<th>${L(a,e)}</th>`:`<th class="um-th" onclick="umSort('${k}')">${L(a,e)}${UM.sort===k?ic(UM.dir==='asc'?'arrow_upward':'arrow_downward'):''}</th>`;
 return `<div class="um-count small muted">${L(`الإجمالي ${fmt(UM.total)} • بعد الفلترة ${fmt(UM.filt)}`,`Total ${UM.total} • Filtered ${UM.filt}`)}</div>
 <div class="table-wrap ${UM.st==='loading'?'um-busy':''}"><table><thead><tr>${UM_COLS.map(th).join('')}<th>${L('إجراءات','Actions')}</th></tr></thead><tbody>
 ${UM.rows.map(u=>`<tr><td>${esc(u.firstName)}</td><td>${esc(u.lastName)}</td><td dir="ltr" style="text-align:start">${esc(u.email)}</td><td dir="ltr" style="text-align:start">${esc(u.phoneNumber||'—')}</td>
 <td>${umRoles(u.roles)}</td><td>${umStatus(u)}</td><td>${umActions(u)}</td></tr>`).join('')}</tbody></table></div>
 ${pager(UM.filt,UM.length,Math.floor(UM.start/UM.length)+1,i=>`umPage(${i})`,['مستخدم','users'])}`}
function umPaint(){const b=document.getElementById('um-body');if(b)b.innerHTML=umTable()}
const umSort=k=>{UM.dir=UM.sort===k&&UM.dir==='asc'?'desc':'asc';UM.sort=k;UM.start=0;umLoad()};
const umPage=i=>{UM.start=(i-1)*UM.length;umLoad()};
const umQ=v=>{UM.q=v;UM.start=0;clearTimeout(UM.t);UM.t=setTimeout(umLoad,350)};
const umF=(k,v)=>{UM.f[k]=v;UM.start=0;umLoad()};
const umD=(k,v)=>{UM[k]=v;UM.start=0;umLoad()};
const umLen=v=>{UM.length=+v;UM.start=0;umLoad()};
const umAdv=()=>{UM.adv=!UM.adv;render(true)};
function umClear(){Object.assign(UM,{q:'',f:{},from:'',to:'',sort:'',dir:'asc',start:0,dirty:1});render(true)}

// ---------- 4) صفحة القائمة ----------
function umList(){
 setTimeout(()=>UM.dirty?umLoad():umPaint());
 const txt=(k,a,e)=>`<label class="field">${ic('search')}<input aria-label="${L(a,e)}" placeholder="${L(a,e)}" value="${esc(UM.f[k]||'')}" onchange="umF('${k}',this.value.trim())"></label>`;
 const sel=(k,label,opts)=>`<label class="field sel">${ic('filter_list')}<select aria-label="${label}" onchange="umF('${k}',this.value)"><option value="">${label}: ${L('الكل','All')}</option>${opts.map(([v,t])=>`<option value="${v}" ${UM.f[k]===v?'selected':''}>${t}</option>`).join('')}</select></label>`;
 return head([L('الرئيسية','Home'),L('المستخدمين','Users')],L('إدارة المستخدمين','User management'),L('عرض وإنشاء وتعديل حسابات المستخدمين والتحكم فيها.','View, create, edit and control user accounts.'),btn('person_add',L('إضافة مستخدم','Add user'),'primary',"go('users/new')"))+
 `<div class="card"><div class="filters"><label class="field grow">${ic('search')}<input placeholder="${L('ابحث بالاسم أو البريد أو الهاتف','Search name, email or phone')}" value="${esc(UM.q)}" oninput="umQ(this.value)"></label>
 ${sel('isDisabled',L('الحالة','Status'),[['false',L('نشط','Active')],['true',L('معطّل','Disabled')]])}
 <label class="field">${L('من','From')}<input type="date" value="${UM.from}" onchange="umD('from',this.value)"></label>
 <label class="field">${L('إلى','To')}<input type="date" value="${UM.to}" onchange="umD('to',this.value)"></label>
 <label class="field sel"><select aria-label="${L('عدد الصفوف','Rows')}" onchange="umLen(this.value)">${[10,25,50].map(n=>`<option ${UM.length===n?'selected':''}>${n}</option>`).join('')}</select></label>
 <button class="btn sm adv-btn ${UM.adv?'on':''}" onclick="umAdv()">${ic('tune')}${L('فلاتر الأعمدة','Column filters')}</button>
 <button class="icon-btn clr" title="${L('مسح الفلاتر','Clear filters')}" aria-label="${L('مسح الفلاتر','Clear filters')}" onclick="umClear()">${ic('filter_alt_off')}</button></div>
 ${UM.adv?`<div class="filters">${txt('firstName','الاسم الأول','First name')}${txt('lastName','الاسم الأخير','Last name')}${txt('email','البريد','Email')}${txt('phoneNumber','الهاتف','Phone')}</div>`:''}
 <div id="um-body"></div></div>`}

// ---------- 5) تفاصيل المستخدم ----------
function umDetailHtml(u){return `<div class="card-head"><div>${person(`${u.firstName} ${u.lastName}`,u.email)}</div>${umStatus(u)}</div>
 ${dl([[L('الاسم الأول','First name'),esc(u.firstName)],[L('الاسم الأخير','Last name'),esc(u.lastName)],[L('البريد الإلكتروني','Email'),`<span dir="ltr">${esc(u.email)}</span>`],
 [L('رقم الهاتف','Phone'),`<span dir="ltr">${esc(u.phoneNumber||'—')}</span>`],[L('الحالة','Status'),umStatus(u)],[L('المعرّف','ID'),`<span dir="ltr" class="small">${esc(u.id)}</span>`]])}
 <h4>${L('الأدوار','Roles')}</h4><div>${umRoles(u.roles)}</div>
 <div class="actions" style="margin-top:20px">${btn('edit_note',L('تعديل','Edit'),'primary',`go('users/${u.id}/edit')`)}
 ${btn(u.isDisabled?'check_circle':'block',u.isDisabled?L('تفعيل الحساب','Enable account'):L('تعطيل الحساب','Disable account'),'',`umConfirm('toggle','${u.id}')`)}${btn('lock_open',L('فك قفل الحساب','Unlock account'),'',`umConfirm('unlock','${u.id}')`)}</div>`}
async function umShowDetail(id){const box=document.getElementById('um-detail');if(!box)return;
 try{const u=await umApi('/users/'+encodeURIComponent(id));UM.cur=u;box.innerHTML=umDetailHtml(u)}
 catch(e){box.innerHTML=e.status===404?emptyState(L('المستخدم غير موجود','User not found'),L('ربما تم حذفه أو الرابط غير صحيح.','It may have been removed or the link is wrong.'),btn('arrow_back',L('رجوع للقائمة','Back to users'),'sm',"go('users')")):umErrBox(e,`umShowDetail('${id}')`)}}
function umDetail(id){setTimeout(()=>umShowDetail(id));
 return head([L('الرئيسية','Home'),L('المستخدمين','Users'),L('التفاصيل','Details')],L('تفاصيل المستخدم','User details'),L('الملف الكامل للمستخدم المحدد.','Full profile of the selected user.'),btn('arrow_back',L('رجوع','Back'),'ghost',"go('users')"))+
 `<div class="card" id="um-detail"><div class="skel" style="height:260px;border-radius:14px"></div></div>`}

// ---------- 6) إنشاء / تعديل ----------
function umValidate(v,edit){const e={},R=L('هذا الحقل مطلوب','This field is required'),len=s=>s.length>=3&&s.length<=100,LN=L('من 3 إلى 100 حرف','Must be 3–100 characters');
 ['firstName','lastName'].forEach(k=>{if(!v[k])e[k]=R;else if(!len(v[k]))e[k]=LN});
 if(!v.email)e.email=R;else if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email))e.email=L('صيغة البريد غير صحيحة','Invalid email address');
 if(!edit&&!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v.password||''))e.password=L('8 أحرف على الأقل وتشمل حرفًا كبيرًا وصغيرًا ورقمًا','At least 8 characters with upper-case, lower-case and a digit');
 if(!edit&&!v.phoneNumber)e.phoneNumber=R;else if(v.phoneNumber&&!/^\d{10}$/.test(v.phoneNumber))e.phoneNumber=L('يجب أن يكون 10 أرقام','Must be exactly 10 digits');
 if(!v.roles.length)e.roles=L('اختر دورًا واحدًا على الأقل','Select at least one role'); return e}
const umIn=(k,a,e,type,val,ph)=>`<label>${L(a,e)}<input id="uf-${k}" type="${type}" value="${esc(val||'')}" ${ph?`placeholder="${ph}"`:''} ${['email','phoneNumber','password'].includes(k)?'dir="ltr"':''} oninput="umClrErr('${k}')"><small class="u-err" id="ue-${k}"></small></label>`;
function umFormHtml(u,edit){const has=u.roles||[];
 return `<div id="um-banner"></div><div class="form-grid">${umIn('firstName','الاسم الأول','First name','text',u.firstName)}${umIn('lastName','الاسم الأخير','Last name','text',u.lastName)}
 ${umIn('email','البريد الإلكتروني','Email','email',u.email)}${umIn('phoneNumber','رقم الهاتف','Phone number','tel',u.phoneNumber,'0123456789')}
 ${edit?'':umIn('password','كلمة المرور','Password','password','')}
 <div class="full"><div class="small muted" style="margin-bottom:6px">${L('الأدوار (اختيار متعدد)','Roles (multi-select)')}</div><div class="um-roles">${ROLES.map(([k])=>{const dis=!umCanAssign(k),on=has.includes(k);
  return `<label class="um-role ${on?'on':''} ${dis?'dis':''}" ${dis?`title="${L('رتبته أعلى من أو تساوي رتبتك','Not below your rank')}"`:''}><input type="checkbox" value="${k}" ${on?'checked':''} ${dis?'disabled':''} onchange="this.parentNode.classList.toggle('on',this.checked);umClrErr('roles')">${esc(roleName(k))}</label>`}).join('')}</div><small class="u-err" id="ue-roles"></small></div></div>
 <div class="actions" style="margin-top:20px">${btn('save',edit?L('حفظ التعديلات','Save changes'):L('إنشاء المستخدم','Create user'),'primary','umSubmit()')}${btn('',L('إلغاء','Cancel'),'ghost',edit?`go('users/${u.id}')`:"go('users')")}</div>`}
async function umFormLoad(id){const box=document.getElementById('um-form');if(!box)return;
 try{const u=await umApi('/users/'+encodeURIComponent(id));UM.cur=u;box.innerHTML=umFormHtml(u,true)}
 catch(e){box.innerHTML=e.status===404?emptyState(L('المستخدم غير موجود','User not found'),'',btn('arrow_back',L('رجوع للقائمة','Back to users'),'sm',"go('users')")):umErrBox(e,`umFormLoad('${id}')`)}}
function umForm(id){UM.fid=id||null; setTimeout(()=>id?umFormLoad(id):0);
 return head([L('الرئيسية','Home'),L('المستخدمين','Users'),id?L('تعديل','Edit'):L('إضافة','Add')],id?L('تعديل مستخدم','Edit user'):L('إضافة مستخدم جديد','Add new user'),id?L('تعديل البيانات والأدوار (كلمة المرور لا تُعدَّل من هنا).','Update details and roles (password is not editable here).'):L('أنشئ حسابًا جديدًا وحدد أدواره.','Create a new account and assign roles.'),btn('arrow_back',L('رجوع','Back'),'ghost',id?`go('users/${id}')`:"go('users')"))+
 `<div class="card" id="um-form">${id?'<div class="skel" style="height:260px;border-radius:14px"></div>':umFormHtml({},false)}</div>`}
function umClrErr(k){const s=document.getElementById('ue-'+k);if(s)s.textContent='';const i=document.getElementById('uf-'+k);if(i)i.classList.remove('bad')}
function umShowErrs(errs){document.querySelectorAll('.u-err').forEach(s=>s.textContent='');document.querySelectorAll('.form-grid input.bad').forEach(i=>i.classList.remove('bad'));const other=[];
 Object.entries(errs).forEach(([k,m])=>{const s=document.getElementById('ue-'+k);if(s){s.textContent=m;const i=document.getElementById('uf-'+k);if(i)i.classList.add('bad')}else other.push(m)});
 const b=document.getElementById('um-banner');if(b)b.innerHTML=other.length?`<div class="um-alert">${ic('error')}<span>${esc(other.join(' '))}</span></div>`:'';
 const f=document.querySelector('.u-err:not(:empty)');if(f&&f.scrollIntoView)f.scrollIntoView({block:'center',behavior:'smooth'})}
async function umSubmit(){const g=k=>{const i=document.getElementById('uf-'+k);return i?i.value:''},edit=!!UM.fid;
 const v={firstName:g('firstName').trim(),lastName:g('lastName').trim(),email:g('email').trim(),phoneNumber:g('phoneNumber').trim(),roles:[...document.querySelectorAll('.um-role input:checked')].map(i=>i.value)};
 if(!edit)v.password=g('password'); const errs=umValidate(v,edit); umShowErrs(errs); if(Object.keys(errs).length)return;
 if(edit&&!v.phoneNumber)v.phoneNumber=null;
 const b=document.querySelector('#um-form .btn.primary');if(b){b.disabled=true;b.innerHTML=ic('progress_activity')+L('جاري الحفظ...','Saving...')}
 try{ if(edit){await umApi('/users/'+UM.fid,{method:'PUT',body:v});toast(L('تم تحديث المستخدم','User updated'));UM.dirty=1;go('users/'+UM.fid)}
  else{await umApi('/user',{method:'POST',body:v});toast(L('تم إنشاء المستخدم','User created'));UM.dirty=1;go('users')} }
 catch(e){const f={...e.fields}; if(e.status===409)f.email=umErr(e); else if(e.status!==400||!Object.keys(f).length)f._=umErr(e); umShowErrs(f);
  if(b){b.disabled=false;b.innerHTML=ic('save')+(edit?L('حفظ التعديلات','Save changes'):L('إنشاء المستخدم','Create user'))}}}

// ---------- 7) تفعيل/تعطيل وفك القفل (مع تأكيد) ----------
function umConfirm(kind,id){const u=umFind(id),dis=u&&u.isDisabled;
 const c=kind==='toggle'?(dis?[L('تفعيل الحساب؟','Enable this account?'),L('سيتمكن المستخدم من تسجيل الدخول مرة أخرى.','The user will be able to sign in again.')]:[L('تعطيل الحساب؟','Disable this account?'),L('سيُمنع المستخدم من تسجيل الدخول فورًا، ويمكنك إعادة تفعيله لاحقًا.','The user will be blocked from signing in immediately; you can re-enable later.')])
  :[L('فك قفل الحساب؟','Unlock this account?'),L('سيتم إلغاء القفل الناتج عن محاولات الدخول الفاشلة ويمكنه الدخول فورًا.','The lockout from failed sign-ins will be cleared so the user can sign in now.')];
 openModal(modalHead(c[0],u?`<span class="small muted" dir="ltr">${esc(u.email)}</span>`:'')+`<p class="muted">${c[1]}</p><div id="um-mer"></div>
 <div class="actions" style="margin-top:18px">${btn('check',L('تأكيد','Confirm'),'primary',`umRun('${kind}','${id}')`)}${btn('',L('إلغاء','Cancel'),'ghost','closeModal()')}</div>`)}
async function umRun(kind,id){const b=document.querySelector('#modal-root .btn.primary');if(b)b.disabled=true;
 try{await umApi(kind==='toggle'?'/Toggle-User/'+id:'/Unlock-User/'+id,{method:'POST'});
  if(kind==='toggle'){const u=umFind(id);if(u)u.isDisabled=!u.isDisabled}
  closeModal();toast(kind==='toggle'?L('تم تغيير حالة الحساب','Account status updated'):L('تم فك قفل الحساب','Account unlocked'));UM.dirty=1;
  const r=S.route||[]; if(S.page==='users'){if(r.length===1&&r[0]!=='new')umShowDetail(r[0]);else if(!r.length){umPaint();umLoad()}}}
 catch(e){if(b)b.disabled=false;const m=document.getElementById('um-mer');if(m)m.innerHTML=`<div class="um-alert">${ic('error')}<span>${esc(umErr(e))}</span></div>`}}

// ---------- 8) الصفحة + الـ routing الداخلي (#users, #users/new, #users/ID, #users/ID/edit) ----------
P.users=()=>{const r=S.route||[];return !r.length?umList():r[0]==='new'?umForm():r[1]==='edit'?umForm(r[0]):umDetail(r[0])};
(()=>{const s=document.createElement('style');s.textContent=`.um-th{cursor:pointer;user-select:none}.um-th .ms{font-size:16px;margin-inline-start:4px}.um-busy{opacity:.55;pointer-events:none}.um-count{margin-bottom:8px}
.u-err{color:var(--danger);min-height:0;font-size:12px}.form-grid input.bad{border-color:var(--danger)}.um-roles{display:flex;flex-wrap:wrap;gap:8px}
.um-role{display:inline-flex!important;flex-direction:row!important;align-items:center;gap:6px!important;padding:7px 12px;border:1px solid var(--border);border-radius:20px;background:var(--surface2);color:var(--text)!important;cursor:pointer;font-size:13px!important}
.um-role.on{background:var(--lime-soft);border-color:var(--lime)}.um-role.dis{opacity:.45;cursor:not-allowed}.um-role input{accent-color:var(--lime);margin:0}
.um-alert{display:flex;gap:8px;align-items:center;background:var(--danger-soft);color:var(--danger);border-radius:10px;padding:10px 12px;margin-bottom:14px;font-size:14px}
@media(max-width:640px){.form-grid{grid-template-columns:1fr}}`;document.head.appendChild(s)})();
