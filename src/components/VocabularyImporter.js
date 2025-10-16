import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';

const VocabularyImporter = ({ onImport, isImporting, error }) => {
  const [pasteValue, setPasteValue] = useState('');

  const handleParse = useCallback((csvString) => {
    if (!csvString) {
      alert('Please provide CSV data.');
      return;
    }
    Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const vocab = results.data.map(row => ({
          word: row.word,
          translation: row.translation,
          language: row.language,
          targetLanguage: row.targetLanguage || 'en',
        }));
        onImport(vocab);
        setPasteValue('');
      },
      error: (error) => {
        alert('Error parsing CSV:', error.message);
      }
    });
  }, [onImport]);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => handleParse(e.target.result);
    reader.readAsText(file);
  }, [handleParse]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false,
  });

  return (
    <div className="p-6 bg-gray-800 rounded-lg text-white">
      <h2 className="text-xl font-bold mb-4">Import Vocabulary</h2>
      <p className="text-gray-400 mb-6">Upload a CSV file or paste its content. Expected headers: `word`, `translation`, `language`.</p>
      
      {error && (
          <div className="p-3 mb-4 text-red-500 bg-red-100 rounded-lg">
              {error}
          </div>
      )}
      
      <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-gray-700' : 'border-gray-600 hover:border-blue-500'}`}>
        <input {...getInputProps()} />
        <p>Drag 'n' drop a CSV file here, or click to select a file</p>
      </div>

      <div className="my-6 text-center text-gray-400">OR</div>

      <textarea
        value={pasteValue}
        onChange={(e) => setPasteValue(e.target.value)}
        placeholder="Paste CSV content here..."
        className="w-full h-32 p-3 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      
      <button 
        onClick={() => handleParse(pasteValue)} 
        disabled={isImporting}
        className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg disabled:bg-gray-500"
      >
        {isImporting ? 'Importing...' : 'Import from Pasted Text'}
      </button>
    </div>
  );
};

export default VocabularyImporter; 