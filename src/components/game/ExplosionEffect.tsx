import { useEffect, useRef, useCallback } from 'react';
import type { Position } from '@/types/game';

interface ExplosionEffectProps {
  positions: Position[];
  onComplete: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  decay: number;
}

const BLOCK_COLORS = ['#7C3AED', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#8B5CF6'];

export default function ExplosionEffect({ positions, onComplete }: ExplosionEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const createParticles = useCallback(() => {
    const container = containerRef.current;
    if (!container) return [];

    const containerRect = container.getBoundingClientRect();
    const cellSize = containerRect.width / 8;

    const particles: Particle[] = [];

    positions.forEach((pos) => {
      const baseX = pos.col * cellSize + cellSize / 2;
      const baseY = pos.row * cellSize + cellSize / 2;
      const color = BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)];

      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI * 2 * i) / 10 + Math.random() * 0.6;
        const speed = 2 + Math.random() * 5;
        particles.push({
          x: baseX,
          y: baseY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 2,
          color,
          size: 2 + Math.random() * 5,
          life: 1,
          decay: 0.015 + Math.random() * 0.025,
        });
      }
    });

    return particles;
  }, [positions]);

  useEffect(() => {
    if (positions.length === 0) {
      onComplete();
      return;
    }

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const containerRect = container.getBoundingClientRect();
    canvas.width = containerRect.width;
    canvas.height = containerRect.height;

    particlesRef.current = createParticles();

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.98;
        p.life -= p.decay;
        p.size *= 0.97;

        if (p.life <= 0) return false;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        return true;
      });

      if (particlesRef.current.length > 0) {
        animId = requestAnimationFrame(animate);
      } else {
        onComplete();
      }
    };

    animId = requestAnimationFrame(animate);
    animRef.current = animId;

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [positions, createParticles, onComplete]);

  if (positions.length === 0) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none z-30">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
      />
    </div>
  );
}
