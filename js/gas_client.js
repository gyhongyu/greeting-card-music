/**
 * ☁️ CardForge 雲端資料客戶端 (gas_client.js)
 * 提供 Google Sheet SSOT 儲存、讀取與 SWR 本地快取秒開機制
 */

window.GasClient = (function() {
    const config = window.CardForgeConfig || {
        GAS_API_URL: "https://script.google.com/macros/s/AKfycbxcSYXocdTxhvYRq0A5eXsJqYvOI0xImay63Au9FSmolEwlbJ0My5Gr0aWUcvVpx8AiIA/exec",
        STORAGE_PREFIX: "cardforge_cache_"
    };

    /**
     * 儲存卡片至 Google Sheet 雲端 SSOT
     * @param {Object} card 卡片物件
     * @returns {Promise<{success: boolean, id: string, shareUrl: string, error?: string}>}
     */
    async function saveCard(card) {
        if (!card) {
            return { success: false, error: "卡片資料不可為空" };
        }

        // 若無 ID 則自動生成
        if (!card.id) {
            card.id = "c_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 4);
        }

        const payload = {
            action: "save_card",
            card: card
        };

        try {
            // 先寫入本地 localStorage 作為樂觀更新 (Optimistic UI)
            try {
                localStorage.setItem(config.STORAGE_PREFIX + card.id, JSON.stringify(card));
            } catch (e) {
                console.warn("localStorage quota exceeded", e);
            }

            // 發送至 GAS 網關
            const res = await fetch(config.GAS_API_URL, {
                method: "POST",
                mode: "cors",
                headers: {
                    "Content-Type": "text/plain;charset=utf-8"
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error(`HTTP Error: ${res.status}`);
            }

            const data = await res.json();
            if (data.success) {
                const finalId = data.id || card.id;
                const baseShare = config.SHARE_BASE_URL || config.FALLBACK_SHARE_URL;
                const shareUrl = `${baseShare}?id=${encodeURIComponent(finalId)}`;
                return {
                    success: true,
                    id: finalId,
                    shareUrl: shareUrl,
                    message: "儲存成功！已生成雲端短連結"
                };
            } else {
                throw new Error(data.error || "GAS 網關返回失敗");
            }

        } catch (err) {
            console.error("[GasClient.saveCard] Error:", err);
            // 雲端失敗時降級方案：依然提供本地生成的 ID 與 Hash 分享網址
            const baseShare = config.FALLBACK_SHARE_URL || window.location.origin;
            return {
                success: false,
                id: card.id,
                error: err.message,
                fallbackShareUrl: `${baseShare}?id=${encodeURIComponent(card.id)}`,
                isLocalFallback: true
            };
        }
    }

    /**
     * 讀取卡片 (SWR 漸進快取模式)
     * @param {string} cardId 卡片 ID
     * @param {function} onBackgroundUpdate 若背景更新成功時的回調
     * @returns {Promise<Object|null>}
     */
    async function getCard(cardId, onBackgroundUpdate) {
        if (!cardId) return null;

        // 1. SWR 第一步：嘗試從本地 localStorage 取得快取 (0ms 秒開)
        let cachedCard = null;
        try {
            const raw = localStorage.getItem(config.STORAGE_PREFIX + cardId);
            if (raw) {
                cachedCard = JSON.parse(raw);
            }
        } catch (e) {
            console.warn("Failed to read cache", e);
        }

        // 2. SWR 第二步：向 GAS 發起非同步查詢以取得最新版本
        const fetchPromise = (async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000); // 4秒超時

                const res = await fetch(`${config.GAS_API_URL}?action=get_card&id=${encodeURIComponent(cardId)}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.card) {
                        try {
                            localStorage.setItem(config.STORAGE_PREFIX + cardId, JSON.stringify(data.card));
                        } catch (e) {}

                        // 若提供了背景更新回調，且資料有變更則觸發
                        if (typeof onBackgroundUpdate === "function") {
                            onBackgroundUpdate(data.card);
                        }
                        return data.card;
                    }
                }
            } catch (err) {
                console.warn("[GasClient.getCard] Cloud fetch error / timeout:", err.message);
            }
            return null;
        })();

        // 若本地已有快取，直接回傳本地快取，背景繼續更新
        if (cachedCard) {
            return cachedCard;
        }

        // 若本地無快取，等待雲端結果
        const cloudCard = await fetchPromise;
        return cloudCard;
    }

    /**
     * 獲取公開雲端卡片清單
     * @returns {Promise<Array>}
     */
    async function listCards() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3500);

            const res = await fetch(`${config.GAS_API_URL}?action=list_cards`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.cards)) {
                    return data.cards;
                }
            }
        } catch (err) {
            console.warn("[GasClient.listCards] Fallback to local cards", err.message);
        }
        return [];
    }

    return {
        saveCard,
        getCard,
        listCards
    };
})();
