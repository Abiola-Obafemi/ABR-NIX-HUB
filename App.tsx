import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AICoach from './pages/AICoach';
import RoutineGenerator from './pages/RoutineGenerator';
import WeaknessTracker from './pages/WeaknessTracker';
import TournamentJournal from './pages/TournamentJournal';
import Onboarding from './pages/Onboarding';
import GamePlan from './pages/GamePlan';
import { UserProvider, useUser } from './contexts/UserContext';

// Loading Component
const LoadingScreen = () => (
  <div className="min-h-screen bg-black flex flex-col items-center justify-center text-red-600">
    <Loader2 className="w-12 h-12 animate-spin mb-4" />
    <span className="text-white font-bold tracking-wider animate-pulse">LOADING ABRØNIX HUB...</span>
  </div>
);

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, loading } = useUser();
  
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/welcome" />;
  
  return <>{children}</>;
};

const OnboardingRoute = () => {
  const { user, loading } = useUser();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" />;
  return <Onboarding />;
};

const AppContent: React.FC = () => {
  return (
    <Routes>
      <Route path="/welcome" element={<OnboardingRoute />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="gameplan" element={<GamePlan />} />
        <Route path="coach" element={<AICoach />} />
        <Route path="routine" element={<RoutineGenerator />} />
        <Route path="weaknesses" element={<WeaknessTracker />} />
        <Route path="journal" element={<TournamentJournal />} />
      </Route>
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <UserProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </UserProvider>
  );
};

export default App;