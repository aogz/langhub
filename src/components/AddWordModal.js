import React, { useState } from 'react';

const AddWordModal = ({ onAdd, isAdding, error, onClose }) => {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [language, setLanguage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!word.trim() || !translation.trim() || !language.trim()) {
      return; // Basic validation
    }
    onAdd({ word, translation, language });
  };

  const handleAutoTranslate = async () => {
    if (!word.trim()) return;
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
          const translated = await translator.translate(word);
          setTranslation(translated);
        } catch (e) {
          console.error('Client-side translation failed:', e);
          setTranslation('Translation not available');
        }
      } else {
        setTranslation('Translation requires Chrome 138+');
      }
    } catch (err) {
      console.error('Auto-translation error:', err);
      setTranslation('Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 className="text-xl font-bold text-white mb-4">Add a New Word</h3>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="word" className="block text-sm font-medium text-gray-300 mb-1">
                Word
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  id="word"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter the word"
                  required
                />
                <button
                  type="button"
                  onClick={handleAutoTranslate}
                  disabled={isTranslating || !word.trim()}
                  className="flex-shrink-0 px-3 py-2 text-sm rounded-md bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                  title="Auto-translate to English"
                >
                  {isTranslating ? (
                    <div className="w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.06 7.16l-2.12 2.12M14.84 12.84L12 15.68m2.84-2.84L12 10m2.84 2.84l2.12 2.12M12 21a9 9 0 110-18 9 9 0 010 18z" /></svg>
                  )}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="translation" className="block text-sm font-medium text-gray-300 mb-1">
                Translation
              </label>
              <input
                type="text"
                id="translation"
                value={translation}
                onChange={(e) => setTranslation(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter the translation"
                required
              />
            </div>
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-1">
                Language Code
              </label>
              <input
                type="text"
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., nl, es, fr"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-300 bg-gray-600 hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding}
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : 'Add Word'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWordModal; 