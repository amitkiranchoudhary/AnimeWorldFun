import { useEffect, useRef, useState } from 'react';
import './AnimeCharacter.css';

export default function AnimeCharacter() {
    const charRef = useRef(null);
    const [eyeStyle, setEyeStyle] = useState({ left: {}, right: {} });

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!charRef.current) return;
            const rect = charRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height * 0.35; // eye level

            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const angle = Math.atan2(dy, dx);
            const distance = Math.min(Math.sqrt(dx * dx + dy * dy) / 200, 1);
            const maxMove = 3;

            const moveX = Math.cos(angle) * distance * maxMove;
            const moveY = Math.sin(angle) * distance * maxMove;

            setEyeStyle({
                left: { transform: `translate(${moveX}px, ${moveY}px)` },
                right: { transform: `translate(${moveX}px, ${moveY}px)` }
            });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="anime-char" ref={charRef}>
            <svg viewBox="0 0 120 160" className="anime-char__svg" xmlns="http://www.w3.org/2000/svg">
                {/* Body - simple chibi style */}
                <defs>
                    <radialGradient id="faceGrad" cx="50%" cy="40%">
                        <stop offset="0%" stopColor="#ffe0bd" />
                        <stop offset="100%" stopColor="#f0c89a" />
                    </radialGradient>
                    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffb347" />
                        <stop offset="100%" stopColor="#ff6f00" />
                    </linearGradient>
                    <linearGradient id="cloakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#f97316" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </linearGradient>
                </defs>

                {/* Hair spikes (Naruto style) */}
                <polygon points="20,42 35,8 45,38" fill="url(#hairGrad)" />
                <polygon points="35,35 48,5 55,32" fill="url(#hairGrad)" />
                <polygon points="50,30 60,2 70,30" fill="url(#hairGrad)" />
                <polygon points="65,32 72,5 85,35" fill="url(#hairGrad)" />
                <polygon points="75,38 85,8 100,42" fill="url(#hairGrad)" />

                {/* Face */}
                <ellipse cx="60" cy="55" rx="32" ry="28" fill="url(#faceGrad)" />

                {/* Hair front */}
                <path d="M28,50 Q35,30 60,28 Q85,30 92,50 Q85,38 60,36 Q35,38 28,50" fill="url(#hairGrad)" />

                {/* Headband */}
                <rect x="28" y="42" width="64" height="8" rx="2" fill="#3b82f6" />
                <rect x="50" y="40" width="20" height="12" rx="2" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
                {/* Leaf symbol */}
                <path d="M57,46 Q60,42 63,46 Q60,50 57,46" fill="#3b82f6" stroke="#1e40af" strokeWidth="0.5" />

                {/* Whisker marks */}
                <line x1="32" y1="58" x2="42" y2="57" stroke="#d4a574" strokeWidth="1" />
                <line x1="32" y1="62" x2="42" y2="61" stroke="#d4a574" strokeWidth="1" />
                <line x1="32" y1="66" x2="42" y2="65" stroke="#d4a574" strokeWidth="1" />
                <line x1="78" y1="57" x2="88" y2="58" stroke="#d4a574" strokeWidth="1" />
                <line x1="78" y1="61" x2="88" y2="62" stroke="#d4a574" strokeWidth="1" />
                <line x1="78" y1="65" x2="88" y2="66" stroke="#d4a574" strokeWidth="1" />

                {/* Mouth - happy */}
                <path d="M52,70 Q60,76 68,70" fill="none" stroke="#c07050" strokeWidth="1.5" strokeLinecap="round" />

                {/* Body / cloak */}
                <path d="M35,80 Q30,85 28,110 L40,115 L60,118 L80,115 L92,110 Q90,85 85,80 Q60,90 35,80" fill="url(#cloakGrad)" />

                {/* Zipper line */}
                <line x1="60" y1="82" x2="60" y2="115" stroke="#ea580c" strokeWidth="2" strokeDasharray="3,3" />

                {/* Arms */}
                <path d="M28,90 Q20,100 22,115" fill="none" stroke="url(#cloakGrad)" strokeWidth="8" strokeLinecap="round" />
                <path d="M92,90 Q100,100 98,115" fill="none" stroke="url(#cloakGrad)" strokeWidth="8" strokeLinecap="round" />

                {/* Hands */}
                <circle cx="22" cy="117" r="5" fill="#ffe0bd" />
                <circle cx="98" cy="117" r="5" fill="#ffe0bd" />

                {/* Legs */}
                <rect x="42" y="115" width="12" height="18" rx="4" fill="#1e3a5f" />
                <rect x="66" y="115" width="12" height="18" rx="4" fill="#1e3a5f" />

                {/* Sandals */}
                <rect x="40" y="131" width="16" height="5" rx="2" fill="#1e40af" />
                <rect x="64" y="131" width="16" height="5" rx="2" fill="#1e40af" />
            </svg>

            {/* Eyes rendered separately for mouse tracking */}
            <div className="anime-char__eyes">
                <div className="anime-char__eye anime-char__eye--left">
                    <div className="anime-char__pupil" style={eyeStyle.left} />
                </div>
                <div className="anime-char__eye anime-char__eye--right">
                    <div className="anime-char__pupil" style={eyeStyle.right} />
                </div>
            </div>

            {/* Speech bubble */}
            <div className="anime-char__bubble">
                Dattebayo! 🍥
            </div>
        </div>
    );
}
