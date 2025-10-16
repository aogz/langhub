// Chat history storage utilities using localStorage

const CHAT_HISTORY_STORAGE_KEY = 'langhub_chat_history';

// Generate a unique ID for chat sessions
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all chat sessions from localStorage
export const getChatSessions = () => {
  try {
    const stored = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading chat sessions from localStorage:', error);
    return {};
  }
};

// Save chat sessions to localStorage
export const saveChatSessions = (sessions) => {
  try {
    localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(sessions));
    return true;
  } catch (error) {
    console.error('Error saving chat sessions to localStorage:', error);
    return false;
  }
};

// Get chat history for a specific text selection
export const getChatHistoryForText = (textId) => {
  const sessions = getChatSessions();
  return sessions[textId] || [];
};

// Save chat history for a specific text selection
export const saveChatHistoryForText = (textId, chatHistory) => {
  const sessions = getChatSessions();
  sessions[textId] = chatHistory;
  return saveChatSessions(sessions);
};

// Create a new chat session for a text selection
export const createChatSession = (textId, textContent, source) => {
  const sessions = getChatSessions();
  const sessionId = generateSessionId();
  
  sessions[textId] = {
    id: sessionId,
    textId: textId,
    textContent: textContent,
    source: source,
    chatHistory: [],
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString()
  };
  
  saveChatSessions(sessions);
  return sessionId;
};

// Update chat history for a text selection
export const updateChatHistoryForText = (textId, chatHistory) => {
  const sessions = getChatSessions();
  if (sessions[textId]) {
    sessions[textId].chatHistory = chatHistory;
    sessions[textId].lastUpdated = new Date().toISOString();
    return saveChatSessions(sessions);
  }
  return false;
};

// Get all chat sessions sorted by last updated
export const getAllChatSessions = () => {
  const sessions = getChatSessions();
  return Object.values(sessions).sort((a, b) => 
    new Date(b.lastUpdated) - new Date(a.lastUpdated)
  );
};

// Delete a chat session
export const deleteChatSession = (textId) => {
  const sessions = getChatSessions();
  if (sessions[textId]) {
    delete sessions[textId];
    return saveChatSessions(sessions);
  }
  return false;
};

// Clear all chat sessions
export const clearAllChatSessions = () => {
  try {
    localStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing chat sessions:', error);
    return false;
  }
};

// Get chat session summary (for display in history)
export const getChatSessionSummary = (textId) => {
  const sessions = getChatSessions();
  const session = sessions[textId];
  if (!session) return null;
  
  const chatCount = session.chatHistory.length;
  const lastMessage = session.chatHistory[session.chatHistory.length - 1];
  
  return {
    id: session.id,
    textId: session.textId,
    textContent: session.textContent.substring(0, 100) + (session.textContent.length > 100 ? '...' : ''),
    source: session.source,
    chatCount: chatCount,
    lastMessage: lastMessage ? lastMessage.text.substring(0, 50) + (lastMessage.text.length > 50 ? '...' : '') : '',
    lastMessageSender: lastMessage ? lastMessage.sender : null,
    createdAt: session.createdAt,
    lastUpdated: session.lastUpdated
  };
};
