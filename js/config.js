/**
 * 🛠️ CardForge 全域前端設定檔 (config.js)
 */
window.CardForgeConfig = {
    // 萬能 GAS Web App 網關端點 (全域受管 CardForge_DB 持久化網關)
    GAS_API_URL: "https://script.google.com/macros/s/AKfycbygCbbP4RjhzgtHrkfM6LN59JC8G3Plc58P8xgj15t5dctZn-s9TRaZUDxlye2S-o92/exec",
    
    // 可選分發網域清單 (支援使用者在發布彈窗中一鍵自由切換)
    SHARE_DOMAINS: [
        { label: "🍵 Teaforia 精品品牌 (card.teaforia.in)", value: "https://card.teaforia.in" },
        { label: "🏢 Foxlink 企業商務 (card.foxlink.co.in)", value: "https://card.foxlink.co.in" }
    ],
    
    // 預設分享網域
    SHARE_BASE_URL: "https://card.teaforia.in",
    FALLBACK_SHARE_URL: (window.location.protocol === 'file:' || !window.location.origin || window.location.origin === 'null')
        ? "https://card.teaforia.in/play.html"
        : (window.location.origin + window.location.pathname.replace("workspace.html", "play.html")),
    
    // 預設後備媒體 (全局社群分享預覽圖 CDN 直連)
    DEFAULT_AUDIO: "assets/audio/In Love With You.mp3",
    DEFAULT_COVER: "https://i.ibb.co/YFsSdsjg/share-cover-webp.webp",
    
    // 本地快取金鑰前綴
    STORAGE_PREFIX: "cardforge_cache_"
};
