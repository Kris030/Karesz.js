const t = "404 This Page Doesn't Exist", p = document.getElementById('msg');
for (let i = 0; i < t.length; i++)setTimeout(_=>{p.innerHTML += t.charAt(i)}, i * 150)