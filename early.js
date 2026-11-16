/* tema tersimpan dibaca lebih awal agar loader tidak berkedip warna */
try{var p=JSON.parse(localStorage.getItem("spk_p")||"{}");if(p.tv==2&&p.t)document.documentElement.setAttribute("data-t",p.t)}catch(e){}

/* pengaman loader: pesan bila lambat, dan bila gagal muat */
(function(){function t(s,r){var e=document.getElementById("ldt");if(!e)return;e.textContent=s;if(r&&!document.getElementById("ldr")){var b=document.createElement("button");b.id="ldr";b.textContent="Muat ulang";b.onclick=function(){location.reload()};e.parentNode.appendChild(b)}}
setTimeout(function(){t("Masih memuat… koneksi atau HP sedang lambat")},6000);
setTimeout(function(){t("Memuat terlalu lama. Coba muat ulang.",1)},20000);
addEventListener("error",function(e){if(e&&e.target&&e.target.tagName==="SCRIPT")t("Gagal memuat data. Periksa koneksi, lalu muat ulang.",1)},true)})();
