/* tema tersimpan dibaca lebih awal agar loader tidak berkedip warna */
try{var p=JSON.parse(localStorage.getItem("spk_p")||"{}");if(p.tv==2&&p.t)document.documentElement.setAttribute("data-t",p.t)}catch(e){}

/* pengaman loader: pesan bila lambat, dan bila gagal muat atau error */
(function(){var lt=null;
function ui(s,r){var e=document.getElementById("ldt");if(!e)return;e.textContent=s;if(r&&!document.getElementById("ldr")){var b=document.createElement("button");b.id="ldr";b.textContent="Atur ulang & muat ulang";b.onclick=function(){heal()};e.parentNode.appendChild(b)}}
function heal(auto){if(auto&&navigator.onLine===false)return false;try{if(auto){if(sessionStorage.getItem("spk_heal"))return false;sessionStorage.setItem("spk_heal","1")}}catch(x){}
 var go=function(){location.replace(location.pathname+"?r="+Date.now())};
 try{var a=[];if(navigator.serviceWorker&&navigator.serviceWorker.getRegistrations)a.push(navigator.serviceWorker.getRegistrations().then(function(l){return Promise.all(l.map(function(x){return x.unregister()}))}));
 try{a.push(Promise.all([].map.call(document.querySelectorAll("script[src],link[rel=stylesheet]"),function(x){return fetch(x.src||x.href,{cache:"reload"}).catch(function(){})})))}catch(x){}
 if(window.caches)a.push(caches.keys().then(function(k){return Promise.all(k.map(function(x){return caches.delete(x)}))}));
 Promise.all(a).then(go,go);setTimeout(go,6000)}catch(x){go()}return true}
window.__heal=function(m,auto){ui(m);return heal(auto)};
setTimeout(function(){ui("Masih memuat… koneksi atau HP sedang lambat")},6000);
setTimeout(function(){ui("Memuat terlalu lama. Coba atur ulang.",1)},20000);
addEventListener("error",function(e){if(!document.getElementById("ldt"))return;if(!(e&&e.target&&e.target.tagName)&&!(e.filename&&e.filename.indexOf(location.origin)===0))return;
 if(e&&e.target&&e.target.tagName==="SCRIPT"){ui("Gagal memuat data. Periksa koneksi, lalu atur ulang.",1);return}
 var m=String(e&&e.message||"").slice(0,80);ui("Terjadi kesalahan"+(m?": "+m:"")+". Mengatur ulang…",1);heal(true)},true)})();
