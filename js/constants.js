/**
 * constants.js - CardForge 全域常數與預設配置
 * 純 JavaScript，保證在 file:/// 協議下零 CORS 阻擋原生秒載入
 */

window.DEFAULT_CARDS = [
    {
        id: 'card-mothers-day',
        templateId: 'mothers-day',
        name: '母親節溫情卡 (示範卡片)',
        category: 'personal',
        updatedAt: '2026-05-10',
        title: "Happy Mother's Day",
        recipient: 'Dear My Love,',
        paragraphs: [
            'On this special day, I just want to say thank you.',
            'Thank you for staying by my side all these years, for taking care of me with so much love and patience.',
            'Wishing you peace, love, and all the happiness you deserve.'
        ],
        sender: 'With all my love,\nChen Hung Yu',
        shareCaption: '{name}，送你一份特別定製的母親節溫情祝福卡，願你平安喜樂、心想事成：',
        coverImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
        media: { bgMode: 'slideshow', photos: [] }
    }
];

window.DEFAULT_TEMPLATES = [
    {
        id: 'video-square-sky',
        name: '1:1視頻播放模板 · 天穹奇蹟',
        category: 'personal',
        description: '1:1 正方形動態視訊光影 ✕ 邊緣羽化融化特效 ✕ 升騰星塵粒子。支援自訂視訊背景與照片層疊加。',
        layout: 'cinematic-subtitles',
        bgShader: 'none',
        bgVideo: 'assets/videos/Miracle_Under_the_Sky.mp4',
        subtitleUrl: 'assets/subtitles/Miracle_Under_the_Sky.srt',
        videoFit: 'square-feather',
        videoVolume: 80,
        crawlSpeed: 42,
        bgDimmer: 0.88,
        bgBlur: 0,
        theme: {
            primaryColor: '#38bdf8',
            accentColor: '#818cf8',
            bgColor: '#030712',
            textColor: '#f8fafc',
            titleColor: '#38bdf8',
            fontFamily: "'Noto Serif TC', 'Cormorant Garamond', serif",
            styleClass: 'theme-video-sky'
        },
        effects: {
            particleType: 'rising-stardust',
            particleDensity: 25
        },
        defaultMusic: 'assets/audio/In Love With You.mp3'
    },
    {
        id: 'mothers-day',
        name: '典雅溫情 · 櫻花信箋',
        category: 'personal',
        description: '3D Canvas 真實落櫻花瓣輕盈飄落翻轉、溫暖生活照輪播。純情浪漫、親情摯愛首選。',
        layout: 'cinematic-credits',
        bgShader: 'none',
        crawlSpeed: 44,
        bgDimmer: 0.95,
        bgBlur: 0,
        theme: {
            primaryColor: '#f472b6',
            accentColor: '#fb7185',
            bgColor: '#14050b',
            textColor: '#ffffff',
            titleColor: '#ffffff',
            fontFamily: "'Cormorant Garamond', 'Noto Serif TC', serif",
            styleClass: 'theme-mothers-day'
        },
        effects: {
            particleType: 'sakura-canvas',
            particleDensity: 30
        },
        defaultMusic: 'assets/audio/In Love With You.mp3'
    },
    {
        id: 'obsidian-silk',
        name: '黑金尊爵 · 絲綢流光 (Indo-Phoenix A)',
        category: 'business',
        description: 'WebGL 原生暗黑金流光絲綢 Shader ✕ 金光升騰星塵 (Rising Stardust)。高管、主權基金與旗艦夥伴尊榮之選。',
        layout: 'cinematic-poster',
        textRevealFx: 'domino-3d',
        revealSpeed: 0.8,
        bgShader: 'silk-smoke',
        crawlSpeed: 48,
        bgDimmer: 0.92,
        bgBlur: 0,
        theme: {
            primaryColor: '#c9a96e',
            accentColor: '#e6ca92',
            bgColor: '#09090b',
            textColor: '#ecebe6',
            titleColor: '#c9a96e',
            fontFamily: "'Cormorant Garamond', serif",
            styleClass: 'theme-obsidian-gold'
        },
        effects: {
            particleType: 'rising-stardust',
            particleDensity: 35
        },
        defaultMusic: 'assets/audio/In Love With You.mp3'
    },
    {
        id: 'mission-control',
        name: '星際軌道 · 衛星巡航 (Indo-Phoenix B)',
        category: 'business',
        description: 'Three.js 3D 粒子星球 ✕ 橢圓軌道衛星光跡巡航 (Orbital Satellites)。SpaceX x Anduril 硬核深空科技風。',
        layout: 'cinematic-poster',
        textRevealFx: 'fire-shimmer',
        revealSpeed: 1.0,
        bgShader: 'particle-orbit',
        crawlSpeed: 40,
        bgDimmer: 0.9,
        bgBlur: 0,
        theme: {
            primaryColor: '#4fd1c5',
            accentColor: '#c9a96e',
            bgColor: '#050a14',
            textColor: '#e2e8f0',
            titleColor: '#4fd1c5',
            fontFamily: "'Jost', sans-serif",
            styleClass: 'theme-mission-control'
        },
        effects: {
            particleType: 'orbital-satellites',
            particleDensity: 25
        },
        defaultMusic: 'assets/audio/In Love With You.mp3'
    },
    {
        id: 'hologram-cyber',
        name: '黑洞引力 · 全息星雲 (Indo-Phoenix C)',
        category: 'business',
        description: 'Three.js 賽博點雲 ✕ 黑洞奇異點渦流吸聚 (Blackhole Vortex)。象徵強大凝聚力與未來前瞻視野。',
        layout: 'star-wars-crawl',
        bgShader: 'hologram',
        crawlSpeed: 38,
        bgDimmer: 0.9,
        bgBlur: 0,
        theme: {
            primaryColor: '#35e0ff',
            accentColor: '#8b7bff',
            bgColor: '#06070b',
            textColor: '#f8fafc',
            titleColor: '#35e0ff',
            fontFamily: "'Jost', sans-serif",
            styleClass: 'theme-hologram'
        },
        effects: {
            particleType: 'blackhole-vortex',
            particleDensity: 30
        },
        defaultMusic: 'assets/audio/In Love With You.mp3'
    },
    {
        id: 'festive-red',
        name: '盛典金紅 · 璀璨流星雨',
        category: 'festive',
        description: '絳紅天鵝絨背景 ✕ 劃破夜空的長尾璀璨流星雨 (Meteor Shower)。祈願新程宏圖大展、吉祥如意。',
        layout: 'star-wars-crawl',
        bgShader: 'none',
        crawlSpeed: 42,
        bgDimmer: 0.95,
        bgBlur: 0,
        theme: {
            primaryColor: '#fbbf24',
            accentColor: '#ef4444',
            bgColor: '#150204',
            textColor: '#ffffff',
            titleColor: '#ffffff',
            fontFamily: "'Noto Serif TC', serif",
            styleClass: 'theme-festive-red'
        },
        effects: {
            particleType: 'meteor-shower',
            particleDensity: 25
        },
        defaultMusic: 'assets/audio/In Love With You.mp3'
    },
    {
        id: 'mid-autumn-moon',
        name: '月夕清輝 · 金桂玉兔',
        category: 'festive',
        description: '3D 超級明月月暈 ✕ 祥雲繾綣流動 Shader ✕ 漫天飄落旋轉金桂花瓣。中秋團聚、千里嬋娟極致詩意之選。',
        layout: 'star-wars-crawl',
        bgShader: 'lunar-clouds',
        crawlSpeed: 40,
        bgDimmer: 0.88,
        bgBlur: 0,
        theme: {
            primaryColor: '#f59e0b',
            accentColor: '#fef08a',
            bgColor: '#030611',
            textColor: '#f8fafc',
            titleColor: '#fbbf24',
            fontFamily: "'Noto Serif TC', 'Cormorant Garamond', serif",
            styleClass: 'theme-mid-autumn'
        },
        effects: {
            particleType: 'osmanthus-petals',
            particleDensity: 38
        },
        defaultMusic: 'assets/audio/In Love With You.mp3'
    },
    {
        id: 'mid-autumn-lantern',
        name: '天燈映月 · 福滿金餅',
        category: 'festive',
        description: '3D 精雕自轉金箔月餅 ✕ 萬家燈火祈願天燈海緩緩升空。萬家團圓、闔府安康尊榮之選。',
        layout: 'cinematic-credits',
        bgShader: 'golden-mooncake',
        crawlSpeed: 38,
        bgDimmer: 0.9,
        bgBlur: 0,
        theme: {
            primaryColor: '#fbbf24',
            accentColor: '#f97316',
            bgColor: '#080512',
            textColor: '#ffffff',
            titleColor: '#fde047',
            fontFamily: "'Noto Serif TC', 'DFKai-SB', serif",
            styleClass: 'theme-festive-gold'
        },
        effects: {
            particleType: 'sky-lanterns',
            particleDensity: 30
        },
        defaultMusic: 'assets/audio/In Love With You.mp3'
    }
];

