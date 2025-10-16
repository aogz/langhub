import React from 'react';
import VocabularyTable from './VocabularyTable';
import TopBar from './TopBar';

export default function TextbookPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <TopBar 
            title="Language Textbook"
            subtitle="Your comprehensive learning resource"
            showBackLink={true}
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content */}
        <div data-tour="vocab-section">
          <VocabularyTable />
        </div>
      </main>
    </div>
  );
} 