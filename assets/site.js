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
  var tabs = $$('#tabs button'), shots = $$('#shots img'), cap = $('#cap'), auto = null;
  var caps = [
    'A live dashboard: sales, purchase, profit, receivables, payables, stock and GST at a glance.',
    '215 ready reports across party, item, month, quarter, state, tax and expenses. Save your own.',
    'Bill-wise and party-wise FIFO ageing with your own day slabs, overdue amounts and print.',
    'Every voucher by date, Tally style, with type filters, search and quantity columns.',
    'Your items as a catalogue with quick billing: add to cart and make the bill in seconds.',
    'Profit & Loss in the Tally layout: expand any group, then print or export to Excel.'
  ];
  function pick(i) { tabs.forEach(function (b, n) { b.setAttribute('aria-selected', n === i ? 'true' : 'false'); }); shots.forEach(function (s, n) { s.classList.toggle('on', n === i); if (n === i) s.loading = 'eager'; }); cap.textContent = caps[i]; }
  function stop() { if (auto) { clearInterval(auto); auto = null; } }
  tabs.forEach(function (b, i) { b.addEventListener('click', function () { stop(); pick(i); }); });
  $$('#tabs button').forEach(function (b, i) {
    b.addEventListener('keydown', function (e) { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); var n = (i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length; tabs[n].focus(); stop(); pick(n); });
  });
  if (!calm && 'IntersectionObserver' in window) {
    var cur = 0;
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && auto === null && !stop.done) { auto = setInterval(function () { cur = (cur + 1) % tabs.length; pick(cur); }, 4200); }
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
})();
