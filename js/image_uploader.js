/**
 * js/image_uploader.js - 前端圖片 WebP 極致壓縮與 ImgBB 直傳模組
 * 
 * 核心特性：
 * 1. 零依賴純 JavaScript，100% 符合 file:/// 零編譯 Zero-CORS 鐵律，嚴禁包含 JSX。
 * 2. 雙重智能壓縮：等比縮放 (長邊 ≤ 1600px) + 原生 Canvas WebP (80% 質量)，體積大減 80%~95% 且保留透明通道。
 * 3. 直傳 ImgBB API：免 Git Commit 存入全球 CDN，取得永久直連外鏈 (i.ibb.co)。
 * 4. 支援進度回調 (onProgress) 與自訂 API Key (預設採用保底 Key)。
 */

(function(window) {
    'use strict';

    // 預設全域 ImgBB API Key (開箱即用降級保底)
    const DEFAULT_IMGBB_KEY = 'e1c9de4542c48960bb30f04e9270b913';
    const IMGBB_ENDPOINT = 'https://api.imgbb.com/1/upload';

    const ImageUploader = {
        /**
         * 取得目前有效的 ImgBB API Key (優先讀取 LocalStorage 自訂配置)
         */
        getApiKey() {
            return localStorage.getItem('cardforge_imgbb_key') || DEFAULT_IMGBB_KEY;
        },

        /**
         * 儲存使用者自訂的 ImgBB API Key
         */
        setApiKey(key) {
            if (key && key.trim()) {
                localStorage.setItem('cardforge_imgbb_key', key.trim());
            } else {
                localStorage.removeItem('cardforge_imgbb_key');
            }
        },

        /**
         * 格式化檔案大小 (字串表示)
         */
        formatSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        },

        /**
         * 第一階段：前端 Canvas 極致壓縮為 WebP
         * @param {File|Blob} file 原始圖片檔案
         * @param {Object} options 壓縮選項 { maxDimension: 1600, quality: 0.8 }
         * @returns {Promise<Object>} { file, originalSize, compressedSize, savedPercent, previewUrl }
         */
        compressToWebP(file, options = {}) {
            const maxDimension = options.maxDimension || 1600;
            const quality = options.quality !== undefined ? options.quality : 0.8;

            return new Promise((resolve, reject) => {
                if (!file || !file.type.startsWith('image/')) {
                    return reject(new Error('請提供有效的圖片檔案'));
                }

                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new Image();
                    img.onload = () => {
                        try {
                            let { width, height } = img;

                            // 1. 等比例縮小計算
                            if (width > maxDimension || height > maxDimension) {
                                if (width > height) {
                                    height = Math.round((height * maxDimension) / width);
                                    width = maxDimension;
                                } else {
                                    width = Math.round((width * maxDimension) / height);
                                    height = maxDimension;
                                }
                            }

                            // 2. 建立離屏 Canvas
                            const canvas = document.createElement('canvas');
                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');

                            // 清空畫布確保透明背景完整保留
                            ctx.clearRect(0, 0, width, height);
                            ctx.drawImage(img, 0, 0, width, height);

                            // 3. 匯出 WebP Blob
                            canvas.toBlob((blob) => {
                                if (!blob) {
                                    // 瀏覽器若不支援 webp 則降級為 jpeg
                                    canvas.toBlob((fallbackBlob) => {
                                        if (!fallbackBlob) return reject(new Error('圖片轉譯失敗'));
                                        finishCompression(fallbackBlob, 'jpg');
                                    }, 'image/jpeg', quality);
                                    return;
                                }
                                finishCompression(blob, 'webp');
                            }, 'image/webp', quality);

                            function finishCompression(resultBlob, ext) {
                                const newFileName = (file.name || 'image').replace(/\.[^/.]+$/, "") + `.${ext}`;
                                const compressedFile = new File([resultBlob], newFileName, {
                                    type: `image/${ext}`,
                                    lastModified: Date.now()
                                });

                                const savedPercent = file.size > 0
                                    ? Math.max(0, Math.round((1 - compressedFile.size / file.size) * 100))
                                    : 0;

                                resolve({
                                    file: compressedFile,
                                    blob: resultBlob,
                                    originalSize: file.size,
                                    compressedSize: compressedFile.size,
                                    originalSizeFormatted: ImageUploader.formatSize(file.size),
                                    compressedSizeFormatted: ImageUploader.formatSize(compressedFile.size),
                                    savedPercent: savedPercent,
                                    width: width,
                                    height: height,
                                    previewUrl: URL.createObjectURL(resultBlob)
                                });
                            }
                        } catch (err) {
                            reject(new Error('圖片壓縮演算異常: ' + err.message));
                        }
                    };
                    img.onerror = () => reject(new Error('圖片解析失敗，請確認檔案格式'));
                    img.src = event.target.result;
                };
                reader.onerror = () => reject(new Error('讀取圖片檔案失敗'));
                reader.readAsDataURL(file);
            });
        },

        /**
         * 第二階段：直傳 ImgBB API
         * @param {File|Blob} fileOrBlob 要上傳的檔案物件
         * @param {string} customApiKey 可選自訂 Key
         * @returns {Promise<Object>} { url, displayUrl, thumbUrl, deleteUrl, id }
         */
        async uploadToImgBB(fileOrBlob, customApiKey = null) {
            const apiKey = customApiKey || this.getApiKey();
            if (!apiKey) {
                throw new Error('未設定 ImgBB API Key');
            }

            const formData = new FormData();
            formData.append('image', fileOrBlob);

            const response = await fetch(`${IMGBB_ENDPOINT}?key=${apiKey}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`ImgBB 連線異常 (${response.status}): ${text}`);
            }

            const result = await response.json();
            if (!result || !result.success) {
                throw new Error(result?.error?.message || 'ImgBB 上傳失敗');
            }

            const data = result.data;
            return {
                id: data.id,
                url: data.url, // 直連 CDN 外鏈 (永不破圖)
                displayUrl: data.display_url,
                thumbUrl: data.thumb?.url || data.url,
                deleteUrl: data.delete_url || '',
                size: data.size
            };
        },

        /**
         * 高階整合方法：一鍵壓縮並上傳
         * @param {File} rawFile 使用者選取的本地檔案
         * @param {Object} options { onProgress: function(status), maxDimension, quality, apiKey }
         * @returns {Promise<Object>} { url, thumbUrl, stats }
         */
        async processAndUpload(rawFile, options = {}) {
            const onProgress = options.onProgress || (() => {});

            // 1. 壓縮階段
            onProgress({ 
                step: 'compressing', 
                message: `正在進行極致 WebP 壓縮 (原始大小: ${this.formatSize(rawFile.size)})...` 
            });

            const compResult = await this.compressToWebP(rawFile, {
                maxDimension: options.maxDimension,
                quality: options.quality
            });

            // 2. 準備上傳
            onProgress({ 
                step: 'uploading', 
                message: `壓縮完成 (-${compResult.savedPercent}%)，正在推送至 ImgBB CDN...`,
                compResult: compResult
            });

            // 3. 上傳至 ImgBB
            const uploadResult = await this.uploadToImgBB(compResult.file, options.apiKey);

            // 4. 完成
            onProgress({ 
                step: 'done', 
                message: '上傳完成！已生成 CDN 直連外鏈',
                url: uploadResult.url
            });

            return {
                url: uploadResult.url,
                thumbUrl: uploadResult.thumbUrl,
                deleteUrl: uploadResult.deleteUrl,
                stats: {
                    originalSize: compResult.originalSizeFormatted,
                    compressedSize: compResult.compressedSizeFormatted,
                    savedPercent: compResult.savedPercent,
                    width: compResult.width,
                    height: compResult.height
                }
            };
        }
    };

    // 掛載至全域
    window.ImageUploader = ImageUploader;

})(typeof window !== 'undefined' ? window : this);
