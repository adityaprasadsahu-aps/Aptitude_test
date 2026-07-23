import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SettingsProvider } from './context/SettingsContext';
import Home from './pages/Home';
import Settings from './pages/Settings';
import MockTest from './pages/MockTest';
import Results from './pages/Results';

function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/test" element={<MockTest />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}

export default App;
