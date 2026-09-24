/**
 * js/workspace_store.js - CardForge 工作台純資料與狀態管理核心
 * 具備 LocalStorage 持久化、JSON 降級保底、Google Sheet 雲端 SSOT 同步、
 * 差異增量防抖同步 (Diff-Sync Engine)、深層安全合併 (Deep Merge) 與備份匯出
 * 零 JSX 依賴，file:/// 本地協議 100% 安全無 CORS
 */
(function () {
    const STORAGE_KEY_CARDS = 'cardforge_cards';
    const STORAGE_KEY_TEMPLATES = 'cardforge_templates';
    const STORAGE_KEY_DIRTY_CARDS = 'cardforge_dirty_cards';
    const STORAGE_KEY_DIRTY_TEMPLATES = 'cardforge_dirty_templates';

    // 髒資料標記集合 (Dirty Sets)
    const dirtyCardIds = new Set();
    const dirtyTemplateIds = new Set();

    // 監聽回調函數列表
    const syncListeners = [];
    let currentSyncStatus = 'synced'; // 'synced' | 'syncing' | 'offline'
    let syncDebounceTimer = null;
    let retryTimer = null;
    let isSyncing = false;

    function notifySyncStatus(status, details) {
        currentSyncStatus = status;
        syncListeners.forEach(fn => {
            try { fn(status, details); } catch (e) {}
        });
    }

    /**
     * 深層安全合併卡片物件，徹底杜絕淺層覆蓋抹除 media.customMusic 等巢狀屬性
     */
    function deepMergeCard(base, patch) {
        if (!base) return patch;
        if (!patch) return base;

        const merged = { ...base, ...patch };

        // 深度保護 media 物件
        if (base.media || patch.media) {
            merged.media = {
                ...(base.media || {}),
                ...(patch.media || {})
            };
            // 若 patch 明確傳入了 photos 陣列，以 patch 為準
            if (patch.media && Array.isArray(patch.media.photos)) {
                merged.media.photos = [...patch.media.photos];
            }
        }

        // 若 patch 明確傳入了 paragraphs 陣列，以 patch 為準
        if (patch.paragraphs && Array.isArray(patch.paragraphs)) {
            merged.paragraphs = [...patch.paragraphs];
        }

        // 若 patch 明確傳入了 cta 陣列，以 patch 為準
        if (patch.cta && Array.isArray(patch.cta)) {
            merged.cta = [...patch.cta];
        }

        return merged;
    }

    const WorkspaceStore = {
        /**
         * 註冊同步狀態監聽
         */
        onSyncStatusChange(callback) {
            if (typeof callback === 'function') {
                syncListeners.push(callback);
                callback(currentSyncStatus);
            }
        },

        getSyncStatus() {
            return currentSyncStatus;
        },

        /**
         * 深層安全合併卡片
         */
        mergeCard(base, patch) {
            return deepMergeCard(base, patch);
        },

        /**
         * 初始化載入卡片與模板 (LocalStorage 優先 -> data/*.json 降級保底)
         */
        async loadInitialData() {
            let loadedCards = [];
            let loadedTemplates = [];

            const localCards = localStorage.getItem(STORAGE_KEY_CARDS);
            if (localCards) {
                try { loadedCards = JSON.parse(localCards); } catch (e) {}
            }
            if (!loadedCards || loadedCards.length === 0) {
                try {
                    const res = await fetch('data/cards.json');
                    if (res.ok) loadedCards = await res.json();
                } catch (e) {
                    loadedCards = window.DEFAULT_CARDS || [];
                }
            }

            const localTpls = localStorage.getItem(STORAGE_KEY_TEMPLATES);
            if (localTpls) {
                try { loadedTemplates = JSON.parse(localTpls); } catch (e) {}
            }

            const defaultTpls = window.DEFAULT_TEMPLATES || [];
            // 優先合併 window.DEFAULT_TEMPLATES，確保在 file:/// 協議下新發布模板 100% 立即生效
            if (defaultTpls.length > 0) {
                if (!loadedTemplates || loadedTemplates.length === 0) {
                    loadedTemplates = defaultTpls;
                } else {
                    const map = new Map(loadedTemplates.map(t => [t.id, t]));
                    defaultTpls.forEach(dt => {
                        if (!map.has(dt.id)) {
                            map.set(dt.id, dt);
                        }
                    });
                    loadedTemplates = Array.from(map.values());
                }
            }

            // 嘗試讀取 data/templates.json (若是 http/https 環境)
            try {
                const res = await fetch('data/templates.json');
                if (res.ok) {
                    const jsonTpls = await res.json();
                    const map = new Map(loadedTemplates.map(t => [t.id, t]));
                    jsonTpls.forEach(jt => {
                        if (!map.has(jt.id)) {
                            map.set(jt.id, jt);
                        }
                    });
                    loadedTemplates = Array.from(map.values());
                }
            } catch (e) {}

            try {
                localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(loadedTemplates));
            } catch (e) {}

            // 初始化時恢復未完成的 dirty 狀態
            try {
                const savedDirtyCards = JSON.parse(localStorage.getItem(STORAGE_KEY_DIRTY_CARDS) || '[]');
                savedDirtyCards.forEach(id => dirtyCardIds.add(id));
                const savedDirtyTpls = JSON.parse(localStorage.getItem(STORAGE_KEY_DIRTY_TEMPLATES) || '[]');
                savedDirtyTpls.forEach(id => dirtyTemplateIds.add(id));
            } catch (e) {}

            return {
                cards: loadedCards || [],
                templates: loadedTemplates || []
            };
        },

        /**
         * 僅持久化卡片至 LocalStorage (編輯器實時草稿所見即所得，絕不向雲端發請求)
         */
        saveCardsLocal(cards) {
            try {
                localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
            } catch (e) {
                console.error('Failed to save cards to localStorage', e);
            }
        },

        /**
         * 持久化卡片陣列至 LocalStorage，並將變更的卡片標記為 dirty 啟動雲端同步
         */
        saveCards(cards, changedCardId) {
            this.saveCardsLocal(cards);

            if (changedCardId) {
                dirtyCardIds.add(changedCardId);
            } else {
                cards.forEach(c => dirtyCardIds.add(c.id));
            }

            this._persistDirtyKeys();
            this.scheduleDiffSync(cards, null);
        },

        /**
         * 持久化模板陣列至 LocalStorage，並將變更的模板標記為 dirty 啟動背景增量同步
         */
        saveTemplates(templates, changedTplId) {
            try {
                localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
            } catch (e) {
                console.error('Failed to save templates to localStorage', e);
            }

            if (changedTplId) {
                dirtyTemplateIds.add(changedTplId);
            } else {
                templates.forEach(t => dirtyTemplateIds.add(t.id));
            }

            this._persistDirtyKeys();
            this.scheduleDiffSync(null, templates);
        },

        markCardDirty(cardId) {
            if (cardId) {
                dirtyCardIds.add(cardId);
                this._persistDirtyKeys();
            }
        },

        markTemplateDirty(tplId) {
            if (tplId) {
                dirtyTemplateIds.add(tplId);
                this._persistDirtyKeys();
            }
        },

        _persistDirtyKeys() {
            try {
                localStorage.setItem(STORAGE_KEY_DIRTY_CARDS, JSON.stringify(Array.from(dirtyCardIds)));
                localStorage.setItem(STORAGE_KEY_DIRTY_TEMPLATES, JSON.stringify(Array.from(dirtyTemplateIds)));
            } catch (e) {}
        },

        /**
         * 防抖調度背景差異增量同步 (Debounce 2.5 秒)
         */
        scheduleDiffSync(allCards, allTemplates) {
            if (syncDebounceTimer) {
                clearTimeout(syncDebounceTimer);
            }

            notifySyncStatus('syncing', { reason: '變更累積中...' });

            syncDebounceTimer = setTimeout(() => {
                this.performDiffSync(allCards, allTemplates);
            }, 2500);
        },

        /**
         * 立即執行差異增量同步 (Batch Diff-Sync)
         */
        async performDiffSync(allCards, allTemplates) {
            if (isSyncing) return;
            if (dirtyCardIds.size === 0 && dirtyTemplateIds.size === 0) {
                notifySyncStatus('synced', { message: '所有卡片與模板皆已為最新' });
                return;
            }

            if (!window.GasClient) {
                notifySyncStatus('offline', { message: '本地離線保底運行中' });
                return;
            }

            // 取得目前的卡片與模板完整清單
            let cardsPool = allCards;
            if (!cardsPool) {
                try {
                    cardsPool = JSON.parse(localStorage.getItem(STORAGE_KEY_CARDS) || '[]');
                } catch (e) { cardsPool = []; }
            }

            let tplsPool = allTemplates;
            if (!tplsPool) {
                try {
                    tplsPool = JSON.parse(localStorage.getItem(STORAGE_KEY_TEMPLATES) || '[]');
                } catch (e) { tplsPool = []; }
            }

            // 提取出所有有變動的實體 (Dirty Entities)
            const cardsToSync = cardsPool.filter(c => dirtyCardIds.has(c.id));
            const tplsToSync = tplsPool.filter(t => dirtyTemplateIds.has(t.id));

            if (cardsToSync.length === 0 && tplsToSync.length === 0) {
                dirtyCardIds.clear();
                dirtyTemplateIds.clear();
                this._persistDirtyKeys();
                notifySyncStatus('synced', { message: '雲端資料庫已同步' });
                return;
            }

            isSyncing = true;
            notifySyncStatus('syncing', {
                cardsCount: cardsToSync.length,
                templatesCount: tplsToSync.length
            });

            try {
                const res = await window.GasClient.batchSync({
                    cards: cardsToSync,
                    templates: tplsToSync
                });

                if (res && res.success) {
                    // 同步成功，清除對應的 Dirty Flags
                    cardsToSync.forEach(c => dirtyCardIds.delete(c.id));
                    tplsToSync.forEach(t => dirtyTemplateIds.delete(t.id));
                    this._persistDirtyKeys();

                    notifySyncStatus('synced', {
                        message: `已自動同步至雲端 (${res.syncedCards?.length || 0} 卡片, ${res.syncedTemplates?.length || 0} 模板)`
                    });
                } else {
                    notifySyncStatus('offline', {
                        message: '雲端網關忙碌，已自動保留本機增量，稍後自動重試'
                    });
                    this._scheduleAutoRetry(cardsPool, tplsPool);
                }
            } catch (err) {
                console.warn('[WorkspaceStore.performDiffSync] Diff sync deferred:', err);
                notifySyncStatus('offline', {
                    message: '連線暫時離線，本機優先運行中'
                });
                this._scheduleAutoRetry(cardsPool, tplsPool);
            } finally {
                isSyncing = false;
            }
        },

        _scheduleAutoRetry(allCards, allTemplates) {
            if (retryTimer) clearTimeout(retryTimer);
            retryTimer = setTimeout(() => {
                if (dirtyCardIds.size > 0 || dirtyTemplateIds.size > 0) {
                    this.performDiffSync(allCards, allTemplates);
                }
            }, 4000);
        },

        /**
         * 強制立即完成所有同步 (例如點擊分享前調用)
         */
        async forceSyncNow(allCards, allTemplates) {
            if (syncDebounceTimer) {
                clearTimeout(syncDebounceTimer);
                syncDebounceTimer = null;
            }
            return await this.performDiffSync(allCards, allTemplates);
        },

        /**
         * 建立新卡片實體
         */
        createCard(currentCount, templates) {
            const defaultTpl = (templates && templates[0]) || { id: 'mothers-day' };
            const newId = `c_${Date.now().toString(36)}`;
            dirtyCardIds.add(newId);
            this._persistDirtyKeys();

            return {
                id: newId,
                templateId: defaultTpl.id,
                name: `新自訂賀卡 #${currentCount + 1}`,
                category: 'personal',
                updatedAt: new Date().toISOString().split('T')[0],
                title: 'Happy Celebrations',
                recipient: '親愛的朋友：',
                paragraphs: [
                    '在這充滿驚喜與溫暖的特別時刻，為你獻上最真摯的祝福。',
                    '願你未來的每一步都滿載星光與希望，日日精彩，心想事成！'
                ],
                sender: '真摯的祝福者 敬上',
                shareCaption: '{name}，佳節愉快！這是一張為你特別定製的 3D 星空賀卡，祝你一切順心：',
                coverImage: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
                media: {
                    bgMode: 'slideshow',
                    photos: [
                        'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80'
                    ],
                    customMusic: 'assets/audio/In Love With You.mp3'
                },
                cta: []
            };
        },

        /**
         * 複製現有卡片副本
         */
        duplicateCard(card) {
            const newId = `c_${Date.now().toString(36)}`;
            dirtyCardIds.add(newId);
            this._persistDirtyKeys();

            return {
                ...deepMergeCard(card, {}),
                id: newId,
                name: `${card.name} (副本)`,
                updatedAt: new Date().toISOString().split('T')[0]
            };
        },

        /**
         * 建立新模板規範
         */
        createTemplate(currentCount) {
            const newId = `tpl-${Date.now()}`;
            dirtyTemplateIds.add(newId);
            this._persistDirtyKeys();

            return {
                id: newId,
                name: `全新視覺風格 #${currentCount + 1}`,
                category: 'custom',
                description: '自訂光影 Shader 與粒子特效規範。',
                layout: 'star-wars-crawl',
                bgShader: 'silk-smoke',
                crawlSpeed: 44,
                bgDimmer: 0.95,
                theme: {
                    primaryColor: '#c9a96e',
                    accentColor: '#fbbf24',
                    bgColor: '#09090b',
                    textColor: '#ffffff',
                    titleColor: '#ffffff',
                    fontFamily: "'Cormorant Garamond', serif"
                },
                effects: {
                    particleType: 'rising-stardust',
                    particleDensity: 30
                },
                defaultMusic: 'assets/audio/In Love With You.mp3'
            };
        },

        /**
         * 複製現有模板副本
         */
        duplicateTemplate(tpl) {
            const newId = `tpl-${Date.now()}`;
            dirtyTemplateIds.add(newId);
            this._persistDirtyKeys();

            return {
                ...tpl,
                id: newId,
                name: `${tpl.name} (副本)`
            };
        },

        /**
         * 匯出完整 JSON 備份檔
         */
        exportBackup(cards, templates) {
            const payload = {
                exportedAt: new Date().toISOString(),
                cards: cards,
                templates: templates
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cardforge-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    window.WorkspaceStore = WorkspaceStore;
})();
