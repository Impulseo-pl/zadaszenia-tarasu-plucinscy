// Zadaszenia tarasu Plucińscy - menu, nagłówek, animacje wejścia, taśma aranżacji

// MENU PEŁNOEKRANOWE
(function () {
  var menu = document.querySelector('.menu');
  if (!menu) return;
  var otworz = document.querySelector('.nav-toggle');
  var zamknij = menu.querySelector('.menu-close');
  function ustaw(on) {
    menu.classList.toggle('open', on);
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (otworz) otworz.setAttribute('aria-expanded', on ? 'true' : 'false');
  }
  if (otworz) otworz.addEventListener('click', function () { ustaw(true); });
  if (zamknij) zamknij.addEventListener('click', function () { ustaw(false); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { ustaw(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') ustaw(false); });
})();

// NAGŁÓWEK: po zjechaniu w dół przyklejony, chowa się przy przewijaniu w dół
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var last = 0, tick = false, PROG = 160;
  function upd() {
    var y = window.scrollY || 0;
    if (y <= PROG) { nav.classList.remove('nav-solid', 'nav-hidden'); last = y; tick = false; return; }
    nav.classList.add('nav-solid');
    if (y > last + 4) nav.classList.add('nav-hidden');
    else if (y < last - 4) nav.classList.remove('nav-hidden');
    last = y; tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
})();

// ANIMACJE WEJŚCIA
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) { if (w.isIntersecting) { w.target.classList.add('in'); io.unobserve(w.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach(function (el) { io.observe(el); });
  // bezpiecznik: gdyby obserwator nie zadziałał, po 2,5 s pokaż wszystko
  setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 2500);
})();

// TAŚMA ARANŻACJI: strzałki przewijają o jeden kafel
(function () {
  var track = document.querySelector('.track');
  if (!track) return;
  function krok() { var s = track.querySelector('.slide'); return s ? s.getBoundingClientRect().width + 24 : 400; }
  var prev = document.querySelector('.work-prev'), next = document.querySelector('.work-next');
  if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -krok(), behavior: 'smooth' }); });
  if (next) next.addEventListener('click', function () { track.scrollBy({ left: krok(), behavior: 'smooth' }); });
})();

// STOPKLATKA: nieruchome zdjęcie włączane tylko, gdy jego okno jest blisko kadru
(function () {
  var sek = document.querySelectorAll('.stopklatka');
  if (!sek.length) return;
  if (!('IntersectionObserver' in window)) { sek.forEach(function (s) { s.classList.add('is-on'); }); return; }
  var io = new IntersectionObserver(function (wpisy) {
    wpisy.forEach(function (w) { w.target.classList.toggle('is-on', w.isIntersecting); });
  }, { rootMargin: '200px 0px' });
  sek.forEach(function (s) { io.observe(s); });
})();

// DOLNY PASEK MOBILE: chowa się, gdy w kadrze jest stopka albo sekcja CTA
(function () {
  try {
    var pasek = document.querySelector('.sticky-reserve');
    if (!pasek || !('IntersectionObserver' in window)) return;
    var widoczne = 0;
    var io = new IntersectionObserver(function (wpisy) {
      wpisy.forEach(function (w) { widoczne += w.isIntersecting ? 1 : -1; });
      if (widoczne < 0) widoczne = 0;
      pasek.classList.toggle('schowany', widoczne > 0);
    });
    document.querySelectorAll('footer, .cta').forEach(function (el) { io.observe(el); });
  } catch (e) {}
})();

// LICZNIK WAŻNOŚCI DEMA (K. 09.08: pełne odliczanie dni/godzin/minut/sekund).
// Element wstrzykuje multipage TYLKO w dema. Nie wita klienta przy wejściu - wjeżdża
// po zejściu z pierwszego ekranu i chowa się po powrocie na górę.
(function () {
  var el = document.querySelector('.demo-wazne');
  if (!el || !el.getAttribute('data-do')) return;
  var koniec = new Date(el.getAttribute('data-do') + 'T23:59:59');
  if (isNaN(koniec)) return;
  var txt = el.querySelector('.dw-txt') || el;
  var dwa = function (n) { return (n < 10 ? '0' : '') + n; };

  var cykl = parseInt(el.getAttribute('data-cykl') || '0', 10);   // dni; 0 = brak wznowienia
  function tyka() {
    var teraz = new Date(), ms = koniec - teraz;
    // po wygaśnięciu licznik rusza od nowa (K. 10.08) - dema i tak zostają, a odliczanie
    // ma dawać klientowi realne poczucie, że sprawa ma termin.
    while (ms <= 0 && cykl > 0) {
      koniec = new Date(koniec.getTime() + cykl * 86400000);
      ms = koniec - teraz;
    }
    if (ms <= 0) { txt.innerHTML = 'Wersja pokazowa wygasła'; el.classList.add('is-koniec'); return false; }
    var s = Math.floor(ms / 1000), d = Math.floor(s / 86400);
    var g = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sek = s % 60;
    var zegar = dwa(g) + ':' + dwa(m) + ':' + dwa(sek);
    txt.innerHTML = d > 0
      ? 'Wersja pokazowa · <b>' + d + ' dni</b> <span class="dw-zeg">' + zegar + '</span>'
      : 'Wersja pokazowa · <b class="dw-pilne">' + zegar + '</b>';
    el.classList.toggle('is-pilne', d === 0);
    return true;
  }
  if (tyka() !== false) setInterval(tyka, 1000);
  el.hidden = false;

  var tick = false;
  function stan() {
    el.classList.toggle('is-on', (window.scrollY || 0) > window.innerHeight * 0.55);
    tick = false;
  }
  window.addEventListener('scroll', function () {
    if (tick) return; tick = true; requestAnimationFrame(stan);
  }, { passive: true });
  stan();
})();


(function(){try{if(String(location.protocol).indexOf('http')!==0)return;try{if(/[?&#]team=1/.test(location.search+location.hash)){localStorage.setItem('nb_team','1');}}catch(e){}try{if(localStorage.getItem('nb_team')==='1')return;}catch(e){}if(/crm-newbeginning|crm\.impulseo\.pl/.test(document.referrer||''))return;try{if(navigator.webdriver)return;}catch(e){}try{if(/^https?:\/\/(kris20032|impulseo-pl)\.github\.io\/?$/i.test(document.referrer||''))return;}catch(e){}if(sessionStorage.getItem('_dv'))return;sessionStorage.setItem('_dv','1');var seg=(location.pathname.split('/').filter(Boolean)[0])||'';var base=location.origin+(seg?('/'+seg):'');var ua='';try{ua=(navigator.userAgent||'').slice(0,300);}catch(e){}var EP='https://zngfubfinbojfgaxdrbf.supabase.co/functions/v1/demo-view';try{fetch(EP,{method:'POST',keepalive:true,headers:{'Content-Type':'text/plain'},body:JSON.stringify({demo_url:base,page:location.pathname,referrer:(document.referrer||null),user_agent:(ua||null)})}).catch(function(){});}catch(e){}}catch(e){}})();
