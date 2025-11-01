import React, { useState, useEffect } from 'react';
import { useInteractiveText } from '../hooks/useInteractiveText';
import { detectLanguage, isLanguageDetectorAvailable, isChrome138Plus } from '../utils/languageDetection';

const ActionButton = ({ onClick, icon, label, isLoading, isDisabled }) => (
  <button
    onClick={onClick}
    disabled={isDisabled}
    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
      isLoading
        ? 'gradient-border-animation text-gray-400 cursor-wait'
        : isDisabled
        ? 'bg-gray-800 border-2 border-gray-700 text-gray-500 cursor-not-allowed'
        : 'bg-gray-800 border-2 border-gray-700 text-gray-300 hover:text-white hover:scale-[1.02] transform hover:gradient-border-animation'
    }`}
  >
    <span className={`w-5 h-5 flex items-center justify-center rounded text-xs font-medium ${isLoading ? '' : 'bg-gray-700'}`}>
      {isLoading ? (
        <div className="w-3 h-3 border-2 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
      ) : (
        icon
      )}
    </span>
    {label}
  </button>
);

export default function SelectedTextBlock({ content, source, isCollapsed, onToggleCollapse, onAction, onWordAdded, loadingAction, hasHistory, onShowHistory, type, imageData, imageUrl, alt }) {
  // Language detection state
  const [languageInfo, setLanguageInfo] = useState(null);
  const [isDetectingLanguage, setIsDetectingLanguage] = useState(false);
  const [languageDetectionError, setLanguageDetectionError] = useState(null);

  const isImage = type === 'image';
  
  // Provide source getter so vocabulary saves use the selection's page source instead of the app URL
  const getCurrentSource = React.useCallback(() => source || null, [source]);
  const { textContainerRef, renderInteractiveContent, Popup } = useInteractiveText(onWordAdded, getCurrentSource);

  // Detect language when content changes
  useEffect(() => {
    const detectTextLanguage = async () => {
      if (!content || content.trim().length < 3) {
        setLanguageInfo(null);
        return;
      }

      // Check if language detection is available
      if (!isLanguageDetectorAvailable() || !isChrome138Plus()) {
        setLanguageDetectionError('Language detection requires Chrome 138+');
        return;
      }

      setIsDetectingLanguage(true);
      setLanguageDetectionError(null);

      try {
        const result = await detectLanguage(content);
        setLanguageInfo(result);
      } catch (error) {
        console.error('Language detection failed:', error);
        setLanguageDetectionError('Failed to detect language');
      } finally {
        setIsDetectingLanguage(false);
      }
    };

    detectTextLanguage();
  }, [content]);
  
  return (
    <div className="w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl px-2 py-2 shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 relative">
      <div className="flex justify-between items-center cursor-pointer group" onClick={onToggleCollapse}>
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          {hasHistory && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowHistory();
              }}
              title="Show previous selections"
              className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white rounded-lg transition-all duration-200 group-hover:scale-110 flex-shrink-0 flex items-center justify-center p-1 mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
          )}
          
          {/* Language Detection Display */}
          {languageInfo && (
            <div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg px-2 py-1 mr-2 flex-shrink-0">
              <span className="text-sm">{languageInfo.flag}</span>
              <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                {languageInfo.name}
              </span>
              {languageInfo.confidence > 0 && (
                <span className="text-xs text-gray-400">
                  ({Math.round(languageInfo.confidence * 100)}%)
                </span>
              )}
            </div>
          )}
          
          {isDetectingLanguage && (
            <div className="flex items-center space-x-1 bg-gray-700/50 rounded-lg px-2 py-1 mr-2 flex-shrink-0">
              <div className="w-3 h-3 border-2 border-transparent border-t-blue-400 rounded-full animate-spin"></div>
              <span className="text-xs text-gray-400">Detecting...</span>
            </div>
          )}
          
          {languageDetectionError && (
            <div className="flex items-center space-x-1 bg-red-900/30 rounded-lg px-2 py-1 mr-2 flex-shrink-0">
              <span className="text-xs text-red-400">❓</span>
              <span className="text-xs text-red-400">Unknown</span>
            </div>
          )}

          {source ? (
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors truncate" title={source.title || source.url}>
                {source.title || source.url}
              </span>
            </div>
          ) : (
            <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
              Selected Text
            </span>
          )}
        </div>
        <button className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white rounded-lg transition-all duration-200 group-hover:scale-110 flex-shrink-0 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-3 w-3 transform ${isCollapsed ? 'rotate-180' : 'rotate-0'} transition-transform duration-300`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="mt-4 space-y-4" data-tour="selected-text">
          {isImage ? (
            <div className="flex flex-col items-center">
              <img
                src={imageData || imageUrl}
                alt={alt || 'Selected image'}
                className="max-w-full h-auto rounded-lg border border-gray-600 shadow-lg"
                style={{ maxHeight: '400px' }}
                onError={(e) => {
                  // Fallback to imageUrl if data URL fails
                  if (imageData && imageUrl) {
                    e.target.src = imageUrl;
                  }
                }}
              />
              {alt && (
                <p className="text-xs text-gray-400 mt-2 italic">{alt}</p>
              )}
            </div>
          ) : (
            <div ref={textContainerRef} className="text-gray-200 text-sm leading-relaxed">
              {renderInteractiveContent(content)}
            </div>
          )}
          <Popup />
        
          <div className="grid grid-cols-2 gap-3" data-tour="translation-actions">
            <ActionButton 
              onClick={() => onAction('question')} 
              icon="?" 
              label={isImage ? "Ask about this image" : "Ask me a question"} 
              isLoading={loadingAction === 'question'}
              isDisabled={!!loadingAction}
            />
          </div>
        </div>
      )}
    </div>
  );
} 