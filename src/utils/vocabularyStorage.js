// Vocabulary storage utilities using localStorage

const VOCABULARY_STORAGE_KEY = 'langhub_vocabulary';

// Generate a unique ID for vocabulary items
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all vocabulary words from localStorage
export const getVocabulary = () => {
  try {
    const stored = localStorage.getItem(VOCABULARY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading vocabulary from localStorage:', error);
    return [];
  }
};

// Save vocabulary to localStorage
export const saveVocabulary = (vocabulary) => {
  try {
    localStorage.setItem(VOCABULARY_STORAGE_KEY, JSON.stringify(vocabulary));
    return true;
  } catch (error) {
    console.error('Error saving vocabulary to localStorage:', error);
    return false;
  }
};

// Add a new word to vocabulary
export const addWord = (wordData) => {
  const vocabulary = getVocabulary();
  
  // Check if word already exists
  const existingWord = vocabulary.find(item => 
    item.word.toLowerCase() === wordData.word.toLowerCase()
  );
  
  if (existingWord) {
    return { success: false, error: 'Word already exists' };
  }
  
  const newWord = {
    id: generateId(),
    word: wordData.word,
    translation: wordData.translation || '',
    language: wordData.language || 'auto',
    targetLanguage: wordData.targetLanguage || 'en',
    addedAt: wordData.addedAt || new Date().toISOString(),
    source: wordData.source || null,
    // Practice tracking
    practiceCount: 0,
    correctCount: 0,
    lastPracticed: null,
    // Progress tracking (0-100)
    progress: 0
  };
  
  vocabulary.push(newWord);
  
  if (saveVocabulary(vocabulary)) {
    return { success: true, word: newWord };
  } else {
    return { success: false, error: 'Failed to save word' };
  }
};

// Add multiple words to vocabulary (bulk import)
export const addWords = (wordsData) => {
  const addedWords = [];
  const errors = [];
  
  for (const wordData of wordsData) {
    const result = addWord(wordData);
    if (result.success) {
      addedWords.push(result.word);
    } else {
      errors.push({ word: wordData.word, error: result.error });
    }
  }
  
  return { success: true, addedWords, errors };
};

// Delete a word from vocabulary
export const deleteWord = (wordId) => {
  const vocabulary = getVocabulary();
  const filteredVocabulary = vocabulary.filter(word => word.id !== wordId);
  
  if (filteredVocabulary.length < vocabulary.length) {
    if (saveVocabulary(filteredVocabulary)) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to save changes' };
    }
  } else {
    return { success: false, error: 'Word not found' };
  }
};

// Update word practice progress
export const updatePracticeProgress = (wordId, isCorrect) => {
  const vocabulary = getVocabulary();
  const wordIndex = vocabulary.findIndex(word => word.id === wordId);
  
  if (wordIndex === -1) {
    return { success: false, error: 'Word not found' };
  }
  
  const word = vocabulary[wordIndex];
  word.practiceCount = (word.practiceCount || 0) + 1;
  word.correctCount = (word.correctCount || 0) + (isCorrect ? 1 : 0);
  word.lastPracticed = new Date().toISOString();
  
  // Calculate progress (0-100)
  const accuracy = word.practiceCount > 0 ? (word.correctCount / word.practiceCount) * 100 : 0;
  word.progress = Math.round(accuracy);
  
  if (saveVocabulary(vocabulary)) {
    return { success: true, word: word };
  } else {
    return { success: false, error: 'Failed to save progress' };
  }
};

// Reset word progress
export const resetWordProgress = (wordId) => {
  const vocabulary = getVocabulary();
  const wordIndex = vocabulary.findIndex(word => word.id === wordId);
  
  if (wordIndex === -1) {
    return { success: false, error: 'Word not found' };
  }
  
  const word = vocabulary[wordIndex];
  word.practiceCount = 0;
  word.correctCount = 0;
  word.lastPracticed = null;
  word.progress = 0;
  
  if (saveVocabulary(vocabulary)) {
    return { success: true, word: word };
  } else {
    return { success: false, error: 'Failed to reset progress' };
  }
};

// Get words for practice (words with lower progress)
export const getWordsForPractice = (limit = 10) => {
  const vocabulary = getVocabulary();
  
  // Sort by progress (ascending) and practice count (ascending)
  const sortedWords = vocabulary.sort((a, b) => {
    if (a.progress !== b.progress) {
      return a.progress - b.progress;
    }
    return (a.practiceCount || 0) - (b.practiceCount || 0);
  });
  
  return sortedWords.slice(0, limit);
};

// Export vocabulary data (for backup/export)
export const exportVocabulary = () => {
  return getVocabulary();
};

// Import vocabulary data (for restore/import)
export const importVocabulary = (vocabularyData) => {
  try {
    if (Array.isArray(vocabularyData)) {
      saveVocabulary(vocabularyData);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid vocabulary data format' };
    }
  } catch (error) {
    return { success: false, error: 'Failed to import vocabulary' };
  }
};
