const $=s=>document.querySelector(s),esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const LS={g(k,d){try{const v=localStorage.getItem('spk_'+k);return v?JSON.parse(v):d}catch(e){return d}},s(k,v){try{localStorage.setItem('spk_'+k,JSON.stringify(v))}catch(e){}}};
let P=Object.assign({t:'midnight',d:'home',f:'plain'},LS.g('p',{})),FV=LS.g('fv',[]),RQ=LS.g('rq',[]),RC=LS.g('rc',[]),NAV=[{v:'home'}],pend=null,FQ=LS.g('fq',[]),ftab='k',scan=LS.g('sc',[]),scanTxt='',pick=null;
let G2=Object.assign({code:'',max:5,warn:50,ok:false},LS.g('gm',{})),GU=LS.g('gu',{d:'',n:0}),shown=25,flt='all',busy='';const today=()=>new Date().toISOString().slice(0,10);
const NOTICE='Foto dikirim lewat server layanan ke Google (Gemini API). Pada tier gratis, Google dapat memakai data untuk meningkatkan produknya dan peninjau manusia dapat membacanya. Jangan memotret nama, alamat, atau data pribadi responden. Lanjutkan?';
const bump=(a,x)=>[x,...a.filter(y=>y!==x)].slice(0,5),sv=()=>{LS.s('p',P);LS.s('fv',FV);LS.s('rq',RQ);LS.s('rc',RC);LS.s('sc',scan);LS.s('fq',FQ);LS.s('gm',G2)};
const fc=c=>c.length>4?c.slice(0,4)+' '+c.slice(4):c,fsp=c=>c.slice(0,2)+' '+c[2]+' '+c[3]+' '+c.slice(4);
const full=(k,q)=>P.f=='plain'?k+q:fsp(k)+' '+q;
const LN={G:'KELOMPOK',S:'SUBKELOMPOK',K:'KELAS'},cur=()=>[...NAV].reverse().find(x=>!x.o),TOP=['home','fav','scan','set'],lay=()=>NAV[NAV.length-1];
const SI='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
function toast(m){const t=$('#toast');t.textContent=m;t.className='on';clearTimeout(toast.h);toast.h=setTimeout(()=>t.className='',1400)}
function copy(txt,msg){const done=()=>toast(msg||'Tersalin: '+txt);try{navigator.clipboard.writeText(txt).then(done,fb)}catch(e){fb()}function fb(){const a=document.createElement('textarea');a.value=txt;document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}a.remove();done()}}
const row=(cd,nm,at,sub)=>`<div class="row" ${at}><b class="cd">${esc(cd)}</b><span>${esc(nm)}${sub?`<small>${esc(sub)}</small>`:''}</span><i>›</i></div>`;
const rowC=c=>row(fc(c.k),c.n,`data-a="comm" data-k="${c.k}"`,c.q.length+' kualitas');
const sec=t=>`<div class="sec">${t}</div>`;
function crumbs(code){let h='';if(code.length>=2)h+=row(code.slice(0,2),G[code.slice(0,2)],`data-a="node" data-l="G" data-c="${code.slice(0,2)}"`);if(code.length>=3)h+=row(fc(code.slice(0,3)),S[code.slice(0,3)],`data-a="node" data-l="S" data-c="${code.slice(0,3)}"`);if(code.length>=4)h+=row(fc(code.slice(0,4)),K[code.slice(0,4)],`data-a="node" data-l="K" data-c="${code.slice(0,4)}"`);return h}
function V_home(){return`<div class="sb" data-a="srch">${SI}<span>Cari kode / nama komoditas…</span></div>`+
(FQ.length?sec('FAVORIT KUALITAS (KETUK UNTUK SALIN)')+`<div class="chips">${FQ.map(t=>{const c=CM[t.slice(0,7)],y=c&&c.q.find(z=>z.c==t.slice(7));return c?`<button class="chip" data-a="cp" data-t="${t}">${esc(c.n)} · ${esc(y?y.n:t.slice(7))}</button>`:''}).join('')}</div>`:'')+(FV.length?sec('FAVORIT KOMODITAS')+`<div class="chips">${FV.map(k=>`<button class="chip" data-a="comm" data-k="${k}">${esc(CM[k].n)}</button>`).join('')}</div>`:'')+
(RC.length?sec('KOMODITAS TERAKHIR')+RC.map(k=>rowC(CM[k])).join(''):'')+
sec('EKSPLORASI')+Object.keys(G).sort().map(g=>row(g,G[g],`data-a="node" data-l="G" data-c="${g}"`)).join('')}
function V_node(l,c){const T={G:S,S:K,K:null}[l],ch=l=='K'?CL.filter(x=>x.k.startsWith(c)).map(rowC).join(''):Object.keys(T).sort().filter(k=>k.startsWith(c)).map(k=>row(fc(k),T[k],`data-a="node" data-l="${l=='G'?'S':'K'}" data-c="${k}"`)).join('');
 const nm={G:G,S:S,K:K}[l][c];return`<span class="tag g">SPKRT 2027</span><span class="tag">${fc(c)}</span><span class="mu">${LN[l]}</span><h2>${esc(nm)}</h2>`+(c.length>2?sec('SEBELUMNYA')+crumbs(c.slice(0,-1)):'')+sec('TURUNAN')+ch}
