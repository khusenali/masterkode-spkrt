const nz=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const G=D.G,S=D.S,K=D.K,CM={};
D.C.forEach(c=>{CM[c[0]]={k:c[0],n:c[1],t:' '+nz(c[1]),q:c[2].map(x=>({c:x[0],n:x[1],t:' '+nz(x[1])}))}});
const CL=D.C.map(c=>CM[c[0]]),VS=new Set();
CL.forEach(c=>{c.t.trim().split(' ').forEach(w=>w&&VS.add(w));c.q.forEach(q=>q.t.trim().split(' ').forEach(w=>w&&VS.add(w)))});
const V=[...VS].sort();
const has=t=>{let lo=0,hi=V.length;while(lo<hi){const m=(lo+hi)>>1;if(V[m]<t)lo=m+1;else hi=m}return lo<V.length&&V[lo].startsWith(t)};
const lev=(a,b)=>{let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[b.length]};
const near=t=>{const mx=t.length<=4?1:2;let b=null,bd=9;for(const w of V){if(Math.abs(w.length-t.length)>mx)continue;const d=lev(t,w);if(d<bd||(d===bd&&b&&w.length<b.length)){bd=d;b=w}}return bd<=mx?b:null};
const UNITS=new Set(['kg','kilo','gram','gr','g','ons','ltr','liter','l','ml','pcs','buah','biji','bks','bungkus','btl','botol','sachet','dus','karton','lembar','butir','ekor','ikat','porsi','va']),OPT=t=>/^\d+$/.test(t)||UNITS.has(t);
const AL={ijo:'hijau',item:'hitam',abang:'merah',telor:'telur',cabe:'cabai',cabai_:'cabai',galon_:'galon',odol:'pasta gigi',hp:'telepon seluler',sampo:'shampo',sampoo:'shampo'};
const LOC={asar:'asap'};
const PF=['peng','meng','pem','men','mem','per','ber','ter','pe','me','di','se','ke',''],SF=['nya','kan','an','i',''];
function derive(t,hw){hw=hw||has;for(const a of PF)if(t.startsWith(a))for(const b of SF){if(!a&&!b)continue;if(b&&!t.endsWith(b))continue;const r=t.slice(a.length,t.length-b.length);if(r.length>=4&&hw(r))return r}return null}
function kamus(arr,fx){if(typeof KAM=='undefined')return arr;if(!KAM.s){KAM.sort((a,b)=>b[0].split(' ').length-a[0].split(' ').length);KAM.s=1}const mk=arr.map(()=>0);for(const[k,v]of KAM){const kt=k.split(' '),vt=v.split(' ');for(let i=0;i+kt.length<=arr.length;i++){if(mk[i]||kt.some((w,j)=>arr[i+j]!==w||mk[i+j]))continue;if(k!==v)fx.push([k,v,'k']);arr.splice(i,kt.length,...vt);mk.splice(i,kt.length,...vt.map(()=>1));i+=vt.length-1}}return arr}
const nearAll=t=>{const mx=t.length<=4?1:2,o=[];for(const w of V){if(Math.abs(w.length-t.length)>mx)continue;const d=lev(t,w);if(d<=mx)o.push([d,w])}o.sort((a,b)=>a[0]-b[0]||(DF[b[1]]||0)-(DF[a[1]]||0)||a[1].length-b[1].length);return o.slice(0,3).map(x=>x[1])};
const ALLT=()=>CL.all||(CL.all=1,CL.forEach(x=>{x.all=x.t+x.q.map(y=>y.t).join('')}),1);
function fixToks(q,o){o=o||{};ALLT();const fx=[];const a1=nz(q).split(' ').filter(Boolean).map(w=>{const b=AL[w];if(b&&b!==w){fx.push([w,b,'b']);return b}return w}),bk=fx.length?a1.join(' '):'';
 const arr=kamus(a1.join(' ').split(' ').filter(Boolean),fx),sug=[],hw=o.loose?has:(t=>VS.has(t)),st=arr.map(t=>(/\d/.test(t)||hw(t)||UNITS.has(t))?1:0);let f=fx.length>0;
 const toks=arr.map((t,i)=>{if(st[i])return t;const d=derive(t,hw);if(d){f=true;fx.push([t,d,'t']);return d}
  const c=nearAll(t);if(!c.length)return t;const oth=arr.filter((u,j)=>j!=i&&st[j]&&!/^\d+$/.test(u));let pick=null;
  if(oth.length)pick=c.find(w=>CL.some(x=>x.all.includes(' '+w)&&oth.every(u=>x.all.includes(' '+u))))||null;
  if(!pick&&o.loose)pick=c[0];
  if(pick){f=true;fx.push([t,pick,'t']);sug.push({t,o:c,on:pick});return pick}
  sug.push({t,o:c,on:null});return t});
 return{toks,f,fx,sug,bk}}
