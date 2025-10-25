import React from 'react';
import ReactMarkdown from 'react-markdown';
import SelectedTextBlock from './SelectedTextBlock';
import TopBar from './TopBar';
import { useInteractiveText } from '../hooks/useInteractiveText';
import { processTextWithPrompt, processQuestionWorkflow, checkPromptAPIAvailability } from '../utils/promptAPI';

const TextResponse = ({ text, onWordAdded, actionType, getCurrentSource }) => {
  const { textContainerRef, renderInteractiveContent, Popup } = useInteractiveText(onWordAdded, getCurrentSource);

  return (
    <div className="w-full bg-gray-700/60 rounded-xl border border-gray-600/50 shadow-inner overflow-hidden">
      <div ref={textContainerRef} className="relative p-2 lg:p-3 text-gray-200 text-xs lg:text-sm">
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{renderInteractiveContent(children)}</p>,
            li: ({ children }) => <li className="text-xs lg:text-sm">{renderInteractiveContent(children)}</li>,
            h2: ({children}) => <h2 className="text-base lg:text-lg font-bold mb-2">{renderInteractiveContent(children)}</h2>,
            h3: ({children}) => <h3 className="text-sm lg:text-base font-bold mb-2">{renderInteractiveContent(children)}</h3>,
            blockquote: ({children}) => <blockquote className="border-l-4 border-gray-600 pl-2 lg:pl-3 italic text-gray-300 mb-2">{renderInteractiveContent(children)}</blockquote>,
          }}
        >
          {text}
        </ReactMarkdown>
        <Popup />
      </div>
    </div>
  );
};

const AiChatMessage = ({ text, onWordAdded, actionType, originalText, onGenerateExercises, getCurrentSource }) => {
  // Use simple text view for errors and feedback
  if (actionType === 'error' || actionType === 'feedback') {
    return (
      <div className={`rounded-xl border shadow-inner overflow-hidden p-3 lg:p-4 text-xs lg:text-sm ${
        actionType === 'error' 
          ? 'bg-red-900/20 border-red-600/30 text-red-100' 
          : 'bg-blue-900/20 border-blue-600/30 text-blue-100'
      }`}>
        <ReactMarkdown
          components={{
            p: ({ children }) => <p className="mb-2 lg:mb-3 last:mb-0 leading-relaxed">{children}</p>,
            li: ({ children }) => <li className="mb-1 ml-3 lg:ml-4 leading-relaxed">{children}</li>,
            ul: ({ children }) => <ul className="mb-2 lg:mb-3 list-disc space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="mb-2 lg:mb-3 list-decimal space-y-1 ml-3 lg:ml-4">{children}</ol>,
            h2: ({children}) => <h2 className="text-base lg:text-lg font-bold mb-2 lg:mb-3 text-white border-b border-gray-600 pb-1">{children}</h2>,
            h3: ({children}) => <h3 className="text-sm lg:text-base font-semibold mb-1 lg:mb-2 text-white">{children}</h3>,
            strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
            em: ({children}) => <em className="italic text-gray-300">{children}</em>,
            code: ({children}) => <code className="bg-gray-800/50 rounded px-1 lg:px-1.5 py-0.5 text-pink-300 text-xs font-mono">{children}</code>,
            blockquote: ({children}) => <blockquote className="border-l-4 border-gray-500 pl-3 lg:pl-4 italic text-gray-300 mb-2 lg:mb-3 bg-gray-800/30 py-2 rounded-r">{children}</blockquote>,
          }}
        >
          {text}
        </ReactMarkdown>
        
      </div>
    );
  }
  
  // Use text widget for questions and other conversational responses
  return <TextResponse text={text} onWordAdded={onWordAdded} actionType={actionType} getCurrentSource={getCurrentSource} />;
};

