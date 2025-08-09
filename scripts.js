/**
 * scripts.js
 * - Fetches content.json and renders the entire site.
 * - All visible content is read from content.json (single source of truth).
 * - Adds professional micro-interactions:
 * • Hamburger -> X animation
 * • Nav underline slide
 * • Section fade-in on scroll (IntersectionObserver)
 * • Projects search & highlight
 * • Accessible expand/collapse for Research and Projects
 * • Button hover micro-interactions
 * - Graceful degradation: if fetch fails, fallback content is shown.
 *
 * Where to edit behavior:
 * - CONTENT_PATH constant
 * - IntersectionObserver options (rootMargin / threshold)
 * - Search debounce duration in debounce()
 *
 * NOTE: Keep all content edits inside content.json only.
 */

const CONTENT_PATH = 'content.json';
const root = document.getElementById('content-root');
const nav = document.getElementById('site-nav');
const brand = document.getElementById('brand');
const footerInner = document.getElementById('footer-inner');
const pageTitle = document.getElementById('page-title');
const metaDesc = document.getElementById('meta-description');
const ogTitle = document.getElementById('og-title');
const ogDesc = document.getElementById('og-desc');
const ogImage = document.getElementById('og-image');

const fallbackTemplate = document.getElementById('fallback-template');

const supportsIntersection = 'IntersectionObserver' in window;

/* -------------------------
    Utility helpers
    ------------------------- */
function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
}

/* Safe highlight: escape then replace matches with <mark class="match">... */
function highlightMatches(text, query) {
  if (!query) return escapeHtml(text);
  // escape query for regex
  const safeQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${safeQ})`, 'ig');
  // escape the full text, then replace escaped matches
  const esc = escapeHtml(text);
  // Now we need to highlight matches in a case-insensitive way.
  // Because esc has &amp; etc, a simple replace on esc can still work as we matched raw query on original text.
  // Safer approach: iterate through original text to find matches and build result.
  let result = '';
  let lastIndex = 0;
  const original = String(text);
  let m;
  while ((m = re.exec(original)) !== null) {
    const start = m.index;
    const end = re.lastIndex;
    result += escapeHtml(original.slice(lastIndex, start));
    result += `<mark class="match">${escapeHtml(original.slice(start, end))}</mark>`;
    lastIndex = end;
    if (re.lastIndex === m.index) re.lastIndex++; // avoid zero-length match infinite loop
  }
  result += escapeHtml(original.slice(lastIndex));
  return result;
}

/* debounce helper */
function debounce(fn, wait = 180) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

/* -------------------------
    Fetch content.json and render
    ------------------------- */
async function loadContent() {
  try {
    const res = await fetch(CONTENT_PATH + '?v=' + Date.now());
    if (!res.ok) throw new Error('Failed to fetch content.json: ' + res.status);
    const data = await res.json();
    renderAll(data);
  } catch (err) {
    console.error(err);
    showFallback(err);
  }
}

/* show fallback markup if JSON fetch fails */
function showFallback(err) {
  root.innerHTML = '';
  const clone = fallbackTemplate.content.cloneNode(true);
  root.appendChild(clone);
  pageTitle.textContent = 'Profile';
  brand.innerHTML = `<div class="logo" style="background-image:url('assets/logo.svg')" role="img" aria-label="Logo"></div>
                     <div><div class="title">Your Name</div><div class="subtitle">Edit content.json</div></div>`;
  footerInner.textContent = '';
  console.warn('Displayed fallback due to error:', err);
}

/* -------------------------
    Render helpers
    ------------------------- */
function setMeta(data) {
  const title = data.site?.title || 'Profile';
  const desc = data.site?.description || '';
  const image = data.site?.image || 'assets/profile.svg';

  pageTitle.textContent = title;
  metaDesc.content = desc;
  ogTitle.content = title;
  ogDesc.content = desc;
  ogImage.content = image;
}

function buildBrand(site) {
  const logo = site?.logo || 'assets/logo.svg';
  const title = site?.title || 'Your Name';
  const subtitle = site?.subtitle || '';
  brand.innerHTML = `
    <div class="logo" style="background-image:url('${logo}')" role="img" aria-label="Logo"></div>
    <div>
      <div class="title">${escapeHtml(title)}</div>
      <div class="subtitle">${escapeHtml(subtitle)}</div>
    </div>`;
}

/* Build nav links; order controlled by site.navOrder array in content.json */
function buildNav(site, sections) {
  nav.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'nav-list';
  const order = site?.navOrder || Object.keys(sections || {});
  order.forEach(slug => {
    if (!sections[slug]) return;
    const title = sections[slug].meta?.title || slug;
    const a = document.createElement('a');
    a.href = `#${slug}`;
    a.textContent = title;
    a.addEventListener('click', () => {
      // close mobile nav
      document.getElementById('nav-toggle').setAttribute('aria-expanded','false');
      nav.classList.remove('open');
    });
    container.appendChild(a);
  });
  nav.appendChild(container);
}

