import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const TopBar = ({ 
  title, 
  subtitle, 
  isVocabIconBlinking = false,
  isTextbookIconBlinking = false,
  showBackLink = false,
  backLinkTo = '/classroom',
  backLinkText = 'Back to Classroom',
  onClose = null,
  isImmersiveMode = false,
  onToggleImmersiveMode = null
}) => {
  const [showTranslatePopover, setShowTranslatePopover] = useState(false);
  const [translationText, setTranslationText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('nl');
  const [targetLanguage, setTargetLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const popoverRef = useRef(null);

  // Common languages with flags and names
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
    { code: 'es', name: 'Spanish', flag: '🇪🇸' },
    { code: 'fr', name: 'French', flag: '🇫🇷' },
    { code: 'de', name: 'German', flag: '🇩🇪' },
    { code: 'it', name: 'Italian', flag: '🇮🇹' },
    { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
    { code: 'ru', name: 'Russian', flag: '🇷🇺' },
    { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
    { code: 'ko', name: 'Korean', flag: '🇰🇷' },
    { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
    { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  ];

  // Check if Chrome 138+ and Translator API available
  const isChrome138Plus = () => {
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
  };

  // Auto-translate when text changes
  useEffect(() => {
    if (!translationText.trim()) {
      setTranslatedText('');
      setIsTranslating(false);
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setTranslatedText('');
      setIsTranslating(false);
      return;
    }

    // Debounce translation
    const timeoutId = setTimeout(async () => {
      setIsTranslating(true);
      setTranslatedText('');

      try {
        const TranslatorAPI = typeof window !== 'undefined' ? window.Translator : undefined;
        if (!TranslatorAPI || !isChrome138Plus()) {
          setTranslatedText('Translation requires Chrome 138+ with Translator API support.');
          setIsTranslating(false);
          return;
        }

        const translator = await TranslatorAPI.create({
          sourceLanguage,
          targetLanguage,
        });

        const translated = await translator.translate(translationText);
        setTranslatedText(translated || 'Translation not available');
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedText(`Translation failed: ${error.message}`);
      } finally {
        setIsTranslating(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [translationText, sourceLanguage, targetLanguage]);

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!translatedText) return;

    try {
      await navigator.clipboard.writeText(translatedText);
      // Show brief success feedback
      const copyButton = document.querySelector('[data-copy-button]');
      if (copyButton) {
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '✓ Copied!';
        copyButton.classList.add('bg-green-600');
        setTimeout(() => {
          copyButton.innerHTML = originalText;
          copyButton.classList.remove('bg-green-600');
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        // Check if click is not on the translate button
        if (!event.target.closest('[data-translate-button]')) {
          setShowTranslatePopover(false);
        }
      }
    };

    if (showTranslatePopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showTranslatePopover]);

  // Swap languages
  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    if (translatedText) {
      setTranslationText(translatedText);
      setTranslatedText('');
    }
  };

  return (
    <div className="p-2 lg:p-2 border-b border-gray-700">
      <div className="flex items-center justify-between w-full">
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 lg:gap-3">
            {/* Back link inline with logo */}
            {showBackLink && (
              <>
                <Link
                  to={backLinkTo}
                  className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors group"
                >
                  <svg className="w-4 h-4 transform transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  {backLinkText}
                </Link>
                <span className="text-gray-600 text-sm">|</span>
              </>
            )}
            
            <h2 className="text-base lg:text-lg font-bold text-center text-blue-400 flex items-center gap-2">
              {isImmersiveMode && (
                <span className="text-gray-500 text-xs opacity-60">⋮⋮</span>
              )}
              ✨ langhub
            </h2>
          </div>
          
          {/* Title and subtitle if provided */}
          {title && (
            <div className="mt-2">
              <h1 className="text-xl lg:text-2xl font-bold text-white">{title}</h1>
              {subtitle && <p className="text-gray-400 text-xs lg:text-sm">{subtitle}</p>}
            </div>
          )}
          
          {/* Default tagline if no title provided */}
          {!title && (
            <p className="text-gray-500 text-xs">
              Turn the entire web into your language classroom
            </p>
          )}
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center gap-2 lg:gap-2">
          
          {/* User Profile Dropdown */}
          {true && (
            <>
              {/* Start Tour button (left-most) */}
              <button
                onClick={() => {
                  if (typeof window.startLanghubTour === 'function') {
                    window.startLanghubTour();
                  } else {
                    console.warn('Product tour is not available.');
                  }
                }}
                className="p-1 lg:p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors min-w-[32px] min-h-[32px] lg:min-w-0 lg:min-h-0"
                title="Start Tour"
                data-tour="tour-trigger"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.143 1.74-2 3.272-2 1.93 0 3.5 1.343 3.5 3s-1.57 3-3.5 3v1m0 3h.01" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>

              <Link
                to="/textbook"
                className="p-1 lg:p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors min-w-[32px] min-h-[32px] lg:min-w-0 lg:min-h-0"
                title="My Textbook"
              >
                <svg 
                  className={`w-5 h-5 lg:w-6 lg:h-6 ${isVocabIconBlinking ? 'new-word-icon-flash-animation' : ''} ${isTextbookIconBlinking ? 'textbook-icon-flash-animation' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" 
                  />
                </svg>
              </Link>

              {/* Immersive Mode Toggle - Hidden on mobile */}
              {onToggleImmersiveMode && (
                <button
                  onClick={onToggleImmersiveMode}
                  className={`hidden lg:flex p-1 lg:p-2 rounded-full transition-colors min-w-[32px] min-h-[32px] lg:min-w-0 lg:min-h-0 ${
                    isImmersiveMode 
                      ? 'text-blue-400 bg-blue-900/30 hover:bg-blue-800/50' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  title={isImmersiveMode ? "Exit Immersive Mode" : "Enter Immersive Mode"}
                  data-tour="immersive-toggle"
                >
                  <svg 
                    className="w-5 h-5 lg:w-6 lg:h-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    {isImmersiveMode ? (
                      // Exit fullscreen icon
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 9V4.5M9 9H4.5M9 9L3.5 3.5M15 9V4.5M15 9h4.5M15 9l5.5-5.5M9 15v4.5M9 15H4.5M9 15l-5.5 5.5M15 15v4.5M15 15h4.5M15 15l5.5 5.5" 
                      />
                    ) : (
                      // Enter fullscreen icon
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9M20.25 20.25h-4.5m4.5 0v-4.5m0 4.5L15 15" 
                      />
                    )}
                  </svg>
                </button>
              )}

              {/* Translate Button */}
              <div className="relative">
                <button
                  data-translate-button
                  onClick={() => setShowTranslatePopover(!showTranslatePopover)}
                  className="flex items-center hover:bg-gray-800 p-1 lg:p-2 rounded-full transition-colors min-w-[32px] min-h-[32px] lg:min-w-0 lg:min-h-0 text-gray-400 hover:text-white"
                  title="Translate"
                >
                  <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.083 9.5c.319-.9.652-1.784 1.001-2.649M15 19a18.022 18.022 0 003.917-2.5c.319-.9.652-1.784 1.001-2.649M9 17H3m6-10H3m9 7h6m-6-7h6m-6 3h3" />
                  </svg>
                </button>

                {/* Translate Popover */}
                {showTranslatePopover && (
                  <div
                    ref={popoverRef}
                    className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 p-4"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Translate</h3>
                        <button
                          onClick={() => setShowTranslatePopover(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Language Selectors */}
                      <div className="flex items-center gap-2">
                        {/* Source Language */}
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">From</label>
                          <select
                            value={sourceLanguage}
                            onChange={(e) => {
                              setSourceLanguage(e.target.value);
                              setTranslatedText('');
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {languages.map((lang) => (
                              <option key={lang.code} value={lang.code}>
                                {lang.flag} {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Swap Button */}
                        <button
                          onClick={handleSwapLanguages}
                          className="mt-6 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
                          title="Swap languages"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>

                        {/* Target Language */}
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">To</label>
                          <select
                            value={targetLanguage}
                            onChange={(e) => {
                              setTargetLanguage(e.target.value);
                              setTranslatedText('');
                            }}
                            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {languages.map((lang) => (
                              <option key={lang.code} value={lang.code}>
                                {lang.flag} {lang.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Input Field */}
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Text to translate</label>
                        <textarea
                          value={translationText}
                          onChange={(e) => setTranslationText(e.target.value)}
                          placeholder="Enter text to translate..."
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          rows={4}
                        />
                      </div>

                      {/* Translation Result */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs text-gray-400">Translation</label>
                          {isTranslating && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Translating...
                            </div>
                          )}
                        </div>
                        <div className="relative">
                          <div className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white text-sm min-h-[100px]">
                            {translatedText || (translationText.trim() && sourceLanguage === targetLanguage ? 'Select different languages to translate' : 'Translation will appear here...')}
                          </div>
                          {translatedText && (
                            <button
                              data-copy-button
                              onClick={handleCopyToClipboard}
                              className="absolute top-2 right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                              title="Copy to clipboard"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Link */}
              <Link
                to="/settings"
                className="flex items-center hover:bg-gray-800 p-1 lg:p-2 rounded-full transition-colors min-w-[32px] min-h-[32px] lg:min-w-0 lg:min-h-0 text-gray-400 hover:text-white"
                title="Settings"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Link>
            </>
          )}

          {/* Close button for mobile sidebar */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopBar; 