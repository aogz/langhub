import React, { useState, useRef, useEffect, useCallback } from 'react';
import Portal from './Portal';
import { addWord } from '../utils/vocabularyStorage';
import { detectLanguage } from '../utils/languageDetection';

// This hook encapsulates all the logic for making text interactive.
// detectedSourceLanguage: optional pre-detected language code to skip per-word detection
export const useInteractiveText = (onWordAdded, getCurrentSource = null, detectedSourceLanguage = null) => {
  const [translationPopup, setTranslationPopup] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isAddingToVocab, setIsAddingToVocab] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const popupRef = useRef(null);
  const textContainerRef = useRef(null);
  const abortControllerRef = useRef(null);
  const wordOrderRef = useRef([]);
  const [selectionStartIndex, setSelectionStartIndex] = useState(null);

  const calculatePosition = useCallback((rect) => {
    const { top, bottom, left, width } = rect;
    const popupWidth = 320;
    const popupHeight = 200;
    const margin = 15;
    const viewportWidth = window.innerWidth;

    let y, transformY, arrowSide;
    if (top > popupHeight + margin) {
      y = top - margin;
      transformY = '-100%';
      arrowSide = 'bottom';
    } else {
      y = bottom + margin;
      transformY = '0%';
      arrowSide = 'top';
    }

    let x = left + width / 2;
    if (x - popupWidth / 2 < margin) {
      x = margin + popupWidth / 2;
    } else if (x + popupWidth / 2 > viewportWidth - margin) {
      x = viewportWidth - margin - popupWidth / 2;
    }
    
    const arrowOffset = (left + width / 2) - x;

    return { x, y, transform: `translate(-50%, ${transformY})`, arrowSide, arrowOffset };
  }, []);

  const handleTranslate = useCallback(async (text, rect) => {
    if (!text?.trim()) return;
    if (abortControllerRef.current) abortControllerRef.current.abort();
    const abortController = new AbortController();
    abortControllerRef.current = abortController;


    const position = calculatePosition(rect);
    setTranslationPopup({ text, position, translation: null, showSuccess: false, showError: null });
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
          // Use pre-detected language if available, otherwise detect from the selected text
          let sourceLanguage = detectedSourceLanguage || 'nl'; // Default fallback to Dutch
          
          if (!detectedSourceLanguage) {
            try {
              const detectionResult = await detectLanguage(text);
              if (detectionResult && detectionResult.detectedLanguage && detectionResult.detectedLanguage !== 'unknown') {
                sourceLanguage = detectionResult.detectedLanguage;
                console.log('Detected source language:', sourceLanguage, 'for text:', text.substring(0, 50));
              }
            } catch (detectionError) {
              console.warn('Language detection failed, using default (Dutch):', detectionError);
            }
          } else {
            console.log('Using pre-detected source language:', sourceLanguage);
          }
          
          // If source and target languages are the same, don't translate
          if (sourceLanguage === targetLanguage) {
            setTranslationPopup(prev => prev ? { ...prev, translation: text, showSuccess: false } : null);
            return;
          }
          
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
      });

      if (result.success) {
        setTranslationPopup(prev => prev ? { ...prev, showSuccess: true, showError: null } : null);
        if (onWordAdded) onWordAdded();
        setTimeout(() => setTranslationPopup(prev => prev ? { ...prev, showSuccess: false } : null), 2000);
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
  }, [isAddingToVocab, translationPopup, onWordAdded]);


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
    
    const startIndex = selectionStartIndex;
    const currentIndex = wordIndex;
    
    const minIndex = Math.min(startIndex, currentIndex);
    const maxIndex = Math.max(startIndex, currentIndex);
    
    const sequentialWords = wordOrderRef.current.slice(minIndex, maxIndex + 1);
    
    setSelectedWords(sequentialWords);
  }, [isDragging, selectionStartIndex]);
  
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
              top: firstRect.top, 
              bottom: lastRect.bottom, 
              left: firstRect.left, 
              right: lastRect.right, 
              width: lastRect.right - firstRect.left, 
              height: lastRect.bottom - firstRect.top,
            };
            const selectedText = selectedWords.join(' ');
            handleTranslate(selectedText, combinedRect);
          }
        }
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, selectedWords, handleTranslate]);

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


  const renderInteractiveContent = useCallback((nodes) => {
    const renderClickableWords = (text) => {
      const words = text.split(/(\s+)/);
      const clickableWords = [];
      let wordIndex = 0;
      
      const result = words.map((word, index) => {
        if (word.trim() === '') return <span key={index}>{word}</span>;
        
        // Preserve Unicode characters - only remove control characters and zero-width characters
        // Keep all letters (including accented, Cyrillic, Chinese, Japanese, Arabic, etc.), numbers, and common punctuation
        // eslint-disable-next-line no-control-regex
        const cleanWord = word.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '').trim() || word.trim();
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
          >
            {word}
          </span>
        );
      });
      
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
  }, [selectedWords, handleWordMouseDown, handleWordMouseEnter]);


  const Popup = () => (
    translationPopup && translationPopup.position ? (
      <Portal>
        <div ref={popupRef} className="fixed z-[9999] bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-4 transition-all duration-200" style={{left: `${translationPopup.position.x}px`, top: `${translationPopup.position.y}px`, transform: translationPopup.position.transform, width: '320px', pointerEvents: 'auto'}}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-400 break-all mr-2">{translationPopup.text || ''}</span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => {
                setTranslationPopup(null);
                setSelectedWords([]);
                setSelectionStartIndex(null);
              }} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-200 mb-3 break-words">
            {isTranslating ? (<div className="flex items-center"><div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400 mr-2"></div>Translating...</div>) : (translationPopup.translation || '')}
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={() => handleAddToVocab(translationPopup.text || '')}
              disabled={isAddingToVocab}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              {isAddingToVocab ? (
                <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              )}
              {translationPopup.showSuccess ? 'Added!' : translationPopup.showError || 'Add to vocab'}
            </button>
          </div>
        </div>
      </Portal>
    ) : null
  );

  return {
    textContainerRef,
    renderInteractiveContent,
    Popup
  };
};

// Main InteractiveText component
export default function InteractiveText({ children, className = "", onWordAdded }) {
  const { textContainerRef, renderInteractiveContent, Popup } = useInteractiveText(onWordAdded);
  
  return (
    <div className={className}>
      <div ref={textContainerRef} className="text-gray-200 leading-relaxed">
        {renderInteractiveContent(children)}
      </div>
      <Popup />
    </div>
  );
} 