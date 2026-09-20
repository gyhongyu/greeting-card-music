/**
 * BackdropShader.js - Ported high-end shaders and 3D effects from Project Indo-Phoenix
 * Supports:
 * 1. 'silk-smoke' (Template A: Raw WebGL dark silk with golden ambient smoke drift)
 * 2. 'particle-orbit' (Template B: Three.js fibonacci particle sphere with gold orbital ring)
 * 3. 'hologram' (Template C: Cyan & violet digital point cloud)
 */

window.BackdropShader = (function () {
    let currentCleanup = null;

    function stop() {
        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
    }

    function init(canvasId, mode) {
        stop();
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        if (mode === 'silk-smoke') {
            currentCleanup = initSilkSmoke(canvas);
        } else if (mode === 'particle-orbit') {
            currentCleanup = initParticleOrbit(canvas);
        } else if (mode === 'hologram') {
            currentCleanup = initHologram(canvas);
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    /* ---------------- 1. OBSIDIAN SILK & GOLD SMOKE (Raw WebGL) ---------------- */
    function initSilkSmoke(canvas) {
        let gl = canvas.getContext("webgl", { antialias: false, alpha: true });
        if (!gl) return () => {};

        let animId = null;
        const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
        const FRAG = [
            "precision highp float;",
            "uniform vec2 u_res;uniform float u_time;",
            "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}",
            "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);",
            " return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}",
            "float fbm(vec2 p){float v=0.;float a=.5;",
            " for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(11.7,7.3);a*=.52;}return v;}",
            "void main(){",
            " vec2 uv=(gl_FragCoord.xy-.5*u_res)/u_res.y;",
            " float t=u_time*.06;",
            " vec2 q=vec2(fbm(uv*1.6+t),fbm(uv*1.6-t*.8+3.1));",
            " vec2 r=vec2(fbm(uv*1.6+q*1.9+vec2(1.7,9.2)+t*.6),fbm(uv*1.6+q*1.9+vec2(8.3,2.8)-t*.4));",
            " float v=fbm(uv*1.6+r*1.6);",
            " vec3 col=mix(vec3(.02,.02,.03),vec3(.09,.07,.05),clamp(v*v*1.6,0.,1.));",
            " col+=smoothstep(.45,.92,r.y)*vec3(.82,.68,.44)*.28*(.35+v);",
            " float vig=smoothstep(1.3,.35,length(uv));",
            " col*=vig*.95+.05;",
            " gl_FragColor=vec4(col,1.);",
            "}"
        ].join("\n");

        function compile(type, src) {
            const s = gl.createShader(type);
            gl.shaderSource(s, src); gl.compileShader(s);
            return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
        }

        const vs = compile(gl.VERTEX_SHADER, VERT);
        const fs = compile(gl.FRAGMENT_SHADER, FRAG);
        if (!vs || !fs) return () => {};

        const prog = gl.createProgram();
        gl.attachShader(prog, vs); gl.attachShader(prog, fs);
        gl.linkProgram(prog); gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

        const posLoc = gl.getAttribLocation(prog, "a");
        gl.enableVertexAttribArray(posLoc);
        gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

        const uRes = gl.getUniformLocation(prog, "u_res");
        const uTime = gl.getUniformLocation(prog, "u_time");

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        resize();
        window.addEventListener("resize", resize);

        const start = performance.now();
        function frame(now) {
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, (now - start) * 0.001);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animId = requestAnimationFrame(frame);
        }
        animId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
        };
    }

    /* ---------------- 2. MISSION CONTROL PARTICLE PLANET (Three.js) ---------------- */
    function initParticleOrbit(canvas) {
        if (!window.THREE) return () => {};
        const THREE = window.THREE;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x050a14, 1);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 4.8;

        // Particle Planet Sphere
        const count = 1800;
        const pos = new Float32Array(count * 3);
        const phi = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < count; i++) {
            const y = 1 - (i / (count - 1)) * 2;
            const r = Math.sqrt(1 - y * y);
            const th = phi * i;
            pos[i * 3] = Math.cos(th) * r * 1.5;
            pos[i * 3 + 1] = y * 1.5;
            pos[i * 3 + 2] = Math.sin(th) * r * 1.5;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ color: 0x4fd1c5, size: 0.025, transparent: true, opacity: 0.85 });
        const sphere = new THREE.Points(geo, mat);
        scene.add(sphere);

        // Orbital Ring
        const ringCount = 900;
        const ringPos = new Float32Array(ringCount * 3);
        for (let i = 0; i < ringCount; i++) {
            const angle = (i / ringCount) * Math.PI * 2;
            const radius = 2.4 + (Math.random() - 0.5) * 0.25;
            ringPos[i * 3] = Math.cos(angle) * radius;
            ringPos[i * 3 + 1] = (Math.random() - 0.5) * 0.15;
            ringPos[i * 3 + 2] = Math.sin(angle) * radius;
        }
        const ringGeo = new THREE.BufferGeometry();
        ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));
        const ringMat = new THREE.PointsMaterial({ color: 0xc9a96e, size: 0.032, transparent: true, opacity: 0.9 });
        const ring = new THREE.Points(ringGeo, ringMat);
        ring.rotation.x = Math.PI * 0.35;
        ring.rotation.y = Math.PI * 0.12;
        scene.add(ring);

        function resize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        resize();
        window.addEventListener("resize", resize);

        let animId = null;
        function animate() {
            sphere.rotation.y += 0.0018;
            sphere.rotation.x += 0.0008;
            ring.rotation.z += 0.0022;
            renderer.render(scene, camera);
            animId = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            renderer.dispose();
        };
    }

    /* ---------------- 3. HOLOGRAM MATRIX (Three.js Point Cloud) ---------------- */
    function initHologram(canvas) {
        if (!window.THREE) return () => {};
        const THREE = window.THREE;

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x06070b, 1);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.z = 4.5;

        const gridCount = 2500;
        const pos = new Float32Array(gridCount * 3);
        const colors = new Float32Array(gridCount * 3);
        const c1 = new THREE.Color(0x35e0ff);
        const c2 = new THREE.Color(0x8b7bff);

        for (let i = 0; i < gridCount; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 6;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 6;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
            const mix = Math.random();
            const col = c1.clone().lerp(c2, mix);
            colors[i * 3] = col.r;
            colors[i * 3 + 1] = col.g;
            colors[i * 3 + 2] = col.b;
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.PointsMaterial({ size: 0.035, vertexColors: true, transparent: true, opacity: 0.85 });
        const cloud = new THREE.Points(geo, mat);
        scene.add(cloud);

        function resize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
        resize();
        window.addEventListener("resize", resize);

        let animId = null;
        function animate() {
            cloud.rotation.y += 0.0015;
            cloud.rotation.x += 0.0006;
            renderer.render(scene, camera);
            animId = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            renderer.dispose();
        };
    }

    return { init, stop };
})();
