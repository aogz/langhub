// Language detection utilities using Chrome's Language Detector API

// Language code to flag emoji mapping
const LANGUAGE_FLAGS = {
  'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹', 'pt': '🇵🇹', 'nl': '🇳🇱',
  'ru': '🇷🇺', 'ja': '🇯🇵', 'ko': '🇰🇷', 'zh': '🇨🇳', 'ar': '🇸🇦', 'hi': '🇮🇳', 'th': '🇹🇭',
  'vi': '🇻🇳', 'tr': '🇹🇷', 'pl': '🇵🇱', 'sv': '🇸🇪', 'da': '🇩🇰', 'no': '🇳🇴', 'fi': '🇫🇮',
  'cs': '🇨🇿', 'sk': '🇸🇰', 'hu': '🇭🇺', 'ro': '🇷🇴', 'bg': '🇧🇬', 'hr': '🇭🇷', 'sl': '🇸🇮',
  'et': '🇪🇪', 'lv': '🇱🇻', 'lt': '🇱🇹', 'el': '🇬🇷', 'he': '🇮🇱', 'fa': '🇮🇷', 'ur': '🇵🇰',
  'bn': '🇧🇩', 'ta': '🇮🇳', 'te': '🇮🇳', 'ml': '🇮🇳', 'kn': '🇮🇳', 'gu': '🇮🇳', 'pa': '🇮🇳',
  'uk': '🇺🇦', 'be': '🇧🇾', 'ka': '🇬🇪', 'hy': '🇦🇲', 'az': '🇦🇿', 'kk': '🇰🇿', 'ky': '🇰🇬',
  'uz': '🇺🇿', 'tg': '🇹🇯', 'mn': '🇲🇳', 'my': '🇲🇲', 'km': '🇰🇭', 'lo': '🇱🇦', 'si': '🇱🇰',
  'ne': '🇳🇵', 'dz': '🇧🇹', 'bo': '🇨🇳', 'ug': '🇨🇳', 'ii': '🇨🇳', 'za': '🇨🇳', 'hsn': '🇨🇳',
  'yue': '🇭🇰', 'zh-TW': '🇹🇼', 'af': '🇿🇦', 'sw': '🇹🇿', 'am': '🇪🇹', 'yo': '🇳🇬', 'ig': '🇳🇬',
  'ha': '🇳🇬', 'zu': '🇿🇦', 'xh': '🇿🇦', 'st': '🇿🇦', 'tn': '🇿🇦', 'ss': '🇿🇦', 've': '🇿🇦',
  'ts': '🇿🇦', 'nr': '🇿🇦', 'nso': '🇿🇦', 'nbl': '🇿🇦', 'nnd': '🇿🇦', 'nfd': '🇿🇦'
};

// Language code to full name mapping
const LANGUAGE_NAMES = {
  'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian', 'pt': 'Portuguese', 'nl': 'Dutch',
  'ru': 'Russian', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese', 'ar': 'Arabic', 'hi': 'Hindi', 'th': 'Thai',
  'vi': 'Vietnamese', 'tr': 'Turkish', 'pl': 'Polish', 'sv': 'Swedish', 'da': 'Danish', 'no': 'Norwegian', 'fi': 'Finnish',
  'cs': 'Czech', 'sk': 'Slovak', 'hu': 'Hungarian', 'ro': 'Romanian', 'bg': 'Bulgarian', 'hr': 'Croatian', 'sl': 'Slovenian',
  'et': 'Estonian', 'lv': 'Latvian', 'lt': 'Lithuanian', 'el': 'Greek', 'he': 'Hebrew', 'fa': 'Persian', 'ur': 'Urdu',
  'bn': 'Bengali', 'ta': 'Tamil', 'te': 'Telugu', 'ml': 'Malayalam', 'kn': 'Kannada', 'gu': 'Gujarati', 'pa': 'Punjabi',
  'uk': 'Ukrainian', 'be': 'Belarusian', 'ka': 'Georgian', 'hy': 'Armenian', 'az': 'Azerbaijani', 'kk': 'Kazakh', 'ky': 'Kyrgyz',
  'uz': 'Uzbek', 'tg': 'Tajik', 'mn': 'Mongolian', 'my': 'Burmese', 'km': 'Khmer', 'lo': 'Lao', 'si': 'Sinhala',
  'ne': 'Nepali', 'dz': 'Dzongkha', 'bo': 'Tibetan', 'ug': 'Uyghur', 'ii': 'Yi', 'za': 'Zhuang', 'hsn': 'Xiang',
  'yue': 'Cantonese', 'zh-TW': 'Traditional Chinese', 'af': 'Afrikaans', 'sw': 'Swahili', 'am': 'Amharic', 'yo': 'Yoruba', 'ig': 'Igbo',
  'ha': 'Hausa', 'zu': 'Zulu', 'xh': 'Xhosa', 'st': 'Sotho', 'tn': 'Tswana', 'ss': 'Swati', 've': 'Venda',
  'ts': 'Tsonga', 'nr': 'Ndebele', 'nso': 'Northern Sotho', 'nbl': 'Southern Ndebele', 'nnd': 'Ndebele', 'nfd': 'Ndebele'
};

// Check if Language Detector API is available
export const isLanguageDetectorAvailable = () => {
  return typeof window !== 'undefined' && 'LanguageDetector' in window;
};

// Check if Chrome version supports Language Detector API (Chrome 138+)
export const isChrome138Plus = () => {
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
};

// Get language detector instance
export const getLanguageDetector = async () => {
  if (!isLanguageDetectorAvailable() || !isChrome138Plus()) {
    throw new Error('Language Detector API not available');
  }

  try {
    // Check if model is available
    const availability = await window.LanguageDetector.availability();
    if (availability === 'downloadable') {
      // Model needs to be downloaded
      return new Promise((resolve, reject) => {
        window.LanguageDetector.create({
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              console.log(`Language detection model downloaded ${Math.round(e.loaded * 100)}%`);
            });
          },
        }).then(resolve).catch(reject);
      });
    } else if (availability === 'available') {
      // Model is ready
      return await window.LanguageDetector.create();
    } else {
      throw new Error('Language detection model not available');
    }
  } catch (error) {
    throw new Error(`Failed to create language detector: ${error.message}`);
  }
};

// Detect language of text
export const detectLanguage = async (text) => {
  if (!text || text.trim().length < 3) {
    return { detectedLanguage: 'unknown', confidence: 0, flag: '❓', name: 'Unknown' };
  }

  try {
    const detector = await getLanguageDetector();
    const results = await detector.detect(text);
    
    if (results && results.length > 0) {
      const topResult = results[0];
      const languageCode = topResult.detectedLanguage;
      const confidence = topResult.confidence;
      
      // Only return result if confidence is above threshold
      if (confidence > 0.3) {
        return {
          detectedLanguage: languageCode,
          confidence: confidence,
          flag: LANGUAGE_FLAGS[languageCode] || '🌐',
          name: LANGUAGE_NAMES[languageCode] || languageCode.toUpperCase()
        };
      }
    }
    
    return { detectedLanguage: 'unknown', confidence: 0, flag: '❓', name: 'Unknown' };
  } catch (error) {
    console.error('Language detection error:', error);
    return { detectedLanguage: 'unknown', confidence: 0, flag: '❓', name: 'Unknown' };
  }
};

// Get language display info
export const getLanguageDisplayInfo = (languageCode) => {
  return {
    code: languageCode,
    flag: LANGUAGE_FLAGS[languageCode] || '🌐',
    name: LANGUAGE_NAMES[languageCode] || languageCode?.toUpperCase() || 'Unknown'
  };
};
