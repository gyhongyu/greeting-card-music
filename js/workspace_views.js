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
    // 2. 彈窗組件：雲端分享彈窗 (CloudShareModal)
    // =========================================================================
    function CloudShareModal({ shareModal, onClose, onShowToast }) {
        if (!shareModal) return null;

        return h('div', {
            className: 'fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cloud-toast'
        },
            h('div', {
                className: 'bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4'
            },
                h('div', { className: 'flex items-center justify-between' },
                    h('div', { className: 'flex items-center gap-2.5' },
                        h('span', {
                            className: 'w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-sm font-bold border border-sky-500/30'
                        }, h('i', { className: 'fa-solid fa-cloud-check' })),
                        h('div', null,
                            h('h3', { className: 'font-bold text-white text-base' }, '賀卡雲端分享已就緒'),
                            h('p', { className: 'text-[11px] text-zinc-400' }, '免 Git Commit ✕ 自動生成社群圖文預覽')
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
                    h('div', {
                        className: 'p-3 bg-zinc-950 rounded-lg border border-zinc-800 space-y-1.5 text-xs'
                    },
                        h('div', { className: 'text-zinc-400' }, '專屬短分享網址：'),
                        h('div', { className: 'flex items-center gap-2' },
                            h('input', {
                                type: 'text',
                                readOnly: true,
                                value: shareModal.shareUrl,
                                className: 'flex-1 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1.5 text-sky-300 text-xs font-mono outline-none'
                            }),
                            h('button', {
                                onClick: () => {
                                    navigator.clipboard.writeText(shareModal.shareUrl);
                                    onShowToast('已複製分享短網址！');
                                },
                                className: 'px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold rounded text-xs shrink-0 shadow'
                            }, '複製')
                        )
                    ),
                    h('div', {
                        className: 'p-3 bg-sky-950/40 rounded-lg border border-sky-800/40 space-y-1 text-[11px] text-sky-200/90'
                    },
                        h('div', { className: 'font-bold flex items-center gap-1.5 text-sky-300' },
                            h('i', { className: 'fa-solid fa-circle-info' }),
                            h('span', null, '社群預覽卡片 (Open Graph) 已生效')
                        ),
                        h('p', { className: 'leading-relaxed text-zinc-400' },
                            '將此連結直接貼至 ',
                            h('strong', null, 'LINE、Facebook、WhatsApp、WeChat'),
                            '，受眾視窗會自動呈現此卡片的自訂標題、封面圖與祝福摘要！'
                        )
                    ),
                    h('div', { className: 'flex items-center justify-end gap-2 pt-2' },
                        h('a', {
                            href: shareModal.shareUrl,
                            target: '_blank',
                            className: 'px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-medium flex items-center gap-1.5 transition-colors'
                        },
                            h('i', { className: 'fa-solid fa-arrow-up-right-from-square text-[10px]' }),
                            h('span', null, '親自體驗播放')
                        ),
                        h('button', {
                            onClick: onClose,
                            className: 'px-4 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded text-xs shadow-lg transition-all'
                        }, '關閉完成')
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
        onCloudPublish,
        onExportAllJSON
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
                    onClick: () => setCurrentView('gallery'),
                    className: 'px-4 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-amber-400 hover:bg-zinc-800 text-amber-300 font-bold text-xs flex items-center gap-2 shadow transition-all',
                    title: '已實時自動儲存，點擊返回卡片庫'
                },
                    h('i', { className: 'fa-solid fa-arrow-left' }),
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

                isTplEditor && editingTemplate ? h('button', {
                    onClick: onSaveTemplate,
                    className: 'px-4 py-1.5 text-xs rounded bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all border border-indigo-400/40',
                    title: '保存當前模板視覺與 3D 特效規格'
                },
                    h('i', { className: 'fa-solid fa-floppy-disk' }),
                    h('span', null, '保存模板規格')
                ) : null,

                (!isGallery && !isTplEditor) ? h('button', {
                    onClick: onCloudPublish,
                    className: 'px-3.5 py-1.5 text-xs rounded bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all border border-sky-400/30',
                    title: '儲存至 Google Sheet SSOT 並取得社群預覽分享短網址'
                },
                    h('i', { className: 'fa-solid fa-cloud-arrow-up' }),
                    h('span', null, '發布至雲端 (免 Commit)')
                ) : null,

                h('a', {
                    href: 'index.html',
                    target: '_blank',
                    className: 'px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20 transition-all'
                },
                    h('i', { className: 'fa-solid fa-play text-[10px]' }),
                    h('span', null, '開啟播放器')
                )
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

    // 掛載至全域
    window.WorkspaceViews = {
        PreviewModal,
        CloudShareModal,
        WorkspaceNavbar,
        CardsGallery,
        TemplatesGallery
    };

})(typeof window !== 'undefined' ? window : this);
