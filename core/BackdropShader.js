/**
 * BackdropShader.js - Ported high-end shaders and 3D effects from Project Indo-Phoenix
 * Supports:
 * 1. 'silk-smoke' (Template A: Raw WebGL dark silk with golden ambient smoke drift)
 * 2. 'particle-orbit' (Template B: Three.js fibonacci particle sphere with gold orbital ring)
 * 3. 'hologram' (Template C: Cyan & violet digital point cloud)
 */

window.BackdropShader = (function () {
    let currentCleanup = null;
    let cachedMooncakeTex = null; // 貼圖全域快取，避免拉桿重複下載被 dispose
    let activeInstance = null;    // 紀錄當前活躍實例，支援熱更新參數而不重建

    function stop() {
        if (currentCleanup) {
            currentCleanup();
            currentCleanup = null;
        }
        activeInstance = null;
    }

    function init(canvasId, mode, params = {}) {
        stop();
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const opacity = params.opacity !== undefined ? Number(params.opacity) : 0.85;
        const speed = params.speed !== undefined ? Number(params.speed) : 1.0;

        if (mode === 'silk-smoke') {
            currentCleanup = initSilkSmoke(canvas, opacity, speed);
        } else if (mode === 'particle-orbit') {
            currentCleanup = initParticleOrbit(canvas, opacity, speed);
        } else if (mode === 'hologram') {
            currentCleanup = initHologram(canvas, opacity, speed);
        } else if (mode === 'lunar-clouds') {
            currentCleanup = initLunarClouds(canvas, opacity, speed);
        } else if (mode === 'golden-mooncake') {
            currentCleanup = initGoldenMooncake(canvas, opacity, speed);
        } else {
            const ctx = canvas.getContext('2d');
            if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    function getContainerSize(canvas) {
        const parent = canvas.parentElement;
        const w = parent ? parent.clientWidth : window.innerWidth;
        const h = parent ? parent.clientHeight : window.innerHeight;
        return { width: Math.max(w, 300), height: Math.max(h, 400) };
    }

    /* ---------------- 1. OBSIDIAN SILK & GOLD SMOKE (Raw WebGL) ---------------- */
    function initSilkSmoke(canvas, opacity = 0.85, speed = 1.0) {
        let gl = canvas.getContext("webgl", { antialias: false, alpha: true });
        if (!gl) return () => {};

        let animId = null;
        const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
        const FRAG = [
            "precision highp float;",
            "uniform vec2 u_res;uniform float u_time;uniform float u_opacity;uniform float u_speed;",
            "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}",
            "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);",
            " return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}",
            "float fbm(vec2 p){float v=0.;float a=.5;",
            " for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(11.7,7.3);a*=.52;}return v;}",
            "void main(){",
            " vec2 uv=(gl_FragCoord.xy-.5*u_res)/u_res.y;",
            " float t=u_time*(.08*u_speed);",
            " vec2 q=vec2(fbm(uv*1.6+t),fbm(uv*1.6-t*.8+3.1));",
            " vec2 r=vec2(fbm(uv*1.6+q*1.9+vec2(1.7,9.2)+t*.6),fbm(uv*1.6+q*1.9+vec2(8.3,2.8)-t*.4));",
            " float v=fbm(uv*1.6+r*1.6);",
            " vec3 col=mix(vec3(.03,.03,.05),vec3(.14,.11,.08),clamp(v*v*1.8,0.,1.));",
            " col+=smoothstep(.35,.88,r.y)*vec3(1.0,.82,.48)*.55*(.45+v)*u_opacity;",
            " float vig=smoothstep(1.4,.25,length(uv));",
            " col*=vig*.9+.1;",
            " gl_FragColor=vec4(col, u_opacity);",
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
        const uOpacity = gl.getUniformLocation(prog, "u_opacity");
        const uSpeed = gl.getUniformLocation(prog, "u_speed");

        function resize() {
            const size = getContainerSize(canvas);
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = size.width * dpr;
            canvas.height = size.height * dpr;
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        resize();
        window.addEventListener("resize", resize);

        const start = performance.now();
        function frame(now) {
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, (now - start) * 0.001);
            gl.uniform1f(uOpacity, opacity);
            gl.uniform1f(uSpeed, speed);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            animId = requestAnimationFrame(frame);
        }
        animId = requestAnimationFrame(frame);

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            try {
                gl.getExtension('WEBGL_lose_context')?.loseContext();
            } catch (e) {}
        };
    }

    /* ---------------- 2. MISSION CONTROL PARTICLE PLANET (Three.js) ---------------- */
    function initParticleOrbit(canvas, opacity = 0.85, speed = 1.0) {
        if (!window.THREE) return () => {};
        const THREE = window.THREE;

        const size = getContainerSize(canvas);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x050a14, opacity);
        renderer.setSize(size.width, size.height, false);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, size.width / size.height, 0.1, 100);
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
        const mat = new THREE.PointsMaterial({ color: 0x4fd1c5, size: 0.03, transparent: true, opacity: Math.min(opacity * 1.05, 1.0) });
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
        const ringMat = new THREE.PointsMaterial({ color: 0xfacc15, size: 0.038, transparent: true, opacity: Math.min(opacity * 1.1, 1.0) });
        const ring = new THREE.Points(ringGeo, ringMat);
        ring.rotation.x = Math.PI * 0.35;
        ring.rotation.y = Math.PI * 0.12;
        scene.add(ring);

        function resize() {
            const s = getContainerSize(canvas);
            camera.aspect = s.width / s.height;
            camera.updateProjectionMatrix();
            renderer.setSize(s.width, s.height, false);
        }
        window.addEventListener("resize", resize);

        let animId = null;
        function animate() {
            sphere.rotation.y += 0.0018 * speed;
            sphere.rotation.x += 0.0008 * speed;
            ring.rotation.z += 0.0022 * speed;
            renderer.render(scene, camera);
            animId = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            try {
                renderer.dispose();
                geo.dispose();
                mat.dispose();
                ringGeo.dispose();
                ringMat.dispose();
                renderer.forceContextLoss();
            } catch (e) {}
        };
    }

    /* ---------------- 3. HOLOGRAM MATRIX (Three.js Point Cloud) ---------------- */
    function initHologram(canvas, opacity = 0.85, speed = 1.0) {
        if (!window.THREE) return () => {};
        const THREE = window.THREE;

        const size = getContainerSize(canvas);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x06070b, opacity);
        renderer.setSize(size.width, size.height, false);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(50, size.width / size.height, 0.1, 100);
        camera.position.z = 4.5;

        const gridCount = 2500;
        const pos = new Float32Array(gridCount * 3);
        const colors = new Float32Array(gridCount * 3);
        const c1 = new THREE.Color(0x38bdf8);
        const c2 = new THREE.Color(0xc084fc);

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
        const mat = new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: Math.min(opacity * 1.05, 1.0) });
        const cloud = new THREE.Points(geo, mat);
        scene.add(cloud);

        function resize() {
            const s = getContainerSize(canvas);
            camera.aspect = s.width / s.height;
            camera.updateProjectionMatrix();
            renderer.setSize(s.width, s.height, false);
        }
        window.addEventListener("resize", resize);

        let animId = null;
        function animate() {
            cloud.rotation.y += 0.0015 * speed;
            cloud.rotation.x += 0.0006 * speed;
            renderer.render(scene, camera);
            animId = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            try {
                renderer.dispose();
                geo.dispose();
                mat.dispose();
                renderer.forceContextLoss();
            } catch (e) {}
        };
    }

    /* ---------------- 4. LUNAR CLOUDS (Super Moon & Flowing Clouds Shader) ---------------- */
    function initLunarClouds(canvas, opacity = 0.85, speed = 1.0) {
        let gl = canvas.getContext("webgl", { antialias: false, alpha: true });
        if (!gl) return () => {};

        let animId = null;
        const VERT = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
        const FRAG = [
            "precision highp float;",
            "uniform vec2 u_res;uniform float u_time;uniform float u_opacity;uniform float u_speed;",
            "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}",
            "float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.-2.*f);",
            " return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}",
            "float fbm(vec2 p){float v=0.;float a=.5;",
            " for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+vec2(7.3,13.1);a*=.5;}return v;}",
            "void main(){",
            " vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);",
            " float t = u_time * 0.15 * u_speed;",
            " // Deep night sky background",
            " vec3 bg = mix(vec3(0.015, 0.02, 0.05), vec3(0.04, 0.05, 0.12), uv.y + 0.5);",
            " // Moon position (upper center-right)",
            " vec2 moonPos = vec2(0.0, 0.15);",
            " float d = length(uv - moonPos);",
            " float moonR = 0.28;",
            " // Moon surface with procedural craters",
            " float craters = fbm((uv - moonPos) * 12.0);",
            " vec3 moonCol = mix(vec3(0.96, 0.93, 0.82), vec3(0.78, 0.72, 0.62), craters * 0.55);",
            " float moonMask = smoothstep(moonR, moonR - 0.008, d);",
            " // Soft Lunar Halo & Corona glow",
            " float halo = exp(-d * 4.2) * 0.75 + exp(-d * 1.8) * 0.25;",
            " vec3 haloCol = vec3(1.0, 0.94, 0.76) * halo;",
            " // Flowing ethereal night clouds",
            " vec2 cloudUv = uv * vec2(1.2, 0.7) + vec2(t * 0.4, sin(t * 0.2) * 0.08);",
            " float clouds = fbm(cloudUv * 3.5 + fbm(cloudUv * 2.0));",
            " clouds = smoothstep(0.35, 0.85, clouds);",
            " vec3 cloudCol = mix(vec3(0.03, 0.04, 0.08), vec3(0.25, 0.22, 0.28), clouds);",
            " // Composite moon, halo and drifting clouds",
            " vec3 col = bg + haloCol;",
            " col = mix(col, moonCol, moonMask);",
            " col = mix(col, cloudCol, clouds * 0.55);",
            " gl_FragColor = vec4(col, u_opacity);",
            "}"
        ].join("\n");

        function compile(t, src) {
            const s = gl.createShader(t);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            return s;
        }

        const prog = gl.createProgram();
        gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
        gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
        gl.linkProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

        const aLoc = gl.getAttribLocation(prog, "a");
        const uRes = gl.getUniformLocation(prog, "u_res");
        const uTime = gl.getUniformLocation(prog, "u_time");
        const uOp = gl.getUniformLocation(prog, "u_opacity");
        const uSp = gl.getUniformLocation(prog, "u_speed");

        function resize() {
            const s = getContainerSize(canvas);
            canvas.width = s.width;
            canvas.height = s.height;
            gl.viewport(0, 0, s.width, s.height);
        }
        resize();
        window.addEventListener("resize", resize);

        const startT = performance.now();
        function frame() {
            gl.useProgram(prog);
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.enableVertexAttribArray(aLoc);
            gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
            gl.uniform2f(uRes, canvas.width, canvas.height);
            gl.uniform1f(uTime, (performance.now() - startT) * 0.001);
            gl.uniform1f(uOp, opacity);
            gl.uniform1f(uSp, speed);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            animId = requestAnimationFrame(frame);
        }
        frame();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            try {
                gl.deleteProgram(prog);
                gl.deleteBuffer(buf);
            } catch (e) {}
        };
    }

    /* ---------------- 5. 3D GOLDEN MOONCAKE (Photorealistic Masterpiece with Texture) ---------------- */
    function initGoldenMooncake(canvas, opacity = 0.85, speed = 1.0) {
        if (!window.THREE) return () => {};
        const THREE = window.THREE;

        const size = getContainerSize(canvas);
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
        renderer.setClearColor(0x060810, opacity);
        renderer.setSize(size.width, size.height, false);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, size.width / size.height, 0.1, 100);
        camera.position.set(0, 0, 4.0);

        // Lighting: Studio Gourmet Photography Setup
        const ambientLight = new THREE.AmbientLight(0xfff5ea, 0.85);
        scene.add(ambientLight);

        // Top-front warm keylight to catch the embossed floral carvings
        const keyLight = new THREE.DirectionalLight(0xffeedd, 1.6);
        keyLight.position.set(2, 3, 4);
        scene.add(keyLight);

        // Golden warm rim light from bottom left to enhance bakery glaze
        const rimLight = new THREE.PointLight(0xf59e0b, 1.8, 10);
        rimLight.position.set(-2.5, -2, 2.5);
        scene.add(rimLight);

        const fillLight = new THREE.DirectionalLight(0xd97706, 0.7);
        fillLight.position.set(-3, 1, 1);
        scene.add(fillLight);

        const cakeGroup = new THREE.Group();

        // 載入使用者提供的高清月餅貼圖 (全域單例持久快取，拉動拉桿時不重複請求且絕不銷毀)
        if (!cachedMooncakeTex) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.setCrossOrigin('anonymous');
            cachedMooncakeTex = textureLoader.load('https://i.ibb.co/cqhRZ1v/mooncake-png.png');
            cachedMooncakeTex.generateMipmaps = true;
            cachedMooncakeTex.minFilter = THREE.LinearMipmapLinearFilter;
        }

        // 1. 頂部真實雕花面板 (圓片配合真實月餅貼圖與高光質感)
        const topRadius = 1.05;
        const topGeo = new THREE.CircleGeometry(topRadius, 64);
        const topMat = new THREE.MeshStandardMaterial({
            map: cachedMooncakeTex,
            roughness: 0.35,
            metalness: 0.12,
            transparent: true,
            opacity: opacity,
            alphaTest: 0.05
        });
        const topMesh = new THREE.Mesh(topGeo, topMat);
        topMesh.position.z = 0.22;
        cakeGroup.add(topMesh);

        // 底部對稱面板
        const bottomGeo = new THREE.CircleGeometry(topRadius, 64);
        const bottomMat = new THREE.MeshStandardMaterial({
            map: cachedMooncakeTex,
            roughness: 0.45,
            metalness: 0.1,
            transparent: true,
            opacity: opacity
        });
        const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
        bottomMesh.rotation.y = Math.PI;
        bottomMesh.position.z = -0.22;
        cakeGroup.add(bottomMesh);

        // 2. 移除多餘生硬外邊框，純粹呈現真實月餅雕花本體

        // 4. 周圍環繞的細膩金箔微塵星光
        const sparkleCount = 40;
        const sparklePos = new Float32Array(sparkleCount * 3);
        for (let i = 0; i < sparkleCount; i++) {
            sparklePos[i * 3] = (Math.random() - 0.5) * 3.4;
            sparklePos[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
            sparklePos[i * 3 + 2] = (Math.random() - 0.5) * 2.5;
        }
        const sparkleGeo = new THREE.BufferGeometry();
        sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sparklePos, 3));
        const sparkleMat = new THREE.PointsMaterial({
            color: 0xfef08a,
            size: 0.035,
            transparent: true,
            opacity: 0.8
        });
        const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
        cakeGroup.add(sparkles);

        // 精緻擺盤角度：微仰角 25 度、微傾斜 12 度，優雅展示雕花細節
        cakeGroup.rotation.x = 0.42;
        cakeGroup.rotation.y = 0.18;
        cakeGroup.position.set(0, 0, 0);
        scene.add(cakeGroup);

        function resize() {
            const s = getContainerSize(canvas);
            camera.aspect = s.width / s.height;
            camera.updateProjectionMatrix();
            renderer.setSize(s.width, s.height, false);
        }
        window.addEventListener("resize", resize);

        let animId = null;
        let clock = new THREE.Clock();

        function animate() {
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();
            // 溫和緩慢自轉，呼吸輕懸浮
            cakeGroup.rotation.z += 0.22 * delta * speed;
            cakeGroup.position.y = Math.sin(elapsed * 1.5 * speed) * 0.06;
            sparkles.rotation.z -= 0.1 * delta;

            renderer.render(scene, camera);
            animId = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            try {
                renderer.dispose();
                topGeo.dispose();
                bottomGeo.dispose();
                sparkleGeo.dispose();
                topMat.dispose();
                sparkleMat.dispose();
            } catch (e) {}
        };
    }

    return { init, stop };
})();
