import React, { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { TestSettings, CompanyInfo, SectionDistribution } from '../types';

export const defaultSettings: TestSettings = {
  selectedCompany: 'All',
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

export const companyDefaults: Record<string, Partial<TestSettings>> = {
  Infosys: {
    totalQuestions: 54,
    totalTimeMinutes: 100,
    sectionDistribution: [
      { section: 'Mathematical Ability', timeLimit: 35, questionCount: 10 },
      { section: 'Logical Reasoning', timeLimit: 25, questionCount: 15 },
      { section: 'Verbal Ability', timeLimit: 20, questionCount: 20 },
      { section: 'Pseudo Code', timeLimit: 10, questionCount: 5 },
      { section: 'Puzzle Solving', timeLimit: 10, questionCount: 4 },
    ]
  },
  P360: {
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
    ]
  }
};

export function buildDynamicSettingsForCompany(
  company: string,
  companies: CompanyInfo[],
  baseSettings: TestSettings
): TestSettings {
  if (company === 'All') {
    // Collect all unique sections from all companies
    const allSectionsMap = new Map<string, number>();
    companies.forEach(comp => {
      comp.sections.forEach(s => {
        allSectionsMap.set(s.section, (allSectionsMap.get(s.section) || 0) + s.questionCount);
      });
    });

    const dynamicSections: SectionDistribution[] = Array.from(allSectionsMap.keys()).map(sec => ({
      section: sec,
      timeLimit: 5,
      questionCount: 7
    }));

    const totalQ = dynamicSections.reduce((sum, s) => sum + s.questionCount, 0);
    const totalTime = dynamicSections.reduce((sum, s) => sum + s.timeLimit, 0);

    return {
      ...baseSettings,
      selectedCompany: 'All',
      totalQuestions: totalQ > 0 ? totalQ : 50,
      totalTimeMinutes: totalTime > 0 ? totalTime : 45,
      sectionDistribution: dynamicSections.length > 0 ? dynamicSections : baseSettings.sectionDistribution,
    };
  }

  // Predefined company defaults if present
  if (companyDefaults[company]) {
    return {
      ...baseSettings,
      selectedCompany: company,
      ...companyDefaults[company]
    };
  }

  // Dynamically derive settings from company sections in Question Bank
  const foundCompany = companies.find(c => c.name.toLowerCase() === company.toLowerCase());
  if (foundCompany && foundCompany.sections.length > 0) {
    const dynamicSections: SectionDistribution[] = foundCompany.sections.map(s => {
      const qCount = Math.min(10, Math.max(5, Math.round(s.questionCount * 0.1)));
      const time = Math.max(5, Math.round(qCount * 1.5));
      return {
        section: s.section,
        timeLimit: time,
        questionCount: qCount
      };
    });

    const totalQ = dynamicSections.reduce((sum, s) => sum + s.questionCount, 0);
    const totalTime = dynamicSections.reduce((sum, s) => sum + s.timeLimit, 0);

    return {
      ...baseSettings,
      selectedCompany: company,
      totalQuestions: totalQ,
      totalTimeMinutes: totalTime,
      sectionDistribution: dynamicSections
    };
  }

  return {
    ...baseSettings,
    selectedCompany: company
  };
}

interface SettingsContextProps {
  settings: TestSettings;
  companies: CompanyInfo[];
  isLoadingCompanies: boolean;
  updateSettings: (newSettings: TestSettings) => void;
  selectCompany: (company: string) => void;
  restoreDefaults: () => void;
  refreshCompanies: () => Promise<void>;
}

export const SettingsContext = createContext<SettingsContextProps>({
  settings: defaultSettings,
  companies: [],
  isLoadingCompanies: true,
  updateSettings: () => {},
  selectCompany: () => {},
  restoreDefaults: () => {},
  refreshCompanies: async () => {},
});

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [companies, setCompanies] = useState<CompanyInfo[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState<boolean>(true);

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

  const fetchCompaniesData = useCallback(async () => {
    try {
      setIsLoadingCompanies(true);
      const res = await fetch('/data/companies.json');
      if (res.ok) {
        const data: CompanyInfo[] = await res.json();
        setCompanies(data);
      } else {
        // Fallback to questions.json
        const qRes = await fetch('/data/questions.json');
        const qData = await qRes.json();
        const map = new Map<string, Map<string, number>>();
        qData.forEach((q: any) => {
          if (!map.has(q.company)) map.set(q.company, new Map());
          const secMap = map.get(q.company)!;
          secMap.set(q.section, (secMap.get(q.section) || 0) + 1);
        });
        const fallbackList: CompanyInfo[] = Array.from(map.entries()).map(([comp, secs]) => ({
          name: comp,
          totalQuestions: Array.from(secs.values()).reduce((a, b) => a + b, 0),
          sections: Array.from(secs.entries()).map(([sec, count]) => ({ section: sec, questionCount: count }))
        }));
        setCompanies(fallbackList);
      }
    } catch (e) {
      console.error("Failed to load companies metadata:", e);
    } finally {
      setIsLoadingCompanies(false);
    }
  }, []);

  useEffect(() => {
    fetchCompaniesData();
  }, [fetchCompaniesData]);

  useEffect(() => {
    localStorage.setItem('aptitudeTestSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: TestSettings) => {
    setSettings(newSettings);
  };

  const selectCompany = (company: string) => {
    const updated = buildDynamicSettingsForCompany(company, companies, settings);
    setSettings(updated);
  };

  const restoreDefaults = () => {
    const updated = buildDynamicSettingsForCompany(settings.selectedCompany, companies, defaultSettings);
    setSettings(updated);
  };

  const refreshCompanies = async () => {
    try {
      // Trigger backend sync endpoint if dev server watcher is available
      await fetch('/api/sync-question-bank').catch(() => {});
    } catch {
      // Ignore if endpoint not present
    }
    await fetchCompaniesData();
  };

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        companies, 
        isLoadingCompanies, 
        updateSettings, 
        selectCompany, 
        restoreDefaults, 
        refreshCompanies 
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
