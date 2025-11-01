import React, { useState, useRef, useEffect, useCallback } from 'react';
import Portal from './Portal';
import UnifiedSidebar from './UnifiedSidebar';
import { processTextWithPrompt, processQuestionWorkflow, processAnswerEvaluationWorkflow, checkPromptAPIAvailability } from '../utils/promptAPI';
import { 
  getChatHistoryForText, 
  saveChatHistoryForText, 
  createChatSession, 
  getAllChatSessions
} from '../utils/chatHistoryStorage';

export default function Classroom() {
  
  // State to hold selected text items, each with an ID, content, and collapsed state
  const [selectedTexts, setSelectedTexts] = useState([]);
  // State to hold chat messages
  const [chatHistory, setChatHistory] = useState([]);
  // State for the current message being typed by the user
  const [currentMessage, setCurrentMessage] = useState('');
  // State to manage the loading indicator for AI responses
  const [loadingAction, setLoadingAction] = useState(null); // 'question' or null
  // State to manage the history dropdown visibility
  const [showHistory, setShowHistory] = useState(false);
  // State for current text ID (for chat session management)
  const [currentTextId, setCurrentTextId] = useState(null);
  // State for chat sessions (for history dropdown)
  const [chatSessions, setChatSessions] = useState([]);

  const [activeQuestionContext, setActiveQuestionContext] = useState({ originalText: null, question: null });
  // Speech Recognition State
  const [isListening, setIsListening] = useState(false);
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
  const recognitionRef = useRef(null);
  // Audio recording state
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  // Ref for the chat messages container to enable auto-scrolling
  const chatMessagesRef = useRef(null);
  // Ref for the selected texts container to enable auto-scrolling
  const selectedTextsRef = useRef(null);

  const [isVocabIconBlinking, setIsVocabIconBlinking] = useState(false);
  const [isTextbookIconBlinking, setIsTextbookIconBlinking] = useState(false);
  
  
  // Mobile sidebar state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Immersive mode state
  const [isImmersiveMode, setIsImmersiveMode] = useState(false);
  // Desktop sidebar width (px), resizable on desktop only
  const [desktopSidebarWidth, setDesktopSidebarWidth] = useState(480);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const sidebarResizeStartXRef = useRef(0);
  const sidebarStartWidthRef = useRef(0);
  
  // Floating window drag and resize state
  const [floatingWindowPosition, setFloatingWindowPosition] = useState({ x: 0, y: 0 });
  const [floatingWindowSize, setFloatingWindowSize] = useState({ width: 600, height: 700 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const floatingWindowRef = useRef(null);
  
  // User preferences loading state

  // Load chat sessions for history dropdown
  const loadChatSessions = useCallback(() => {
    const sessions = getAllChatSessions();
    setChatSessions(sessions);
  }, []);

  // Load chat history for a specific text
  const loadChatHistoryForText = useCallback((textId) => {
    const history = getChatHistoryForText(textId);
    setChatHistory(history);
    setCurrentTextId(textId);
  }, []);

  // Save current chat history
  const saveCurrentChatHistory = useCallback(() => {
    if (currentTextId && chatHistory.length > 0) {
      saveChatHistoryForText(currentTextId, chatHistory);
    }
  }, [currentTextId, chatHistory]);

  // Create new chat session for text
  const createNewChatSession = useCallback((textId, textContent, source) => {
    createChatSession(textId, textContent, source);
    setChatHistory([]);
    setCurrentTextId(textId);
    loadChatSessions();
  }, [loadChatSessions]);

  // Switch to a different chat session
  const switchToChatSession = useCallback((textId) => {
    // Save current chat history before switching
    saveCurrentChatHistory();
    
    // Load the selected chat session
    loadChatHistoryForText(textId);
    
    // Close history dropdown
    setShowHistory(false);
  }, [saveCurrentChatHistory, loadChatHistoryForText]);

  // Load chat sessions on component mount
  useEffect(() => {
    loadChatSessions();
  }, [loadChatSessions]);

  // Save chat history whenever it changes
  useEffect(() => {
    if (currentTextId && chatHistory.length > 0) {
      const timeoutId = setTimeout(() => {
        saveChatHistoryForText(currentTextId, chatHistory);
      }, 1000); // Debounce saves by 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentTextId, chatHistory]);

  // Function to handle sending a message (user or AI)
  const sendMessage = useCallback(async (message, sender = 'user') => {
    if (!message.trim()) return;

    // Add user message to chat history
    setChatHistory(prev => [...prev, { text: message, sender }]);
    setCurrentMessage(''); // Clear input field
    
    // Immediately scroll to bottom when user sends a message
    if (sender === 'user' && chatMessagesRef.current) {
      requestAnimationFrame(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      });
    }

    // If it's a user message, get AI response from backend
    if (sender === 'user') {
      setLoadingAction('question'); // Set loading action for user messages
      try {
        const isAnsweringQuestion = activeQuestionContext.question && activeQuestionContext.originalText;
        
        let requestBody;
        if (isAnsweringQuestion) {
          requestBody = {
            text: message,
            actionType: 'answer',
            originalText: activeQuestionContext.originalText,
            originalQuestion: activeQuestionContext.question,
          };
        } else {
          requestBody = {
            text: message,
            actionType: 'question',
          };
        }

        // Use the appropriate workflow based on action type
        let data;
        if (requestBody.actionType === 'question') {
          data = await processQuestionWorkflow(requestBody.originalText || message);
        } else if (requestBody.actionType === 'answer') {
          // Use answer evaluation workflow for answering questions
          data = await processAnswerEvaluationWorkflow(
            requestBody.originalText,
            requestBody.originalQuestion,
            message,
            chatHistory
          );
        } else {
          data = await processTextWithPrompt(message, requestBody.actionType, {
            originalText: requestBody.originalText,
            originalQuestion: requestBody.originalQuestion
          });
        }

        setChatHistory(prev => [...prev, { text: data.response, sender: 'ai', actionType: data.actionType }]);
        
        // Handle different response types
        if (data.actionType === 'question') {
          // Set up new question context
          setActiveQuestionContext({
            originalText: isAnsweringQuestion ? activeQuestionContext.originalText : message,
            question: data.response,
          });
        } else {
          // Clear question context for other response types
          setActiveQuestionContext({ originalText: null, question: null });
        }

      } catch (error) {
        console.error("Error getting AI response:", error);
        
        // Check if it's a Prompt API availability error
        const availabilityCheck = await checkPromptAPIAvailability();
        if (!availabilityCheck.available) {
          setChatHistory(prev => [...prev, { 
            text: `AI features require Chrome 138+ with Prompt API support. ${availabilityCheck.error || 'Please update your browser.'}`, 
            sender: 'ai', 
            actionType: 'error' 
          }]);
        } else {
          setChatHistory(prev => [...prev, { 
            text: `Sorry, I couldn't get a response from the AI: ${error.message}`, 
            sender: 'ai', 
            actionType: 'error' 
          }]);
        }
      } finally {
        setLoadingAction(null);
      }
    }
  }, [activeQuestionContext, chatHistory]);

  // Stop recording without sending
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    audioChunksRef.current = [];
  }, []);

  // Start audio recording
  const startAudioRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg'
      });
      
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Recording stopped, audio chunks are ready in audioChunksRef.current
      };
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      
      return true;
    } catch (error) {
      console.error('Error starting audio recording:', error);
      return false;
    }
  }, []);

  // Send message with audio to model (needs to be defined before stopRecordingAndSend)
  const sendMessageWithAudio = useCallback(async (audioBlob, transcript = '') => {
    try {
      // Add user message to chat history (use transcript if available, otherwise indicate audio)
      const userMessageText = transcript || '🎤 Audio message';
      setChatHistory(prev => [...prev, { text: userMessageText, sender: 'user' }]);
      setCurrentMessage(''); // Clear input field
      
      // Immediately scroll to bottom
      if (chatMessagesRef.current) {
        requestAnimationFrame(() => {
          if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
          }
        });
      }
      
      setLoadingAction('question');
      
      // Convert audio blob to File
      const audioFile = new File([audioBlob], 'audio.webm', { type: audioBlob.type || 'audio/webm' });
      
      // Get current context
      const isAnsweringQuestion = activeQuestionContext.question && activeQuestionContext.originalText;
      const originalText = activeQuestionContext.originalText || (selectedTexts.length > 0 ? selectedTexts[selectedTexts.length - 1].content : '');
      
      // Import the audio processing function
      const { processAudioWithPrompt } = await import('../utils/promptAPI');
      
      let data;
      if (isAnsweringQuestion) {
        data = await processAudioWithPrompt(
          audioFile,
          originalText,
          activeQuestionContext.question,
          transcript,
          'answer'
        );
      } else {
        data = await processAudioWithPrompt(
          audioFile,
          originalText || '',
          '',
          transcript,
          'question'
        );
      }
      
      if (!data.success) {
        // Fallback to transcript if audio processing fails
        if (transcript) {
          await sendMessage(transcript);
          return;
        } else {
          throw new Error(data.error || 'Failed to process audio');
        }
      }
      
      // Add the response to chat history
      setChatHistory(prev => [...prev, { 
        text: data.response, 
        sender: 'ai', 
        actionType: data.actionType || 'question'
      }]);
      
      // Handle different response types
      if (data.actionType === 'question') {
        setActiveQuestionContext({
          originalText: isAnsweringQuestion ? activeQuestionContext.originalText : (originalText || ''),
          question: data.response,
        });
      } else {
        setActiveQuestionContext({ originalText: null, question: null });
      }
      
    } catch (error) {
      console.error('Error processing audio:', error);
      
      // Fallback to transcript
      if (transcript) {
        await sendMessage(transcript);
      } else {
        setChatHistory(prev => [...prev, { 
          text: `Error processing audio: ${error.message}. Please try speaking again.`, 
          sender: 'ai', 
          actionType: 'error' 
        }]);
      }
    } finally {
      setLoadingAction(null);
    }
  }, [activeQuestionContext, selectedTexts, sendMessage, chatMessagesRef]);

  // Stop recording and send audio to model
  const stopRecordingAndSend = useCallback(async (transcript = '') => {
    return new Promise((resolve) => {
      // Stop media recorder
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        // Store the original onstop handler
        const originalOnStop = mediaRecorderRef.current.onstop;
        
        // Set new handler that will process the audio
        mediaRecorderRef.current.onstop = () => {
          // Call original handler if it exists
          if (originalOnStop) originalOnStop();
          
          if (audioChunksRef.current.length > 0) {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            audioChunksRef.current = [];
            
            // Send audio directly to model, with transcript as fallback
            sendMessageWithAudio(audioBlob, transcript).then(resolve);
          } else {
            // No audio recorded, fallback to transcript
            if (transcript) {
              sendMessage(transcript).then(() => resolve());
            } else {
              resolve();
            }
          }
          
          // Stop audio stream
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
          }
        };
        
        mediaRecorderRef.current.stop();
      } else {
        // Already stopped or never started
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioChunksRef.current = [];
          sendMessageWithAudio(audioBlob, transcript).then(resolve);
        } else {
          if (transcript) {
            sendMessage(transcript).then(() => resolve());
          } else {
            resolve();
          }
        }
        
        // Stop audio stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      }
    });
  }, [sendMessageWithAudio, sendMessage]);

  // --- Speech Recognition Setup ---
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const isSupported = !!SpeechRecognition;
    setIsSpeechRecognitionSupported(isSupported);

    if (!isSupported) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'nl-NL';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      setCurrentMessage(transcript);

      // Check if the speech recognition has finalized
      if (event.results[0].isFinal) {
        // Stop recording and send audio with transcript as fallback
        stopRecordingAndSend(transcript);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      stopRecording();
    };
  }, [stopRecording, stopRecordingAndSend]);

  const handleMicClick = async () => {
    if (isListening) {
      // Stop recording and recognition
      recognitionRef.current?.stop();
      await stopRecordingAndSend();
    } else {
      // Start audio recording first
      const recordingStarted = await startAudioRecording();
      if (recordingStarted) {
        // Then start speech recognition for transcript fallback
        recognitionRef.current?.start();
      }
    }
  };

  // Handle text selection messages from content script
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleTextSelectionMessage = useCallback((message) => {
    console.log('Received text selection message:', message);
    
    if (message.data && message.data.type === 'text-selection' && message.data.text) {
      console.log('Processing text selection:', {
        text: message.data.text.substring(0, 100) + '...',
        url: message.data.url,
        title: message.data.title
      });
      
      const newText = {
        id: Date.now(),
        content: message.data.text,
        isCollapsed: false, // Keep new text blocks collapsed by default
        detectedLanguage: message.data.detectedLanguage || null,
        source: {
          url: message.data.url,
          title: message.data.title,
          timestamp: message.data.timestamp
        }
      };
      
      console.log('Adding new text to selectedTexts:', newText);
      setSelectedTexts(prev => {
        const updated = [...prev, newText];
        console.log('Updated selectedTexts:', updated);
        return updated;
      });
      
      // Save current chat history before switching to new text
      saveCurrentChatHistory();
      
      // Create new chat session for the new text
      createNewChatSession(newText.id, newText.content, newText.source);
      
      // Clear active contexts for new text
      setActiveQuestionContext({ originalText: null, question: null });
      
      // Auto-open mobile sidebar when text is selected
      setShowMobileSidebar(true);
      // Notify product tour that a selection exists
      setTimeout(() => {
        window.dispatchEvent(new Event('langhub:text-selected'));
      }, 0);
    } else if (message.data && message.data.type === 'image-selection') {
      console.log('Processing image selection:', {
        imageUrl: message.data.imageUrl,
        url: message.data.url,
        title: message.data.title
      });
      
      const newImage = {
        id: Date.now(),
        type: 'image',
        imageData: message.data.imageData,
        imageUrl: message.data.imageUrl,
        alt: message.data.alt || '',
        detectedLanguage: message.data.detectedLanguage || null,
        isCollapsed: false,
        source: {
          url: message.data.url,
          title: message.data.title,
          timestamp: message.data.timestamp
        }
      };
      
      console.log('Adding new image to selectedTexts:', newImage);
      setSelectedTexts(prev => {
        const updated = [...prev, newImage];
        console.log('Updated selectedTexts:', updated);
        return updated;
      });
      
      // Save current chat history before switching to new image
      saveCurrentChatHistory();
      
      // Create new chat session for the new image
      createNewChatSession(newImage.id, `Image: ${newImage.alt || 'No description'}`, newImage.source);
      
      // Clear active contexts for new image
      setActiveQuestionContext({ originalText: null, question: null });
      
      // Auto-open mobile sidebar when image is selected
      setShowMobileSidebar(true);
      // Notify product tour that a selection exists
      setTimeout(() => {
        window.dispatchEvent(new Event('langhub:text-selected'));
      }, 0);
    } else if (message.data && message.data.type === 'vocabulary_added') {
      console.log('Vocabulary word added, triggering animation');
      // Trigger the colorful vocabulary animation
      handleWordAddedToVocab();
    } else {
      console.warn('Invalid message:', message);
    }
  }, [saveCurrentChatHistory, createNewChatSession]);

  // Load desktop sidebar width from localStorage (desktop only)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 1024) return;
    try {
      const stored = localStorage.getItem('langhub.desktopSidebarWidth');
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (!Number.isNaN(parsed)) {
          const minSidebarWidth = 300;
          const minMainWidth = 400;
          const maxSidebarWidth = Math.max(minSidebarWidth, window.innerWidth - minMainWidth);
          setDesktopSidebarWidth(Math.min(Math.max(parsed, minSidebarWidth), maxSidebarWidth));
        }
      }
    } catch (_) {}
  }, []);

  // Keep desktop sidebar width within viewport bounds on resize (desktop only)
  useEffect(() => {
    const onWindowResize = () => {
      if (window.innerWidth < 1024) return;
      setDesktopSidebarWidth(prev => {
        const minSidebarWidth = 300;
        const minMainWidth = 400;
        const maxSidebarWidth = Math.max(minSidebarWidth, window.innerWidth - minMainWidth);
        return Math.min(Math.max(prev, minSidebarWidth), maxSidebarWidth);
      });
    };
    window.addEventListener('resize', onWindowResize);
    return () => window.removeEventListener('resize', onWindowResize);
  }, []);

  // Start sidebar resize (desktop only)
  const startDesktopSidebarResize = useCallback((e) => {
    if (window.innerWidth < 1024 || isImmersiveMode) return;
    setIsResizingSidebar(true);
    sidebarResizeStartXRef.current = e.clientX;
    sidebarStartWidthRef.current = desktopSidebarWidth;
    e.preventDefault();
  }, [desktopSidebarWidth, isImmersiveMode]);

  // Handle sidebar resize mousemove/up
  useEffect(() => {
    if (!isResizingSidebar) return;
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - sidebarResizeStartXRef.current;
      const minSidebarWidth = 300;
      const minMainWidth = 400;
      const maxSidebarWidth = Math.max(minSidebarWidth, window.innerWidth - minMainWidth);
      // Invert direction so dragging left increases right sidebar width (expected UX)
      const next = Math.min(Math.max(sidebarStartWidthRef.current - deltaX, minSidebarWidth), maxSidebarWidth);
      setDesktopSidebarWidth(next);
    };
    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      try {
        localStorage.setItem('langhub.desktopSidebarWidth', String(desktopSidebarWidth));
      } catch (_) {}
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizingSidebar, desktopSidebarWidth]);

  // Handle window resize to exit immersive mode on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && isImmersiveMode) {
        setIsImmersiveMode(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isImmersiveMode]);

  // Listen for postMessages from the langhub-iframe
  useEffect(() => {
    const handleMessage = (event) => {
      // Only accept messages from the langhub iframe
      if (event.source !== document.getElementById('langhub-iframe')?.contentWindow) {
        return;
      }

      if (event.data.type === 'widget_message' && !!event.data.params.msg) {
        const message = event.data.params.msg;
        handleTextSelectionMessage({data:message});
      }
    };

    // Add event listener
    window.addEventListener('message', handleMessage);

    // Cleanup function
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleTextSelectionMessage]);

  // Effect to scroll to the bottom of the chat history when new messages are added
  useEffect(() => {
    if (chatMessagesRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated before scrolling
      requestAnimationFrame(() => {
        if (chatMessagesRef.current) {
          chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
      });
    }
  }, [chatHistory]);

  // Effect to scroll to the bottom of selected texts when new selections are added
  useEffect(() => {
    if (selectedTextsRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated before scrolling
      requestAnimationFrame(() => {
        if (selectedTextsRef.current) {
          selectedTextsRef.current.scrollTop = selectedTextsRef.current.scrollHeight;
        }
      });
    }
  }, [selectedTexts]);

  const handleWordAddedToVocab = () => {
    // Trigger colorful vocabulary animation on textbook icon
    setIsVocabIconBlinking(true);
    setTimeout(() => {
      setIsVocabIconBlinking(false);
    }, 2000); // Duration of the animation
  };

  // Get current source information for vocabulary entries
  const getCurrentSource = useCallback(() => {
    return {
      url: window.location.href,
      title: document.title
    };
  }, []);



  const toggleImmersiveMode = () => {
    // Prevent immersive mode on mobile devices
    if (window.innerWidth < 1024) { // lg breakpoint
      return;
    }
    
    setIsImmersiveMode(prev => {
      const newMode = !prev;
      // Close mobile sidebar when entering immersive mode
      if (newMode) {
        setShowMobileSidebar(false);
        // Initialize position
        setFloatingWindowPosition({ x: window.innerWidth - floatingWindowSize.width - 16, y: 16 });
        // Notify product tour that immersive window can be targeted
        setTimeout(() => {
          window.dispatchEvent(new Event('langhub:immersive-ready'));
        }, 0);
      }
      return newMode;
    });
  };

  // Drag handlers for floating window
  const handleMouseDown = useCallback((e) => {
    if (!floatingWindowRef.current) return;
    
    setIsDragging(true);
    const rect = floatingWindowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      
      // Keep window within viewport bounds
      const boundedX = Math.max(0, Math.min(newX, window.innerWidth - floatingWindowSize.width));
      const boundedY = Math.max(0, Math.min(newY, window.innerHeight - floatingWindowSize.height));
      
      setFloatingWindowPosition({ x: boundedX, y: boundedY });
    } else if (isResizing) {
      const deltaX = e.clientX - resizeStartPos.x;
      const deltaY = e.clientY - resizeStartPos.y;
      
      let newWidth = resizeStartSize.width;
      let newHeight = resizeStartSize.height;
      let newX = floatingWindowPosition.x;
      let newY = floatingWindowPosition.y;
      
      // Handle different resize directions
      if (resizeDirection.includes('right')) {
        newWidth = Math.max(400, Math.min(resizeStartSize.width + deltaX, window.innerWidth - floatingWindowPosition.x));
      }
      if (resizeDirection.includes('left')) {
        const maxDelta = resizeStartSize.width - 400;
        const constrainedDelta = Math.max(-maxDelta, Math.min(deltaX, floatingWindowPosition.x));
        newWidth = resizeStartSize.width - constrainedDelta;
        newX = floatingWindowPosition.x + constrainedDelta;
      }
      if (resizeDirection.includes('bottom')) {
        newHeight = Math.max(400, Math.min(resizeStartSize.height + deltaY, window.innerHeight - floatingWindowPosition.y));
      }
      if (resizeDirection.includes('top')) {
        const maxDelta = resizeStartSize.height - 400;
        const constrainedDelta = Math.max(-maxDelta, Math.min(deltaY, floatingWindowPosition.y));
        newHeight = resizeStartSize.height - constrainedDelta;
        newY = floatingWindowPosition.y + constrainedDelta;
      }
      
      setFloatingWindowSize({ width: newWidth, height: newHeight });
      setFloatingWindowPosition({ x: newX, y: newY });
    }
  }, [isDragging, isResizing, dragOffset, resizeDirection, resizeStartPos, resizeStartSize, floatingWindowSize, floatingWindowPosition]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  }, []);

  const handleResizeStart = useCallback((e, direction) => {
    e.stopPropagation(); // Prevent dragging when resizing
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    setResizeStartSize({ width: floatingWindowSize.width, height: floatingWindowSize.height });
    e.preventDefault();
  }, [floatingWindowSize]);

  // Add global mouse event listeners for dragging and resizing
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none'; // Prevent text selection while dragging/resizing
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);


  return (
    <div className="h-screen flex flex-col lg:flex-row bg-gradient-to-br from-gray-900 to-gray-800 overflow-hidden">
      {/* Main Content Area - full width on mobile, responsive on desktop, full width in immersive mode */}
      <div className={`${isImmersiveMode ? 'w-full h-full lg:w-full p-0' : 'w-full h-full flex-1 min-w-0 lg:min-w-[400px] p-1 lg:p-2'}`}>
        <div className={`relative h-full bg-gray-950 overflow-hidden ${isImmersiveMode ? '' : 'rounded-xl shadow-lg border border-gray-700'}`}>
          {/* Placeholder for the iframe */}
          <iframe
            src="https://webfu.se/+langhub"
            title="Main Content"
            className="w-full h-full border-none"
            data-tour="iframe"
            id="langhub-iframe"
            style={{
              // Mobile-specific iframe improvements
              transform: 'scale(1)',
              transformOrigin: 'top left',
              // Ensure proper mobile viewport
              width: '100%',
              height: '100%',
              // Prevent zoom issues on mobile
              maxWidth: '100vw',
              maxHeight: '100vh'
            }}
          ></iframe>
          
          {/* Overlay when no text is selected */}
          {selectedTexts.length === 0 && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none lg:hidden">
              <div className="flex items-center p-0.5 bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-500 rounded-full shadow-xl shadow-purple-500/30">
                <div className="bg-gray-900/90 backdrop-blur-sm text-white py-2 px-4 lg:py-3 lg:px-6 rounded-full">
                  <p className="text-sm lg:text-lg font-medium animate-pulse text-center">Select any text on the page to get started</p>
                </div>
              </div>
            </div>
          )}

          {/* Immersive Mode Floating Sidebar */}
          {isImmersiveMode && (
            <div 
              ref={floatingWindowRef}
              className="absolute z-50"
              style={{
                left: `${floatingWindowPosition.x}px`,
                top: `${floatingWindowPosition.y}px`,
                width: `${floatingWindowSize.width}px`,
                height: `${floatingWindowSize.height}px`,
                cursor: isDragging ? 'grabbing' : isResizing ? 'resizing' : 'auto'
              }}
              data-tour="immersive-window"
            >
                            <UnifiedSidebar
                mode="immersive"
                selectedTexts={selectedTexts}
                selectedTextsRef={selectedTextsRef}
                setSelectedTexts={setSelectedTexts}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                chatHistory={chatHistory}
                chatMessagesRef={chatMessagesRef}
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                sendMessage={sendMessage}
                loadingAction={loadingAction}
                setLoadingAction={setLoadingAction}
                handleWordAddedToVocab={handleWordAddedToVocab}
                isListening={isListening}
                handleMicClick={handleMicClick}
                isSpeechRecognitionSupported={isSpeechRecognitionSupported}
                showBrowserWarning={showBrowserWarning}
                setShowBrowserWarning={setShowBrowserWarning}
                getCurrentSource={getCurrentSource}
                setActiveQuestionContext={setActiveQuestionContext}
                activeQuestionContext={activeQuestionContext}
                setChatHistory={setChatHistory}
                setIsTextbookIconBlinking={setIsTextbookIconBlinking}
            isVocabIconBlinking={isVocabIconBlinking}
            isTextbookIconBlinking={isTextbookIconBlinking}
                isImmersiveMode={isImmersiveMode}
                toggleImmersiveMode={toggleImmersiveMode}
                onClose={null}
                handleMouseDown={handleMouseDown}
                isDragging={isDragging}
                handleResizeStart={handleResizeStart}
                // Chat session management
                chatSessions={chatSessions}
                switchToChatSession={switchToChatSession}
                currentTextId={currentTextId}
              />
                        </div>
                      )}
                  </div>
                </div>

      {/* Desktop resizer between main and sidebar (only on desktop, non-immersive) */}
      {!isImmersiveMode && (
        <div
          className="hidden lg:block w-1 cursor-col-resize bg-gray-800 hover:bg-gray-700 transition-colors"
          onMouseDown={startDesktopSidebarResize}
          title="Resize sidebar"
          aria-label="Resize sidebar"
        />
      )}

      {/* Desktop Sidebar - hidden on mobile and in immersive mode */}
      {!isImmersiveMode && (
        <UnifiedSidebar
          mode="desktop"
          selectedTexts={selectedTexts}
          selectedTextsRef={selectedTextsRef}
          setSelectedTexts={setSelectedTexts}
          showHistory={showHistory}
          setShowHistory={setShowHistory}
          chatHistory={chatHistory}
          chatMessagesRef={chatMessagesRef}
          currentMessage={currentMessage}
          setCurrentMessage={setCurrentMessage}
          sendMessage={sendMessage}
          loadingAction={loadingAction}
          setLoadingAction={setLoadingAction}
          handleWordAddedToVocab={handleWordAddedToVocab}
          isListening={isListening}
          handleMicClick={handleMicClick}
          isSpeechRecognitionSupported={isSpeechRecognitionSupported}
          showBrowserWarning={showBrowserWarning}
          setShowBrowserWarning={setShowBrowserWarning}
          getCurrentSource={getCurrentSource}
          setActiveQuestionContext={setActiveQuestionContext}
          activeQuestionContext={activeQuestionContext}
          setChatHistory={setChatHistory}
          setIsTextbookIconBlinking={setIsTextbookIconBlinking}
          isVocabIconBlinking={isVocabIconBlinking}
          isTextbookIconBlinking={isTextbookIconBlinking}
          isImmersiveMode={isImmersiveMode}
          toggleImmersiveMode={toggleImmersiveMode}
          onClose={null}
          handleMouseDown={null}
          isDragging={isDragging}
          handleResizeStart={null}
          desktopSidebarWidth={desktopSidebarWidth}
          // Chat session management
          chatSessions={chatSessions}
          switchToChatSession={switchToChatSession}
          currentTextId={currentTextId}
        />
      )}

      {/* Overlay to capture mouse events over iframe during sidebar resize (desktop only) */}
      {isResizingSidebar && !isImmersiveMode && (
        <div
          className="fixed inset-0 z-[9999] cursor-col-resize"
          onMouseUp={() => {
            setIsResizingSidebar(false);
            try {
              localStorage.setItem('langhub.desktopSidebarWidth', String(desktopSidebarWidth));
            } catch (_) {}
          }}
        />
      )}
      
      {/* Mobile FAB - only visible on mobile AFTER a text has been selected */}
      {selectedTexts.length > 0 && (
        <div className="lg:hidden fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/30 relative group"
          >
            {/* Sparkle effects */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
              <div className="absolute top-1 left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-75"></div>
              <div className="absolute top-2 right-2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping opacity-75" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute bottom-2 left-2 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-ping opacity-75" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-1 right-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-75" style={{animationDelay: '1.5s'}}></div>
            </div>
            <span className="text-xl relative z-10">✨</span>
          </button>
        </div>
      )}
      
      {/* Mobile Sidebar Popup */}
      {showMobileSidebar && (
        <Portal>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] lg:hidden">
            <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-gray-900/95 backdrop-blur-sm border-l border-gray-700 shadow-2xl transition-all duration-300 ease-in-out">
              <UnifiedSidebar
                mode="mobile"
                selectedTexts={selectedTexts}
                selectedTextsRef={selectedTextsRef}
                setSelectedTexts={setSelectedTexts}
                showHistory={showHistory}
                setShowHistory={setShowHistory}
                chatHistory={chatHistory}
                chatMessagesRef={chatMessagesRef}
                currentMessage={currentMessage}
                setCurrentMessage={setCurrentMessage}
                sendMessage={sendMessage}
                loadingAction={loadingAction}
                setLoadingAction={setLoadingAction}
                handleWordAddedToVocab={handleWordAddedToVocab}
                isListening={isListening}
                handleMicClick={handleMicClick}
                isSpeechRecognitionSupported={isSpeechRecognitionSupported}
                showBrowserWarning={showBrowserWarning}
                setShowBrowserWarning={setShowBrowserWarning}
                getCurrentSource={getCurrentSource}
                setActiveQuestionContext={setActiveQuestionContext}
                activeQuestionContext={activeQuestionContext}
                setChatHistory={setChatHistory}
                setIsTextbookIconBlinking={setIsTextbookIconBlinking}
                  isVocabIconBlinking={isVocabIconBlinking}
                  isTextbookIconBlinking={isTextbookIconBlinking}
                isImmersiveMode={isImmersiveMode}
                toggleImmersiveMode={toggleImmersiveMode}
                  onClose={() => setShowMobileSidebar(false)}
                handleMouseDown={null}
                isDragging={isDragging}
                handleResizeStart={null}
                // Chat session management
                chatSessions={chatSessions}
                switchToChatSession={switchToChatSession}
                currentTextId={currentTextId}
              />
            </div>
          </div>
        </Portal>
      )}
      
    </div>
  );
}