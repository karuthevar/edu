
(() => {
 const current=location.pathname.split('/').pop()||'index.html';
 const items=[['index.html','Home'],['grades.html','Grades'],['subjects.html','Subjects'],['formula-theorem-centre.html','Formulas'],['glossary.html','Glossary'],['course-planner.html','Planner'],['forum.html','Forum']];
 const nav=document.querySelector('nav .nav'), links=nav?.querySelector('.links');
 if(links) links.innerHTML=items.map(([u,n])=>`<a href="${u}"${current===u?' class="active"':''}>${n}</a>`).join('')+'<span id="auth-slot"></span>';
 if(nav&&!document.getElementById('navToggle')){const b=document.createElement('button');b.id='navToggle';b.className='nav-toggle';b.textContent='☰';b.setAttribute('aria-label','Toggle navigation');nav.insertBefore(b,links);b.onclick=()=>nav.classList.toggle('open')}
 const bar=document.getElementById('pageProgress'); if(bar){const f=()=>{const d=document.documentElement,m=d.scrollHeight-d.clientHeight;bar.style.width=(m?Math.round(d.scrollTop/m*100):100)+'%'};addEventListener('scroll',f,{passive:true});f()}
 document.addEventListener('click',e=>{const b=e.target.closest('[data-bookmark]');if(!b)return;const k='bookmark:'+b.dataset.bookmark,s=localStorage.getItem(k)==='1';localStorage.setItem(k,s?'0':'1');b.textContent=s?'☆ Save':'★ Saved';b.classList.toggle('saved',!s)});
 document.querySelectorAll('[data-bookmark]').forEach(b=>{const s=localStorage.getItem('bookmark:'+b.dataset.bookmark)==='1';b.textContent=s?'★ Saved':'☆ Save';b.classList.toggle('saved',s)});
})();
