/**
 * 🌐 CardForge Cloudflare Worker 邊緣社交預覽代理 (worker_og_proxy.js)
 * 
 * 功能亮點：
 * 1. 爬蟲智慧探測：自動辨識 LINE, Facebook, WhatsApp, Twitter, Slack, Discord 等社群爬蟲。
 * 2. 動態 OG 注入：爬蟲訪問時，從 GAS 網關提取卡片專屬標題、祝福摘要與封面圖，生成 10ms 極速 HTML 預覽。
 * 3. 人類訪客直通：正常瀏覽器點擊時，無損透傳至 GitHub Pages 沉浸式播放器。
 * 
 * 部署方式：
 * 1. 登入 Cloudflare Dashboard -> Workers & Pages -> Create Application -> Worker
 * 2. 將本腳本內容貼入 Worker 編輯器
 * 3. 在 Settings -> Triggers -> Custom Domains 綁定自訂子網域 (如 card.foxlink.co.in)
 */

// 配置：您的 GitHub Pages 原始主機與 GAS 網關網址
const GITHUB_PAGES_ORIGIN = "https://gyhongyu.github.io/greeting-card-music";
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbxcSYXocdTxhvYRq0A5eXsJqYvOI0xImay63Au9FSmolEwlbJ0My5Gr0aWUcvVpx8AiIA/exec"; // 可替換為專屬網關

// 社群爬蟲特徵正則 (嚴格比對 User-Agent)
const BOT_UA_REGEX = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|LineBot|Discordbot|TelegramBot|Slackbot|SkypeUriPreview|Google-Structured-Data-Testing-Tool|baiduspider|bingbot/i;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get("user-agent") || "";
    const cardId = url.searchParams.get("id");

    // 判斷是否為社群爬蟲
    const isSocialBot = BOT_UA_REGEX.test(userAgent);

    // 若有帶 cardId 且為社群爬蟲，啟動「邊緣 OG 動態注入」
    if (isSocialBot && cardId) {
      return handleBotPreview(request, url, cardId);
    }

    // 若為普通人類訪客，直接反代透傳至 GitHub Pages 靜態播放器
    return proxyToGitHubPages(request, url);
  }
};

/**
 * 為社群爬蟲動態產生帶有 Open Graph 標籤的 HTML
 */
async function handleBotPreview(request, url, cardId) {
  let title = "CardForge - 沉浸式音樂賀卡";
  let description = "為您獻上一份充滿星空、音樂與真摯祝福的專屬多媒體賀卡。";
  let imageUrl = "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80";

  try {
    // 嘗試向 GAS 查詢卡片元數據 (設 2.5 秒超時避免爬蟲等太久)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const gasRes = await fetch(`${GAS_API_URL}?action=get_card&id=${encodeURIComponent(cardId)}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (gasRes.ok) {
      const data = await gasRes.json();
      if (data.success && data.card) {
        const card = data.card;
        title = card.title || card.name || title;
        if (card.paragraphs && card.paragraphs.length > 0) {
          description = card.paragraphs[0];
        } else if (card.description) {
          description = card.description;
        }
        if (card.media && card.media.photos && card.media.photos.length > 0) {
          imageUrl = card.media.photos[0];
        } else if (card.imageUrl) {
          imageUrl = card.imageUrl;
        }
      }
    }
  } catch (err) {
    // 若 GAS 查詢失敗或超時，使用優雅保底資訊，保證不報錯
  }

  const targetPlayUrl = `${url.origin}${url.pathname}${url.search}`;

  const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  
  <!-- Open Graph / Facebook / LINE / WhatsApp -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(targetPlayUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${escapeHtml(targetPlayUrl)}">
  <meta property="twitter:title" content="${escapeHtml(title)}">
  <meta property="twitter:description" content="${escapeHtml(description)}">
  <meta property="twitter:image" content="${escapeHtml(imageUrl)}">

  <!-- 爬蟲若有簡單 JS 跳轉也能直通 -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(targetPlayUrl)}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <a href="${escapeHtml(targetPlayUrl)}">點擊前往觀看賀卡</a>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=300"
    }
  });
}

/**
 * 普通人類訪問：透傳轉發至 GitHub Pages
 */
async function proxyToGitHubPages(request, url) {
  const targetPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const targetUrl = new URL(`${GITHUB_PAGES_ORIGIN}${targetPath}${url.search}`);
  
  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: request.headers,
    redirect: "follow"
  });

  return fetch(modifiedRequest);
}

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
