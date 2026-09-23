/**
 * js/editor_views.js - CardForge 編輯器視圖模組庫
 * 包含：卡片所見即所得編輯器 (CardEditorView)、模板設計工坊 (TemplateEditorView)
 * 零編譯純 JS，使用 React.createElement 構建，完全不含 JSX 語法
 * 保證在 file:/// 本地協議下 100% 零 CORS 阻擋秒載入
 */

(function (window) {
    'use strict';

    const h = React.createElement;

    // =========================================================================
    // 1. 卡片編輯器視圖組件 (CardEditorView)
    // =========================================================================
    function CardEditorView({
        currentEditingCard,
        currentEditingTemplate,
        templates,
        editorPreviewDevice,
        updateEditingCard,
        saveTemplates,
        setTemplates,
        handleImageUpload,
        uploadStatus,
        fileInputRef
    }) {
        if (!currentEditingCard) return null;

        const currentPhotos = currentEditingCard.media?.photos || [];
        const isMultiPhoto = currentPhotos.length > 1;

        return h('div', {
            className: 'flex-1 flex overflow-hidden',
            style: { height: 'calc(100vh - 56px)' }
        },
            // 左欄 (320px): 卡片基本與風格套用
            h('aside', {
                style: { width: '320px', minWidth: '320px', maxWidth: '320px' },
                className: 'border-r border-zinc-800/80 bg-zinc-950/70 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0 text-xs z-20'
            },
                h('div', null,
                    h('h3', { className: 'text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5' },
                        h('i', { className: 'fa-solid fa-sliders' }),
                        h('span', null, '卡片基本與風格套用')
                    ),
                    h('p', { className: 'text-[11px] text-zinc-500' }, '修改卡片名稱、分類，並隨選套用外觀模板。')
                ),

                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1' }, '內部識別名稱'),
                        h('input', {
                            type: 'text',
                            value: currentEditingCard.name || '',
                            onChange: e => updateEditingCard({ name: e.target.value }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400'
                        })
                    ),
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1' }, '卡片分類'),
                        h('select', {
                            value: currentEditingCard.category || 'personal',
                            onChange: e => updateEditingCard({ category: e.target.value }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400 cursor-pointer'
                        },
                            h('option', { value: 'personal' }, '個人親友 (personal)'),
                            h('option', { value: 'business' }, '商務夥伴 (business)'),
                            h('option', { value: 'festive' }, '節慶祝賀 (festive)')
                        )
                    )
                ),

                h('div', { className: 'flex-1 min-h-0 flex flex-col space-y-2 pt-2 border-t border-zinc-800' },
                    h('div', { className: 'flex items-center justify-between shrink-0' },
                        h('label', { className: 'text-zinc-300 font-semibold flex items-center gap-1.5' },
                            h('i', { className: 'fa-solid fa-wand-magic-sparkles text-amber-400' }),
                            h('span', null, '套用外觀模板 (即時套用)')
                        ),
                        currentEditingTemplate && (currentEditingTemplate.layout === 'cinematic-poster' || currentEditingTemplate.layout === 'fixed-card' || currentEditingTemplate.layout === 'boxed-card') ? (
                            h('button', {
                                type: 'button',
                                onClick: () => {
                                    setTemplates(prevTpls => prevTpls.map(t => t.id === currentEditingTemplate.id ? { ...t, replayKey: Date.now() } : t));
                                },
                                className: 'px-2 py-0.5 rounded bg-amber-950/50 hover:bg-amber-900/70 text-[10px] text-amber-300 border border-amber-600/40 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm',
                                title: '立即重播當前海報的文字入場動態'
                            },
                                h('i', { className: 'fa-solid fa-rotate-right text-[9px]' }),
                                h('span', null, '重播動效')
                            )
                        ) : null
                    ),
                    h('div', { className: 'flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-2' },
                        templates.map(t => {
                            const isSelected = t.id === currentEditingCard.templateId;
                            return h('button', {
                                key: t.id,
                                type: 'button',
                                onClick: () => updateEditingCard({ templateId: t.id }),
                                className: `w-full text-left p-2.5 rounded-lg border transition-all ${isSelected ? 'border-amber-400 bg-amber-400/10 shadow' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 hover:bg-zinc-900'}`
                            },
                                h('div', { className: 'flex items-center justify-between' },
                                    h('span', { className: `font-bold text-xs ${isSelected ? 'text-amber-300' : 'text-zinc-200'}` }, t.name),
                                    h('span', { className: 'text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700' }, t.bgShader || 'no-shader')
                                ),
                                h('div', { className: 'text-[10px] text-zinc-400 mt-1 line-clamp-1' }, `${t.effects?.particleType || 'none'} · ${t.layout}`)
                            );
                        })
                    )
                ),

                h('div', { className: 'shrink-0 pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500' },
                    h('div', { className: 'flex items-center gap-1.5' },
                        h('i', { className: 'fa-solid fa-cloud text-emerald-400 text-[10px]' }),
                        h('span', null, '實時自動儲存 (Auto-Saved)')
                    ),
                    h('span', { className: 'text-[10px] text-zinc-600 font-mono' }, '頂部統一操作')
                )
            ),

            // 中間 3D 渲染舞台 (置頂吸附導覽列底部，尺寸固定，獨立於左右滾動)
            // 綁定 key 確保視角切換時重新掛載並自適應最新尺寸，徹底終結拉伸變形
            h('section', { className: 'flex-1 bg-black/60 flex flex-col items-center justify-start pt-4 px-4 pb-2 relative overflow-hidden select-none' },
                h('div', {
                    key: `card-preview-frame-${editorPreviewDevice}`,
                    className: editorPreviewDevice === 'mobile' ? 'phone-frame' : 'desktop-frame'
                },
                    window.CardEngine ? h(window.CardEngine, {
                        card: currentEditingCard,
                        template: currentEditingTemplate
                    }) : null
                )
            ),

            // 右欄 (380px): 賀詞文案、媒體與字型排版
            h('aside', {
                style: { width: '380px', minWidth: '380px', maxWidth: '380px' },
                className: 'border-l border-zinc-800/80 bg-zinc-950/70 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0 text-xs z-20'
            },
                h('div', null,
                    h('h3', { className: 'text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5' },
                        h('i', { className: 'fa-solid fa-pen-nib' }),
                        h('span', null, '專屬賀詞文案與媒體配置')
                    ),
                    h('p', { className: 'text-[11px] text-zinc-500' }, '修改文字即刻在中間螢幕呈現渲染反饋。')
                ),

                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1' }, '主視覺標題 (Title)'),
                        h('input', {
                            type: 'text',
                            value: currentEditingCard.title || '',
                            onChange: e => updateEditingCard({ title: e.target.value }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400'
                        })
                    ),
                    // 收件人稱謂拆開：敬語前綴 (尊敬的/親愛的/XX的) + 好友稱呼 + 結尾標點
                    (() => {
                        const rawRec = currentEditingCard.recipient || '親愛的朋友：';
                        // 智能解析現有字串拆解為前綴、主體與標點
                        let prefix = '親愛的';
                        let mainName = '朋友';
                        let punct = '：';

                        const punctMatch = rawRec.match(/[：:，,！!]$/);
                        if (punctMatch) {
                            punct = punctMatch[0];
                        }
                        const cleanRec = punctMatch ? rawRec.slice(0, -1) : rawRec;

                        if (cleanRec.startsWith('尊敬的')) {
                            prefix = '尊敬的';
                            mainName = cleanRec.replace('尊敬的', '').trim();
                        } else if (cleanRec.startsWith('親愛的')) {
                            prefix = '親愛的';
                            mainName = cleanRec.replace('親愛的', '').trim();
                        } else if (cleanRec.startsWith('致 ')) {
                            prefix = '致';
                            mainName = cleanRec.replace('致 ', '').trim();
                        } else if (cleanRec.startsWith('Dear ')) {
                            prefix = 'Dear';
                            mainName = cleanRec.replace('Dear ', '').trim();
                        } else if (cleanRec.includes('的')) {
                            const idx = cleanRec.indexOf('的');
                            prefix = cleanRec.slice(0, idx + 1);
                            mainName = cleanRec.slice(idx + 1).trim();
                        } else {
                            prefix = '';
                            mainName = cleanRec.trim();
                        }

                        const updateCombinedRecipient = (newPfx, newName, newPunct) => {
                            const space = (newPfx && !newPfx.endsWith('的') && !newPfx.endsWith('致')) ? ' ' : '';
                            const combined = `${newPfx}${space}${newName}${newPunct}`;
                            updateEditingCard({ recipient: combined });
                        };

                        return h('div', { className: 'space-y-1.5' },
                            h('div', { className: 'flex items-center justify-between' },
                                h('label', { className: 'block text-zinc-400 text-xs font-medium' }, '收件人稱謂 (Recipient)'),
                                h('span', { className: 'text-[10px] text-zinc-500 font-mono' }, '稱呼留空則自動吃 {Name} 參數')
                            ),
                            h('div', { className: 'grid grid-cols-12 gap-2' },
                                // 1. 敬稱前綴 (親愛的/尊敬的/自訂)
                                h('div', { className: 'col-span-4' },
                                    h('input', {
                                        type: 'text',
                                        value: prefix,
                                        placeholder: '如: 親愛的',
                                        onChange: e => updateCombinedRecipient(e.target.value, mainName, punct),
                                        className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white text-xs outline-none focus:border-amber-400'
                                    })
                                ),
                                // 2. 稱呼本體 (留空或填朋友)
                                h('div', { className: 'col-span-6' },
                                    h('input', {
                                        type: 'text',
                                        value: mainName,
                                        placeholder: '留空自動支援URL參數',
                                        onChange: e => updateCombinedRecipient(prefix, e.target.value, punct),
                                        className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-amber-300 font-medium text-xs outline-none focus:border-amber-400'
                                    })
                                ),
                                // 3. 結尾標點 (： / : / ，)
                                h('div', { className: 'col-span-2' },
                                    h('select', {
                                        value: punct,
                                        onChange: e => updateCombinedRecipient(prefix, mainName, e.target.value),
                                        className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-1.5 py-1.5 text-white text-xs outline-none focus:border-amber-400 cursor-pointer text-center'
                                    },
                                        h('option', { value: '：' }, '：'),
                                        h('option', { value: ':' }, ':'),
                                        h('option', { value: '，' }, '，'),
                                        h('option', { value: '！' }, '！'),
                                        h('option', { value: '' }, '無')
                                    )
                                )
                            )
                        );
                    })(),
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1' }, '落款署名 (Sender / Signature)'),
                        h('textarea', {
                            rows: 2,
                            value: currentEditingCard.sender || '',
                            onChange: e => updateEditingCard({ sender: e.target.value }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-amber-400 resize-none font-sans'
                        })
                    )
                ),

                // 祝福段落
                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', { className: 'flex items-center justify-between' },
                        h('label', { className: 'text-zinc-400 font-medium' }, `祝福段落 (${currentEditingCard.paragraphs?.length || 0})`),
                        h('button', {
                            type: 'button',
                            onClick: () => {
                                const p = [...(currentEditingCard.paragraphs || []), '在此輸入新的感心賀詞...'];
                                updateEditingCard({ paragraphs: p });
                            },
                            className: 'text-amber-400 hover:text-amber-300 text-[11px] flex items-center gap-1'
                        },
                            h('i', { className: 'fa-solid fa-plus text-[10px]' }),
                            h('span', null, '增加段落')
                        )
                    ),
                    (currentEditingCard.paragraphs || []).map((para, idx) => (
                        h('div', { key: idx, className: 'relative group' },
                            h('textarea', {
                                rows: 3,
                                value: para,
                                onChange: e => {
                                    const updatedP = [...currentEditingCard.paragraphs];
                                    updatedP[idx] = e.target.value;
                                    updateEditingCard({ paragraphs: updatedP });
                                },
                                className: 'w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white outline-none focus:border-amber-400 text-xs resize-y'
                            }),
                            currentEditingCard.paragraphs.length > 1 ? (
                                h('button', {
                                    type: 'button',
                                    onClick: () => {
                                        const updatedP = currentEditingCard.paragraphs.filter((_, i) => i !== idx);
                                        updateEditingCard({ paragraphs: updatedP });
                                    },
                                    className: 'absolute top-2 right-2 p-1 text-zinc-500 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100',
                                    title: '刪除此段落'
                                },
                                    h('i', { className: 'fa-regular fa-trash-can text-[10px]' })
                                )
                            ) : null
                        )
                    ))
                ),

                // 背景相片展示與上傳
                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', { className: 'flex items-center justify-between' },
                        h('div', { className: 'flex items-center gap-1.5' },
                            h('label', { className: 'text-zinc-300 font-medium' }, '背景相片展示'),
                            h('span', {
                                className: `text-[10px] px-1.5 py-0.5 rounded font-mono ${!isMultiPhoto ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950/60 text-amber-400 border border-amber-800/40'}`
                            }, !isMultiPhoto ? '單張·Ken Burns慢鏡' : `${currentPhotos.length}張·5s輪播`)
                        ),
                        h('div', { className: 'flex items-center gap-2' },
                            h('button', {
                                type: 'button',
                                onClick: () => {
                                    const updatedPhotos = [...currentPhotos, 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=1200&q=80'];
                                    updateEditingCard({ media: { ...(currentEditingCard.media || {}), photos: updatedPhotos } });
                                },
                                className: 'text-zinc-400 hover:text-zinc-300 text-[11px] flex items-center gap-1',
                                title: '手動輸入照片網址'
                            },
                                h('i', { className: 'fa-solid fa-plus text-[10px]' }),
                                h('span', null, '加外鏈')
                            ),
                            h('button', {
                                type: 'button',
                                disabled: uploadStatus?.isUploading,
                                onClick: () => fileInputRef.current?.click(),
                                className: 'text-amber-400 hover:text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 transition-colors',
                                title: '極速壓縮轉 WebP 並直傳 ImgBB'
                            },
                                h('i', { className: 'fa-solid fa-cloud-arrow-up text-[10px]' }),
                                h('span', null, '上傳照片')
                            )
                        )
                    ),

                    // 💡 3D 視覺層疊提示：當前模板已有 3D Shader 時溫馨提醒
                    (currentEditingTemplate?.bgShader && currentEditingTemplate.bgShader !== 'none') ? (
                        h('div', { className: 'p-2 bg-amber-950/20 rounded border border-amber-900/30 text-[10px] text-amber-200/90 flex items-start gap-1.5 leading-relaxed' },
                            h('i', { className: 'fa-solid fa-lightbulb text-amber-400 mt-0.5 shrink-0' }),
                            h('span', null, '當前模板具備 3D 藝術背景（如明月/黑洞/金煙）。保持無相片可完整展現 3D 光影；若上傳相片將置於相片層優先展示。')
                        )
                    ) : null,

                    // 隱藏的 File Input
                    h('input', {
                        type: 'file',
                        ref: fileInputRef,
                        accept: 'image/*',
                        className: 'hidden',
                        onChange: e => {
                            if (e.target.files && e.target.files[0]) {
                                handleImageUpload(e.target.files[0]);
                            }
                        }
                    }),

                    // 圖片上傳拖曳提示框
                    h('div', {
                        onDragOver: e => { e.preventDefault(); e.stopPropagation(); },
                        onDrop: e => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                handleImageUpload(e.dataTransfer.files[0]);
                            }
                        },
                        onClick: () => !uploadStatus?.isUploading && fileInputRef.current?.click(),
                        className: 'border border-dashed border-zinc-700/80 hover:border-amber-400/60 bg-zinc-950/40 hover:bg-zinc-950/70 rounded-lg p-2.5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1'
                    },
                        uploadStatus?.isUploading ? (
                            h('div', { className: 'flex items-center gap-2 text-amber-400 font-medium py-1' },
                                h('i', { className: 'fa-solid fa-circle-notch fa-spin text-xs' }),
                                h('span', null, uploadStatus.message)
                            )
                        ) : (
                            h(React.Fragment, null,
                                h('div', { className: 'flex items-center gap-1.5 text-zinc-400 text-[11px]' },
                                    h('i', { className: 'fa-regular fa-image text-amber-400' }),
                                    h('span', null, '拖曳圖片至此，或點擊選圖上傳')
                                ),
                                h('div', { className: 'text-[10px] text-zinc-500' }, '⚡ 自動等比縮放 + WebP 80% 極致壓縮 ➔ 免塞 Git 直出 CDN 外鏈')
                            )
                        )
                    ),

                    // 照片網址清單
                    currentPhotos.map((photoUrl, idx) => (
                        h('div', { key: idx, className: 'flex items-center gap-2 bg-zinc-950/60 p-1.5 rounded border border-zinc-800/80' },
                            h('img', {
                                src: photoUrl,
                                alt: `相片 ${idx + 1}`,
                                className: 'w-7 h-7 object-cover rounded border border-zinc-700 shrink-0',
                                onError: e => { e.target.style.display = 'none'; }
                            }),
                            h('input', {
                                type: 'text',
                                value: photoUrl,
                                onChange: e => {
                                    const updatedPhotos = [...currentEditingCard.media.photos];
                                    updatedPhotos[idx] = e.target.value;
                                    updateEditingCard({ media: { ...currentEditingCard.media, photos: updatedPhotos } });
                                },
                                className: 'flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] text-white outline-none focus:border-amber-400 font-mono',
                                placeholder: 'https://...'
                            }),
                            h('button', {
                                type: 'button',
                                onClick: () => {
                                    const updatedPhotos = currentEditingCard.media.photos.filter((_, i) => i !== idx);
                                    updateEditingCard({ media: { ...currentEditingCard.media, photos: updatedPhotos } });
                                },
                                className: 'p-1.5 text-zinc-500 hover:text-rose-400 transition-colors shrink-0',
                                title: '移除相片'
                            },
                                h('i', { className: 'fa-regular fa-trash-can text-[10px]' })
                            )
                        )
                    ))
                ),

                // 背景配樂 (支援下拉選單與自訂路徑)
                h('div', { className: 'bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 space-y-2' },
                    h('div', { className: 'flex items-center justify-between' },
                        h('label', { className: 'block text-zinc-300 font-medium' }, '背景配樂 (Music)'),
                        h('span', { className: 'text-[10px] text-zinc-500 font-mono' }, '立體聲循環')
                    ),
                    h('select', {
                        value: currentEditingCard.media?.customMusic || 'assets/audio/In Love With You.mp3',
                        onChange: e => {
                            updateEditingCard({
                                media: { ...(currentEditingCard.media || {}), customMusic: e.target.value }
                            });
                        },
                        className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-amber-400 cursor-pointer'
                    },
                        (window.MUSIC_OPTIONS || [
                            { label: '🎵 浪漫純情 · In Love With You', value: 'assets/audio/In Love With You.mp3' },
                            { label: '🍂 深情寄託 · 把思念寄給遠方', value: 'assets/audio/把思念寄給遠方.mp3' }
                        ]).map((m, idx) => (
                            h('option', { key: idx, value: m.value }, m.label)
                        ))
                    ),
                    h('input', {
                        type: 'text',
                        value: currentEditingCard.media?.customMusic || '',
                        placeholder: '或手動輸入音樂網址 / 相對路徑',
                        onChange: e => {
                            updateEditingCard({
                                media: { ...(currentEditingCard.media || {}), customMusic: e.target.value }
                            });
                        },
                        className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1 text-white outline-none focus:border-amber-400 font-mono text-[10px] text-zinc-400'
                    })
                ),

                // 卡片文字排版與字體大小 (Typography & Font Size)
                currentEditingTemplate ? (
                    h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                        h('div', { className: 'flex items-center justify-between' },
                            h('label', { className: 'text-zinc-300 font-semibold flex items-center gap-1.5' },
                                h('i', { className: 'fa-solid fa-font text-amber-400' }),
                                h('span', null, '文字字型與大小 (Typography)')
                            ),
                            h('span', { className: 'text-[10px] px-1.5 py-0.5 rounded font-mono bg-amber-950/60 text-amber-300 border border-amber-800/40' }, '即時渲染')
                        ),

                        h('div', null,
                            h('label', { className: 'block text-zinc-400 mb-1 text-[11px]' }, '字型風格 (Font Family)'),
                            h('select', {
                                value: currentEditingTemplate.theme?.fontFamily || "'DFKai-SB', 'BiauKai', 'Kaiti SC', 'STKaiti', 'Noto Serif TC', serif",
                                onChange: e => {
                                    const val = e.target.value;
                                    const updatedTpls = templates.map(t => t.id === currentEditingTemplate.id ? {
                                        ...t,
                                        theme: { ...(t.theme || {}), fontFamily: val }
                                    } : t);
                                    saveTemplates(updatedTpls);
                                },
                                className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-amber-400 cursor-pointer'
                            },
                                (window.FONT_FAMILY_OPTIONS || []).map(font => (
                                    h('option', { key: font.id, value: font.value }, font.label)
                                ))
                            )
                        ),

                        // 內文字體大小
                        h('div', { className: 'pt-1 border-t border-zinc-800/60' },
                            h('div', { className: 'flex items-center justify-between mb-1' },
                                h('label', { className: 'text-zinc-400 text-[11px]' }, '內文字體大小 (Body Scale)'),
                                h('span', { className: 'font-mono text-amber-400 font-bold' },
                                    `${Math.round((currentEditingTemplate.theme?.fontSizeScale !== undefined ? Number(currentEditingTemplate.theme?.fontSizeScale) : 1.0) * 100)}%`
                                )
                            ),
                            h('input', {
                                type: 'range',
                                min: '80',
                                max: '140',
                                step: '5',
                                value: Math.round((currentEditingTemplate.theme?.fontSizeScale !== undefined ? Number(currentEditingTemplate.theme?.fontSizeScale) : 1.0) * 100),
                                onChange: e => {
                                    const val = parseFloat(e.target.value) / 100;
                                    const updatedTpls = templates.map(t => t.id === currentEditingTemplate.id ? {
                                        ...t,
                                        theme: { ...(t.theme || {}), fontSizeScale: val }
                                    } : t);
                                    saveTemplates(updatedTpls);
                                },
                                className: 'w-full accent-amber-500 cursor-pointer'
                            }),
                            h('div', { className: 'flex justify-between text-[9px] text-zinc-500 font-mono' },
                                h('span', null, '80% (精緻)'),
                                h('span', null, '100% (標準)'),
                                h('span', null, '140% (大字)')
                            )
                        ),

                        // 主標題大小
                        h('div', { className: 'pt-1 border-t border-zinc-800/60' },
                            h('div', { className: 'flex items-center justify-between mb-1' },
                                h('label', { className: 'text-zinc-400 text-[11px]' }, '主標題大小 (Title Size)'),
                                h('span', { className: 'font-mono text-amber-400 font-bold' },
                                    `${currentEditingTemplate.theme?.titleSize !== undefined ? currentEditingTemplate.theme?.titleSize : 36}px`
                                )
                            ),
                            h('input', {
                                type: 'range',
                                min: '26',
                                max: '54',
                                step: '2',
                                value: currentEditingTemplate.theme?.titleSize !== undefined ? currentEditingTemplate.theme?.titleSize : 36,
                                onChange: e => {
                                    const val = parseInt(e.target.value, 10);
                                    const updatedTpls = templates.map(t => t.id === currentEditingTemplate.id ? {
                                        ...t,
                                        theme: { ...(t.theme || {}), titleSize: val }
                                    } : t);
                                    saveTemplates(updatedTpls);
                                },
                                className: 'w-full accent-amber-500 cursor-pointer'
                            }),
                            h('div', { className: 'flex justify-between text-[9px] text-zinc-500 font-mono' },
                                h('span', null, '26px (典雅)'),
                                h('span', null, '36px (標準)'),
                                h('span', null, '54px (震撼)')
                            )
                        )
                    )
                ) : null,

                // 🌐 社群分享導言與預覽封面配置 (Open Graph & WhatsApp Share)
                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-sky-900/40' },
                    h('div', { className: 'flex items-center justify-between' },
                        h('label', { className: 'text-zinc-300 font-semibold flex items-center gap-1.5' },
                            h('i', { className: 'fa-solid fa-share-nodes text-sky-400' }),
                            h('span', null, '社群分享導語與封面預覽')
                        ),
                        h('span', { className: 'text-[10px] px-1.5 py-0.5 rounded font-mono bg-sky-950/60 text-sky-300 border border-sky-800/40' }, 'WhatsApp / LINE')
                    ),
                    h('p', { className: 'text-[11px] text-zinc-400 leading-relaxed' },
                        '分享時自動複製為兩行：第一行為此導語，第二行為專屬賀卡網址。支援 ',
                        h('code', { className: 'text-sky-300 font-mono font-bold' }, '{name}'),
                        ' 朋友稱謂自動置換。'
                    ),
                    // 社群分享導言：左側自動繼承上方稱謂前綴 + 右側自填祝賀內容
                    (() => {
                        // 從當前收件人稱謂中提取前綴與稱呼
                        const rawRec = currentEditingCard.recipient || '親愛的朋友：';
                        const punctMatch = rawRec.match(/[：:，,！!]$/);
                        const cleanRec = punctMatch ? rawRec.slice(0, -1) : rawRec;
                        
                        // 計算繼承的提示標籤：如「親愛的 {name}，」或「尊敬的 {name}，」
                        let inheritedPrefix = '{name}，';
                        if (cleanRec.startsWith('尊敬的')) {
                            inheritedPrefix = '尊敬的 {name}，';
                        } else if (cleanRec.startsWith('親愛的')) {
                            inheritedPrefix = '親愛的 {name}，';
                        } else if (cleanRec.startsWith('致 ')) {
                            inheritedPrefix = '致 {name}，';
                        } else if (cleanRec.startsWith('Dear ')) {
                            inheritedPrefix = 'Dear {name}, ';
                        } else if (cleanRec.includes('的')) {
                            const idx = cleanRec.indexOf('的');
                            inheritedPrefix = `${cleanRec.slice(0, idx + 1)} {name}，`;
                        }

                        // 如果現有 shareCaption 開頭已經包含了這個前綴，則抽離出純自填的祝賀內文
                        let customBody = currentEditingCard.shareCaption || '';
                        if (customBody.includes('，')) {
                            const firstComma = customBody.indexOf('，');
                            // 若前半段含有 {name} 或 前綴，只保留後半段給使用者編輯
                            if (customBody.slice(0, firstComma).includes('name') || customBody.slice(0, firstComma).includes('的')) {
                                customBody = customBody.slice(firstComma + 1).trim();
                            }
                        } else if (customBody.includes(', ')) {
                            const firstComma = customBody.indexOf(', ');
                            if (customBody.slice(0, firstComma).includes('name') || customBody.slice(0, firstComma).includes('Dear')) {
                                customBody = customBody.slice(firstComma + 2).trim();
                            }
                        }
                        if (!customBody) {
                            customBody = '中秋節快樂，這是我為你定制的賀卡。';
                        }

                        return h('div', { className: 'space-y-1.5' },
                            h('div', { className: 'flex items-center justify-between' },
                                h('label', { className: 'block text-zinc-400 text-[11px] font-medium' }, '分享附帶文字 (Share Intro Text)'),
                                h('span', { className: 'text-[10px] text-sky-400 font-mono' }, '自動繼承上方稱謂前綴')
                            ),
                            h('div', { className: 'flex items-stretch gap-1.5' },
                                // 1. 左側：自動繼承的前綴徽章 (不可修改，自動聯動)
                                h('div', {
                                    className: 'px-2.5 py-2 bg-sky-950/60 border border-sky-800/60 rounded flex items-center justify-center text-sky-300 font-mono text-xs font-semibold shrink-0 select-none shadow-sm',
                                    title: '自動繼承上方收件人稱謂前綴'
                                }, inheritedPrefix),
                                // 2. 右側：自填祝賀內容
                                h('textarea', {
                                    rows: 2,
                                    value: customBody,
                                    placeholder: '中秋節快樂，這是我為你定制的賀卡。',
                                    onChange: e => {
                                        const newBody = e.target.value;
                                        // 組合出完整 shareCaption 保存在 card 結構中
                                        const fullCaption = `${inheritedPrefix}${newBody}`;
                                        updateEditingCard({ shareCaption: fullCaption });
                                    },
                                    className: 'flex-1 bg-zinc-900 border border-zinc-800 rounded p-2 text-white outline-none focus:border-sky-400 text-xs font-sans resize-y'
                                })
                            )
                        );
                    })(),
                    h('div', { className: 'space-y-1.5' },
                        h('div', { className: 'flex items-center justify-between' },
                            h('label', { className: 'block text-zinc-400 text-[11px]' }, '社群封面圖片 (OG:Image)'),
                            h('span', { className: 'text-[10px] text-zinc-500 font-mono' }, '1200×630 橫版最佳')
                        ),
                        h('div', { className: 'flex items-center gap-2' },
                            h('input', {
                                type: 'text',
                                value: currentEditingCard.coverImage || '',
                                placeholder: '留空則自動使用全局高質感預覽圖',
                                onChange: e => updateEditingCard({ coverImage: e.target.value }),
                                className: 'flex-1 bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono text-[11px] outline-none focus:border-sky-400'
                            }),
                            currentEditingCard.coverImage ? (
                                h('button', {
                                    type: 'button',
                                    onClick: () => updateEditingCard({ coverImage: '' }),
                                    className: 'px-2 py-1 text-[11px] text-zinc-400 hover:text-zinc-200'
                                }, '恢復預設')
                            ) : null
                        ),
                        // 縮圖預覽狀態
                        h('div', { className: 'flex items-center gap-2 pt-1' },
                            h('img', {
                                src: currentEditingCard.coverImage || window.CardForgeConfig?.DEFAULT_COVER || 'https://i.ibb.co/YFsSdsjg/share-cover-webp.webp',
                                alt: 'OG Preview',
                                className: 'w-16 h-9 rounded object-cover border border-zinc-700 shrink-0 shadow'
                            }),
                            h('div', { className: 'text-[10px] text-zinc-400 leading-tight truncate' },
                                currentEditingCard.coverImage ? '✅ 當前卡片自訂專屬封面' : '🌐 使用系統全局預設封面 (CardForge 專屬)'
                            )
                        )
                    )
                )
            )
        );
    }

    // =========================================================================
    // 2. 模板設計工坊視圖組件 (TemplateEditorView)
    // =========================================================================
    function TemplateEditorView({
        editingTemplate,
        setEditingTemplate,
        editorPreviewDevice,
        posterAutoLoop,
        setPosterAutoLoop,
        posterLoopInterval,
        setPosterLoopInterval
    }) {
        if (!editingTemplate) return null;

        const isCrawlLayout = editingTemplate.layout === 'star-wars-crawl' || editingTemplate.layout === 'cinematic-credits';
        const isPosterLayout = editingTemplate.layout === 'cinematic-poster' || editingTemplate.layout === 'fixed-card' || editingTemplate.layout === 'boxed-card';

        return h('div', {
            className: 'flex-1 flex overflow-hidden',
            style: { height: 'calc(100vh - 56px)' }
        },
            // 左欄 (320px): 模板基本與版型架構
            h('aside', {
                style: { width: '320px', minWidth: '320px', maxWidth: '320px' },
                className: 'border-r border-zinc-800/80 bg-zinc-950/70 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0 text-xs z-20'
            },
                h('div', null,
                    h('h3', { className: 'text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5' },
                        h('i', { className: 'fa-solid fa-sliders' }),
                        h('span', null, '模板基本與版型架構')
                    ),
                    h('p', { className: 'text-[11px] text-zinc-500' }, '調整模板識別名稱、版型佈局與文字字型風格。')
                ),

                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1' }, '模板識別名稱'),
                        h('input', {
                            type: 'text',
                            value: editingTemplate.name || '',
                            onChange: e => setEditingTemplate({ ...editingTemplate, name: e.target.value }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-indigo-400 font-medium'
                        })
                    ),
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1' }, '版型佈局架構 (Layout)'),
                        h('select', {
                            value: editingTemplate.layout || 'star-wars-crawl',
                            onChange: e => setEditingTemplate({ ...editingTemplate, layout: e.target.value }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white outline-none focus:border-indigo-400 cursor-pointer'
                        },
                            (window.LAYOUT_OPTIONS || []).map(opt => (
                                h('option', { key: opt.value, value: opt.value }, opt.label)
                            ))
                        )
                    ),

                    // 漫遊升空速度與星戰仰角/寬度
                    isCrawlLayout ? (
                        h('div', { className: 'space-y-3' },
                            h('div', null,
                                h('div', { className: 'flex items-center justify-between mb-1' },
                                    h('label', { className: 'text-zinc-400' }, '字幕漫遊升空速度 (Speed)'),
                                    h('span', { className: 'font-mono text-indigo-400 font-bold' }, `${editingTemplate.crawlSpeed || 44}s`)
                                ),
                                h('input', {
                                    type: 'range',
                                    min: '20',
                                    max: '80',
                                    value: editingTemplate.crawlSpeed || 44,
                                    onChange: e => setEditingTemplate({ ...editingTemplate, crawlSpeed: parseInt(e.target.value) || 40 }),
                                    className: 'w-full accent-indigo-500 cursor-pointer'
                                }),
                                h('div', { className: 'flex justify-between text-[10px] text-zinc-500 mt-1 font-mono' },
                                    h('span', null, '20s (疾速)'),
                                    h('span', null, '44s (優雅)'),
                                    h('span', null, '80s (深情)')
                                )
                            ),

                            // 星戰專屬：3D 仰角 (Angle) 與 左右寬度邊界 (Width Scale)
                            editingTemplate.layout === 'star-wars-crawl' ? (
                                h('div', { className: 'space-y-3 pt-2 border-t border-zinc-800/70' },
                                    h('div', null,
                                        h('div', { className: 'flex items-center justify-between mb-1' },
                                            h('label', { className: 'text-zinc-400 text-[11px] font-medium' }, '星戰 3D 仰角 (Angle)'),
                                            h('span', { className: 'font-mono text-indigo-400 font-bold' },
                                                `${editingTemplate.crawlAngle !== undefined ? editingTemplate.crawlAngle : 24}°`
                                            )
                                        ),
                                        h('input', {
                                            type: 'range',
                                            min: '10',
                                            max: '48',
                                            step: '1',
                                            value: editingTemplate.crawlAngle !== undefined ? editingTemplate.crawlAngle : 24,
                                            onChange: e => setEditingTemplate({
                                                ...editingTemplate,
                                                crawlAngle: parseInt(e.target.value, 10)
                                            }),
                                            className: 'w-full accent-indigo-500 cursor-pointer'
                                        }),
                                        h('div', { className: 'flex justify-between text-[9px] text-zinc-500 font-mono' },
                                            h('span', null, '10° (平緩直立)'),
                                            h('span', null, '24° (標準端莊)'),
                                            h('span', null, '45° (深邃大俯衝)')
                                        )
                                    ),

                                    h('div', null,
                                        h('div', { className: 'flex items-center justify-between mb-1' },
                                            h('label', { className: 'text-zinc-400 text-[11px] font-medium' }, '左右寬度邊界 (Width Scale)'),
                                            h('span', { className: 'font-mono text-indigo-400 font-bold' },
                                                `${editingTemplate.crawlWidthScale !== undefined ? editingTemplate.crawlWidthScale : 180}%`
                                            )
                                        ),
                                        h('input', {
                                            type: 'range',
                                            min: '100',
                                            max: '260',
                                            step: '5',
                                            value: editingTemplate.crawlWidthScale !== undefined ? editingTemplate.crawlWidthScale : 180,
                                            onChange: e => setEditingTemplate({
                                                ...editingTemplate,
                                                crawlWidthScale: parseInt(e.target.value, 10)
                                            }),
                                            className: 'w-full accent-indigo-500 cursor-pointer'
                                        }),
                                        h('div', { className: 'flex justify-between text-[9px] text-zinc-500 font-mono' },
                                            h('span', null, '100% (框內收納)'),
                                            h('span', null, '180% (貼齊邊框)'),
                                            h('span', null, '240% (突破邊界)')
                                        )
                                    )
                                )
                            ) : null
                        )
                    ) : null,

                    // 滿版海報專屬：文字入場動態特效、速度調整與自動循環
                    isPosterLayout ? (
                        h('div', { className: 'space-y-3 pt-1 border-t border-zinc-800/60' },
                            h('div', { className: 'flex items-center justify-between' },
                                h('label', { className: 'text-zinc-400 text-[11px] font-medium' }, '海報文字入場動效 (Reveal FX)'),
                                h('button', {
                                    type: 'button',
                                    onClick: () => {
                                        setEditingTemplate({
                                            ...editingTemplate,
                                            replayKey: Date.now()
                                        });
                                    },
                                    className: 'px-2 py-0.5 rounded bg-indigo-950/60 hover:bg-indigo-900/80 text-[10px] text-indigo-300 border border-indigo-700/50 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm',
                                    title: '立即重新播放 3D 文字入場動態'
                                },
                                    h('i', { className: 'fa-solid fa-rotate-right text-[9px]' }),
                                    h('span', null, '重播動效')
                                )
                            ),
                            h('select', {
                                value: editingTemplate.textRevealFx || 'domino-3d',
                                onChange: e => setEditingTemplate({ ...editingTemplate, textRevealFx: e.target.value, replayKey: Date.now() }),
                                className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono text-[11px] outline-none focus:border-indigo-400 cursor-pointer'
                            },
                                (window.TEXT_REVEAL_OPTIONS || []).map(opt => (
                                    h('option', { key: opt.value, value: opt.value }, opt.label)
                                ))
                            ),

                            // 動態速度微調
                            h('div', { className: 'space-y-1 bg-zinc-950/50 p-2 rounded border border-zinc-800/80' },
                                h('div', { className: 'flex items-center justify-between text-[11px]' },
                                    h('span', { className: 'text-zinc-400' }, '入場速度 (Speed)'),
                                    h('span', { className: 'font-mono text-indigo-400 font-bold' },
                                        `${(editingTemplate.revealSpeed !== undefined ? Number(editingTemplate.revealSpeed) : 1.0).toFixed(1)}x`
                                    )
                                ),
                                h('input', {
                                    type: 'range',
                                    min: '4',
                                    max: '20',
                                    step: '1',
                                    value: Math.round((editingTemplate.revealSpeed !== undefined ? Number(editingTemplate.revealSpeed) : 1.0) * 10),
                                    onChange: e => {
                                        const spd = Number((parseInt(e.target.value, 10) / 10).toFixed(1));
                                        setEditingTemplate({
                                            ...editingTemplate,
                                            revealSpeed: spd,
                                            replayKey: Date.now()
                                        });
                                    },
                                    className: 'w-full accent-indigo-500 cursor-pointer'
                                }),
                                h('div', { className: 'flex justify-between text-[9px] text-zinc-500 font-mono' },
                                    h('span', null, '0.4x (慢動作立體翻轉)'),
                                    h('span', null, '1.0x (標準)'),
                                    h('span', null, '2.0x (極速)')
                                )
                            ),

                            // 自動循環重播控制項
                            h('div', { className: 'flex items-center justify-between bg-zinc-950/40 p-2 rounded border border-zinc-800/60' },
                                h('label', { className: 'flex items-center gap-2 cursor-pointer select-none' },
                                    h('input', {
                                        type: 'checkbox',
                                        checked: posterAutoLoop,
                                        onChange: e => setPosterAutoLoop(e.target.checked),
                                        className: 'w-3.5 h-3.5 rounded bg-zinc-900 border-zinc-700 text-indigo-500 focus:ring-0 cursor-pointer'
                                    }),
                                    h('span', { className: 'text-zinc-300 text-[11px]' }, '自動循環重播')
                                ),
                                h('div', { className: 'flex items-center gap-1.5' },
                                    h('span', { className: 'text-zinc-500 text-[10px]' }, '每隔'),
                                    h('select', {
                                        disabled: !posterAutoLoop,
                                        value: posterLoopInterval,
                                        onChange: e => setPosterLoopInterval(parseInt(e.target.value, 10) || 8),
                                        className: `bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-white font-mono text-[10px] outline-none ${!posterAutoLoop ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer focus:border-indigo-400'}`
                                    },
                                        h('option', { value: '5' }, '5 秒'),
                                        h('option', { value: '8' }, '8 秒 (推薦)'),
                                        h('option', { value: '12' }, '12 秒')
                                    )
                                )
                            ),

                            h('p', { className: 'text-[10px] text-zinc-500' }, '受眾點開賀卡瞬間，文字層次登場之動態儀式感；調慢可細賞 3D 骨牌與流光細節。')
                        )
                    ) : null
                ),

                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1' }, '模板簡介說明'),
                        h('textarea', {
                            rows: 3,
                            value: editingTemplate.description || '',
                            onChange: e => setEditingTemplate({ ...editingTemplate, description: e.target.value }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white outline-none focus:border-indigo-400 leading-relaxed',
                            placeholder: '描述此模板的意境與推薦使用場合...'
                        })
                    )
                ),

                h('div', { className: 'p-3 bg-indigo-950/30 rounded-lg border border-indigo-800/30 text-[11px] text-indigo-200/80 space-y-1' },
                    h('div', { className: 'font-bold flex items-center gap-1 text-indigo-300' },
                        h('i', { className: 'fa-solid fa-circle-info' }),
                        h('span', null, '即時 3D 所見即所得')
                    ),
                    h('p', null, '在左側與右側調整任何數值，中間螢幕會以 60 FPS 實時呈現 Shader 與粒子演算光影。')
                ),

                h('div', { className: 'mt-auto pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500' },
                    h('div', { className: 'flex items-center gap-1.5' },
                        h('i', { className: 'fa-solid fa-circle-check text-indigo-400 text-[10px]' }),
                        h('span', null, '即時預覽中')
                    ),
                    h('span', { className: 'text-[10px] text-zinc-600 font-mono' }, '頂部統一保存')
                )
            ),

            // 中間大畫布 (置頂吸附導覽列底部，尺寸固定，獨立於左右滾動)
            // 綁定 key: 視角切換時迫使重新掛載並自適應最新尺寸，徹底終結拉伸變形
            h('section', { className: 'flex-1 bg-black/60 flex flex-col items-center justify-start pt-4 px-4 pb-2 relative overflow-hidden select-none' },
                h('div', {
                    key: `preview-frame-${editorPreviewDevice}`,
                    className: editorPreviewDevice === 'mobile' ? 'phone-frame' : 'desktop-frame'
                },
                    window.CardEngine ? h(window.CardEngine, {
                        card: window.TEMPLATE_DUMMY_CARD,
                        template: editingTemplate
                    }) : null
                )
            ),

            // 右欄 (380px): 3D 視覺特效與風格色彩
            h('aside', {
                style: { width: '380px', minWidth: '380px', maxWidth: '380px' },
                className: 'border-l border-zinc-800/80 bg-zinc-950/70 p-5 overflow-y-auto custom-scrollbar flex flex-col gap-6 shrink-0 text-xs z-20'
            },
                h('div', null,
                    h('h3', { className: 'text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1 flex items-center gap-1.5' },
                        h('i', { className: 'fa-solid fa-wand-magic-sparkles' }),
                        h('span', null, '3D 視覺特效與風格色彩')
                    ),
                    h('p', { className: 'text-[11px] text-zinc-500' }, '修改數值即刻在中間螢幕呈現渲染反饋。')
                ),

                // 背景 WebGL Shader
                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1' }, '背景 3D WebGL Shader'),
                        h('select', {
                            value: editingTemplate.bgShader || 'none',
                            onChange: e => setEditingTemplate({ ...editingTemplate, bgShader: e.target.value }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono outline-none focus:border-indigo-400 cursor-pointer'
                        },
                            (window.SHADER_OPTIONS || []).map(opt => (
                                h('option', { key: opt.value, value: opt.value }, opt.label)
                            ))
                        )
                    ),

                    // 背景 Shader 多維微調（非 none 時展示）
                    editingTemplate.bgShader && editingTemplate.bgShader !== 'none' ? (
                        h('div', { className: 'space-y-2.5 pt-1 border-t border-zinc-800/60' },
                            h('div', null,
                                h('div', { className: 'flex items-center justify-between mb-1' },
                                    h('label', { className: 'text-zinc-400 text-[11px]' }, '背景輝光濃淡 (Opacity)'),
                                    h('span', { className: 'font-mono text-indigo-400 font-bold' },
                                        `${Math.round((editingTemplate.bgShaderOpacity !== undefined ? editingTemplate.bgShaderOpacity : 0.85) * 100)}%`
                                    )
                                ),
                                h('input', {
                                    type: 'range',
                                    min: '20',
                                    max: '100',
                                    value: Math.round((editingTemplate.bgShaderOpacity !== undefined ? editingTemplate.bgShaderOpacity : 0.85) * 100),
                                    onChange: e => setEditingTemplate({
                                        ...editingTemplate,
                                        bgShaderOpacity: parseFloat(e.target.value) / 100
                                    }),
                                    className: 'w-full accent-indigo-500 cursor-pointer'
                                })
                            ),

                            h('div', null,
                                h('div', { className: 'flex items-center justify-between mb-1' },
                                    h('label', { className: 'text-zinc-400 text-[11px]' }, '3D 動態流速 (Speed)'),
                                    h('span', { className: 'font-mono text-indigo-400 font-bold' },
                                        `${(editingTemplate.bgShaderSpeed !== undefined ? editingTemplate.bgShaderSpeed : 1.0).toFixed(1)}x`
                                    )
                                ),
                                h('input', {
                                    type: 'range',
                                    min: '2',
                                    max: '20',
                                    value: Math.round((editingTemplate.bgShaderSpeed !== undefined ? editingTemplate.bgShaderSpeed : 1.0) * 10),
                                    onChange: e => setEditingTemplate({
                                        ...editingTemplate,
                                        bgShaderSpeed: parseFloat(e.target.value) / 10
                                    }),
                                    className: 'w-full accent-indigo-500 cursor-pointer'
                                }),
                                h('div', { className: 'flex justify-between text-[9px] text-zinc-500 font-mono' },
                                    h('span', null, '0.2x (極緩)'),
                                    h('span', null, '1.0x (標準)'),
                                    h('span', null, '2.0x (流暢)')
                                )
                            )
                        )
                    ) : null
                ),

                // 前景粒子特效群
                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1' }, '3D 前景粒子特效群 (Particles)'),
                        h('select', {
                            value: editingTemplate.effects?.particleType || 'none',
                            onChange: e => setEditingTemplate({
                                ...editingTemplate,
                                effects: { ...(editingTemplate.effects || {}), particleType: e.target.value }
                            }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white font-mono outline-none focus:border-indigo-400 cursor-pointer'
                        },
                            (window.PARTICLE_OPTIONS || []).map(opt => (
                                h('option', { key: opt.value, value: opt.value }, opt.label)
                            ))
                        )
                    ),

                    // 前景粒子三維微調（非 none 時展示）
                    editingTemplate.effects?.particleType && editingTemplate.effects?.particleType !== 'none' ? (
                        h('div', { className: 'space-y-2.5 pt-1 border-t border-zinc-800/60' },
                            h('div', null,
                                h('div', { className: 'flex items-center justify-between mb-1' },
                                    h('label', { className: 'text-zinc-400 text-[11px]' }, '粒子發射密度 (Density)'),
                                    h('span', { className: 'font-mono text-indigo-400 font-bold' }, `${editingTemplate.effects?.particleDensity || 30}`)
                                ),
                                h('input', {
                                    type: 'range',
                                    min: '10',
                                    max: '80',
                                    value: editingTemplate.effects?.particleDensity || 30,
                                    onChange: e => setEditingTemplate({
                                        ...editingTemplate,
                                        effects: { ...(editingTemplate.effects || {}), particleDensity: parseInt(e.target.value) || 30 }
                                    }),
                                    className: 'w-full accent-indigo-500 cursor-pointer'
                                })
                            ),

                            h('div', null,
                                h('div', { className: 'flex items-center justify-between mb-1' },
                                    h('label', { className: 'text-zinc-400 text-[11px]' }, '粒子透明度 (Opacity)'),
                                    h('span', { className: 'font-mono text-indigo-400 font-bold' },
                                        `${Math.round((editingTemplate.effects?.particleOpacity !== undefined ? editingTemplate.effects?.particleOpacity : 0.8) * 100)}%`
                                    )
                                ),
                                h('input', {
                                    type: 'range',
                                    min: '20',
                                    max: '100',
                                    value: Math.round((editingTemplate.effects?.particleOpacity !== undefined ? editingTemplate.effects?.particleOpacity : 0.8) * 100),
                                    onChange: e => setEditingTemplate({
                                        ...editingTemplate,
                                        effects: { ...(editingTemplate.effects || {}), particleOpacity: parseFloat(e.target.value) / 100 }
                                    }),
                                    className: 'w-full accent-indigo-500 cursor-pointer'
                                })
                            ),

                            h('div', null,
                                h('div', { className: 'flex items-center justify-between mb-1' },
                                    h('label', { className: 'text-zinc-400 text-[11px]' }, '飄落/升騰速度 (Speed)'),
                                    h('span', { className: 'font-mono text-indigo-400 font-bold' },
                                        `${(editingTemplate.effects?.particleSpeed !== undefined ? editingTemplate.effects?.particleSpeed : 1.0).toFixed(1)}x`
                                    )
                                ),
                                h('input', {
                                    type: 'range',
                                    min: '4',
                                    max: '20',
                                    value: Math.round((editingTemplate.effects?.particleSpeed !== undefined ? editingTemplate.effects?.particleSpeed : 1.0) * 10),
                                    onChange: e => setEditingTemplate({
                                        ...editingTemplate,
                                        effects: { ...(editingTemplate.effects || {}), particleSpeed: parseFloat(e.target.value) / 10 }
                                    }),
                                    className: 'w-full accent-indigo-500 cursor-pointer'
                                }),
                                h('div', { className: 'flex justify-between text-[9px] text-zinc-500 font-mono' },
                                    h('span', null, '0.4x (慢速)'),
                                    h('span', null, '1.0x (標準)'),
                                    h('span', null, '2.0x (歡慶)')
                                )
                            )
                        )
                    ) : null
                ),

                // 風格色彩
                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', { className: 'grid grid-cols-2 gap-3' },
                        h('div', null,
                            h('label', { className: 'block text-zinc-400 mb-1' }, '主色調 (Primary)'),
                            h('div', { className: 'flex items-center gap-2' },
                                h('input', {
                                    type: 'color',
                                    value: editingTemplate.theme?.primaryColor || '#c9a96e',
                                    onChange: e => setEditingTemplate({
                                        ...editingTemplate,
                                        theme: { ...(editingTemplate.theme || {}), primaryColor: e.target.value }
                                    }),
                                    className: 'w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer'
                                }),
                                h('input', {
                                    type: 'text',
                                    value: editingTemplate.theme?.primaryColor || '#c9a96e',
                                    onChange: e => setEditingTemplate({
                                        ...editingTemplate,
                                        theme: { ...(editingTemplate.theme || {}), primaryColor: e.target.value }
                                    }),
                                    className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white font-mono text-[11px]'
                                })
                            )
                        ),
                        h('div', null,
                            h('label', { className: 'block text-zinc-400 mb-1' }, '強調色 (Accent)'),
                            h('div', { className: 'flex items-center gap-2' },
                                h('input', {
                                    type: 'color',
                                    value: editingTemplate.theme?.accentColor || '#fbbf24',
                                    onChange: e => setEditingTemplate({
                                        ...editingTemplate,
                                        theme: { ...(editingTemplate.theme || {}), accentColor: e.target.value }
                                    }),
                                    className: 'w-8 h-8 rounded border border-zinc-700 bg-transparent cursor-pointer'
                                }),
                                h('input', {
                                    type: 'text',
                                    value: editingTemplate.theme?.accentColor || '#fbbf24',
                                    onChange: e => setEditingTemplate({
                                        ...editingTemplate,
                                        theme: { ...(editingTemplate.theme || {}), accentColor: e.target.value }
                                    }),
                                    className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-white font-mono text-[11px]'
                                })
                            )
                        )
                    )
                ),

                // 文字排版與字型規格 (Typography & Font Size)
                h('div', { className: 'space-y-3 bg-zinc-900/50 p-3 rounded-lg border border-zinc-800' },
                    h('div', { className: 'flex items-center justify-between' },
                        h('label', { className: 'text-zinc-300 font-semibold flex items-center gap-1.5' },
                            h('i', { className: 'fa-solid fa-font text-indigo-400' }),
                            h('span', null, '文字排版與字型規格 (Typography)')
                        ),
                        h('span', { className: 'text-[10px] px-1.5 py-0.5 rounded font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/40' }, '繁簡英·全跨平台相容')
                    ),

                    // 字型風格
                    h('div', null,
                        h('label', { className: 'block text-zinc-400 mb-1 text-[11px]' }, '字型風格 (Font Family)'),
                        h('select', {
                            value: editingTemplate.theme?.fontFamily || "'DFKai-SB', 'BiauKai', 'Kaiti SC', 'STKaiti', 'Noto Serif TC', serif",
                            onChange: e => setEditingTemplate({
                                ...editingTemplate,
                                theme: { ...(editingTemplate.theme || {}), fontFamily: e.target.value }
                            }),
                            className: 'w-full bg-zinc-900 border border-zinc-800 rounded px-2.5 py-1.5 text-white text-[11px] outline-none focus:border-indigo-400 cursor-pointer'
                        },
                            (window.FONT_FAMILY_OPTIONS || []).map(font => (
                                h('option', { key: font.id, value: font.value }, font.label)
                            ))
                        ),
                        h('div', { className: 'text-[10px] text-zinc-500 mt-1 flex items-center justify-between' },
                            h('span', null, '支援台灣標楷、思源宋體、蘋方黑體'),
                            h('span', { className: 'text-indigo-400/80' }, 'iOS / Android / PC 自動降級保底')
                        )
                    ),

                    // 內文字體大小
                    h('div', { className: 'pt-1 border-t border-zinc-800/60' },
                        h('div', { className: 'flex items-center justify-between mb-1' },
                            h('label', { className: 'text-zinc-400 text-[11px]' }, '內文字體大小 (Body Scale)'),
                            h('span', { className: 'font-mono text-indigo-400 font-bold' },
                                `${Math.round((editingTemplate.theme?.fontSizeScale !== undefined ? Number(editingTemplate.theme?.fontSizeScale) : 1.0) * 100)}%`
                            )
                        ),
                        h('input', {
                            type: 'range',
                            min: '80',
                            max: '140',
                            step: '5',
                            value: Math.round((editingTemplate.theme?.fontSizeScale !== undefined ? Number(editingTemplate.theme?.fontSizeScale) : 1.0) * 100),
                            onChange: e => setEditingTemplate({
                                ...editingTemplate,
                                theme: { ...(editingTemplate.theme || {}), fontSizeScale: parseFloat(e.target.value) / 100 }
                            }),
                            className: 'w-full accent-indigo-500 cursor-pointer'
                        }),
                        h('div', { className: 'flex justify-between text-[9px] text-zinc-500 font-mono' },
                            h('span', null, '80% (精緻緊湊)'),
                            h('span', null, '100% (標準)'),
                            h('span', null, '140% (醒目大字)')
                        )
                    ),

                    // 主標題大小
                    h('div', { className: 'pt-1 border-t border-zinc-800/60' },
                        h('div', { className: 'flex items-center justify-between mb-1' },
                            h('label', { className: 'text-zinc-400 text-[11px]' }, '主標題大小 (Title Size)'),
                            h('span', { className: 'font-mono text-indigo-400 font-bold' },
                                `${editingTemplate.theme?.titleSize !== undefined ? editingTemplate.theme?.titleSize : 36}px`
                            )
                        ),
                        h('input', {
                            type: 'range',
                            min: '26',
                            max: '54',
                            step: '2',
                            value: editingTemplate.theme?.titleSize !== undefined ? editingTemplate.theme?.titleSize : 36,
                            onChange: e => setEditingTemplate({
                                ...editingTemplate,
                                theme: { ...(editingTemplate.theme || {}), titleSize: parseInt(e.target.value, 10) }
                            }),
                            className: 'w-full accent-indigo-500 cursor-pointer'
                        }),
                        h('div', { className: 'flex justify-between text-[9px] text-zinc-500 font-mono' },
                            h('span', null, '26px (典雅端莊)'),
                            h('span', null, '36px (標準大器)'),
                            h('span', null, '54px (震撼磅礴)')
                        )
                    )
                )
            )
        );
    }

    // 掛載至全域
    window.EditorViews = {
        CardEditorView,
        TemplateEditorView
    };

    // 同步掛載至 WorkspaceViews 保持相容
    if (window.WorkspaceViews) {
        window.WorkspaceViews.CardEditorView = CardEditorView;
        window.WorkspaceViews.TemplateEditorView = TemplateEditorView;
    }

})(typeof window !== 'undefined' ? window : this);
