
const data=window.STUDY_DATA;
const container=document.getElementById('definitionSections');
const subjectOrder=['physics','chemistry','biology','math','earth'];
function renderDefinitions(){
 container.innerHTML='';
 subjectOrder.forEach(key=>{
   const s=data.subjects[key];
   const sec=document.createElement('section');
   sec.className='subject-section'; sec.id=key; sec.dataset.subject=key;
   sec.innerHTML=`<div class="subject-head"><div class="subject-icon">${s.icon}</div><div><h2>${s.title} Definitions</h2><p>${s.intro}</p></div></div>
   <div class="study-grid">${s.definitions.map(([term,def,ex])=>`<article class="study-card searchable" data-subject="${key}" data-text="${(term+' '+def+' '+ex).toLowerCase()}"><h3>${term}</h3><p>${def}</p><div class="example"><strong>Example:</strong> ${ex}</div></article>`).join('')}</div>`;
   container.appendChild(sec);
 });
}
renderDefinitions();

document.getElementById('lawsGrid').innerHTML=data.laws.map(([name,law,ex])=>`<article class="law-card searchable" data-subject="laws" data-text="${(name+' '+law+' '+ex).toLowerCase()}"><span class="pill">Law / Principle</span><h3>${name}</h3><p>${law}</p><div class="example"><strong>Example:</strong> ${ex}</div></article>`).join('');
document.getElementById('formulaBody').innerHTML=data.formulas.map(([n,f,u,e])=>`<tr class="searchable" data-subject="formulas" data-text="${(n+' '+f+' '+u+' '+e).toLowerCase()}"><td><strong>${n}</strong></td><td><div class="formula">${f}</div></td><td><span class="units">${u}</span></td><td>${e}</td></tr>`).join('');

const quizWrap=document.getElementById('quizWrap');
quizWrap.innerHTML=data.quiz.map((q,i)=>`<article class="quiz-card" data-answer="${q[2]}"><h3>${i+1}. ${q[0]}</h3>${q[1].map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}"> ${o}</label>`).join('')}</article>`).join('');
document.getElementById('checkQuiz').addEventListener('click',()=>{
 let score=0;
 document.querySelectorAll('.quiz-card').forEach(card=>{
   card.querySelectorAll('.option').forEach(x=>x.classList.remove('correct','incorrect'));
   const selected=card.querySelector('input:checked');
   const ans=Number(card.dataset.answer);
   const opts=[...card.querySelectorAll('.option')];
   opts[ans].classList.add('correct');
   if(selected){
     if(Number(selected.value)===ans) score++;
     else selected.closest('.option').classList.add('incorrect');
   }
 });
 document.getElementById('score').textContent=`Score: ${score} / ${data.quiz.length}`;
});

let active='all';
const search=document.getElementById('search');
function applyFilters(){
 const q=search.value.trim().toLowerCase();
 document.querySelectorAll('.searchable').forEach(el=>{
   const subject=el.dataset.subject;
   const subjectMatch=active==='all'||subject===active||(active==='definitions'&&subjectOrder.includes(subject));
   const textMatch=!q||el.dataset.text.includes(q);
   el.classList.toggle('hidden',!(subjectMatch&&textMatch));
 });
 document.querySelectorAll('.subject-section').forEach(sec=>{
   const visible=sec.querySelectorAll('.searchable:not(.hidden)').length>0;
   sec.classList.toggle('hidden',!visible || (active!=='all' && active!=='definitions' && active!==sec.dataset.subject));
 });
 document.getElementById('lawsSection').classList.toggle('hidden',!(active==='all'||active==='laws')||!([...document.querySelectorAll('#lawsGrid .searchable')].some(x=>!x.classList.contains('hidden'))));
 document.getElementById('formulasSection').classList.toggle('hidden',!(active==='all'||active==='formulas')||!([...document.querySelectorAll('#formulaBody .searchable')].some(x=>!x.classList.contains('hidden'))));
 document.getElementById('quizSection').classList.toggle('hidden',!(active==='all'||active==='quiz'));
}
search.addEventListener('input',applyFilters);
document.querySelectorAll('.filter-btn').forEach(btn=>btn.addEventListener('click',()=>{
 document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));
 btn.classList.add('active'); active=btn.dataset.filter; applyFilters();
}));
