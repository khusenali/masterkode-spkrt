/* tema tersimpan dibaca lebih awal agar loader tidak berkedip warna */
try{var p=JSON.parse(localStorage.getItem("spk_p")||"{}");if(p.tv==2&&p.t)document.documentElement.setAttribute("data-t",p.t)}catch(e){}