const UnifiedSidebar = ({ 
  mode, // 'desktop', 'mobile', 'immersive'
  selectedTexts,
  selectedTextsRef,
  setSelectedTexts,
  showHistory,
  setShowHistory,
  chatHistory,
  chatMessagesRef,
  currentMessage,
  setCurrentMessage,
  sendMessage,
  loadingAction,
  setLoadingAction,
  handleWordAddedToVocab,
  isListening,
  handleMicClick,
  isSpeechRecognitionSupported,
  showBrowserWarning,
  setShowBrowserWarning,
  getCurrentSource,
  // State setters for context
  setActiveQuestionContext,
  activeQuestionContext,
  setChatHistory,
  setIsTextbookIconBlinking,
  // TopBar props
  scaledroneStatus,
  reconnectScaledrone,
  isVocabIconBlinking,
  isTextbookIconBlinking,
  isImmersiveMode,
  toggleImmersiveMode,
  onClose,
  // Dragging props for immersive mode
  handleMouseDown,
  isDragging,
  // Resize handles for immersive mode
  handleResizeStart,
  // Desktop-only resizable width (pixels)
  desktopSidebarWidth,
  // Chat session management
  chatSessions,
  switchToChatSession,
  currentTextId
}) => {
  const isDesktop = mode === 'desktop';
  const isMobile = mode === 'mobile';
  const isImmersive = mode === 'immersive';

  const handleHistoryItemClick = (textId) => {
    const itemToMove = selectedTexts.find(t => t.id === textId);
    if (!itemToMove) return;

    const uncollapsedItem = { ...itemToMove, isCollapsed: false };
    const remainingItems = selectedTexts.filter(t => t.id !== textId);
    
    const newSelectedTexts = [...remainingItems, uncollapsedItem];

    setSelectedTexts(newSelectedTexts);
    setShowHistory(false);
  };

  const containerClasses = {
    desktop: "hidden lg:flex p-2 flex flex-col flex-shrink-0 h-full w-full",
    mobile: "h-full flex flex-col overflow-hidden",
    immersive: "relative flex flex-col h-full bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
  };

  const wrapperClasses = {
    desktop: "flex-1 flex flex-col bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg overflow-hidden",
    mobile: "flex-1 flex flex-col min-h-0",
    immersive: "flex-1 flex flex-col min-h-0"
  };

  return (
    <div className={containerClasses[mode]} style={isDesktop && desktopSidebarWidth ? { width: desktopSidebarWidth } : undefined}>
      <div className={wrapperClasses[mode]}>
        {/* TopBar */}
        <div 
          onMouseDown={isImmersive ? handleMouseDown : undefined}
          className={isImmersive ? `cursor-grab active:cursor-grabbing ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}` : ''}
        >
          <TopBar 
            onReconnect={reconnectScaledrone}
            isVocabIconBlinking={isVocabIconBlinking}
            isTextbookIconBlinking={isTextbookIconBlinking}
            isImmersiveMode={isImmersiveMode}
            onToggleImmersiveMode={toggleImmersiveMode}
            onClose={onClose}
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {selectedTexts.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4 lg:p-8">
              <div className="text-center text-gray-500">
                <div className="text-4xl lg:text-6xl mb-4">{isMobile ? '💬' : '⬅️'}</div>
                <p className="text-base lg:text-lg font-medium mb-2">Select text {isMobile ? 'to get started!' : 'from the page to get started!'}</p>
                <p className="text-xs lg:text-sm text-gray-600">Open any article, blog post, or news page in the main window.</p>
                <div className="mt-3 text-left max-w-md mx-auto">
                  <ul className="text-xs lg:text-sm text-gray-600 space-y-1 list-disc list-inside">
                    <li>Highlight any text to translate it and save words</li>
                    <li>Or click on a paragraph to send it here for questions</li>
                  </ul>
                  <p className="text-xs lg:text-sm text-gray-600 mt-3">Then use <span className="text-gray-400">Ask</span> to get explanations and practice.</p>
                </div>
              </div>
            </div>
          ) : showHistory ? (
            <>
              {/* History View */}
              <div className="p-2 flex-none">
                <div 
                  onClick={() => setShowHistory(false)}
                  className="w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl px-2 py-2 shadow-2xl border border-gray-700 hover:border-gray-600 transition-all duration-300 relative cursor-pointer group mb-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHistory(false);
                        }}
                        title="Back to current selection"
                        className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white rounded-lg transition-all duration-200 group-hover:scale-110 flex-shrink-0 flex items-center justify-center p-1 mr-2"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" transform="rotate(180)">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                      </button>
                      <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">
                        Chat History
                      </span>
                    </div>
                    <div className="bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-white rounded-lg transition-all duration-200 group-hover:scale-110 flex-shrink-0 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-3 w-3 transform rotate-180 transition-transform duration-300`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                  </div>
                </div>
                
                {/* Chat Sessions List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {console.log('chatSessions:', chatSessions, 'type:', typeof chatSessions, 'isArray:', Array.isArray(chatSessions))}
                  {!chatSessions || chatSessions.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-gray-400">No chat history yet</p>
                    </div>
                  ) : (
                    chatSessions.map((session) => (
                      <div
                        key={session.id}
                        onClick={() => switchToChatSession(session.textId)}
                        className={`w-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl px-3 py-2 shadow-lg border transition-all duration-300 cursor-pointer group ${
                          currentTextId === session.textId 
                            ? 'border-blue-500 bg-blue-900/20' 
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-300 group-hover:text-white transition-colors line-clamp-2">
                              {session.textContent}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">
                                {session.chatCount} messages
                              </span>
                              {session.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  • {session.lastMessageSender === 'ai' ? 'AI' : 'You'}: {session.lastMessage}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600 mt-1">
                              {new Date(session.lastUpdated).toLocaleDateString()} {new Date(session.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          {currentTextId === session.textId && (
                            <div className="ml-2 flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className={`flex-1 overflow-y-auto custom-scrollbar space-y-2 px-2 lg:px-4 pb-2 pt-2`}>
                {selectedTexts.slice(0, -1).reverse().map((text) => (
                  <div
                    key={text.id}
                    onClick={() => handleHistoryItemClick(text.id)}
                    className={`p-2 lg:p-3 bg-gray-800 rounded-lg border border-gray-700 text-xs lg:text-sm text-gray-300 cursor-pointer hover:bg-gray-750 transition-colors`}
                  >
                    {text.content}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* Default View (Current Selection & Chat) */}
              <div className="flex-none">
                
                {/* Current Selection */}
                <div ref={selectedTextsRef} className="p-2">
                  <SelectedTextBlock
                    key={selectedTexts[selectedTexts.length - 1].id}
                    content={selectedTexts[selectedTexts.length - 1].content}
                    source={selectedTexts[selectedTexts.length - 1].source}
                    isCollapsed={selectedTexts[selectedTexts.length - 1].isCollapsed}
                    onToggleCollapse={() => {
                      setSelectedTexts(prev =>
                        prev.map(text =>
                          text.id === selectedTexts[selectedTexts.length - 1].id ? { ...text, isCollapsed: !text.isCollapsed } : text
                        )
                      );
                    }}
                    hasHistory={selectedTexts.length > 1}
                    onShowHistory={() => setShowHistory(true)}
                    onAction={async (actionType) => {
                      setLoadingAction(actionType);
                      try {
                        if (selectedTexts.length === 0) {
                          console.error('No selected texts available');
                          setChatHistory(prev => [...prev, { 
                            text: 'No text selected. Please select some text first.', 
                            sender: 'ai', 
                            actionType: 'error' 
                          }]);
                          setLoadingAction(null);
                          return;
                        }
                        
                        const selectedText = selectedTexts[selectedTexts.length - 1].content;
                        
                        
                        // Use the new question workflow for question actions
                        let data;
                        if (actionType === 'question') {
                          data = await processQuestionWorkflow(selectedText, 'Dutch');
                        } else {
                          data = await processTextWithPrompt(selectedText, actionType);
                        }
                        
                        // Add the response to chat history for all action types
                        setChatHistory(prev => [...prev, { 
                          text: data.response, 
                          sender: 'ai', 
                          actionType: actionType
                        }]);
                        
                        // If it's a question action, set the question context for follow-ups
                        if (actionType === 'question' && data.actionType === 'question') {
                          setActiveQuestionContext({
                            originalText: selectedText,
                            question: data.response,
                          });
                        }
                        
                      } catch (error) {
                        console.error('Error processing text:', error);
                        
                        // Check if it's a Prompt API availability error
                        const availabilityCheck = checkPromptAPIAvailability();
                        if (!availabilityCheck.isAvailable) {
                          setChatHistory(prev => [...prev, { 
                            text: `AI features require Chrome 138+ with Prompt API support. ${availabilityCheck.error || 'Please update your browser.'}`, 
                            sender: 'ai', 
                            actionType: 'error' 
                          }]);
                        } else {
                          setChatHistory(prev => [...prev, { 
                            text: `Error processing text: ${error.message}`, 
                            sender: 'ai', 
                            actionType: 'error' 
                          }]);
                        }
                      } finally {
                        setLoadingAction(null);
                      }
                    }}
                    onWordAdded={handleWordAddedToVocab}
                    loadingAction={loadingAction}
                  />
                </div>
              </div>

              {/* Chat Section */}
              <div className={`flex-1 flex flex-col min-h-0 border-t border-gray-700 ${isMobile ? 'h-full' : ''}`}>
                {/* Chat Messages */}
                <div ref={chatMessagesRef} className={`flex-1 overflow-y-auto p-2 ${isDesktop ? 'lg:p-4' : ''} space-y-3 ${isDesktop ? 'lg:space-y-4' : ''} custom-scrollbar`}>
                  {console.log('chatHistory:', chatHistory, 'type:', typeof chatHistory, 'isArray:', Array.isArray(chatHistory))}
                  {chatHistory && Array.isArray(chatHistory) ? chatHistory.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={
                          msg.sender === 'user'
                            ? `max-w-[85%] ${isDesktop ? 'lg:max-w-[80%]' : ''} p-2 ${isDesktop ? 'lg:p-3' : ''} rounded-lg shadow-md bg-blue-600 text-white rounded-br-none text-sm ${isDesktop ? 'lg:text-base' : ''}`
                            : 'w-full'
                        }
                      >
                        {msg.sender === 'ai' ? (
                          <AiChatMessage 
                            text={msg.text} 
                            onWordAdded={handleWordAddedToVocab} 
                            actionType={msg.actionType}
                            originalText={msg.originalText}
                            getCurrentSource={getCurrentSource}
                          />
                        ) : (
                          msg.text
                        )}
                      </div>
                    </div>
                  )) : null}
                  {loadingAction && (
                    <div className="flex justify-start">
                      <div className={`max-w-[85%] ${isDesktop ? 'lg:max-w-[80%]' : ''} p-2 ${isDesktop ? 'lg:p-3' : ''} rounded-lg shadow-md bg-gray-700 text-gray-200 rounded-bl-none text-sm ${isDesktop ? 'lg:text-base' : ''}`}>
                        <div className="flex items-center">
                          <div className={`animate-spin rounded-full h-3 w-3 ${isDesktop ? 'lg:h-4 lg:w-4' : ''} border-b-2 border-white mr-2`}></div>
                          Thinking...
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className={`flex-none p-2 ${isDesktop ? 'lg:p-2' : ''} border-t border-gray-700`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') sendMessage(currentMessage);
                      }}
                      placeholder="Type your message..."
                      className={`flex-grow p-2 ${isDesktop ? 'lg:p-2' : ''} rounded-full bg-gray-800 border border-gray-600 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${isDesktop ? 'lg:text-base' : ''}`}
                      disabled={!!loadingAction}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="sentences"
                      spellCheck="true"
                    />
                    <button
                      onClick={() => sendMessage(currentMessage)}
                      className={`p-2 ${isDesktop ? 'lg:p-2' : ''} bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px] min-h-[40px]`}
                      disabled={!!loadingAction || !currentMessage.trim()}
                      title="Send Message"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDesktop ? 'lg:h-5 lg:w-5' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                    <div className="relative">
                      <button
                        onClick={handleMicClick}
                        className={`p-2 ${isDesktop ? 'lg:p-2' : ''} rounded-full shadow-md transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed min-w-[40px] min-h-[40px] ${
                          isListening
                            ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 animate-pulse'
                            : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
                        }`}
                        title="Speak"
                        disabled={!!loadingAction || !isSpeechRecognitionSupported}
                        onMouseEnter={() => !isSpeechRecognitionSupported && setShowBrowserWarning(true)}
                        onMouseLeave={() => setShowBrowserWarning(false)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDesktop ? 'lg:h-5 lg:w-5' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </button>
                      {showBrowserWarning && (
                        <div className={`absolute bottom-full mb-2 w-48 ${isDesktop ? 'lg:w-60' : ''} p-2 ${isDesktop ? 'lg:p-3' : ''} bg-gray-900 text-white text-xs ${isDesktop ? 'lg:text-sm' : ''} rounded-lg shadow-xl -translate-x-1/2 left-1/2`}>
                          Voice input is only supported on Chrome, Safari, and other Chromium-based browsers.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 transform rotate-45" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Resize Handles for Immersive Mode */}
        {isImmersive && (
          <>
            {/* Corner handles */}
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
              style={{ background: 'linear-gradient(-45deg, transparent 0%, transparent 30%, rgba(156, 163, 175, 0.5) 30%, rgba(156, 163, 175, 0.5) 100%)' }}
            />
            <div 
              className="absolute top-0 right-0 w-4 h-4 cursor-ne-resize"
              onMouseDown={(e) => handleResizeStart(e, 'top-right')}
            />
            <div 
              className="absolute bottom-0 left-0 w-4 h-4 cursor-sw-resize"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
            />
            <div 
              className="absolute top-0 left-0 w-4 h-4 cursor-nw-resize"
              onMouseDown={(e) => handleResizeStart(e, 'top-left')}
            />
            
            {/* Edge handles */}
            <div 
              className="absolute top-0 left-4 right-4 h-2 cursor-n-resize"
              onMouseDown={(e) => handleResizeStart(e, 'top')}
            />
            <div 
              className="absolute bottom-0 left-4 right-4 h-2 cursor-s-resize"
              onMouseDown={(e) => handleResizeStart(e, 'bottom')}
            />
            <div 
              className="absolute left-0 top-4 bottom-4 w-2 cursor-w-resize"
              onMouseDown={(e) => handleResizeStart(e, 'left')}
            />
            <div 
              className="absolute right-0 top-4 bottom-4 w-2 cursor-e-resize"
              onMouseDown={(e) => handleResizeStart(e, 'right')}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default UnifiedSidebar;
