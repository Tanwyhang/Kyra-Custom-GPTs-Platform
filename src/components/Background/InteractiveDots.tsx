import React, { useEffect, useRef } from 'react';

interface Dot {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  vx: number;
  vy: number;
}

export function InteractiveDots() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeDots();
    };

    const initializeDots = () => {
      const dots: Dot[] = [];
      const spacing = 80;
      const cols = Math.ceil(canvas.width / spacing);
      const rows = Math.ceil(canvas.height / spacing);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing + (spacing / 2);
          const y = j * spacing + (spacing / 2);
          
          dots.push({
            x,
            y,
            originalX: x,
            originalY: y,
            vx: 0,
            vy: 0,
          });
        }
      }
      
      dotsRef.current = dots;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const mouse = mouseRef.current;
      const repulsionRadius = 150;
      const repulsionForce = 0.8;
      const returnForce = 0.05;
      const friction = 0.95;

      dotsRef.current.forEach((dot) => {
        // Calculate distance from mouse
        const dx = dot.x - mouse.x;
        const dy = dot.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < repulsionRadius) {
          // Apply repulsion force
          const force = (repulsionRadius - distance) / repulsionRadius;
          const angle = Math.atan2(dy, dx);
          
          dot.vx += Math.cos(angle) * force * repulsionForce;
          dot.vy += Math.sin(angle) * force * repulsionForce;
        }

        // Apply return force to original position
        const returnDx = dot.originalX - dot.x;
        const returnDy = dot.originalY - dot.y;
        
        dot.vx += returnDx * returnForce;
        dot.vy += returnDy * returnForce;

        // Apply friction
        dot.vx *= friction;
        dot.vy *= friction;

        // Update position
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Calculate opacity based on distance from original position
        const displacement = Math.sqrt(
          (dot.x - dot.originalX) ** 2 + (dot.y - dot.originalY) ** 2
        );
        const maxDisplacement = 50;
        const baseOpacity = 0.3;
        const maxOpacity = 0.9;
        const opacity = Math.min(
          maxOpacity,
          baseOpacity + (displacement / maxDisplacement) * (maxOpacity - baseOpacity)
        );

        // Draw dot
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    // Initialize
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}