/* Accessible toggle button generation */
function createToggleButton(idSuffix, label = 'Details', expanded = false) {
  const btn = document.createElement('button');
  btn.className = 'toggle-btn';
  btn.type = 'button';
  const uid = `toggle-${idSuffix}-${Math.random().toString(16).slice(2,8)}`;
  btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
  btn.setAttribute('aria-controls', uid);
  btn.textContent = label;
  btn.dataset.targetId = uid;
  return { btn, uid };
}

/* Smooth collapse/expand using max-height */
function openCollapse(el) {
  if (!el) return;
  el.classList.add('is-open');
  const natural = el.scrollHeight + 12; // small padding
  el.style.maxHeight = natural + 'px';
  el.style.opacity = '1';
  el.addEventListener('transitionend', function once() {
    // allow natural height after expansion
    el.style.maxHeight = 'none';
    el.removeEventListener('transitionend', once);
  });
}

function closeCollapse(el) {
  if (!el) return;
  // set explicit height then to 0
  el.style.maxHeight = el.scrollHeight + 'px';
  // force reflow
  // eslint-disable-next-line no-unused-expressions
  el.offsetHeight;
  el.style.maxHeight = '0';
  el.style.opacity = '0';
  el.classList.remove('is-open');
}

/* -------------------------
    Render each section
    ------------------------- */
