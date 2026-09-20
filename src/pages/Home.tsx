import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, PlayCircle, Building2 } from 'lucide-react';
import { SettingsContext, companyDefaults } from '../context/SettingsContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { settings, updateSettings } = useContext(SettingsContext);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/data/questions.json');
        const data = await response.json();
        const uniqueCompanies = Array.from(new Set(data.map((q: any) => q.company))).filter(Boolean) as string[];
        setCompanies(['All', ...uniqueCompanies.sort()]);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch questions for companies:", err);
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const company = e.target.value;
    const newSettings = { ...settings, selectedCompany: company };
    
    if (companyDefaults[company]) {
      const defaults = companyDefaults[company];
      Object.assign(newSettings, defaults);
    }
    updateSettings(newSettings);
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Aptitude Test Pro</h1>
        <p>Master your skills with our comprehensive mock test engine.</p>
        
        <div className="company-selector-container" style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '12px' }}>
          <Building2 size={24} />
          <label style={{ fontWeight: 'bold' }}>Select Target Company:</label>
          <select 
            value={settings.selectedCompany} 
            onChange={handleCompanyChange}
            disabled={loading}
            style={{ padding: '0.5rem 1rem', fontSize: '1rem', borderRadius: '8px', border: '1px solid #444', background: '#222', color: '#fff', cursor: 'pointer' }}
          >
            {loading ? <option>Loading...</option> : companies.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'Mixed (All Companies)' : c}</option>
            ))}
          </select>
        </div>

        <div className="action-cards">
          <div className="card start-card" onClick={() => navigate('/test')}>
            <PlayCircle size={48} className="icon" />
            <h2>Start Mock Test</h2>
            <p>Take a full-length mock test configured to industry standards.</p>
          </div>
          
          <div className="card settings-card" onClick={() => navigate('/settings')}>
            <Settings size={48} className="icon" />
            <h2>Test Settings</h2>
            <p>Customize duration, difficulty, and question distribution.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
