// Content script for text selection
(function() {
    'use strict';

    (function (w, e, b, f, u, s) {
        w[f] = w[f] || {
            initSpace: function () {
                return new Promise(resolve => {
                    w[f].q = arguments;
                    w[f].resolve = resolve;
                });
            },
        };
        u = e.createElement(b);
        s = e.getElementsByTagName(b)[0];
        u.async = 1;
        u.src = 'https://webfu.se/surfly.js';
        s.parentNode.insertBefore(u, s);
    })(window, document, 'script', 'webfuse');

    // Create and show loader
    function showLoader() {
        // Remove existing loader if any
        const existingLoader = document.getElementById('text-selection-loader');
        if (existingLoader) {
            existingLoader.remove();
        }

        const loader = document.createElement('div');
        loader.id = 'text-selection-loader';
        loader.innerHTML = `
            <div class="text-selection-loader-content">
                <div class="text-selection-loader-spinner"></div>
                <div class="text-selection-loader-text">Loading Langhub...</div>
            </div>
        `;
        document.body.appendChild(loader);
    }

    // Hide loader
    function hideLoader() {
        const loader = document.getElementById('text-selection-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 300);
        }
    }

    webfuse.initSpace(
        'wk_dZpCZW62PvGfVaJZK9U7XXKm4tL1u_Bg',
        '1248',
        {},
    ).then(space => {
        webfuse.currentSession.on('message', function (session, event) {
            console.log(event, session);
        });

        webfuse.currentSession.on('session_created', function (session, event) {
            console.log('Session created', event, session);
            // Hide loader when session is created
            hideLoader();
        });
    }).catch(error => {
        console.error('Failed to initialize webfuse:', error);
        // Hide loader even on error
        hideLoader();
    });


    // Clean selected text
    function cleanSelectedText(text) {
        if (!text) return '';
        
        console.log('Original text:', text);
        
        const step1 = text.trim();
        console.log('After trim:', step1);
        
        const step2 = step1.replace(/\s+/g, ' '); // Replace multiple spaces with single space
        console.log('After space cleanup:', step2);
        
        const step3 = step2.replace(/\n+/g, ' '); // Replace multiple newlines with single space
        console.log('After newline cleanup:', step3);
        
        const step4 = step3.replace(/\t+/g, ' '); // Replace tabs with spaces
        console.log('After tab cleanup:', step4);
        
        // Remove only control characters and zero-width characters, but preserve all Unicode letters, numbers, and punctuation
        // This preserves accented characters, Cyrillic, Chinese, Japanese, Arabic, etc.
        const step5 = step4.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, ''); // Remove control and zero-width characters only
        console.log('After character cleanup:', step5);
        
        const final = step5.trim();
        console.log('Final cleaned text:', final);
        
        return final;
    }

    // Check if an element has enough content
    function hasSubstantialText(element) {
        const text = element.textContent || element.innerText || '';
        const cleanText = text.trim();
        
        // Check for minimum length (at least 50 characters)
        if (cleanText.length < 50) return false;
        
        // Count sentence-ending punctuation
        const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        
        // Require at least 2 sentences, OR 1 long sentence (100+ characters)
        if (sentences.length >= 2) return true;
        if (sentences.length === 1 && cleanText.length >= 50) return true;
        
        return false;
    }

    // Add visual styling to clickable paragraphs
    function addClickableStyles() {
        const styleId = 'text-selection-extension-styles';
        
        // Don't add styles if already added
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .text-selection-clickable {
                transition: all 0.2s ease-in-out;
                cursor: pointer;
                border-radius: 4px;
                position: relative;
            }
            
            .text-selection-clickable:hover {
                background-color: rgba(59, 130, 246, 0.1);
                box-shadow: inset 3px 0 0 rgba(59, 130, 246, 0.5);
            }
            
            .text-selection-clickable:active {
                background-color: rgba(59, 130, 246, 0.2);
                box-shadow: inset 3px 0 0 rgba(59, 130, 246, 0.7);
            }
            
            .text-selection-selected {
                background-color: rgba(59, 130, 246, 0.15);
                box-shadow: inset 3px 0 0 rgba(59, 130, 246, 0.7);
            }

            /* Overlay shown after selecting a paragraph */
            .text-selection-overlay {
                position: absolute;
                inset: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: linear-gradient(
                    to bottom,
                    rgba(59, 130, 246, 0.08),
                    rgba(59, 130, 246, 0.12)
                );
                border-radius: inherit;
                pointer-events: none; /* Do not block links */
                opacity: 0;
                animation: text-selection-overlay-fade 1600ms ease forwards;
                -webkit-backdrop-filter: blur(1.5px);
                backdrop-filter: blur(1.5px);
                user-select: none; /* Exclude from manual text selection */
            }

            .text-selection-overlay-message {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                    Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', Arial, sans-serif;
                background: rgba(17, 24, 39, 0.92);
                color: #ffffff;
                padding: 10px 14px;
                border-radius: 10px;
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25), inset 0 0 0 1px rgba(255, 255, 255, 0.08);
                font-weight: 600;
                letter-spacing: 0.2px;
                text-align: center;
                line-height: 1.3;
                max-width: 90%;
            }

            .text-selection-overlay-message .subtext {
                display: block;
                font-weight: 500;
                color: rgba(255, 255, 255, 0.85);
                margin-top: 2px;
                font-size: 12px;
            }

            @keyframes text-selection-overlay-fade {
                0% { opacity: 0; transform: scale(0.985); }
                10% { opacity: 1; transform: scale(1); }
                80% { opacity: 1; }
                100% { opacity: 0; }
            }

            /* Page edge noise effect */
            .text-selection-page-noise {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                pointer-events: none;
                z-index: 999999;
                opacity: 0;
                animation: text-selection-noise-fade 2000ms ease-out forwards;
            }

            .text-selection-page-noise::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: 
                    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                    radial-gradient(circle at 80% 20%, rgba(59, 130, 246, 0.12) 0%, transparent 50%),
                    radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                    linear-gradient(45deg, transparent 0%, rgba(59, 130, 246, 0.05) 25%, transparent 50%, rgba(59, 130, 246, 0.03) 75%, transparent 100%);
                animation: text-selection-noise-pulse 2000ms ease-in-out;
            }

            .text-selection-page-noise::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: 
                    conic-gradient(from 0deg at 10% 10%, rgba(59, 130, 246, 0.08) 0deg, transparent 60deg, rgba(59, 130, 246, 0.05) 120deg, transparent 180deg, rgba(59, 130, 246, 0.06) 240deg, transparent 300deg, rgba(59, 130, 246, 0.04) 360deg),
                    conic-gradient(from 180deg at 90% 90%, rgba(59, 130, 246, 0.06) 0deg, transparent 60deg, rgba(59, 130, 246, 0.04) 120deg, transparent 180deg, rgba(59, 130, 246, 0.07) 240deg, transparent 300deg, rgba(59, 130, 246, 0.05) 360deg);
                animation: text-selection-noise-rotate 2000ms linear;
            }

            @keyframes text-selection-noise-fade {
                0% { opacity: 0; }
                15% { opacity: 1; }
                85% { opacity: 1; }
                100% { opacity: 0; }
            }

            @keyframes text-selection-noise-pulse {
                0% { transform: scale(1) rotate(0deg); opacity: 0.8; }
                25% { transform: scale(1.02) rotate(1deg); opacity: 1; }
                50% { transform: scale(0.98) rotate(-0.5deg); opacity: 0.9; }
                75% { transform: scale(1.01) rotate(0.5deg); opacity: 0.95; }
                100% { transform: scale(1) rotate(0deg); opacity: 0.8; }
            }

            @keyframes text-selection-noise-rotate {
                0% { transform: rotate(0deg) scale(1); }
                50% { transform: rotate(180deg) scale(1.05); }
                100% { transform: rotate(360deg) scale(1); }
            }

            .text-selection-extension-image {
                transition: opacity 150ms ease-in-out;
                display: inline-block !important;
                visibility: visible !important;
            }
            
            .text-selection-extension-image:hover {
                filter: brightness(1.1);
            }

            /* Button Container */
            .text-selection-buttons-container {
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 999998;
                display: flex;
                gap: 12px;
                align-items: center;
            }

            /* Start Learning Button */
            .text-selection-start-learning-btn {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 14px 32px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
                transition: all 0.3s ease;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .text-selection-start-learning-btn:hover {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(59, 130, 246, 0.5);
            }

            .text-selection-start-learning-btn:active {
                transform: translateY(0);
            }

            /* URL Navigation Button */
            .text-selection-url-nav-btn {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
                border: none;
                border-radius: 12px;
                padding: 14px 16px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
                transition: all 0.3s ease;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .text-selection-url-nav-btn:hover {
                background: linear-gradient(135deg, #059669, #047857);
                transform: translateY(-2px);
                box-shadow: 0 8px 30px rgba(16, 185, 129, 0.5);
            }

            .text-selection-url-nav-btn:active {
                transform: translateY(0);
            }

            /* URL Input Overlay */
            .text-selection-url-input-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                z-index: 999999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .text-selection-url-input-container {
                background: rgba(17, 24, 39, 0.95);
                border: 1px solid rgba(55, 65, 81, 0.8);
                border-radius: 16px;
                padding: 24px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                width: 90%;
                max-width: 500px;
            }

            .text-selection-url-input-container h3 {
                color: #ffffff;
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 16px;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .text-selection-url-input-field {
                width: 100%;
                padding: 12px 16px;
                background: rgba(55, 65, 81, 0.8);
                border: 1px solid rgba(75, 85, 99, 0.8);
                border-radius: 8px;
                font-size: 16px;
                color: #f9fafb;
                outline: none;
                transition: all 0.3s ease;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin-bottom: 16px;
            }

            .text-selection-url-input-field:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
                background: rgba(55, 65, 81, 0.9);
            }

            .text-selection-url-input-field::placeholder {
                color: #9ca3af;
            }

            .text-selection-url-input-actions {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .text-selection-url-input-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            .text-selection-url-input-btn-cancel {
                background: rgba(55, 65, 81, 0.8);
                color: #f9fafb;
            }

            .text-selection-url-input-btn-cancel:hover {
                background: rgba(75, 85, 99, 0.9);
            }

            .text-selection-url-input-btn-submit {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
            }

            .text-selection-url-input-btn-submit:hover {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
            }

            /* Loader Styles */
            #text-selection-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(17, 24, 39, 0.9);
                backdrop-filter: blur(8px);
                z-index: 9999999;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: opacity 0.3s ease-out;
            }

            .text-selection-loader-content {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 20px;
            }

            .text-selection-loader-spinner {
                width: 50px;
                height: 50px;
                border: 4px solid rgba(59, 130, 246, 0.2);
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: text-selection-spin 1s linear infinite;
            }

            .text-selection-loader-text {
                color: #f9fafb;
                font-size: 18px;
                font-weight: 500;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }

            @keyframes text-selection-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }

    // Function to show the page edge noise effect
    function showPageNoiseEffect() {
        // Remove any existing noise effect
        const existingNoise = document.querySelector('.text-selection-page-noise');
        if (existingNoise) {
            existingNoise.remove();
        }

        // Create the noise effect element
        const noiseElement = document.createElement('div');
        noiseElement.className = 'text-selection-page-noise';
        
        // Add to document
        document.body.appendChild(noiseElement);

        // Remove the element after animation completes
        setTimeout(() => {
            if (noiseElement && noiseElement.parentNode) {
                noiseElement.remove();
            }
        }, 2000);
    }

    async function sendTextToLanghub(text, source = 'manual') {
        const cleanedText = cleanSelectedText(text);
        
        if (!cleanedText) {
            console.log('No text to send after cleaning');
            return;
        }

        // Detect page language for text selections
        const detectedLanguage = await detectPageLanguage();

        const message = {
            type: 'text-selection',
            text: cleanedText,
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            source: source, // 'manual' for text selection, 'click' for paragraph click
            detectedLanguage: detectedLanguage || null
        };

        webfuse.currentSession.sendMessage(message, "*");
    }

    // Convert image to base64 data URL
    function imageToDataURL(img) {
        return new Promise((resolve, reject) => {
            // If already a data URL, return it
            if (img.src && img.src.startsWith('data:')) {
                resolve(img.src);
                return;
            }
            
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Create a new image to handle cross-origin issues
            const newImg = new Image();
            newImg.crossOrigin = 'anonymous';
            
            newImg.onload = () => {
                try {
                    canvas.width = newImg.naturalWidth || newImg.width;
                    canvas.height = newImg.naturalHeight || newImg.height;
                    ctx.drawImage(newImg, 0, 0);
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } catch (error) {
                    // Fallback: try to use the original image src if it's a data URL
                    if (img.src && img.src.startsWith('data:')) {
                        resolve(img.src);
                    } else {
                        reject(error);
                    }
                }
            };
            
            newImg.onerror = () => {
                // Fallback: try to use the original image src
                if (img.src && img.src.startsWith('data:')) {
                    resolve(img.src);
                } else {
                    reject(new Error('Failed to load image'));
                }
            };
            
            // Load the image
            newImg.src = img.src;
        });
    }

    // Handle image click
    async function handleImageClick(event) {
        // Only stop propagation to avoid triggering other handlers
        // Don't prevent default to allow normal image behavior
        event.stopPropagation();
        
        const img = event.currentTarget;
        const originalSrc = img.src;
        
        // Detect page language
        const detectedLanguage = await detectPageLanguage();
        
        // Convert image to data URL without modifying the original image element
        imageToDataURL(img)
            .then(dataURL => {
                const message = {
                    type: 'image-selection',
                    imageData: dataURL,
                    imageUrl: originalSrc,
                    url: window.location.href,
                    title: document.title,
                    timestamp: new Date().toISOString(),
                    alt: img.alt || '',
                    source: 'click',
                    detectedLanguage: detectedLanguage || null
                };
                
                webfuse.currentSession.sendMessage(message, "*");
                
                // Show success overlay (doesn't modify the image)
                showImageOverlay(img);
                
                // Update button to "Next" when image is selected
                setTimeout(() => {
                    updateButtonText('Next');
                    currentSelectedElement = img;
                }, 50);
            })
            .catch(error => {
                console.error('Failed to capture image:', error);
                // Try to send the image URL as fallback
                const message = {
                    type: 'image-selection',
                    imageUrl: originalSrc,
                    url: window.location.href,
                    title: document.title,
                    timestamp: new Date().toISOString(),
                    alt: img.alt || '',
                    source: 'click',
                    error: 'Failed to convert image to data URL',
                    detectedLanguage: detectedLanguage || null
                };
                webfuse.currentSession.sendMessage(message, "*");
            });
    }

    // Show overlay on image after selection
    function showImageOverlay(img) {
        // Don't modify the image or its parent - just show a floating overlay
        const overlay = document.createElement('div');
        overlay.className = 'text-selection-overlay';
        overlay.style.pointerEvents = 'none';
        overlay.style.position = 'fixed';
        overlay.style.zIndex = '999999';
        
        const messageEl = document.createElement('div');
        messageEl.className = 'text-selection-overlay-message';
        messageEl.innerHTML = 'Image captured. Ask questions about it in the app →';
        overlay.appendChild(messageEl);
        
        // Position overlay near the image without modifying image or parent
        const rect = img.getBoundingClientRect();
        overlay.style.left = (rect.left + rect.width / 2) + 'px';
        overlay.style.top = (rect.top + rect.height / 2) + 'px';
        overlay.style.transform = 'translate(-50%, -50%)';
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            if (overlay && overlay.parentNode) overlay.remove();
        }, 1500);
    }

    // Track hovered image for opacity effects
    let hoveredImage = null;
    let allClickableImages = [];

    // Update image opacity based on hover
    function updateImageOpacity() {
        allClickableImages.forEach((img, index) => {
            if (hoveredImage === null) {
                img.style.opacity = '1';
                return;
            }
            
            const hoveredIndex = allClickableImages.indexOf(hoveredImage);
            const distance = Math.abs(index - hoveredIndex);
            
            if (distance === 0) {
                img.style.opacity = '1';
            } else if (distance === 1) {
                img.style.opacity = '0.9';
            } else if (distance === 2) {
                img.style.opacity = '0.8';
            } else {
                img.style.opacity = '0.7';
            }
        });
    }

    // Detect page language
    async function detectPageLanguage() {
        try {
            // Try to detect from document lang attribute first
            const htmlLang = document.documentElement.lang;
            if (htmlLang && htmlLang.length >= 2) {
                return htmlLang.split('-')[0]; // Get language code (e.g., 'en' from 'en-US')
            }
            
            // Try to detect from page text
            const pageText = document.body.innerText || document.body.textContent || '';
            if (pageText && pageText.trim().length > 100) {
                // Sample text for detection
                const sampleText = pageText.substring(0, 1000);
                
                // Check if Language Detector API is available
                if (typeof window !== 'undefined' && window.LanguageDetector) {
                    try {
                        const detector = await window.LanguageDetector.create();
                        const results = await detector.detect(sampleText);
                        if (results && results.length > 0 && results[0].confidence > 0.3) {
                            return results[0].detectedLanguage;
                        }
                    } catch (error) {
                        console.warn('Language detection API not available:', error);
                    }
                }
            }
            
            return null;
        } catch (error) {
            console.warn('Failed to detect page language:', error);
            return null;
        }
    }

    // Make images clickable
    function makeImagesClickable() {
        // Clear old array when re-running
        allClickableImages = allClickableImages.filter(img => img.isConnected);
        
        const images = document.querySelectorAll('img:not(.text-selection-extension-image)');
        
        images.forEach(img => {
            // Skip if already processed
            if (img.classList.contains('text-selection-extension-image')) return;
            
            // Skip very small images (likely icons)
            if (img.width < 50 && img.height < 50) return;
            
            img.classList.add('text-selection-extension-image');
            img.style.cursor = 'pointer';
            img.style.transition = 'opacity 150ms ease-in-out';
            img.style.opacity = '1';
            
            // Add hover handlers
            img.addEventListener('mouseenter', () => {
                hoveredImage = img;
                updateImageOpacity();
            });
            
            img.addEventListener('mouseleave', () => {
                hoveredImage = null;
                updateImageOpacity();
            });
            
            img.addEventListener('click', handleImageClick);
            
            allClickableImages.push(img);
        });
        
        // Invalidate cache when images are made clickable
        invalidateClickableElementsCache();
    }

    // Determine if the click happened inside an interactive element (e.g., link)
    function isClickInsideInteractiveElement(target) {
        if (!target || !(target instanceof Element)) return false;
        return !!target.closest('a, button, input, textarea, select, [role="button"], [role="link"], [contenteditable=""], [contenteditable="true"]');
    }

    // Handle paragraph click
    function handleParagraphClick(event) {
        // Allow links and other interactive elements to work normally
        if (isClickInsideInteractiveElement(event.target)) {
            return;
        }

        // If there is an active text selection, do not treat this as a paragraph click
        // But only if the selection is meaningful (more than just a few characters)
        const selection = window.getSelection && window.getSelection();
        if (selection && selection.type === 'Range') {
            const selectedText = selection.toString().trim();
            if (selectedText && selectedText.length >= 10) {
                // User is selecting text, don't trigger paragraph click
                return;
            }
        }

        const paragraph = event.currentTarget;
        
        // Remove any existing selection highlights
        document.querySelectorAll('.text-selection-selected').forEach(el => {
            el.classList.remove('text-selection-selected');
        });
        document.querySelectorAll(`.${EXT_CLS_PREFIX}-selected`).forEach(el => {
            el.classList.remove(`${EXT_CLS_PREFIX}-selected`);
        });
        
        // Add selection highlight to clicked paragraph
        paragraph.classList.add('text-selection-selected');
        paragraph.classList.add(`${EXT_CLS_PREFIX}-selected`);
        
        // Update button to "Next" when element is selected
        setTimeout(() => {
            updateButtonText('Next');
            currentSelectedElement = paragraph;
        }, 50);
        
        // Smoothly scroll the clicked paragraph into view for context
        try {
            paragraph.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        } catch (e) {
            // Fallback for older browsers
            paragraph.scrollIntoView();
        }

        // Get the paragraph text
        const text = paragraph.textContent || paragraph.innerText || '';
        
        if (text && text.trim().length > 0) {
            console.log('Paragraph clicked:', text);
            sendTextToLanghub(text, 'click');
            
            // Now that text is sent, show overlay to guide the user
            paragraph.querySelectorAll('.text-selection-overlay').forEach(el => el.remove());
            const overlay = document.createElement('div');
            overlay.className = 'text-selection-overlay';
            const messageEl = document.createElement('div');
            messageEl.className = 'text-selection-overlay-message';
            messageEl.innerHTML = 'Text captured. Use it in the app on the right →\n<span class="subtext">You can practice, translate, or save it there.</span>';
            overlay.appendChild(messageEl);
            paragraph.appendChild(overlay);

            // Remove highlight after a short delay
            setTimeout(() => {
                paragraph.classList.remove('text-selection-selected');
                if (overlay && overlay.parentNode) overlay.remove();
            }, 1500);
        }
    }

    // Class prefix for extension
    const EXT_CLS_PREFIX = 'text-selection';
    
    // Track clickable nodes
    const clickableNodes = new Set();
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
        position: fixed;
        background: rgba(17, 24, 39, 0.95);
        color: #ffffff;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
        pointer-events: none;
        z-index: 999999;
        display: none;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    tooltip.textContent = 'Click to select';
    document.body.appendChild(tooltip);
    
    // Check if element has a clickable parent
    function hasClickableParent(element) {
        if (!element || !element.parentElement) return false;
        return element.parentElement.closest(`.${EXT_CLS_PREFIX}-clickable`) !== null;
    }
    
    // Check if all text is inside interactive elements
    function isAllTextInInteractiveElements(element) {
        if (!element) return false;
        
        // Get all text nodes
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null
        );
        
        let textNode;
        let hasNonInteractiveText = false;
        
        while (textNode = walker.nextNode()) {
            const text = textNode.textContent.trim();
            if (text.length === 0) continue;
            
            // Check if this text node is inside an interactive element
            const parent = textNode.parentElement;
            if (parent) {
                const isInInteractive = parent.closest('a, button, input, textarea, select, [role="button"], [role="link"], [contenteditable=""], [contenteditable="true"]');
                if (!isInInteractive) {
                    hasNonInteractiveText = true;
                    break;
                }
            }
        }
        
        // Return true if ALL text is in interactive elements (no non-interactive text found)
        return !hasNonInteractiveText;
    }

    // Make elements clickable
    function makeElementsClickable() {
        const blockElements = 'p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt';

        // Note: :has() selector has limited browser support, so we'll use a fallback approach
        // For browsers that don't support :has(), we'll check divs manually
        const selectors = [
            blockElements,
            'div',
            'section',
            'article'
        ];

        // Get all potential elements
        const allElements = [];
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => allElements.push(el));
        });

        // Filter and process elements
        allElements.forEach((element) => {
            // Skip if already processed
            if (clickableNodes.has(element) || element.closest(`.${EXT_CLS_PREFIX}-clickable`)) return;
            
            // Skip IMG elements
            if (element.tagName === 'IMG') return;
            
            // Skip if inside extension container
            if (element.closest(`.${EXT_CLS_PREFIX}-container`)) return;
            
            // Skip if has clickable parent
            if (hasClickableParent(element)) return;
            
            // For div, section, article - check if they have block element children
            // But if the block child is a direct child and is also substantial, prefer the child
            if (['DIV', 'SECTION', 'ARTICLE'].includes(element.tagName)) {
                const blockChildren = element.querySelectorAll('p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt');
                // If this container has a single substantial block element child, skip the container
                // (the child will be processed separately)
                if (blockChildren.length === 1) {
                    const child = blockChildren[0];
                    if (hasSubstantialText(child)) {
                        return; // Skip container, let the child be clickable
                    }
                }
                // If it has multiple or structural children, skip it
                const hasStructuralChildren = element.querySelector('div, section, article, header, footer, aside, nav, ul, ol, table');
                if (hasStructuralChildren || blockChildren.length > 1) return;
            }
            
            // Check if has substantial text
            if (!hasSubstantialText(element)) return;
            
            // Check if all text is in interactive elements
            if (isAllTextInInteractiveElements(element)) return;
            
            // Make it clickable
            element.classList.add(`${EXT_CLS_PREFIX}-clickable`);
            element.addEventListener('click', handleParagraphClick, true);
            clickableNodes.add(element);
            
            // Create tooltip handlers
            const tooltipMouseOver = (e) => {
                tooltip.style.display = 'block';
            };
            const tooltipMouseOut = (e) => {
                tooltip.style.display = 'none';
            };
            const tooltipMouseMove = (e) => {
                tooltip.style.left = `${e.clientX + 15}px`;
                tooltip.style.top = `${e.clientY + 15}px`;
            };
            
            // Add tooltip hover events
            element.addEventListener('mouseover', tooltipMouseOver);
            element.addEventListener('mouseout', tooltipMouseOut);
            element.addEventListener('mousemove', tooltipMouseMove);
            
            // Store handlers for cleanup
            element._tooltipHandlers = {
                mouseover: tooltipMouseOver,
                mouseout: tooltipMouseOut,
                mousemove: tooltipMouseMove
            };
        });
        
        // Invalidate cache when elements are made clickable
        invalidateClickableElementsCache();
    }

    // Track last sent selection to avoid duplicates
    let lastSentSelection = '';
    let selectionTimeout = null;

    // Handle text selection (improved to work alongside paragraph clicking)
    function handleTextSelection() {
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) return;
        
        const selectedText = selection.toString().trim();
        
        // Only process meaningful selections (at least 10 characters to avoid accidental single word selections)
        if (selectedText && selectedText.length >= 10 && selectedText !== lastSentSelection) {
            console.log('Text selected:', selectedText);
            lastSentSelection = selectedText;
            sendTextToLanghub(selectedText, 'manual');
            
            // Clear the selection after sending (with a small delay for visual feedback)
            setTimeout(() => {
                if (window.getSelection) {
                    window.getSelection().removeAllRanges();
                }
                lastSentSelection = ''; // Reset after a bit to allow re-selecting the same text
            }, 500);
        }
    }

    // Handle mouse up events (when selection ends)
    function handleMouseUp(event) {
        // Clear any existing timeout
        if (selectionTimeout) {
            clearTimeout(selectionTimeout);
        }
        
        // Small delay to ensure selection is complete
        selectionTimeout = setTimeout(() => {
            handleTextSelection();
        }, 150);
    }

    // Observe DOM changes to handle dynamically added content
    function observeContentChanges() {
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                // Check if new nodes were added
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        // Check if the added node is a potential clickable element or contains them
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const isBlockElement = ['P', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'DD', 'DT', 'DIV', 'SECTION', 'ARTICLE'].includes(node.tagName);
                            const hasBlockElements = node.querySelector('p, li, h1, h2, h3, h4, h5, h6, blockquote, dd, dt, div, section, article');
                            if (isBlockElement || hasBlockElements) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldUpdate) {
                // Debounce the update to avoid excessive calls
                setTimeout(() => {
                    makeElementsClickable();
                }, 500);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also observe for new images
        const imageObserver = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'IMG' || node.querySelector('img')) {
                                shouldUpdate = true;
                            }
                        }
                    });
                }
            });
            
            if (shouldUpdate) {
                setTimeout(() => {
                    makeImagesClickable();
                }, 500);
            }
        });
        
        imageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        return observer;
    }

    // Cache for clickable elements
    let clickableElementsCache = null;
    let cacheTimestamp = 0;
    const CACHE_DURATION = 5000; // 5 seconds

    // Get all clickable elements in DOM order (images and text blocks)
    function getAllClickableElements(useCache = true) {
        const now = Date.now();
        
        // Return cached result if still valid
        if (useCache && clickableElementsCache && (now - cacheTimestamp) < CACHE_DURATION) {
            return clickableElementsCache;
        }
        
        const elements = [];
        
        // Get all clickable images
        document.querySelectorAll('img.text-selection-extension-image').forEach(img => {
            elements.push(img);
        });
        
        // Get all clickable text blocks
        document.querySelectorAll(`.${EXT_CLS_PREFIX}-clickable`).forEach(block => {
            elements.push(block);
        });
        
        // Simple DOM order sort (much faster than compareDocumentPosition)
        const sortedElements = elements.sort((a, b) => {
            if (a === b) return 0;
            if (document.contains(a) && document.contains(b)) {
                const position = a.compareDocumentPosition(b);
                if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
                    return -1;
                } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
                    return 1;
                }
            }
            return 0;
        });
        
        // Update cache
        clickableElementsCache = sortedElements;
        cacheTimestamp = now;
        
        return sortedElements;
    }
    
    // Invalidate cache
    function invalidateClickableElementsCache() {
        clickableElementsCache = null;
        cacheTimestamp = 0;
    }

    // Find first clickable element (image or text block)
    function findFirstClickableElement() {
        const allElements = getAllClickableElements();
        return allElements.length > 0 ? allElements[0] : null;
    }

    // Find next clickable element after the current one
    function findNextClickableElement(currentElement) {
        const allElements = getAllClickableElements();
        if (allElements.length === 0) return null;
        
        const currentIndex = allElements.indexOf(currentElement);
        if (currentIndex === -1) {
            // Current element not found, return first
            return allElements[0];
        }
        
        // Return next element, or null if it's the last one
        return currentIndex < allElements.length - 1 ? allElements[currentIndex + 1] : null;
    }

    // Get currently selected element
    function getCurrentSelectedElement() {
        // Check for selected text block
        const selectedTextBlock = document.querySelector(`.${EXT_CLS_PREFIX}-selected`);
        if (selectedTextBlock) return selectedTextBlock;
        
        // Check for recently selected (could be temporary class)
        const selectedBlock = document.querySelector(`.${EXT_CLS_PREFIX}-clickable.${EXT_CLS_PREFIX}-selected`);
        if (selectedBlock) return selectedBlock;
        
        return null;
    }

    // Track current selected element
    let currentSelectedElement = null;

    // Handle button click (Start learning or Next)
    function handleButtonClick() {
        let targetElement;
        
        if (currentSelectedElement) {
            // Find next element
            targetElement = findNextClickableElement(currentSelectedElement);
            if (!targetElement) {
                // No more elements, reset to first
                targetElement = findFirstClickableElement();
                currentSelectedElement = null;
            }
        } else {
            // Find first element
            targetElement = findFirstClickableElement();
        }
        
        if (targetElement) {
            // Update current selected element
            currentSelectedElement = targetElement;
            
            // Scroll to element first
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            
            // Trigger click after a short delay to ensure scroll has started
            setTimeout(() => {
                // Create a synthetic click event
                const clickEvent = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: 0
                });
                targetElement.dispatchEvent(clickEvent);
                
                // Update button text to "Next"
                updateButtonText('Next');
            }, 300);
        } else {
            console.log('No clickable elements found on the page');
        }
    }

    // Update button text
    function updateButtonText(text) {
        const button = document.querySelector('.text-selection-start-learning-btn');
        if (button) {
            if (text === 'Next') {
                // Show "Next" with arrow down icon
                button.innerHTML = `
                    <span style="display: flex; align-items: center; gap: 8px;">
                        <span>Next</span>
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                `;
                button.title = 'Click to select the next text block or image on the page';
            } else {
                // Show "Start learning" as plain text
                button.textContent = text;
                button.title = 'Click to select the first text block or image on the page';
            }
        }
    }

    // Handle URL navigation
    function handleUrlNavigation(url) {
        if (!url || !url.trim()) return;
        
        let finalUrl = url.trim();
        
        // Add protocol if missing
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }
        
        // Validate URL before navigating
        try {
            new URL(finalUrl);
            window.location.href = finalUrl;
        } catch (error) {
            alert('Invalid URL. Please enter a valid URL.');
        }
    }

    // Show URL input overlay
    function showUrlInputOverlay() {
        // Remove existing overlay if any
        const existingOverlay = document.querySelector('.text-selection-url-input-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        // Create overlay
        const overlay = document.createElement('div');
        overlay.className = 'text-selection-url-input-overlay';
        
        // Create container
        const container = document.createElement('div');
        container.className = 'text-selection-url-input-container';
        
        // Create title
        const title = document.createElement('h3');
        title.textContent = 'Navigate to URL';
        container.appendChild(title);
        
        // Create input field
        const input = document.createElement('input');
        input.type = 'url';
        input.className = 'text-selection-url-input-field';
        input.placeholder = 'Enter website URL...';
        input.autofocus = true;
        container.appendChild(input);
        
        // Create actions container
        const actions = document.createElement('div');
        actions.className = 'text-selection-url-input-actions';
        
        // Create cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'text-selection-url-input-btn text-selection-url-input-btn-cancel';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
        });
        actions.appendChild(cancelBtn);
        
        // Create submit button
        const submitBtn = document.createElement('button');
        submitBtn.className = 'text-selection-url-input-btn text-selection-url-input-btn-submit';
        submitBtn.textContent = 'Go';
        submitBtn.addEventListener('click', () => {
            handleUrlNavigation(input.value);
        });
        actions.appendChild(submitBtn);
        
        // Handle Enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleUrlNavigation(input.value);
            }
        });
        
        // Handle Escape key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
            }
        });
        
        // Close on overlay click (outside container)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        
        container.appendChild(actions);
        overlay.appendChild(container);
        document.body.appendChild(overlay);
        
        // Focus input
        setTimeout(() => input.focus(), 100);
    }

    // Create and add URL navigation button
    function addUrlNavigationButton() {
        // Remove existing button if any
        const existingButton = document.querySelector('.text-selection-url-nav-btn');
        if (existingButton) {
            existingButton.remove();
        }

        // Create button container if it doesn't exist
        let container = document.querySelector('.text-selection-buttons-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'text-selection-buttons-container';
            document.body.appendChild(container);
        }

        // Create URL navigation button
        const urlButton = document.createElement('button');
        urlButton.className = 'text-selection-url-nav-btn';
        urlButton.title = 'Navigate to URL';
        urlButton.innerHTML = `
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
        `;
        urlButton.addEventListener('click', showUrlInputOverlay);
        
        // Insert URL button before the Start Learning button
        container.insertBefore(urlButton, container.firstChild);
    }

    // Create and add Start Learning button
    function addStartLearningButton() {
        // Remove existing button if any
        const existingButton = document.querySelector('.text-selection-start-learning-btn');
        if (existingButton) {
            existingButton.remove();
        }

        // Create button container if it doesn't exist
        let container = document.querySelector('.text-selection-buttons-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'text-selection-buttons-container';
            document.body.appendChild(container);
        }

        // Create button
        const button = document.createElement('button');
        button.className = 'text-selection-start-learning-btn';
        button.textContent = 'Start learning';
        button.title = 'Click to select the first text block or image on the page';
        button.addEventListener('click', handleButtonClick);

        // Add to container
        container.appendChild(button);

        // Debounced selection observer
        let selectionCheckTimeout = null;
        const observeSelection = () => {
            if (selectionCheckTimeout) {
                clearTimeout(selectionCheckTimeout);
            }
            selectionCheckTimeout = setTimeout(() => {
                const tempSelected = document.querySelector(`.${EXT_CLS_PREFIX}-selected`);
                if (tempSelected) {
                    // An element was selected, update button to "Next"
                    updateButtonText('Next');
                    currentSelectedElement = tempSelected;
                }
            }, 200);
        };

        // Listen for click events to catch selections immediately (much more efficient than observers)
        const clickHandler = (e) => {
            if (e.target.classList.contains(`${EXT_CLS_PREFIX}-clickable`) || 
                e.target.classList.contains('text-selection-extension-image') ||
                e.target.closest(`.${EXT_CLS_PREFIX}-clickable`) ||
                e.target.closest('img.text-selection-extension-image')) {
                observeSelection();
            }
        };
        document.addEventListener('click', clickHandler, true);

        // Store handler for cleanup
        button._clickHandler = clickHandler;

        // Update button visibility based on available clickable elements
        function updateButtonVisibility() {
            const hasClickableElements = findFirstClickableElement() !== null;
            const container = document.querySelector('.text-selection-buttons-container');
            if (container) {
                container.style.display = hasClickableElements ? 'flex' : 'none';
            }
        }

        // Initial check
        updateButtonVisibility();

        // Re-check periodically but less frequently (every 5 seconds instead of 2)
        const visibilityInterval = setInterval(() => {
            invalidateClickableElementsCache(); // Invalidate cache periodically
            updateButtonVisibility();
        }, 5000);
        
        // Store interval for cleanup
        button._visibilityInterval = visibilityInterval;
    }

    // Initialize the extension
    function initialize() {
        console.log('Text Selection Extension initialized');

        // Add CSS styles for clickable paragraphs (needed for loader)
        addClickableStyles();
        
        // Show loader for webfuse session
        showLoader();

        // Make existing elements clickable
        makeElementsClickable();
        
        // Make images clickable
        makeImagesClickable();
        
        // Observe for new content
        observeContentChanges();

        // Add event listeners for manual text selection (keep existing functionality)
        document.addEventListener('mouseup', handleMouseUp);

        // Also listen for touch events on mobile
        document.addEventListener('touchend', handleMouseUp);

        // Add URL navigation button and Start Learning button
        // Delay slightly to ensure elements are processed
        setTimeout(() => {
            addUrlNavigationButton();
            addStartLearningButton();
        }, 500);
        
        console.log('Text Selection Extension: Clickable paragraphs initialized');
    }

    // Start the extension when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

    // Cleanup function (for when extension is disabled)
    window.cleanupTextSelectionExtension = function() {
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchend', handleMouseUp);
        
        // Remove clickable element functionality
        clickableNodes.forEach(element => {
            element.classList.remove('text-selection-clickable', 'text-selection-selected');
            element.removeEventListener('click', handleParagraphClick, true);
            
            // Remove tooltip handlers if they exist
            if (element._tooltipHandlers) {
                element.removeEventListener('mouseover', element._tooltipHandlers.mouseover);
                element.removeEventListener('mouseout', element._tooltipHandlers.mouseout);
                element.removeEventListener('mousemove', element._tooltipHandlers.mousemove);
                delete element._tooltipHandlers;
            }
        });
        clickableNodes.clear();
        
        // Remove tooltip
        if (tooltip && tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
        }
        
        // Remove buttons container (includes both URL nav and Start Learning buttons)
        const buttonsContainer = document.querySelector('.text-selection-buttons-container');
        if (buttonsContainer) {
            const startButton = buttonsContainer.querySelector('.text-selection-start-learning-btn');
            if (startButton) {
                // Remove event listener
                if (startButton._clickHandler) {
                    document.removeEventListener('click', startButton._clickHandler, true);
                }
                // Clear interval
                if (startButton._visibilityInterval) {
                    clearInterval(startButton._visibilityInterval);
                }
            }
            buttonsContainer.remove();
        }
        
        // Remove URL input overlay if open
        const urlOverlay = document.querySelector('.text-selection-url-input-overlay');
        if (urlOverlay) {
            urlOverlay.remove();
        }
        
        // Remove styles
        const styles = document.getElementById('text-selection-extension-styles');
        if (styles) {
            styles.remove();
        }
        
        console.log('Text Selection Extension cleaned up');
    };

})();
