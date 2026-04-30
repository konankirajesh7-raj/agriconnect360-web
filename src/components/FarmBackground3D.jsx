import React, { useEffect, useRef } from 'react';

/*
 * FarmBackground3D — Vibrant animated green farming world
 * Uses CSS animations + canvas particles for performance (no Three.js needed)
 * Creates rolling green hills, floating particles, and animated sky
 */
export default function FarmBackground3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particles — golden pollen, green sparkles, blue fireflies
    const particles = [];
    const COLORS = [
      'rgba(0,230,118,0.6)',   // green
      'rgba(64,196,255,0.5)',   // blue
      'rgba(255,214,0,0.5)',    // gold
      'rgba(29,233,182,0.4)',   // teal
      'rgba(224,64,251,0.3)',   // purple
      'rgba(255,109,0,0.4)',    // orange
    ];

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * 2000,
        y: Math.random() * 1200,
        r: Math.random() * 3 + 1,
        dx: (Math.random() - 0.5) * 0.4,
        dy: -Math.random() * 0.3 - 0.1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      });
    }

    let t = 0;
    function draw() {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Draw particles
      particles.forEach(p => {
        p.x += p.dx + Math.sin(t * 0.5 + p.phase) * 0.3;
        p.y += p.dy;
        const pulse = 1 + Math.sin(t * p.speed * 60 + p.phase) * 0.5;

        // Wrap
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        // Glow
        ctx.beginPath();
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4 * pulse);
        grad.addColorStop(0, p.color);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.arc(p.x, p.y, p.r * 4 * pulse, 0, Math.PI * 2);
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.fillStyle = p.color.replace(/[\d.]+\)$/, '1)');
        ctx.arc(p.x, p.y, p.r * pulse * 0.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* Animated gradient background — rolling green hills + blue sky */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `
          linear-gradient(180deg,
            #1565c0 0%,
            #1976d2 8%,
            #42a5f5 18%,
            #64b5f6 25%,
            #90caf9 32%,
            #a5d6a7 42%,
            #66bb6a 52%,
            #43a047 60%,
            #2e7d32 70%,
            #1b5e20 82%,
            #0d4a1f 100%
          )`,
        animation: 'bgShift 30s ease-in-out infinite alternate',
      }} />

      {/* Rolling hills silhouette layers */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1 }} viewBox="0 0 1440 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="hill1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2e7d32" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1b5e20" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="hill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#388e3c" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#2e7d32" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="hill3" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#43a047" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#388e3c" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        {/* Far hills */}
        <path d="M0,280 C200,200 400,300 600,220 C800,140 1000,280 1200,200 C1300,160 1400,240 1440,220 L1440,400 L0,400Z" fill="url(#hill3)">
          <animateTransform attributeName="transform" type="translate" values="0,0;20,5;0,0" dur="20s" repeatCount="indefinite" />
        </path>
        {/* Mid hills */}
        <path d="M0,300 C180,260 360,320 540,270 C720,220 900,310 1080,260 C1200,230 1350,290 1440,270 L1440,400 L0,400Z" fill="url(#hill2)">
          <animateTransform attributeName="transform" type="translate" values="0,0;-15,3;0,0" dur="15s" repeatCount="indefinite" />
        </path>
        {/* Near hills */}
        <path d="M0,330 C160,300 320,350 480,310 C640,270 800,340 960,300 C1120,260 1280,330 1440,310 L1440,400 L0,400Z" fill="url(#hill1)">
          <animateTransform attributeName="transform" type="translate" values="0,0;10,-3;0,0" dur="12s" repeatCount="indefinite" />
        </path>
      </svg>

      {/* Animated clouds */}
      <div style={{ position: 'absolute', top: '5%', left: 0, right: 0, zIndex: 1, overflow: 'hidden', height: '30%', pointerEvents: 'none' }}>
        {[
          { left: '10%', top: '20%', size: 120, opacity: 0.4, dur: 60 },
          { left: '40%', top: '10%', size: 160, opacity: 0.3, dur: 80 },
          { left: '70%', top: '25%', size: 100, opacity: 0.35, dur: 70 },
          { left: '85%', top: '5%', size: 140, opacity: 0.25, dur: 90 },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: c.left,
            top: c.top,
            width: c.size,
            height: c.size * 0.5,
            borderRadius: '50%',
            background: `radial-gradient(ellipse, rgba(255,255,255,${c.opacity}) 0%, transparent 70%)`,
            animation: `cloudDrift${i % 2 === 0 ? 'A' : 'B'} ${c.dur}s linear infinite`,
            filter: 'blur(8px)',
          }} />
        ))}
      </div>

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none' }}
      />

      {/* Subtle overlay for content readability */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 3,
        background: `linear-gradient(
          180deg,
          rgba(13,74,31,0.35) 0%,
          rgba(13,74,31,0.15) 30%,
          rgba(13,74,31,0.20) 60%,
          rgba(11,61,26,0.45) 100%
        )`,
      }} />

      {/* CSS animations */}
      <style>{`
        @keyframes bgShift {
          0% { filter: brightness(1) saturate(1); }
          50% { filter: brightness(1.05) saturate(1.1); }
          100% { filter: brightness(0.95) saturate(1.05); }
        }
        @keyframes cloudDriftA {
          0% { transform: translateX(-200px); }
          100% { transform: translateX(calc(100vw + 200px)); }
        }
        @keyframes cloudDriftB {
          0% { transform: translateX(calc(100vw + 200px)); }
          100% { transform: translateX(-200px); }
        }
      `}</style>
    </div>
  );
}
