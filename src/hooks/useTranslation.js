import { useUserSettings } from '../contexts/UserSettingsContext';
import { getTranslation } from '../utils/translations';

// Hook for using translations based on user's native language
export const useTranslation = () => {
  const { settings } = useUserSettings();
  const language = settings?.nativeLanguage || 'en';
  
  const t = (key) => {
    return getTranslation(key, language);
  };
  
  return { t, language };
};