function V_comm(k){const x=CM[k];return`<div style="display:flex;align-items:center"><div style="flex:1"><span class="tag g">SPKRT 2027</span><span class="tag">${fc(k)}</span><span class="mu">KOMODITAS</span></div><button class="st ${FV.includes(k)?'on':''}" data-a="fav" data-k="${k}">${FV.includes(k)?'★':'☆'}</button></div><h2>${esc(x.n)}</h2>`+sec('SEBELUMNYA')+crumbs(k.slice(0,4))+sec(`KUALITAS (${x.q.length})`)+`<input type="search" id="qf" placeholder="Filter kualitas…" data-k="${k}" style="margin-bottom:10px"><div id="ql">${qlist(k,'')}</div>`}
function qlist(k,f){const x=CM[k],tk=nz(f).split(' ').filter(Boolean),r=x.q.filter(y=>!tk.length||tk.every(w=>y.t.includes(' '+w))||y.c.startsWith(f.trim()));return r.map(y=>`<div class="row" data-a="cp" data-t="${k}${y.c}"><b class="cd">${y.c}</b><span>${esc(y.n)}<small>${fc(k)} ${y.c}</small></span><button class="st ${FQ.includes(k+y.c)?'on':''}" data-a="favq" data-t="${k}${y.c}">${FQ.includes(k+y.c)?'★':'☆'}</button><button class="btn s o" data-a="cp" data-t="${k}${y.c}">Salin</button></div>`).join('')||'<p class="mu">Tidak ada.</p>'}
function V_fav(){const tb=`<div class="chips" style="margin-bottom:10px"><button class="chip" data-a="ftab" data-v="k" ${ftab=='k'?'style="border-color:var(--ac)"':''}>Komoditas (${FV.length})</button><button class="chip" data-a="ftab" data-v="q" ${ftab=='q'?'style="border-color:var(--ac)"':''}>Kualitas (${FQ.length})</button></div>`;
 if(ftab=='k')return tb+(FV.length?FV.map(k=>`<div class="row" data-a="comm" data-k="${k}"><b class="cd">${fc(k)}</b><span>${esc(CM[k].n)}<small>${CM[k].q.length} kualitas</small></span><button class="st on" data-a="fav" data-k="${k}">★</button></div>`).join(''):'<p class="mu">Belum ada favorit komoditas. Buka komoditas lalu ketuk ☆.</p>');
 return tb+(FQ.length?FQ.filter(t=>CM[t.slice(0,7)]).map(t=>{const k=t.slice(0,7),q=t.slice(7),c=CM[k],y=c.q.find(z=>z.c==q);return`<div class="row" data-a="comm" data-k="${k}"><b class="cd">${fc(k)} ${q}</b><span>${esc(y?y.n:q)}<small>${esc(c.n)}</small></span><button class="btn s o" data-a="cp" data-t="${t}">Salin</button><button class="st on" data-a="favq" data-t="${t}" data-r="1">★</button></div>`}).join(''):'<p class="mu">Belum ada favorit kualitas. Ketuk ☆ pada baris kualitas di halaman komoditas.</p>')}
