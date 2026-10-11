import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsContext, buildDynamicSettingsForCompany, defaultSettings } from '../context/SettingsContext';
import { ArrowLeft, RotateCcw, Save, Trash2, Building2, Clock, HelpCircle, Layers } from 'lucide-react';

const Settings: React.FC = () => {
  const { settings, companies, updateSettings, restoreDefaults } = useContext(SettingsContext);
  const [localSettings, setLocalSettings] = useState(settings);
  const navigate = useNavigate();

  // Sync if global settings change externally
  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const comp = e.target.value;
    const newSettings = buildDynamicSettingsForCompany(comp, companies, localSettings);
    setLocalSettings(newSettings);
  };

  const handleSave = () => {
    updateSettings(localSettings);
    navigate('/');
  };

  const handleRestore = () => {
    const restored = buildDynamicSettingsForCompany(localSettings.selectedCompany, companies, defaultSettings);
    setLocalSettings(restored);
    restoreDefaults();
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your asked questions history?')) {
      localStorage.removeItem('askedQuestions');
      alert('Question history cleared! You will now see previously asked questions again.');
    }
  };

  // Find available count for a section from the company metadata
  const getAvailableCount = (sectionName: string): number | null => {
    if (localSettings.selectedCompany === 'All') {
      let total = 0;
      companies.forEach(c => {
        const found = c.sections.find(s => s.section.toLowerCase() === sectionName.toLowerCase());
        if (found) total += found.questionCount;
      });
      return total > 0 ? total : null;
    }
    const comp = companies.find(c => c.name.toLowerCase() === localSettings.selectedCompany.toLowerCase());
    if (comp) {
      const found = comp.sections.find(s => s.section.toLowerCase() === sectionName.toLowerCase());
      return found ? found.questionCount : null;
    }
    return null;
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={24} />
        </button>
        <h1>Test Configuration</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleClearHistory} style={{ marginRight: '10px' }} title="Clear Asked Questions History">
            <Trash2 size={18} /> Clear History
          </button>
          <button className="btn-secondary" onClick={handleRestore} title="Restore company default distribution">
            <RotateCcw size={18} /> Restore Defaults
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={18} /> Save Settings
          </button>
        </div>
      </div>

      <div className="settings-content">
        {/* Target Company Selector */}
        <section className="settings-section">
          <h2>
            <Building2 size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Target Company Selection
          </h2>
          <div className="form-group">
            <label>Select Target Company (from Question Bank)</label>
            <select 
              value={localSettings.selectedCompany}
              onChange={handleCompanyChange}
              style={{
                width: '100%',
                padding: '0.6rem 1rem',
                fontSize: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #d1d5db)',
                background: 'var(--bg-primary, #ffffff)',
                color: 'var(--text-primary, #111827)'
              }}
            >
              <option value="All">All Companies (Mixed Practice)</option>
              {companies.map(c => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.totalQuestions} Questions in Bank)
                </option>
              ))}
            </select>
            <small style={{ color: 'var(--text-secondary, #6b7280)', marginTop: '4px', display: 'block' }}>
              Switching target company automatically recalibrates section patterns to match its Question Bank folder.
            </small>
          </div>
        </section>

        {/* General Settings */}
        <section className="settings-section">
          <h2>General Settings</h2>
          <div className="form-row">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <HelpCircle size={16} /> Total Questions
              </label>
              <input 
                type="number" 
                value={localSettings.totalQuestions}
                onChange={(e) => setLocalSettings({...localSettings, totalQuestions: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={16} /> Total Time (Minutes)
              </label>
              <input 
                type="number" 
                value={localSettings.totalTimeMinutes}
                onChange={(e) => setLocalSettings({...localSettings, totalTimeMinutes: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
        </section>

        {/* Difficulty Distribution */}
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

        {/* Features & Options */}
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

        {/* Section Distribution */}
        <section className="settings-section">
          <h2>
            <Layers size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '8px' }} />
            Section Breakdown ({localSettings.selectedCompany === 'All' ? 'All Sections' : localSettings.selectedCompany})
          </h2>
          {localSettings.sectionDistribution.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No sections found for this target company.</p>
          ) : (
            localSettings.sectionDistribution.map((section, index) => {
              const available = getAvailableCount(section.section);
              return (
                <div 
                  className="form-group row" 
                  key={section.section}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    gap: '1rem',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid var(--border-color, #f3f4f6)' 
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>{section.section}</strong>
                    {available !== null && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary, #6b7280)', marginLeft: '8px' }}>
                        ({available} in bank)
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Qs:</span>
                    <input 
                      type="number" 
                      style={{ width: '80px', padding: '0.4rem' }}
                      value={section.questionCount}
                      min="0"
                      onChange={(e) => {
                        const newDist = [...localSettings.sectionDistribution];
                        newDist[index].questionCount = parseInt(e.target.value) || 0;
                        const sumQ = newDist.reduce((acc, curr) => acc + curr.questionCount, 0);
                        setLocalSettings({
                          ...localSettings, 
                          sectionDistribution: newDist,
                          totalQuestions: sumQ
                        });
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
};

export default Settings;
