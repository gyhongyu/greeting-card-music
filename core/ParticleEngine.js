/**
 * ParticleEngine.js - High-End 3D & Procedural Canvas FX System
 * Replaces amateur emojis with real procedural visual effects:
 * 1. 'meteor-shower' (璀璨流星雨：帶長光尾對角劃過星空)
 * 2. 'rising-stardust' (神聖升空星塵：微光金塵自下而上悠揚升騰)
 * 3. 'blackhole-vortex' (黑洞引力渦流：星塵螺旋環繞引力奇異點)
 * 4. 'orbital-satellites' (衛星環繞：3D橢圓軌道光球與巡航光跡)
 * 5. 'sakura-canvas' (法式落櫻：純 Canvas 貝茲曲線真實花瓣飄落翻轉)
 */
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
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);

        // ================= 1. METEOR SHOWER (流星雨) =================
        let meteors = [];
        function createMeteor() {
            return {
                x: Math.random() * width + 200,
                y: Math.random() * -100,
                len: Math.random() * 90 + 70,
                speed: Math.random() * 10 + 12,
                size: Math.random() * 1.8 + 1.2,
                opacity: Math.random() * 0.7 + 0.3
            };
        }
        for (let i = 0; i < 6; i++) meteors.push(createMeteor());

        // ================= 2. RISING STARDUST (升空星塵/金塵) =================
        let stardust = [];
        const dustCount = effect.particleDensity ? effect.particleDensity * 2 : 60;
        for (let i = 0; i < dustCount; i++) {
            stardust.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 2.5 + 0.8,
                speed: Math.random() * 0.8 + 0.4,
                wobbleSpeed: Math.random() * 0.02 + 0.01,
                wobbleAmp: Math.random() * 30 + 10,
                opacity: Math.random() * 0.7 + 0.25,
                phase: Math.random() * Math.PI * 2
            });
        }

        // ================= 3. BLACK HOLE VORTEX (黑洞引力旋渦) =================
        let vortexStars = [];
        for (let i = 0; i < 150; i++) {
            vortexStars.push({
                angle: Math.random() * Math.PI * 2,
                radius: Math.random() * (Math.min(width, height) * 0.48) + 30,
                speed: (Math.random() * 0.006 + 0.003),
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.8 + 0.2
            });
        }

        // ================= 4. SAKURA PETALS (真實落櫻花瓣) =================
        let petals = [];
        for (let i = 0; i < 35; i++) {
            petals.push({
                x: Math.random() * width,
                y: Math.random() * height,
                size: Math.random() * 8 + 7,
                speedY: Math.random() * 1.2 + 0.8,
                speedX: Math.random() * 0.8 - 0.4,
                flip: Math.random() * Math.PI,
                flipSpeed: Math.random() * 0.03 + 0.01,
                rotation: Math.random() * 360,
                opacity: Math.random() * 0.4 + 0.55
            });
        }

        // ================= 5. ORBITAL SATELLITES (衛星環繞) =================
        let satellites = [];
        for (let i = 0; i < 3; i++) {
            satellites.push({
                angle: (i * Math.PI * 2) / 3,
                rx: width * 0.38,
                ry: height * 0.16,
                speed: 0.008 + i * 0.003,
                tilt: -0.25 + i * 0.2,
                size: 3.5 + i
            });
        }

        let frameCount = 0;

        function loop() {
            ctx.clearRect(0, 0, width, height);
            frameCount++;

            // MODE 1: METEOR SHOWER
            if (effectType === 'meteor-shower') {
                for (let m of meteors) {
                    m.x -= m.speed;
                    m.y += m.speed * 0.75;

                    const grad = ctx.createLinearGradient(m.x, m.y, m.x + m.len, m.y - m.len * 0.75);
                    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
                    grad.addColorStop(0.2, primaryColor);
                    grad.addColorStop(1, 'transparent');

                    ctx.strokeStyle = grad;
                    ctx.lineWidth = m.size;
                    ctx.beginPath();
                    ctx.moveTo(m.x, m.y);
                    ctx.lineTo(m.x + m.len, m.y - m.len * 0.75);
                    ctx.stroke();

                    // Head Spark
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(m.x, m.y, m.size * 1.3, 0, Math.PI * 2);
                    ctx.fill();

                    if (m.x < -100 || m.y > height + 100) {
                        Object.assign(m, createMeteor());
                    }
                }
            }

            // MODE 2: RISING STARDUST (升空星塵)
            else if (effectType === 'rising-stardust') {
                for (let s of stardust) {
                    s.y -= s.speed;
                    s.phase += s.wobbleSpeed;
                    const curX = s.x + Math.sin(s.phase) * s.wobbleAmp;

                    const grad = ctx.createRadialGradient(curX, s.y, 0, curX, s.y, s.radius * 3.5);
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.4, primaryColor);
                    grad.addColorStop(1, 'transparent');

                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(curX, s.y, s.radius * 3, 0, Math.PI * 2);
                    ctx.fill();

                    if (s.y < -20) {
                        s.y = height + 20;
                        s.x = Math.random() * width;
                    }
                }
            }

            // MODE 3: BLACK HOLE VORTEX (黑洞引力渦流)
            else if (effectType === 'blackhole-vortex') {
                const cx = width / 2;
                const cy = height / 2;

                for (let v of vortexStars) {
                    v.angle += v.speed * (350 / (v.radius + 50));
                    v.radius -= 0.18; // Slowly sucked in

                    const px = cx + Math.cos(v.angle) * v.radius * 1.3;
                    const py = cy + Math.sin(v.angle) * v.radius * 0.75;

                    ctx.fillStyle = primaryColor;
                    ctx.globalAlpha = v.opacity;
                    ctx.beginPath();
                    ctx.arc(px, py, v.size, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1.0;

                    if (v.radius < 15) {
                        v.radius = Math.min(width, height) * 0.45;
                        v.angle = Math.random() * Math.PI * 2;
                    }
                }
            }

            // MODE 4: SAKURA PETALS (真實落櫻花瓣)
            else if (effectType === 'sakura-canvas') {
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
            }

            // MODE 5: ORBITAL SATELLITES (3D 衛星環繞)
            else if (effectType === 'orbital-satellites') {
                const cx = width / 2;
                const cy = height / 2;

                for (let sat of satellites) {
                    sat.angle += sat.speed;
                    const cos = Math.cos(sat.angle);
                    const sin = Math.sin(sat.angle);

                    // Rotated ellipse coords
                    const x = cx + (cos * sat.rx * Math.cos(sat.tilt) - sin * sat.ry * Math.sin(sat.tilt));
                    const y = cy + (cos * sat.rx * Math.sin(sat.tilt) + sin * sat.ry * Math.cos(sat.tilt));

                    // Orbit line
                    ctx.strokeStyle = 'rgba(201, 169, 110, 0.12)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.ellipse(cx, cy, sat.rx, sat.ry, sat.tilt, 0, Math.PI * 2);
                    ctx.stroke();

                    // Satellite Glowing Orb
                    const grad = ctx.createRadialGradient(x, y, 0, x, y, sat.size * 3);
                    grad.addColorStop(0, '#ffffff');
                    grad.addColorStop(0.5, primaryColor);
                    grad.addColorStop(1, 'transparent');

                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.arc(x, y, sat.size * 2.5, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            animId = requestAnimationFrame(loop);
        }

        animId = requestAnimationFrame(loop);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', handleResize);
        };
    }, [effectType, primaryColor, effect.particleDensity]);

    if (effectType === 'none') return null;

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 pointer-events-none z-10 w-full h-full"
        />
    );
}
window.ParticleEngine = ParticleEngine;
