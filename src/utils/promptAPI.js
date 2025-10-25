// Chrome Prompt API Integration
// This module provides client-side integration with Chrome's Prompt API for AI interactions

// Check if Chrome Prompt API is available
export const checkPromptAPIAvailability = () => {
  if (typeof window === 'undefined') {
    return {
      params: null,
      availability: 'unavailable',
      isAvailable: false,
      error: 'Not running in browser environment'
    };
  }

  // Check for Chrome Prompt API availability
  if (!window.LanguageModel || typeof window.LanguageModel.create !== 'function') {
    return {
      params: null,
      availability: 'unavailable',
      isAvailable: false,
      error: 'Chrome Prompt API not available. Please use Chrome 138+ with AI features enabled and ensure the Prompt API is supported in your region.'
    };
  }

  return {
    params: null,
    availability: 'available',
    isAvailable: true,
    error: null
  };
};

// Create a language model session
const createLanguageModelSession = async () => {
  const availability = checkPromptAPIAvailability();
  if (!availability.isAvailable) {
    throw new Error(availability.error);
  }

  try {
    const session = await window.LanguageModel.create({
      model: 'gemini-2.0-flash-exp'
    });
    return session;
  } catch (error) {
    throw new Error(`Failed to create language model session: ${error.message}`);
  }
};

// Create prompt for formulating a question about selected text
const createQuestionFormulationPrompt = (text) => {
  return `You are a helpful language learning assistant. The user has selected this text: "${text}"

Your task is to formulate ONE simple, concise question about this text that would help the user learn the language better.

Requirements:
- Generate exactly ONE question
- Make it simple and concise
- Focus on language learning aspects (grammar, vocabulary, meaning, etc.)
- The question should be answerable by reading and analyzing the text
- Do not include any explanations or additional information
- Just return the question itself
`;
};



// Create prompt for generating questions (legacy - for follow-ups)
const createQuestionPrompt = (text, context) => {
  const { originalText, originalQuestion } = context;
  
  if (originalText && originalQuestion) {
    // This is a follow-up question
    return `You are a helpful language learning assistant. The user previously asked about this text: "${originalText}" and you suggested these questions: "${originalQuestion}".

Now they have a follow-up question: "${text}"

Please provide a helpful answer that builds on the previous conversation. Keep your response concise but informative, focusing on language learning aspects.`;
  } else {
    // This is a new question
    return `You are a helpful language learning assistant. The user has selected this text: "${text}"

They want to ask a question about it. Please generate 1 (and only 1) thoughtful question they could ask about this text to help them learn the language better.
The question must be related to the text and should be a question that the user could answer by reading the text and potentially asking for clarification or follow-up questions.
`;
  }
};

// Create prompt for answering questions
const createAnswerPrompt = (text, context) => {
  const { originalText, originalQuestion } = context;
  
  return `You are a helpful language learning assistant. The user previously asked about this text: "${originalText}" and you suggested these questions: "${originalQuestion}".

Now they are asking: "${text}"

Please provide a detailed, helpful answer that will help them learn. Include:
- Clear explanations
- Examples if helpful
- Common mistakes to avoid
- Tips for remembering

Keep your response educational and encouraging.`;
};


