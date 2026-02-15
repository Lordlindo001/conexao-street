// effects.js — subtle premium background particles (no deps)
(() => {
  "use strict";

  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  const canvas = document.createElement("canvas");
  canvas.id = "csFxCanvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d", { alpha: true });
  let w = 0, h = 0, dpr = Math.min(2, window.devicePixelRatio || 1);

  function resize(){
    w = Math.max(320, window.innerWidth);
    h = Math.max(320, window.innerHeight);
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }

  const rand = (a,b)=> a + Math.random()*(b-a);
  const particles = [];
  const N = Math.max(32, Math.min(80, Math.floor((window.innerWidth*window.innerHeight)/26000)));

  function seed(){
    particles.length = 0;
    for(let i=0;i<N;i++){
      particles.push({
        x: rand(0,w),
        y: rand(0,h),
        r: rand(0.6, 2.2),
        a: rand(0.08, 0.20),
        vx: rand(-0.15, 0.15),
        vy: rand(-0.10, 0.10),
        hue: Math.random() < .55 ? 268 : 280
      });
    }
  }

  function step(){
    ctx.clearRect(0,0,w,h);

    // soft vignette
    const g = ctx.createRadialGradient(w*0.2, h*0.2, 120, w*0.5, h*0.5, Math.max(w,h)*0.75);
    g.addColorStop(0, "rgba(122,43,255,0.07)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0,0,w,h);

    for(const p of particles){
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < -20) p.x = w+20;
      if (p.x > w+20) p.x = -20;
      if (p.y < -20) p.y = h+20;
      if (p.y > h+20) p.y = -20;

      ctx.beginPath();
      ctx.fillStyle = `hsla(${p.hue}, 95%, 70%, ${p.a})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  window.addEventListener("resize", () => { resize(); seed(); }, { passive:true });

  resize();
  seed();
  step();
})();
