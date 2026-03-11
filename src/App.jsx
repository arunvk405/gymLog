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
import WeightLogModal from './components/WeightLogModal';
import { useAuth } from './context/AuthContext';
import { fetchHistory, fetchProfile, fetchTemplates, saveTemplate, deleteTemplate, fetchExercises, seedExercises, fetchWeightHistory, logWeightHistory } from './utils/storage';
import { Toaster, toast } from 'react-hot-toast';
import { DEFAULT_TEMPLATE } from './data/program';
import { EXERCISE_DATABASE } from './data/exercises';
import { LayoutDashboard, History as HistoryIcon, TrendingUp, User, Loader2 } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeWorkoutDay, setActiveWorkoutDay] = useState(null);
  const [isWorkoutMinimized, setIsWorkoutMinimized] = useState(false);
  const [workoutStartTime, setWorkoutStartTime] = useState(null);
  const [history, setHistory] = useState([]);
  const [profile, setProfile] = useState(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('bulkbro-theme') || 'light');

  // Template state
  const [templates, setTemplates] = useState([DEFAULT_TEMPLATE]);
  const [activeTemplateId, setActiveTemplateId] = useState(
    localStorage.getItem('bulkbro-active-template') || 'default'
  );
  const [editingTemplate, setEditingTemplate] = useState(null); // null = not editing, {} = new, {data} = edit
  const [exerciseDb, setExerciseDb] = useState([]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [showWeightModal, setShowWeightModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('bulkbro-theme', theme);
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
          // Fetch data in parallel for significantly faster loading
          const [h, p, t, wh, exercises] = await Promise.all([
            fetchHistory(user.uid).catch(() => []),
            fetchProfile(user.uid).catch(() => null),
            fetchTemplates(user.uid).catch(() => []),
            fetchWeightHistory(user.uid).catch(() => []),
            fetchExercises().catch(() => null)
          ]);

          setHistory(h || []);
          setProfile(p);
          setWeightHistory(wh || []);
          setTemplates([DEFAULT_TEMPLATE, ...(t || [])]);

          // Check for Monday Weight Log
          const today = new Date();
          const isMonday = today.getDay() === 1;
          if (isMonday && wh) {
            const startOfDay = new Date(today.setHours(0, 0, 0, 0)).getTime();
            const alreadyLogged = wh.some(entry => entry.timestamp >= startOfDay);
            if (!alreadyLogged) {
              setShowWeightModal(true);
            }
          }

          // Use exercises from Firebase if available, otherwise fallback to local DB
          if (exercises && exercises.length > 0) {
            setExerciseDb(exercises);
          } else {
            console.warn('Using local exercise database fallback');
            setExerciseDb(EXERCISE_DATABASE);

            // Try to seed only if exercises were truly empty (not a permission error)
            // If fetchExercises returned null, it likely failed or reported failure
          }
        } catch (err) {
          console.error("Critical error loading user data:", err);
        } finally {
          setDataLoading(false);
        }
      };
      loadData();
    } else {
      setHistory([]);
      setProfile(null);
      setWeightHistory([]);
      setTemplates([DEFAULT_TEMPLATE]);
    }
  }, [user]);

  const handleSaveWeight = async (weight, bodyfat) => {
    try {
      await logWeightHistory(user.uid, weight, bodyfat);
      const updatedWh = await fetchWeightHistory(user.uid);
      setWeightHistory(updatedWh);

      const updatedProfile = await fetchProfile(user.uid);
      setProfile(updatedProfile);

      setShowWeightModal(false);
      toast.success("Progress logged! Consistency is key.");
    } catch (err) {
      toast.error("Failed to save weight");
    }
  };

  const activeTemplate = templates.find(t => t.id === activeTemplateId) || DEFAULT_TEMPLATE;

  const handleSelectTemplate = (id) => {
    setActiveTemplateId(id);
    localStorage.setItem('bulkbro-active-template', id);
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
      localStorage.setItem('bulkbro-active-template', templateData.id);
      setEditingTemplate(null);
      toast.success("Template saved!");
    } catch (err) {
      console.error("Error saving template:", err);
      toast.error("Failed to save template");
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (id === 'default' || id === 'template_default') {
      toast.error("Cannot delete default template");
      return;
    }

    const templateToDelete = templates.find(t => t.id === id);

    try {
      await deleteTemplate(id, user.uid, templateToDelete?._docId);
      setTemplates(prev => prev.filter(t => t.id !== id));
      setActiveTemplateId('default');
      localStorage.setItem('bulkbro-active-template', 'default');
      toast.success("Template deleted");
    } catch (err) {
      console.error("Error deleting template:", err);
      toast.error("Deletion failed");
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
          template={editingTemplate && Object.keys(editingTemplate).length > 0 ? editingTemplate : null}
          exerciseDb={exerciseDb}
          onSave={handleSaveTemplate}
          onCancel={() => setEditingTemplate(null)}
        />
      );
    }

    // Active workout logic moved outside renderContent so it acts as an overlay
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
            onStartWorkout={(idx) => {
              setActiveWorkoutDay(idx);
              setWorkoutStartTime(Date.now());
              setIsWorkoutMinimized(false);
            }}
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
        return <ProgressReports
          history={history}
          profile={profile}
          theme={theme}
          weightHistory={weightHistory}
          onLogWeight={() => setShowWeightModal(true)}
        />;
      case 'profile':
        return <Profile profile={profile} setProfile={setProfile} theme={theme} toggleTheme={toggleTheme} />;
      default:
        return (
          <Dashboard
            history={history}
            profile={profile}
            onStartWorkout={(idx) => {
              setActiveWorkoutDay(idx);
              setWorkoutStartTime(Date.now());
              setIsWorkoutMinimized(false);
            }}
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
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--panel-color)',
            color: 'var(--text-primary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            fontSize: '0.85rem',
            fontWeight: 700
          },
          success: {
            iconTheme: { primary: 'var(--success-color)', secondary: 'white' }
          },
          error: {
            iconTheme: { primary: 'var(--error-color)', secondary: 'white' }
          }
        }}
      />
      <main>
        {renderContent()}
      </main>

      {/* Workout Logger Overlay */}
      {activeWorkoutDay !== null && (
        <div style={{ display: isWorkoutMinimized ? 'none' : 'block', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2000, background: 'var(--bg-color)', overflowY: 'auto' }}>
          <WorkoutLogger
            programDay={activeTemplate.days[activeWorkoutDay]}
            history={history}
            profile={profile}
            exerciseDb={exerciseDb}
            workoutStartTime={workoutStartTime}
            onFinish={async () => {
              setActiveWorkoutDay(null);
              setIsWorkoutMinimized(false);
              setWorkoutStartTime(null);
              setDataLoading(true);
              const h = await fetchHistory(user.uid);
              setHistory(h || []);
              setDataLoading(false);
              setActiveTab('history');
            }}
            onCancel={() => {
              setActiveWorkoutDay(null);
              setIsWorkoutMinimized(false);
              setWorkoutStartTime(null);
            }}
            onMinimize={() => setIsWorkoutMinimized(true)}
          />
        </div>
      )}

      {/* Active Workout Footer when minimized */}
      {isWorkoutMinimized && activeWorkoutDay !== null && activeTemplate.days[activeWorkoutDay] && (
        <div className="fade-in" onClick={() => setIsWorkoutMinimized(false)} style={{
          position: 'fixed', bottom: '85px', left: '1rem', right: '1rem',
          background: 'var(--panel-color)', border: '1px solid var(--accent-color)',
          padding: '0.8rem 1.2rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', zIndex: 1000, borderRadius: '16px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)', cursor: 'pointer'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{activeTemplate.days[activeWorkoutDay].name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-color)', fontWeight: 700 }}>Workout Active • Tap to resume</div>
          </div>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <div style={{ width: '4px', height: '12px', background: 'var(--accent-color)', borderRadius: '2px', animation: 'bar 1s infinite ease-in-out' }}></div>
            <div style={{ width: '4px', height: '18px', background: 'var(--accent-color)', borderRadius: '2px', animation: 'bar 1s infinite ease-in-out 0.2s' }}></div>
            <div style={{ width: '4px', height: '12px', background: 'var(--accent-color)', borderRadius: '2px', animation: 'bar 1s infinite ease-in-out 0.4s' }}></div>
          </div>
        </div>
      )}

      {showWeightModal && (
        <WeightLogModal
          currentWeight={profile?.bodyweight}
          currentBodyfat={profile?.bodyfat}
          onSave={handleSaveWeight}
          onCancel={() => setShowWeightModal(false)}
        />
      )}

      {(!activeWorkoutDay || isWorkoutMinimized) && editingTemplate === null && !(profile && profile.isNewUser) && (
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
