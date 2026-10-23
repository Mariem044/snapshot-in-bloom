import { useEffect, useRef, useState } from "react";
import { Radio, Tv, VolumeX } from "lucide-react";

function FogCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0, h = 0, raf = 0;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    const ash = Array.from({ length: 70 }, () => ({
      x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.3, vy: Math.random() * 0.35 + 0.08, a: Math.random() * 0.5 + 0.2,
      p: Math.random() * Math.PI * 2,
    }));
    const fog = Array.from({ length: 7 }, (_, i) => ({
      x: Math.random() * w, y: (h / 7) * i + Math.random() * 60, r: 220 + Math.random() * 260,
      vx: (Math.random() * 0.25 + 0.05) * (Math.random() > 0.5 ? 1 : -1),
    }));
    const tick = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      for (const f of fog) {
        f.x += f.vx;
        if (f.x - f.r > w) f.x = -f.r;
        if (f.x + f.r < 0) f.x = w + f.r;
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r);
        g.addColorStop(0, "rgba(180,175,170,0.07)");
        g.addColorStop(1, "rgba(180,175,170,0)");
        ctx.fillStyle = g;
        ctx.fillRect(f.x - f.r, f.y - f.r, f.r * 2, f.r * 2);
      }
      for (const p of ash) {
        p.x += p.vx + Math.sin(t / 1500 + p.p) * 0.25;
        p.y += p.vy;
        if (p.y > h + 5) { p.y = -5; p.x = Math.random() * w; }
        ctx.fillStyle = `rgba(210,200,190,${p.a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0" />;
}

function useStatic() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [on, setOn] = useState(false);
  const toggle = async () => {
    if (!ctxRef.current) {
      const ac = new AudioContext();
      const len = ac.sampleRate * 2;
      const buf = ac.createBuffer(1, len, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (Math.random() > 0.9995 ? 4 : 1);
      const src = ac.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const band = ac.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = 1800;
      band.Q.value = 0.6;
      const gain = ac.createGain();
      gain.gain.value = 0.05;
      const lfo = ac.createOscillator();
      const lfoGain = ac.createGain();
      lfo.frequency.value = 0.15;
      lfoGain.gain.value = 0.03;
      lfo.connect(lfoGain).connect(gain.gain);
      src.connect(band).connect(gain).connect(ac.destination);
      src.start();
      lfo.start();
      ctxRef.current = ac;
      setOn(true);
      return;
    }
    if (on) { await ctxRef.current.suspend(); setOn(false); }
    else { await ctxRef.current.resume(); setOn(true); }
  };
  return { on, toggle };
}

export function Atmosphere() {
  const [crt, setCrt] = useState(true);
  const { on, toggle } = useStatic();
  return (
    <>
      <FogCanvas />
      {crt && <div className="crt" aria-hidden />}
      <div className="fixed right-3 top-3 z-70 flex gap-2">
        <button
          onClick={toggle}
          aria-label={on ? "Mute radio static" : "Play radio static"}
          className="flex h-10 items-center gap-1.5 rounded border border-border bg-card/80 px-3 text-xs text-muted-foreground backdrop-blur transition hover:border-primary hover:text-primary"
        >
          {on ? <Radio className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4" />}
          <span className="hidden sm:inline">{on ? "Static on" : "Muted"}</span>
        </button>
        <button
          onClick={() => setCrt((v) => !v)}
          aria-label="Toggle CRT scanlines"
          aria-pressed={crt}
          className="flex h-10 items-center gap-1.5 rounded border border-border bg-card/80 px-3 text-xs text-muted-foreground backdrop-blur transition hover:border-primary hover:text-primary"
        >
          <Tv className={crt ? "h-4 w-4 text-primary" : "h-4 w-4"} />
          <span className="hidden sm:inline">CRT</span>
        </button>
      </div>
    </>
  );
}
