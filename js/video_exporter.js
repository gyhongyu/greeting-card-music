/**
 * js/video_exporter.js - CardForge 微信專屬 9:16 短影音極速導出引擎
 * 
 * 核心亮點：
 * 1. 9:16 直式規格 (720x1280)：專為手機全螢幕與微信對話框量身打造，檔案超輕 (~2MB)。
 * 2. 精準文字合成 (Canvas 2D Overlay)：將收件人姓名 (如 Dear Danny, Dear 協理) 與祝福文字嚴絲合縫烙印在每一幀。
 * 3. 優雅音訊漸消音 (Audio Fade-Out)：最後 2 秒平滑淡出，不突兀、不卡音。
 * 4. 原生高相容 MediaRecorder 封裝：優先輸出 video/mp4，自動後備相容主流瀏覽器。
 */
(function(window) {
    'use strict';

    window.CardVideoExporter = {
        /**
         * 導出專屬 9:16 短影音
         * @param {Object} options 配置參數
         * @param {Object} options.card 卡片資料
         * @param {Object} options.template 模板資料
         * @param {string} options.recipientFullText 完整稱謂 (例如: "Dear 協理,")
         * @param {Function} options.onProgress 進度回報 (0 ~ 100)
         * @returns {Promise<Blob>} 輸出的 MP4/WebM 視訊 Blob
         */
        exportVideo: async function(options) {
            const {
                card,
                template = {},
                recipientFullText = '親愛的朋友：',
                durationSec = 10,
                fps = 30,
                onProgress = () => {}
            } = options;

            // 1. 建立離屏 9:16 輸出畫布 (720x1280)
            const width = 720;
            const height = 1280;
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');

            // 2. 獲取當前工作區中的 3D 背景 Canvas
            const bgCanvas = document.querySelector('canvas') || null;

            // 3. 準備 Web Audio 混音與漸消音管線
            let audioContext = null;
            let audioDestination = null;
            let gainNode = null;
            let audioElement = null;

            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    audioContext = new AudioCtx();
                    audioDestination = audioContext.createMediaStreamDestination();
                    gainNode = audioContext.createGain();
                    gainNode.gain.setValueAtTime(1.0, audioContext.currentTime);

                    // 取得音樂 URL
                    const rawMusic = (card && card.media && card.media.customMusic) 
                        || (template && template.defaultMusic) 
                        || 'assets/audio/In Love With You.mp3';

                    audioElement = new Audio(rawMusic);
                    audioElement.crossOrigin = 'anonymous';
                    
                    const sourceNode = audioContext.createMediaElementSource(audioElement);
                    sourceNode.connect(gainNode);
                    gainNode.connect(audioDestination);
                    // 不連到 audioContext.destination，錄製時本機靜音不干擾創作者
                }
            } catch (e) {
                console.warn('[CardVideoExporter] 音訊管線初始化異常 (將輸出無聲版):', e);
            }

            // 4. 準備 MediaRecorder 串流
            const canvasStream = canvas.captureStream(fps);
            let combinedStream = canvasStream;

            if (audioDestination && audioDestination.stream.getAudioTracks().length > 0) {
                combinedStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...audioDestination.stream.getAudioTracks()
                ]);
            }

            // 尋找最佳支援的 MIME 類型 (優先 MP4)
            let mimeType = 'video/webm';
            const candidateTypes = [
                'video/mp4;codecs=avc1',
                'video/mp4',
                'video/webm;codecs=h264',
                'video/webm;codecs=vp9',
                'video/webm'
            ];
            for (const t of candidateTypes) {
                if (MediaRecorder.isTypeSupported(t)) {
                    mimeType = t;
                    break;
                }
            }

            const recordedChunks = [];
            const recorder = new MediaRecorder(combinedStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000 // 2.5 Mbps，極致兼顧畫質與檔案體積 (~3MB)
            });

            recorder.ondataavailable = e => {
                if (e.data && e.data.size > 0) recordedChunks.push(e.data);
            };

            // 5. 動畫時間與文字內容準備
            const totalFrames = durationSec * fps;
            const titleText = card.title || '萬事勝意 歲歲平安';
            const paragraphs = (card.paragraphs && card.paragraphs.length > 0)
                ? card.paragraphs
                : ['願所有的美好，都如期而至。', '祝你順心開懷，安暖相伴。'];
            const primaryColor = (template && template.theme && template.theme.primaryColor) || '#e2b36f';

            // 6. 啟動錄製與音訊播放
            recorder.start(100);
            if (audioElement) {
                audioElement.currentTime = 0;
                audioElement.play().catch(() => {});
            }

            // 7. 逐幀渲染循環 (Deterministic Frame Generation)
            return new Promise((resolve, reject) => {
                let currentFrame = 0;
                const startTime = performance.now();

                function renderFrame() {
                    currentFrame++;
                    const progress = currentFrame / totalFrames; // 0.0 ~ 1.0
                    onProgress(Math.min(99, Math.round(progress * 100)));

                    // 音訊漸消音排程：最後 2 秒平滑拉至 0
                    if (gainNode && audioContext) {
                        const remainingSec = (totalFrames - currentFrame) / fps;
                        if (remainingSec <= 2.0 && remainingSec > 0) {
                            gainNode.gain.setValueAtTime(remainingSec / 2.0, audioContext.currentTime);
                        }
                    }

                    // --- A. 繪製背景與 3D 星空 ---
                    ctx.fillStyle = '#08080c';
                    ctx.fillRect(0, 0, width, height);

                    if (bgCanvas && bgCanvas.width > 0) {
                        try {
                            ctx.drawImage(bgCanvas, 0, 0, width, height);
                        } catch (e) {}
                    }

                    // 加上微暈深色護眼漸層遮罩 (讓文字無比清晰)
                    const grad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, height / 1.5);
                    grad.addColorStop(0, 'rgba(8, 8, 12, 0.4)');
                    grad.addColorStop(1, 'rgba(4, 4, 8, 0.85)');
                    ctx.fillStyle = grad;
                    ctx.fillRect(0, 0, width, height);

                    // --- B. 專屬個人化稱謂浮現 (前 0 ~ 2 秒淡入，之後常駐頂部) ---
                    const recipientAlpha = Math.min(1.0, progress * 4.0); // 0.25 秒內優雅淡入
                    ctx.save();
                    ctx.globalAlpha = recipientAlpha;
                    ctx.font = 'bold 36px "Jost", "Noto Serif TC", serif';
                    ctx.fillStyle = primaryColor;
                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'rgba(226, 179, 111, 0.6)';
                    ctx.shadowBlur = 12;
                    ctx.fillText(recipientFullText, width / 2, 220);
                    ctx.restore();

                    // --- C. 主標題 (燙金大字) ---
                    ctx.save();
                    ctx.font = '28px "Jost", "Noto Sans TC", sans-serif';
                    ctx.fillStyle = '#ffffff';
                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
                    ctx.shadowBlur = 8;
                    ctx.fillText(titleText, width / 2, 290);
                    ctx.restore();

                    // 裝飾金線
                    ctx.strokeStyle = 'rgba(226, 179, 111, 0.4)';
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    ctx.moveTo(width / 2 - 120, 325);
                    ctx.lineTo(width / 2 + 120, 325);
                    ctx.stroke();

                    // --- D. 祝福段落平滑上浮動態 ---
                    const textStartY = 430 - (progress * 80); // 10 秒內緩緩向上飄移 80px，極富電影感
                    ctx.save();
                    ctx.font = '24px "Noto Serif TC", serif';
                    ctx.fillStyle = '#f1f5f9';
                    ctx.textAlign = 'center';
                    ctx.shadowColor = 'rgba(0,0,0,0.8)';
                    ctx.shadowBlur = 6;

                    let lineY = textStartY;
                    paragraphs.forEach((p, idx) => {
                        // 每段錯落微淡入
                        const pAlpha = Math.min(1.0, Math.max(0.0, (progress * 3.0) - (idx * 0.15)));
                        ctx.globalAlpha = pAlpha;
                        ctx.fillText(p, width / 2, lineY);
                        lineY += 56;
                    });
                    ctx.restore();

                    // --- E. 底部極簡落款印章 ---
                    ctx.save();
                    ctx.globalAlpha = Math.min(1.0, progress * 2.5);
                    ctx.font = '16px "Jost", sans-serif';
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                    ctx.textAlign = 'center';
                    ctx.fillText('✨ CardForge Bespoke Hologram ✨', width / 2, height - 120);
                    ctx.restore();

                    // 判斷是否錄製完成
                    if (currentFrame < totalFrames) {
                        requestAnimationFrame(renderFrame);
                    } else {
                        // 錄製結束
                        if (gainNode) gainNode.gain.setValueAtTime(0, audioContext.currentTime);
                        if (audioElement) audioElement.pause();

                        recorder.onstop = () => {
                            const blob = new Blob(recordedChunks, { type: mimeType });
                            onProgress(100);
                            resolve({
                                blob: blob,
                                mimeType: mimeType,
                                extension: mimeType.includes('mp4') ? 'mp4' : 'webm'
                            });
                        };
                        recorder.stop();
                    }
                }

                // 啟動第一幀
                requestAnimationFrame(renderFrame);
            });
        }
    };
})(window);
