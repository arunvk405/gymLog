import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import History from './components/History';
import ProgressReports from './components/ProgressReports';
import WorkoutLogger from './components/WorkoutLogger';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import TemplateEditor from './components/TemplateEditor';
import { useAuth } from './context/AuthContext';
import { fetchHistory, fetchProfile, fetchTemplates, saveTemplate, deleteTemplate, fetchExercises, seedExercises } from './utils/storage';
import { DEFAULT_TEMPLATE } from './data/program';
import { EXERCISE_DATABASE } from './data/exercises';
import { LayoutDashboard, History as HistoryIcon, TrendingUp, User, Loader2 } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeWorkoutDay, setActiveWorkoutDay] = useState(null);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('gymlog-theme') || 'light');

  // Template state
  const [templates, setTemplates] = useState([DEFAULT_TEMPLATE]);
  const [activeTemplateId, setActiveTemplateId] = useState(
    localStorage.getItem('gymlog-active-template') || 'default'
  );
  const [editingTemplate, setEditingTemplate] = useState(null); // null = not editing, {} = new, {data} = edit
  const [exerciseDb, setExerciseDb] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('gymlog-theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Scroll to top on tab/view change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab, activeWorkoutDay]);

  // Load data when user changes
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        setDataLoading(true);
        try {
          const [h, p, t, exercises] = await Promise.all([
            fetchHistory(user.uid),
            fetchProfile(user.uid),
            fetchTemplates(user.uid),
            fetchExercises()
          ]);
          setHistory(h || []);
          setProfile(p);
          setTemplates([DEFAULT_TEMPLATE, ...(t || [])]);

          // Seed exercise database if empty
          if (!exercises || exercises.length === 0) {
            try {
              await seedExercises(EXERCISE_DATABASE);
              setExerciseDb(EXERCISE_DATABASE);
              console.log('Exercise database seeded successfully');
            } catch (e) {
              console.warn('Could not seed exercises, using local fallback');
              setExerciseDb(EXERCISE_DATABASE);
            }
          } else {
            setExerciseDb(exercises);
          }
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
      setTemplates([DEFAULT_TEMPLATE]);
    }
  }, [user]);

  const activeTemplate = templates.find(t => t.id === activeTemplateId) || DEFAULT_TEMPLATE;

  const handleSelectTemplate = (id) => {
    setActiveTemplateId(id);
    localStorage.setItem('gymlog-active-template', id);
  };

  const handleSaveTemplate = async (templateData) => {
    try {
      const id = await saveTemplate(templateData, user.uid);
      templateData.id = id;
      // Update local state
      setTemplates(prev => {
        const existing = prev.findIndex(t => t.id === templateData.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = templateData;
          return updated;
        }
        return [...prev, templateData];
      });
      setActiveTemplateId(templateData.id);
      localStorage.setItem('gymlog-active-template', templateData.id);
      setEditingTemplate(null);
    } catch (err) {
      console.error("Error saving template:", err);
      alert("Failed to save template: " + err.message);
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await deleteTemplate(id, user.uid);
      setTemplates(prev => prev.filter(t => t.id !== id));
      setActiveTemplateId('default');
      localStorage.setItem('gymlog-active-template', 'default');
    } catch (err) {
      console.error("Error deleting template:", err);
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <Loader2 size={40} className="spin" color="var(--accent-color)" />
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Identifying Zen...</p>
      </div>
    );
  }

  if (!user) return <div className="app-container"><Auth /></div>;

  const renderContent = () => {
    // Template Editor
    if (editingTemplate !== null) {
      return (
        <TemplateEditor
          template={editingTemplate.id ? editingTemplate : null}
          exerciseDb={exerciseDb}
          onSave={handleSaveTemplate}
          onCancel={() => setEditingTemplate(null)}
        />
      );
    }

    // Active workout
    if (activeWorkoutDay !== null) {
      const programDay = activeTemplate.days[activeWorkoutDay];
      return (
        <WorkoutLogger
          programDay={programDay}
          history={history}
          profile={profile}
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

    // New user onboarding
    if (profile && profile.isNewUser) {
      return (
        <Onboarding
          onComplete={(newProfile) => {
            setProfile(newProfile);
          }}
        />
      );
    }

    // Loading state
    if (dataLoading && history.length === 0) {
      return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
          <Loader2 size={32} className="spin" color="var(--accent-color)" />
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            history={history}
            profile={profile}
            onStartWorkout={(idx) => setActiveWorkoutDay(idx)}
            activeTemplate={activeTemplate}
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onCreateTemplate={() => setEditingTemplate({})}
            onEditTemplate={(t) => setEditingTemplate(t)}
            onDeleteTemplate={handleDeleteTemplate}
          />
        );
      case 'history':
        return <History history={history} onUpdate={async () => {
          const h = await fetchHistory(user.uid);
          setHistory(h || []);
        }} />;
      case 'progress':
        return <ProgressReports history={history} profile={profile} theme={theme} />;
      case 'profile':
        return <Profile profile={profile} setProfile={setProfile} theme={theme} toggleTheme={toggleTheme} />;
      default:
        return (
          <Dashboard
            history={history}
            profile={profile}
            onStartWorkout={(idx) => setActiveWorkoutDay(idx)}
            activeTemplate={activeTemplate}
            templates={templates}
            onSelectTemplate={handleSelectTemplate}
            onCreateTemplate={() => setEditingTemplate({})}
            onEditTemplate={(t) => setEditingTemplate(t)}
            onDeleteTemplate={handleDeleteTemplate}
          />
        );
    }
  };

  return (
    <div className="app-container">
      <main>
        {renderContent()}
      </main>

      {activeWorkoutDay === null && editingTemplate === null && !(profile && profile.isNewUser) && (
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