function V_set(){const o=(a,v,l)=>`<div class="opt ${P[a]==v?'on':''}" data-a="set" data-p="${a}" data-v="${v}">${l}</div>`;
return sec('TEMA')+`<div class="th">${[['midnight','Midnight','Gelap'],['slate','Slate','Gelap'],['parchment','Parchment','Terang'],['sky','Sky','Terang']].map(t=>`<div class="${P.t==t[0]?'on':''}" data-a="set" data-p="t" data-v="${t[0]}"><b>${t[1]}</b><small>${t[2]}</small></div>`).join('')}</div>`+
sec('LAYAR AWAL')+o('d','home','Beranda')+o('d','scan','Scan daftar')+o('d','fav','Favorit')+sec('FORMAT SALIN KODE')+o('f','plain','Polos: 0111001155')+o('f','sp','Per komponen: 01 1 1 001 155')+sec('LAYANAN BACA FOTO')+gset()+sec('DATA')+`<button class="btn o" data-a="clr">Hapus riwayat pencarian & terakhir</button> <button class="btn o" data-a="clrf">Hapus favorit</button><p class="mu">${CL.length} komoditas · ${CL.reduce((a,c)=>a+c.q.length,0)} kualitas · Buku 5 Master SPKRT 2027.</p>`}
function conf(s){return s>=.99?['h','tinggi']:s>=.5?['m','sedang']:['l','rendah']}
function scanRow(r,i){const c=CM[r.k],cs=r.cands.includes(r.k)?r.cands:[r.k,...r.cands],cf=conf(r.sc);
return`<div class="sc"><div class="raw">${esc(r.raw)} <span class="cf ${cf[0]}">${cf[1]}</span> <button class="btn s o" data-a="rm" data-i="${i}" style="float:right">Hapus</button></div>
<select data-a="sk" data-i="${i}">${cs.map(k=>`<option value="${k}" ${k==r.k?'selected':''}>${esc(CM[k].n)}</option>`).join('')}</select>
<select data-a="sq" data-i="${i}" style="margin-top:6px">${c.q.map(y=>`<option value="${y.c}" ${y.c==r.q?'selected':''}>${y.c} · ${esc(y.n)}</option>`).join('')}</select>
<div class="cc"><span>${fc(r.k)} ${r.q}</span><span><button class="btn s o" data-a="oth" data-i="${i}">Cari lain</button> <button class="btn s" data-a="cp" data-t="${r.k+r.q}">Salin</button></span></div></div>`}
function V_scan(){const ck=r=>conf(r.sc)[0]!='h',L=scan.map((r,i)=>[r,i]).filter(x=>flt=='all'||ck(x[0])),n=scan.filter(ck).length,td=GU.d==today()?GU.n:0;
return`<div class="sc"><b>Foto tulisan tangan / nota</b><details style="margin:8px 0"><summary class="mu">Pengaturan layanan${G2.code?' · kode akses terisi':''}</summary>${gset()}<button class="btn s o" data-a="tes" style="margin-top:8px">Tes koneksi</button></details><p class="mu">Maks ${G2.max} foto per proses, dikirim sebagai satu permintaan. Foto terang, lurus, satu halaman. Hasil baca masuk ke kotak teks di bawah untuk diperiksa dan diedit sebelum dicocokkan.</p><input type="file" id="ph" accept="image/*" multiple><div style="margin-top:8px;display:flex;gap:10px;align-items:center"><button class="btn" data-a="ocr">Baca foto</button><span class="mu">Permintaan hari ini: ${td}</span></div></div><div class="mu" id="ost" style="margin:6px 2px">${esc(busy)}</div><b>Daftar teks</b><p class="mu">Tempel daftar panjang: satu barang per baris, boleh bernomor atau dipisah koma. Tiap baris dicarikan kodenya (jalan tanpa internet).</p><textarea id="stx" placeholder="beras IR 64 5 kg&#10;minyak goreng 2 L&#10;telor ayam 1 kg">${esc(scanTxt)}</textarea><div style="margin:10px 0;display:flex;gap:8px;flex-wrap:wrap"><button class="btn" data-a="match">Cocokkan</button>${scan.length?'<button class="btn o" data-a="cpall">Salin semua</button><button class="btn o" data-a="clrs">Kosongkan</button>':''}</div>`+(scan.length?`<div class="chips" style="margin-bottom:10px"><button class="chip" data-a="flt" data-v="all" ${flt=='all'?'style="border-color:var(--ac)"':''}>Semua (${scan.length})</button><button class="chip" data-a="flt" data-v="chk" ${flt=='chk'?'style="border-color:var(--ac)"':''}>Perlu dicek (${n})</button></div>`:'')+L.slice(0,shown).map(x=>scanRow(x[0],x[1])).join('')+(L.length>shown?`<button class="btn o" data-a="more">Tampilkan lebih banyak (${L.length-shown})</button>`:'')}
const shrink=async f=>{const b=await createImageBitmap(f),s=Math.min(1,1600/Math.max(b.width,b.height)),c=document.createElement('canvas');c.width=Math.round(b.width*s);c.height=Math.round(b.height*s);c.getContext('2d').drawImage(b,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.85).split(',')[1]};
const cfgOk=()=>CFG.proxy&&!/GANTI/.test(CFG.proxy);
const em=s=>s==401?'Kode akses salah atau belum diisi. Isi di panel "Pengaturan layanan".':s==429?'Batas harian atau kuota gratis habis (429). Coba lagi nanti atau besok.':s==413||s==400?'Foto terlalu besar atau terlalu banyak. Kurangi jumlah foto.':s==403?'Alamat app tidak diizinkan oleh server (403).':'Layanan gagal ('+s+'). Coba lagi nanti.';
async function call(body){if(!cfgOk())throw new Error('Alamat proxy belum diatur di config.js.');const r=await fetch(CFG.proxy,{method:'POST',headers:{'Content-Type':'application/json','X-Access-Code':G2.code},body:JSON.stringify(body)});const j=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(em(r.status));e.s=r.status;throw e}return j}
async function ocr(){const fs=[...$('#ph').files];if(!fs.length)return toast('Pilih foto dulu');
 if(!cfgOk())return toast('Alamat proxy belum diatur di config.js');
 if(!G2.ok){if(!confirm(NOTICE))return;G2.ok=true;sv()}
 let files=fs;if(fs.length>G2.max){files=fs.slice(0,G2.max);toast(`Dibatasi ${G2.max} foto per proses. ${fs.length-G2.max} foto diabaikan.`)}
 const td=today();if(GU.d!=td)GU={d:td,n:0};
 if(GU.n>=G2.warn&&!confirm(`Sudah ${GU.n} permintaan hari ini (batas peringatan ${G2.warn}). Kuota gratis Google terbatas dan bisa habis. Lanjutkan?`))return;
 $('#ost').textContent='Membaca '+files.length+' foto…';let e401=0;
 try{const im=[];for(const f of files)im.push(await shrink(f));
  const j=await call({mode:'ocr',images:im});GU.n++;LS.s('gu',GU);const a=j.items||[];
  scanTxt=(scanTxt.trim()?scanTxt.trim()+'\n':'')+a.join('\n');busy='Selesai: '+a.length+' baris. Periksa dan edit teks, lalu ketuk Cocokkan.'}catch(e){busy=e.message||'Gagal membaca foto. Periksa koneksi.';e401=e.s==401}
 render.k=1;render();if(e401){const dt=document.querySelector('details');if(dt)dt.open=true}}