window.TEMPLATE_DUMMY_CARD = {
    id: 'dummy-template-preview',
    title: 'Sample Typography Title',
    recipient: '致 預覽示範對象 (Recipient)：',
    paragraphs: [
        '這是一段用於測試模板字型、字級大小、字距行高與漫遊速度的示範文字段落。',
        '在此處可以目測背景 3D Shader、前景粒子特效與深淺遮罩在動態滾動時的穿透視覺質感。',
        '確認排版與光影協調後，保存模板即可供卡片製作頁面一鍵套用。'
    ],
    sender: '模板示範署名 (Signature)\nCardForge Studio',
    media: { bgMode: 'slideshow', photos: [] },
    cta: []
};

window.SHADER_OPTIONS = [
    { value: 'none', label: 'none (純淨相片/黑底深色漸層)' },
    { value: 'lunar-clouds', label: '🌕 lunar-clouds (3D 超級明月 ✕ 祥雲月暈 Shader)' },
    { value: 'golden-mooncake', label: '🥮 golden-mooncake (3D 浮空自轉金箔月餅)' },
    { value: 'silk-smoke', label: 'silk-smoke (典雅金煙與流體絲綢)' },
    { value: 'particle-orbit', label: 'particle-orbit (斐波那契星環粒子球)' },
    { value: 'hologram', label: 'hologram (青紫全息點雲星雲)' }
];

