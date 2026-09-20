/**
 * 🛠️ CardForge Studio 工作台核心邏輯 (workspace.js)
 * 遵循「大畫廊優先 (Gallery-First)」鐵律，支援卡片/模板雙層畫廊、所見即所得編輯器、3D 特效微調與雲端免 Commit 持久化
 */

// 模板專用佔位文案（僅供試看排版字級，非真實卡片）
const TEMPLATE_DUMMY_CARD = {
    id: 'dummy-template-preview',
    title: 'Sample Typography Title',
    recipient: '致 預覽示範對象 (Recipient)：',
    paragraphs: [
        '這是一段用於測試模板字型、字級大小、字距行高與漫遊速度的示範文字段落。',
        '在此處可以目測背景 3D Shader、前景粒子特效與深淺遮罩在動態滾動時的穿透視覺質感。',
        '確認排版與光影協調後，保存模板即可供卡片製作頁面一鍵套用。'
    ],
    sender: '模板示範署名 (Signature)\nCardForge Studio',
    media: { bgMode: 'slideshow', photos: [] },
    cta: [
        { label: '示範按鈕 (CTA)', url: '#', icon: 'fa-sparkles' }
    ]
};

function CardForgeApp() {
    // 視圖狀態：'gallery' (首頁大畫廊，預設！) | 'card_editor' (卡片編輯器)
    const [currentView, setCurrentView] = React.useState('gallery');
    // 畫廊分頁：'cards' (卡片管理) | 'templates' (模板管理)
    const [activeGalleryTab, setActiveGalleryTab] = React.useState('cards');

    const [cards, setCards] = React.useState([]);
    const [templates, setTemplates] = React.useState([]);
    
    // 當前正在編輯的卡片 ID
    const [editingCardId, setEditingCardId] = React.useState(null);

    // 彈窗狀態
    const [previewModalCard, setPreviewModalCard] = React.useState(null); // { card, template }
    const [editingTemplateModal, setEditingTemplateModal] = React.useState(null); // template object

    // 雲端分享彈窗狀態
    const [cloudShareModal, setCloudShareModal] = React.useState(null); // { card, shareUrl, isSaving: boolean }

    // 編輯器內的預覽模擬模式：'mobile' | 'desktop'
    const [editorPreviewDevice, setEditorPreviewDevice] = React.useState('mobile');

    // 操作提示反饋 (Toast)
    const [toastMessage, setToastMessage] = React.useState('');
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 3000);
    };

    // ==========================================
    // 初始化載入：本地備份優先 + SWR 雲端聚合
    // ==========================================
    React.useEffect(() => {
        const initData = async () => {
            let loadedCards = [];
            let loadedTemplates = [];

            // 1. 載入卡片
            const localCards = localStorage.getItem('cardforge_cards');
            if (localCards) {
                try { loadedCards = JSON.parse(localCards); } catch (e) {}
            }
            if (!loadedCards || loadedCards.length === 0) {
                try {
                    const res = await fetch('data/cards.json');
                    if (res.ok) loadedCards = await res.json();
                } catch (e) {
                    console.warn('Failed to load data/cards.json', e);
                }
            }
            setCards(loadedCards || []);

            // 2. 載入模板
            const localTpls = localStorage.getItem('cardforge_templates');
            if (localTpls) {
                try { loadedTemplates = JSON.parse(localTpls); } catch (e) {}
            }
            if (!loadedTemplates || loadedTemplates.length === 0) {
                try {
                    const res = await fetch('data/templates.json');
                    if (res.ok) loadedTemplates = await res.json();
                } catch (e) {
                    console.warn('Failed to load data/templates.json', e);
                }
            }
            setTemplates(loadedTemplates || []);

            // 3. SWR 背景向雲端探測公開卡片列表 (若 GasClient 存在)
            if (window.GasClient) {
                window.GasClient.listCards().then(cloudList => {
                    if (cloudList && cloudList.length > 0) {
                        setCards(prevCards => {
                            const map = new Map(prevCards.map(c => [c.id, c]));
                            cloudList.forEach(cc => {
                                if (!map.has(cc.id)) {
                                    map.set(cc.id, {
                                        id: cc.id,
                                        name: cc.title || '雲端賀卡',
                                        title: cc.title,
                                        recipient: cc.recipient || '',
                                        sender: cc.sender || '',
                                        paragraphs: [cc.description || ''],
                                        templateId: cc.templateId || 'mothers-day',
                                        updatedAt: cc.updatedAt ? cc.updatedAt.split('T')[0] : '雲端',
                                        category: 'personal',
                                        media: { bgMode: 'slideshow', photos: cc.imageUrl ? [cc.imageUrl] : [] }
                                    });
                                }
                            });
                            const merged = Array.from(map.values());
                            localStorage.setItem('cardforge_cards', JSON.stringify(merged));
                            return merged;
                        });
                    }
                }).catch(err => console.warn('Cloud list fetch skipped', err));
            }
        };

        initData();
    }, []);

    // 儲存至本機
    const saveCards = (newCards) => {
        setCards(newCards);
        localStorage.setItem('cardforge_cards', JSON.stringify(newCards));
    };

    const saveTemplates = (newTpls) => {
        setTemplates(newTpls);
        localStorage.setItem('cardforge_templates', JSON.stringify(newTpls));
    };

    // 匯出完整備份 JSON
    const exportAllJSON = () => {
        const payload = {
            exportedAt: new Date().toISOString(),
            cards: cards,
            templates: templates
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cardforge_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('已匯出完整台帳備份！');
    };

    // ==========================================
    // 雲端持久化 (免 Git Commit) 核心操作
    // ==========================================
    const handleCloudPublish = async (targetCard) => {
        if (!targetCard) return;
        setCloudShareModal({
            card: targetCard,
            shareUrl: '',
            isSaving: true,
            statusText: '正在同步至 Google Sheet SSOT 雲端總帳...'
        });

        if (window.GasClient) {
            const res = await window.GasClient.saveCard(targetCard);
            if (res.success) {
                // 更新卡片 ID (若產生新 ID)
                if (res.id !== targetCard.id) {
                    const updatedCards = cards.map(c => c.id === targetCard.id ? { ...c, id: res.id } : c);
                    saveCards(updatedCards);
                }
                setCloudShareModal({
                    card: targetCard,
                    shareUrl: res.shareUrl,
                    isSaving: false,
                    statusText: '發布成功！社群動態預覽已就緒'
                });
                showToast('🎉 雲端儲存成功！已生成專屬短連結');
            } else {
                setCloudShareModal({
                    card: targetCard,
                    shareUrl: res.fallbackShareUrl || '',
                    isSaving: false,
                    isError: true,
                    statusText: `雲端暫時受阻 (${res.error || '網絡超時'})，已自動為您切換為本機保底連結`
                });
                showToast('⚠️ 雲端已切換為本地保底連結');
            }
        } else {
            // 後備
            const fallbackUrl = `${window.location.origin}${window.location.pathname.replace('workspace.html', 'index.html')}?id=${targetCard.id}`;
            setCloudShareModal({
                card: targetCard,
                shareUrl: fallbackUrl,
                isSaving: false,
                statusText: '已生成本機測試連結'
            });
        }
    };

    // ==========================================
    // 卡片操作
    // ==========================================
    const handleCreateCard = () => {
        const defaultTpl = templates[0] || { id: 'mothers-day' };
        const newCard = {
            id: `c_${Date.now().toString(36)}`,
            templateId: defaultTpl.id,
            name: `新自訂賀卡 #${cards.length + 1}`,
            category: 'personal',
            updatedAt: new Date().toISOString().split('T')[0],
            title: 'Happy Celebrations',
            recipient: '親愛的朋友：',
            paragraphs: [
                '在這充滿驚喜與溫暖的特別時刻，為你獻上最真摯的祝福。',
                '願你未來的每一步都滿載星光與希望，日日精彩，心想事成！'
            ],
            sender: '真摯的祝福者 敬上',
            media: {
                bgMode: 'slideshow',
                photos: [
                    'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80',
                    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80'
                ],
                customMusic: 'assets/audio/In Love With You.mp3'
            },
            cta: [
                { label: '造訪專屬網站', url: 'https://foxlink.co.in', icon: 'fa-globe' }
            ]
        };
        const updated = [newCard, ...cards];
        saveCards(updated);
        setEditingCardId(newCard.id);
        setCurrentView('card_editor');
        showToast('已新增卡片並進入所見即所得編輯器！');
    };

    const handleDuplicateCard = (card) => {
        const dup = {
            ...card,
            id: `c_${Date.now().toString(36)}`,
            name: `${card.name} (副本)`,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        const updated = [dup, ...cards];
        saveCards(updated);
        showToast(`已複製卡片「${dup.name}」`);
    };

    const handleDeleteCard = (cardId, cardName) => {
        if (cards.length <= 1) {
            alert('系統至少保留一張示範卡片！');
            return;
        }
        if (!window.confirm(`確定要刪除卡片「${cardName}」嗎？`)) return;
        const updated = cards.filter(c => c.id !== cardId);
        saveCards(updated);
        showToast('卡片已刪除');
    };

    const handleCopyShareLink = (cardId) => {
        const base = (window.CardForgeConfig && window.CardForgeConfig.SHARE_BASE_URL) || window.location.origin;
        const url = `${base}?id=${encodeURIComponent(cardId)}`;
        navigator.clipboard.writeText(url).then(() => {
            showToast('已複製卡片專屬分享連結！');
        }).catch(() => {
            prompt('請手動複製連結：', url);
        });
    };

    // ==========================================
    // 模板操作
    // ==========================================
    const handleCreateTemplate = () => {
        const newTpl = {
            id: `tpl-${Date.now()}`,
            name: '自訂全新視覺風格',
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
                fontFamily: "'Cormorant Garamond', serif",
                styleClass: 'theme-obsidian-gold'
            },
            effects: {
                particleType: 'rising-stardust',
                particleDensity: 25
            },
            defaultMusic: 'assets/audio/In Love With You.mp3'
        };
        const updated = [...templates, newTpl];
        saveTemplates(updated);
        setEditingTemplateModal(newTpl);
        showToast('已新增模板，請進行微調設定');
    };

    const handleDuplicateTemplate = (tpl) => {
        const dup = {
            ...tpl,
            id: `tpl-${Date.now()}`,
            name: `${tpl.name} (副本)`
        };
        const updated = [...templates, dup];
        saveTemplates(updated);
        showToast(`已複製模板副本「${dup.name}」`);
    };

    const handleDeleteTemplate = (tplId, tplName) => {
        if (templates.length <= 1) {
            alert('系統至少保留一個模板！');
            return;
        }
        if (!window.confirm(`確定要刪除模板「${tplName}」嗎？`)) return;
        const updated = templates.filter(t => t.id !== tplId);
        saveTemplates(updated);
        showToast('模板已刪除');
    };

    const handleSaveTemplateModal = (updatedTpl) => {
        const updated = templates.map(t => t.id === updatedTpl.id ? updatedTpl : t);
        saveTemplates(updated);
        setEditingTemplateModal(null);
        showToast('模板規格已保存！');
    };

    // 當前正在編輯的卡片
    const currentEditingCard = cards.find(c => c.id === editingCardId) || cards[0];
    const currentEditingTemplate = templates.find(t => t.id === currentEditingCard?.templateId) || templates[0];

    const updateEditingCard = (fields) => {
        if (!currentEditingCard) return;
        const updated = cards.map(c => c.id === currentEditingCard.id ? { ...c, ...fields } : c);
        saveCards(updated);
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#07080c] text-zinc-200">
            {/* Toast 提示浮條 */}
            {toastMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-500 text-zinc-950 font-bold rounded-lg shadow-xl text-xs flex items-center gap-2 animate-bounce">
                    <i className="fa-solid fa-circle-check"></i>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* ========================================================= */}
            {/* 頂部導覽列 (APP BAR) */}
            {/* ========================================================= */}
            <header className="h-14 border-b border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
                {/* 左側：品牌 Logo & 名稱 */}
                <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-zinc-950 font-black text-xs shadow">
                        CF
                    </span>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-bold tracking-wide text-sm text-white">CardForge Studio</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono">
                                3D Canvas + Cloud SSOT
                            </span>
                        </div>
                        <div className="text-[10px] text-zinc-500">免 Git Commit ✕ 社交動態預覽 ✕ 雙軌賀卡工坊</div>
                    </div>
                </div>

                {/* 中間：分頁導覽按鈕 (當在畫廊視圖時顯示) */}
                {currentView === 'gallery' ? (
                    <nav className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs">
                        <button
                            onClick={() => setActiveGalleryTab('cards')}
                            className={`px-4 py-1.5 rounded-md flex items-center gap-2 font-medium transition-all ${activeGalleryTab === 'cards' ? 'bg-amber-400 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <i className="fa-solid fa-address-card"></i>
                            <span>🗂️ 卡片管理 ({cards.length})</span>
                        </button>
                        <button
                            onClick={() => setActiveGalleryTab('templates')}
                            className={`px-4 py-1.5 rounded-md flex items-center gap-2 font-medium transition-all ${activeGalleryTab === 'templates' ? 'bg-indigo-500 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <i className="fa-solid fa-wand-magic-sparkles"></i>
                            <span>🛠️ 模板管理 ({templates.length})</span>
                        </button>
                    </nav>
                ) : (
                    /* 當在編輯視圖時，顯示醒目的返回按鈕與發布按鈕！ */
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentView('gallery')}
                            className="px-4 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-amber-400 hover:bg-zinc-800 text-amber-300 font-bold text-xs flex items-center gap-2 shadow transition-all"
                        >
                            <i className="fa-solid fa-arrow-left"></i>
                            <span>返回卡片庫 (Back to Gallery)</span>
                        </button>
                        <span className="text-zinc-500 text-xs">|</span>
                        <span className="text-xs text-zinc-300 font-medium hidden sm:inline">
                            正在編輯：<span className="text-amber-300 font-bold">{currentEditingCard?.name}</span>
                        </span>
                    </div>
                )}

                {/* 右側：動作按鈕 */}
                <div className="flex items-center gap-3">
                    {/* 若在編輯模式，顯示搶眼的「☁️ 發布至雲端」按鈕 */}
                    {currentView === 'card_editor' && (
                        <button
                            onClick={() => handleCloudPublish(currentEditingCard)}
                            className="px-3.5 py-1.5 text-xs rounded bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all border border-sky-400/30"
                            title="儲存至 Google Sheet SSOT 並取得社群預覽分享短網址"
                        >
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                            <span>☁️ 發布至雲端 (免 Commit)</span>
                        </button>
                    )}

                    <button
                        onClick={exportAllJSON}
                        title="匯出完整 JSON 台帳備份"
                        className="px-3 py-1.5 text-xs rounded border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hidden md:flex items-center gap-1.5 transition-colors"
                    >
                        <i className="fa-solid fa-download"></i>
                        <span>備份導出</span>
                    </button>
                    <a
                        href="index.html"
                        target="_blank"
                        className="px-3.5 py-1.5 text-xs rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold flex items-center gap-1.5 shadow transition-all"
                    >
                        <i className="fa-solid fa-play text-[10px]"></i>
                        <span>開啟播放器</span>
                    </a>
                </div>
            </header>

            {/* ========================================================= */}
            {/* SCENARIO 1: 首頁大畫廊 (GALLERY DASHBOARD) - 默認進入！ */}
            {/* ========================================================= */}
            {currentView === 'gallery' && (
                <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
                    {/* TAB A: 卡片管理 (Cards Gallery) */}
                    {activeGalleryTab === 'cards' && (
                        <section>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span>🗂️ 我的賀卡庫 (Cards Gallery)</span>
                                    </h2>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        管理與自訂送給親友或夥伴的專屬卡片。支援免 Commit 一鍵雲端發布、動態社交預覽與複製短網址。
                                    </p>
                                </div>
                                <button
                                    onClick={handleCreateCard}
                                    className="px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all self-start sm:self-auto"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    <span>＋ 新增卡片</span>
                                </button>
                            </div>

                            {/* 卡片網格 (Cards Grid) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {cards.map(c => {
                                    const appliedTpl = templates.find(t => t.id === c.templateId) || templates[0];
                                    return (
                                        <div
                                            key={c.id}
                                            className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all hover:bg-zinc-900/90 group"
                                        >
                                            <div>
                                                {/* 卡片頭部：分類與更新時間 */}
                                                <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
                                                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium border border-zinc-700/60">
                                                        {c.category === 'business' ? '商務夥伴' : c.category === 'festive' ? '節慶祝賀' : '個人親友'}
                                                    </span>
                                                    <span className="font-mono text-zinc-500">{c.updatedAt}</span>
                                                </div>

                                                {/* 卡片標題與賀詞 */}
                                                <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                                                    {c.name}
                                                </h3>
                                                <div className="text-xs text-amber-200/80 font-medium mt-1">
                                                    {c.title || '無標題'}
                                                </div>

                                                {/* 稱謂與文案預覽 */}
                                                <div className="mt-3 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-xs text-zinc-300">
                                                    <div className="text-zinc-400 font-medium">{c.recipient || '致 受贈者：'}</div>
                                                    <div className="text-zinc-400/90 line-clamp-2 leading-relaxed text-[11px]">
                                                        {c.paragraphs && c.paragraphs[0] ? c.paragraphs[0] : '尚無內文...'}
                                                    </div>
                                                </div>

                                                {/* 套用模板標籤 */}
                                                <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-400">
                                                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: appliedTpl?.theme?.primaryColor || '#c9a96e' }}></span>
                                                    <span>風格：<span className="text-zinc-200 font-medium">{appliedTpl?.name || '默認'}</span></span>
                                                    <span className="text-zinc-600">|</span>
                                                    <span className="font-mono text-zinc-500">{appliedTpl?.layout}</span>
                                                </div>
                                            </div>

                                            {/* 底部操作按鈕：編輯、雲端發布、複製副本、刪除 */}
                                            <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingCardId(c.id);
                                                            setCurrentView('card_editor');
                                                        }}
                                                        className="px-3 py-1.5 rounded-md bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow"
                                                    >
                                                        <i className="fa-solid fa-pen-to-square text-[11px]"></i>
                                                        <span>編輯卡片</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleCloudPublish(c)}
                                                        className="px-2.5 py-1.5 rounded-md bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-xs flex items-center gap-1 transition-all"
                                                        title="發布至雲端生成短連結"
                                                    >
                                                        <i className="fa-solid fa-cloud-arrow-up text-[10px]"></i>
                                                        <span>雲端分享</span>
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setPreviewModalCard({ card: c, template: appliedTpl })}
                                                        className="p-1.5 text-zinc-400 hover:text-amber-300 transition-colors"
                                                        title="即時預覽試看"
                                                    >
                                                        <i className="fa-solid fa-eye"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDuplicateCard(c)}
                                                        className="p-1.5 text-zinc-400 hover:text-white transition-colors"
                                                        title="複製卡片副本"
                                                    >
                                                        <i className="fa-regular fa-copy"></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteCard(c.id, c.name)}
                                                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                                                        title="刪除卡片"
                                                    >
                                                        <i className="fa-regular fa-trash-can"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    )}

                    {/* TAB B: 模板管理 (Templates Gallery) */}
                    {activeGalleryTab === 'templates' && (
                        <section>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                        <span>🛠️ 模板與視覺規範庫 (Templates)</span>
                                    </h2>
                                    <p className="text-xs text-zinc-400 mt-1">
                                        統一管理 3D WebGL Shader 背景、前景粒子群、字體配色與星戰升空速度等可復用風格模板。
                                    </p>
                                </div>
                                <button
                                    onClick={handleCreateTemplate}
                                    className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all self-start sm:self-auto"
                                >
                                    <i className="fa-solid fa-plus"></i>
                                    <span>＋ 新增模板</span>
                                </button>
                            </div>

                            {/* 模板卡片網格 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {templates.map(t => (
                                    <div
                                        key={t.id}
                                        className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all hover:bg-zinc-900/90 group"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span 
                                                        className="w-3.5 h-3.5 rounded-full inline-block shadow-sm ring-1 ring-white/20"
                                                        style={{ backgroundColor: t.theme?.primaryColor || '#c9a96e' }}
                                                    ></span>
                                                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                                                        {t.name}
                                                    </h3>
                                                </div>
                                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                    {t.layout === 'star-wars-crawl' ? '星戰升空' : '精裝方框'}
                                                </span>
                                            </div>

                                            <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 min-h-[36px]">
                                                {t.description || '自訂專屬視覺規範與 3D 特效配置。'}
                                            </p>

                                            <div className="mt-4 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-[11px]">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">預設版型：</span>
                                                    <span className="text-zinc-300 font-medium">
                                                        {t.layout === 'star-wars-crawl' ? '星戰漫遊升空' : '精裝方盒卡片'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">3D 前景特效：</span>
                                                    <span className="text-amber-300 font-medium">
                                                        {t.effects?.particleType || '純淨無粒子'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-zinc-500">背景 Shader：</span>
                                                    <span className="text-indigo-300 font-mono text-[10px]">
                                                        {t.bgShader || 'none (純相片/黑底)'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                                            <button
                                                onClick={() => handleDuplicateTemplate(t)}
                                                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors"
                                                title="一鍵複製副本"
                                            >
                                                <i className="fa-regular fa-copy"></i>
                                                <span>一鍵複製副本</span>
                                            </button>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setPreviewModalCard({ card: TEMPLATE_DUMMY_CARD, template: t })}
                                                    className="p-1.5 text-zinc-400 hover:text-amber-300 transition-colors"
                                                    title="試看排版與 3D 效果"
                                                >
                                                    <i className="fa-solid fa-eye"></i>
                                                </button>
                                                <button
                                                    onClick={() => setEditingTemplateModal(t)}
                                                    className="p-1.5 text-zinc-400 hover:text-indigo-300 transition-colors"
                                                    title="自訂設計模板與 3D 特效微調"
                                                >
                                                    <i className="fa-solid fa-pencil"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTemplate(t.id, t.name)}
                                                    className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                                                    title="刪除模板"
                                                >
                                                    <i className="fa-regular fa-trash-can"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </main>
            )}

            {/* ========================================================= */}
            {/* SCENARIO 2: 卡片編輯器模式 (CARD EDITOR) - 點擊「編輯」才進入！ */}
            {/* ========================================================= */}
            {currentView === 'card_editor' && currentEditingCard && (
                <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>
                    {/* 左欄：基本台帳與套用模板 */}
                    <aside 
                        style={{ width: '320px', minWidth: '320px', maxWidth: '320px' }}
                        className="border-r border-zinc-800/80 bg-zinc-950/70 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0 text-xs z-20"
                    >
                        <div>
                            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <i className="fa-solid fa-sliders"></i>
                                <span>卡片基本與風格套用</span>
                            </h3>
                            <p className="text-[11px] text-zinc-500">修改卡片名稱、分類，並隨選套用外觀模板。</p>
                        </div>

                        {/* 1. 卡片名稱與分類 */}
                        <div className="space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                            <div>
                                <label className="block text-zinc-400 mb-1">內部識別名稱</label>
                                <input 
                                    type="text"
                                    value={currentEditingCard.name || ''}
                                    onChange={e => updateEditingCard({ name: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 mb-1">卡片分類</label>
                                <select 
                                    value={currentEditingCard.category || 'personal'}
                                    onChange={e => updateEditingCard({ category: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400 cursor-pointer"
                                >
                                    <option value="personal">個人親友 (personal)</option>
                                    <option value="business">商務夥伴 (business)</option>
                                    <option value="festive">節慶祝賀 (festive)</option>
                                </select>
                            </div>
                        </div>

                        {/* 2. 套用外觀模板選擇器 */}
                        <div className="space-y-2 pt-2 border-t border-zinc-800">
                            <label className="text-zinc-300 font-semibold flex items-center gap-1.5">
                                <i className="fa-solid fa-wand-magic-sparkles text-amber-400"></i>
                                <span>套用外觀模板 (點擊即時套用)</span>
                            </label>
                            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                                {templates.map(t => {
                                    const isSelected = t.id === currentEditingCard.templateId;
                                    return (
                                        <button
                                            key={t.id}
                                            type="button"
                                            onClick={() => updateEditingCard({ templateId: t.id })}
                                            className={`w-full text-left p-2.5 rounded-lg border transition-all ${isSelected ? 'border-amber-400 bg-amber-400/10 shadow' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'}`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`font-bold text-xs ${isSelected ? 'text-amber-300' : 'text-zinc-200'}`}>
                                                    {t.name}
                                                </span>
                                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                                    {t.bgShader || 'no-shader'}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                                                {t.effects?.particleType || 'none'} · {t.layout}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 3. 底部返回或雲端發布 */}
                        <div className="mt-auto pt-3 border-t border-zinc-800 flex items-center justify-between">
                            <button
                                onClick={() => setCurrentView('gallery')}
                                className="text-amber-400 hover:underline flex items-center gap-1 text-xs"
                            >
                                <i className="fa-solid fa-arrow-left text-[10px]"></i>
                                <span>儲存並返回卡片庫</span>
                            </button>
                            <button
                                onClick={() => handleCloudPublish(currentEditingCard)}
                                className="px-3 py-1.5 rounded bg-sky-500 hover:bg-sky-400 text-white font-bold flex items-center gap-1 text-xs shadow"
                            >
                                <i className="fa-solid fa-cloud-arrow-up text-[10px]"></i>
                                <span>雲端短連結</span>
                            </button>
                        </div>
                    </aside>

                    {/* 中間：即時所見即所得 3D 手機/寬屏預覽 */}
                    <section className="flex-1 bg-black/60 flex flex-col items-center justify-center p-4 relative overflow-hidden">
                        {/* 預覽視窗比例切換工具列 */}
                        <div className="absolute top-4 z-20 flex items-center gap-2 bg-zinc-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-zinc-800 text-xs shadow-lg">
                            <span className="text-zinc-400 text-[11px]">即時預覽模式：</span>
                            <button
                                onClick={() => setEditorPreviewDevice('mobile')}
                                className={`px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${editorPreviewDevice === 'mobile' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <i className="fa-solid fa-mobile-screen"></i>
                                <span>手機</span>
                            </button>
                            <button
                                onClick={() => setEditorPreviewDevice('desktop')}
                                className={`px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all ${editorPreviewDevice === 'desktop' ? 'bg-amber-400 text-zinc-950 font-bold' : 'text-zinc-400 hover:text-white'}`}
                            >
                                <i className="fa-solid fa-desktop"></i>
                                <span>桌面寬屏</span>
                            </button>
                        </div>

                        {/* 模擬外框容器 */}
                        <div className={editorPreviewDevice === 'mobile' ? 'phone-frame' : 'desktop-frame'}>
                            <CardEngine
                                card={currentEditingCard}
                                template={currentEditingTemplate}
                            />
                        </div>
                    </section>

                    {/* 右欄：專屬內容微調 (文案、音樂、圖片、CTA) */}
                    <aside 
                        style={{ width: '380px', minWidth: '380px', maxWidth: '380px' }}
                        className="border-l border-zinc-800/80 bg-zinc-950/70 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0 text-xs z-20"
                    >
                        <div>
                            <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                <i className="fa-solid fa-pen-nib"></i>
                                <span>專屬賀詞文案與媒體配置</span>
                            </h3>
                            <p className="text-[11px] text-zinc-500">修改文字即刻在中間螢幕呈現渲染反饋。</p>
                        </div>

                        {/* 1. 賀卡標題、稱謂、署名 */}
                        <div className="space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                            <div>
                                <label className="block text-zinc-400 mb-1">主視覺標題 (Title)</label>
                                <input 
                                    type="text"
                                    value={currentEditingCard.title || ''}
                                    onChange={e => updateEditingCard({ title: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 mb-1">收件人稱謂 (Recipient)</label>
                                <input 
                                    type="text"
                                    value={currentEditingCard.recipient || ''}
                                    onChange={e => updateEditingCard({ recipient: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400"
                                />
                            </div>
                            <div>
                                <label className="block text-zinc-400 mb-1">落款署名 (Sender / Signature)</label>
                                <textarea 
                                    rows="2"
                                    value={currentEditingCard.sender || ''}
                                    onChange={e => updateEditingCard({ sender: e.target.value })}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400 resize-none font-sans"
                                />
                            </div>
                        </div>

                        {/* 2. 祝福內文段落 */}
                        <div className="space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                            <div className="flex items-center justify-between">
                                <label className="text-zinc-400 font-medium">祝福段落 ({currentEditingCard.paragraphs?.length || 0})</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const p = [...(currentEditingCard.paragraphs || []), '在此輸入新的感心賀詞...'];
                                        updateEditingCard({ paragraphs: p });
                                    }}
                                    className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1"
                                >
                                    <i className="fa-solid fa-plus text-[10px]"></i>
                                    <span>增加段落</span>
                                </button>
                            </div>
                            {(currentEditingCard.paragraphs || []).map((para, idx) => (
                                <div key={idx} className="relative group">
                                    <textarea
                                        rows="3"
                                        value={para}
                                        onChange={e => {
                                            const updatedP = [...currentEditingCard.paragraphs];
                                            updatedP[idx] = e.target.value;
                                            updateEditingCard({ paragraphs: updatedP });
                                        }}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white outline-none focus:border-amber-400 text-xs resize-y"
                                    />
                                    {currentEditingCard.paragraphs.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updatedP = currentEditingCard.paragraphs.filter((_, i) => i !== idx);
                                                updateEditingCard({ paragraphs: updatedP });
                                            }}
                                            className="absolute top-2 right-2 p-1 text-zinc-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                                            title="刪除此段落"
                                        >
                                            <i className="fa-regular fa-trash-can text-[10px]"></i>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* 3. 背景照片輪播 (URL 清單) */}
                        <div className="space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800">
                            <div className="flex items-center justify-between">
                                <label className="text-zinc-400 font-medium">背景相片輪播 (URL)</label>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const currentPhotos = currentEditingCard.media?.photos || [];
                                        const updatedPhotos = [...currentPhotos, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80'];
                                        updateEditingCard({ media: { ...(currentEditingCard.media || {}), photos: updatedPhotos } });
                                    }}
                                    className="text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1"
                                >
                                    <i className="fa-solid fa-plus text-[10px]"></i>
                                    <span>增加相片</span>
                                </button>
                            </div>
                            {(currentEditingCard.media?.photos || []).map((photoUrl, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={photoUrl}
                                        onChange={e => {
                                            const updatedPhotos = [...currentEditingCard.media.photos];
                                            updatedPhotos[idx] = e.target.value;
                                            updateEditingCard({ media: { ...currentEditingCard.media, photos: updatedPhotos } });
                                        }}
                                        className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-amber-400 font-mono"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updatedPhotos = currentEditingCard.media.photos.filter((_, i) => i !== idx);
                                            updateEditingCard({ media: { ...currentEditingCard.media, photos: updatedPhotos } });
                                        }}
                                        className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                                    >
                                        <i className="fa-regular fa-trash-can text-[10px]"></i>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* 4. 音訊自訂 URL */}
                        <div className="bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 space-y-2">
                            <label className="block text-zinc-400 font-medium">背景配樂 (Audio URL / 相對路徑)</label>
                            <input
                                type="text"
                                value={currentEditingCard.media?.customMusic || ''}
                                placeholder="預設使用模板配樂 (可填 assets/audio/In Love With You.mp3)"
                                onChange={e => {
                                    updateEditingCard({
                                        media: { ...(currentEditingCard.media || {}), customMusic: e.target.value }
                                    });
                                }}
                                className="w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400 font-mono text-[11px]"
                            />
                        </div>
                    </aside>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 1: 即時預覽視圖彈窗 (LIVE PREVIEW MODAL) */}
            {/* ========================================================= */}
            {previewModalCard && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-3">
                        <button
                            onClick={() => handleCloudPublish(previewModalCard.card)}
                            className="px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all"
                        >
                            <i className="fa-solid fa-cloud-arrow-up"></i>
                            <span>發布雲端短網址</span>
                        </button>
                        <button
                            onClick={() => setPreviewModalCard(null)}
                            className="w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors text-base"
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div className="w-full max-w-sm h-[85vh] max-h-[720px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-700/60 relative bg-black">
                        <CardEngine
                            card={previewModalCard.card}
                            template={previewModalCard.template}
                        />
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 2: 雲端分享就緒彈窗 (CLOUD SHARE MODAL) */}
            {/* ========================================================= */}
            {cloudShareModal && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cloud-toast">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold border border-sky-500/30">
                                    <i className="fa-solid fa-cloud-check"></i>
                                </span>
                                <div>
                                    <h3 className="font-bold text-white text-base">賀卡雲端分享已就緒</h3>
                                    <p className="text-[11px] text-zinc-400">免 Git Commit ✕ 自動生成社群圖文預覽</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setCloudShareModal(null)}
                                className="text-zinc-400 hover:text-white text-lg p-1"
                            >
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>

                        {cloudShareModal.isSaving ? (
                            <div className="py-8 flex flex-col items-center justify-center space-y-3">
                                <i className="fa-solid fa-circle-notch fa-spin text-3xl text-sky-400"></i>
                                <p className="text-xs text-zinc-300 font-medium">{cloudShareModal.statusText}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5 text-xs">
                                    <div className="text-zinc-400">專屬短分享網址：</div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="text" 
                                            readOnly 
                                            value={cloudShareModal.shareUrl} 
                                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sky-300 text-xs font-mono outline-none"
                                        />
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(cloudShareModal.shareUrl);
                                                showToast('已複製分享短網址！');
                                            }}
                                            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded text-xs shrink-0 shadow"
                                        >
                                            複製
                                        </button>
                                    </div>
                                </div>

                                <div className="p-3 bg-sky-950/40 rounded-lg border border-sky-800/40 space-y-1 text-[11px] text-sky-200/90">
                                    <div className="font-bold flex items-center gap-1.5 text-sky-300">
                                        <i className="fa-solid fa-circle-info"></i>
                                        <span>社群預覽卡片 (Open Graph) 已生效</span>
                                    </div>
                                    <p className="leading-relaxed text-zinc-400">
                                        將此連結直接貼至 <strong>LINE、Facebook、WhatsApp、WeChat</strong>，受眾視窗會自動呈現此卡片的自訂標題、封面圖與祝福摘要！
                                    </p>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <a
                                        href={cloudShareModal.shareUrl}
                                        target="_blank"
                                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors"
                                    >
                                        <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                                        <span>親自體驗播放</span>
                                    </a>
                                    <button
                                        onClick={() => setCloudShareModal(null)}
                                        className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded text-xs shadow-lg transition-all"
                                    >
                                        關閉完成
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* MODAL 3: 模板細部自訂與 3D 特效微調彈窗 */}
            {/* ========================================================= */}
            {editingTemplateModal && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
                                <h3 className="font-bold text-white text-base">
                                    自訂設計模板規格：{editingTemplateModal.name}
                                </h3>
                            </div>
                            <button
                                onClick={() => setEditingTemplateModal(null)}
                                className="text-zinc-400 hover:text-white"
                            >
                                <i className="fa-solid fa-xmark text-lg"></i>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-1 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-zinc-400 mb-1">模板名稱</label>
                                    <input
                                        type="text"
                                        value={editingTemplateModal.name || ''}
                                        onChange={e => setEditingTemplateModal({ ...editingTemplateModal, name: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-zinc-400 mb-1">版型佈局架構 (Layout)</label>
                                    <select
                                        value={editingTemplateModal.layout || 'star-wars-crawl'}
                                        onChange={e => setEditingTemplateModal({ ...editingTemplateModal, layout: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white"
                                    >
                                        <option value="star-wars-crawl">星戰漫遊升空 (Star Wars Crawl)</option>
                                        <option value="boxed-card">精裝方盒卡片 (Boxed Card)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-zinc-400 mb-1">背景 3D WebGL Shader</label>
                                    <select
                                        value={editingTemplateModal.bgShader || 'none'}
                                        onChange={e => setEditingTemplateModal({ ...editingTemplateModal, bgShader: e.target.value })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono"
                                    >
                                        <option value="none">none (純相片/深色漸層)</option>
                                        <option value="silk-smoke">silk-smoke (極致黑金流光絲綢)</option>
                                        <option value="particle-orbit">particle-orbit (3D 粒子星球巡航)</option>
                                        <option value="cyber-grid">cyber-grid (賽博空間網格全息)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-zinc-400 mb-1">3D 前景粒子特效群 (Particles)</label>
                                    <select
                                        value={editingTemplateModal.effects?.particleType || 'none'}
                                        onChange={e => setEditingTemplateModal({
                                            ...editingTemplateModal,
                                            effects: { ...(editingTemplateModal.effects || {}), particleType: e.target.value }
                                        })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono"
                                    >
                                        <option value="none">none (純淨無粒子)</option>
                                        <option value="sakura-canvas">sakura-canvas (3D 飄落翻轉櫻花)</option>
                                        <option value="rising-stardust">rising-stardust (金光升騰星塵)</option>
                                        <option value="orbital-satellites">orbital-satellites (軌道衛星光跡)</option>
                                        <option value="blackhole-vortex">blackhole-vortex (黑洞渦流引力)</option>
                                        <option value="meteor-shower">meteor-shower (掠過流星雨)</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-zinc-400 mb-1">主色調 (Primary)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={editingTemplateModal.theme?.primaryColor || '#c9a96e'}
                                            onChange={e => setEditingTemplateModal({
                                                ...editingTemplateModal,
                                                theme: { ...(editingTemplateModal.theme || {}), primaryColor: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={editingTemplateModal.theme?.primaryColor || '#c9a96e'}
                                            onChange={e => setEditingTemplateModal({
                                                ...editingTemplateModal,
                                                theme: { ...(editingTemplateModal.theme || {}), primaryColor: e.target.value }
                                            })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-white font-mono text-[11px]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-zinc-400 mb-1">強調色 (Accent)</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={editingTemplateModal.theme?.accentColor || '#fbbf24'}
                                            onChange={e => setEditingTemplateModal({
                                                ...editingTemplateModal,
                                                theme: { ...(editingTemplateModal.theme || {}), accentColor: e.target.value }
                                            })}
                                            className="w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={editingTemplateModal.theme?.accentColor || '#fbbf24'}
                                            onChange={e => setEditingTemplateModal({
                                                ...editingTemplateModal,
                                                theme: { ...(editingTemplateModal.theme || {}), accentColor: e.target.value }
                                            })}
                                            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-white font-mono text-[11px]"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-zinc-400 mb-1">漫遊升空速度 (Speed)</label>
                                    <input
                                        type="number"
                                        value={editingTemplateModal.crawlSpeed || 44}
                                        onChange={e => setEditingTemplateModal({ ...editingTemplateModal, crawlSpeed: parseInt(e.target.value) || 40 })}
                                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
                            <button
                                onClick={() => setEditingTemplateModal(null)}
                                className="px-4 py-2 rounded text-xs text-zinc-400 hover:text-white"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => handleSaveTemplateModal(editingTemplateModal)}
                                className="px-5 py-2 rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-lg transition-all"
                            >
                                保存模板規格
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<CardForgeApp />);
