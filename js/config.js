/**
 * 🛠️ CardForge 全域前端設定檔 (config.js)
 */
window.CardForgeConfig = {
    // 萬能 GAS Web App 網關端點 (預設使用現成可用端點，使用者可隨時替換)
    GAS_API_URL: "https://script.google.com/macros/s/AKfycbxcSYXocdTxhvYRq0A5eXsJqYvOI0xImay63Au9FSmolEwlbJ0My5Gr0aWUcvVpx8AiIA/exec",
    
    // 可選分發網域清單 (支援使用者在發布彈窗中一鍵自由切換)
    SHARE_DOMAINS: [
        { label: "🍵 Teaforia 精品品牌 (card.teaforia.in)", value: "https://card.teaforia.in" },
        { label: "🏢 Foxlink 企業商務 (card.foxlink.co.in)", value: "https://card.foxlink.co.in" }
    ],
    
    // 預設分享網域
    SHARE_BASE_URL: "https://card.teaforia.in",
    FALLBACK_SHARE_URL: window.location.origin + window.location.pathname.replace("workspace.html", "index.html"),
    
    // 預設後備媒體 (全局社群分享預覽圖 CDN 直連)
    DEFAULT_AUDIO: "assets/audio/In Love With You.mp3",
    DEFAULT_COVER: "https://i.ibb.co/YFsSdsjg/share-cover-webp.webp",
    
    // 本地快取金鑰前綴
    STORAGE_PREFIX: "cardforge_cache_"
};
