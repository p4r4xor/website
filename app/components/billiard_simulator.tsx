'use client';
import { useEffect, useRef, useState } from 'react';

// ============ MATH ============

const SQRT3 = Math.sqrt(3);
const Av: [number, number] = [0, 0];
const Bv: [number, number] = [-0.5, SQRT3/2];
const Cv: [number, number] = [1.0, SQRT3];
const Dv: [number, number] = [1.0, 0.0];

const AB_vec = [Bv[0]-Av[0], Bv[1]-Av[1]];
const AD_vec = [Dv[0]-Av[0], Dv[1]-Av[1]];

const edges = [
  {p1: Av, p2: Bv}, {p1: Bv, p2: Cv},
  {p1: Cv, p2: Dv}, {p1: Dv, p2: Av},
];

function gcd(a: number, b: number): number {
  while (b) { [a, b] = [b, a % b]; } return a;
}

function bounceCount(a: number, b: number) {
  let aa = a, bb = b;
  if (a < b) { aa = b; bb = a; }
  const t1 = Math.floor(Math.abs(2*aa - bb) / 3);
  const t2 = Math.floor(Math.abs(-aa + 2*bb) / 3);
  const t3 = Math.floor((aa + bb) / 3);
  const t4 = bb % 3 === 1 ? Math.floor((2*aa - 4) / 3) : Math.floor((2*aa - 5) / 3);
  return t1 + t2 + t3 + t4;
}

function raySegIntersect(ox: number, oy: number, dx: number, dy: number,
  p1x: number, p1y: number, p2x: number, p2y: number) {
  const ex = p2x - p1x, ey = p2y - p1y;
  const det = dx * ey - dy * ex;
  if (Math.abs(det) < 1e-12) return null;
  const dpx = p1x - ox, dpy = p1y - oy;
  return { t: (dpx * ey - dpy * ex) / det, u: (dpx * dy - dpy * dx) / det };
}

function tracePath(a: number, b: number, maxBounces: number): [number, number][] | null {
  const tx = 2*a*AD_vec[0] + 2*b*AB_vec[0];
  const ty = 2*a*AD_vec[1] + 2*b*AB_vec[1];
  const len = Math.sqrt(tx*tx + ty*ty);
  let dx = tx/len, dy = ty/len;
  const EPS = 1e-9;
  let px = Av[0] + dx*1e-10, py = Av[1] + dy*1e-10;
  const points: [number, number][] = [[Av[0], Av[1]]];
  let lastEdge = -1;

  for (let step = 0; step < maxBounces + 5; step++) {
    let bestT = Infinity, bestIdx = -1, bestPt: [number, number] | null = null;
    for (let i = 0; i < edges.length; i++) {
      if (i === lastEdge) continue;
      const {p1, p2} = edges[i];
      const res = raySegIntersect(px, py, dx, dy, p1[0], p1[1], p2[0], p2[1]);
      if (!res) continue;
      if (res.t > EPS && res.u >= -EPS && res.u <= 1+EPS && res.t < bestT) {
        bestT = res.t; bestIdx = i;
        const uc = Math.max(0, Math.min(1, res.u));
        bestPt = [
          edges[i].p1[0] + uc*(edges[i].p2[0]-edges[i].p1[0]),
          edges[i].p1[1] + uc*(edges[i].p2[1]-edges[i].p1[1])
        ];
      }
    }
    if (bestIdx === -1 || !bestPt) break;
    px = bestPt[0]; py = bestPt[1];
    points.push([px, py]);
    if (Math.sqrt((px-Av[0])**2 + (py-Av[1])**2) < 0.01 && points.length > 2) return points;
    const {p1, p2} = edges[bestIdx];
    const edx = p2[0]-p1[0], edy = p2[1]-p1[1];
    const el = Math.sqrt(edx*edx + edy*edy);
    const nx = -edy/el, ny = edx/el;
    const dot = dx*nx + dy*ny;
    dx -= 2*dot*nx; dy -= 2*dot*ny;
    const dl = Math.sqrt(dx*dx + dy*dy);
    dx /= dl; dy /= dl;
    lastEdge = bestIdx;
  }
  return null;
}

type PathData = { a: number; b: number; bounces: number; points: [number, number][] };

const allPaths: PathData[] = [];
for (let a = 1; a < 60; a++) {
  for (let b = 1; b < 60; b++) {
    if ((a+b) % 3 !== 0 || gcd(a, b) !== 1) continue;
    const n = bounceCount(a, b);
    if (n <= 0 || n > 30) continue;
    const pts = tracePath(a, b, n + 5);
    if (pts) allPaths.push({a, b, bounces: n, points: pts});
  }
}
allPaths.sort((a, b) => a.bounces - b.bounces);

// ============ RENDERING (Canvas 2D, no p5) ============

const W = 700, H = 600, PAD = 70;

