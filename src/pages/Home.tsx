import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, PlayCircle, Building2, RefreshCw, Layers, Clock, HelpCircle } from 'lucide-react';
import { SettingsContext } from '../context/SettingsContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { settings, companies, isLoadingCompanies, selectCompany, refreshCompanies } = useContext(SettingsContext);
  const [syncing, setSyncing] = useState(false);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    selectCompany(e.target.value);
  };

  const handleSync = async () => {
    setSyncing(true);
    await refreshCompanies();
    setTimeout(() => setSyncing(false), 500);
  };

  const selectedCompData = companies.find(c => c.name.toLowerCase() === settings.selectedCompany.toLowerCase());
  const totalQuestionsInBank = companies.reduce((acc, c) => acc + c.totalQuestions, 0);

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Aptitude Test Lite</h1>
        <p>Made in My Spare Time</p>
        
        <div className="company-selector-container" style={{ 
          margin: '2rem auto', 
          maxWidth: '650px',
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          gap: '1rem', 
          background: 'var(--bg-primary, #ffffff)', 
          padding: '1.5rem', 
          borderRadius: '12px',
          boxShadow: 'var(--box-shadow, 0 4px 6px -1px rgba(0,0,0,0.05))',
          border: '1px solid var(--border-color, #e5e7eb)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary, #111827)' }}>
              <Building2 size={22} color="var(--accent-primary, #2563eb)" />
              <label style={{ fontWeight: 600, fontSize: '1.05rem' }}>Target Company:</label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: '220px', justifyContent: 'flex-end' }}>
              <select 
                value={settings.selectedCompany} 
                onChange={handleCompanyChange}
                disabled={isLoadingCompanies || syncing}
                style={{ 
                  padding: '0.6rem 1rem', 
                  fontSize: '0.95rem', 
                  fontWeight: 500,
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color, #d1d5db)', 
                  background: 'var(--bg-card, #ffffff)', 
                  color: 'var(--text-primary, #111827)', 
                  cursor: 'pointer',
                  flex: 1,
                  maxWidth: '300px'
                }}
              >
                {isLoadingCompanies ? (
                  <option>Scanning Question Bank...</option>
                ) : (
                  <>
                    <option value="All">All Companies (Mixed Practice - {totalQuestionsInBank} Qs)</option>
                    {companies.map(c => (
                      <option key={c.name} value={c.name}>
                        {c.name} ({c.totalQuestions} Questions, {c.sections.length} Sections)
                      </option>
                    ))}
                  </>
                )}
              </select>

              <button
                type="button"
                onClick={handleSync}
                disabled={syncing}
                title="Rescan Question Bank folder for new companies"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.6rem 0.8rem',
                  fontSize: '0.85rem',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary, #f3f4f6)',
                  color: 'var(--text-secondary, #4b5563)',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  cursor: 'pointer'
                }}
              >
                <RefreshCw size={15} className={syncing ? 'spin' : ''} style={{ animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                <span>{syncing ? 'Syncing...' : 'Sync'}</span>
              </button>
            </div>
          </div>

          {/* Quick Stats Badges for Current Selection */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            width: '100%',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color, #f3f4f6)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary, #6b7280)',
            justifyContent: 'center'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Layers size={15} color="var(--accent-primary, #2563eb)" />
              {settings.sectionDistribution.length} Sections Configured
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <HelpCircle size={15} color="var(--success, #10b981)" />
              {settings.totalQuestions} Questions in Test
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={15} color="var(--warning, #f59e0b)" />
              {settings.totalTimeMinutes} Minutes Duration
            </span>
            {selectedCompData && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-primary)' }}>
                <strong>Bank Depth:</strong> {selectedCompData.totalQuestions} Questions Available
              </span>
            )}
          </div>
        </div>

        <div className="action-cards">
          <div className="card start-card" onClick={() => navigate('/test')}>
            <PlayCircle size={48} className="icon" />
            <h2>Start Mock Test</h2>
            <p>Take a test tailored for {settings.selectedCompany === 'All' ? 'mixed companies' : settings.selectedCompany}.</p>
          </div>
          
          <div className="card settings-card" onClick={() => navigate('/settings')}>
            <Settings size={48} className="icon" />
            <h2>Test Settings</h2>
            <p>Configure section distribution, question limits, and time duration.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
