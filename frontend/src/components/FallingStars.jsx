import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import './FallingStars.css';

export default function FallingStars() {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        const material = new THREE.ShaderMaterial({
            uniforms: {
                iTime: { value: 0 },
                iResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
            },
            vertexShader: `
                void main() {
                    gl_Position = vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float iTime;
                uniform vec2 iResolution;

                float rand(vec2 n) {
                    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
                }

                float noise(vec2 p) {
                    vec2 ip = floor(p);
                    vec2 u = fract(p);
                    u = u * u * (3.0 - 2.0 * u);
                    float res = mix(
                        mix(rand(ip), rand(ip + vec2(1.0, 0.0)), u.x),
                        mix(rand(ip + vec2(0.0, 1.0)), rand(ip + vec2(1.0, 1.0)), u.x), u.y);
                    return res * res;
                }

                // "Your Name" style falling stars
                void main() {
                    vec2 uv = gl_FragCoord.xy / iResolution.xy;
                    vec2 p = (gl_FragCoord.xy - iResolution.xy * 0.5) / iResolution.y;

                    // Deep night sky base
                    vec3 col = vec3(0.02, 0.01, 0.04);

                    // Subtle nebula / aurora glow
                    float nebula = noise(p * 3.0 + iTime * 0.05) * 0.15;
                    col += vec3(0.15, 0.05, 0.25) * nebula;

                    // Twinkling stars (static background)
                    for (float i = 0.0; i < 80.0; i++) {
                        vec2 starPos = vec2(
                            rand(vec2(i, i * 7.13)),
                            rand(vec2(i * 3.7, i * 11.3))
                        ) * 2.0 - 1.0;
                        starPos.x *= iResolution.x / iResolution.y;

                        float dist = length(p - starPos);
                        float brightness = rand(vec2(i * 5.1, i * 2.3));
                        float twinkle = 0.5 + 0.5 * sin(iTime * (1.0 + brightness * 3.0) + i * 6.28);
                        float star = smoothstep(0.003, 0.0, dist) * brightness * twinkle;
                        col += vec3(0.8, 0.85, 1.0) * star;
                    }

                    // Shooting stars / falling comets ("Your Name" style)
                    for (float i = 0.0; i < 6.0; i++) {
                        float speed = 0.3 + rand(vec2(i, 42.0)) * 0.5;
                        float offset = rand(vec2(i * 13.7, 7.3)) * 20.0;
                        float t = mod(iTime * speed + offset, 8.0);

                        // Only visible for a portion of the cycle
                        float visibility = smoothstep(0.0, 0.5, t) * smoothstep(4.0, 3.0, t);

                        // Start position (top area, random X)
                        float startX = (rand(vec2(i * 5.1, 3.2)) * 2.0 - 1.0) * (iResolution.x / iResolution.y);
                        float startY = 0.5 + rand(vec2(i * 1.7, 9.1)) * 0.3;

                        // Direction: falling diagonally
                        float angle = -0.6 - rand(vec2(i, 13.0)) * 0.4;
                        vec2 dir = vec2(cos(angle), sin(angle));

                        vec2 cometPos = vec2(startX, startY) + dir * t * 0.8;

                        // Comet head
                        float headDist = length(p - cometPos);
                        float head = smoothstep(0.008, 0.0, headDist) * visibility;

                        // Comet tail (line trail)
                        for (float j = 0.0; j < 20.0; j++) {
                            vec2 tailPos = cometPos - dir * j * 0.012;
                            float tailDist = length(p - tailPos);
                            float tailFade = 1.0 - j / 20.0;
                            float tail = smoothstep(0.004 * tailFade, 0.0, tailDist) * tailFade * visibility * 0.6;

                            // Blue-purple comet color
                            col += vec3(0.4, 0.5, 1.0) * tail * 0.3;
                        }

                        // Bright white core
                        col += vec3(0.9, 0.92, 1.0) * head * 2.0;
                        // Purple glow around head
                        float glow = smoothstep(0.04, 0.0, headDist) * visibility;
                        col += vec3(0.5, 0.3, 0.9) * glow * 0.5;
                    }

                    // Vignette
                    float vignette = 1.0 - 0.4 * length(uv - 0.5);
                    col *= vignette;

                    gl_FragColor = vec4(col, 0.6);
                }
            `,
            transparent: true
        });

        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        let frameId;
        const animate = () => {
            material.uniforms.iTime.value += 0.016;
            renderer.render(scene, camera);
            frameId = requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            material.uniforms.iResolution.value.set(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', handleResize);
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
            geometry.dispose();
            material.dispose();
            renderer.dispose();
        };
    }, []);

    return <div ref={containerRef} className="falling-stars" />;
}
