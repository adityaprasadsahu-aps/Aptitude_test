import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext, defaultSettings } from '../context/SettingsContext';
import { ArrowLeft, RotateCcw, Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, updateSettings, restoreDefaults } = useContext(SettingsContext);
  const [localSettings, setLocalSettings] = useState(settings);
  const navigate = useNavigate();

  const handleSave = () => {
    updateSettings(localSettings);
    navigate('/');
  };

  const handleRestore = () => {
    setLocalSettings(defaultSettings);
    restoreDefaults();
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h1>Test Configuration</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleRestore}>
            <RotateCcw size={18} /> Restore Defaults
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={18} /> Save Settings
          </button>
        </div>
      </div>

      <div className="settings-content">
        <section className="settings-section">
          <h2>General Settings</h2>
          <div className="form-group">
            <label>Total Questions</label>
            <input 
              type="number" 
              value={localSettings.totalQuestions}
              onChange={(e) => setLocalSettings({...localSettings, totalQuestions: parseInt(e.target.value) || 0})}
            />
          </div>
          <div className="form-group">
            <label>Total Time (Minutes)</label>
            <input 
              type="number" 
              value={localSettings.totalTimeMinutes}
              onChange={(e) => setLocalSettings({...localSettings, totalTimeMinutes: parseInt(e.target.value) || 0})}
            />
          </div>
        </section>

        <section className="settings-section">
          <h2>Difficulty Distribution (%)</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Easy</label>
              <input 
                type="number" 
                value={localSettings.difficultyRatio.Easy}
                onChange={(e) => setLocalSettings({
                  ...localSettings, 
                  difficultyRatio: {...localSettings.difficultyRatio, Easy: parseInt(e.target.value) || 0}
                })}
              />
            </div>
            <div className="form-group">
              <label>Medium</label>
              <input 
                type="number" 
                value={localSettings.difficultyRatio.Medium}
                onChange={(e) => setLocalSettings({
                  ...localSettings, 
                  difficultyRatio: {...localSettings.difficultyRatio, Medium: parseInt(e.target.value) || 0}
                })}
              />
            </div>
            <div className="form-group">
              <label>Hard</label>
              <input 
                type="number" 
                value={localSettings.difficultyRatio.Hard}
                onChange={(e) => setLocalSettings({
                  ...localSettings, 
                  difficultyRatio: {...localSettings.difficultyRatio, Hard: parseInt(e.target.value) || 0}
                })}
              />
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Test Features</h2>
          <div className="toggle-group">
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={localSettings.shuffleQuestions}
                onChange={(e) => setLocalSettings({...localSettings, shuffleQuestions: e.target.checked})}
              />
              Shuffle Questions
            </label>
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={localSettings.shuffleOptions}
                onChange={(e) => setLocalSettings({...localSettings, shuffleOptions: e.target.checked})}
              />
              Shuffle Options
            </label>
            <label className="toggle-label">
              <input 
                type="checkbox" 
                checked={localSettings.negativeMarking}
                onChange={(e) => setLocalSettings({...localSettings, negativeMarking: e.target.checked})}
              />
              Enable Negative Marking (-{localSettings.negativeMarkWeight})
            </label>
          </div>
        </section>

        <section className="settings-section">
          <h2>Section Distribution (Questions)</h2>
          {localSettings.sectionDistribution.map((section, index) => (
            <div className="form-group row" key={section.section}>
              <label>{section.section}</label>
              <input 
                type="number" 
                value={section.questionCount}
                onChange={(e) => {
                  const newDist = [...localSettings.sectionDistribution];
                  newDist[index].questionCount = parseInt(e.target.value) || 0;
                  setLocalSettings({...localSettings, sectionDistribution: newDist});
                }}
              />
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default Settings;
