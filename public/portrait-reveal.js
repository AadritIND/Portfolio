(function () {
  'use strict';

  if (window.__portraitRevealStarted) return;
  window.__portraitRevealStarted = true;

  var root = document.getElementById('portrait-reveal');
  if (!root) return;

  /* ---------- tunables ---------- */
  var DESKTOP_PARTICLES = 90000;
  var MOBILE_PARTICLES  = 52000;
  var MOUSE_RADIUS      = 130;   // px, how far the cursor pushes particles away

  /* ---------- elements ---------- */
  var stage  = root.querySelector('.ac-stage');
  var canvas = root.querySelector('.ac-canvas');
  var dot    = root.querySelector('.ac-dot');
  var title  = root.querySelector('.ac-title');
  var l1     = root.querySelector('.ac-l1');
  var l2     = root.querySelector('.ac-l2');
  var hint   = root.querySelector('.ac-hint');
  var fbImg  = root.querySelector('.ac-fallback');

  var WORD  = (root.dataset.intro || 'Aadrit').toUpperCase();
  var FIRST = (root.dataset.first || '').toUpperCase();
  var LAST  = (root.dataset.last  || '').toUpperCase();

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- helpers ---------- */
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function remap(v, a, b) { return clamp((v - a) / (b - a), 0, 1); }
  function lerp(a, b, t)  { return a + (b - a) * t; }
  function smooth(t)      { return t * t * (3 - 2 * t); }
  function easeInOut(t)   { return t < .5 ? 4*t*t*t : 1 - Math.pow(-2*t + 2, 3) / 2; }
  function rnd(i, t)      { var s = Math.sin(i * 127.1 + t * 311.7) * 43758.5453; return s - Math.floor(s); }

  /* ---------- text scramble (A -> B, b in 0..1) ---------- */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  function scramble(A, B, b, tick) {
    var n = Math.max(A.length, B.length), out = '';
    for (var i = 0; i < n; i++) {
      var lo = (i / n) * 0.6, hi = lo + 0.4;
      var ca = A.charAt(i), cb = B.charAt(i);
      if (b <= lo)      out += ca;
      else if (b >= hi) out += cb;
      else              out += (ca === ' ' || cb === ' ') ? ' ' : GLYPHS.charAt((rnd(i, tick) * 26) | 0);
    }
    return out;
  }

  /* ---------- state ---------- */
  var W = 0, H = 0, dpr = 1;
  var rect = { x: 0, y: 0, w: 0, h: 0 };
  var fs = 80, yIntro = 0, yFinal = 0;
  var aspect = 4 / 3;
  var gl = null, prog = null, buf = null, count = 0, U = {};
  var P = reduced ? 1 : 0;           // smoothed scroll progress
  var mouse = { x: -9999, y: -9999, sx: -9999, sy: -9999, on: 0, px: 0, py: 0, spx: 0, spy: 0 };
  var running = false, visible = true, lastT = 0, raf = 0;
  var lastL1 = null, lastL2 = null;

  /* ---------- layout ---------- */
  function layout() {
    W = stage.clientWidth; H = stage.clientHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width  = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);

    // Portrait is scaled up so the face is the hero.
    var ph = Math.min(H * 1.32, W * 1.8);
    var pw = ph / aspect;
    rect.w = pw; rect.h = ph;
    rect.x = (W - pw) / 2;

    fs = clamp(Math.min(W * 0.081, H * 0.10), 28, 150);
    root.style.setProperty('--ac-fs', fs + 'px');

    // Centre the "hair line -> name" group vertically (hair line is ~13% down the photo,
    // the chin ~57%, and the name starts just under the chin at ~60%).
    var blockH = fs * 0.9 * 2 + fs * 0.45;
    var groupH = ph * 0.47 + blockH;
    var headTop = Math.max(H * 0.10, (H - groupH) * 0.46);
    rect.y = headTop - 0.13 * ph;

    yIntro = H / 2 - fs * 0.46;
    yFinal = Math.min(rect.y + ph * 0.60, H - blockH - Math.max(30, H * 0.045));
    yFinal = Math.max(yFinal, yIntro);
  }

  /* ---------- WebGL ---------- */
  var VS = [
    'precision highp float;',
    'attribute vec2 aHome; attribute vec2 aStart; attribute vec4 aRand; attribute vec3 aColor;',
    'uniform vec2 uRes; uniform vec4 uRect; uniform float uProg; uniform float uTime;',
    'uniform vec2 uMouse; uniform float uMouseOn; uniform float uMouseR; uniform vec2 uPar;',
    'uniform float uDpr; uniform float uSize; uniform float uGain;',
    'varying vec3 vColor; varying float vAlpha;',
    'void main(){',
    '  vec2 home  = uRect.xy + aHome * uRect.zw;',
    '  vec2 start = aStart * uRes;',
    '  float t = clamp((uProg - aRand.x) / 0.5, 0.0, 1.0);',
    '  float e = 1.0 - pow(1.0 - t, 3.0);',
    '  vec2 d = home - start;',
    '  vec2 perp = normalize(vec2(-d.y, d.x) + 1e-4);',
    '  vec2 pos = mix(start, home, e);',
    '  pos += perp * aRand.y * sin(e * 3.14159) * 190.0;',
    '  float travel = 1.0 - e;',
    '  pos += vec2(sin(uTime*0.8 + aRand.w*6.283), cos(uTime*0.9 + aRand.w*4.1)) * travel * 14.0;',
    '  pos += vec2(sin(uTime*1.3 + aRand.w*40.0), cos(uTime*1.1 + aRand.w*31.0)) * e * 0.75;',
    '  pos += uPar * (0.5 + 0.5 * e);',
    '  vec2 dm = pos - uMouse;',
    '  float dist = length(dm) + 0.001;',
    '  float f = smoothstep(uMouseR, 0.0, dist) * uMouseOn;',
    '  float ang = aRand.w * 43.758;',
    '  vec2 rdir = vec2(cos(ang), sin(ang));',
    '  vec2 pdir = normalize(mix(dm / dist, rdir, 0.6) + 1e-4);',
    '  pos += pdir * f * f * (30.0 + 80.0 * abs(aRand.y)) + vec2(-dm.y, dm.x) / dist * f * 14.0;',
    '  gl_Position = vec4(pos.x / uRes.x * 2.0 - 1.0, 1.0 - pos.y / uRes.y * 2.0, 0.0, 1.0);',
    '  float tw = 0.85 + 0.15 * sin(uTime * 2.0 + aRand.w * 60.0);',
    '  gl_PointSize = uDpr * uSize * aRand.z * (0.85 + 0.55 * e);',
    '  float born = smoothstep(aRand.x - 0.03, aRand.x + 0.05, uProg);',
    '  vAlpha = mix(0.28, 1.0, e) * born * tw * (1.0 - 0.45 * f);',
    '  vColor = aColor;',
    '}'
  ].join('\n');

  var FS = [
    'precision mediump float;',
    'varying vec3 vColor; varying float vAlpha; uniform float uGain;',
    'void main(){',
    '  float d = length(gl_PointCoord - 0.5) * 2.0;',
    '  float a = smoothstep(1.0, 0.0, d); a *= a;',
    '  float al = clamp(vAlpha * a * uGain, 0.0, 1.0);',
    '  gl_FragColor = vec4(vColor * al, al);',
    '}'
  ].join('\n');

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function initGL() {
    gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) throw new Error('no webgl');
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    ['uRes','uRect','uProg','uTime','uMouse','uMouseOn','uMouseR','uPar','uDpr','uSize','uGain']
      .forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
  }

  /* ---------- turn the photo into particles ---------- */
  function buildParticles(img) {
    aspect = img.naturalHeight / img.naturalWidth;
    var sw = 640, sh = Math.round(sw * aspect);
    var c = document.createElement('canvas'); c.width = sw; c.height = sh;
    var cx = c.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, sw, sh);
    var px = cx.getImageData(0, 0, sw, sh).data;

    var target = (W < 700 ? MOBILE_PARTICLES : DESKTOP_PARTICLES);
    var wt = new Float32Array(sw * sh), sum = 0, i, l, lum;
    for (i = 0; i < sw * sh; i++) {
      lum = (0.2126 * px[i*4] + 0.7152 * px[i*4+1] + 0.0722 * px[i*4+2]) / 255;
      l = Math.pow(clamp((lum - 0.035) / 0.65, 0, 1), 0.7);
      wt[i] = Math.pow(l, 1.4);
      sum += wt[i];
    }
    var density = target / sum;
    var STRIDE = 11;
    var out = new Float32Array(Math.ceil(target * 1.35) * STRIDE);
    var n = 0, x, y, k, v, m, side, r, g, b, hr, hg, hb, kk;

    for (y = 0; y < sh; y++) {
      for (x = 0; x < sw; x++) {
        i = y * sw + x;
        v = wt[i] * density;
        if (v <= 0) continue;
        m = Math.floor(v) + (Math.random() < v - Math.floor(v) ? 1 : 0);
        for (k = 0; k < m; k++) {
          if ((n + 1) * STRIDE > out.length) break;
          var o = n * STRIDE;
          // home position inside the portrait (0..1)
          out[o]   = (x + Math.random()) / sw;
          out[o+1] = (y + Math.random()) / sh;
          // start position: ~20% already drifting in view, the rest come in from all four sides
          if (Math.random() < 0.2) {
            out[o+2] = Math.random();
            out[o+3] = Math.random();
          } else {
            side = (Math.random() * 4) | 0;
            var along = -0.1 + Math.random() * 1.2, off = -0.12 - Math.random() * 0.4;
            if (side === 0)      { out[o+2] = along;     out[o+3] = off; }
            else if (side === 1) { out[o+2] = 1 - off;   out[o+3] = along; }
            else if (side === 2) { out[o+2] = along;     out[o+3] = 1 - off; }
            else                 { out[o+2] = off;       out[o+3] = along; }
          }
          l = Math.pow(wt[i], 1 / 1.4);
          out[o+4] = Math.pow(Math.random(), 1.15) * 0.5;       // delay
          out[o+5] = Math.random() * 2 - 1;                      // swirl
          out[o+6] = 0.75 + Math.random() * 0.85 + l * 0.35;     // size
          out[o+7] = Math.random();                              // phase
          // colour: cool silver, with a little of the photo's own warmth mixed back in
          r = px[i*4] / 255; g = px[i*4+1] / 255; b = px[i*4+2] / 255;
          kk = Math.max(r, g, b) + 1e-3;
          hr = r / kk; hg = g / kk; hb = b / kk;
          var br = 0.30 + 0.70 * l;
          out[o+8]  = (0.80 * 0.72 + hr * 0.28) * br;
          out[o+9]  = (0.88 * 0.72 + hg * 0.28) * br;
          out[o+10] = (1.00 * 0.72 + hb * 0.28) * br;
          n++;
        }
      }
    }
    count = n;
    buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, out.subarray(0, n * STRIDE), gl.STATIC_DRAW);

    var bytes = 4, stride = STRIDE * bytes;
    [['aHome', 2, 0], ['aStart', 2, 2], ['aRand', 4, 4], ['aColor', 3, 8]].forEach(function (a) {
      var loc = gl.getAttribLocation(prog, a[0]);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, a[1], gl.FLOAT, false, stride, a[2] * bytes);
    });
  }

  /* ---------- scroll progress ---------- */
  function targetProgress() {
    if (reduced) return 1;
    var r = root.getBoundingClientRect();
    var total = r.height - stage.clientHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 1;
  }

  /* ---------- per-frame ---------- */
  function drawParticles(F, time) {
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (!count) return;
    gl.uniform2f(U.uRes, W, H);
    gl.uniform4f(U.uRect, rect.x, rect.y, rect.w, rect.h);
    gl.uniform1f(U.uProg, F);
    gl.uniform1f(U.uTime, time);
    gl.uniform2f(U.uMouse, -9999, -9999);
    gl.uniform1f(U.uMouseOn, mouse.on);
    gl.uniform1f(U.uMouseR, MOUSE_RADIUS);
    gl.uniform2f(U.uPar, 0, 0);
    gl.uniform1f(U.uDpr, dpr);
    // soft halo pass, then crisp core pass
    gl.uniform1f(U.uSize, 6.5); gl.uniform1f(U.uGain, 0.075);
    gl.drawArrays(gl.POINTS, 0, count);
    gl.uniform1f(U.uSize, 1.55); gl.uniform1f(U.uGain, 0.95);
    gl.drawArrays(gl.POINTS, 0, count);
  }

  function updateText(time) {
    var tick = Math.floor(time * 18);
    var b1 = remap(P, 0.04, 0.17);
    var b2 = remap(P, 0.80, 0.93);
    var t1, t2;
    if (P < 0.80) { t1 = scramble('', WORD, b1, tick); t2 = ''; }
    else          { t1 = scramble(WORD, FIRST, b2, tick); t2 = scramble('', LAST, b2, tick + 7); }
    if (t1 !== lastL1) { l1.textContent = t1; lastL1 = t1; }
    if (t2 !== lastL2) { l2.textContent = t2; lastL2 = t2; }

    var y = lerp(yIntro, yFinal, easeInOut(remap(P, 0.17, 0.58)));
    title.style.transform = 'translate3d(0,' + y.toFixed(1) + 'px,0)';

    // dot ignites, then hands over to the letters
    var dp = remap(P, 0.015, 0.075);
    dot.style.opacity = String(1 - smooth(dp));
    dot.style.transform = 'scale(' + (1 + dp * 2.4).toFixed(3) + ')';
    hint.style.opacity = String(1 - smooth(remap(P, 0.0, 0.04)));

    root.classList.toggle('is-done', P > 0.96);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    var time = now / 1000;
    var dt = Math.min(0.1, time - lastT || 0.016); lastT = time;

    var T = targetProgress();
    P = reduced ? 1 : P + (T - P) * (1 - Math.exp(-dt * 6));
    if (Math.abs(T - P) < 0.0003) P = T;

    // smooth the pointer so particles flow around it instead of snapping
    var k = 1 - Math.exp(-dt * 14);
    if (mouse.sx < -9000) { mouse.sx = mouse.x; mouse.sy = mouse.y; }
    mouse.sx += (mouse.x - mouse.sx) * k;
    mouse.sy += (mouse.y - mouse.sy) * k;
    mouse.spx += (mouse.px - mouse.spx) * (1 - Math.exp(-dt * 3));
    mouse.spy += (mouse.py - mouse.spy) * (1 - Math.exp(-dt * 3));

    var F = remap(P, 0.12, 0.78);
    if (gl) drawParticles(F, reduced ? 0 : time);
    else fbImg.style.opacity = String(smooth(remap(P, 0.2, 0.8)) * 0.9);
    updateText(time);
  }

  function start() { if (!running) { running = true; lastT = performance.now() / 1000; raf = requestAnimationFrame(frame); } }
  function stop()  { running = false; cancelAnimationFrame(raf); }

  /* ---------- boot ---------- */
  var img = new Image();
  img.onload = function () {
    layout();
    try { initGL(); buildParticles(img); }
    catch (err) { gl = null; root.classList.add('ac-nogl'); fbImg.src = img.src; aspect = img.naturalHeight / img.naturalWidth; }

    new ResizeObserver(function () {
      layout();
      lastL1 = lastL2 = null;
    }).observe(stage);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        visible ? start() : stop();
      }, { rootMargin: '100px' }).observe(root);
    } else start();
    start();
  };
  img.onerror = function () { console.warn('[ac-reveal] portrait failed to load'); };
  img.src = window.AC_PORTRAIT_SRC || 'portrait.jpg';
})();