const DF={};CL.forEach(c=>{const st=new Set(c.t.trim().split(' '));c.q.forEach(y=>y.t.trim().split(' ').forEach(w=>st.add(w)));st.forEach(w=>{if(w)DF[w]=(DF[w]||0)+1})});
const QC={};CL.forEach(x=>x.q.forEach(y=>{const k=y.t.trim();(QC[k]=QC[k]||new Set()).add(x.k)}));
const idf=w=>Math.log(1+CL.length/(DF[w]||1));
const hit=(t,tk)=>tk.every(w=>t.includes(' '+w));
function search(q){
 const raw=q.trim(),E={c:[],q:[],fix:'',nc:0,nq:0};if(!raw)return E;
 const dg=raw.replace(/[\s.\-·]/g,'');
 if(/^\d+$/.test(dg)){
  const c=CL.filter(x=>x.k.startsWith(dg.slice(0,7))&&(dg.length>7||x.k.startsWith(dg)));const ql=[];
  if(dg.length>7)for(const x of c)for(const y of x.q)if((x.k+y.c).startsWith(dg))ql.push({c:x,q:y});
  return{...E,c:dg.length>7?[]:c.slice(0,15),nc:c.length,q:ql.slice(0,40),nq:ql.length}}
 const{toks,f}=fixToks(raw,{loose:true});if(!toks.length)return E;
 const c=CL.filter(x=>hit(x.t,toks)),a=x=>x.t.startsWith(' '+toks[0])?0:1;
 c.sort((x,y)=>a(x)-a(y)||x.n.length-y.n.length);
 const ql=[];
 if(toks.length>1||!c.length){for(const x of CL)for(const y of x.q){const t=x.t+y.t;if(hit(t,toks)&&!hit(x.t,toks))ql.push({c:x,q:y,l:t.length})}ql.sort((x,y)=>x.l-y.l)}
 return{c:c.slice(0,15),nc:c.length,q:ql.slice(0,40),nq:ql.length,fix:f?toks.join(' '):''}}
const cleanLine=raw=>raw.replace(/rp\.?\s*[\d.,]+/gi,' ').replace(/\b\d{4,}\b/g,' ');
const AN={};function analyze(raw){if(AN[raw])return AN[raw];const a=fixToks(cleanLine(raw));a.toks=a.toks.filter(t=>!STP.has(t));a.cap=a.fx.length?.8:1;a.nh=a.fx.some(f=>f[2]=='k');return AN[raw]=a}
/* Skor = kata cocok / max(kata input, kata di hasil). Kata di hasil = nama komoditas (tanpa tanda kurung) + kata kualitas yang cocok.
   Tinggi >= .99, sedang >= .5. "Kurang detail" = semua kata input cocok tetapi hasil punya kata tambahan. Kata yang dikoreksi membatasi skor maks .8. */
