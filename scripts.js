/**
 * scripts.js
 * - Single JS file shared across all pages.
 * - Loads content.json, builds nav, renders page-specific content.
 * - Provides micro-interactions: fade-in (IntersectionObserver), collapsible details, projects search/filter, hamburger toggle, print.
 * - All visible content is in content.json (no HTML change needed).
 *
 * Edit behavior:
 * - CONTENT_PATH: where to fetch content (default 'content.json')
 * - The code detects the page via document.body.dataset.page
 */

const CONTENT_PATH = 'content.json';
const body = document.body;
const page = body.dataset.page || 'home'; // expected: home, education, research, projects, testscores, hobbies, contact
const root = document.getElementById('content-root');
const nav = document.getElementById('site-nav');
const brand = document.getElementById('brand');
const footer = document.getElementById('site-footer');

function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

async function loadJSON(){
  try {
    const res = await fetch(CONTENT_PATH + '?v=' + Date.now());
    if(!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    renderAll(data);
  } catch(err){
    console.error('Error loading content.json:', err);
    showFallback(err);
  }
}

function showFallback(err){
  root.innerHTML = '';
  const fallback = document.createElement('div');
  fallback.className = 'card';
  fallback.innerHTML = `<h2>Site content failed to load</h2>
    <p>Please ensure <code>content.json</code> exists in the site root and is valid JSON. Open the browser console for details.</p>`;
  root.appendChild(fallback);
  brand.innerHTML = `<div class="logo" style="background-image:url('assets/logo.svg')" role="img" aria-label="Logo"></div>
    <div><div class="title">Your Name</div><div class="subtitle">Edit content.json</div></div>`;
  footer.innerHTML = `<div></div>`;
}

/* Build brand and nav */
function buildBrand(site){
  const logo = site.logo || 'assets/logo.svg';
  const title = site.title || 'Your Name';
  const subtitle = site.subtitle || '';
  brand.innerHTML = `
    <div class="logo" style="background-image:url('${escapeHtml(logo)}')" role="img" aria-label="Logo"></div>
    <div><div class="title">${escapeHtml(title)}</div><div class="subtitle">${escapeHtml(subtitle)}</div></div>
  `;
  document.getElementById('page-title').textContent = title;
  document.getElementById('meta-description').content = site.description || '';
}

/* Build nav from site.navOrder or default */
function buildNav(site, sections){
  nav.innerHTML = '';
  const ul = document.createElement('div'); ul.className = 'nav-list';
  const order = Array.isArray(site.navOrder) ? site.navOrder : Object.keys(sections || {});
  order.forEach(key => {
    if(!sections[key]) return;
    const title = sections[key].meta?.title || key;
    const a = document.createElement('a');
    // map page slug to filename
    const filename = pageToFilename(key);
    a.href = filename;
    a.textContent = title;
    a.addEventListener('click', () => {
      document.getElementById('nav-toggle')?.setAttribute('aria-expanded','false');
      nav.classList.remove('open');
    });
    ul.appendChild(a);
  });
  nav.appendChild(ul);
}

/* map section key to page filename */
function pageToFilename(key){
  // home -> index.html, education -> education.html, etc.
  if(key === 'home') return 'index.html';
  return `${key}.html`;
}

/* Render page-specific content */
function renderAll(data){
  buildBrand(data.site || {});
  buildNav(data.site || {}, data.sections || {});
  footer.innerHTML = `<div>${escapeHtml(data.site?.title || '')} · ${escapeHtml(data.site?.tagline || '')}</div><div>${escapeHtml(data.site?.copyright || '')}</div>`;

  const sections = data.sections || {};
  const cur = sections[page];
  if(!cur){
    root.innerHTML = `<div class="card"><h2>Page not found in content.json</h2><p>Check content.json has a "${page}" key.</p></div>`;
    return;
  }

  // choose renderer based on page
  switch(page){
    case 'home': renderHome(cur); break;
    case 'education': renderEducation(cur); break;
    case 'research': renderResearch(cur); break;
    case 'projects': renderProjects(cur); break;
    case 'testscores': renderTestScores(cur); break;
    case 'hobbies': renderHobbies(cur); break;
    case 'contact': renderContact(cur); break;
    default: root.textContent = 'Unknown page'; 
  }

  // micro interactions
  setupNavToggle();
  setupPrint();
  setupScrollAnimations();
}

/* Renderers for each page (all content from content.json) */
function renderHome(obj){
  root.innerHTML = '';
  const section = document.createElement('section');
  section.className = 'card';
  const heroImg = obj.heroImage ? `<img src="${escapeHtml(obj.heroImage)}" alt="${escapeHtml(obj.heroAlt||'Hero')}" style="max-width:220px;float:right;margin-left:12px;border-radius:8px">` : '';
  section.innerHTML = `<div><h2>${escapeHtml(obj.title||'Welcome')}</h2><p class="section-intro">${escapeHtml(obj.intro||'')}</p>${heroImg}</div>`;
  root.appendChild(section);
}

function renderEducation(obj){
  root.innerHTML = '';
  const section = document.createElement('section');
  section.innerHTML = `<div class="section-title"><h2>${escapeHtml(obj.meta?.title||'Education')}</h2></div>`;
  const list = document.createElement('div');
  (obj.items || []).forEach(ed => {
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = `<strong>${escapeHtml(ed.degree)} — ${escapeHtml(ed.institution)}</strong>
      <div class="muted">${escapeHtml(ed.years || ed.period || '')}</div>
      <div>${escapeHtml(ed.details || '')}</div>`;
    list.appendChild(card);
  });
  section.appendChild(list);
  root.appendChild(section);
}

function renderResearch(obj){
  root.innerHTML = '';
  const section = document.createElement('section');
  section.innerHTML = `<div class="section-title"><h2>${escapeHtml(obj.meta?.title||'Research')}</h2></div>`;
  const list = document.createElement('div');
  (obj.items || []).forEach((r, idx) => {
    const card = document.createElement('div'); card.className = 'card collapsible';
    card.innerHTML = `<strong>${escapeHtml(r.title)}</strong><div class="muted">${escapeHtml(r.year || r.period || '')}</div>`;
    const {btn, id} = createToggle(`research-${idx}`, 'Details');
    const details = document.createElement('div'); details.className='collapsible-content'; details.id = id; details.style.maxHeight='0';
    details.innerHTML = `<div style="padding-top:8px">${escapeHtml(r.description || r.summary || '')}</div>`;
    if(r.link) details.innerHTML += `<div style="margin-top:8px"><a href="${escapeHtml(r.link)}" target="_blank" rel="noopener">Read more</a></div>`;
    btn.addEventListener('click', () => toggleCollapse(details, btn));
    card.appendChild(btn);
    card.appendChild(details);
    list.appendChild(card);
  });
  section.appendChild(list);
  root.appendChild(section);
}

function renderProjects(obj){
  root.innerHTML = '';
  const section = document.createElement('section');
  section.innerHTML = `<div class="section-title"><h2>${escapeHtml(obj.meta?.title||'Projects')}</h2></div>`;
  const controls = document.createElement('div'); controls.className='controls';
  controls.innerHTML = `<input id="project-search" type="search" placeholder="Search projects...">`;
  section.appendChild(controls);

  const grid = document.createElement('div'); grid.className='projects-grid'; grid.id='projects-grid';
  section.appendChild(grid);
  root.appendChild(section);

  const items = obj.items || [];
  function renderGrid(list, q=''){
    grid.innerHTML='';
    if(list.length===0){ grid.innerHTML = `<div class="card">No projects found.</div>`; return; }
    list.forEach((p, idx) => {
      const item = document.createElement('div'); item.className='project-item collapsible';
      const snippet = (p.description||'').split('.').slice(0,1).join('.') + (p.description?'.':'');
      item.innerHTML = `<strong>${escapeHtml(p.title)}</strong><div class="muted">${escapeHtml(p.subtitle||'')}</div><p>${escapeHtml(snippet)}</p>`;
      if(p.image) item.innerHTML += `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.imageAlt||p.title)}" style="max-width:100%;border-radius:6px">`;
      const {btn, id} = createToggle(`project-${idx}`, 'More');
      const details = document.createElement('div'); details.className='collapsible-content'; details.id = id; details.style.maxHeight='0';
      details.innerHTML = `<div style="padding-top:8px">${escapeHtml(p.description||'')}</div>
        <div class="project-tags">${(p.tags||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>`;
      if(p.link) details.innerHTML += `<div style="margin-top:8px"><a href="${escapeHtml(p.link)}" target="_blank" rel="noopener">View</a></div>`;
      btn.addEventListener('click', ()=>toggleCollapse(details, btn));
      item.appendChild(btn);
      item.appendChild(details);
      grid.appendChild(item);
    });
  }
  renderGrid(items);

  const search = document.getElementById('project-search');
  search.addEventListener('input', debounce(e=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = items.filter(p=>{
      const hay = (p.title+' '+(p.description||'')+' '+(p.tags||[]).join(' ')).toLowerCase();
      return hay.includes(q);
    });
    renderGrid(filtered, q);
  }, 160));
}

