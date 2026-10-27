// Zeichnet die goldenen Waben links und rechts als SVG.
// Die rechte Seite ist ein Spiegelbild der linken.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const R = 118;                    // Radius einer Wabe (Mitte bis Ecke)
  const H = Math.sqrt(3) * R;       // Höhe einer Wabe
  const COL_X = 177;                // Mitte der vollständig sichtbaren Spalte
  const PULSES = 3;                 // gleichzeitige Impulse je Seite
  const SPEED = 240;                // Geschwindigkeit der Impulse in px/s
  let renderCount = 0;

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
    const glow = el("filter", { id: "glow" + seed, x: "-300%", y: "-300%", width: "700%", height: "700%" });
    glow.append(el("feGaussianBlur", { stdDeviation: "3.5" }));
    defs.append(grad, glow);
    svg.append(defs);

    const g = el("g", {});
    if (mirror) g.setAttribute("transform", "translate(420 0) scale(-1 1)");
    svg.append(g);

    // Drei Spalten: links angeschnitten, Mitte vollständig, rechts nur angedeutet
    const columns = [
      { x: COL_X - 1.5 * R, offset: H / 2 },
      { x: COL_X, offset: 0 },
      { x: COL_X + 1.5 * R, offset: H / 2 }
    ];

    const edges = new Map();
    const corners = new Map();
    const key = (p) => Math.round(p[0]) + "," + Math.round(p[1]);

    columns.forEach((col) => {
      for (let cy = -H + col.offset - 40; cy < height + H; cy += H) {
        const pts = hexCorners(col.x, cy);
        pts.forEach((p, i) => {
          const q = pts[(i + 1) % 6];
          const k = [key(p), key(q)].sort().join("|");
          if (!edges.has(k)) edges.set(k, [p, q]);
          corners.set(key(p), p);
        });
      }
    });

    edges.forEach(([p, q]) => {
      const line = el("line", {
        x1: p[0], y1: p[1], x2: q[0], y2: q[1],
        class: "edge",
        stroke: `url(#hexGold${seed})`,
        opacity: (0.35 + rand() * 0.6).toFixed(2)
      });
      g.append(line);
    });

    // Nachbarn jeder Ecke, damit die Impulse den Kanten folgen können
    const neighbours = new Map();
    edges.forEach(([p, q]) => {
      const a = key(p), b = key(q);
      if (!neighbours.has(a)) neighbours.set(a, []);
      if (!neighbours.has(b)) neighbours.set(b, []);
      neighbours.get(a).push(b);
      neighbours.get(b).push(a);
    });
    const visible = (k) => {
      const p = corners.get(k);
      return p[0] > -10 && p[0] < 340 && p[1] > -60 && p[1] < height + 60;
    };
    const starts = [...corners.keys()].filter(visible);

    for (let i = 0; i < PULSES; i++) {
      startPulse(g, seed, () => randomWalk(starts, neighbours, visible, corners), 0.4 + i * 1.6 + Math.random());
    }
  }

  // Zufälliger Weg entlang der Kanten, ohne direkt umzukehren
  function randomWalk(starts, neighbours, visible, corners) {
    let current = starts[Math.floor(Math.random() * starts.length)];
    let previous = null;
    const path = [corners.get(current)];
    const steps = 5 + Math.floor(Math.random() * 5);
    for (let i = 0; i < steps; i++) {
      const options = neighbours.get(current).filter((k) => k !== previous && visible(k));
      if (!options.length) break;
      previous = current;
      current = options[Math.floor(Math.random() * options.length)];
      path.push(corners.get(current));
    }
    return path;
  }

  // Ein Lichtimpuls: drei übereinanderliegende Striche gleicher Spitze,
  // unterschiedlich lang, ergeben einen hellen Kopf mit auslaufendem Schweif
  const LAYERS = [
    { dash: 120, width: 4,   color: "#e6b34a", opacity: 0.45, blur: true },
    { dash: 60,  width: 2,   color: "#f7d27a", opacity: 0.9 },
    { dash: 18,  width: 2.2, color: "#fff6dc", opacity: 1 }
  ];

  function startPulse(g, seed, makePath, delay) {
    const generation = renderCount;
    const group = el("g", { class: "pulse" });
    const paths = LAYERS.map((layer) => {
      const path = el("path", {
        stroke: layer.color,
        "stroke-width": layer.width,
        opacity: layer.opacity
      });
      if (layer.blur) path.setAttribute("filter", `url(#glow${seed})`);
      group.append(path);
      return path;
    });
    g.append(group);

    function run() {
      if (generation !== renderCount) return;
      const pts = makePath();
      const length = (pts.length - 1) * R;
      const travel = length + LAYERS[0].dash;
      const duration = travel / SPEED;
      const d = "M" + pts.map((p) => p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" L");

      let animation;
      paths.forEach((path, i) => {
        const dash = LAYERS[i].dash;
        path.setAttribute("d", d);
        path.style.strokeDasharray = `${dash} ${length + travel}`;
        animation = path.animate(
          [{ strokeDashoffset: `${dash}px` }, { strokeDashoffset: `${dash - travel}px` }],
          { duration: duration * 1000, easing: "linear", fill: "both" }
        );
      });
      animation.onfinish = () => setTimeout(run, 600 + Math.random() * 2400);
    }

    setTimeout(run, delay * 1000);
  }

  const left = document.querySelector(".hex-left");
  const right = document.querySelector(".hex-right");

  function render() {
    renderCount++;
    draw(left, false, 7);
    draw(right, true, 31);
  }

  let timer;
  window.addEventListener("resize", () => {
    clearTimeout(timer);
    timer = setTimeout(render, 150);
  });
  render();
})();
