// Zeichnet die goldenen Waben links und rechts als SVG
// und schickt in regelmäßigen Abständen einen Lichtimpuls vom Logo aus durch sie hindurch.
// Die rechte Seite ist ein Spiegelbild der linken.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const R = 118;                    // Radius einer Wabe (Mitte bis Ecke)
  const H = Math.sqrt(3) * R;       // Höhe einer Wabe
  const COL_X = 177;                // Mitte der vollständig sichtbaren Spalte

  const WAVE_DURATION = 3400;       // Laufzeit eines Impulses durch die Waben in ms
  const WAVE_PAUSE = 2800;          // Pause zwischen zwei Impulsen in ms
  const TRAIL = 230;                // Länge des Nachglühens hinter der Wellenfront in px
  const FRONT = 14;                 // Breite der hellen Wellenfront in px

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Kleiner Zufallsgenerator mit festem Startwert, damit das Muster stabil bleibt
  function rng(seed) {
    return function () {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
  }

  function el(name, attrs) {
    const node = document.createElementNS(NS, name);
    for (const k in attrs) node.setAttribute(k, attrs[k]);
    return node;
  }

  function hexCorners(cx, cy) {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI / 3) * i;
      pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
    }
    return pts;
  }

  function draw(svg, mirror, seed) {
    const height = svg.clientHeight || window.innerHeight;
    const rand = rng(seed);

    svg.innerHTML = "";
    svg.setAttribute("viewBox", `0 0 420 ${height}`);
    svg.setAttribute("preserveAspectRatio", mirror ? "xMaxYMin slice" : "xMinYMin slice");

    const defs = el("defs", {});
    const grad = el("linearGradient", {
      id: "hexGold" + seed, gradientUnits: "userSpaceOnUse",
      x1: 0, y1: 0, x2: 420, y2: Math.max(height, 600)
    });
    grad.append(
      el("stop", { offset: "0", "stop-color": "#f7d27a" }),
      el("stop", { offset: "0.5", "stop-color": "#e6b34a" }),
      el("stop", { offset: "1", "stop-color": "#a8741f" })
    );
    const glow = el("filter", { id: "glow" + seed, x: "-20%", y: "-20%", width: "140%", height: "140%" });
    glow.append(el("feGaussianBlur", { stdDeviation: "4" }));

    // Ring aus einem radialen Verlauf: Nachglühen innen, helle Wellenfront außen
    const ring = el("radialGradient", { id: "ring" + seed, gradientUnits: "userSpaceOnUse" });
    const stops = [0, 0, 0.5, 1, 0].map((opacity) =>
      el("stop", { offset: "0", "stop-color": "#fff", "stop-opacity": opacity })
    );
    ring.append(...stops);
    const mask = el("mask", { id: "wave" + seed, maskUnits: "userSpaceOnUse", x: -2000, y: -2000, width: 4000, height: 4000 });
    const maskCircle = el("circle", { cx: 0, cy: 0, r: 0, fill: `url(#ring${seed})` });
    mask.append(maskCircle);
    defs.append(grad, glow, ring, mask);
    svg.append(defs);

    // Drei Spalten: links angeschnitten, Mitte vollständig, rechts nur angedeutet
    const columns = [
      { x: COL_X - 1.5 * R, offset: H / 2 },
      { x: COL_X, offset: 0 },
      { x: COL_X + 1.5 * R, offset: H / 2 }
    ];

    const edges = new Map();
    const key = (p) => Math.round(p[0]) + "," + Math.round(p[1]);

    columns.forEach((col) => {
      for (let cy = -H + col.offset - 40; cy < height + H; cy += H) {
        const pts = hexCorners(col.x, cy);
        pts.forEach((p, i) => {
          const q = pts[(i + 1) % 6];
          const k = [key(p), key(q)].sort().join("|");
          if (!edges.has(k)) edges.set(k, [p, q]);
        });
      }
    });

    const flip = mirror ? "translate(420 0) scale(-1 1)" : "";
    const base = el("g", { transform: flip });
    let allEdges = "";
    edges.forEach(([p, q]) => {
      base.append(el("line", {
        x1: p[0], y1: p[1], x2: q[0], y2: q[1],
        class: "edge",
        stroke: `url(#hexGold${seed})`,
        opacity: (0.35 + rand() * 0.6).toFixed(2)
      }));
      allEdges += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
    });
    svg.append(base);

    // Leuchtende Kopie der Kanten, nur sichtbar, wo der Ring der Welle gerade ist
    const light = el("g", { class: "wave", mask: `url(#wave${seed})` });
    const lightInner = el("g", { transform: flip });
    lightInner.append(
      el("path", { d: allEdges, stroke: "#f2b950", "stroke-width": 7, filter: `url(#glow${seed})` }),
      el("path", { d: allEdges, stroke: "#ffe7ad", "stroke-width": 2.2 }),
      el("path", { d: allEdges, stroke: "#fffaf0", "stroke-width": 0.8 })
    );
    light.append(lightInner);
    svg.append(light);

    // Ursprung der Welle: Mitte des Logos, umgerechnet in die Koordinaten dieses SVGs
    const logo = document.querySelector(".logo").getBoundingClientRect();
    const pt = svg.createSVGPoint();
    pt.x = logo.left + logo.width / 2;
    pt.y = logo.top + logo.height / 2;
    const origin = pt.matrixTransform(svg.getScreenCTM().inverse());
    const farthest = Math.max(
      ...[[0, 0], [420, 0], [0, height], [420, height]].map(([x, y]) => Math.hypot(x - origin.x, y - origin.y))
    );
    // Die Welle setzt erst kurz vor dem sichtbaren Wabenrand ein, damit sie ihre Zeit in den Waben verbringt
    const dx = Math.max(0, origin.x - 340, -origin.x);
    const dy = Math.max(0, origin.y - height, -origin.y);
    const nearest = Math.hypot(dx, dy);

    maskCircle.setAttribute("cx", origin.x);
    maskCircle.setAttribute("cy", origin.y);
    ring.setAttribute("cx", origin.x);
    ring.setAttribute("cy", origin.y);

    return { light, ring, stops, maskCircle, nearest, farthest };
  }

  // Bewegt die Wellenfront gleichmäßig vom inneren Wabenrand nach außen
  function setWave(wave, progress) {
    const eased = 0.5 - Math.cos(Math.PI * progress) / 2;
    const r = wave.nearest + eased * (wave.farthest + TRAIL - wave.nearest);
    const offset = (px) => Math.min(1, Math.max(0, (r - px) / r)).toFixed(4);

    wave.ring.setAttribute("r", r);
    wave.maskCircle.setAttribute("r", r);
    wave.stops[1].setAttribute("offset", offset(TRAIL));
    wave.stops[2].setAttribute("offset", offset(FRONT * 3));
    wave.stops[3].setAttribute("offset", offset(FRONT));
    wave.stops[4].setAttribute("offset", 1);
    // ein- und ausblenden, damit der Impuls weich beginnt und endet
    wave.light.style.opacity = Math.min(1, progress * 8) * (1 - Math.pow(progress, 4));
  }

  const left = document.querySelector(".hex-left");
  const right = document.querySelector(".hex-right");
  let waves = [];

  function render() {
    waves = [draw(left, false, 7), draw(right, true, 31)];
    waves.forEach((w) => (w.light.style.opacity = 0));
  }

  let start = null;
  function tick(now) {
    if (start === null) start = now + 800;
    const t = (now - start) % (WAVE_DURATION + WAVE_PAUSE);
    const progress = t >= 0 && t < WAVE_DURATION ? t / WAVE_DURATION : null;
    waves.forEach((w) => {
      if (progress === null) w.light.style.opacity = 0;
      else setWave(w, progress);
    });
    requestAnimationFrame(tick);
  }

  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(render, 150);
  });
  render();
  if (!reducedMotion) requestAnimationFrame(tick);
})();