function renderTestScores(obj){
  root.innerHTML='';
  const section = document.createElement('section');
  section.innerHTML = `<div class="section-title"><h2>${escapeHtml(obj.meta?.title||'Test scores')}</h2></div>`;
  const card = document.createElement('div'); card.className='card';
  card.innerHTML = (obj.list || []).map(s=>`<div><strong>${escapeHtml(s.test)}</strong> — ${escapeHtml(s.score)} ${escapeHtml(s.year?('('+s.year+')'):'')}</div>`).join('');
  section.appendChild(card);
  root.appendChild(section);
}

function renderHobbies(obj){
  root.innerHTML='';
  const section = document.createElement('section');
  section.innerHTML = `<div class="section-title"><h2>${escapeHtml(obj.meta?.title||'Hobbies')}</h2></div>`;
  const row = document.createElement('div'); row.className='row';
  (obj.items || []).forEach(h=>{
    const c = document.createElement('div'); c.className='card col';
    c.innerHTML = `<strong>${escapeHtml(h.name)}</strong><div class="muted">${escapeHtml(h.description||'')}</div>`;
    if(h.image) c.innerHTML += `<img src="${escapeHtml(h.image)}" alt="${escapeHtml(h.name)}" style="max-width:160px;margin-top:8px;border-radius:8px">`;
    row.appendChild(c);
  });
  section.appendChild(row);
  root.appendChild(section);
}

