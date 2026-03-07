import confetti from 'canvas-confetti';

const animeColors = ['#8b5cf6', '#ec4899', '#f59e0b', '#f97316', '#06b6d4', '#c084fc'];

/**
 * Fire anime-themed confetti from a button click event.
 * Call this in onClick handlers: fireConfetti(e)
 */
export function fireConfetti(event) {
    if (!event || !event.currentTarget) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Anime star shapes
    const star = confetti.shapeFromPath({
        path: 'M5 0 L6.2 3.8 L10 3.8 L7 6.2 L8.2 10 L5 7.6 L1.8 10 L3 6.2 L0 3.8 L3.8 3.8 Z',
    });

    confetti({
        particleCount: 25,
        spread: 60,
        origin: { x, y },
        colors: animeColors,
        shapes: [star, 'circle'],
        scalar: 1.2,
        gravity: 0.8,
        ticks: 50,
        startVelocity: 20,
    });
}

/**
 * Fire fireworks-style confetti (for special actions like signup/login success)
 */
export function fireFireworks() {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
        if (Date.now() > end) return;

        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            startVelocity: 50,
            origin: { x: 0, y: 0.6 },
            colors: animeColors,
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            startVelocity: 50,
            origin: { x: 1, y: 0.6 },
            colors: animeColors,
        });

        requestAnimationFrame(frame);
    };
    frame();
}