function bounceColorRGB(n: number): string {
  const t = Math.min(n / 30, 1);
  // purple -> blue -> cyan -> yellow
  const r = Math.round(120 + t * 135);
  const g = Math.round(50 + t * 180);
  const b = Math.round(220 - t * 120);
  return `${r},${g},${b}`;
}

function toScreen(x: number, y: number): [number, number] {
  const rx = y, ry = -x;
  const scale = Math.min((W - 2*PAD) / 1.73, (H - 2*PAD) / 1.5) * 0.8;
  const cx = 0.865, cy = -0.25;
  return [W/2 + (rx - cx) * scale, H/2 - (ry - cy) * scale];
}

function draw(ctx: CanvasRenderingContext2D, maxBounces: number) {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);

  // Table fill
  ctx.fillStyle = '#121212';
  ctx.beginPath();
  const [ax0, ay0] = toScreen(Av[0], Av[1]);
  ctx.moveTo(ax0, ay0);
  for (const v of [Bv, Cv, Dv]) {
    const [sx, sy] = toScreen(v[0], v[1]);
    ctx.lineTo(sx, sy);
  }
  ctx.closePath();
  ctx.fill();

  // Paths
  const filtered = allPaths.filter(p => p.bounces <= maxBounces);
  for (const path of filtered) {
    const rgb = bounceColorRGB(path.bounces);
    ctx.strokeStyle = `rgba(${rgb},0.6)`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    const [x0, y0] = toScreen(path.points[0][0], path.points[0][1]);
    ctx.moveTo(x0, y0);
    for (let i = 1; i < path.points.length; i++) {
      const [sx, sy] = toScreen(path.points[i][0], path.points[i][1]);
      ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // Bounce dots
    ctx.fillStyle = `rgba(${rgb},0.4)`;
    for (let i = 1; i < path.points.length - 1; i++) {
      const [sx, sy] = toScreen(path.points[i][0], path.points[i][1]);
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Table edges
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const verts = [Av, Bv, Cv, Dv, Av];
  const [vx0, vy0] = toScreen(verts[0][0], verts[0][1]);
  ctx.moveTo(vx0, vy0);
  for (let i = 1; i < verts.length; i++) {
    const [sx, sy] = toScreen(verts[i][0], verts[i][1]);
    ctx.lineTo(sx, sy);
  }
  ctx.stroke();

  // Vertex labels
  const centerX = (Av[0] + Bv[0] + Cv[0] + Dv[0]) / 4;
  const centerY = (Av[1] + Bv[1] + Cv[1] + Dv[1]) / 4;
  const [scx, scy] = toScreen(centerX, centerY);
  const labelDist = 18;

  ctx.fillStyle = '#999';
  ctx.font = 'italic 18px "STIX Two Text", "Times New Roman", serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const [name, pt] of [['A', Av], ['B', Bv], ['C', Cv], ['D', Dv]] as const) {
    const [sx, sy] = toScreen(pt[0], pt[1]);
    const ddx = sx - scx, ddy = sy - scy;
    const l = Math.sqrt(ddx*ddx + ddy*ddy);
    ctx.fillText(name, sx + (ddx/l)*labelDist, sy + (ddy/l)*labelDist);
  }

  // Point A glow
  const [asx, asy] = toScreen(Av[0], Av[1]);
  ctx.fillStyle = 'rgba(140, 80, 220, 0.15)';
  ctx.beginPath();
  ctx.arc(asx, asy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(asx, asy, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // B(N) text
  ctx.fillStyle = '#ccc';
  ctx.font = '13px "STIX Two Text", serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`B(${maxBounces}) = ${filtered.length} paths`, 15, 15);

  // Legend
  const uniqueBounces = [...new Set(filtered.map(p => p.bounces))].sort((a,b) => a-b);
  let ly = 40;
  ctx.font = '10px "STIX Two Text", serif';
  for (const n of uniqueBounces) {
    const count = filtered.filter(p => p.bounces === n).length;
    const rgb = bounceColorRGB(n);
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.beginPath();
    ctx.arc(22, ly + 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#888';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${n} bounces (${count})`, 32, ly);
    ly += 16;
  }
}

// ============ REACT COMPONENT ============

export default function BilliardSimulator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [maxBounces, setMaxBounces] = useState(20);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    draw(ctx, maxBounces);
  }, [maxBounces]);

  return (
    <div className="flex flex-col items-center gap-3 my-6 not-prose">
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="rounded border border-neutral-800"
      />
      <div className="flex items-center gap-3" style={{fontFamily: "'STIX Two Text', serif"}}>
        <span className="text-neutral-400 text-base italic">
          N <span className="not-italic">=</span> {maxBounces}
        </span>
        <input
          type="range"
          min={1}
          max={30}
          value={maxBounces}
          onChange={(e) => setMaxBounces(parseInt(e.target.value))}
          className="w-[300px]"
        />
      </div>
    </div>
  );
}
