import React, { useState } from 'react';
import InteractiveText from './InteractiveText';

export default function ExerciseWidget({ exercise, onComplete }) {
  const [answer, setAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const blankInputRef = React.useRef(null);

  const getWordClassHint = React.useCallback((ex) => {
    const direct = ex.wordClass || ex.partOfSpeech || ex.blankType || ex.pos;
    if (direct) return String(direct);
    const q = String(ex.question || ex.prompt || '').toLowerCase();
    // English and Dutch cues
    if (/\bverb\b/.test(q) || /werkwoord/.test(q)) return 'verb';
    if (/\barticle\b/.test(q) || /lidwoord/.test(q)) return 'article';
    if (/\bpreposition\b/.test(q) || /voorzetsel/.test(q)) return 'preposition';
    if (/adjective|bijvoeglijk/.test(q)) return 'adjective';
    if (/adverb|bijwoord/.test(q)) return 'adverb';
    if (/pronoun|voornaamwoord/.test(q)) return 'pronoun';
    return '';
  }, []);

  React.useEffect(() => {
    if (!showResult && blankInputRef.current) {
      blankInputRef.current.focus({ preventScroll: true });
      // place caret at end
      const el = blankInputRef.current;
      el.setSelectionRange?.(el.value.length, el.value.length);
    }
  }, [showResult]);

  const titleForType = (type) => {
    switch (type) {
      case 'fill_in_blank':
        return 'Fill in the missing word';
      case 'word_order':
        return 'Arrange the words';
      default:
        return type?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()) || 'Exercise';
    }
  };

  // Validate exercise data
  if (!exercise || !exercise.type) {
    return (
      <div className="text-red-400 p-4 text-center">
        Invalid exercise data. Please try again.
      </div>
    );
  }

  const handleSubmit = () => {
    let correct = false;
    let userAnswer = '';

    switch (exercise.type) {
      case 'fill_in_blank': {
        userAnswer = (answer || selectedOption).trim();
        const fillUserAnswer = userAnswer.toLowerCase()
          .replace(/[.,!?;:]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/["\u201C\u201D]/g, '')
          .trim();
        const fillCorrectAnswer = exercise.correctAnswer.toLowerCase()
          .replace(/[.,!?;:]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/["\u201C\u201D]/g, '')
          .trim();
        correct = fillCorrectAnswer === fillUserAnswer;
        break;
      }
      case 'word_order': {
        userAnswer = answer.trim();
        const wordOrderUserAnswer = userAnswer.toLowerCase()
          .replace(/[.,!?;:]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/["\u201C\u201D]/g, '')
          .trim();
        const wordOrderCorrectAnswer = exercise.correctAnswer.toLowerCase()
          .replace(/[.,!?;:]/g, '')
          .replace(/\s+/g, ' ')
          .replace(/["\u201C\u201D]/g, '')
          .trim();
        correct = wordOrderCorrectAnswer === wordOrderUserAnswer;
        break;
      }
      default:
        correct = false;
    }

    setIsCorrect(correct);
    setExplanation(exercise.explanation || '');
    setShowResult(true);
  };

  const handleNext = () => {
    onComplete(isCorrect, explanation);
    setAnswer('');
    setSelectedOption('');
    setShowResult(false);
    setIsCorrect(false);
    setExplanation('');
    setShowDetails(false);
  };

  const renderExerciseContent = () => {
    // Validate required fields for each exercise type
    const validateExercise = () => {
      switch (exercise.type) {
        case 'fill_in_blank':
          if (!exercise.question || !exercise.correctAnswer) {
            return 'Missing question or correct answer';
          }
          return null;
        case 'word_order':
          if (!exercise.scrambledWords || !exercise.correctAnswer) {
            return 'Missing scrambled words or correct answer';
          }
          return null;
        default:
          return 'Unknown exercise type';
      }
    };

    const validationError = validateExercise();
    if (validationError) {
      return (
        <div className="text-red-400 p-4 text-center">
          {validationError}
        </div>
      );
    }

    switch (exercise.type) {
      case 'fill_in_blank':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-400">Type the missing word (marked as ___) or choose from the options.</div>
            <div className="text-lg leading-relaxed">
              <InteractiveText>
                {String(exercise.sentenceWithBlank || exercise.question || '').includes('___') ? (
                  <>
                    {(exercise.sentenceWithBlank || exercise.question).split('___').map((part, index, arr) => (
                      <span key={index}>
                        {part}
                        {index < arr.length - 1 && (
                          <>
                            <input
                              ref={blankInputRef}
                              type="text"
                              value={answer}
                              onChange={(e) => setAnswer(e.target.value)}
                              className="mx-2 px-3 py-1 rounded-full bg-gray-800/70 border border-blue-500/40 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-40 text-center shadow-inner"
                              placeholder="___"
                              disabled={showResult}
                              autoCapitalize="off"
                              autoCorrect="off"
                              spellCheck={false}
                              aria-label="Fill the missing word"
                            />
                            {getWordClassHint(exercise) && (
                              <span className="inline-block align-middle text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-full px-2 py-0.5 mr-1">
                                {getWordClassHint(exercise)}
                              </span>
                            )}
                          </>
                        )}
                      </span>
                    ))}
                  </>
                ) : (
                  <>
                    <div className="flex items-center flex-wrap gap-2">
                      <span>{exercise.question || exercise.prompt || ''}</span>
                      {getWordClassHint(exercise) && (
                        <span className="inline-block text-xs text-blue-300 bg-blue-500/10 border border-blue-500/30 rounded-full px-2 py-0.5">
                          {getWordClassHint(exercise)}
                        </span>
                      )}
                    </div>
                    <div className="mt-3">
                      <input
                        ref={blankInputRef}
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="px-4 py-2 rounded-full bg-gray-800/70 border border-blue-500/40 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-inner"
                        placeholder="___"
                        disabled={showResult}
                        autoCapitalize="off"
                        autoCorrect="off"
                        spellCheck={false}
                        aria-label="Fill the missing word"
                      />
                    </div>
                  </>
                )}
              </InteractiveText>
            </div>

            {Array.isArray(exercise.options) && exercise.options.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-gray-400">Or choose the correct word:</div>
                <div className="flex flex-wrap gap-2">
                  {exercise.options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (!showResult) {
                          setSelectedOption(opt);
                          setAnswer(opt);
                          // put focus back to input for quick editing
                          requestAnimationFrame(() => blankInputRef.current?.focus());
                        }
                      }}
                      disabled={showResult}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        answer === opt
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'word_order':
        return (
          <div className="space-y-4">
            <div className="text-sm text-gray-400">Tap words to build the sentence in correct order.</div>
            {exercise.translation && (
              <div className="text-sm text-gray-400 mb-2">Hint (translation): {exercise.translation}</div>
            )}
            
            {/* User's Answer */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Your answer:</div>
              <div className="min-h-[3rem] bg-gray-800 p-3 rounded-lg border border-gray-600 flex flex-wrap gap-2 items-center">
                {answer.split(' ').filter(word => word.trim()).map((word, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center gap-1"
                  >
                    {word}
                    <button
                      onClick={() => {
                        const words = answer.split(' ').filter(w => w.trim());
                        words.splice(index, 1);
                        setAnswer(words.join(' '));
                      }}
                      className="text-blue-200 hover:text-white text-xs"
                      disabled={showResult}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {answer.split(' ').filter(word => word.trim()).length === 0 && (
                  <span className="text-gray-500 text-sm">Click words below to arrange them</span>
                )}
              </div>
            </div>

            {/* Available Words */}
            <div className="mb-4">
              <div className="text-sm text-gray-400 mb-2">Words to arrange:</div>
              <div className="flex flex-wrap gap-2">
                {(exercise.scrambledWords || exercise.words || []).map((word, index) => {
                  const isUsed = answer.split(' ').includes(word);
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        if (!showResult && !isUsed) {
                          setAnswer(prev => prev + (prev ? ' ' : '') + word);
                        }
                      }}
                      disabled={showResult || isUsed}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        isUsed
                          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-700 text-gray-200 hover:bg-gray-600 cursor-pointer'
                      }`}
                    >
                      {word}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Clear Answer Button */}
            {!showResult && answer.trim() && (
              <div className="flex justify-center">
                <button
                  onClick={() => setAnswer('')}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Clear answer
                </button>
              </div>
            )}
          </div>
        );



      default:
        return (
          <div className="text-gray-400">
            Unknown exercise type: {exercise.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-2xl">
            {exercise.type === 'fill_in_blank' && '📝'}
            {exercise.type === 'word_order' && '📋'}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-200">
              {titleForType(exercise.type)}
            </h3>
            {exercise.difficulty && <p className="text-sm text-gray-400">{exercise.difficulty}</p>}
          </div>
        </div>
      </div>

      {/* Exercise Content */}
      {renderExerciseContent()}

      {/* Result Display */}
      {showResult && (
        <div className={`p-4 rounded-lg border ${
          isCorrect 
            ? 'bg-green-900/20 border-green-500 text-green-300' 
            : 'bg-red-900/20 border-red-500 text-red-300'
        }`}>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">{isCorrect ? '✅' : '❌'}</span>
              <span className="font-semibold">{isCorrect ? 'Correct!' : 'Incorrect'}</span>
            </div>
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="px-3 py-1.5 text-xs rounded-md bg-gray-800/60 hover:bg-gray-800 border border-gray-700 text-gray-200 transition-colors"
            >
              {showDetails ? 'Hide explanation' : 'Explain answer'}
            </button>
          </div>
          {showDetails && (
            <div className="mt-2 space-y-2 text-sm opacity-90">
              {exercise.rule || exercise.ruleReference ? (
                <div>
                  <div className="font-semibold text-gray-200">Rule</div>
                  <div className="text-gray-300">{exercise.rule || exercise.ruleReference}</div>
                </div>
              ) : null}
              {explanation ? (
                <div>
                  <div className="font-semibold text-gray-200">Explanation</div>
                  <div className="text-gray-300">{explanation}</div>
                </div>
              ) : null}
              {Array.isArray(exercise.examples) && exercise.examples.length > 0 ? (
                <div>
                  <div className="font-semibold text-gray-200">Examples</div>
                  <ul className="list-disc ml-5 text-gray-300 space-y-1">
                    {exercise.examples.slice(0, 2).map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        {!showResult ? (
          <button
            onClick={handleSubmit}
            disabled={
              (exercise.type === 'fill_in_blank' && !(answer.trim() || selectedOption)) ||
              (exercise.type === 'word_order' && answer.trim().split(' ').length < 2)
            }
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            Check Answer
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setShowDetails((v) => !v)}
              className="px-5 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              {showDetails ? 'Hide explanation' : 'Explain answer'}
            </button>
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              Next Exercise
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 