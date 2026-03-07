import { useEffect, useRef } from 'react';

/**
 * Hook that adds mouse-move parallax effect to child elements.
 * Elements with data-parallax-speed="X" will move based on mouse position.
 * Speed 1 = subtle, 5 = dramatic.
 */
export default function useMouseParallax(containerRef) {
    const rafId = useRef(null);

    useEffect(() => {
        const container = containerRef?.current;
        if (!container) return;

        const handleMouseMove = (e) => {
            if (rafId.current) cancelAnimationFrame(rafId.current);

            rafId.current = requestAnimationFrame(() => {
                const rect = container.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const mouseX = (e.clientX - centerX) / rect.width;
                const mouseY = (e.clientY - centerY) / rect.height;

                const parallaxElements = container.querySelectorAll('[data-parallax-speed]');
                parallaxElements.forEach((el) => {
                    const speed = parseFloat(el.dataset.parallaxSpeed) || 1;
                    const x = mouseX * speed * 30;
                    const y = mouseY * speed * 30;
                    el.style.transform = `translate(${x}px, ${y}px)`;
                });
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId.current) cancelAnimationFrame(rafId.current);
        };
    }, [containerRef]);
}
