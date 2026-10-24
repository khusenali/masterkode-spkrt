const nz=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const G=D.G,S=D.S,K=D.K,CM={};
D.C.forEach(c=>{CM[c[0]]={k:c[0],n:c[1],t:' '+nz(c[1]),q:c[2].map(x=>({c:x[0],n:x[1],t:' '+nz(x[1])}))}});
const CL=D.C.map(c=>CM[c[0]]),VS=new Set();
CL.forEach(c=>{c.t.trim().split(' ').forEach(w=>w&&VS.add(w));c.q.forEach(q=>q.t.trim().split(' ').forEach(w=>w&&VS.add(w)))});
const V=[...VS].sort();
const has=t=>{let lo=0,hi=V.length;while(lo<hi){const m=(lo+hi)>>1;if(V[m]<t)lo=m+1;else hi=m}return lo<V.length&&V[lo].startsWith(t)};
const lev=(a,b)=>{let p=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){const c=[i];for(let j=1;j<=b.length;j++)c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=c}return p[b.length]};
const near=t=>{const mx=t.length<=4?1:2;let b=null,bd=9;for(const w of V){if(Math.abs(w.length-t.length)>mx)continue;const d=lev(t,w);if(d<bd||(d===bd&&b&&w.length<b.length)){bd=d;b=w}}return bd<=mx?b:null};
const AL={telor:'telur',cabe:'cabai',cabai_:'cabai',galon_:'galon',odol:'pasta gigi',hp:'telepon seluler'};
function fixToks(q){let f=false;q=nz(q).split(' ').map(w=>AL[w]||w).join(' ');const toks=nz(q).split(' ').filter(Boolean).map(t=>{if(/\d/.test(t)||has(t))return t;const n=near(t);if(n){f=true;return n}return t});return{toks,f}}
const hit=(t,tk)=>tk.every(w=>t.includes(' '+w));
function search(q){
 const raw=q.trim(),E={c:[],q:[],fix:'',nc:0,nq:0};if(!raw)return E;
 const dg=raw.replace(/[\s.\-·]/g,'');
 if(/^\d+$/.test(dg)){
  const c=CL.filter(x=>x.k.startsWith(dg.slice(0,7))&&(dg.length>7||x.k.startsWith(dg)));const ql=[];
  if(dg.length>7)for(const x of c)for(const y of x.q)if((x.k+y.c).startsWith(dg))ql.push({c:x,q:y});
  return{...E,c:dg.length>7?[]:c.slice(0,15),nc:c.length,q:ql.slice(0,40),nq:ql.length}}
 const{toks,f}=fixToks(raw);if(!toks.length)return E;
 const c=CL.filter(x=>hit(x.t,toks)),a=x=>x.t.startsWith(' '+toks[0])?0:1;
 c.sort((x,y)=>a(x)-a(y)||x.n.length-y.n.length);
 const ql=[];
 if(toks.length>1||!c.length){for(const x of CL)for(const y of x.q){const t=x.t+y.t;if(hit(t,toks)&&!hit(x.t,toks))ql.push({c:x,q:y,l:t.length})}ql.sort((x,y)=>x.l-y.l)}
 return{c:c.slice(0,15),nc:c.length,q:ql.slice(0,40),nq:ql.length,fix:f?toks.join(' '):''}}
function matchLine(raw){
 const cl=raw.replace(/rp\.?\s*[\d.,]+/gi,' ').replace(/\b\d+([.,]\d+)?\s*(kg|kilo|gram|gr|g|ons|ltr|liter|l|ml|pcs|buah|biji|bks|bungkus|btl|botol|sachet|dus|karton|lembar|butir|ekor|ikat|porsi)\b/gi,' ').replace(/\b\d{4,}\b/g,' ');
 const{toks}=fixToks(cl);if(!toks.length)return[];const T=toks.length,r=[];
 for(const x of CL){
  const m=toks.filter(w=>x.t.includes(' '+w)),rem=toks.filter(w=>!m.includes(w));let bm=0,qs=[];
  if(rem.length)for(const y of x.q){let n=0;for(const w of rem)if(y.t.includes(' '+w))n++;if(n>bm){bm=n;qs=[y]}else if(n&&n==bm)qs.push(y)}
  if(!m.length&&!bm)continue;
  const sc=(m.length+bm)/T,mc=m.length;
  if(qs.length)qs.sort((a,b)=>a.n.length-b.n.length).slice(0,3).forEach(q=>r.push({x,q,sc,mc,ex:toks.filter(w=>(x.t+q.t+' ').includes(' '+w+' ')).length,tb:x.n.length+q.n.length}));
  else r.push({x,q:x.q[0],sc,mc,ex:toks.filter(w=>(x.t+' ').includes(' '+w+' ')).length,tb:x.n.length+60})}
 return r.sort((a,b)=>b.sc-a.sc||b.ex-a.ex||b.mc-a.mc||a.tb-b.tb).slice(0,8)}
