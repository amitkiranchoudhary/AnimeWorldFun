import { useEffect, useRef, useState } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const trailRef = useRef(null);
    const [clicking, setClicking] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const cursor = cursorRef.current;
        const trail = trailRef.current;
        let mouseX = 0, mouseY = 0;
        let trailX = 0, trailY = 0;

        const handleMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (!visible) setVisible(true);
            if (cursor) {
                cursor.style.left = mouseX + 'px';
                cursor.style.top = mouseY + 'px';
            }
        };

        const handleMouseDown = () => setClicking(true);
        const handleMouseUp = () => setClicking(false);
        const handleMouseLeave = () => setVisible(false);
        const handleMouseEnter = () => setVisible(true);

        // Smooth trail animation
        const animateTrail = () => {
            trailX += (mouseX - trailX) * 0.15;
            trailY += (mouseY - trailY) * 0.15;
            if (trail) {
                trail.style.left = trailX + 'px';
                trail.style.top = trailY + 'px';
            }
            requestAnimationFrame(animateTrail);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('mouseleave', handleMouseLeave);
        document.addEventListener('mouseenter', handleMouseEnter);
        animateTrail();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('mouseleave', handleMouseLeave);
            document.removeEventListener('mouseenter', handleMouseEnter);
        };
    }, [visible]);

    return (
        <>
            <div
                ref={cursorRef}
                className={`custom-cursor ${clicking ? 'custom-cursor--click' : ''} ${visible ? 'custom-cursor--visible' : ''}`}
            >
                <img src="/images/saitama-cursor.png" alt="" className="custom-cursor__img" draggable={false} />
            </div>
            <div
                ref={trailRef}
                className={`custom-cursor-trail ${visible ? 'custom-cursor-trail--visible' : ''}`}
            />
        </>
    );
}
