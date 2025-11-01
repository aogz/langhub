// Content script for text selection and Scaledrone integration
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

    webfuse.initSpace(
        'wk_dZpCZW62PvGfVaJZK9U7XXKm4tL1u_Bg',
        '1248',
        {},
    ).then(space => {
        webfuse.currentSession.on('message', function (session, event) {
            console.log(event, session);
        });
    });

    // Scaledrone configuration
    const SCALEDRONE_CHANNEL_ID = 'br4FkhdzF498EuJA'; // Replace with your actual channel ID

    // Initialize Scaledrone
    let drone = null;
    let room = null;

    // Initialize Scaledrone connection
    function initializeScaledrone() {
        try {
            drone = new Scaledrone(SCALEDRONE_CHANNEL_ID, {
                data: {
                    name: 'Text Selection Extension',
                    color: '#ff0000'
                }
            });

            drone.on('open', function(error) {
                if (error) {
                    console.error('Scaledrone connection error:', error);
                    return;
                }
                console.log('Connected to Scaledrone');
                
                // Join a room for text selections
                room = drone.subscribe('text-selections');
            });

            drone.on('error', function(error) {
                console.error('Scaledrone error:', error);
            });

            drone.on('close', function(event) {
                console.log('Scaledrone connection closed:', event);
            });

        } catch (error) {
            console.error('Failed to initialize Scaledrone:', error);
        }
    }

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
        
        const step5 = step4.replace(/[^\w\s.,!?;:()[\]{}"'`~@#$%^&*+=|\\<>/]/g, ''); // Remove special characters but keep common punctuation
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

    function sendTextToLanghub(text, source = 'manual') {
        const cleanedText = cleanSelectedText(text);
        
        if (!cleanedText) {
            console.log('No text to send after cleaning');
            return;
        }

        const message = {
            type: 'text-selection',
            text: cleanedText,
            url: window.location.href,
            title: document.title,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            source: source // 'manual' for text selection, 'click' for paragraph click
        };

        webfuse.currentSession.sendMessage(message, "*");
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
        const selection = window.getSelection && window.getSelection();
        if (selection && selection.type === 'Range' && selection.toString().trim().length > 0) {
            return;
        }

        const paragraph = event.currentTarget;
        
        // Remove any existing selection highlights
        document.querySelectorAll('.text-selection-selected').forEach(el => {
            el.classList.remove('text-selection-selected');
        });
        
        // Add selection highlight to clicked paragraph
        paragraph.classList.add('text-selection-selected');
        
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
    }

    // Handle text selection (keep existing functionality)
    function handleTextSelection() {
        const selection = window.getSelection();
        const selectedText = selection.toString();

        if (selectedText && selectedText.trim().length > 0) {
            console.log('Text selected:', selectedText);
            sendTextToLanghub(selectedText, 'manual');
        }
    }

    // Handle mouse up events (when selection ends)
    function handleMouseUp(event) {
        // Small delay to ensure selection is complete
        setTimeout(() => {
            handleTextSelection();
        }, 100);
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
        
        return observer;
    }

    // Initialize the extension
    function initialize() {
        console.log('Text Selection Extension initialized');

        // Add CSS styles for clickable paragraphs
        addClickableStyles();

        // Load Scaledrone script if not already loaded
        if (typeof Scaledrone === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.scaledrone.com/scaledrone.min.js';
            script.onload = function() {
                console.log('Scaledrone script loaded');
                initializeScaledrone();
            };
            script.onerror = function() {
                console.error('Failed to load Scaledrone script');
            };
            document.head.appendChild(script);
        } else {
            initializeScaledrone();
        }

        // Make existing elements clickable
        makeElementsClickable();
        
        // Observe for new content
        observeContentChanges();

        // Add event listeners for manual text selection (keep existing functionality)
        document.addEventListener('mouseup', handleMouseUp);

        // Also listen for touch events on mobile
        document.addEventListener('touchend', handleMouseUp);
        
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
        
        // Remove styles
        const styles = document.getElementById('text-selection-extension-styles');
        if (styles) {
            styles.remove();
        }
        
        if (drone) {
            drone.close();
        }
        
        console.log('Text Selection Extension cleaned up');
    };

})();
