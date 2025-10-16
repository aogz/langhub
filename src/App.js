import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserSettingsProvider } from './contexts/UserSettingsContext';
import Classroom from './components/Classroom';
import TextbookPage from './components/TextbookPage';
import Settings from './components/Settings';
import ProductTour from './components/ProductTour';

// Main App Component
const App = () => {
  return (
    <Router>
      <UserSettingsProvider>
        <ProductTour />
        <Routes>
          <Route path="/classroom" element={<Classroom />} />
          <Route path="/textbook" element={<TextbookPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/" element={<Navigate to="/classroom" replace />} />
        </Routes>
      </UserSettingsProvider>
    </Router>
  );
};

export default App;
