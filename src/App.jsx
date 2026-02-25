import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import History from './components/History';
import ProgressReports from './components/ProgressReports';
import WorkoutLogger from './components/WorkoutLogger';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import { useAuth } from './context/AuthContext';
import { fetchHistory, fetchProfile } from './utils/storage';
import { LayoutDashboard, History as HistoryIcon, TrendingUp, User, Loader2 } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeWorkoutDay, setActiveWorkoutDay] = useState(null);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('gymlog-theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gymlog-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Load data when user changes
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setDataLoading(true);
        try {
          const [h, p] = await Promise.all([
            fetchHistory(user.uid),
            fetchProfile(user.uid)
          ]);
          setHistory(h || []);
          setProfile(p);
        } catch (err) {
          console.error("Error loading user data:", err);
        } finally {
          setDataLoading(false);
        }
      };
      loadData();
    } else {
      setHistory([]);
      setProfile(null);
    }
  }, [user]);

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)', color: 'white' }}>
        <Loader2 size={40} className="spin" color="var(--accent-color)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Identifying Zen...</p>
      </div>
    );
  }

  if (!user) return <div className="app-container"><Auth /></div>;

  const renderContent = () => {
    // 1. Check for workout logger (active workout)
    if (activeWorkoutDay !== null) {
      return (
        <WorkoutLogger
          dayIndex={activeWorkoutDay}
          history={history}
          onFinish={async () => {
            setActiveWorkoutDay(null);
            setDataLoading(true);
            const h = await fetchHistory(user.uid);
            setHistory(h || []);
            setDataLoading(false);
            setActiveTab('history');
          }}
          onCancel={() => setActiveWorkoutDay(null)}
        />
      );
    }

    // 2. Check for new user onboarding logic
    if (profile && profile.isNewUser) {
      return (
        <Onboarding
          onComplete={(newProfile) => {
            setProfile(newProfile);
          }}
        />
      );
    }

    // 3. Loading state for initial data
    if (dataLoading && history.length === 0) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} className="spin" color="var(--accent-color)" />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard history={history} profile={profile} onStartWorkout={(idx) => setActiveWorkoutDay(idx)} />;
      case 'history':
        return <History history={history} />;
      case 'progress':
        return <ProgressReports history={history} />;
      case 'profile':
        return <Profile profile={profile} setProfile={setProfile} theme={theme} toggleTheme={toggleTheme} />;
      default:
        return <Dashboard history={history} profile={profile} onStartWorkout={(idx) => setActiveWorkoutDay(idx)} />;
    }
  };

  return (
    <div className="app-container">
      <main>
        {renderContent()}
      </main>

      {activeWorkoutDay === null && !(profile && profile.isNewUser) && (
        <nav className="bottom-nav">
          <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <LayoutDashboard size={22} />
            <span>DASHBOARD</span>
          </div>
          <div className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
            <HistoryIcon size={22} />
            <span>HISTORY</span>
          </div>
          <div className={`nav-item ${activeTab === 'progress' ? 'active' : ''}`} onClick={() => setActiveTab('progress')}>
            <TrendingUp size={22} />
            <span>INSIGHTS</span>
          </div>
          <div className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <User size={22} />
            <span>ACCOUNT</span>
          </div>
        </nav>
      )}
    </div>
  );
}

export default App;
