/**
 * ☁️ CardForge 雲端資料客戶端 (gas_client.js)
 * 提供 Google Sheet SSOT 儲存、讀取、SWR 本地快取秒開機制，
 * 以及卡片 ＋ 模板 雙軌差異增量批量同步 (Batch Diff-Sync) 與寫後校驗 (Read-After-Write Verification)
 */

window.GasClient = (function() {
    const config = new Proxy({}, {
        get(target, prop) {
            const current = window.CardForgeConfig || {};
            if (prop in current) return current[prop];
            const fallback = {
                GAS_API_URL: "https://script.google.com/macros/s/AKfycbygCbbP4RjhzgtHrkfM6LN59JC8G3Plc58P8xgj15t5dctZn-s9TRaZUDxlye2S-o92/exec",
                STORAGE_PREFIX: "cardforge_cache_",
                TPL_STORAGE_PREFIX: "cardforge_tpl_cache_"
            };
            return fallback[prop];
        }
    });

    const TPL_PREFIX = "cardforge_tpl_cache_";

    /**
     * 儲存卡片至 Google Sheet 雲端 SSOT
     * @param {Object} card 卡片物件
     * @returns {Promise<{success: boolean, id: string, shareUrl: string, error?: string}>}
     */
    async function saveCard(card) {
        if (!card) {
            return { success: false, error: "卡片資料不可為空" };
        }

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

                // 寫後校驗 (Read-After-Write Verification)
                if (data.card && data.card.id === finalId) {
                    try {
                        localStorage.setItem(config.STORAGE_PREFIX + finalId, JSON.stringify(data.card));
                    } catch (e) {}
                }

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

        let cachedCard = null;
        try {
            const raw = localStorage.getItem(config.STORAGE_PREFIX + cardId);
            if (raw) {
                cachedCard = JSON.parse(raw);
            }
        } catch (e) {
            console.warn("Failed to read cache", e);
        }

        const fetchPromise = (async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

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

        if (cachedCard) {
            return cachedCard;
        }

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
            const timeoutId = setTimeout(() => controller.abort(), 20000);

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
            console.warn("[GasClient.listCards] Fallback to local cards:", err.message);
        }
        return [];
    }

    /**
     * 儲存模板至 Google Sheet 雲端 SSOT
     * @param {Object} template 模板物件
     * @returns {Promise<{success: boolean, id: string, error?: string}>}
     */
    async function saveTemplate(template) {
        if (!template) {
            return { success: false, error: "模板資料不可為空" };
        }

        if (!template.id) {
            template.id = "tpl-" + Date.now();
        }

        const payload = {
            action: "save_template",
            template: template
        };

        try {
            try {
                localStorage.setItem(TPL_PREFIX + template.id, JSON.stringify(template));
            } catch (e) {}

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
                const finalId = data.id || template.id;
                if (data.template) {
                    try {
                        localStorage.setItem(TPL_PREFIX + finalId, JSON.stringify(data.template));
                    } catch (e) {}
                }
                return {
                    success: true,
                    id: finalId,
                    message: "模板已成功同步至雲端"
                };
            } else {
                throw new Error(data.error || "GAS 網關返回失敗");
            }
        } catch (err) {
            console.error("[GasClient.saveTemplate] Error:", err);
            return {
                success: false,
                id: template.id,
                error: err.message,
                isLocalFallback: true
            };
        }
    }

    /**
     * 讀取模板 (SWR 漸進快取模式，供受眾端動態拉取自訂模板)
     * @param {string} templateId 模板 ID
     * @param {function} onBackgroundUpdate 若背景更新成功時的回調
     * @returns {Promise<Object|null>}
     */
    async function getTemplate(templateId, onBackgroundUpdate) {
        if (!templateId) return null;

        let cachedTpl = null;
        try {
            const raw = localStorage.getItem(TPL_PREFIX + templateId);
            if (raw) {
                cachedTpl = JSON.parse(raw);
            }
        } catch (e) {}

        const fetchPromise = (async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 20000);

                const res = await fetch(`${config.GAS_API_URL}?action=get_template&id=${encodeURIComponent(templateId)}`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.template) {
                        try {
                            localStorage.setItem(TPL_PREFIX + templateId, JSON.stringify(data.template));
                        } catch (e) {}

                        if (typeof onBackgroundUpdate === "function") {
                            onBackgroundUpdate(data.template);
                        }
                        return data.template;
                    }
                }
            } catch (err) {
                console.warn("[GasClient.getTemplate] Cloud fetch error / timeout:", err.message);
            }
            return null;
        })();

        if (cachedTpl) {
            return cachedTpl;
        }

        const cloudTpl = await fetchPromise;
        return cloudTpl;
    }

    /**
     * 獲取公開雲端模板清單
     * @returns {Promise<Array>}
     */
    async function listTemplates() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

            const res = await fetch(`${config.GAS_API_URL}?action=list_templates`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.ok) {
                const data = await res.json();
                if (data.success && Array.isArray(data.templates)) {
                    return data.templates;
                }
            }
        } catch (err) {
            console.warn("[GasClient.listTemplates] Fallback to local templates", err.message);
        }
        return [];
    }

    /**
     * 後台批量增量差異同步 (Batch Diff-Sync)
     * @param {{cards?: Array, templates?: Array}} diffPayload 差異資料
     * @returns {Promise<{success: boolean, syncedCards: Array, syncedTemplates: Array, error?: string}>}
     */
    async function batchSync(diffPayload) {
        const cardsToSync = diffPayload?.cards || [];
        const tplsToSync = diffPayload?.templates || [];

        if (cardsToSync.length === 0 && tplsToSync.length === 0) {
            return { success: true, syncedCards: [], syncedTemplates: [], message: "No dirty items to sync" };
        }

        const payload = {
            action: "batch_sync",
            cards: cardsToSync,
            templates: tplsToSync
        };

        try {
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
                // 寫後校驗 (Read-After-Write Verification)：回填快取
                if (Array.isArray(data.syncedCards)) {
                    data.syncedCards.forEach(item => {
                        if (item.card && item.id) {
                            try {
                                localStorage.setItem(config.STORAGE_PREFIX + item.id, JSON.stringify(item.card));
                            } catch (e) {}
                        }
                    });
                }
                if (Array.isArray(data.syncedTemplates)) {
                    data.syncedTemplates.forEach(item => {
                        if (item.template && item.id) {
                            try {
                                localStorage.setItem(TPL_PREFIX + item.id, JSON.stringify(item.template));
                            } catch (e) {}
                        }
                    });
                }
                return {
                    success: true,
                    syncedCards: data.syncedCards || [],
                    syncedTemplates: data.syncedTemplates || []
                };
            } else {
                throw new Error(data.error || "Batch sync failed");
            }
        } catch (err) {
            console.warn("[GasClient.batchSync] Warning / Error:", err.message);
            return {
                success: false,
                error: err.message
            };
        }
    }

    /**
     * 上傳字幕檔至 Google Drive 專屬資料夾 (CardForge_Subtitles)
     * @param {string} fileName 檔名 (如 subtitle_xxx.srt)
     * @param {string} content SRT 內容文字
     * @returns {Promise<{success: boolean, url?: string, fileId?: string, error?: string}>}
     */
    async function uploadSubtitle(fileName, content) {
        if (!content) {
            return { success: false, error: "字幕內容不可為空" };
        }

        const payload = {
            action: "upload_subtitle",
            fileName: fileName || ("subtitle_" + Date.now() + ".srt"),
            content: content
        };

        try {
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
            return data;
        } catch (err) {
            console.error("[GasClient.uploadSubtitle] Error:", err);
            return {
                success: false,
                error: err.message
            };
        }
    }

    return {
        saveCard,
        getCard,
        listCards,
        saveTemplate,
        getTemplate,
        listTemplates,
        batchSync,
        uploadSubtitle
    };
})();
