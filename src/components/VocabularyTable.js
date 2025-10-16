import React, { useState, useEffect, useCallback, useRef } from 'react';
import PracticeModal from './PracticeModal';
import Portal from './Portal'; // Import the Portal component
import VocabularyImporter from './VocabularyImporter';
import AddWordModal from './AddWordModal';
import CircularProgressBar from './CircularProgressBar';
import ResetProgressModal from './ResetProgressModal';
import { 
  getVocabulary, 
  addWord, 
  addWords, 
  deleteWord, 
  resetWordProgress
} from '../utils/vocabularyStorage';

export default function VocabularyTable() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showPracticeModal, setShowPracticeModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importError, setImportError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [newlyAddedWordId, setNewlyAddedWordId] = useState(null);
  const [practiceWords, setPracticeWords] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownButtonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [wordToReset, setWordToReset] = useState(null);
  const [groupPages, setGroupPages] = useState({});
  const [selectedSource, setSelectedSource] = useState('latest');
  const WORDS_PER_PAGE = 50;

  // Pagination helper functions
  const getCurrentPage = (groupKey) => groupPages[groupKey] || 1;
  
  const getTotalPages = (groupItems) => Math.ceil(groupItems.length / WORDS_PER_PAGE);
  
  const getPaginatedWords = (groupItems, groupKey) => {
    const currentPage = getCurrentPage(groupKey);
    const startIndex = (currentPage - 1) * WORDS_PER_PAGE;
    const endIndex = startIndex + WORDS_PER_PAGE;
    return groupItems.slice(startIndex, endIndex);
  };
  
  const setGroupPage = (groupKey, page) => {
    setGroupPages(prev => ({ ...prev, [groupKey]: page }));
  };

  // Pagination component
  const PaginationControls = ({ groupKey, groupItems }) => {
    const currentPage = getCurrentPage(groupKey);
    const totalPages = getTotalPages(groupItems);
    
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
        <div className="text-sm text-gray-400">
          Showing {((currentPage - 1) * WORDS_PER_PAGE) + 1} to {Math.min(currentPage * WORDS_PER_PAGE, groupItems.length)} of {groupItems.length} words
        </div>
        
        <div className="flex items-center gap-2">
          {/* Previous button */}
          <button
            onClick={() => setGroupPage(groupKey, currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            Previous
          </button>
          
          {/* Page numbers */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => setGroupPage(groupKey, 1)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-500">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => setGroupPage(groupKey, page)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
              }`}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="text-gray-500">...</span>}
              <button
                onClick={() => setGroupPage(groupKey, totalPages)}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}
          
          {/* Next button */}
          <button
            onClick={() => setGroupPage(groupKey, currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && 
          !event.target.closest('.dropdown-container') && 
          !event.target.closest('.dropdown-menu')) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const fetchVocabulary = useCallback(async () => {
    try {
      const vocabulary = getVocabulary();
      setWords(vocabulary);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      setError('Failed to load vocabulary words');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVocabulary();
  }, [fetchVocabulary]);

  const handleSourceChange = (e) => {
    setSelectedSource(e.target.value);
  };

  const handleOpenResetModal = (word) => {
    setWordToReset(word);
    setIsResetModalOpen(true);
  };

  const handleCloseResetModal = () => {
    setWordToReset(null);
    setIsResetModalOpen(false);
  };

  const handleConfirmReset = async () => {
    if (wordToReset) {
      try {
        const result = resetWordProgress(wordToReset.id);
        
        if (result.success) {
          // Update local state for immediate feedback
          setWords(words.map(w =>
            w.id === wordToReset.id ? result.word : w
          ));
        } else {
          throw new Error(result.error || 'Failed to reset progress');
        }
      } catch (error) {
        console.error('Error resetting progress:', error);
        setError('Failed to reset progress');
      }
    }
    handleCloseResetModal();
  };


  const handleAddWord = useCallback(async (newWord) => {
    if (!newWord) return;
    setIsAdding(true);
    setAddError('');
    try {
      const result = addWord({
        ...newWord,
        addedAt: new Date().toISOString(),
        targetLanguage: 'en', // Assuming target is always English for now
      });
      
      if (result.success) {
        await fetchVocabulary();
        setNewlyAddedWordId(result.word.id);
        setTimeout(() => setNewlyAddedWordId(null), 2000);
      } else {
        if (result.error === 'Word already exists') {
          setAddError('This word already exists in your vocabulary.');
        } else {
          setAddError(`Failed to add word: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error adding word:', error);
      setAddError(`Failed to add word: ${error.message}`);
    } finally {
      setIsAdding(false);
    }
  }, [fetchVocabulary]);

  const handleImportVocabulary = useCallback(async (newWords) => {
    if (!newWords || newWords.length === 0) return;
    setIsImporting(true);
    setImportError('');
    try {
      const result = addWords(newWords);
      
      if (result.success) {
        // Re-fetch vocabulary to show the new words
        await fetchVocabulary();
        setShowImportModal(false);
        // Note: Highlighting multiple imported words is more complex.
        // For now, we'll focus on single-word additions.
      } else {
        setImportError('Failed to import some words. Check console for details.');
      }
    } catch (error) {
      console.error('Error importing vocabulary:', error);
      setImportError(`Failed to import vocabulary: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  }, [fetchVocabulary]);

  const handleDelete = async (wordId) => {
    try {
      const result = deleteWord(wordId);
      
      if (result.success) {
        // Update the local state to remove the deleted word
        setWords(words.filter(word => word.id !== wordId));
      } else {
        throw new Error(result.error || 'Failed to delete word');
      }
    } catch (error) {
      console.error('Error deleting word:', error);
      setError('Failed to delete word');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-100 rounded-lg">
        {error}
      </div>
    );
  }

  if (words.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <p>No vocabulary words saved yet.</p>
        <p className="text-sm mt-2">Words you save will appear here.</p>
        <div className="mt-6">
            <button
                onClick={() => { setImportError(''); setShowImportModal(true); }}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Vocabulary
            </button>
        </div>
      </div>
    );
  }

  // Group words by source URL (fallback to Unknown)
  const groups = words.reduce((acc, w) => {
    const key = w.source?.url || 'Unknown Source';
    if (!acc[key]) acc[key] = { title: w.source?.title || 'Unknown Source', url: w.source?.url || 'Unknown Source', items: [] };
    acc[key].items.push(w);
    return acc;
  }, {});
  let groupedKeys = Object.keys(groups);

  if (selectedSource === 'latest' && groupedKeys.length > 0) {
    groupedKeys = [groupedKeys[0]];
  } else if (selectedSource !== 'all') {
    groupedKeys = groupedKeys.filter(key => key === selectedSource);
  }

  return (
    <>
      <div className="relative bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/80 rounded-2xl border border-gray-700/30 p-6 mb-6 shadow-xl backdrop-blur-md">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5 rounded-3xl"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-xl"></div>
        
        <div className="relative">
                    {/* Compact stats and actions layout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Left - Stats */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-3 shadow-lg backdrop-blur-sm border border-blue-500/20">
                  <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                {/* Pulse animation for empty state */}
                {words.length === 0 && (
                  <div className="absolute inset-0 bg-blue-500/20 rounded-xl animate-pulse"></div>
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 bg-clip-text text-transparent">
                    {words.length}
                  </span>
                  <span className="text-base font-medium text-gray-300">
                    {words.length === 1 ? 'Word' : 'Words'}
                  </span>
                </div>
                <div className="text-sm text-gray-400">saved in vocabulary</div>
              </div>
            </div>

            {/* Right - Action buttons */}
            <div className="flex items-center gap-3">
              {/* Practice button - more compact */}
            <button
                onClick={() => { 
                  const practiceList = words.filter(w => w.progress < 100);
                  setPracticeWords(practiceList); 
                  setShowPracticeModal(true); 
                }}
                disabled={words.filter(w => w.progress < 100).length < 4}
                className={`group relative px-8 py-4 rounded-xl font-bold transition-all duration-300 flex items-center gap-3 text-lg overflow-hidden ${
                words.filter(w => w.progress < 100).length >= 4
                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transform hover:scale-105'
                    : 'bg-gradient-to-r from-gray-700/50 to-gray-600/50 text-gray-500 cursor-not-allowed shadow-lg'
                }`}
                title={words.filter(w => w.progress < 100).length >= 4 ? 'Start practicing your vocabulary' : `Need ${4 - words.filter(w => w.progress < 100).length} more words to start practicing`}
              >
                {/* Animated background for enabled state */}
                {words.filter(w => w.progress < 100).length >= 4 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-indigo-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                )}
                
                <div className="relative flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${words.filter(w => w.progress < 100).length >= 4 ? 'bg-white/20' : 'bg-gray-600/50'} transition-all duration-300 ${words.filter(w => w.progress < 100).length >= 4 ? 'group-hover:bg-white/30 group-hover:scale-110' : ''}`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 5.18a1 1 0 00-1.3.82v8a1 1 0 001.3.82l7.4-4a1 1 0 000-1.64l-7.4-4z" />
              </svg>
        </div>
                  <span>Start Practice</span>
      </div>
              </button>

                            {/* Add Words Dropdown */}
              <div className="relative dropdown-container">
          <button
                  ref={dropdownButtonRef}
                  onClick={() => {
                    if (!showDropdown && dropdownButtonRef.current) {
                      const rect = dropdownButtonRef.current.getBoundingClientRect();
                      setDropdownPosition({
                        top: rect.bottom + 8,
                        right: window.innerWidth - rect.right
                      });
                    }
                    setShowDropdown(!showDropdown);
                  }}
                  className="group relative px-6 py-4 rounded-xl bg-gradient-to-r from-gray-700/60 via-gray-600/50 to-gray-700/60 hover:from-gray-600/70 hover:via-gray-500/60 hover:to-gray-600/70 text-gray-200 hover:text-white font-semibold transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden border border-gray-600/30 hover:border-gray-500/50"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-600/20 to-gray-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-gray-600/40 group-hover:bg-gray-500/50 transition-all duration-300 group-hover:scale-110">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
                    </div>
                    <span className="hidden sm:inline">Add Words</span>
                    <span className="sm:hidden">Add</span>
                    <svg 
                      className={`w-3 h-3 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
          </button>

                              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter by Source */}
      <div className="flex items-center gap-3 mb-6">
        <label htmlFor="source-filter" className="text-sm font-medium text-gray-400">Filter by source:</label>
        <select 
          id="source-filter"
          value={selectedSource}
          onChange={handleSourceChange}
          className="bg-gray-800 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        >
          <option value="latest">Latest Source</option>
          <option value="all">All Sources</option>
          {Object.keys(groups).map(key => (
            <option key={key} value={key}>{groups[key].title} ({groups[key].items.length})</option>
          ))}
        </select>
      </div>

      <div className="space-y-12">
        {groupedKeys.map((key) => {
          const group = groups[key];
          return (
            <div key={key} className="bg-gray-900/30 rounded-2xl border border-gray-700/50 p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-medium mb-1">Source</div>
                  <div className="text-lg font-semibold text-gray-100 truncate" title={group.title}>
                    {group.url !== 'Unknown Source' ? (
                      <a href={group.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">{group.title}</a>
                    ) : (
                      <span className="text-gray-300">{group.title}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">{group.items.length} words saved</div>
                </div>
                <button
                  onClick={() => { 
                    const practiceList = group.items.filter(w => w.progress < 100);
                    setPracticeWords(practiceList); 
                    setShowPracticeModal(true); 
                  }}
                  disabled={group.items.filter(w => w.progress < 100).length < 4}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                    group.items.filter(w => w.progress < 100).length >= 4
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                      : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                  }`}
                  title={group.items.filter(w => w.progress < 100).length >= 4 ? 'Practice this page' : 'Need at least 4 words'}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 5.18a1 1 0 00-1.3.82v8a1 1 0 001.3.82l7.4-4a1 1 0 000-1.64l-7.4-4z" />
                  </svg>
                  Practice this page
                </button>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-600/50 shadow-inner">
                <table className="w-full">
                                    <thead>
                    <tr className="bg-gradient-to-r from-gray-800/80 to-gray-800/60 border-b border-gray-600/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Word</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Translation</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
                  <tbody className="bg-gray-900/40 divide-y divide-gray-700/50">
                    {getPaginatedWords(group.items, key).map((word, index) => (
              <tr 
                key={word.id} 
                        className={`${
                          newlyAddedWordId === word.id ? 'new-word-flash-animation' : 'hover:bg-gray-800/40 transition-colors duration-150'
                        } ${index % 2 === 0 ? 'bg-gray-900/20' : 'bg-gray-900/40'}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  <span className="font-medium">{word.word}</span>
                </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{word.translation}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          <CircularProgressBar 
                            progress={word.progress || 0}
                            onClick={word.progress >= 90 ? () => handleOpenResetModal(word) : null} 
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-right">
                  <button
                    onClick={() => handleDelete(word.id)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-150 p-2 rounded-full hover:bg-red-500/10" 
                    title="Delete word"
                  >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
              
              {/* Pagination Controls */}
              <PaginationControls groupKey={key} groupItems={group.items} />
            </div>
          );
        })}
      </div>

      {/* Dropdown Menu rendered via Portal */}
      {showDropdown && (
        <Portal>
          <div 
            className="fixed w-48 bg-gray-800/95 backdrop-blur-md rounded-xl border border-gray-600/50 shadow-2xl overflow-hidden z-[9999] dropdown-menu"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right
            }}
          >
            <div className="p-2">
              <button
                onClick={(e) => { 
                  e.stopPropagation();
                  console.log('Add Single Word clicked');
                  setAddError(''); 
                  setShowAddModal(true); 
                  setShowDropdown(false);
                }}
                className="w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-3 group"
              >
                <div className="p-1.5 rounded-lg bg-emerald-600/20 group-hover:bg-emerald-600/30 transition-colors duration-200">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-200 font-medium text-sm">Add Single Word</div>
                  <div className="text-xs text-gray-400">Manually add new word</div>
                </div>
              </button>

              <button
                onClick={(e) => { 
                  e.stopPropagation();
                  console.log('Import Words clicked');
                  setImportError(''); 
                  setShowImportModal(true); 
                  setShowDropdown(false);
                }}
                className="w-full px-3 py-2.5 rounded-lg text-left hover:bg-gray-700/50 transition-colors duration-200 flex items-center gap-3 group mt-1"
              >
                <div className="p-1.5 rounded-lg bg-blue-600/20 group-hover:bg-blue-600/30 transition-colors duration-200">
                  <svg className="w-3.5 h-3.5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <div className="text-gray-200 font-medium text-sm">Import Words</div>
                  <div className="text-xs text-gray-400">Upload from file</div>
                </div>
              </button>
            </div>
          </div>
        </Portal>
      )}

      {showPracticeModal && (
        <Portal>
          <PracticeModal
            isOpen={showPracticeModal}
            onClose={() => setShowPracticeModal(false)}
            words={practiceWords || words}
            onPracticeComplete={fetchVocabulary}
          />
        </Portal>
      )}

      {showAddModal && (
        <Portal>
          <AddWordModal
            onAdd={handleAddWord}
            isAdding={isAdding}
            error={addError}
            onClose={() => setShowAddModal(false)}
          />
        </Portal>
      )}

      {showImportModal && (
        <Portal>
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg relative">
                    <button
                        onClick={() => setShowImportModal(false)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-white"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <VocabularyImporter
                        onImport={handleImportVocabulary}
                        isImporting={isImporting}
                        error={importError}
                    />
                </div>
            </div>
        </Portal>
      )}

      {isResetModalOpen && (
        <Portal>
          <ResetProgressModal
            isOpen={isResetModalOpen}
            onCancel={handleCloseResetModal}
            onConfirm={handleConfirmReset}
          />
        </Portal>
      )}
    </>
  );
} 