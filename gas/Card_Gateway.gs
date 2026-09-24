/**
 * 💌 CardForge 萬能雲端持久化網關 (Card_Gateway.gs)
 * 支援卡片 (Cards) ＋ 模板 (Templates) 全自動雙軌雲端 SSOT 同步與批量增量差異同步 (Batch Diff-Sync)
 * 
 * 部署指引：
 * 1. 在 Google Drive 新建一個 Google Sheet，命名為「CardForge_DB」
 * 2. 點擊「擴充功能」->「Apps Script」
 * 3. 將本腳本內容貼入 Code.gs
 * 4. 點擊「部署」->「新建部署」-> 選擇「網頁應用程式 (Web App)」
 *    - 執行身分：我 (Me)
 *    - 誰可以存取：任何人 (Anyone)
 * 5. 複製生成的 Web App URL，填入前端 js/config.js 的 GAS_API_URL
 */

const SHEET_CARDS = "Cards_Store";
const SHEET_TEMPLATES = "Templates_Store";
const DB_NAME = "CardForge_DB";

function getSpreadsheetDB() {
  // 1. 若為容器腳本 (Container-bound)，直接取得關聯之試算表
  try {
    const activeSS = SpreadsheetApp.getActiveSpreadsheet();
    if (activeSS) return activeSS;
  } catch (e) {}

  // 2. 若為獨立腳本 (Standalone)，使用腳本屬性記憶或在 Google Drive 自動建立
  const scriptProps = PropertiesService.getScriptProperties();
  let ssId = scriptProps.getProperty("CARD_DB_SPREADSHEET_ID");

  if (ssId) {
    try {
      return SpreadsheetApp.openById(ssId);
    } catch (e) {
      console.warn("Cached spreadsheet ID invalid or deleted, will recreate: " + e.message);
    }
  }

  // 3. 在 Google Drive 自動建立全新的試算表並儲存 ID
  const newSS = SpreadsheetApp.create(DB_NAME);
  ssId = newSS.getId();
  scriptProps.setProperty("CARD_DB_SPREADSHEET_ID", ssId);
  return newSS;
}

function ensureSheets(ss) {
  let cardsSheet = ss.getSheetByName(SHEET_CARDS);
  if (!cardsSheet) {
    cardsSheet = ss.insertSheet(SHEET_CARDS);
    cardsSheet.appendRow([
      "id", 
      "title", 
      "sender", 
      "recipient", 
      "description", 
      "imageUrl", 
      "musicUrl", 
      "templateId", 
      "configJson", 
      "updatedAt"
    ]);
    cardsSheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    cardsSheet.setFrozenRows(1);
  }

  let tplsSheet = ss.getSheetByName(SHEET_TEMPLATES);
  if (!tplsSheet) {
    tplsSheet = ss.insertSheet(SHEET_TEMPLATES);
    tplsSheet.appendRow([
      "id",
      "name",
      "category",
      "description",
      "layout",
      "bgShader",
      "configJson",
      "updatedAt"
    ]);
    tplsSheet.getRange(1, 1, 1, 8).setFontWeight("bold").setBackground("#312e81").setFontColor("#ffffff");
    tplsSheet.setFrozenRows(1);
  }

  return { cardsSheet, tplsSheet };
}

function doGet(e) {
  return handleRequest(e, "GET");
}

function doPost(e) {
  return handleRequest(e, "POST");
}

function handleRequest(e, method) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  try {
    let params = {};
    if (method === "GET") {
      params = (e && e.parameter) ? e.parameter : {};
    } else if (method === "POST") {
      if (e && e.postData && e.postData.contents) {
        try {
          params = JSON.parse(e.postData.contents);
        } catch (err) {
          params = e.parameter || {};
        }
      } else {
        params = (e && e.parameter) ? e.parameter : {};
      }
    }

    const action = params.action || "list_cards";
    const ss = getSpreadsheetDB();
    const { cardsSheet, tplsSheet } = ensureSheets(ss);

    let responseData = {};

    // -------------------------------------------------------------
    // 1. 卡片操作 (Cards)
    // -------------------------------------------------------------
    if (action === "save_card") {
      const card = params.card;
      if (!card) return createJsonResponse({ success: false, error: "Missing card payload" }, headers);
      responseData = internalSaveCard(cardsSheet, card);

    } else if (action === "get_card") {
      const cardId = params.id;
      if (!cardId) return createJsonResponse({ success: false, error: "Missing card id parameter" }, headers);

      const found = internalGetCard(cardsSheet, cardId);
      if (found) {
        responseData = { success: true, card: found };
      } else {
        responseData = { success: false, error: "Card not found: " + cardId };
      }

    } else if (action === "list_cards") {
      const list = internalListCards(cardsSheet);
      responseData = { success: true, cards: list };

    // -------------------------------------------------------------
    // 2. 模板操作 (Templates)
    // -------------------------------------------------------------
    } else if (action === "save_template") {
      const template = params.template;
      if (!template) return createJsonResponse({ success: false, error: "Missing template payload" }, headers);
      responseData = internalSaveTemplate(tplsSheet, template);

    } else if (action === "get_template") {
      const tplId = params.id;
      if (!tplId) return createJsonResponse({ success: false, error: "Missing template id parameter" }, headers);

      const found = internalGetTemplate(tplsSheet, tplId);
      if (found) {
        responseData = { success: true, template: found };
      } else {
        responseData = { success: false, error: "Template not found: " + tplId };
      }

    } else if (action === "list_templates") {
      const list = internalListTemplates(tplsSheet);
      responseData = { success: true, templates: list };

    // -------------------------------------------------------------
    // 3. 後台批次增量差異同步 (Batch Diff-Sync)
    // -------------------------------------------------------------
    } else if (action === "batch_sync") {
      const cardsToSync = Array.isArray(params.cards) ? params.cards : [];
      const tplsToSync = Array.isArray(params.templates) ? params.templates : [];

      const syncedCardResults = [];
      const syncedTplResults = [];

      for (let i = 0; i < cardsToSync.length; i++) {
        const res = internalSaveCard(cardsSheet, cardsToSync[i]);
        if (res.success) syncedCardResults.push(res);
      }

      for (let j = 0; j < tplsToSync.length; j++) {
        const res = internalSaveTemplate(tplsSheet, tplsToSync[j]);
        if (res.success) syncedTplResults.push(res);
      }

      responseData = {
        success: true,
        message: "Batch sync completed",
        syncedCardsCount: syncedCardResults.length,
        syncedTemplatesCount: syncedTplResults.length,
        syncedCards: syncedCardResults,
        syncedTemplates: syncedTplResults
      };

    } else {
      responseData = { success: false, error: "Unknown action: " + action };
    }

    return createJsonResponse(responseData, headers);

  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() }, headers);
  }
}

