/**
 * js/workspace_views.js - CardForge 視圖組件庫
 * 包含：彈窗組件 (PreviewModal, CloudShareModal)、導覽列 (WorkspaceNavbar)、大畫廊展示 (CardsGallery, TemplatesGallery)
 * 零編譯純 JS，使用 React.createElement 構建，完全不含 JSX 語法
 * 保證在 file:/// 本地協議下 100% 零 CORS 阻擋秒載入
 */

(function (window) {
    'use strict';

    const h = React.createElement;

    // =========================================================================
    // 1. 彈窗組件：預覽彈窗 (PreviewModal)
    // =========================================================================
    function PreviewModal({ modalCard, onClose, onCloudPublish }) {
        if (!modalCard) return null;

        return h('div', {
            className: 'fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4'
        },
            h('div', { className: 'absolute top-4 right-4 z-20 flex items-center gap-3' },
                h('button', {
                    onClick: () => onCloudPublish(modalCard.card),
                    className: 'px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all'
                },
                    h('i', { className: 'fa-solid fa-cloud-arrow-up' }),
                    h('span', null, '發布雲端短網址')
                ),
                h('button', {
                    onClick: onClose,
                    className: 'w-10 h-10 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors text-base'
                },
                    h('i', { className: 'fa-solid fa-xmark' })
                )
            ),
            h('div', {
                className: 'w-full max-w-sm h-[85vh] max-h-[720px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-700/60 relative bg-black'
            },
                window.CardEngine ? h(window.CardEngine, {
                    card: modalCard.card,
                    template: modalCard.template
                }) : null
            )
        );
    }

    // =========================================================================
    // 2. 彈窗組件：雲端分享與社群分發彈窗 (CloudShareModal - 升級 VIP 兩行式分發與 WhatsApp 喚醒)
    // =========================================================================
    function CloudShareModal({ shareModal, onClose, onShowToast }) {
        if (!shareModal) return null;

        // 安全取得當前卡片物件與基礎分享連結 (防禦保底為空物件與空字串)
        const card = shareModal.card || {};
        const baseShareUrl = shareModal.shareUrl || '';

        // 網域列表 (從全域配置讀取，若無則保底兩大自訂網域)
        const availableDomains = (window.CardForgeConfig && window.CardForgeConfig.SHARE_DOMAINS) || [
            { label: "🍵 Teaforia 精品品牌 (card.teaforia.in)", value: "https://card.teaforia.in" },
            { label: "🏢 Foxlink 企業商務 (card.foxlink.co.in)", value: "https://card.foxlink.co.in" }
        ];

        // 讀取上次記憶偏好網域
        const [selectedDomain, setSelectedDomain] = React.useState(() => {
            try {
                const saved = localStorage.getItem('cardforge_preferred_domain');
                if (saved && availableDomains.some(d => d.value === saved)) return saved;
            } catch (e) {}
            return availableDomains[0].value;
        });

        const handleDomainChange = (newDom) => {
            setSelectedDomain(newDom);
            try {
                localStorage.setItem('cardforge_preferred_domain', newDom);
            } catch (e) {}
        };

        // 智能探測卡片默認前綴 (中文默認親愛的 / 英文默認Dear)
        const defaultDetectedPrefix = React.useMemo(() => {
            const rawRec = (card.recipient || '').trim();
            if (rawRec.startsWith('尊敬的')) return '尊敬的';
            if (rawRec.startsWith('致')) return '致';
            if (rawRec.startsWith('Dear') || /^[a-zA-Z]/.test(rawRec)) return 'Dear';
            return '親愛的';
        }, [card.recipient]);

        const [recipientPrefix, setRecipientPrefix] = React.useState(defaultDetectedPrefix);
        const [recipientName, setRecipientName] = React.useState('');

        // 計算完整稱謂與標點 (例如: Dear Danny, 或 尊敬的 王總： 或 親愛的 小美：)
        const computedFullRecipient = React.useMemo(() => {
            const trimmedName = recipientName.trim();
            if (!trimmedName) return '';

            if (!recipientPrefix || recipientPrefix === 'none') {
                return trimmedName;
            }
            if (recipientPrefix === 'Dear') {
                return `Dear ${trimmedName},`;
            }
            if (recipientPrefix === '致') {
                return `致 ${trimmedName}：`;
            }
            if (recipientPrefix === '尊敬的') {
                return `尊敬的 ${trimmedName}：`;
            }
            return `親愛的 ${trimmedName}：`;
        }, [recipientPrefix, recipientName]);

        // 計算專屬帶參 URL (根據選中的分發網域切換，並帶入 ?to=...)
        const finalShareUrl = React.useMemo(() => {
            if (!baseShareUrl) return '';
            
            // 將原本網址的 origin/base 替換為使用者選中的特定自訂域名
            let urlToUse = baseShareUrl;
            if (selectedDomain) {
                try {
                    const parsed = new URL(baseShareUrl);
                    const chosen = new URL(selectedDomain);
                    urlToUse = `${chosen.origin}${parsed.pathname === '/' ? '' : parsed.pathname}${parsed.search}`;
                } catch (e) {
                    urlToUse = baseShareUrl;
                }
            }

            const toVal = computedFullRecipient || recipientName.trim();
            if (!toVal) return urlToUse;
            const sep = urlToUse.includes('?') ? '&' : '?';
            return `${urlToUse}${sep}to=${encodeURIComponent(toVal)}`;
        }, [baseShareUrl, selectedDomain, computedFullRecipient, recipientName]);

        // 計算兩行式分享訊息 (社群導語首句智能拼接對象稱呼)
        const fullShareMessage = React.useMemo(() => {
            const rawCaption = card.shareCaption || '{name}，佳節愉快！這是一張為你特別定製的 3D 星空賀卡，祝你一切順心：';
            
            // 決定導語開頭顯示的對象呼喚 (例如: Dear Danny, 或 王總， 或 親愛的 Danny，)
            let saluteText = '朋友，';
            const trimmedName = recipientName.trim();
            if (trimmedName) {
                if (recipientPrefix === 'Dear') {
                    saluteText = `Dear ${trimmedName}, `;
                } else if (recipientPrefix === '尊敬的') {
                    saluteText = `尊敬的 ${trimmedName}，`;
                } else if (recipientPrefix === '致') {
                    saluteText = `致 ${trimmedName}，`;
                } else if (recipientPrefix === '親愛的') {
                    saluteText = `親愛的 ${trimmedName}，`;
                } else {
                    saluteText = `${trimmedName}，`;
                }
            }

            let formattedCaption = '';
            if (rawCaption.includes('{name}，') || rawCaption.includes('{name},')) {
                formattedCaption = rawCaption.replace(/\{name\}[，,]/g, saluteText);
            } else if (rawCaption.includes('{name}')) {
                formattedCaption = rawCaption.replace(/\{name\}/g, trimmedName || '朋友');
            } else {
                formattedCaption = `${saluteText}${rawCaption}`;
            }

            return `${formattedCaption}\n${finalShareUrl}`;
        }, [card.shareCaption, recipientPrefix, recipientName, finalShareUrl]);

        // 複製純網址
        const handleCopyUrlOnly = () => {
            navigator.clipboard.writeText(finalShareUrl);
            onShowToast('已複製卡片連結！');
        };

        // 複製完整兩行式訊息 (導語 + 網址)
        const handleCopyFullMessage = () => {
            navigator.clipboard.writeText(fullShareMessage);
            onShowToast('🎉 已複製【社群導語 + 連結】兩行訊息！');
        };

        // 喚醒 WhatsApp 發送
        const handleOpenWhatsApp = () => {
            const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareMessage)}`;
            window.open(waUrl, '_blank');
        };

        return h('div', {
            className: 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cloud-toast'
        },
            h('div', {
                className: 'bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar'
            },
                h('div', { className: 'flex items-center justify-between' },
                    h('div', { className: 'flex items-center gap-2.5' },
                        h('span', {
                            className: 'w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold border border-sky-500/30'
                        }, h('i', { className: 'fa-solid fa-share-nodes' })),
                        h('div', null,
                            h('h3', { className: 'font-bold text-white text-base' }, '賀卡社群分發台 (VIP Share)'),
                            h('p', { className: 'text-[11px] text-zinc-400' }, '免 Git Commit ✕ 中英敬語切換 ✕ 自適應姓名 ✕ 一鍵發送')
                        )
                    ),
                    h('button', {
                        onClick: onClose,
                        className: 'text-zinc-400 hover:text-white text-lg p-1'
                    }, h('i', { className: 'fa-solid fa-xmark' }))
                ),

                shareModal.isSaving ? h('div', {
                    className: 'py-8 flex flex-col items-center justify-center space-y-3'
                },
                    h('i', { className: 'fa-solid fa-circle-notch fa-spin text-3xl text-sky-400' }),
                    h('p', { className: 'text-xs text-zinc-300 font-medium' }, shareModal.statusText)
                ) : h('div', { className: 'space-y-4' },
                    
                    // 雲端降級或保底狀態橫幅 (若存在提示)
                    (shareModal.statusText && (shareModal.isError || shareModal.statusText.includes('保底'))) ? h('div', {
                        className: 'p-2.5 bg-amber-950/40 border border-amber-600/40 rounded-lg flex items-center gap-2 text-xs text-amber-200'
                    },
                        h('i', { className: 'fa-solid fa-triangle-exclamation text-amber-400 text-sm shrink-0' }),
                        h('span', { className: 'leading-tight text-[11px]' }, shareModal.statusText)
                    ) : null,

                    // 0. 分發網域切換 (Teaforia 品牌 / Foxlink 商務)
                    h('div', { className: 'p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5' },
                        h('div', { className: 'flex items-center justify-between text-xs' },
                            h('span', { className: 'text-zinc-300 font-medium flex items-center gap-1.5' },
                                h('i', { className: 'fa-solid fa-globe text-amber-400' }),
                                h('span', null, '分發網域 (Share Domain)')
                            ),
                            h('span', { className: 'text-[10px] text-zinc-500 font-mono' }, '自動記憶您的選擇')
                        ),
                        h('select', {
                            value: selectedDomain,
                            onChange: e => handleDomainChange(e.target.value),
                            className: 'w-full bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-400 cursor-pointer font-medium'
                        },
                            availableDomains.map(d => h('option', { key: d.value, value: d.value }, d.label))
                        )
                    ),

                    // 1. 指定收件好友姓名與前綴禮貌切換
                    h('div', { className: 'p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-2' },
                        h('div', { className: 'flex items-center justify-between text-xs' },
                            h('span', { className: 'text-zinc-300 font-medium flex items-center gap-1.5' },
                                h('i', { className: 'fa-solid fa-user-tag text-sky-400' }),
                                h('span', null, '為特定朋友量身定做 (選填)')
                            ),
                            h('span', { className: 'text-[10px] text-zinc-500' }, '留空則使用預設稱謂')
                        ),
                        h('div', { className: 'flex items-center gap-2' },
                            // 前綴禮貌敬稱選擇 (親愛的/尊敬的/致/Dear/無)
                            h('select', {
                                value: recipientPrefix,
                                onChange: e => setRecipientPrefix(e.target.value),
                                className: 'bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-sky-300 font-medium text-xs outline-none focus:border-sky-400 cursor-pointer shrink-0'
                            },
                                h('option', { value: '親愛的' }, '親愛的 (平輩/朋友)'),
                                h('option', { value: '尊敬的' }, '尊敬的 (長輩/主管)'),
                                h('option', { value: '致' }, '致 (正式/商務)'),
                                h('option', { value: 'Dear' }, 'Dear (英文/國際)'),
                                h('option', { value: 'none' }, '直呼稱呼 (無前綴)')
                            ),
                            // 好友名字輸入框
                            h('input', {
                                type: 'text',
                                value: recipientName,
                                onChange: e => setRecipientName(e.target.value),
                                placeholder: recipientPrefix === 'Dear' ? '輸入英文名，如 Danny, Summer' : (recipientPrefix === '尊敬的' ? '輸入職稱或長輩，如 王總、陳伯伯' : '輸入名字或稱呼，如 阿強、Eva'),
                                className: 'flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-sky-400'
                            }),
                            recipientName ? h('button', {
                                onClick: () => setRecipientName(''),
                                className: 'px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200 shrink-0'
                            }, '清除') : null
                        ),
                        // 即時呈現計算後的卡片內稱謂預覽
                        recipientName.trim() ? h('div', { className: 'text-[11px] text-zinc-400 flex items-center gap-1.5 pt-0.5' },
                            h('i', { className: 'fa-solid fa-arrow-right text-[10px] text-sky-400' }),
                            h('span', null, '卡片內稱謂將自適應為：'),
                            h('span', { className: 'text-sky-300 font-semibold font-mono' }, computedFullRecipient)
                        ) : null
                    ),

                    // 2. 兩行式訊息即時預覽盒
                    h('div', { className: 'p-3 bg-zinc-950/80 rounded-lg border border-sky-900/40 space-y-2 text-xs' },
                        h('div', { className: 'flex items-center justify-between' },
                            h('span', { className: 'text-zinc-400 flex items-center gap-1.5 text-[11px]' },
                                h('i', { className: 'fa-solid fa-comment-dots text-emerald-400' }),
                                h('span', null, '準備發送的兩行式訊息預覽：')
                            ),
                            h('span', { className: 'text-[10px] text-emerald-400 font-mono' }, '自動帶參')
                        ),
                        h('div', {
                            className: 'p-2.5 bg-zinc-900/90 rounded border border-zinc-800 text-zinc-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed select-all'
                        }, fullShareMessage),
                        h('div', { className: 'flex flex-wrap items-center gap-2 pt-1' },
                            h('button', {
                                onClick: handleCopyFullMessage,
                                className: 'flex-1 py-2 px-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded text-xs flex items-center justify-center gap-1.5 shadow transition-all active:scale-95'
                            },
                                h('i', { className: 'fa-solid fa-copy' }),
                                h('span', null, '一鍵複製【導語 + 網址】')
                            ),
                            h('button', {
                                onClick: handleOpenWhatsApp,
                                className: 'py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs flex items-center gap-1.5 shadow transition-all active:scale-95'
                            },
                                h('i', { className: 'fa-brands fa-whatsapp text-sm' }),
                                h('span', null, '發送 WhatsApp')
                            )
                        )
                    ),

                    // 3. 社群圖文預覽提示
                    h('div', {
                        className: 'p-3 bg-sky-950/30 rounded-lg border border-sky-800/30 space-y-1 text-[11px] text-sky-200/90'
                    },
                        h('div', { className: 'font-bold flex items-center gap-1.5 text-sky-300' },
                            h('i', { className: 'fa-solid fa-circle-check text-sky-400' }),
                            h('span', null, '社群預覽卡片 (Open Graph) 已生效')
                        ),
                        h('p', { className: 'leading-relaxed text-zinc-400' },
                            '此連結貼至 ',
                            h('strong', { className: 'text-zinc-300' }, 'LINE、WhatsApp、Facebook'),
                            '，對話框會自動抓取卡片自訂標題、封面圖與導語摘要！'
                        )
                    ),

                    // 4. 底部動作列
                    h('div', { className: 'flex items-center justify-between pt-2 border-t border-zinc-800' },
                        h('button', {
                            onClick: handleCopyUrlOnly,
                            className: 'text-zinc-400 hover:text-sky-300 text-[11px] flex items-center gap-1'
                        },
                            h('i', { className: 'fa-solid fa-link text-[10px]' }),
                            h('span', null, '僅複製純網址')
                        ),
                        h('div', { className: 'flex items-center gap-2' },
                            h('a', {
                                href: finalShareUrl,
                                target: '_blank',
                                className: 'px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors'
                            },
                                h('i', { className: 'fa-solid fa-arrow-up-right-from-square text-[10px]' }),
                                h('span', null, '親自體驗')
                            ),
                            h('button', {
                                onClick: onClose,
                                className: 'px-4 py-1.5 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded text-xs transition-all'
                            }, '完成')
                        )
                    )
                )
            )
        );
    }

    // =========================================================================
    // 3. 導覽列組件 (WorkspaceNavbar)
    // =========================================================================
    function WorkspaceNavbar({
        currentView,
        setCurrentView,
        activeGalleryTab,
        setActiveGalleryTab,
        cardsCount,
        templatesCount,
        editingTemplate,
        setEditingTemplate,
        currentEditingCard,
        editorPreviewDevice,
        setEditorPreviewDevice,
        onSaveTemplate,
        onSaveCard,
        onCloudPublish,
        onExportAllJSON,
        syncStatus,
        onForceSync
    }) {
        const isGallery = currentView === 'gallery';
        const isTplEditor = currentView === 'template_editor';

        return h('header', {
            className: 'h-14 border-b border-zinc-800/80 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-50 shadow-md'
        },
            // Brand Logo
            h('div', { className: 'flex items-center gap-3' },
                h('span', {
                    className: 'w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-zinc-950 font-black text-xs shadow'
                }, 'CF'),
                h('div', null,
                    h('div', { className: 'flex items-center gap-2' },
                        h('span', { className: 'font-bold tracking-wide text-sm text-white' }, 'CardForge Studio'),
                        h('span', {
                            className: 'px-1.5 py-0.5 rounded text-[10px] bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono'
                        }, '3D Canvas + Cloud SSOT')
                    ),
                    h('div', { className: 'text-[10px] text-zinc-500' }, '免 Git Commit ✕ 社交動態預覽 ✕ 雙軌賀卡工坊')
                )
            ),

            // Middle Navigation / Back Buttons
            isGallery ? h('nav', {
                className: 'flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-1 text-xs'
            },
                h('button', {
                    onClick: () => setActiveGalleryTab('cards'),
                    className: `px-4 py-1.5 rounded-md flex items-center gap-2 font-medium transition-all ${activeGalleryTab === 'cards' ? 'bg-amber-400 text-zinc-950 font-bold shadow' : 'text-zinc-400 hover:text-white'}`
                },
                    h('i', { className: 'fa-solid fa-address-card' }),
                    h('span', null, `卡片管理 (${cardsCount})`)
                ),
                h('button', {
                    onClick: () => setActiveGalleryTab('templates'),
                    className: `px-4 py-1.5 rounded-md flex items-center gap-2 font-medium transition-all ${activeGalleryTab === 'templates' ? 'bg-indigo-500 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'}`
                },
                    h('i', { className: 'fa-solid fa-wand-magic-sparkles' }),
                    h('span', null, `模板管理 (${templatesCount})`)
                )
            ) : isTplEditor ? h('div', { className: 'flex items-center gap-3' },
                h('button', {
                    onClick: () => {
                        setEditingTemplate(null);
                        setCurrentView('gallery');
                    },
                    className: 'px-4 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-indigo-400 hover:bg-zinc-800 text-indigo-300 font-bold text-xs flex items-center gap-2 shadow transition-all',
                    title: '已實時自動儲存，點擊返回模板庫'
                },
                    h('i', { className: 'fa-solid fa-arrow-left' }),
                    h('span', null, '保存並返回模板庫')
                ),
                h('span', { className: 'text-zinc-500 text-xs' }, '|'),
                h('span', { className: 'text-xs text-zinc-300 font-medium hidden sm:inline' },
                    '正在設計模板：',
                    h('span', { className: 'text-indigo-300 font-bold' }, editingTemplate?.name)
                )
            ) : h('div', { className: 'flex items-center gap-3' },
                h('button', {
                    onClick: () => {
                        if (typeof onSaveCard === 'function') {
                            onSaveCard();
                        } else {
                            setCurrentView('gallery');
                        }
                    },
                    className: 'px-4 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-amber-400 hover:bg-zinc-800 text-amber-300 font-bold text-xs flex items-center gap-2 shadow transition-all',
                    title: '保存修改並同步雲端，返回卡片庫'
                },
                    h('i', { className: 'fa-solid fa-cloud-arrow-up' }),
                    h('span', null, '保存並返回卡片庫')
                ),
                h('span', { className: 'text-zinc-500 text-xs' }, '|'),
                h('span', { className: 'text-xs text-zinc-300 font-medium hidden sm:inline' },
                    '正在編輯：',
                    h('span', { className: 'text-amber-300 font-bold' }, currentEditingCard?.name)
                )
            ),

            // Right Actions
            h('div', { className: 'flex items-center gap-3' },
                // Preview Device Switcher
                (!isGallery) ? h('div', {
                    className: 'flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 px-2.5 py-1 rounded-full text-xs shadow-inner'
                },
                    h('span', { className: 'text-zinc-400 text-[11px] font-mono pl-1 hidden md:inline' }, '視角：'),
                    h('button', {
                        type: 'button',
                        onClick: () => setEditorPreviewDevice('mobile'),
                        className: `px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all text-xs ${editorPreviewDevice === 'mobile' ? (isTplEditor ? 'bg-indigo-500 text-white font-bold shadow' : 'bg-amber-400 text-zinc-950 font-bold shadow') : 'text-zinc-400 hover:text-white'}`
                    },
                        h('i', { className: 'fa-solid fa-mobile-screen text-[10px]' }),
                        h('span', null, '手機')
                    ),
                    h('button', {
                        type: 'button',
                        onClick: () => setEditorPreviewDevice('desktop'),
                        className: `px-2.5 py-0.5 rounded-full flex items-center gap-1 transition-all text-xs ${editorPreviewDevice === 'desktop' ? (isTplEditor ? 'bg-indigo-500 text-white font-bold shadow' : 'bg-amber-400 text-zinc-950 font-bold shadow') : 'text-zinc-400 hover:text-white'}`
                    },
                        h('i', { className: 'fa-solid fa-desktop text-[10px]' }),
                        h('span', null, '桌面寬屏')
                    )
                ) : null,

                // 雲端即時差異同步狀態燈 (Sync Status Badge)
                h('button', {
                    type: 'button',
                    onClick: () => {
                        if (typeof onForceSync === 'function') onForceSync();
                    },
                    className: 'flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono select-none transition-colors hover:border-zinc-700 cursor-pointer',
                    title: syncStatus === 'syncing' ? '正在背景批量差異同步至 Google Sheet SSOT...' : (syncStatus === 'synced' ? '雲端資料庫已同步最新版 (點擊可立即重檢)' : '暫時本機保底，連線後自動補發 (點擊可立即重試)')
                },
                    syncStatus === 'syncing' ? h('i', { className: 'fa-solid fa-arrows-rotate fa-spin text-sky-400 text-[10px]' }) :
                    syncStatus === 'offline' ? h('span', { className: 'w-2 h-2 rounded-full bg-amber-400 animate-pulse' }) :
                    h('span', { className: 'w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' }),
                    h('span', {
                        className: syncStatus === 'syncing' ? 'text-sky-300' : (syncStatus === 'offline' ? 'text-amber-300' : 'text-zinc-400')
                    }, syncStatus === 'syncing' ? '同步中' : (syncStatus === 'offline' ? '離線保底(點擊重試)' : '已同步'))
                ),

                isTplEditor && editingTemplate ? h('button', {
                    onClick: onSaveTemplate,
                    className: 'px-4 py-1.5 text-xs rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all border border-indigo-400/40 cursor-pointer',
                    title: '保存當前模板視覺與 3D 特效規格'
                },
                    h('i', { className: 'fa-solid fa-floppy-disk' }),
                    h('span', null, '保存模板')
                ) : null,

                (!isGallery && !isTplEditor) ? h('button', {
                    onClick: onCloudPublish,
                    className: 'px-3.5 py-1.5 text-xs rounded bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all border border-sky-400/30 cursor-pointer',
                    title: '取得社群預覽分享短網址與 WhatsApp 專屬導語'
                },
                    h('i', { className: 'fa-solid fa-share-nodes text-[11px]' }),
                    h('span', null, '分享卡片')
                ) : null
            )
        );
    }

    // =========================================================================
    // 4. 大畫廊組件 (CardsGallery)
    // =========================================================================
    function CardsGallery({ cards, templates, onCreateCard, onDuplicateCard, onDeleteCard, onPreviewCard, onEditCard, onCloudPublish }) {
        return h('section', null,
            h('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6' },
                h('div', null,
                    h('h2', { className: 'text-xl font-bold text-white flex items-center gap-2' },
                        h('span', null, '我的賀卡庫 (Cards Gallery)')
                    ),
                    h('p', { className: 'text-xs text-zinc-400 mt-1' },
                        '管理與自訂送給親友或夥伴的專屬卡片。支援免 Commit 一鍵雲端發布、動態社交預覽與複製短網址。'
                    )
                ),
                h('button', {
                    onClick: onCreateCard,
                    className: 'px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-2 shadow-lg transition-all self-start sm:self-auto'
                },
                    h('i', { className: 'fa-solid fa-plus' }),
                    h('span', null, '新增卡片')
                )
            ),
            h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
                cards.map(c => {
                    const appliedTpl = templates.find(t => t.id === c.templateId) || templates[0];
                    return h('div', {
                        key: c.id,
                        className: 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all hover:bg-zinc-900/90 group'
                    },
                        h('div', null,
                            h('div', { className: 'flex items-center justify-between text-[11px] text-zinc-400 mb-2' },
                                h('span', { className: 'px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-medium border border-zinc-700/60' },
                                    c.category === 'business' ? '商務夥伴' : c.category === 'festive' ? '節慶祝賀' : '個人親友'
                                ),
                                h('span', { className: 'font-mono text-zinc-500' }, c.updatedAt)
                            ),
                            h('h3', { className: 'text-base font-bold text-white group-hover:text-amber-300 transition-colors' },
                                c.name
                            ),
                            h('div', { className: 'text-xs text-amber-200/80 font-medium mt-1' },
                                c.title || '無標題'
                            ),
                            h('div', { className: 'mt-3 p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 space-y-1.5 text-xs text-zinc-300' },
                                h('div', { className: 'text-zinc-400 font-medium' }, c.recipient || '致 受贈者：'),
                                h('div', { className: 'text-zinc-400/90 line-clamp-2 leading-relaxed text-[11px]' },
                                    c.paragraphs && c.paragraphs[0] ? c.paragraphs[0] : '尚無內文...'
                                )
                            ),
                            h('div', { className: 'mt-3 flex items-center gap-2 text-[11px] text-zinc-400' },
                                h('span', null, '套用風格：'),
                                h('span', { className: 'font-semibold text-amber-400/90' }, appliedTpl ? appliedTpl.name : '預設模板')
                            )
                        ),
                        h('div', { className: 'mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between' },
                            h('div', { className: 'flex items-center gap-1.5' },
                                h('button', {
                                    onClick: () => onPreviewCard(c, appliedTpl),
                                    className: 'px-2.5 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 transition-colors',
                                    title: '預覽卡片效果'
                                },
                                    h('i', { className: 'fa-regular fa-eye text-[11px]' }),
                                    h('span', null, '預覽')
                                ),
                                h('button', {
                                    onClick: () => onCloudPublish(c),
                                    className: 'px-2.5 py-1.5 rounded bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 text-xs flex items-center gap-1 transition-colors',
                                    title: '一鍵上傳 Google Sheet 並取得短網址'
                                },
                                    h('i', { className: 'fa-solid fa-cloud-arrow-up text-[10px]' }),
                                    h('span', null, '分享')
                                )
                            ),
                            h('div', { className: 'flex items-center gap-1' },
                                h('button', {
                                    onClick: () => onDuplicateCard(c),
                                    className: 'p-1.5 text-zinc-400 hover:text-white transition-colors',
                                    title: '複製卡片'
                                }, h('i', { className: 'fa-regular fa-copy' })),
                                h('button', {
                                    onClick: () => onEditCard(c.id),
                                    className: 'px-3 py-1.5 rounded bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1 shadow transition-all ml-1'
                                },
                                    h('i', { className: 'fa-solid fa-pen text-[10px]' }),
                                    h('span', null, '編輯')
                                ),
                                h('button', {
                                    onClick: () => onDeleteCard(c.id, c.name),
                                    className: 'p-1.5 text-zinc-500 hover:text-rose-400 transition-colors ml-1',
                                    title: '刪除卡片'
                                }, h('i', { className: 'fa-regular fa-trash-can' }))
                            )
                        )
                    );
                })
            )
        );
    }

    // =========================================================================
    // 5. 模板庫大畫廊組件 (TemplatesGallery)
    // =========================================================================
    function TemplatesGallery({ templates, onCreateTemplate, onDuplicateTemplate, onDeleteTemplate, onPreviewTemplate, onEditTemplate }) {
        return h('section', null,
            h('div', { className: 'flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6' },
                h('div', null,
                    h('h2', { className: 'text-xl font-bold text-white flex items-center gap-2' },
                        h('span', null, '旗艦模板庫 (Templates Gallery)')
                    ),
                    h('p', { className: 'text-xs text-zinc-400 mt-1' },
                        '管理賀卡的外觀規格（3D WebGL Shader、粒子特效、字體與排版節奏）。'
                    )
                ),
                h('button', {
                    onClick: onCreateTemplate,
                    className: 'px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition-all self-start sm:self-auto'
                },
                    h('i', { className: 'fa-solid fa-plus' }),
                    h('span', null, '新增模板')
                )
            ),
            h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
                templates.map(t => {
                    const theme = t.theme || {};
                    return h('div', {
                        key: t.id,
                        className: 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between shadow-xl transition-all hover:bg-zinc-900/90 group'
                    },
                        h('div', null,
                            h('div', { className: 'flex items-center justify-between text-[11px] text-zinc-400 mb-2' },
                                h('span', { className: 'px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-medium border border-indigo-800/40' },
                                    t.layout === 'star-wars-crawl' ? '星戰漫遊' : '精裝方盒'
                                ),
                                h('span', { className: 'font-mono text-zinc-500 text-[10px]' }, `ID: ${t.id}`)
                            ),
                            h('h3', { className: 'text-base font-bold text-white group-hover:text-indigo-300 transition-colors' },
                                t.name
                            ),
                            h('p', { className: 'text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed' },
                                t.description || '無描述資訊'
                            ),
                            h('div', { className: 'mt-4 grid grid-cols-2 gap-2 text-[11px] text-zinc-400' },
                                h('div', { className: 'p-2 rounded bg-zinc-950/70 border border-zinc-800/80 flex items-center gap-2' },
                                    h('span', { className: 'w-2 h-2 rounded-full', style: { backgroundColor: theme.primaryColor || '#c9a96e' } }),
                                    h('span', { className: 'truncate' }, `主色: ${theme.primaryColor || '#c9a96e'}`)
                                ),
                                h('div', { className: 'p-2 rounded bg-zinc-950/70 border border-zinc-800/80 flex items-center gap-2' },
                                    h('span', { className: 'w-2 h-2 rounded-full', style: { backgroundColor: theme.accentColor || '#fbbf24' } }),
                                    h('span', { className: 'truncate' }, `強調: ${theme.accentColor || '#fbbf24'}`)
                                )
                            ),
                            h('div', { className: 'mt-2 p-2 rounded bg-zinc-950/40 border border-zinc-800/50 text-[10px] text-zinc-500 flex items-center justify-between font-mono' },
                                h('span', null, `Shader: ${t.bgShader || 'none'}`),
                                h('span', null, `Speed: ${t.crawlSpeed || 44}s`)
                            )
                        ),
                        h('div', { className: 'mt-5 pt-3 border-t border-zinc-800/80 flex items-center justify-between' },
                            h('button', {
                                onClick: () => onPreviewTemplate(t),
                                className: 'px-3 py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs flex items-center gap-1 transition-colors',
                                title: '全螢幕視覺預覽'
                            },
                                h('i', { className: 'fa-regular fa-eye text-[11px]' }),
                                h('span', null, '預覽規格')
                            ),
                            h('div', { className: 'flex items-center gap-1' },
                                h('button', {
                                    onClick: () => onDuplicateTemplate(t),
                                    className: 'p-1.5 text-zinc-400 hover:text-white transition-colors',
                                    title: '複製模板副本'
                                }, h('i', { className: 'fa-regular fa-copy' })),
                                h('button', {
                                    onClick: () => onEditTemplate(t),
                                    className: 'px-3 py-1.5 rounded bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs flex items-center gap-1 shadow transition-all ml-1'
                                },
                                    h('i', { className: 'fa-solid fa-sliders text-[10px]' }),
                                    h('span', null, '設計工坊')
                                ),
                                h('button', {
                                    onClick: () => onDeleteTemplate(t.id, t.name),
                                    className: 'p-1.5 text-zinc-500 hover:text-rose-400 transition-colors',
                                    title: '刪除模板'
                                }, h('i', { className: 'fa-regular fa-trash-can' }))
                            )
                        )
                    );
                })
            )
        );
    }

    // =========================================================================
    // 6. 君子密碼守衛門禁 (PasswordLockGate)
    // 零 JSX 原生 createElement，支援 Enter 送出、錯誤震動提示與本地記住狀態
    // =========================================================================
    function PasswordLockGate({ onUnlock }) {
        const [inputPass, setInputPass] = React.useState('');
        const [isError, setIsError] = React.useState(false);
        const [errMsg, setErrMsg] = React.useState('');

        const handleSubmit = (e) => {
            if (e) e.preventDefault();
            if (inputPass.trim() === '10101010') {
                try {
                    localStorage.setItem('cardforge_auth_unlocked', 'true');
                } catch (err) {}
                onUnlock();
            } else {
                setIsError(true);
                setErrMsg('密碼不正確，請重新輸入');
                setTimeout(() => setIsError(false), 2000);
            }
        };

        return h('div', {
            className: 'fixed inset-0 z-[999] bg-[#090a0f]/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 select-none'
        },
            // 中央卡片
            h('div', {
                className: `w-full max-w-sm bg-zinc-900/90 border ${isError ? 'border-rose-500/80 shadow-rose-950/40 animate-shake' : 'border-zinc-800/80'} rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center backdrop-blur-md transition-all`
            },
                // 品牌 Logo 圖示
                h('div', {
                    className: 'w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 flex items-center justify-center text-zinc-950 text-2xl shadow-xl shadow-amber-500/20 mb-5'
                },
                    h('i', { className: 'fa-solid fa-lock' })
                ),
                // 標題
                h('h2', { className: 'text-xl font-bold text-white tracking-wide mb-1' }, 'CardForge Studio'),
                h('p', { className: 'text-xs text-zinc-400 mb-6' }, '創作者工坊受君子密碼保護，請輸入通行碼'),

                // 密碼表單
                h('form', {
                    onSubmit: handleSubmit,
                    className: 'w-full flex flex-col gap-3'
                },
                    h('div', { className: 'relative w-full' },
                        h('input', {
                            type: 'password',
                            autoFocus: true,
                            value: inputPass,
                            onChange: (e) => {
                                setInputPass(e.target.value);
                                if (errMsg) setErrMsg('');
                            },
                            placeholder: '請輸入通行密碼...',
                            className: 'w-full px-4 py-3 bg-zinc-950/80 border border-zinc-700/80 rounded-xl text-center text-lg text-white font-mono tracking-widest placeholder:text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all'
                        })
                    ),
                    errMsg ? h('div', { className: 'text-rose-400 text-xs font-medium' }, errMsg) : null,
                    h('button', {
                        type: 'submit',
                        className: 'w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold rounded-xl text-sm shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 transition-all cursor-pointer'
                    },
                        h('i', { className: 'fa-solid fa-key text-xs' }),
                        h('span', null, '解鎖進入工坊')
                    )
                ),

                // 提示說明
                h('div', { className: 'mt-6 pt-4 border-t border-zinc-800/80 w-full flex items-center justify-between text-[11px] text-zinc-500' },
                    h('span', { className: 'flex items-center gap-1' },
                        h('i', { className: 'fa-solid fa-shield-halved text-amber-400/80' }),
                        h('span', null, '已啟用本地認證記憶')
                    ),
                    h('a', {
                        href: 'index.html?preview=1',
                        target: '_blank',
                        className: 'text-zinc-400 hover:text-amber-400 transition-colors flex items-center gap-1'
                    },
                        h('span', null, '受眾播放器'),
                        h('i', { className: 'fa-solid fa-arrow-up-right-from-square text-[9px]' })
                    )
                )
            )
        );
    }

    // 掛載至全域
    window.WorkspaceViews = {
        PreviewModal,
        CloudShareModal,
        WorkspaceNavbar,
        CardsGallery,
        TemplatesGallery,
        PasswordLockGate
    };

})(typeof window !== 'undefined' ? window : this);
