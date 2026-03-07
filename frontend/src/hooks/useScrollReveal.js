import { useEffect } from 'react';

/**
 * Hook that adds scroll-reveal animations using IntersectionObserver.
 * Add class "scroll-reveal", "scroll-reveal-left", "scroll-reveal-right", or "scroll-reveal-scale"
 * to any element you want to animate on scroll.
 *
 * Stagger: add data-delay="0.1" (seconds) for staggered animations on children.
 */
export default function useScrollReveal() {
    useEffect(() => {
        const revealClasses = [
            'scroll-reveal',
            'scroll-reveal-left',
            'scroll-reveal-right',
            'scroll-reveal-scale'
        ];

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const delay = entry.target.dataset.delay || 0;
                        setTimeout(() => {
                            entry.target.classList.add('revealed');
                        }, parseFloat(delay) * 1000);
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -60px 0px'
            }
        );

        // Observe all reveal elements
        revealClasses.forEach((cls) => {
            document.querySelectorAll(`.${cls}`).forEach((el) => {
                observer.observe(el);
            });
        });

        return () => observer.disconnect();
    }, []);
}