function renderContact(obj){
  root.innerHTML='';
  const section = document.createElement('section');
  section.innerHTML = `<div class="section-title"><h2>${escapeHtml(obj.meta?.title||'Contact')}</h2></div>`;
  const card = document.createElement('div'); card.className='card';
  let html = '';
  if(obj.email) html += `<div>Email: <a href="mailto:${escapeHtml(obj.email)}">${escapeHtml(obj.email)}</a></div>`;
  if(obj.phone) html += `<div>Phone: ${escapeHtml(obj.phone)}</div>`;
  if(obj.social && obj.social.length){
    html += `<div class="contact-links">Social: ${obj.social.map(s=>`<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.platform)}</a>`).join(' · ')}</div>`;
  }
  // Optional static contact form via Formspree
  if(obj.form?.enabled){
    html += `<form method="POST" action="${escapeHtml(obj.form.action)}" class="contact-form" style="margin-top:12px">
      <label>Name <input name="name" required></label><br>
      <label>Email <input type="email" name="email" required></label><br>
      <label>Message <textarea name="message" rows="4" required></textarea></label><br>
      <button type="submit" class="btn-primary">Send</button>
    </form>`;
  }
  card.innerHTML = html;
  section.appendChild(card);
  root.appendChild(section);
}

/* Utility: create toggle button with unique id */
function createToggle(suffix, label='Details'){
  const btn = document.createElement('button');
  btn.className = 'toggle-btn';
  btn.type = 'button';
  const id = `toggle-${suffix}-${Math.random().toString(16).slice(2,8)}`;
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', id);
  btn.textContent = label;
  return {btn, id};
}

/* Toggle collapse */
function toggleCollapse(el, btn){
  if(!el) return;
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  if(expanded){
    // close
    el.style.maxHeight = el.scrollHeight + 'px';
    // force reflow
    void el.offsetHeight;
    el.style.maxHeight = '0';
    el.style.opacity = '0';
    el.classList.remove('is-open');
  } else {
    el.classList.add('is-open');
    const natural = el.scrollHeight + 12;
    el.style.maxHeight = natural + 'px';
    el.style.opacity = '1';
    el.addEventListener('transitionend', function once(){
      el.style.maxHeight = 'none';
      el.removeEventListener('transitionend', once);
    });
  }
}

/* Micro-interactions: nav toggle */
function setupNavToggle(){
  const navToggle = document.getElementById('nav-toggle');
  if(!navToggle) return;
  navToggle.addEventListener('click', () => {
    const open = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', open ? 'false' : 'true');
    nav.classList.toggle('open');
  });
}

/* Print behavior */
function setupPrint(){
  const printBtn = document.getElementById('print-btn');
  const printOnly = document.getElementById('print-only');
  printBtn?.addEventListener('click', () => {
    if(printOnly && printOnly.checked) document.documentElement.classList.add('print-only');
    window.print();
    document.documentElement.classList.remove('print-only');
  });
}

/* IntersectionObserver for fade-in */
function setupScrollAnimations(){
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add('in-view');
          obs.unobserve(e.target);
        }
      });
    }, {threshold: 0.08, rootMargin: '0px 0px -6% 0px'});
    document.querySelectorAll('section').forEach(s => io.observe(s));
  } else {
    document.querySelectorAll('section').forEach(s => s.classList.add('in-view'));
  }
}

/* Debounce */
function debounce(fn, t=160){ let timer; return (...a)=>{ clearTimeout(timer); timer=setTimeout(()=>fn(...a), t); }; }

/* Initialize */
loadJSON();