// Process text with streaming response (for longer responses)
export const processTextWithStreamingPrompt = async (text, actionType, context = {}, onChunk) => {
  const session = await createLanguageModelSession();
  
  try {
    let prompt;
    
    switch (actionType) {
      case 'question':
        prompt = createQuestionPrompt(text, context);
        break;
      case 'question-formulation':
        prompt = createQuestionFormulationPrompt(text);
        break;
      case 'answer':
        prompt = createAnswerPrompt(text, context);
        break;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }

    const result = await session.prompt(prompt);
    
    // Handle different possible response structures
    let responseText = null;
    
    if (result.response && result.response.text) {
      responseText = result.response.text;
    } else if (result.response && typeof result.response === 'string') {
      responseText = result.response;
    } else if (result.text) {
      responseText = result.text;
    } else if (typeof result === 'string') {
      responseText = result;
    }
    
    if (responseText && onChunk) {
      // Process streaming response
      const chunks = responseText.split(' ');
      for (let i = 0; i < chunks.length; i++) {
        onChunk(chunks[i] + (i < chunks.length - 1 ? ' ' : ''));
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return result;
  } finally {
    // Clean up session
    if (session && typeof session.destroy === 'function') {
      await session.destroy();
    }
  }
};

// Process question formulation and translation workflow
export const processQuestionWorkflow = async (selectedText, targetLanguage = 'Dutch') => {
  try {
    // Step 1: Formulate a question about the selected text
    console.log('Step 1: Formulating question about text:', selectedText);
    const formulationResult = await processTextWithPrompt(selectedText, 'question-formulation');
    
    if (!formulationResult.success) {
      throw new Error(formulationResult.error || 'Failed to formulate question');
    }
    
    const formulatedQuestion = formulationResult.response.trim();
    console.log('Formulated question:', formulatedQuestion);
    
    // Step 2: Translate the question using Gemini Translation API
    console.log('Step 2: Translating question to', targetLanguage);
    const translatedQuestion = await translateText(formulatedQuestion, targetLanguage);
    console.log('Translated question:', translatedQuestion);
    
    return {
      success: true,
      response: translatedQuestion,
      originalQuestion: formulatedQuestion,
      actionType: 'question'
    };
    
  } catch (error) {
    console.error('Error in question workflow:', error);
    return {
      success: false,
      error: error.message,
      response: null
    };
  }
};

// Translate text using the same translation API used for word translations
const translateText = async (text, targetLanguage) => {
  try {
    // Use the same translation API used for word translations
    const TranslatorAPI = typeof window !== 'undefined' ? window.Translator : undefined;
    
    if (!TranslatorAPI) {
      throw new Error('Translation API not available');
    }

    // Create translator instance
    const translator = await TranslatorAPI.create();
    
    // Translate the text
    const translated = await translator.translate(text);
    
    return translated;
  } catch (error) {
    console.error('Translation error:', error);
    // Fallback: return original text if translation fails
    return text;
  }
};

// Process text with Prompt API (main function)
export const processTextWithPrompt = async (text, actionType = 'question', context = {}) => {
  let session = null;
  
  try {
    session = await createLanguageModelSession();
    
    let prompt;
    
    switch (actionType) {
      case 'question':
        prompt = createQuestionPrompt(text, context);
        break;
      case 'question-formulation':
        prompt = createQuestionFormulationPrompt(text);
        break;
      case 'answer':
        prompt = createAnswerPrompt(text, context);
        break;
      default:
        throw new Error(`Unknown action type: ${actionType}`);
    }

    const result = await session.prompt(prompt);
    
    // Debug logging to understand response structure
    console.log('Prompt API result:', result);
    
    // Handle different possible response structures
    let responseText = null;
    
    if (result.response && result.response.text) {
      responseText = result.response.text;
    } else if (result.response && typeof result.response === 'string') {
      responseText = result.response;
    } else if (result.text) {
      responseText = result.text;
    } else if (typeof result === 'string') {
      responseText = result;
    }
    
    console.log('Extracted response text:', responseText);
    
    if (responseText) {
      return {
        success: true,
        response: responseText,
        actionType: actionType
      };
    } else {
      console.error('Unexpected response structure:', result);
      return {
        success: false,
        error: 'No response received from language model'
      };
    }
  } catch (error) {
    console.error('Error processing text with Prompt API:', error);
    
    // Provide more specific error messages
    if (error.message.includes('create is not a function')) {
      return {
        success: false,
        error: 'Chrome Prompt API not available. Please use Chrome 138+ with AI features enabled and ensure the Prompt API is supported in your region.'
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  } finally {
    // Clean up session if it was created
    if (session && typeof session.destroy === 'function') {
      try {
        await session.destroy();
      } catch (destroyError) {
        console.warn('Error destroying session:', destroyError);
      }
    }
  }
};

// Get available models
export const getAvailableModels = async () => {
  try {
    const availability = checkPromptAPIAvailability();
    if (!availability.isAvailable) {
      return {
        success: false,
        error: availability.error
      };
    }

    // For now, we'll return the default model
    // In the future, this could be expanded to list available models
    return {
      success: true,
      models: ['gemini-2.0-flash-exp']
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};