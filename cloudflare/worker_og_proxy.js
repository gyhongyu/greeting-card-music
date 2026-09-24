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
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbygCbbP4RjhzgtHrkfM6LN59JC8G3Plc58P8xgj15t5dctZn-s9TRaZUDxlye2S-o92/exec";

// 社群爬蟲特徵正則 (嚴格比對 User-Agent)
const BOT_UA_REGEX = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|LineBot|Discordbot|TelegramBot|Slackbot|SkypeUriPreview|Google-Structured-Data-Testing-Tool|baiduspider|bingbot/i;

// 路徑式 URL 正則：匹配 /p/:cardId 或 /p/:cardId/:recipientName (同時相容 /c/ 前綴)
const CLEAN_PATH_REGEX = /^\/(?:p|c)\/([^\/]+?)(?:\/([^\/]+?))?\/?$/;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const userAgent = request.headers.get("user-agent") || "";
  const isSocialBot = BOT_UA_REGEX.test(userAgent);

  // ━━━ 1. 無狀態路徑解析 (/p/:cardId/:to 或 /c/:cardId/:to) ━━━
  const pathMatch = url.pathname.match(CLEAN_PATH_REGEX);
  if (pathMatch) {
    let cardId = decodeURIComponent(pathMatch[1]);
    let recipientName = pathMatch[2] ? decodeURIComponent(pathMatch[2]) : "";

    // 爬蟲造訪：直接動態產生 OG 預覽卡片
    if (isSocialBot) {
      return handleBotPreview(request, url, cardId, recipientName);
    }

    // 一般人類/微信瀏覽器：302 重定向至 play.html (帶參數)，保證微信內整條路徑高亮不截斷
    const targetUrl = new URL("/play.html", url.origin);
    targetUrl.searchParams.set("id", cardId);
    if (recipientName) {
      targetUrl.searchParams.set("to", recipientName);
    }
    return Response.redirect(targetUrl.toString(), 302);
  }

  // ━━━ 2. 傳統 QueryString (?id=...&to=...) ━━━
  const cardId = url.searchParams.get("id");
  const toName = url.searchParams.get("to") || url.searchParams.get("name") || "";
  if (isSocialBot && cardId) {
    return handleBotPreview(request, url, cardId, toName);
  }

  // 普通人類訪客造訪根路徑或其他檔案：透傳至 GitHub Pages
  return proxyToGitHubPages(request, url);
}

/**
 * 為社群爬蟲動態產生帶有 Open Graph 標籤的 HTML
 */
async function handleBotPreview(request, url, cardId, toName = "") {
  let title = "CardForge - 沉浸式音樂賀卡";
  let description = "為您獻上一份充滿星空、音樂與真摯祝福的專屬多媒體賀卡。";
  let imageUrl = "https://i.ibb.co/YFsSdsjg/share-cover-webp.webp";

  try {
    // 嘗試向 GAS 查詢卡片元數據 (Google Apps Script 重定向冷啟動通常需要 2~3.5 秒，放寬至 4.5 秒)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const gasRes = await fetch(`${GAS_API_URL}?action=get_card&id=${encodeURIComponent(cardId)}`, {
      signal: controller.signal,
      redirect: "follow"
    });
    clearTimeout(timeoutId);

    if (gasRes.ok) {
      const data = await gasRes.json();
      if (data.success && data.card) {
        const card = data.card;
        title = card.title || card.name || title;
        
        // 優先讀取自訂社群導語/寄語 (shareCaption)，其次第一段落，再其次 description
        if (card.shareCaption && card.shareCaption.trim()) {
          description = card.shareCaption.trim();
        } else if (card.paragraphs && card.paragraphs.length > 0 && card.paragraphs[0]) {
          description = card.paragraphs[0];
        } else if (card.description && card.description.trim()) {
          description = card.description.trim();
        }

        // 若描述中有 {name} 佔位符，且網址帶有 toName，自動智慧替換為好友姓名
        if (toName && description.includes('{name}')) {
          description = description.replace(/\{name\}/g, toName);
        } else if (!toName && description.includes('{name}')) {
          description = description.replace(/\{name\}[，,：:]?\s*/g, '');
        }

        // 優先使用自訂社群封面 coverImage，其次相片，無則保持全局預設
        if (card.coverImage) {
          imageUrl = card.coverImage;
        } else if (card.media && card.media.photos && card.media.photos.length > 0) {
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
 * 普通人類訪問：透傳轉發至 GitHub Pages (重寫 Host 標頭杜絕 GitHub Pages 404)
 */
async function proxyToGitHubPages(request, url) {
  const targetPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const targetUrl = new URL(`${GITHUB_PAGES_ORIGIN}${targetPath}${url.search}`);
  
  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.set("Host", "card.foxlink.co.in");

  const modifiedRequest = new Request(targetUrl, {
    method: request.method,
    headers: forwardHeaders,
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
