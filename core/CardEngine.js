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

    function CardEngine({ card, template, isStarted = true }) {
        const [currentIndex, setCurrentIndex] = React.useState(0);

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

        // 視訊背景參數支援 (Video Background Layer)
        const bgVideo = (card && card.media && card.media.customVideo) || (template && template.bgVideo) || null;
        const videoFit = (template && template.videoFit) || 'square-feather';

        // 🎬 電影字幕支援 (Cinematic Subtitles)
        const subtitleSource = (card && card.media && card.media.subtitleUrl) 
            || (template && template.subtitleUrl) 
            || ((layout === 'cinematic-subtitles' || template?.id === 'video-square-sky') ? 'assets/subtitles/Miracle_Under_the_Sky.srt' : null);

        const [parsedSubtitles, setParsedSubtitles] = React.useState([]);
        const [currentSubtitle, setCurrentSubtitle] = React.useState(null);
        const videoElementRef = React.useRef(null);

        // SRT 純文字解析函式 (純 JS 零依賴，容錯各種換行與時序格式)
        const parseSRTText = React.useCallback((data) => {
            if (!data || typeof data !== 'string') return [];
            const parseTime = (tStr) => {
                if (!tStr) return 0;
                const clean = tStr.trim().replace(',', '.');
                const parts = clean.split(':');
                if (parts.length === 3) {
                    return parseFloat(parts[0]) * 3600 + parseFloat(parts[1]) * 60 + parseFloat(parts[2]);
                }
                return 0;
            };

            const blocks = data.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/\n\s*\n/);
            const list = [];
            blocks.forEach(block => {
                const lines = block.trim().split('\n');
                if (lines.length >= 2) {
                    const timeLine = lines[0].includes('-->') ? lines[0] : (lines[1].includes('-->') ? lines[1] : null);
                    if (timeLine) {
                        const [sStr, eStr] = timeLine.split('-->');
                        const start = parseTime(sStr);
                        const end = parseTime(eStr);
                        const textLines = lines.slice(lines.indexOf(timeLine) + 1);
                        if (textLines.length > 0) {
                            list.push({
                                start,
                                end,
                                primary: textLines[0] || '',
                                secondary: textLines[1] || ''
                            });
                        }
                    }
                }
            });
            return list;
        }, []);

        // 載入字幕來源 (支援本機檔案、網址直連或內聯文字)
        React.useEffect(() => {
            if (!subtitleSource) {
                setParsedSubtitles([]);
                return;
            }
            if (subtitleSource.includes('-->')) {
                setParsedSubtitles(parseSRTText(subtitleSource));
            } else {
                fetch(subtitleSource)
                    .then(r => r.ok ? r.text() : '')
                    .then(txt => {
                        if (txt) setParsedSubtitles(parseSRTText(txt));
                    })
                    .catch(e => console.warn('Failed to load SRT:', e));
            }
        }, [subtitleSource, parseSRTText]);

        // 時間同步監聽 (Time Sync Listener)
        React.useEffect(() => {
            if (layout !== 'cinematic-subtitles' || parsedSubtitles.length === 0) return;

            const updateSubByTime = (sec) => {
                const cur = parsedSubtitles.find(s => sec >= s.start && sec <= s.end);
                setCurrentSubtitle(cur || null);
            };

            const videoEl = videoElementRef.current;
            if (videoEl) {
                const onTime = () => updateSubByTime(videoEl.currentTime);
                videoEl.addEventListener('timeupdate', onTime);
                return () => videoEl.removeEventListener('timeupdate', onTime);
            } else {
                // 若無影片則跟隨全局 audio 標籤或定時推展
                const audioEl = document.querySelector('audio');
                if (audioEl) {
                    const onTime = () => updateSubByTime(audioEl.currentTime);
                    audioEl.addEventListener('timeupdate', onTime);
                    return () => audioEl.removeEventListener('timeupdate', onTime);
                }
            }
        }, [layout, parsedSubtitles]);

        // 文字排版與字級微調 (Typography & Size Scaling)
        const fontFamily = theme.fontFamily || "'DFKai-SB', 'BiauKai', 'Kaiti SC', 'STKaiti', 'Noto Serif TC', serif";
        const fontSizeScale = Number(theme.fontSizeScale !== undefined ? theme.fontSizeScale : 1.0);
        const titleSize = Number(theme.titleSize !== undefined ? theme.titleSize : 36);

        // 星戰 3D 仰角與左右寬度自由拉桿 (User Customizable Angle & Width)
        const crawlAngle = Number(template && template.crawlAngle !== undefined ? template.crawlAngle : 24);
        const crawlWidthScale = Number(template && template.crawlWidthScale !== undefined ? template.crawlWidthScale : 180);



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

        // 視訊音量計算 (預設 80%，若為 0 則靜音)
        const videoVolumeRaw = (card && card.media && card.media.videoVolume !== undefined)
            ? Number(card.media.videoVolume)
            : ((template && template.videoVolume !== undefined) ? Number(template.videoVolume) : 80);
        const videoVolumeNormalized = Math.max(0, Math.min(100, videoVolumeRaw)) / 100;
        const isVideoMuted = videoVolumeRaw === 0;

        // 🎬 視訊與開門狀態 (isStarted) 嚴格同步：未開門前絕不偷跑，開門後平滑起跑
        React.useEffect(() => {
            const videoEl = videoElementRef.current;
            if (!videoEl) return;

            videoEl.volume = videoVolumeNormalized;
            videoEl.muted = isVideoMuted;

            if (isStarted) {
                // 點擊開門後立即從頭/播放
                const p = videoEl.play();
                if (p && typeof p.catch === 'function') {
                    p.catch(err => {
                        console.log('[CardEngine] Video autoplay hindered, waiting for user gesture:', err);
                    });
                }
            } else {
                // 開門前強制暫停在開頭第 0 秒靜態幀
                videoEl.pause();
                try {
                    videoEl.currentTime = 0;
                } catch (e) {}
            }
        }, [isStarted, videoVolumeNormalized, isVideoMuted]);

        // 2.5 VIDEO BACKGROUND LAYER (1:1 視訊播放 ✕ 邊緣羽化融化特效)
        if (bgVideo) {
            rootChildren.push(h('div', {
                key: 'video-bg-container',
                className: 'video-square-container z-0'
            }, [
                h('video', {
                    key: 'video-element',
                    ref: videoElementRef,
                    src: encodeURI(bgVideo),
                    autoPlay: false, // 🛡️ 嚴禁無條件自動播放，由 isStarted 嚴格守衛
                    loop: true,
                    muted: isVideoMuted,
                    playsInline: true,
                    preload: 'auto',
                    className: 'video-square-element',
                    style: {
                        filter: `brightness(${bgBrightness}) saturate(1.08)`
                    }
                })
            ]));
        }

        // Vignette
        rootChildren.push(h('div', {
            key: 'vignette',
            className: 'absolute inset-0 pointer-events-none z-10',
            style: {
                background: 'radial-gradient(circle at center, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.45) 100%)'
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
        if (isStarted && !isPoster) {
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

        // 5. DYNAMIC LAYOUT SWITCHER (文字排版層受 isStarted 嚴格約束，點擊播放前嚴禁掛載與倒數動畫)
        const isScrollLayout = isStarted && (layout === 'star-wars-crawl' || layout === 'cinematic-credits');
        if (isScrollLayout) {
            // 先定義好 isStarWars 與 animClass，供後續 crawlChildren 判斷排版
            const isStarWars = layout === 'star-wars-crawl';
            const animClass = isStarWars ? 'anim-star-wars-crawl' : 'anim-cinematic-credits';

            const crawlChildren = [];

            // Recipient
            if (card && card.recipient) {
                crawlChildren.push(h('div', {
                    key: 'recipient',
                    className: `font-semibold tracking-wider clean-text-shadow ${isStarWars ? 'text-left' : ''}`,
                    style: {
                        color: theme.primaryColor || '#fbcfe8',
                        fontSize: `calc(1.5rem * ${fontSizeScale})`
                    }
                }, card.recipient));
            }

            // Paragraphs (星戰正統：兩端對齊 text-align: justify，字級直連 fontSizeScale)
            if (card && card.paragraphs) {
                const paragraphsElements = card.paragraphs.map((p, idx) => h('p', {
                    key: idx,
                    className: 'whitespace-pre-line leading-relaxed font-light tracking-wide clean-text-shadow text-white/95',
                    style: {
                        ...(isStarWars ? { textAlign: 'justify', textJustify: 'inter-character' } : {}),
                        fontSize: `calc(1.2rem * ${fontSizeScale})`,
                        lineHeight: 1.8
                    }
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

            // 星戰透視深度與視角自適應
            const container3DStyle = isStarWars ? {
                perspective: 'clamp(480px, 45vw, 750px)',
                perspectiveOrigin: '50% 85%'
            } : {};

            // 星戰板面寬度自適應：flexShrink 0 徹底釋放拉桿自由度，手機直屏維持自訂比例，PC 寬螢幕強制上限 880px
            const boardStyle = isStarWars ? {
                width: `${crawlWidthScale}%`,
                maxWidth: '880px',
                flexShrink: 0,
                fontFamily: fontFamily,
                '--crawl-duration': `${crawlDurationSec}s`,
                '--crawl-angle': `${crawlAngle}deg`
            } : {
                width: '100%',
                maxWidth: '46rem',
                fontFamily: fontFamily,
                '--crawl-duration': `${crawlDurationSec}s`
            };

            const boardClasses = isStarWars 
                ? `mx-auto px-4 text-white ${animClass}`
                : `w-full max-w-2xl px-6 md:px-8 text-center text-white ${animClass}`;

            rootChildren.push(h('div', {
                key: `scroll-container-${layout}`,
                className: 'absolute inset-x-0 top-24 bottom-6 z-20 flex justify-center items-start overflow-hidden crawl-mask-container',
                style: container3DStyle
            }, h('div', {
                className: boardClasses,
                style: boardStyle
            }, h('div', {
                className: isStarWars ? 'w-full py-8 px-4 space-y-7' : 'w-full py-8 px-4 space-y-8'
            }, crawlChildren))));
        } else if (isStarted && isPoster) {
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
                    className: `${fxClass} pt-4 pb-2 text-right poster-sender-box`,
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

            // 滿版海報容器 (加入 replayKey 物理版本號，重播 100% 瞬間重新掛載)
            // 遵循 9:16 / 16:9 純淨預覽原則：中間畫框固定比例展示，不產生任何垂直卷軸，內容自適應居中
            rootChildren.push(h('div', {
                key: `poster-container-${textRevealFx}-${replayKey}`,
                className: 'absolute inset-0 z-20 overflow-hidden scrollbar-none flex flex-col items-center justify-center px-6 sm:px-10 py-6 pointer-events-auto',
                style: {
                    '--reveal-duration': `${durationSec}s`
                }
            }, h('div', {
                className: 'w-full max-w-xl mx-auto space-y-4 text-center poster-content-stage',
                style: { fontFamily: fontFamily }
            }, posterChildren)));
        } else if (isStarted && layout === 'cinematic-subtitles') {
            // 🎬 電影字幕 · 原聲同步 (Cinematic Subtitles Layout)
            const subBoxChildren = [];

            if (currentSubtitle) {
                if (currentSubtitle.primary) {
                    subBoxChildren.push(h('div', {
                        key: 'sub-primary',
                        className: 'cinematic-subtitle-primary',
                        style: {
                            fontFamily: fontFamily,
                            fontSize: `calc(1.25rem * ${fontSizeScale})`
                        }
                    }, currentSubtitle.primary));
                }
                if (currentSubtitle.secondary) {
                    subBoxChildren.push(h('div', {
                        key: 'sub-secondary',
                        className: 'cinematic-subtitle-secondary',
                        style: {
                            color: theme.primaryColor || '#38bdf8',
                            fontSize: `calc(1.05rem * ${fontSizeScale})`
                        }
                    }, currentSubtitle.secondary));
                }
            } else {
                // 無字幕區間展示靜態收件人/問候
                if (card && card.recipient) {
                    subBoxChildren.push(h('div', {
                        key: 'sub-idle',
                        className: 'text-xs sm:text-sm font-light tracking-widest text-zinc-400/80 uppercase'
                    }, card.recipient));
                }
            }

            rootChildren.push(h('div', {
                key: 'cinematic-subtitles-stage',
                className: 'cinematic-subtitles-stage'
            }, [
                h('div', {
                    key: currentSubtitle ? `sub-${currentSubtitle.start}` : 'sub-empty',
                    className: `cinematic-subtitle-box ${currentSubtitle ? 'anim-subtitle-enter' : 'opacity-40'}`
                }, subBoxChildren)
            ]));
        }


        return h('div', {
            className: 'absolute inset-0 w-full h-full overflow-hidden select-none',
            style: { backgroundColor: theme.bgColor || '#09090b' }
        }, rootChildren);
    }

    window.CardEngine = CardEngine;

})(typeof window !== 'undefined' ? window : this);
