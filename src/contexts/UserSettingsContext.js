import React, { createContext, useContext, useState, useEffect } from 'react';

const UserSettingsContext = createContext();

export const useUserSettings = () => {
  const context = useContext(UserSettingsContext);
  if (!context) {
    throw new Error('useUserSettings must be used within a UserSettingsProvider');
  }
  return context;
};

export const UserSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    nativeLanguage: 'en',
    learningLanguage: 'nl',
    voice: 'female',
    mode: 'both'
  });
  
  const [isLoading, setIsLoading] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error('Error parsing saved settings:', error);
      }
    }
    setIsLoading(false);
  }, []);

  const updateSettings = async (newSettings) => {
    try {
      setSettings(newSettings);
      localStorage.setItem('userSettings', JSON.stringify(newSettings));
      return { success: true };
    } catch (error) {
      console.error('Error saving user settings:', error);
      return { success: false, error: error.message };
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    return await updateSettings(newSettings);
  };

  const value = {
    settings,
    isLoading,
    updateSettings,
    updateSetting
  };

  return (
    <UserSettingsContext.Provider value={value}>
      {children}
    </UserSettingsContext.Provider>
  );
}; 