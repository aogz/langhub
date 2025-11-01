import React, { useState } from 'react';
import { useUserSettings } from '../contexts/UserSettingsContext';
import TopBar from './TopBar';

const Settings = () => {
  const { settings, isLoading, updateSettings } = useUserSettings();
  
  // Local state for form
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success', 'error', or null

  // Language options
  const nativeLanguages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' }
  ];

  // Update local settings when context settings change
  React.useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const saveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);

    const result = await updateSettings(localSettings);
    
    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } else {
      setSaveStatus('error');
    }
    
    setIsSaving(false);
  };

  const handleSettingChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span>Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation Bar */}
      <nav className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <TopBar 
            title="Settings"
            subtitle="Customize your learning experience"
            showBackLink={true}
          />
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Settings Form */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 space-y-8">
              
              {/* Native Language */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Your Native Language</h3>
                <p className="text-gray-400 mb-4">The language you're most comfortable with</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {nativeLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleSettingChange('nativeLanguage', lang.code)}
                                             className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center gap-3 ${
                         localSettings.nativeLanguage === lang.code
                           ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                           : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                       }`}
                    >
                      <span className="text-2xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-6 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {saveStatus === 'success' && (
                      <div className="flex items-center gap-2 text-green-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Settings saved successfully!</span>
                      </div>
                    )}
                    {saveStatus === 'error' && (
                      <div className="flex items-center gap-2 text-red-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <span>Error saving settings. Please try again.</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={saveSettings}
                    disabled={isSaving}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Settings
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

      </main>
    </div>
  );
};

export default Settings; 