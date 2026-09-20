/**
 * CardEngine.js - Multi-Layout & Multi-Shader Universal Cinematic Stage (Recipient Pure Edition)
 * 
 * 1. Cleaned up: Removed all internal template badges ({template.name}) - recipients only see the title!
 * 2. Pure Cinematic View: No debug hints, no watermarks, 100% exclusive bespoke greeting.
 * 3. 3D Procedural FX Layer: Meteors, Stardust, Satellites, Black Hole, Sakura.
 */
function CardEngine({ card, template }) {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [isPaused, setIsPaused] = React.useState(false);

    const photos = (card.media && card.media.photos && card.media.photos.length > 0)
        ? card.media.photos
        : [];

    const hasPhotos = photos.length > 0;
    const theme = template.theme || {};
    const effect = template.effects || {};
    const layout = card.layout || template.layout || 'star-wars-crawl';
    const bgShader = template.bgShader || 'none';
    const bgBrightness = template.bgDimmer || 0.95;
    const crawlSpeed = `${template.crawlSpeed || 44}s`;

    // Initialize 3D / WebGL Shaders (Silk Smoke / Particle Orbit / Hologram)
    React.useEffect(() => {
        if (window.BackdropShader) {
            window.BackdropShader.init("bg-shader-canvas", bgShader);
        }
        return () => {
            if (window.BackdropShader) window.BackdropShader.stop();
        };
    }, [bgShader]);

    // Background Photos Crossfade
    React.useEffect(() => {
        if (photos.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % photos.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [photos.length]);

    return (
        <div 
            className="absolute inset-0 w-full h-full overflow-hidden select-none"
            style={{ backgroundColor: theme.bgColor || '#09090b' }}
        >
            {/* ================= 1. 3D / SHADER CANVAS (INDO-PHOENIX CORE) ================= */}
            <canvas 
                id="bg-shader-canvas" 
                className="absolute inset-0 w-full h-full pointer-events-none z-0" 
            />

            {/* ================= 2. OPTIONAL PHOTO SLIDESHOW LAYER ================= */}
            {hasPhotos && (
                <div className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden">
                    {photos.map((url, idx) => {
                        const isActive = idx === currentIndex;
                        return (
                            <div
                                key={url + idx}
                                className={`absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 ken-burns-bg' : 'opacity-0'}`}
                                style={{
                                    backgroundImage: `url('${url}')`,
                                    filter: `brightness(${bgBrightness}) saturate(1.05)`,
                                    mixBlendMode: bgShader !== 'none' ? 'screen' : 'normal',
                                    opacity: isActive ? (bgShader !== 'none' ? 0.65 : 1) : 0
                                }}
                            />
                        );
                    })}
                </div>
            )}

            {/* Subtle Vignette for Contrast */}
            <div 
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: 'radial-gradient(circle at center, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.35) 100%)'
                }}
            />

            {/* ================= 3. 3D PROCEDURAL FX LAYER ================= */}
            <ParticleEngine effect={{
                particleType: effect.particleType || 'rising-stardust',
                color: theme.primaryColor || '#c9a96e',
                particleDensity: effect.particleDensity || 25
            }} />

            {/* ================= 4. PURE ELEGANT TITLE (NO INTERNAL TEMPLATE BADGES!) ================= */}
            <header className="absolute top-0 left-0 right-0 z-30 pt-6 pb-4 text-center px-4 pointer-events-none bg-gradient-to-b from-black/75 via-black/20 to-transparent">
                <h1 
                    className="text-3xl md:text-5xl font-light tracking-wide clean-title-glow text-white"
                    style={{ 
                        fontFamily: theme.fontFamily || 'serif',
                        '--title-color': theme.titleColor || '#ffffff',
                        '--title-glow': theme.primaryColor || '#c9a96e'
                    }}
                >
                    {card.title}
                </h1>
            </header>

            {/* ================= 5. DYNAMIC LAYOUT SWITCHER ================= */}
            {/* LAYOUT OPTION A: STAR WARS CRAWL */}
            {layout === 'star-wars-crawl' && (
                <div 
                    className="absolute inset-x-0 top-24 bottom-6 z-20 flex justify-center items-start overflow-hidden cursor-pointer crawl-mask-container"
                    onClick={() => setIsPaused(!isPaused)}
                >
                    <div 
                        className={`w-full max-w-2xl px-6 md:px-8 text-center text-white anim-star-wars-crawl ${isPaused ? 'is-paused' : ''}`}
                        style={{ 
                            fontFamily: theme.fontFamily || 'serif',
                            '--crawl-duration': crawlSpeed
                        }}
                    >
                        <div className="w-full py-8 px-4 space-y-8">
                            {/* Recipient */}
                            {card.recipient && (
                                <div 
                                    className="text-2xl md:text-3xl font-semibold tracking-wider clean-text-shadow"
                                    style={{ color: theme.primaryColor || '#fbcfe8' }}
                                >
                                    {card.recipient}
                                </div>
                            )}

                            {/* Paragraphs */}
                            <div className="space-y-6 text-lg md:text-2xl leading-relaxed font-light tracking-wide clean-text-shadow text-white/95">
                                {card.paragraphs.map((p, idx) => (
                                    <p key={idx} className="whitespace-pre-line">
                                        {p}
                                    </p>
                                ))}
                            </div>

                            {/* Sender */}
                            {card.sender && (
                                <div className="pt-6 text-right">
                                    <p 
                                        className="text-xl md:text-2xl italic font-serif clean-text-shadow whitespace-pre-line font-medium"
                                        style={{ color: theme.primaryColor || '#fbcfe8' }}
                                    >
                                        {card.sender}
                                    </p>
                                </div>
                            )}

                            {/* CTAs */}
                            {card.cta && card.cta.length > 0 && (
                                <div className="pt-8 flex flex-wrap gap-4 justify-center pointer-events-auto">
                                    {card.cta.map((btn, idx) => (
                                        <a
                                            key={idx}
                                            href={btn.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase border border-white text-white bg-black/40 hover:bg-black/70 backdrop-blur-md transition-all duration-300 hover:scale-105 shadow-lg"
                                            style={{ borderColor: theme.primaryColor }}
                                        >
                                            {btn.icon && <i className={`fa-solid ${btn.icon}`}></i>}
                                            <span>{btn.label}</span>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* LAYOUT OPTION B: BOXED CARD */}
            {layout === 'boxed-card' && (
                <div className="absolute inset-x-0 top-24 bottom-6 z-20 overflow-y-auto custom-scrollbar flex justify-center items-center p-4 md:p-6">
                    <div 
                        className="max-w-2xl w-full rounded-2xl p-6 md:p-8 backdrop-blur-xl border border-white/15 shadow-2xl space-y-6"
                        style={{ 
                            background: 'rgba(15, 17, 23, 0.85)',
                            fontFamily: theme.fontFamily || 'serif'
                        }}
                    >
                        {hasPhotos && (
                            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                                <img
                                    src={photos[currentIndex]}
                                    alt="Slide"
                                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                                />
                                <div className="absolute bottom-2 right-2 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-white/80">
                                    {currentIndex + 1} / {photos.length}
                                </div>
                            </div>
                        )}

                        {card.recipient && (
                            <h2 
                                className="text-xl md:text-2xl font-semibold tracking-wider border-b border-white/10 pb-3"
                                style={{ color: theme.primaryColor || '#c9a96e' }}
                            >
                                {card.recipient}
                            </h2>
                        )}

                        <div className="space-y-4 text-base md:text-lg leading-relaxed text-zinc-200 font-light">
                            {card.paragraphs.map((p, idx) => (
                                <p key={idx} className="whitespace-pre-line">
                                    {p}
                                </p>
                            ))}
                        </div>

                        {card.sender && (
                            <div className="pt-4 border-t border-white/10 text-right">
                                <p 
                                    className="text-lg md:text-xl italic font-serif whitespace-pre-line font-medium"
                                    style={{ color: theme.primaryColor || '#c9a96e' }}
                                >
                                    {card.sender}
                                </p>
                            </div>
                        )}

                        {card.cta && card.cta.length > 0 && (
                            <div className="pt-4 flex flex-wrap gap-3 justify-center">
                                {card.cta.map((btn, idx) => (
                                    <a
                                        key={idx}
                                        href={btn.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold tracking-wider uppercase border border-current text-white bg-white/10 hover:bg-white/25 transition-all shadow-md"
                                        style={{ color: theme.primaryColor }}
                                    >
                                        {btn.icon && <i className={`fa-solid ${btn.icon}`}></i>}
                                        <span>{btn.label}</span>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
window.CardEngine = CardEngine;