window.PARTICLE_OPTIONS = [
    { value: 'none', label: 'none (純淨無粒子)' },
    { value: 'falling-mooncakes', label: '🥮 falling-mooncakes (金餅福降 · 天上掉月餅飄落)' },
    { value: 'osmanthus-petals', label: '🌸 osmanthus-petals (金桂飛花 · 四瓣落桂翻轉)' },
    { value: 'sky-lanterns', label: '🏮 sky-lanterns (祈願天燈海 · 燭火搖曳升空)' },
    { value: 'sakura-canvas', label: 'sakura-canvas (3D 飄落翻轉櫻花)' },
    { value: 'rising-stardust', label: 'rising-stardust (金光升騰星塵)' },
    { value: 'orbital-satellites', label: 'orbital-satellites (軌道衛星光跡)' },
    { value: 'blackhole-vortex', label: 'blackhole-vortex (黑洞渦流引力)' },
    { value: 'meteor-shower', label: 'meteor-shower (掠過流星雨)' }
];

window.LAYOUT_OPTIONS = [
    { value: 'star-wars-crawl', label: '🌌 星際大戰 · 滅點升空 (Star Wars 3D 透視深空飄遠縮小)' },
    { value: 'cinematic-credits', label: '🎬 電影卷軸 · 典雅信箋 (Cinematic Credits 平直等速滾動)' },
    { value: 'cinematic-poster', label: '🖼️ 滿版海報 · 動態登場 (Cinematic Poster 全景海報動態特效)' },
    { value: 'cinematic-subtitles', label: '🎤 電影字幕 · 原聲同步 (Cinematic Subtitles 依時間浮現淡出)' }
];

window.TEXT_REVEAL_OPTIONS = [
    { value: 'domino-3d', label: '🀄 3D 骨牌階梯立體翻轉 (Domino Flip)' },
    { value: 'fire-shimmer', label: '🔥 烈火金光流光拂過 (Fire Shimmer)' },
    { value: 'stagger-fade', label: '📜 逐行深情浮現 (Stagger Fade-up)' },
    { value: 'glow-focus', label: '💫 星光凝聚聚焦 (Starlight Focus)' }
];

window.FONT_FAMILY_OPTIONS = [
    {
        id: 'kaisho-tai',
        label: '📜 典雅標楷 (台標楷體 / 手機楷體 / 莊重書法)',
        value: "'DFKai-SB', 'BiauKai', 'Kaiti SC', 'STKaiti', 'Noto Serif TC', serif"
    },
    {
        id: 'serif-classic',
        label: '⚜️ 人文宋體 (思源宋體 / Garamond / 深情信箋)',
        value: "'Cormorant Garamond', 'Noto Serif TC', 'Songti SC', 'SimSun', serif"
    },
    {
        id: 'sans-modern',
        label: '🚀 都會黑體 (思源黑體 / 蘋方 / 正黑體 / Jost)',
        value: "'Jost', 'PingFang TC', 'Microsoft JhengHei', 'Noto Sans TC', sans-serif"
    },
    {
        id: 'mono-tech',
        label: '💻 科技等寬 (JetBrains Mono / 極客未來的代碼風)',
        value: "'JetBrains Mono', Consolas, Monaco, monospace"
    }
];

window.MUSIC_OPTIONS = [
    {
        label: '🎵 浪漫純情 · In Love With You',
        value: 'assets/audio/In Love With You.mp3'
    },
    {
        label: '🍂 深情寄託 · 把思念寄給遠方',
        value: 'assets/audio/把思念寄給遠方.mp3'
    }
];