const STP=new Set(['dan','atau','yang','untuk']),sw=(ws,t)=>ws.includes(t);
/* Kata umum: boleh tidak cocok tanpa menurunkan skor, tidak dianggap kata inti, dan bila hanya itu yang cocok hasil jadi rendah. */
const GENW=new Set(['ongkos','biaya','tarif','harga','iuran','uang','bayar','pembayaran','sumbangan','jasa','beli','tiket']);
const DQ={};CL.forEach(x=>{const st=new Set();x.q.forEach(y=>y.t.trim().split(' ').forEach(w=>w&&st.add(w)));st.forEach(w=>DQ[w]=(DQ[w]||0)+1)});
function alts(x){return x._al||(x._al=x.n.split('/').map((s,i,A)=>{const p=[],m=s.replace(/\(([^)]*)\)/g,(_,g)=>{p.push(...nz(g).split(' ').filter(Boolean));return' '});let w=nz(m).split(' ').filter(w=>w&&!STP.has(w));if(i>0&&w.length<=2){const f=nz(A[0].replace(/\([^)]*\)/g,' ')).split(' ').filter(v=>v&&!STP.has(v));if(f.length>=3)w=f.slice(0,-1).concat(w)}return{w,p}}).filter(a=>a.w.length||a.p.length))}
const qw=y=>y._w||(y._w=y.t.trim().split(' ').filter(Boolean));
function altU(x){const l=alts(x);return x._au||(x._au=l.length>1?[...l,{w:[...new Set(l.flatMap(a=>a.w))],p:[...new Set(l.flatMap(a=>a.p))]}]:l)}
function score2(toks,x,y,cap,nh){let best=null;
 for(const a of altU(x)){let m=0,D=a.w.length;const rest=[],r2=[],mt=new Set();for(const t of toks){if(sw(a.w,t)){m++;mt.add(t)}else rest.push(t)}
  for(const t of rest){if(sw(a.p,t)){m++;D++;mt.add(t)}else r2.push(t)}
  let mq=0,qx=0,qe=false;if(y){const w=qw(y);for(const t of r2)if(sw(w,t)){mq++;mt.add(t)}if(mq)qx=w.filter(v=>!r2.includes(v)).length;qe=mq>0&&QC[y.t.trim()].size==1&&w.every(v=>toks.includes(v))&&toks.every(t=>sw(w,t))&&(toks.length>1||(DQ[toks[0]]||0)<=3)}
  const tot=m+mq;if(!tot)continue;const un=toks.filter(t=>!mt.has(t)),ug=un.filter(t=>GENW.has(t)||OPT(t)).length,Te=Math.max(1,toks.length-ug),Dd=D+mq,ratio=tot/Math.max(Te,Dd),nx=a.w.filter(v=>!toks.includes(v)).length,full=un.length==ug;
  const hd=toks.find(t=>!GENW.has(t)&&!OPT(t)),low=![...mt].some(t=>!GENW.has(t)&&!OPT(t))||(!nh&&Te>1&&hd&&!mt.has(hd));
  /* tinggi: semua kata inti cocok DAN (nama komoditas tanpa kata lebih, atau input persis nama kualitas yang spesifik). Selain itu sedang (>= .5) atau rendah. Kata inti (pertama) tidak cocok, atau hanya kata umum yang cocok: rendah. kd = semua cocok tetapi hasil punya kata tambahan, atau komoditas punya >1 kualitas dan kualitasnya tidak diketik. */
  const sp=qe&&toks.some(OPT);let st=full&&(nx==0||qe)?1:full?Math.max(.5,Math.min(.9,ratio)):Math.min(.9,ratio),kd=full&&(nx>0||qx>0||(mq==0&&x.q.length>1));
  if(low){st=Math.min(st,.45);kd=false}
  const kl=full&&mq==0&&!low;
  if(!best||st>best.st||(st==best.st&&(kd?1:0)<(best.kd?1:0))||(st==best.st&&kd==best.kd&&nx<best.nx))best={st,kd,nx,m,kl:kl||(sp&&!low),fl:full&&!low}}
 return best?{sc:Math.min(cap,best.st),kd:best.kd,mc:best.m,nx:best.nx,kl:best.kl,fl:best.fl}:null}
function pairInfo(raw,k,q){const a=analyze(raw),x=CM[k];if(!x||!a.toks.length)return{sc:0,kd:false};const s=score2(a.toks,x,x.q.find(z=>z.c==q),a.cap,a.nh);return s?{sc:s.sc,kd:s.kd}:{sc:0,kd:false}}
function matchLine(raw){
 const a=analyze(raw),toks=a.toks,out=[];out.a=a;if(!toks.length)return out;
 const pr=x=>(x.t.startsWith(' '+toks[0])?0:2)+(x.k[0]=='0'?0:1);
 for(const x of CL){const b=score2(toks,x,null,a.cap,a.nh);
  const al=altU(x),rest=toks.filter(t=>!al.some(q=>sw(q.w,t)||sw(q.p,t)));let bm=0,qs=[];if(rest.length)for(const y of x.q){let n=0;const w=qw(y);for(const t of rest)if(!OPT(t)&&sw(w,t))n++;if(n>bm){bm=n;qs=[y]}else if(n&&n==bm)qs.push(y)}
  if(!b&&!qs.length)continue;
  const ws=toks.reduce((s,w)=>s+((x.t+(qs[0]?qs[0].t:'')).includes(' '+w)?idf(w):0),0);
  const push=(y,tb)=>{const s=score2(toks,x,y,a.cap,a.nh);out.push({x,q:y,sc:s.sc,kd:s.kd,nx:s.nx,mc:s.mc,kl:s.kl,fl:s.fl,ws,ex:toks.filter(w=>(x.t+(y.t||'')+' ').includes(' '+w+' ')).length,tb,pr:pr(x)})};
  if(qs.length)qs.sort((p,q)=>p.n.length-q.n.length).slice(0,3).forEach(y=>push(y,x.n.length+y.n.length));else push(x.q[0],x.n.length+60)}
 const tr=r=>r.sc<.5?3:r.kl?0:r.fl?1:2,pc=r=>PROC.test(r.x.n)?1:0;out.sort((p,q)=>tr(p)-tr(q)||q.sc-p.sc||p.nx-q.nx||pc(p)-pc(q)||q.ws-p.ws||q.ex-p.ex||q.mc-p.mc||p.pr-q.pr||(p.x.k<q.x.k?-1:p.x.k>q.x.k?1:0)||p.tb-q.tb||(p.kd?1:0)-(q.kd?1:0));const top=out.slice(0,8);top.a=a;return top}
