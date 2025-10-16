import React, { useState, useRef, useEffect, useCallback } from 'react';
import Portal from '../components/Portal';
import { addWord } from '../utils/vocabularyStorage';

// This hook encapsulates all the logic for making text interactive.
export const useInteractiveText = (onWordAdded, getCurrentSource) => {
  const [translationPopup, setTranslationPopup] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAddingToVocab, setIsAddingToVocab] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const popupRef = useRef(null);
  const textContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  // Track word order for sequential selection
  const wordOrderRef = useRef([]);
  const [selectionStartIndex, setSelectionStartIndex] = useState(null);
  // Touch selection support
  const touchTimerRef = useRef(null);
  const isTouchSelectingRef = useRef(false);
  const touchStartPosRef = useRef({ x: 0, y: 0 });

  const calculatePosition = useCallback((rect) => {
    const { top, bottom, left, width } = rect;
    const isMobile = window.innerWidth < 768;
    const popupWidth = isMobile ? Math.min(320, window.innerWidth - 20) : 320;
    const popupHeight = isMobile ? 180 : 200;
    const margin = isMobile ? 10 : 15;
    const safeOffsetTop = typeof window.visualViewport !== 'undefined' ? (window.visualViewport.offsetTop || 0) : 0;

    // Use container width on mobile so popup fits within the scroll area
    const containerElement = textContainerRef.current;
    const containerRect = containerElement ? containerElement.getBoundingClientRect() : null;
    const availableWidth = isMobile && containerRect ? containerRect.width : window.innerWidth;

    let y, transformY, arrowSide;
    if (isMobile) {
      // On mobile, always show below the selection to avoid Chrome toolbar overlap
      y = bottom + margin;
      transformY = '0%';
      arrowSide = 'top';
    } else {
      // Desktop: prefer above when enough space, but account for visual viewport offset
      const visibleTop = top - safeOffsetTop;
      if (visibleTop > popupHeight + margin) {
        y = top - margin;
        transformY = '-100%';
        arrowSide = 'bottom';
      } else {
        y = bottom + margin;
        transformY = '0%';
        arrowSide = 'top';
      }
    }

    // Start with viewport x at the anchor center
    const anchorCenterViewportX = left + width / 2;
    let adjustedX;
    let adjustedY = y;
    let arrowOffset;
    if (isMobile && containerRect && containerElement) {
      const scrollLeft = containerElement.scrollLeft || 0;
      const scrollTop = containerElement.scrollTop || 0;
      const anchorCenterContainerX = anchorCenterViewportX - containerRect.left + scrollLeft;
      // Clamp within container width
      const minX = margin + popupWidth / 2;
      const maxX = availableWidth - margin - popupWidth / 2;
      const clampedContainerX = Math.max(minX, Math.min(maxX, anchorCenterContainerX));
      adjustedX = clampedContainerX;
      adjustedY = y - containerRect.top + scrollTop;
      // Clamp within container height on mobile to keep popup fully visible
      const minY = scrollTop + margin;
      const maxY = scrollTop + (containerRect.height - popupHeight - margin);
      adjustedY = Math.max(minY, Math.min(maxY, adjustedY));
      arrowOffset = anchorCenterContainerX - clampedContainerX;
    } else {
      // Desktop: clamp within viewport width
      const minX = margin + popupWidth / 2;
      const maxX = availableWidth - margin - popupWidth / 2;
      const clampedViewportX = Math.max(minX, Math.min(maxX, anchorCenterViewportX));
      adjustedX = clampedViewportX;
      arrowOffset = anchorCenterViewportX - clampedViewportX;
    }

    return {
      x: adjustedX,
      y: adjustedY,
      transform: `translate(-50%, ${transformY})`,
      arrowSide,
      arrowOffset,
      popupWidth
    };
  }, []);

  const handleTranslate = useCallback(async (text, rect) => {
    if (!text?.trim()) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;


    const position = calculatePosition(rect);
    setTranslationPopup({ text, position, translation: null, showSuccess: false, showError: null });
    // Notify that the translation popup has opened
    setTimeout(() => {
      try { window.dispatchEvent(new Event('langhub:translation-popup-open')); } catch {}
    }, 0);
    setIsTranslating(true);

    try {
      const targetLanguage = 'en';
      const isChrome138Plus = (() => {
        try {
          const nav = navigator;
          if (nav.userAgentData && Array.isArray(nav.userAgentData.brands)) {
            const edgeBrand = nav.userAgentData.brands.find(b => /Edg|Edge|Microsoft Edge/i.test(b.brand));
            const chromeBrand = nav.userAgentData.brands.find(b => /Google Chrome|Chromium|Chrome/i.test(b.brand));
            if (chromeBrand && !edgeBrand) {
              const major = parseInt(String(chromeBrand.version || '').split('.')[0], 10);
              if (!Number.isNaN(major) && major >= 138) return true;
            }
          }
          const ua = nav.userAgent || '';
          if (/Edg\//.test(ua)) return false;
          const m = ua.match(/Chrome\/(\d+)/);
          if (m && parseInt(m[1], 10) >= 138) return true;
        } catch {}
        return false;
      })();

      // Use on-device translation via Chrome's Translator API
      const TranslatorAPI = typeof window !== 'undefined' ? window.Translator : undefined;
      if (TranslatorAPI && isChrome138Plus) {
        try {
          const sourceLanguage = targetLanguage !== 'en' ? 'en' : 'nl';
          const translator = await TranslatorAPI.create({
            sourceLanguage,
            targetLanguage,
          });
          if (abortController.signal.aborted) return;
          const translated = await translator.translate(text);
          if (abortController.signal.aborted) return;
          setTranslationPopup(prev => prev ? { ...prev, translation: translated, showSuccess: false } : null);
          return;
        } catch (e) {
          console.error('Client-side translation failed:', e);
          setTranslationPopup(prev => prev ? { ...prev, translation: 'Translation not available' } : null);
          return;
        }
      } else {
        // Translator API not available
        setTranslationPopup(prev => prev ? { ...prev, translation: 'Translation requires Chrome 138+' } : null);
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Translation error:', error);
        setTranslationPopup(prev => prev ? { ...prev, translation: 'Translation failed' } : null);
      }
    } finally {
      setIsTranslating(false);
    }
  }, [calculatePosition]);
  
  const handleAddToVocab = useCallback(async (word) => {
    if (!word?.trim() || isAddingToVocab) return;
    setIsAddingToVocab(true);
    try {
      const result = addWord({
        word: word,
        translation: translationPopup?.translation || '',
        language: 'auto',
        targetLanguage: 'en',
        addedAt: new Date().toISOString(),
        source: getCurrentSource ? (getCurrentSource() || null) : null
      });

      if (result.success) {
        setTranslationPopup(prev => prev ? { ...prev, showSuccess: true, showError: null } : null);
        if (onWordAdded) onWordAdded(); // Trigger the callback
        setTimeout(() => {
          setTranslationPopup(null);
          setSelectedWords([]);
          setSelectionStartIndex(null);
        }, 2000);
      } else {
        if (result.error === 'Word already exists') {
          setTranslationPopup(prev => prev ? { ...prev, showSuccess: false, showError: 'Already exists' } : null);
        } else {
          setTranslationPopup(prev => prev ? { ...prev, showSuccess: false, showError: 'Error' } : null);
        }
      }
    } catch (error) {
      console.error('Error adding to vocabulary:', error);
      setTranslationPopup(prev => prev ? { ...prev, showSuccess: false, showError: 'Error' } : null);
    } finally {
      setIsAddingToVocab(false);
    }
  }, [isAddingToVocab, translationPopup, onWordAdded, getCurrentSource]);


  const handleWordMouseDown = useCallback((event, word, wordIndex) => {
    event.preventDefault();
    event.stopPropagation();
    if (!word?.trim()) return;
    setIsDragging(true);
    setSelectedWords([word]);
    setSelectionStartIndex(wordIndex);
  }, []);

  const handleWordMouseEnter = useCallback((event, word, wordIndex) => {
    if (!isDragging || !word?.trim() || selectionStartIndex === null) return;
    event.preventDefault();
    event.stopPropagation();
    
    // Only allow sequential selection
    const startIndex = selectionStartIndex;
    const currentIndex = wordIndex;
    
    // Determine the range (start to current or current to start)
    const minIndex = Math.min(startIndex, currentIndex);
    const maxIndex = Math.max(startIndex, currentIndex);
    
    // Get all words in the sequential range
    const sequentialWords = wordOrderRef.current.slice(minIndex, maxIndex + 1);
    
    setSelectedWords(sequentialWords);
  }, [isDragging, selectionStartIndex]);

  // Helper to open translation from current selectedWords on mobile after state updates
  const openTranslationFromSelection = useCallback(() => {
    if (!textContainerRef.current) return;
    setTimeout(() => {
      const spanElements = Array.from(textContainerRef.current.querySelectorAll('.word-selected'));
      if (spanElements.length > 0) {
        const firstRect = spanElements[0].getBoundingClientRect();
        const lastRect = spanElements[spanElements.length - 1].getBoundingClientRect();
        const combinedRect = {
          top: firstRect.top,
          bottom: lastRect.bottom,
          left: firstRect.left,
          right: lastRect.right,
          width: lastRect.right - firstRect.left,
          height: lastRect.bottom - firstRect.top,
        };
        const selectedText = (wordOrderRef.current || []).filter(w => selectedWords.includes(w)).join(' ');
        const text = selectedWords.length ? selectedWords.join(' ') : selectedText;
        if (text?.trim()) handleTranslate(text, combinedRect);
      }
    }, 30);
  }, [handleTranslate, selectedWords]);

  // Touch handlers: long-press to start selection, tap to extend range
  const LONG_PRESS_MS = 350;
  const TOUCH_MOVE_CANCEL_PX = 12;

  const handleWordTouchStart = useCallback((event, word, wordIndex) => {
    if (!word?.trim()) return;
    const touch = event.touches && event.touches[0];
    if (touch) {
      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };
    }
    if (touchTimerRef.current) clearTimeout(touchTimerRef.current);
    isTouchSelectingRef.current = false;
    touchTimerRef.current = setTimeout(() => {
      // Long press fired: begin selection anchor
      isTouchSelectingRef.current = true;
      setSelectedWords([word]);
      setSelectionStartIndex(wordIndex);
    }, LONG_PRESS_MS);
  }, []);

  const handleWordTouchMove = useCallback((event) => {
    // If user scrolls/moves finger significantly before long-press, cancel
    if (!touchTimerRef.current) return;
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);
    if (dx > TOUCH_MOVE_CANCEL_PX || dy > TOUCH_MOVE_CANCEL_PX) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }
  }, []);

  const handleWordTouchEnd = useCallback((event, word, wordIndex) => {
    // If timer still pending and no selection started, it's a simple tap → ignore
    if (touchTimerRef.current) {
      clearTimeout(touchTimerRef.current);
      touchTimerRef.current = null;
    }

    // If a long-press previously started selection, treat this as range extension via tap
    if (isTouchSelectingRef.current && selectionStartIndex !== null && word?.trim()) {
      event.preventDefault();
      event.stopPropagation();
      const minIndex = Math.min(selectionStartIndex, wordIndex);
      const maxIndex = Math.max(selectionStartIndex, wordIndex);
      const sequentialWords = wordOrderRef.current.slice(minIndex, maxIndex + 1);
      setSelectedWords(sequentialWords);
      // Open translation for the selected range
      openTranslationFromSelection();
    }
  }, [selectionStartIndex, openTranslationFromSelection]);
  
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        if (selectedWords.length > 0 && textContainerRef.current) {
          const spanElements = Array.from(textContainerRef.current.querySelectorAll('.word-selected'));
          if (spanElements.length > 0) {
            let firstRect = spanElements[0].getBoundingClientRect();
            let lastRect = spanElements[spanElements.length - 1].getBoundingClientRect();
            const combinedRect = {
              top: firstRect.top, bottom: lastRect.bottom, left: firstRect.left, right: lastRect.right, width: lastRect.right - firstRect.left, height: lastRect.bottom - firstRect.top,
            };
            const selectedText = selectedWords.join(' ');
            handleTranslate(selectedText, combinedRect);
          }
        }
        // setSelectedWords([]); // REMOVED: Don't clear words when popup opens
      }
    };
    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, selectedWords, handleTranslate]);

  // This new effect handles closing the popup and clearing highlights
  // when the user clicks outside of the popup or the interactive text area.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target) && !event.target.closest('.word-clickable')) {
        setTranslationPopup(null);
        setSelectedWords([]);
        setSelectionStartIndex(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const renderInteractiveContent = useCallback((nodes) => {
    const renderClickableWords = (text) => {
      const words = text.split(/(\s+)/);
      const clickableWords = [];
      let wordIndex = 0;
      
      const result = words.map((word, index) => {
        if (word.trim() === '') return <span key={index}>{word}</span>;
        
        const cleanWord = word.replace(/[^\w\s'-]/g, '').trim();
        const currentWordIndex = wordIndex;
        clickableWords.push(cleanWord);
        wordIndex++;
        
        const isSelected = selectedWords.includes(cleanWord);
        return (
          <span
            key={index}
            className={`word-clickable cursor-pointer transition-colors duration-150 ease-in-out inline-block ${isSelected ? 'bg-blue-600 text-white rounded word-selected' : 'hover:border-blue-400'}`}
            style={{ 
              padding: '0 2px',
              borderBottom: isSelected ? 'none' : '1px dashed rgba(156, 163, 175, 0.6)',
              boxSizing: 'border-box',
              display: 'inline-block'
            }}
            onMouseDown={(e) => handleWordMouseDown(e, cleanWord || word, currentWordIndex)}
            onMouseEnter={(e) => handleWordMouseEnter(e, cleanWord || word, currentWordIndex)}
            onTouchStart={(e) => handleWordTouchStart(e, cleanWord || word, currentWordIndex)}
            onTouchMove={handleWordTouchMove}
            onTouchEnd={(e) => handleWordTouchEnd(e, cleanWord || word, currentWordIndex)}
          >
            {word}
          </span>
        );
      });
      
      // Store word order in ref to avoid re-renders
      wordOrderRef.current = clickableWords;
      
      return result;
    };
    
    return React.Children.map(nodes, (node) => {
      if (typeof node === 'string') {
        return renderClickableWords(node);
      }
      if (React.isValidElement(node) && node.props.children) {
        return React.cloneElement(node, { ...node.props, children: renderInteractiveContent(node.props.children) });
      }
      return node;
    });
  }, [
    selectedWords,
    handleWordMouseDown,
    handleWordMouseEnter,
    handleWordTouchStart,
    handleWordTouchMove,
    handleWordTouchEnd,
  ]);


  const Popup = () => {
    if (!(translationPopup && translationPopup.position)) return null;
    const isMobile = window.innerWidth < 768;

    const popupContent = (
      <div
        ref={popupRef}
        className={`${isMobile ? 'absolute' : 'fixed'} z-[10050] bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-3 lg:p-4 transition-all duration-200`}
        style={{
          left: `${translationPopup.position.x}px`,
          top: `${translationPopup.position.y}px`,
          transform: translationPopup.position.transform,
          width: `${translationPopup.position.popupWidth}px`,
          pointerEvents: 'auto'
        }}
        data-tour="translation-popup-area"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs lg:text-sm font-medium text-blue-400 break-all mr-2">{translationPopup.text || ''}</span>
          <div className="flex items-center gap-1 lg:gap-2 flex-shrink-0">
            <button
              onClick={() => {
                setTranslationPopup(null);
                setSelectedWords([]);
                setSelectionStartIndex(null);
              }}
              className="w-6 h-6 lg:w-7 lg:h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="text-xs lg:text-sm text-gray-200 mb-2 lg:mb-3 break-words">
          {isTranslating ? (
            <div className="flex items-center"><div className="animate-spin rounded-full h-2 w-2 lg:h-3 lg:w-3 border-b-2 border-blue-400 mr-2"></div>Translating...</div>
          ) : (
            translationPopup.translation || ''
          )}
        </div>
        {!isTranslating && translationPopup.translation && (
          <button
            onClick={() => handleAddToVocab(translationPopup.text || '')}
            disabled={isAddingToVocab || translationPopup.showSuccess || translationPopup.showError}
            className={`w-full text-white text-xs lg:text-sm font-medium py-2 px-2 lg:px-3 rounded-md transition-colors duration-200 flex items-center justify-center gap-1 lg:gap-2 min-h-[36px] lg:min-h-0 ${
              translationPopup.showSuccess
                ? 'bg-green-600 cursor-default'
                : translationPopup.showError
                ? 'bg-red-600 cursor-default'
                : isAddingToVocab
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {translationPopup.showSuccess
              ? 'Added!'
              : translationPopup.showError
              ? (translationPopup.showError || 'Error')
              : isAddingToVocab
              ? 'Adding...'
              : 'Add to my vocab'}
          </button>
        )}
        <div
          className="absolute w-3 h-3 bg-gray-800 border-gray-600 transform rotate-45"
          style={{
            left: `calc(50% + ${translationPopup.position.arrowOffset || 0}px)`,
            ...(translationPopup.position.arrowSide === 'bottom'
              ? { bottom: '-7px', borderTop: 'none', borderLeft: 'none', borderRight: '1px solid', borderBottom: '1px solid' }
              : { top: '-7px', borderBottom: 'none', borderRight: 'none', borderTop: '1px solid', borderLeft: '1px solid' }),
            marginLeft: '-6px'
          }}
        />
      </div>
    );

    // On mobile, render inline so it positions relative to the scrollable text container.
    return window.innerWidth < 768 ? popupContent : (
      <Portal>
        {popupContent}
      </Portal>
    );
  };

  return { textContainerRef, renderInteractiveContent, Popup };
};
