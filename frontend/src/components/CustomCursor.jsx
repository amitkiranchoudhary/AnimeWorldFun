import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import './CustomCursor.css';

/* ── Smoke Particle ───────────────────────────── */
class SmokeParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 6 + 3;
        this.speedX = Math.random() * 2.4 - 1.2;
        this.speedY = -Math.random() * 3.5 - 1;
        this.life = 100;
        this.initialSize = this.size;
        this.hue = 200 + Math.random() * 40;
        this.saturation = 70 + Math.random() * 25;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedX *= 0.99;
        this.speedY *= 0.98;
        this.life -= 1.2;
        this.size = Math.max(0, this.initialSize * (this.life / 100));
    }
}

/* ── Animated Pointer Cursor ──────────────────── */
export default function CustomCursor() {
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const [isActive, setIsActive] = useState(false);
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let mouseX = -100, mouseY = -100;
        let prevMouseX = -100, prevMouseY = -100;
        let particles = [];
        let animId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            x.set(e.clientX);
            y.set(e.clientY);
        };

        const handleMouseEnter = () => setIsActive(true);
        const handleMouseLeave = () => { setIsActive(false); };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const dx = mouseX - prevMouseX;
            const dy = mouseY - prevMouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 1 && mouseX > 0) {
                const steps = Math.min(Math.ceil(dist / 4), 8);
                for (let s = 0; s < steps; s++) {
                    const t = s / steps;
                    const px = prevMouseX + dx * t + (Math.random() * 10 - 5);
                    const py = prevMouseY + dy * t + (Math.random() * 10 - 5);
                    particles.push(new SmokeParticle(px, py));
                }
            }

            prevMouseX = mouseX;
            prevMouseY = mouseY;

            particles = particles.filter(p => p.life > 0 && p.size > 0);
            for (const p of particles) {
                p.update();
                if (p.size > 0) {
                    const opacity = (p.life / 100) * 0.6;
                    ctx.fillStyle = `hsla(${p.hue}, ${p.saturation}%, 60%, ${opacity})`;
                    ctx.shadowColor = `hsla(${p.hue}, 80%, 50%, ${opacity * 0.5})`;
                    ctx.shadowBlur = p.size * 2;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.shadowBlur = 0;

            animId = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseenter', handleMouseEnter);
        document.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('resize', resize);

        resize();
        setIsActive(true);
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseenter', handleMouseEnter);
            document.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('resize', resize);
        };
    }, [x, y]);

    return (
        <>
            {/* Smoke trail layer */}
            <canvas ref={canvasRef} className="cursor-smoke-canvas" />

            {/* Animated pointer — adapted from Pointer component */}
            <AnimatePresence>
                {isActive && (
                    <motion.div
                        className="cursor-pointer-wrapper"
                        style={{
                            top: y,
                            left: x,
                        }}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                    >
                        {/* Pointer SVG — classic cursor arrow shape */}
                        <svg
                            stroke="currentColor"
                            fill="currentColor"
                            strokeWidth="1"
                            viewBox="0 0 16 16"
                            className="cursor-pointer-svg"
                            height="28"
                            width="28"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 0 0 1 .556.103z" />
                        </svg>

                        {/* Glow ring behind the pointer */}
                        <motion.div
                            className="cursor-pointer-glow"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.4, 0.15, 0.4],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
