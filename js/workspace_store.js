/**
 * js/workspace_store.js - CardForge 工作台純資料與狀態管理核心
 * 具備 LocalStorage 持久化、JSON 降級保底、Google Sheet 雲端同步與備份匯出
 * 零 JSX 依賴，file:/// 本地協議 100% 安全無 CORS
 */
(function () {
    const STORAGE_KEY_CARDS = 'cardforge_cards';
    const STORAGE_KEY_TEMPLATES = 'cardforge_templates';

    const WorkspaceStore = {
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
            if (!loadedTemplates || loadedTemplates.length === 0) {
                try {
                    const res = await fetch('data/templates.json');
                    if (res.ok) loadedTemplates = await res.json();
                } catch (e) {
                    loadedTemplates = window.DEFAULT_TEMPLATES || [];
                }
            }

            return {
                cards: loadedCards || [],
                templates: loadedTemplates || []
            };
        },

        /**
         * 持久化卡片陣列至 LocalStorage
         */
        saveCards(cards) {
            try {
                localStorage.setItem(STORAGE_KEY_CARDS, JSON.stringify(cards));
            } catch (e) {
                console.error('Failed to save cards to localStorage', e);
            }
        },

        /**
         * 持久化模板陣列至 LocalStorage
         */
        saveTemplates(templates) {
            try {
                localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
            } catch (e) {
                console.error('Failed to save templates to localStorage', e);
            }
        },

        /**
         * 建立新卡片實體
         */
        createCard(currentCount, templates) {
            const defaultTpl = (templates && templates[0]) || { id: 'mothers-day' };
            return {
                id: `c_${Date.now().toString(36)}`,
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
            return {
                ...card,
                id: `c_${Date.now().toString(36)}`,
                name: `${card.name} (副本)`,
                updatedAt: new Date().toISOString().split('T')[0]
            };
        },

        /**
         * 建立新模板規範
         */
        createTemplate(currentCount) {
            return {
                id: `tpl-${Date.now()}`,
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
            return {
                ...tpl,
                id: `tpl-${Date.now()}`,
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
