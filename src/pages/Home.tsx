import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, PlayCircle } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Aptitude Test Pro</h1>
        <p>Master your skills with our comprehensive mock test engine.</p>
        
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
