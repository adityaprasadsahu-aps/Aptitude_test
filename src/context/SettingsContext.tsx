import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { TestSettings } from '../types';

export const defaultSettings: TestSettings = {
  totalQuestions: 50,
  totalTimeMinutes: 30,
  sectionDistribution: [
    { section: 'SQL Basics', timeLimit: 3, questionCount: 5 },
    { section: 'Cloud Basics', timeLimit: 3, questionCount: 5 },
    { section: 'Verbal Ability', timeLimit: 5, questionCount: 9 },
    { section: 'Logical Reasoning', timeLimit: 5, questionCount: 9 },
    { section: 'Puzzles & Games', timeLimit: 4, questionCount: 8 },
    { section: 'Arithmetic Ability', timeLimit: 6, questionCount: 9 },
    { section: 'Generative AI', timeLimit: 4, questionCount: 5 },
  ],
  difficultyRatio: {
    Easy: 60,
    Medium: 30,
    Hard: 10,
  },
  negativeMarking: false,
  negativeMarkWeight: 0.25,
  shuffleQuestions: true,
  shuffleOptions: true,
};

interface SettingsContextProps {
  settings: TestSettings;
  updateSettings: (newSettings: TestSettings) => void;
  restoreDefaults: () => void;
}

export const SettingsContext = createContext<SettingsContextProps>({
  settings: defaultSettings,
  updateSettings: () => {},
  restoreDefaults: () => {},
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<TestSettings>(() => {
    const saved = localStorage.getItem('aptitudeTestSettings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('aptitudeTestSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: TestSettings) => {
    setSettings(newSettings);
  };

  const restoreDefaults = () => {
    setSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, restoreDefaults }}>
      {children}
    </SettingsContext.Provider>
  );
};
