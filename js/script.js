// Year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu
const burger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
burger?.addEventListener('click', () => {
  nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', nav.classList.contains('open'));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Theme toggle
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
if (savedTheme) html.setAttribute('data-theme', savedTheme);
themeToggle?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme') || 'auto';
  const next = current === 'light' ? 'dark' : current === 'dark' ? 'auto' : 'light';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
});

// Reveal on scroll
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
}, {threshold:.12});
revealEls.forEach(el => io.observe(el));

// Counters (optional numeric animations)
const counters = document.querySelectorAll('[data-animate="counter"]');
const ioCounters = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ animateCounter(e.target, parseInt(e.target.dataset.target||'0',10)); ioCounters.unobserve(e.target); }
  });
},{threshold:.6});
counters.forEach(c=>ioCounters.observe(c));
function animateCounter(el, target){
  let current=0; const step=Math.max(1, Math.round(target/30));
  const tick=()=>{ current+=step; if(current>=target) current=target; el.textContent=current; if(current<target) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}

// To top
const toTop=document.getElementById('toTop');
window.addEventListener('scroll', ()=>{
  if(window.scrollY>600){ toTop.classList.add('show'); } else { toTop.classList.remove('show'); }
});
toTop?.addEventListener('click', ()=> window.scrollTo({top:0, behavior:'smooth'}));

// Roles logic (tabs + deep-link)
const ROLES = ['buyer','seller','investor'];
const tabButtons = Array.from(document.querySelectorAll('[role="tab"]'));
const roleLinks = Array.from(document.querySelectorAll('[data-role]'));
function setRole(role, scroll=true){
  if(!ROLES.includes(role)) role='buyer';
  tabButtons.forEach(btn=>{
    const active = btn.dataset.role===role;
    btn.setAttribute('aria-selected', active ? 'true':'false');
    if(active) btn.focus({preventScroll:true});
  });
  ROLES.forEach(r=>{
    const sec=document.getElementById(`${r}-content`);
    if(!sec) return;
    if(r===role){ sec.classList.remove('hidden'); sec.classList.add('active'); }
    else { sec.classList.add('hidden'); sec.classList.remove('active'); }
  });
  document.querySelectorAll('a[data-role]').forEach(a=>{
    const active = a.dataset.role===role;
    a.setAttribute('aria-current', active ? 'page' : 'false');
  });
  if(location.hash.replace('#','')!==role){
    history.replaceState(null,'',`#${role}`);
  }
  if(scroll){
    const el = document.getElementById(`${role}-content`);
    el?.scrollIntoView({behavior:'smooth', block:'start'});
  }
}
tabButtons.forEach(btn=>{
  btn.addEventListener('click', ()=> setRole(btn.dataset.role));
  btn.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowRight' || e.key==='ArrowLeft'){
      e.preventDefault();
      const idx = tabButtons.indexOf(btn);
      const next = e.key==='ArrowRight' ? (idx+1)%tabButtons.length : (idx-1+tabButtons.length)%tabButtons.length;
      tabButtons[next].click();
    }
  });
});
roleLinks.forEach(l=>{
  l.addEventListener('click', (e)=>{
    const role=l.dataset.role;
    if(ROLES.includes(role)){
      e.preventDefault();
      setRole(role);
    }
  });
});
function initRoleFromHash(){
  const hash = (location.hash||'').replace('#','');
  setRole(ROLES.includes(hash) ? hash : 'buyer', false);
}
window.addEventListener('hashchange', initRoleFromHash);
initRoleFromHash();

// Ads: filter/sort/search (demo data on this page)
const adsList = document.getElementById('adsList');
const adsSearch = document.getElementById('adsSearch');
const adsCity = document.getElementById('adsCity');
const adsSort = document.getElementById('adsSort');
const adsReset = document.getElementById('adsReset');
const catChips = Array.from(document.querySelectorAll('[data-ad-cat]'));

const state = { q:'', cat:'all', city:'all', sort:'new' };

function normalize(str){ return (str||'').toString().toLowerCase().trim(); }
function applyAds(){
  const cards = Array.from(adsList.querySelectorAll('.ad-card'));
  // Filter
  cards.forEach(card=>{
    const cat = card.dataset.category || 'other';
    const city = card.dataset.city || '';
    const title = (card.dataset.title || card.querySelector('.title')?.textContent || '');
    const text = (card.dataset.text || card.querySelector('p')?.textContent || '');
    const hay = normalize(title + ' ' + text);
    const matches =
      (state.cat==='all' || state.cat===cat) &&
      (state.city==='all' || state.city===city) &&
      (state.q==='' || hay.includes(state.q));
    card.style.display = matches ? '' : 'none';
  });

  // Sort visible
  const visible = cards.filter(c => c.style.display !== 'none');
  const byDate = (c)=> new Date(c.dataset.date || '1970-01-01').getTime();
  const byPrice = (c)=> parseFloat(c.dataset.price || '0');

  let cmp = (a,b)=> byDate(b)-byDate(a); // default new first
  if(state.sort==='price-asc') cmp = (a,b)=> byPrice(a)-byPrice(b);
  if(state.sort==='price-desc') cmp = (a,b)=> byPrice(b)-byPrice(a);

  visible.sort(cmp).forEach(c=> adsList.appendChild(c));
}
function selectCat(cat){
  state.cat = cat;
  catChips.forEach(ch => ch.classList.toggle('active', ch.dataset.adCat===cat));
  applyAds();
}

adsSearch?.addEventListener('input', ()=>{ state.q = normalize(adsSearch.value); applyAds(); });
adsCity?.addEventListener('change', ()=>{ state.city = adsCity.value; applyAds(); });
adsSort?.addEventListener('change', ()=>{ state.sort = adsSort.value; applyAds(); });
catChips.forEach(ch => ch.addEventListener('click', ()=> selectCat(ch.dataset.adCat)));
adsReset?.addEventListener('click', ()=>{
  state.q=''; state.cat='all'; state.city='all'; state.sort='new';
  adsSearch.value=''; adsCity.value='all'; adsSort.value='new';
  selectCat('all'); applyAds();
});

// Init filters
selectCat('all'); applyAds();

// Ads embed toggle
const adsEmbed = document.getElementById('adsEmbed');
const adsFrame = document.getElementById('adsFrame');
const toggleEmbedBtn = document.getElementById('toggleEmbed');
const ADS_URL = 'https://nyaganmaksimov-sys.github.io/cuim/ads-board.html';

toggleEmbedBtn?.addEventListener('click', ()=>{
  const isHidden = adsEmbed.classList.contains('hidden');
  adsEmbed.classList.toggle('hidden', !isHidden);
  if(isHidden && !adsFrame.src) adsFrame.src = ADS_URL;
  toggleEmbedBtn.innerHTML = isHidden
    ? '<i class="fa-solid fa-eye-slash"></i> Скрыть встроенную версию'
    : '<i class="fa-solid fa-window-restore"></i> Показать встроенную версию';
  if(isHidden){ adsEmbed.scrollIntoView({behavior:'smooth', block:'start'}); }
});