function renderSection(key, obj, globalQuery = '') {
  const section = document.createElement('section');
  section.id = key;
  section.tabIndex = -1;
  section.className = 'content-section';
  const titleText = obj.meta?.title || key;
  const header = document.createElement('div');
  header.className = 'section-title';
  header.innerHTML = `<h2>${escapeHtml(titleText)}</h2>`;
  section.appendChild(header);

  const body = document.createElement('div');
  body.className = 'section-body';

  switch (key) {
    case 'home':
      {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `<p>${escapeHtml(obj.intro || '')}</p>`;
        if (obj.image) {
          const img = document.createElement('img');
          img.src = obj.image;
          img.alt = obj.imageAlt || (obj.meta?.title || 'profile picture');
          img.style.maxWidth = '140px';
          img.style.float = 'right';
          img.style.marginLeft = '12px';
          card.appendChild(img);
        }
        body.appendChild(card);
      }
      break;

    case 'education':
      {
        const container = document.createElement('div');
        (obj.items || []).forEach(e => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `<strong>${escapeHtml(e.degree)} — ${escapeHtml(e.institution)}</strong>
                            <div class="muted">${escapeHtml(e.period)}</div>
                            <div>${escapeHtml(e.details)}</div>`;
          container.appendChild(card);
        });
        body.appendChild(container);
      }
      break;

    case 'research':
      {
        const list = document.createElement('div');
        list.className = 'research-list';
        (obj.items || []).forEach((r, idx) => {
          const card = document.createElement('div');
          card.className = 'card collapsible';
          const summaryHtml = `<strong>${escapeHtml(r.title)}</strong>
                               <div class="muted">${escapeHtml(r.role || '')} ${escapeHtml(r.period || '')}</div>`;
          card.innerHTML = summaryHtml;
          const { btn, uid } = createToggleButton(`research-${idx}`, 'Details', false);
          const details = document.createElement('div');
          details.className = 'collapsible-content';
          details.id = uid;
          details.style.maxHeight = '0';
          details.style.opacity = '0';
          details.innerHTML = `<div>${escapeHtml(r.summary || '')}</div>`;
          if (r.link) {
            details.innerHTML += `<div style="margin-top:8px"><a href="${r.link}" target="_blank" rel="noopener">Read more</a></div>`;
          }
          btn.addEventListener('click', () => {
            const isOpen = btn.getAttribute('aria-expanded') === 'true';
            btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
            if (isOpen) closeCollapse(details); else openCollapse(details);
          });
          card.appendChild(btn);
          card.appendChild(details);
          list.appendChild(card);
        });
        body.appendChild(list);
      }
      break;

    case 'projects':
      {
        const controls = document.createElement('div');
        controls.className = 'controls';
        controls.innerHTML = `<input type="search" id="project-search" placeholder="Search projects by title, description or tag" aria-label="Search projects">`;
        body.appendChild(controls);

        const grid = document.createElement('div');
        grid.className = 'projects-grid';
        grid.id = 'projects-grid';
        body.appendChild(grid);

        // render helper
        const renderGrid = (items, query = '') => {
          grid.innerHTML = '';
          if (!items.length) {
            grid.innerHTML = `<div class="card">No projects found.</div>`;
            return;
          }
          items.forEach((p, idx) => {
            const item = document.createElement('div');
            item.className = 'project-item collapsible';
            const snippet = (p.description || '').split('.').slice(0,1).join('.') + (p.description ? '.' : '');
            item.innerHTML = `<strong>${highlightMatches(p.title || '', query)}</strong>
                              <div class="muted">${highlightMatches(p.subtitle || '', query)}</div>
                              <p>${highlightMatches(snippet, query)}</p>`;
            if (p.image) {
              item.innerHTML += `<img src="${p.image}" alt="${escapeHtml(p.imageAlt || p.title)}" style="max-width:100%;height:auto;border-radius:6px">`;
            }
            const { btn, uid } = createToggleButton(`project-${idx}`, 'More', false);
            const details = document.createElement('div');
            details.className = 'collapsible-content';
            details.id = uid;
            details.style.maxHeight = '0';
            details.style.opacity = '0';
            details.innerHTML = `<div>${highlightMatches(p.description || '', query)}</div><div class="project-tags">${(p.tags||[]).map(t => `<span class="tag">${highlightMatches(t, query)}</span>`).join('')}</div>`;
            if (p.link) details.innerHTML += `<div style="margin-top:8px"><a href="${p.link}" target="_blank" rel="noopener">View</a></div>`;
            btn.addEventListener('click', () => {
              const isOpen = btn.getAttribute('aria-expanded') === 'true';
              btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
              if (isOpen) closeCollapse(details); else openCollapse(details);
            });
            item.appendChild(btn);
            item.appendChild(details);
            grid.appendChild(item);
          });
        };

        // initial render with full list
        renderGrid(obj.items || []);

        // attach search with debounce
        const search = controls.querySelector('#project-search');
        const doFilter = (q) => {
          const qtrim = String(q || '').trim().toLowerCase();
          const filtered = (obj.items || []).filter(p => {
            const hay = (p.title + ' ' + (p.description||'') + ' ' + (p.tags || []).join(' ')).toLowerCase();
            return hay.includes(qtrim);
          });
          renderGrid(filtered, qtrim);
        };
        const deb = debounce((e) => doFilter(e.target.value), 160);
        search.addEventListener('input', deb);
      }
      break;

    case 'testscores':
      {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = (obj.list || []).map(ts => `<div><strong>${escapeHtml(ts.test)}</strong> — ${escapeHtml(ts.score)}</div>`).join('');
        body.appendChild(card);
      }
      break;

    case 'travelling':
      {
        const row = document.createElement('div');
        row.className = 'row';
        (obj.places || []).forEach(p => {
          const c = document.createElement('div');
          c.className = 'card col';
          c.innerHTML = `<strong>${escapeHtml(p.name)}</strong><div class="muted">${escapeHtml(p.year)}</div><div>${escapeHtml(p.notes)}</div>`;
          row.appendChild(c);
        });
        body.appendChild(row);
      }
      break;

    case 'miscellaneous':
      {
        const c = document.createElement('div');
        c.className = 'card';
        c.innerHTML = `<ul>${(obj.items || []).map(it => `<li>${escapeHtml(it)}</li>`).join('')}</ul>`;
        body.appendChild(c);
      }
      break;

    case 'contact':
      {
        const c = document.createElement('div');
        c.className = 'card';
        const mail = obj.email ? `<div>Email: <a href="mailto:${obj.email}">${escapeHtml(obj.email)}</a></div>` : '';
        const socials = (obj.socials || []).map(s => `<a href="${s.url}" target="_blank" rel="noopener">${escapeHtml(s.label)}</a>`).join(' · ');
        c.innerHTML = `${mail}<div class="contact-links">Social: ${socials}</div>`;

        if (obj.form?.enabled) {
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = obj.form?.action || '#';
          form.className = 'contact-form';
          form.innerHTML = `
            <label>Name <input name="name" required></label>
            <label>Email <input type="email" name="email" required></label>
            <label>Message <textarea name="message" rows="4" required></textarea></label>
            <button type="submit" class="btn-primary">Send</button>
          `;
          c.appendChild(form);
        }
        body.appendChild(c);
      }
      break;

    default:
      {
        const p = document.createElement('pre');
        p.className = 'card';
        p.textContent = JSON.stringify(obj, null, 2);
        body.appendChild(p);
      }
  }

  section.appendChild(body);
  return section;
}

