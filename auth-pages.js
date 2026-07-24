document.addEventListener('DOMContentLoaded',()=>{
 const form=document.querySelector('[data-auth-form]'); if(!form)return;
 const msg=document.getElementById('formMessage');
 function show(text,type='error'){msg.textContent=text;msg.className=`form-message show ${type}`}
 if(!StudentHub.configured()){show('Authentication is not connected yet. Add your Supabase URL and anon key in supabase-config.js.','error');}
 form.addEventListener('submit',async e=>{
  e.preventDefault(); const c=StudentHub.getClient(); if(!c)return show('Connect Supabase first.');
  const submit=form.querySelector('button[type=submit]');submit.disabled=true;
  try{
   if(form.dataset.authForm==='signup'){
    const displayName=form.display_name.value.trim(),email=form.email.value.trim(),password=form.password.value;
    if(displayName.length<3||displayName.length>30)return show('Display name must be 3–30 characters.');
    if(!/^[A-Za-z0-9 _-]+$/.test(displayName))return show('Use letters, numbers, spaces, hyphens, or underscores in the display name.');
    if(password.length<8)return show('Password must be at least 8 characters.');
    if(!form.rules.checked)return show('You must accept the community rules.');
    const {data,error}=await c.auth.signUp({email,password,options:{data:{display_name:displayName}}}); if(error)throw error;
    show(data.session?'Account created. Redirecting…':'Check your email to confirm your account, then sign in.','success');
    if(data.session)setTimeout(()=>location.href='forum.html',800);
   }else if(form.dataset.authForm==='signin'){
    const {error}=await c.auth.signInWithPassword({email:form.email.value.trim(),password:form.password.value});if(error)throw error;
    show('Signed in. Redirecting…','success');setTimeout(()=>location.href='forum.html',500);
   }else if(form.dataset.authForm==='reset'){
    const redirectTo=new URL('reset-password.html',location.href).href;
    const {error}=await c.auth.resetPasswordForEmail(form.email.value.trim(),{redirectTo});if(error)throw error;show('Password reset email sent.','success');
   }else if(form.dataset.authForm==='new-password'){
    const pw=form.password.value;if(pw.length<8)return show('Password must be at least 8 characters.');const {error}=await c.auth.updateUser({password:pw});if(error)throw error;show('Password updated. You may now sign in.','success');
   }
  }catch(err){show(err.message||'Something went wrong.')}finally{submit.disabled=false}
 });
});