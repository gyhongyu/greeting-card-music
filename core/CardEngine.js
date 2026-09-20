/**
 * core/CardEngine.js - Multi-Layout & Multi-Shader Universal Cinematic Stage (Recipient Pure Edition)
 * 
 * 1. Cleaned up: Removed all internal template badges ({template.name}) - recipients only see the title!
 * 2. Pure Cinematic View: No debug hints, no watermarks, 100% exclusive bespoke greeting.
 * 3. 3D Procedural FX Layer: Meteors, Stardust, Satellites, Black Hole, Sakura.
 * 4. Pure JS / React.createElement: 零編譯 Zero-CORS 規範，保證 file:/// 下跨頁面/組件無損引用。
 */
(function (window) {
    'use strict';

    const h = React.createElement;

    function CardEngine({ card, template }) {
        const [currentIndex, setCurrentIndex] = React.useState(0);
        const [isPaused, setIsPaused] = React.useState(false);

        const photos = (card && card.media && card.media.photos && card.media.photos.length > 0)
            ? card.media.photos
            : [];

        const hasPhotos = photos.length > 0;
        const theme = (template && template.theme) || {};
        const effect = (template && template.effects) || {};
        const layout = (card && card.layout) || (template && template.layout) || 'star-wars-crawl';
        const bgShader = (template && template.bgShader) || 'none';
        const bgBrightness = (template && template.bgDimmer) || 0.95;
        const bgShaderOpacity = (template && template.bgShaderOpacity !== undefined) ? template.bgShaderOpacity : 0.85;
        const bgShaderSpeed = (template && template.bgShaderSpeed !== undefined) ? template.bgShaderSpeed : 1.0;
        const crawlDurationSec = (template && template.crawlSpeed) ? Number(template.crawlSpeed) : 44;

        // 文字排版與字級微調 (Typography & Size Scaling)
        const fontFamily = theme.fontFamily || "'DFKai-SB', 'BiauKai', 'Kaiti SC', 'STKaiti', 'Noto Serif TC', serif";
        const fontSizeScale = Number(theme.fontSizeScale !== undefined ? theme.fontSizeScale : 1.0);
        const titleSize = Number(theme.titleSize !== undefined ? theme.titleSize : 36);


        // Initialize 3D / WebGL Shaders (Silk Smoke / Particle Orbit / Hologram)
        React.useEffect(() => {
            if (window.BackdropShader && bgShader && bgShader !== 'none') {
                // 等候 React 完成新 Canvas 節點掛載
                const timer = setTimeout(() => {
                    window.BackdropShader.init(`bg-shader-canvas-${bgShader}`, bgShader, {
                        opacity: bgShaderOpacity,
                        speed: bgShaderSpeed
                    });
                }, 30);
                return () => {
                    clearTimeout(timer);
                    if (window.BackdropShader) window.BackdropShader.stop();
                };
            } else if (window.BackdropShader) {
                window.BackdropShader.stop();
            }
        }, [bgShader, bgShaderOpacity, bgShaderSpeed]);

        // Background Photos Crossfade
        React.useEffect(() => {
            if (photos.length <= 1) return;
            const interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % photos.length);
            }, 5000);
            return () => clearInterval(interval);
        }, [photos.length]);

        // Children of root div
        const rootChildren = [];

        // 1. 3D / SHADER CANVAS (INDO-PHOENIX CORE) - Dynamic Key 徹底隔離 WebGL Context
        if (bgShader && bgShader !== 'none') {
            rootChildren.push(h('canvas', {
                id: `bg-shader-canvas-${bgShader}`,
                key: `bg-shader-canvas-${bgShader}`,
                className: 'absolute inset-0 w-full h-full pointer-events-none z-0'
            }));
        }

        // 2. OPTIONAL PHOTO SLIDESHOW LAYER
        if (hasPhotos) {
            const photoElements = photos.map((url, idx) => {
                const isActive = idx === currentIndex;
                return h('div', {
                    key: url + idx,
                    className: `absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 ken-burns-bg' : 'opacity-0'}`,
                    style: {
                        backgroundImage: `url('${url}')`,
                        filter: `brightness(${bgBrightness}) saturate(1.05)`,
                        mixBlendMode: bgShader !== 'none' ? 'screen' : 'normal',
                        opacity: isActive ? (bgShader !== 'none' ? 0.65 : 1) : 0
                    }
                });
            });
            rootChildren.push(h('div', {
                key: 'photo-slideshow',
                className: 'absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden'
            }, photoElements));
        }

        // Vignette
        rootChildren.push(h('div', {
            key: 'vignette',
            className: 'absolute inset-0 pointer-events-none z-10',
            style: {
                background: 'radial-gradient(circle at center, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.35) 100%)'
            }
        }));

        // 3. 3D PROCEDURAL FX LAYER
        if (window.ParticleEngine) {
            rootChildren.push(h(window.ParticleEngine, {
                key: 'particle-fx',
                effect: {
                    particleType: effect.particleType || 'rising-stardust',
                    color: theme.primaryColor || '#c9a96e',
                    particleDensity: effect.particleDensity || 25,
                    particleOpacity: effect.particleOpacity !== undefined ? effect.particleOpacity : 0.8,
                    particleSpeed: effect.particleSpeed !== undefined ? effect.particleSpeed : 1.0
                }
            }));
        }

        const isPoster = layout === 'cinematic-poster' || layout === 'fixed-card' || layout === 'boxed-card';
        const textRevealFx = (template && template.textRevealFx) || 'domino-3d';
        const revealSpeed = (template && template.revealSpeed !== undefined) ? Number(template.revealSpeed) : 1.0;
        const replayKey = (template && template.replayKey) || 0;

        // 4. PURE ELEGANT TITLE (僅在星戰漫遊模式下由頂部全景懸掛)
        if (!isPoster) {
            rootChildren.push(h('header', {
                key: 'header-title',
                className: 'absolute top-0 left-0 right-0 z-30 pt-6 pb-4 text-center px-4 pointer-events-none bg-gradient-to-b from-black/75 via-black/20 to-transparent'
            }, h('h1', {
                className: 'font-light tracking-wide clean-title-glow text-white leading-tight',
                style: {
                    fontFamily: fontFamily,
                    fontSize: `${titleSize}px`,
                    '--title-color': theme.titleColor || '#ffffff',
                    '--title-glow': theme.primaryColor || '#c9a96e'
                }
            }, (card && card.title) || '')));
        }

        // 5. DYNAMIC LAYOUT SWITCHER
        const isScrollLayout = layout === 'star-wars-crawl' || layout === 'cinematic-credits';
        if (isScrollLayout) {
            const crawlChildren = [];

            // Recipient
            if (card && card.recipient) {
                crawlChildren.push(h('div', {
                    key: 'recipient',
                    className: 'font-semibold tracking-wider clean-text-shadow',
                    style: {
                        color: theme.primaryColor || '#fbcfe8',
                        fontSize: `calc(1.5rem * ${fontSizeScale})`
                    }
                }, card.recipient));
            }

            // Paragraphs
            if (card && card.paragraphs) {
                const paragraphsElements = card.paragraphs.map((p, idx) => h('p', {
                    key: idx,
                    className: 'whitespace-pre-line leading-relaxed font-light tracking-wide clean-text-shadow text-white/95'
                }, p));
                crawlChildren.push(h('div', {
                    key: 'paragraphs',
                    className: 'space-y-6',
                    style: {
                        fontSize: `calc(1.2rem * ${fontSizeScale})`
                    }
                }, paragraphsElements));
            }

            // Sender
            if (card && card.sender) {
                crawlChildren.push(h('div', {
                    key: 'sender',
                    className: 'pt-6 text-right'
                }, h('p', {
                    className: 'italic clean-text-shadow whitespace-pre-line font-medium',
                    style: {
                        color: theme.primaryColor || '#fbcfe8',
                        fontFamily: fontFamily,
                        fontSize: `calc(1.25rem * ${fontSizeScale})`
                    }
                }, card.sender)));
            }

            // CTAs
            if (card && card.cta && card.cta.length > 0) {
                const ctaButtons = card.cta.map((btn, idx) => h('a', {
                    key: idx,
                    href: btn.url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: 'inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase border border-white text-white bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all duration-300 hover:scale-105 shadow-lg',
                    style: { borderColor: theme.primaryColor }
                }, [
                    btn.icon ? h('i', { key: 'icon', className: `fa-solid ${btn.icon}` }) : null,
                    h('span', { key: 'label' }, btn.label)
                ]));
                crawlChildren.push(h('div', {
                    key: 'ctas',
                    className: 'pt-8 flex flex-wrap gap-4 justify-center pointer-events-auto'
                }, ctaButtons));
            }

            // 區分真正的 3D 星戰 vs 平直電影卷軸
            const isStarWars = layout === 'star-wars-crawl';
            const animClass = isStarWars ? 'anim-star-wars-crawl' : 'anim-cinematic-credits';
            
            // 星戰需要 3D 透視深度 (perspective: 500px) 創造大氣舒展的梯形前大後小仰角
            const container3DStyle = isStarWars ? {
                perspective: '500px',
                perspectiveOrigin: '50% 85%'
            } : {};

            rootChildren.push(h('div', {
                key: `scroll-container-${layout}`,
                className: 'absolute inset-x-0 top-24 bottom-6 z-20 flex justify-center items-start overflow-hidden cursor-pointer crawl-mask-container',
                style: container3DStyle,
                onClick: () => setIsPaused(!isPaused)
            }, h('div', {
                className: `w-full max-w-2xl px-6 md:px-8 text-center text-white ${animClass} ${isPaused ? 'is-paused' : ''}`,
                style: {
                    fontFamily: fontFamily,
                    '--crawl-duration': `${crawlDurationSec}s`
                }
            }, h('div', {
                className: 'w-full py-8 px-4 space-y-8'
            }, crawlChildren))));
        } else if (isPoster) {
            // 🖼️ 滿版動態海報賀卡 (Cinematic Full-bleed Poster) - 徹底打破生硬小方盒！
            const fxClass = `fx-${textRevealFx || 'domino-3d'}`;
            const durationSec = (1.2 / revealSpeed).toFixed(2);
            const baseDelay = (0.24 / revealSpeed);

            let step = 0;
            const nextDelay = (mult = 1.0) => {
                const d = (step * baseDelay * mult).toFixed(2);
                step++;
                return `${d}s`;
            };

            const posterChildren = [];

            // 1. 海報主視覺藝術大標題 (滿版大器、光暈輝光)
            if (card && card.title) {
                posterChildren.push(h('div', {
                    key: 'poster-title',
                    className: `${fxClass} text-center pt-8 pb-4`,
                    style: { 
                        animationDelay: nextDelay(0.8),
                        '--reveal-duration': `${durationSec}s`
                    }
                }, h('h1', {
                    className: 'font-light tracking-wide clean-title-glow text-white leading-tight',
                    style: {
                        fontFamily: fontFamily,
                        fontSize: `${titleSize}px`,
                        '--title-color': theme.titleColor || '#ffffff',
                        '--title-glow': theme.primaryColor || '#c9a96e'
                    }
                }, card.title)));
            }

            // 2. 滿版海報焦點相片 (若有上傳相片)
            if (hasPhotos) {
                posterChildren.push(h('div', {
                    key: 'poster-photo',
                    className: `${fxClass} relative aspect-[16/9] w-full rounded-2xl overflow-hidden shadow-2xl border border-white/20 my-2`,
                    style: { 
                        animationDelay: nextDelay(),
                        '--reveal-duration': `${durationSec}s`
                    }
                }, [
                    h('img', {
                        key: 'img',
                        src: photos[currentIndex],
                        alt: 'Slide',
                        className: 'w-full h-full object-cover transition-transform duration-700 hover:scale-105'
                    }),
                    h('div', {
                        key: 'badge',
                        className: 'absolute bottom-2.5 right-2.5 px-3 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-white/90 font-mono'
                    }, `${currentIndex + 1} / ${photos.length}`)
                ]));
            }

            // 3. 致對象 Recipient (金色高雅襯線)
            if (card && card.recipient) {
                posterChildren.push(h('h2', {
                    key: 'poster-recipient',
                    className: `${fxClass} font-semibold tracking-wider pt-3 pb-1`,
                    style: {
                        color: theme.primaryColor || '#c9a96e',
                        fontSize: `calc(1.35rem * ${fontSizeScale})`,
                        animationDelay: nextDelay(),
                        '--reveal-duration': `${durationSec}s`
                    }
                }, card.recipient));
            }

            // 4. 海報深情內文 (逐行排版舒適、行距大器)
            if (card && card.paragraphs) {
                const paragraphElements = card.paragraphs.map((p, idx) => h('p', {
                    key: idx,
                    className: `${fxClass} whitespace-pre-line leading-relaxed text-zinc-100/90 font-light`,
                    style: { 
                        fontSize: `calc(1.05rem * ${fontSizeScale})`,
                        animationDelay: nextDelay(),
                        '--reveal-duration': `${durationSec}s`
                    }
                }, p));
                posterChildren.push(h('div', {
                    key: 'poster-paragraphs',
                    className: 'space-y-4 py-2'
                }, paragraphElements));
            }

            // 5. 典雅手寫署名 Sender
            if (card && card.sender) {
                posterChildren.push(h('div', {
                    key: 'poster-sender',
                    className: `${fxClass} pt-4 pb-2 text-right`,
                    style: { 
                        animationDelay: nextDelay(),
                        '--reveal-duration': `${durationSec}s`
                    }
                }, h('p', {
                    className: 'italic whitespace-pre-line font-medium',
                    style: {
                        color: theme.primaryColor || '#c9a96e',
                        fontFamily: fontFamily,
                        fontSize: `calc(1.15rem * ${fontSizeScale})`
                    }
                }, card.sender)));
            }

            // 6. 互動 CTA 行動按鈕
            if (card && card.cta && card.cta.length > 0) {
                const ctaButtons = card.cta.map((btn, idx) => h('a', {
                    key: idx,
                    href: btn.url,
                    target: '_blank',
                    rel: 'noopener noreferrer',
                    className: `${fxClass} inline-flex items-center gap-2 px-7 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase border border-white/40 text-white bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all shadow-xl hover:scale-105 pointer-events-auto`,
                    style: {
                        borderColor: theme.primaryColor,
                        animationDelay: nextDelay(),
                        '--reveal-duration': `${durationSec}s`
                    }
                }, [
                    btn.icon ? h('i', { key: 'icon', className: `fa-solid ${btn.icon}` }) : null,
                    h('span', { key: 'label' }, btn.label)
                ]));
                posterChildren.push(h('div', {
                    key: 'poster-ctas',
                    className: 'pt-6 pb-10 flex flex-wrap gap-3 justify-center'
                }, ctaButtons));
            }

            // 滿版海報滾動容器 (加入 replayKey 物理版本號，重播 100% 瞬間重新掛載)
            rootChildren.push(h('div', {
                key: `poster-container-${textRevealFx}-${replayKey}`,
                className: 'absolute inset-0 z-20 overflow-y-auto custom-scrollbar flex flex-col items-center px-6 sm:px-10 py-8 pointer-events-auto',
                style: {
                    '--reveal-duration': `${durationSec}s`
                }
            }, h('div', {
                className: 'w-full max-w-xl mx-auto space-y-4 text-center sm:text-left',
                style: { fontFamily: fontFamily }
            }, posterChildren)));
        }


        return h('div', {
            className: 'absolute inset-0 w-full h-full overflow-hidden select-none',
            style: { backgroundColor: theme.bgColor || '#09090b' }
        }, rootChildren);
    }

    window.CardEngine = CardEngine;

})(typeof window !== 'undefined' ? window : this);
