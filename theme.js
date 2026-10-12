/* Dahira Touba Fano — effetti 3D (inclinazione al passaggio del mouse + comparsa allo scroll).
   Non tocca i dati né la logica del sito: se questo file non carica, il sito funziona uguale. */
(function(){
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;

  // 1) Inclinazione 3D delle carte sotto il puntatore (anche per quelle caricate dopo da Supabase)
  if(fine && !reduce){
    var SEL = '.num-item,.cta-card,.comm-card,.q-card,.s-card,.archive-card,.event-poster,.about-img img,.masonry-item';
    var cur = null;
    var reset = function(el){ el.style.removeProperty('--rx'); el.style.removeProperty('--ry'); };
    document.addEventListener('pointermove', function(e){
      var el = e.target && e.target.closest ? e.target.closest(SEL) : null;
      if(cur && cur !== el){ reset(cur); cur = null; }
      if(!el) return;
      cur = el;
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      el.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
      el.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
    }, {passive:true});
    document.addEventListener('mouseleave', function(){ if(cur){ reset(cur); cur = null; } });
  }

  // 2) Comparsa degli elementi quando entrano nello schermo
  var REVEAL = '.numbers,.about-text,.carousel-head,.event-info,.podcast > div:first-child,.quote-strip blockquote,.cta-row,.comm-intro,.gallery-intro,.quotes-intro,.social-intro,.events-list > .section-title,.program-sec,.weekly-sec > div:first-child,.contact-left,.contact-right,.qr-sec';
  var nodes = Array.prototype.slice.call(document.querySelectorAll(REVEAL));
  if(!('IntersectionObserver' in window) || reduce || !nodes.length) return;
  var vh = window.innerHeight || 800;
  nodes.forEach(function(n){
    var top = n.getBoundingClientRect().top;
    n.classList.add('reveal');
    if(top < vh * 0.9) n.classList.add('in');        // già visibile: nessuna animazione, nessun flash
  });
  document.documentElement.classList.add('js');
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, {threshold:0.08, rootMargin:'0px 0px -6% 0px'});
  nodes.forEach(function(n){ if(!n.classList.contains('in')) io.observe(n); });
  // rete di sicurezza: dopo 4 secondi mostra comunque tutto
  setTimeout(function(){ nodes.forEach(function(n){ n.classList.add('in'); }); }, 4000);
})();
