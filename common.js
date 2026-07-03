const PAGES = [
  {href:'index.html', it:'Home', fr:'Accueil'},
  {href:'chisiamo.html', it:'Chi siamo', fr:'Qui sommes-nous'},
  {href:'eventi.html', it:'Eventi', fr:'Événements'},
  {href:'galleria.html', it:'Galleria', fr:'Galerie'},
  {href:'citazioni.html', it:'Citazioni', fr:'Citations'},
  {href:'social.html', it:'Social & Media', fr:'Social & Médias'},
  {href:'contatti.html', it:'Contatti', fr:'Contact'},
];

function initNav(active, transparent=true) {
  const nav = document.getElementById('nav');
  if(!transparent) nav.classList.add('solid');
  else nav.classList.add('nav-transparent');

  nav.innerHTML = `
    <a class="nav-logo" href="index.html">
      <img id="nlogo" src="" alt="Logo">
      <span class="nav-logo-text">Dahira Touba Fano</span>
    </a>
    <ul class="nav-links" id="navLinks">
      ${PAGES.map(p=>`
        <li>
          <a href="${p.href}" class="${p.href===active?'active':''}" data-it>${p.it}</a>
          <a href="${p.href}" class="${p.href===active?'active':''}" data-fr style="display:none">${p.fr}</a>
        </li>`).join('')}
    </ul>
    <div class="lang-btn">
      <button id="btn-it" class="active" onclick="setLang('it')">IT</button>
      <button id="btn-fr" onclick="setLang('fr')">FR</button>
    </div>
    <button class="nav-toggle" id="navToggle" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>`;

  document.getElementById('nlogo').src = IMGS['logo'];

  if(transparent) {
    window.addEventListener('scroll',()=>{
      nav.classList.toggle('scrolled', window.scrollY>50);
    });
  }

  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  toggle.addEventListener('click',()=>{
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    document.body.classList.toggle('no-scroll', open);
  });
  links.querySelectorAll('a').forEach(a=>{
    a.addEventListener('click',()=>{
      links.classList.remove('open');
      toggle.classList.remove('open');
      nav.classList.remove('menu-open');
      document.body.classList.remove('no-scroll');
    });
  });
}

function initFooter() {
  const f = document.getElementById('footer');
  f.innerHTML = `
    <div class="fl">
      <img src="${IMGS['logo']}" alt="Logo">
      <div><strong>Dahira Touba Fano</strong><br><span>Khadaikhoul Fadha-il · Fano, Italia</span></div>
    </div>
    <div class="fl-links">
      ${PAGES.map(p=>`<a href="${p.href}" data-it>${p.it}</a><a href="${p.href}" data-fr style="display:none">${p.fr}</a>`).join('')}
    </div>
    <div><span data-it>© 2026 Tutti i diritti riservati</span><span data-fr style="display:none">© 2026 Tous droits réservés</span></div>`;
}

function setLang(lang) {
  const fr = lang==='fr';
  document.body.classList.toggle('lang-fr', fr);
  document.getElementById('btn-it').classList.toggle('active',!fr);
  document.getElementById('btn-fr').classList.toggle('active',fr);
  document.documentElement.lang = lang;
  localStorage.setItem('dtf_lang', lang);
  document.querySelectorAll('[data-it]').forEach(el=>el.style.display=fr?'none':'');
  document.querySelectorAll('[data-fr]').forEach(el=>{
    el.style.display=fr?(el.dataset.display||'inline'):'none';
  });
}
function initLang() {
  const saved = localStorage.getItem('dtf_lang')||'it';
  if(saved==='fr') setLang('fr');
}