/* -------------------------
    Render all & wire interactions
    ------------------------- */
function renderAll(data) {
  setMeta(data);
  buildBrand(data.site || {});
  const sections = data.sections || {};
  buildNav(data.site || {}, sections);

  root.innerHTML = '';
  const order = data.site?.navOrder || Object.keys(sections);
  order.forEach(key => {
    if (!sections[key]) return;
    const sec = renderSection(key, sections[key]);
    root.appendChild(sec);
  });

  footerInner.innerHTML = `<div>${escapeHtml(data.site?.title || '')} · ${escapeHtml(data.site?.tagline || '')}</div><div>${escapeHtml(data.site?.copyright || '')}</div>`;

  // Nav toggle behavior (hamburger -> X)
  const navToggle = document.getElementById('nav-toggle');
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    nav.classList.toggle('open');
  });

  // IntersectionObserver for sections fade-in
  if (supportsIntersection) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // optional: unobserve to save work
          io.unobserve(entry.target);
        }
      });
    }, { root: null, rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    document.querySelectorAll('.content-section').forEach(sec => io.observe(sec));
  } else {
    // fallback: reveal all sections
    document.querySelectorAll('.content-section').forEach(sec => sec.classList.add('in-view'));
  }

  // Print button logic
  const printBtn = document.getElementById('print-btn');
  const printOnly = document.getElementById('print-only');
  printBtn.addEventListener('click', () => {
    if (printOnly.checked) document.documentElement.classList.add('print-only');
    window.print();
    document.documentElement.classList.remove('print-only');
  });

  // keyboard: focus main after navigation (improves skip-to-content)
  document.querySelectorAll('#site-nav a').forEach(a => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href')?.replace('#','');
      const target = document.getElementById(id);
      if (target) {
        setTimeout(() => target.focus({preventScroll:false}), 50);
      }
    });
  });
}

/* -------------------------
    Start
    ------------------------- */
loadContent();
