/**
 * 🛠️ CardForge 全域前端設定檔 (config.js)
 */
window.CardForgeConfig = {
    // 萬能 GAS Web App 網關端點 (預設使用現成可用端點，使用者可隨時替換)
    GAS_API_URL: "https://script.google.com/macros/s/AKfycbxcSYXocdTxhvYRq0A5eXsJqYvOI0xImay63Au9FSmolEwlbJ0My5Gr0aWUcvVpx8AiIA/exec",
    
    // 自訂分享短網域 (若已設定 Cloudflare Worker 則填自訂網址，否則使用 GitHub Pages)
    SHARE_BASE_URL: "https://card.foxlink.co.in",
    FALLBACK_SHARE_URL: window.location.origin + window.location.pathname.replace("workspace.html", "index.html"),
    
    // 預設後備媒體
    DEFAULT_AUDIO: "assets/audio/In Love With You.mp3",
    DEFAULT_COVER: "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80",
    
    // 本地快取金鑰前綴
    STORAGE_PREFIX: "cardforge_cache_"
};