// -----------------------------------------------------------------
// 內部原子工具函數
// -----------------------------------------------------------------

function internalSaveCard(sheet, card) {
  const cardId = card.id || ("c_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4));
  card.id = cardId;

  const title = card.title || card.name || "未命名賀卡";
  const sender = card.sender || "";
  const recipient = card.recipient || "";
  const description = (card.paragraphs && card.paragraphs.length > 0)
    ? card.paragraphs[0].substring(0, 150)
    : (card.description || "獻上一份溫暖的誠摯心意");
  const imageUrl = (card.media && card.media.photos && card.media.photos.length > 0)
    ? card.media.photos[0]
    : (card.imageUrl || "");
  const musicUrl = (card.media && card.media.customMusic) ? card.media.customMusic : (card.musicUrl || "");
  const templateId = card.templateId || "mothers-day";
  const updatedAt = new Date().toISOString();
  card.updatedAt = updatedAt.split("T")[0];

  const configJson = JSON.stringify(card);

  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == cardId) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowValues = [
    cardId,
    title,
    sender,
    recipient,
    description,
    imageUrl,
    musicUrl,
    templateId,
    configJson,
    updatedAt
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, 10).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return {
    success: true,
    id: cardId,
    card: card,
    message: "Card saved to Google Sheet SSOT",
    updatedAt: updatedAt
  };
}

function internalGetCard(sheet, cardId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == cardId) {
      try {
        return JSON.parse(data[i][8]); // configJson
      } catch (e) {
        return {
          id: data[i][0],
          title: data[i][1],
          sender: data[i][2],
          recipient: data[i][3],
          description: data[i][4],
          imageUrl: data[i][5],
          musicUrl: data[i][6],
          templateId: data[i][7]
        };
      }
    }
  }
  return null;
}

function internalListCards(sheet) {
  const data = sheet.getDataRange().getValues();
  const list = [];
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0]) {
      list.push({
        id: data[i][0],
        title: data[i][1],
        sender: data[i][2],
        recipient: data[i][3],
        description: data[i][4],
        imageUrl: data[i][5],
        templateId: data[i][7],
        updatedAt: data[i][9]
      });
      if (list.length >= 60) break;
    }
  }
  return list;
}

function internalSaveTemplate(sheet, tpl) {
  const tplId = tpl.id || ("tpl-" + Date.now());
  tpl.id = tplId;

  const name = tpl.name || "未命名模板";
  const category = tpl.category || "custom";
  const description = tpl.description || "";
  const layout = tpl.layout || "star-wars-crawl";
  const bgShader = tpl.bgShader || "silk-smoke";
  const updatedAt = new Date().toISOString();

  const configJson = JSON.stringify(tpl);

  const data = sheet.getDataRange().getValues();
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == tplId) {
      rowIndex = i + 1;
      break;
    }
  }

  const rowValues = [
    tplId,
    name,
    category,
    description,
    layout,
    bgShader,
    configJson,
    updatedAt
  ];

  if (rowIndex > 0) {
    sheet.getRange(rowIndex, 1, 1, 8).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return {
    success: true,
    id: tplId,
    template: tpl,
    message: "Template saved to Google Sheet SSOT",
    updatedAt: updatedAt
  };
}

function internalGetTemplate(sheet, tplId) {
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == tplId) {
      try {
        return JSON.parse(data[i][6]); // configJson
      } catch (e) {
        return {
          id: data[i][0],
          name: data[i][1],
          category: data[i][2],
          description: data[i][3],
          layout: data[i][4],
          bgShader: data[i][5]
        };
      }
    }
  }
  return null;
}

function internalListTemplates(sheet) {
  const data = sheet.getDataRange().getValues();
  const list = [];
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0]) {
      try {
        const fullTpl = JSON.parse(data[i][6]);
        list.push(fullTpl);
      } catch (e) {
        list.push({
          id: data[i][0],
          name: data[i][1],
          category: data[i][2],
          description: data[i][3],
          layout: data[i][4],
          bgShader: data[i][5],
          updatedAt: data[i][7]
        });
      }
      if (list.length >= 60) break;
    }
  }
  return list;
}

function createJsonResponse(data, headers) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
