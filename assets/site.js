(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* theme */
  var root = document.documentElement;
  $('#theme').addEventListener('click', function () {
    var now = root.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = now === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('hm-theme', next); } catch (e) { /* the toggle still works for this visit */ }
  });

  /* scroll reveal */
  var reveals = $$('.reveal');
  if (calm || !('IntersectionObserver' in window)) reveals.forEach(function (x) { x.classList.add('in'); });
  else {
    var ro = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); ro.unobserve(e.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (x) { ro.observe(x); });
  }

  /* counters */
  if (!calm && 'IntersectionObserver' in window) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return; co.unobserve(e.target);
        var el = e.target, end = +el.dataset.count, sfx = el.dataset.suffix || '', t0 = performance.now();
        (function tick(t) { var p = Math.min(1, (t - t0) / 1300); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? sfx : ''); if (p < 1) requestAnimationFrame(tick); })(t0);
      });
    }, { threshold: .6 });
    $$('[data-count]').forEach(function (x) { co.observe(x); });
  }

  /* desktop screens */
  var tabs = $$('#tabs button'), shots = $$('#shots img'), cap = $('#cap'), auto = null, bar = $('#shotBar');
  function runBar() { if (!bar) return; bar.classList.remove('run'); void bar.offsetWidth; if (auto) bar.classList.add('run'); }
  function pick(i) {
    tabs.forEach(function (b, n) { b.setAttribute('aria-selected', n === i ? 'true' : 'false'); });
    shots.forEach(function (s, n) { s.classList.toggle('on', n === i); if (n === i || n === i + 1) s.loading = 'eager'; });
    cap.textContent = shots[i].dataset.cap || shots[i].alt; runBar();
  }
  function stop() { if (auto) { clearInterval(auto); auto = null; } if (bar) bar.classList.remove('run'); }
  tabs.forEach(function (b, i) { b.addEventListener('click', function () { stop(); pick(i); }); });
  $$('#tabs button').forEach(function (b, i) {
    b.addEventListener('keydown', function (e) { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); var n = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length; tabs[n].focus(); stop(); pick(n); });
  });
  if (!calm && 'IntersectionObserver' in window) {
    var cur = 0;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && auto === null && !stop.done) { cur = tabs.findIndex ? tabs.findIndex(function (b) { return b.getAttribute('aria-selected') === 'true'; }) : 0; auto = setInterval(function () { cur = (cur + 1) % tabs.length; pick(cur); }, 4200); runBar(); }
        else if (!e.isIntersecting) stop();
      });
    }, { threshold: .4 }).observe($('#shots'));
    tabs.forEach(function (b) { b.addEventListener('click', function () { stop.done = true; }); });
    $('#shots').addEventListener('mouseenter', stop);
  }

  /* the sample chat plays when it comes into view */
  var chat = $('#chat');
  if (!calm && 'IntersectionObserver' in window) {
    var msgs = $$('.m', chat), timer = null;
    chat.classList.add('play');
    function play() {
      var i = 0; msgs.forEach(function (m) { m.classList.remove('show'); });
      (function next() {
        if (i >= msgs.length) { timer = setTimeout(play, 5200); return; }
        msgs[i].classList.add('show'); i++;
        timer = setTimeout(next, i === 1 || i === 4 ? 1000 : 1700);
      })();
    }
    new IntersectionObserver(function (es) {
      es.forEach(function (e) { clearTimeout(timer); if (e.isIntersecting) play(); });
    }, { threshold: .25 }).observe(chat);
  }

  /* hero parallax */
  var stage = $('#stage');
  if (!calm && matchMedia('(hover: hover) and (min-width: 1041px)').matches) {
    var layers = $$('[data-depth]', stage), raf = 0;
    $('.hero').addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
        layers.forEach(function (l) { var d = +l.dataset.depth; l.style.transform = 'translate(' + (-x * d).toFixed(1) + 'px,' + (-y * d).toFixed(1) + 'px)'; });
      });
    });
  }

  /* hero sky: drifting ledger lines, a rising trend and rupee sparks */
  var cv = $('#sky');
  if (!calm && cv.getContext) {
    var g = cv.getContext('2d'), W = 0, H = 0, sparks = [], running = true, dpr = Math.min(devicePixelRatio || 1, 2);
    function size() { var r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); var n = Math.round(W / 46); sparks = []; for (var i = 0; i < n; i++) sparks.push({ x: Math.random() * W, y: Math.random() * H, v: .15 + Math.random() * .45, s: 10 + Math.random() * 11, a: .05 + Math.random() * .15, r: i % 3 === 0 }); }
    function frame(t) {
      if (!running) return;
      g.clearRect(0, 0, W, H);
      g.strokeStyle = 'rgba(160,185,255,.05)'; g.lineWidth = 1;
      var off = (t / 90) % 44; g.beginPath();
      for (var y = -off; y < H; y += 44) { g.moveTo(0, y); g.lineTo(W, y); }
      g.stroke();
      [[.72, '#818cf8', .001], [.8, '#38bdf8', .0008], [.88, '#34d399', .0012]].forEach(function (l, k) {
        g.beginPath(); g.strokeStyle = l[1]; g.globalAlpha = .34; g.lineWidth = 1.6;
        for (var x = 0; x <= W; x += 14) { var yy = H * l[0] - x / W * H * .2 + Math.sin(x * .011 + t * l[2] + k * 2) * 24 + Math.sin(x * .029 - t * l[2]) * 9; if (x === 0) g.moveTo(x, yy); else g.lineTo(x, yy); }
        g.stroke(); g.globalAlpha = 1;
      });
      sparks.forEach(function (p) {
        p.y -= p.v; if (p.y < -20) { p.y = H + 20; p.x = Math.random() * W; }
        g.globalAlpha = p.a; g.fillStyle = '#c7d7ff';
        if (p.r) { g.font = '700 ' + p.s + 'px system-ui'; g.fillText('₹', p.x, p.y); } else { g.beginPath(); g.arc(p.x, p.y, p.s / 7, 0, 6.3); g.fill(); }
      });
      g.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    size(); addEventListener('resize', size); requestAnimationFrame(frame);
    new IntersectionObserver(function (es) { var v = es[0].isIntersecting; if (v && !running) { running = true; requestAnimationFrame(frame); } else if (!v) running = false; }).observe(cv);
  }

  /* runs fn every ms while el is on screen */
  function whileSeen(el, ms, fn) {
    if (!el || calm || !('IntersectionObserver' in window)) return;
    var t = null;
    new IntersectionObserver(function (es) { es.forEach(function (e) { clearInterval(t); t = null; if (e.isIntersecting) t = setInterval(fn, ms); }); }, { threshold: .2 }).observe(el);
  }
  function cycle(box) { var im = $$('img', box), i = 0; return function () { im[i].classList.remove('on'); i = (i + 1) % im.length; im[i].classList.add('on'); }; }

  /* scroll progress */
  var prog = $('#progress');
  if (prog) addEventListener('scroll', function () { var h = document.documentElement; prog.style.transform = 'scaleX(' + (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)).toFixed(4) + ')'; }, { passive: true });

  /* hero: changing screens and audience */
  whileSeen($('#heroShots'), 3800, cycle($('#heroShots')));
  whileSeen($('#heroPhones'), 3100, cycle($('#heroPhones')));
  var rot = $('#rot'), who = ['shop owners', 'wholesalers', 'distributors', 'accountants', 'sales teams', 'CA offices'], wi = 0;
  whileSeen(rot, 2400, function () { rot.classList.add('out'); setTimeout(function () { wi = (wi + 1) % who.length; rot.textContent = who[wi]; rot.classList.remove('out'); }, 350); });

  /* feature explorer */
  var feats = $$('#fgrid .feat'), fbtns = $$('.filters button');
  if ($('#cAll')) $('#cAll').textContent = feats.length;
  fbtns.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.dataset.f, k = 0;
      fbtns.forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      feats.forEach(function (c) {
        var show = f === 'all' || c.dataset.p.split(' ').indexOf(f) >= 0;
        c.classList.toggle('hide', !show); c.classList.remove('enter');
        if (show && !calm) { c.style.setProperty('--i', k++); void c.offsetWidth; c.classList.add('enter'); }
      });
    });
  });
  feats.forEach(function (c) { c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--x', (e.clientX - r.left) + 'px'); c.style.setProperty('--y', (e.clientY - r.top) + 'px'); }); });

  /* rail: a second copy makes the loop seamless */
  $$('.rail-track').forEach(function (t) { $$('figure', t).forEach(function (f) { var c = f.cloneNode(true); c.setAttribute('aria-hidden', 'true'); $$('img', c).forEach(function (i) { i.alt = ''; }); t.appendChild(c); }); });
  $$('.cloud span').forEach(function (s, i) { s.style.setProperty('--i', i); });

  /* salesman steps light up in turn */
  var steps = $$('.sm-steps li'), si = -1;
  whileSeen($('.sm-steps'), 2200, function () { if (si >= 0) steps[si].classList.remove('act'); si = (si + 1) % steps.length; steps[si].classList.add('act'); });

  /* statement frequency chips */
  var fq = $$('.freq b'), fi = 0;
  whileSeen($('.freq'), 1600, function () { fq[fi].classList.remove('on'); fi = (fi + 1) % fq.length; fq[fi].classList.add('on'); });

  /* label printer: draws a barcode-like pattern and feeds labels */
  var tag = $('#tag');
  if (tag) {
    var items = [
      ['Basmati Rice Premium 5 kg', '8901234567890', 'MRP ₹ 899.00', 'Batch B-2611'],
      ['Toor Dal 1 kg', '8901234500017', 'MRP ₹ 165.00', 'Batch TD-A'],
      ['Cold Pressed Mustard Oil 1 L', '8906001234567', 'MRP ₹ 240.00', 'Exp 03/27'],
      ['Sona Masoori Rice 10 kg', '8901234500024', 'MRP ₹ 690.00', 'Batch SM-10']
    ], li = 0, printed = 0;
    function bars(code) {
      var s = '', x = 4, seed = 0;
      for (var k = 0; k < code.length; k++) seed = (seed * 31 + code.charCodeAt(k)) % 9973;
      while (x < 194) { seed = (seed * 73 + 41) % 9973; var w = 1 + seed % 3; if (seed % 2) s += '<rect x="' + x + '" y="0" width="' + w + '" height="40"/>'; x += w + (seed % 4 === 0 ? 2 : 1); }
      return s;
    }
    function show(it) { $('#tgName').textContent = it[0]; $('#tgCode').textContent = it[1]; $('#tgMrp').textContent = it[2]; $('#tgBatch').textContent = it[3]; $('#tgBars').innerHTML = bars(it[1]); }
    show(items[0]); tag.classList.add('feed'); printed = 1; $('#prN').textContent = 1;
    if (calm || !('IntersectionObserver' in window)) $('#prN').textContent = 26;
    else whileSeen($('.printer'), 3000, function () {
      tag.classList.remove('feed'); tag.classList.add('tear');
      setTimeout(function () {
        li = (li + 1) % items.length; show(items[li]);
        tag.classList.remove('tear'); void tag.offsetWidth; tag.classList.add('feed');
        printed = printed >= 26 ? 1 : printed + 1; $('#prN').textContent = printed;
      }, 600);
    });
  }
})();