async function tes(){$('#ost').textContent='Menguji koneksi…';
 try{await call({mode:'ping'});if(GU.d!=today())GU={d:today(),n:0};GU.n++;LS.s('gu',GU);busy='Koneksi berhasil. Layanan baca foto siap dipakai.'}catch(e){busy=e.message||'Tidak ada koneksi internet.'}
 render.k=1;render()}
const gset=()=>`<p class="mu">Kode akses (isi jika diminta pengelola)</p><input type="password" id="gc" value="${esc(G2.code)}" autocomplete="off"><p class="mu">Maks foto per proses</p><select id="gx">${[1,3,5].map(n=>`<option ${n==G2.max?'selected':''}>${n}</option>`).join('')}</select><p class="mu">Peringatan setelah berapa permintaan per hari</p><input type="text" id="gw" inputmode="numeric" value="${G2.warn}">`;
function render(){document.documentElement.dataset.t=P.t;const s=cur(),root=TOP.includes(s.v),T={home:'Kode SPKRT 2027',fav:'Favorit',scan:'Scan daftar',set:'Pengaturan',node:'Telusur',comm:'Komoditas'}[s.v];
 const body={home:V_home,fav:V_fav,scan:V_scan,set:V_set,node:()=>V_node(s.l,s.c),comm:()=>V_comm(s.k)}[s.v]();
 $('#app').innerHTML=`<header><button class="ib" data-a="${root?'menu':'back'}">${root?'☰':'←'}</button><h1>${T}</h1><button class="ib" data-a="srch">${SI}</button></header><main>${body}</main>`;if(!render.k)window.scrollTo(0,0);render.k=0}
