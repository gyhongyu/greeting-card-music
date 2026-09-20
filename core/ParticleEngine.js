/**
 * ParticleEngine.js - CardForge 3D & Canvas 2D 粒子物理引擎
 * 純 JavaScript 實作 (使用 React.createElement)，在 file:/// 協議下零 CORS 阻擋
 */

(function () {
    function ParticleEngine({ effect = {} }) {
        const canvasRef = React.useRef(null);
        const effectType = effect.particleType || 'rising-stardust';
        const primaryColor = effect.color || '#c9a96e';

        React.useEffect(() => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            let animId = null;
            const parent = canvas.parentElement;
            let width = (canvas.width = parent ? parent.clientWidth : window.innerWidth);
            let height = (canvas.height = parent ? parent.clientHeight : window.innerHeight);

            const userOpacity = effect.particleOpacity !== undefined ? Number(effect.particleOpacity) : 0.8;
            const userSpeed = effect.particleSpeed !== undefined ? Number(effect.particleSpeed) : 1.0;

            const handleResize = () => {
                const p = canvas.parentElement;
                width = canvas.width = p ? p.clientWidth : window.innerWidth;
                height = canvas.height = p ? p.clientHeight : window.innerHeight;
            };
            window.addEventListener('resize', handleResize);

            // 1. METEOR SHOWER
            let meteors = [];
            function createMeteor() {
                return {
                    x: Math.random() * width + 200,
                    y: Math.random() * -100,
                    len: Math.random() * 90 + 70,
                    speed: (Math.random() * 10 + 12) * userSpeed,
                    size: Math.random() * 1.8 + 1.2,
                    opacity: (Math.random() * 0.5 + 0.3) * userOpacity
                };
            }
            for (let i = 0; i < 6; i++) meteors.push(createMeteor());

            // 2. RISING STARDUST
            let stardust = [];
            const dustCount = effect.particleDensity ? effect.particleDensity * 2 : 60;
            for (let i = 0; i < dustCount; i++) {
                stardust.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2.5 + 0.8,
                    speed: (Math.random() * 0.8 + 0.4) * userSpeed,
                    wobbleSpeed: (Math.random() * 0.02 + 0.01) * userSpeed,
                    wobbleAmp: Math.random() * 30 + 10,
                    opacity: (Math.random() * 0.6 + 0.25) * userOpacity,
                    phase: Math.random() * Math.PI * 2
                });
            }

            // 3. BLACK HOLE VORTEX
            let vortexStars = [];
            for (let i = 0; i < 150; i++) {
                vortexStars.push({
                    angle: Math.random() * Math.PI * 2,
                    dist: Math.random() * Math.max(width, height) * 0.5 + 40,
                    speed: (Math.random() * 0.008 + 0.003) * userSpeed,
                    size: Math.random() * 2 + 0.8,
                    opacity: (Math.random() * 0.6 + 0.3) * userOpacity
                });
            }

            // 4. SAKURA FALLING
            let petals = [];
            const petalCount = effect.particleDensity ? effect.particleDensity : 35;
            for (let i = 0; i < petalCount; i++) {
                petals.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    size: Math.random() * 12 + 8,
                    speedX: (Math.random() * 1.5 - 0.5) * userSpeed,
                    speedY: (Math.random() * 1.2 + 0.8) * userSpeed,
                    rotation: Math.random() * 360,
                    flip: Math.random() * Math.PI,
                    flipSpeed: (Math.random() * 0.03 + 0.01) * userSpeed,
                    opacity: (Math.random() * 0.5 + 0.4) * userOpacity
                });
            }

            // 5. ORBITAL SATELLITES
            let satellites = [];
            for (let i = 0; i < 5; i++) {
                satellites.push({
                    angle: (i * Math.PI * 2) / 5,
                    rx: Math.min(width, height) * 0.38,
                    ry: Math.min(width, height) * 0.16,
                    tilt: (i * 35 * Math.PI) / 180,
                    speed: (0.006 + i * 0.0015) * userSpeed,
                    size: 3 + i * 0.8
                });
            }

            function loop() {
                ctx.clearRect(0, 0, width, height);

                if (effectType === 'meteor-shower') {
                    for (let m of meteors) {
                        m.x -= m.speed * 1.2;
                        m.y += m.speed;
                        ctx.save();
                        ctx.strokeStyle = `rgba(255, 255, 255, ${m.opacity})`;
                        ctx.lineWidth = m.size;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(m.x, m.y);
                        ctx.lineTo(m.x + m.len * 1.2, m.y - m.len);
                        ctx.stroke();
                        ctx.restore();
                        if (m.y > height + 100 || m.x < -200) {
                            Object.assign(m, createMeteor());
                        }
                    }
                } else if (effectType === 'rising-stardust') {
                    for (let d of stardust) {
                        d.y -= d.speed;
                        d.phase += d.wobbleSpeed;
                        const currentX = d.x + Math.sin(d.phase) * d.wobbleAmp;
                        ctx.save();
                        ctx.fillStyle = primaryColor;
                        ctx.globalAlpha = d.opacity;
                        ctx.beginPath();
                        ctx.arc(currentX, d.y, d.radius, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                        if (d.y < -20) {
                            d.y = height + 20;
                            d.x = Math.random() * width;
                        }
                    }
                } else if (effectType === 'blackhole-vortex') {
                    const cx = width / 2;
                    const cy = height / 2;
                    for (let s of vortexStars) {
                        s.angle += s.speed;
                        s.dist -= 0.3 * userSpeed;
                        if (s.dist < 20) {
                            s.dist = Math.max(width, height) * 0.5 + Math.random() * 50;
                        }
                        const x = cx + Math.cos(s.angle) * s.dist;
                        const y = cy + Math.sin(s.angle) * s.dist * 0.5;
                        ctx.save();
                        ctx.fillStyle = 'rgba(192, 132, 252, ' + s.opacity + ')';
                        ctx.beginPath();
                        ctx.arc(x, y, s.size, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                } else if (effectType === 'sakura-canvas') {
                    for (let p of petals) {
                        p.y += p.speedY;
                        p.x += Math.sin(p.flip) * 0.8;
                        p.flip += p.flipSpeed;
                        ctx.save();
                        ctx.translate(p.x, p.y);
                        ctx.rotate((p.rotation * Math.PI) / 180);
                        ctx.scale(Math.cos(p.flip), 1);
                        ctx.fillStyle = 'rgba(251, 182, 206, ' + p.opacity + ')';
                        ctx.beginPath();
                        ctx.moveTo(0, 0);
                        ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size, p.size / 3, 0, p.size);
                        ctx.bezierCurveTo(p.size, p.size / 3, p.size / 2, -p.size / 2, 0, 0);
                        ctx.fill();
                        ctx.restore();
                        if (p.y > height + 30) {
                            p.y = -30;
                            p.x = Math.random() * width;
                        }
                    }
                } else if (effectType === 'orbital-satellites') {
                    const cx = width / 2;
                    const cy = height / 2;
                    for (let sat of satellites) {
                        sat.angle += sat.speed;
                        const cos = Math.cos(sat.angle);
                        const sin = Math.sin(sat.angle);
                        const x = cx + (cos * sat.rx * Math.cos(sat.tilt) - sin * sat.ry * Math.sin(sat.tilt));
                        const y = cy + (cos * sat.rx * Math.sin(sat.tilt) + sin * sat.ry * Math.cos(sat.tilt));
                        ctx.strokeStyle = `rgba(201, 169, 110, ${0.12 * userOpacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.ellipse(cx, cy, sat.rx, sat.ry, sat.tilt, 0, Math.PI * 2);
                        ctx.stroke();

                        const grad = ctx.createRadialGradient(x, y, 0, x, y, sat.size * 3);
                        grad.addColorStop(0, '#ffffff');
                        grad.addColorStop(0.5, primaryColor);
                        grad.addColorStop(1, 'transparent');
                        ctx.fillStyle = grad;
                        ctx.globalAlpha = userOpacity;
                        ctx.beginPath();
                        ctx.arc(x, y, sat.size * 2.5, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.globalAlpha = 1.0;
                    }
                }
                animId = requestAnimationFrame(loop);
            }

            animId = requestAnimationFrame(loop);

            return () => {
                cancelAnimationFrame(animId);
                window.removeEventListener('resize', handleResize);
            };
        }, [effectType, primaryColor, effect.particleDensity, effect.particleOpacity, effect.particleSpeed]);

        if (effectType === 'none') return null;

        return React.createElement('canvas', {
            ref: canvasRef,
            className: 'absolute inset-0 pointer-events-none z-10 w-full h-full'
        });
    }

    window.ParticleEngine = ParticleEngine;
})();
