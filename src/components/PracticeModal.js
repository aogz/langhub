import React, { useState, useEffect } from 'react';
import { updatePracticeProgress } from '../utils/vocabularyStorage';

export default function PracticeModal({ isOpen, onClose, words, onPracticeComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  useEffect(() => {
    if (isOpen && words.length >= 4) {
      // Generate 10 questions or as many as possible with available words
      const numQuestions = Math.min(10, words.length);
      const shuffledWords = [...words].sort(() => Math.random() - 0.5);
      const generatedQuestions = [];

      for (let i = 0; i < numQuestions; i++) {
        const correctWord = shuffledWords[i];
        // Get 3 random incorrect translations
        const otherWords = shuffledWords.filter(w => w.id !== correctWord.id);
        const incorrectOptions = otherWords
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map(w => w.translation);

        // Create options array with correct answer in random position
        const options = [...incorrectOptions];
        const correctPosition = Math.floor(Math.random() * 4);
        options.splice(correctPosition, 0, correctWord.translation);

        generatedQuestions.push({
          wordId: correctWord.id,
          word: correctWord.word,
          correctAnswer: correctWord.translation,
          options,
        });
      }

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setShowScore(false);
    }
  }, [isOpen, words]);

  if (!isOpen) return null;

  // Show message if there aren't enough words
  if (words.length < 4) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-gray-900 rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-gray-100">Practice Vocabulary</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-300 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 text-center">
              <div className="text-gray-300 mb-4">
                Not enough words to start practice.
              </div>
              <p className="text-gray-400 text-sm mb-6">
                You need at least 4 words to practice with multiple choice questions.
                Currently you have {words.length} {words.length === 1 ? 'word' : 'words'}.
                Add {4 - words.length} more {4 - words.length === 1 ? 'word' : 'words'} to start practicing!
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = async () => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(score + 1);
    }

    try {
      const result = updatePracticeProgress(currentQuestion.wordId, isCorrect);
      if (!result.success) {
        console.error('Error updating practice progress:', result.error);
      }
    } catch (error) {
      console.error('Error updating practice progress:', error);
    }

    if (currentQuestionIndex === questions.length - 1) {
      setShowScore(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handleTryAgain = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowScore(false);
  };

  const handleClose = () => {
    onClose();
    if (onPracticeComplete) {
      onPracticeComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={handleClose}></div>

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-gray-900 rounded-xl shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-gray-100">Practice Vocabulary</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-300 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {showScore ? (
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-100 mb-4">
                  Your Score: {score}/{questions.length}
                </h3>
                <p className="text-gray-400 mb-6">
                  {score === questions.length 
                    ? "Perfect! You're a vocabulary master!" 
                    : "Keep practicing to improve your score!"}
                </p>
                <button
                  onClick={handleTryAgain}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="text-sm text-gray-400 mb-2">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </div>
                  <h3 className="text-xl font-bold text-gray-100">
                    What is the translation of "{currentQuestion.word}"?
                  </h3>
                </div>

                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full p-4 rounded-lg text-left transition-colors ${
                        selectedAnswer === option
                          ? selectedAnswer === currentQuestion.correctAnswer
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleNext}
                    disabled={!selectedAnswer}
                    className={`px-6 py-2 rounded-lg transition-colors ${
                      selectedAnswer
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {currentQuestionIndex === questions.length - 1 ? 'Finish' : 'Next'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 