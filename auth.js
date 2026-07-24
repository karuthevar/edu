(function(){
  let client=null;
  function configured(){const c=window.APP_CONFIG||{};return c.supabaseUrl&&c.supabaseAnonKey&&!c.supabaseUrl.startsWith('YOUR_')&&!c.supabaseAnonKey.startsWith('YOUR_')}
  function getClient(){if(client)return client;if(!configured())return null;client=window.supabase.createClient(window.APP_CONFIG.supabaseUrl,window.APP_CONFIG.supabaseAnonKey);return client}
  function initials(name){return (name||'S').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase()}
  async function session(){const c=getClient();if(!c)return null;const {data}=await c.auth.getSession();return data.session}
  async function profile(userId){const c=getClient();if(!c||!userId)return null;const {data}=await c.from('profiles').select('*').eq('id',userId).maybeSingle();return data}
  async function updateNav(){const nav=document.querySelector('.links');if(!nav)return;const s=await session();document.querySelectorAll('.auth-nav').forEach(x=>x.remove());if(s){const p=await profile(s.user.id);const name=p?.display_name||'Student';nav.insertAdjacentHTML('beforeend',`<span class="user-chip auth-nav">${escapeHtml(name)}</span><a class="auth-nav" href="profile.html">Profile</a><button class="icon-btn auth-nav" id="signOutBtn">Sign out</button>`);document.getElementById('signOutBtn').onclick=async()=>{await getClient().auth.signOut();location.href='index.html'}}else{nav.insertAdjacentHTML('beforeend','<a class="auth-nav" href="signin.html">Sign in</a><a class="button auth-nav" href="signup.html">Sign up</a>')}}
  function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]))}
  window.StudentHub={configured,getClient,session,profile,updateNav,escapeHtml,initials};
  document.addEventListener('DOMContentLoaded',updateNav);
})();