history.replaceState({d:0},'');
function sync(){const t=lay();$('#dr').hidden=t.o!='dr';$('#sr').hidden=t.o!='sr';if(t.o!='sr')pick=null;if(!t.o){if(sync.w)render.k=1;render()}sync.w=!!t.o}
function push(e){NAV.push(e);history.pushState({d:NAV.length-1},'');sync()}
const go=s=>push(s),goBack=()=>{if(NAV.length>1)history.back()},after=f=>{pend=f;history.back()};
window.addEventListener('popstate',e=>{const d=e.state&&e.state.d>=0?e.state.d:0;while(NAV.length>d+1)NAV.pop();sync();if(pend){const f=pend;pend=null;f()}});
function drawer(){const n=[['home','Beranda'],['scan','Scan daftar'],['fav','Favorit ('+(FV.length+FQ.length)+')'],['set','Pengaturan']];push({o:'dr'});$('#dr').innerHTML=`<nav><b>Kode SPKRT</b><small>Master komoditas & kualitas 2027</small>${n.map(x=>`<div class="it ${cur().v==x[0]?'on':''}" data-a="nav" data-v="${x[0]}">${x[1]}</div>`).join('')}</nav><div class="sh" data-a="shut"></div>`}
function openS(cb){pick=cb||null;const s=$('#sr');push({o:'sr'});s.innerHTML=`<div class="top"><input type="search" id="q" placeholder="Cari kode/nama komoditas, kualitas" autocomplete="off"><button data-a="cancel">BATAL</button></div><div id="sres"></div>`;$('#q').focus();sres()}
function sres(){const q=$('#q').value,o=$('#sres');if(!q.trim()){o.innerHTML=(RQ.length?sec('PENCARIAN SEBELUMNYA')+`<div class="chips">${RQ.map(x=>`<button class="chip" data-a="rq" data-q="${esc(x)}">${esc(x)}</button>`).join('')}</div>`:'')+(RC.length?sec('KOMODITAS DILIHAT SEBELUMNYA')+RC.map(k=>row(fc(k),CM[k].n,`data-a="rcomm" data-k="${k}"`)).join(''):'');return}
 const r=search(q);let h=r.fix?`<p class="mu">Menampilkan hasil untuk: <b>${esc(r.fix)}</b></p>`:'';
 h+=r.c.length?sec(`KOMODITAS (${r.nc})`)+r.c.map(c=>row(fc(c.k),c.n,`data-a="rcomm" data-k="${c.k}"`,c.q.length+' kualitas')).join(''):'';
 h+=r.q.length?sec(`KUALITAS (${r.nq})`)+r.q.map(y=>`<div class="row" data-a="rcomm" data-k="${y.c.k}"><b class="cd">${fc(y.c.k)} ${y.q.c}</b><span>${esc(y.c.n)} · ${esc(y.q.n)}</span><button class="btn s" data-a="cp" data-t="${y.c.k+y.q.c}">Salin</button></div>`).join(''):'';
 o.innerHTML=h||'<p class="mu">Tidak ditemukan. Coba kata lain atau kode.</p>'}
const shutS=()=>goBack();
async function doMatch(){scanTxt=$('#stx').value;let L=scanTxt.split('\n');if(L.length==1&&(scanTxt.match(/[,;]/g)||[]).length>=2)L=scanTxt.split(/[,;]/);L=L.map(x=>x.replace(/^\s*(\d+[.)]|[-•*])\s*/,'').trim()).filter(Boolean);if(L.length>500){toast('Dibatasi 500 baris per proses');L=L.slice(0,500)}
 scan=[];shown=25;flt='all';for(let i=0;i<L.length;i++){const m=matchLine(L[i]);scan.push(m.length?{raw:L[i],k:m[0].x.k,q:m[0].q.c,sc:m[0].sc,cands:m.map(a=>a.x.k)}:{raw:L[i],k:CL[0].k,q:CL[0].q[0].c,sc:0,cands:[CL[0].k]});if(i%10==9){$('#ost').textContent='Mencocokkan '+(i+1)+'/'+L.length+'…';await new Promise(r=>setTimeout(r))}}
 busy='';sv();render()}