/* ---- Saran kode untuk Referensi Ikan ---- */
const PROC=/DIAWETKAN|ASIN|BEKU|KALENG|ASAP|PANGGANG|BAKSO|NUGGET|SOSIS|GILING|KERING|TEMPURA|OTAK|PEDA|SALAI|MANGUT|SURIMI|ROLL|CAVIAR|MENTAH|ANAK|CAMPUR|LAINNYA|TELUR/,STOP=['ikan','basah','segar','iwak'],GEN=['merah','putih','hitam','kuning','biru','laut','sungai','besar','kecil','sedang','hijau'];
const toks=s=>nz(String(s||'').replace(/^\s*U\.\s+/i,'Udang ')).split(' ').filter(w=>w&&!STOP.includes(w));
const teq=(a,b)=>a==b||(a.length>=5&&b.length>=5&&Math.abs(a.length-b.length)<=2&&lev(a,b)<=(Math.min(a.length,b.length)>=8?2:1));
const has2=(tk,alt)=>alt.every(w=>tk.some((x,i)=>x==w||(i==0&&x[0]==w[0]&&teq(x,w))));
let FP=null;const fpool=()=>FP||(FP=CL.filter(c=>c.k.startsWith('0113')&&!PROC.test(c.n)).map(c=>({c,alts:c.n.split('/').map(toks).filter(t=>t.length)})));
function hitsFor(names){let out=[];for(const nm of names){const tk=toks(nm);if(!tk.length)continue;for(const p of fpool())for(const alt of p.alts)if(has2(tk,alt))out.push({c:p.c,alt,tk,ex:alt.every(w=>tk.includes(w)),sp:alt.length+(tk.length==alt.length?.5:0)})}
 if(out.some(h=>h.ex))out=out.filter(h=>h.ex);
 out.sort((a,b)=>b.sp-a.sp||a.c.n.length-b.c.n.length);const seen=new Set(),r=[];for(const h of out){if(seen.has(h.c.k))continue;if(r.length&&h.sp<r[0].sp)break;seen.add(h.c.k);r.push(h);if(r.length>=2)break}return r}
function qualOf(h){const rem=h.tk.filter(w=>!h.alt.some(a=>teq(a,w)));if(!rem.length)return[];return h.c.q.filter(y=>rem.every(w=>y.t.includes(' '+w)||nz(y.n).split(' ').some(z=>teq(z,w)))).slice(0,2)}
const genus=e=>String(e.s||'').trim().split(/\s+/)[0].toLowerCase();
function baseHits(e){return e._b||(e._b=(()=>{let h=hitsFor(e.n),src='nama';if(!h.length){h=hitsFor(String(e.e||'').split(/[,;]/));src='inggris'}return{h,src}})())}
function similar(e){const tk=[...new Set(e.n.flatMap(toks))].filter(w=>w.length>=5&&!GEN.includes(w)),out=[];
 for(const p of fpool())for(const alt of p.alts){const m=alt.filter(w=>tk.some(x=>teq(x,w)));if(m.length&&m.length<alt.length){out.push({c:p.c,q:[],src:'mirip',sc:m.length/alt.length});break}}
 return out.sort((a,b)=>b.sc-a.sc||a.c.n.length-b.c.n.length).slice(0,3)}
function fishSuggest(e){if(e._sg)return e._sg;let res=[];const man=(e.kom||[]).filter(k=>CM[k]);
 if(man.length)res=man.map(k=>{const c=CM[k],h=hitsFor(e.n).find(x=>x.c.k==k);return{c,q:h?qualOf(h):qualOf({c,alt:toks(c.n.split('/')[0]),tk:toks(e.n[0])}),src:'manual'}});
 else{const b=baseHits(e);if(b.h.length)res=b.h.map(h=>({c:h.c,q:qualOf(h),src:b.src,fz:!h.ex}));
  if(!res.length){const gk=genus(e),mem=gk?IKAN.filter(x=>x!==e&&x.k==e.k&&genus(x)==gk):[];if(mem.length){const cnt={};for(const m of mem){const hh=baseHits(m).h[0];if(hh)cnt[hh.c.k]=(cnt[hh.c.k]||0)+1}const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];if(best&&best[1]>=Math.max(2,Math.ceil(mem.length/2)))res=[{c:CM[best[0]],q:[],src:'kelompok',g:gk[0].toUpperCase()+gk.slice(1)}]}}
  if(!res.length&&e.lok&&e.lok.length)res=hitsFor(e.lok).map(h=>({c:h.c,q:qualOf(h),src:'lokal',fz:!h.ex}));
  if(!res.length)res=similar(e)}
 return e._sg=res}
