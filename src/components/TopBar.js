import React from 'react';
import { Link } from 'react-router-dom';

const TopBar = ({ 
  title, 
  subtitle, 
  showConnectionStatus = false, 
  connectionStatus = 'disconnected',
  onReconnect = null,
  isVocabIconBlinking = false,
  isTextbookIconBlinking = false,
  showBackLink = false,
  backLinkTo = '/classroom',
  backLinkText = 'Back to Classroom',
  onClose = null,
  isImmersiveMode = false,
  onToggleImmersiveMode = null
}) => {


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
            
            {/* Connection Status - only shown on Classroom */}
            {showConnectionStatus && (
              <div className="flex items-center justify-center gap-1 lg:gap-2">
                <div className={`inline-flex items-center p-1 rounded-full text-xs font-medium ${
                  connectionStatus === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : connectionStatus === 'error' 
                    ? 'bg-red-100 text-red-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' 
                      ? 'bg-green-500' 
                      : connectionStatus === 'error' 
                      ? 'bg-red-500' 
                      : 'bg-yellow-500'
                  }`}></div>
                </div>
                {(connectionStatus === 'error' || connectionStatus === 'disconnected') && onReconnect && (
                  <button
                    onClick={onReconnect}
                    className="px-1 lg:px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition duration-200 min-w-[24px] min-h-[24px] lg:min-w-0 lg:min-h-0"
                    title="Reconnect to Scaledrone"
                  >
                    ↻
                  </button>
                )}
              </div>
            )}
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