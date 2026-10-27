// Zeichnet die goldenen Waben links und rechts als SVG.
// Die rechte Seite ist ein Spiegelbild der linken.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const R = 118;                    // Radius einer Wabe (Mitte bis Ecke)
  const H = Math.sqrt(3) * R;       // Höhe einer Wabe
  const COL_X = 177;                // Mitte der vollständig sichtbaren Spalte

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
    const halo = el("radialGradient", { id: "halo" + seed });
    halo.append(
      el("stop", { offset: "0", "stop-color": "#ffd77a", "stop-opacity": "0.9" }),
      el("stop", { offset: "1", "stop-color": "#ffb020", "stop-opacity": "0" })
    );
    defs.append(grad, glow, halo);
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
      if (rand() < 0.12) {
        line.classList.add("spark");
        line.style.setProperty("--dur", (5 + rand() * 6).toFixed(1) + "s");
        line.style.setProperty("--delay", (-rand() * 10).toFixed(1) + "s");
      }
      g.append(line);
    });

    corners.forEach((p) => {
      if (p[0] < 0 || p[0] > 330 || rand() > 0.35) return;
      const light = el("g", { class: "light" });
      light.style.setProperty("--dur", (3 + rand() * 4).toFixed(1) + "s");
      light.style.setProperty("--delay", (-rand() * 7).toFixed(1) + "s");
      light.append(
        el("circle", { cx: p[0], cy: p[1], r: 20, fill: `url(#halo${seed})` }),
        el("circle", { cx: p[0], cy: p[1], r: 5, fill: "#ffcf5c", filter: `url(#glow${seed})` }),
        el("circle", { cx: p[0], cy: p[1], r: 2.6 })
      );
      g.append(light);
    });
  }

  const left = document.querySelector(".hex-left");
  const right = document.querySelector(".hex-right");

  function render() {
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
