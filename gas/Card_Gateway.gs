/**
 * 💌 CardForge 萬能雲端持久化網關 (Card_Gateway.gs)
 * 部署指引：
 * 1. 在 Google Drive 新建一個 Google Sheet，命名為「CardForge_DB」
 * 2. 點擊「擴充功能」->「Apps Script」
 * 3. 將本腳本內容貼入 Code.gs
 * 4. 點擊「部署」->「新建部署」-> 選擇「網頁應用程式 (Web App)」
 *    - 執行身分：我 (Me)
 *    - 誰可以存取：任何人 (Anyone)
 * 5. 複製生成的 Web App URL，填入前端 js/config.js 的 GAS_API_URL
 */

const SHEET_NAME = "Cards_Store";
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
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // 若工作表不存在則自動初始化
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
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
      sheet.getRange(1, 1, 1, 10).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
      sheet.setFrozenRows(1);
    }

    let responseData = {};

    if (action === "save_card") {
      const card = params.card;
      if (!card) {
        return createJsonResponse({ success: false, error: "Missing card payload" }, headers);
      }

      // 生成或繼承短 ID (例如 c_1786988344)
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
      const configJson = JSON.stringify(card);
      const updatedAt = new Date().toISOString();

      // 檢查是否已存在相同的 ID，存在則更新，不存在則追加
      const data = sheet.getDataRange().getValues();
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == cardId) {
          rowIndex = i + 1; // 1-indexed
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

      responseData = {
        success: true,
        id: cardId,
        message: "Card saved successfully to Google Sheet SSOT",
        updatedAt: updatedAt
      };

    } else if (action === "get_card") {
      const cardId = params.id;
      if (!cardId) {
        return createJsonResponse({ success: false, error: "Missing card id parameter" }, headers);
      }

      const data = sheet.getDataRange().getValues();
      let foundCard = null;
      for (let i = 1; i < data.length; i++) {
        if (data[i][0] == cardId) {
          try {
            foundCard = JSON.parse(data[i][8]); // configJson
          } catch (e) {
            foundCard = {
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
          break;
        }
      }

      if (foundCard) {
        responseData = { success: true, card: foundCard };
      } else {
        responseData = { success: false, error: "Card not found: " + cardId };
      }

    } else if (action === "list_cards") {
      const data = sheet.getDataRange().getValues();
      const list = [];
      // 倒序讀取最新 50 筆
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
          if (list.length >= 50) break;
        }
      }
      responseData = { success: true, cards: list };
    } else {
      responseData = { success: false, error: "Unknown action: " + action };
    }

    return createJsonResponse(responseData, headers);

  } catch (error) {
    return createJsonResponse({ success: false, error: error.toString() }, headers);
  }
}

function createJsonResponse(data, headers) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