document.addEventListener('click',e=>{const el=e.target.closest('[data-a]');if(!el||el.tagName=='SELECT'||el.tagName=='INPUT')return;const a=el.dataset.a,d=el.dataset;e.stopPropagation();
 if(a=='favq'){const t=d.t;FQ=FQ.includes(t)?FQ.filter(x=>x!=t):[t,...FQ];sv();if(d.r){render.k=1;render()}else{el.textContent=FQ.includes(t)?'★':'☆';el.classList.toggle('on',FQ.includes(t))}return}
 if(a=='ftab'){ftab=d.v;render();return}
 if(a=='cp'){e.stopPropagation();const t=d.t;copy(P.f=='plain'?t:fsp(t.slice(0,7))+' '+t.slice(7));return}
 if(a=='menu')drawer();else if(a=='shut')goBack();else if(a=='back')goBack()
 else if(a=='nav'){const n=NAV.length-1,v=d.v,f=()=>{NAV=[{v:'home'}];if(v!='home')push({v});else sync()};if(n>0){pend=f;history.go(-n)}else f()}
 else if(a=='srch')openS();else if(a=='cancel')shutS();
 else if(a=='node')go({v:'node',l:d.l,c:d.c});
 else if(a=='comm'){RC=bump(RC,d.k);sv();go({v:'comm',k:d.k})}
 else if(a=='rcomm'){const q=$('#q').value.trim();if(q.length>1)RQ=bump(RQ,q);const cb=pick;if(cb){after(()=>cb(d.k));return}RC=bump(RC,d.k);sv();after(()=>go({v:'comm',k:d.k}))}
 else if(a=='rq'){$('#q').value=d.q;sres()}
 else if(a=='fav'){FV=FV.includes(d.k)?FV.filter(x=>x!=d.k):[d.k,...FV];sv();render()}
 else if(a=='set'){P[d.p]=d.v;sv();render()}
 else if(a=='clr'){RQ=[];RC=[];sv();toast('Riwayat dihapus')}else if(a=='clrf'){FV=[];FQ=[];sv();toast('Favorit dihapus')}
 else if(a=='match')doMatch();else if(a=='ocr')ocr();else if(a=='tes')tes();else if(a=='more'){shown+=25;render.k=1;render()}else if(a=='flt'){flt=d.v;shown=25;render()}
 else if(a=='rm'){scan.splice(+d.i,1);sv();render.k=1;render()}
 else if(a=='clrs'){scan=[];scanTxt='';sv();render()}
 else if(a=='oth'){const i=+d.i;openS(k=>{scan[i].k=k;scan[i].q=CM[k].q[0].c;if(!scan[i].cands.includes(k))scan[i].cands.unshift(k);scan[i].sc=1;sv();render()})}
 else if(a=='cpall')copy(scan.map(r=>[r.raw,full(r.k,r.q),CM[r.k].n+' - '+CM[r.k].q.find(y=>y.c==r.q).n].join('\t')).join('\n'),'Semua baris tersalin')});
document.addEventListener('change',e=>{const el=e.target,i=+el.dataset.i;if(el.id=='gc'){G2.code=el.value.trim();sv();return}if(el.id=='gx'){G2.max=+el.value;sv();return}if(el.id=='gw'){G2.warn=Math.max(1,+el.value||50);sv();return}if(el.dataset.a=='sk'){scan[i].k=el.value;scan[i].q=CM[el.value].q[0].c;scan[i].sc=Math.max(scan[i].sc,.5)}else if(el.dataset.a=='sq')scan[i].q=el.value;else return;sv();render.k=1;render()});
document.addEventListener('input',e=>{if(e.target.id=='q')sres();else if(e.target.id=='stx')scanTxt=e.target.value;else if(e.target.id=='qf')$('#ql').innerHTML=qlist(e.target.dataset.k,e.target.value)});
document.addEventListener('keydown',e=>{if(e.target.id=='q'&&e.key=='Enter'){const q=e.target.value.trim();if(q.length>1){RQ=bump(RQ,q);sv()}e.target.blur()}if(e.key=='Escape'&&lay().o=='sr')shutS()});
if(P.d!='home'&&TOP.includes(P.d)){NAV.push({v:P.d});history.pushState({d:1},'')}sync();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});
