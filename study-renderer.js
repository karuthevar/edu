(function(){
  const D=window.GRADE_DATA;
  const byId=id=>document.getElementById(id);
  const root=byId('definitionSections');
  if(!D||!root){
    const target=document.querySelector('main')||document.body;
    target.insertAdjacentHTML('afterbegin','<div class="curriculum-note"><strong>Content loading error:</strong> The study data could not be loaded. Check that the grade data file is deployed beside this page.</div>');
    return;
  }
  const order=['physics','chemistry','biology','math','earth'];
  order.forEach(k=>{
    const s=D.subjects[k]; if(!s)return;
    const e=document.createElement('section'); e.id=k;e.className='subject-section';e.dataset.subject=k;
    e.innerHTML=`<div class="subject-head"><div class="subject-icon">${s[1]}</div><div><h2>${s[0]} Definitions</h2><p>${s[2]}</p></div></div><div class="study-grid">${s[3].map(x=>`<article class="study-card searchable" data-subject="${k}" data-text="${x.join(' ').toLowerCase().replace(/"/g,'&quot;')}"><h3>${x[0]}</h3><p>${x[1]}</p><div class="example"><strong>Example:</strong> ${x[2]}</div></article>`).join('')}</div>`;
    root.appendChild(e);
  });
  const laws=byId('lawsGrid'), formulas=byId('formulaBody'), quiz=byId('quizWrap');
  if(laws) laws.innerHTML=D.laws.map(x=>`<article class="law-card searchable" data-subject="laws" data-text="${x.join(' ').toLowerCase().replace(/"/g,'&quot;')}"><span class="pill">Law / Principle</span><h3>${x[0]}</h3><p>${x[1]}</p><div class="example"><strong>Meaning:</strong> ${x[2]}</div></article>`).join('');
  if(formulas) formulas.innerHTML=D.formulas.map(x=>`<tr class="searchable" data-subject="formulas" data-text="${x.join(' ').toLowerCase().replace(/"/g,'&quot;')}"><td><strong>${x[0]}</strong></td><td><div class="formula">${x[1]}</div></td><td><span class="units">${x[2]}</span></td><td>${x[3]}</td></tr>`).join('');
  if(quiz) quiz.innerHTML=D.quiz.map((q,i)=>`<article class="quiz-card" data-answer="${q[2]}"><h3>${i+1}. ${q[0]}</h3>${q[1].map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join('')}</article>`).join('');
  const check=byId('checkQuiz'), score=byId('score');
  if(check) check.onclick=()=>{let n=0;document.querySelectorAll('.quiz-card').forEach(c=>{c.querySelectorAll('.option').forEach(o=>o.classList.remove('correct','incorrect'));let a=+c.dataset.answer,s=c.querySelector('input:checked'),opts=[...c.querySelectorAll('.option')];if(opts[a])opts[a].classList.add('correct');if(s){if(+s.value===a)n++;else s.closest('.option').classList.add('incorrect')}});if(score)score.textContent=`Score: ${n} / ${D.quiz.length}`};
  let active='all'; const search=byId('search');
  function filter(){let q=(search?.value||'').toLowerCase().trim();document.querySelectorAll('.searchable').forEach(e=>{let ok=active==='all'||e.dataset.subject===active||(active==='definitions'&&order.includes(e.dataset.subject));e.classList.toggle('hidden',!(ok&&(!q||(e.dataset.text||'').includes(q))))});document.querySelectorAll('.subject-section').forEach(s=>{if(order.includes(s.dataset.subject||''))s.classList.toggle('hidden',!s.querySelector('.searchable:not(.hidden)'))});[['lawsSection','laws'],['formulasSection','formulas'],['quizSection','quiz']].forEach(([id,key])=>{const el=byId(id);if(el)el.classList.toggle('hidden',!(active==='all'||active===key))})}
  if(search)search.oninput=filter;
  document.querySelectorAll('.filter-btn').forEach(b=>b.onclick=()=>{document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));b.classList.add('active');active=b.dataset.filter;filter()});
})();