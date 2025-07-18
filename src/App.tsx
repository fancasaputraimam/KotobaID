import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { FlashcardProvider } from './contexts/FlashcardContext';
import { WritingProvider } from './contexts/WritingContext';
import { AudioProvider } from './contexts/AudioContext';
import UpdatedLandingPage from './components/layout/UpdatedLandingPage';
import AuthPage from './components/AuthPage';
import AdminDashboard from './components/admin/AdminDashboard';
import NewModernDashboard from './components/layout/NewModernDashboard';
import LoadingSpinner from './components/common/LoadingSpinner';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [showLanding, setShowLanding] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show landing page if user is not logged in and landing is not dismissed
  if (!currentUser && showLanding) {
    return <UpdatedLandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  // Admin users see only the developer panel
  if (currentUser.role === 'admin') {
    return <AdminDashboard />;
  }

  // Regular users see the learning interface
  return (
    <ProgressProvider>
      <FlashcardProvider>
        <WritingProvider>
          <AudioProvider>
            <NewModernDashboard />
          </AudioProvider>
        </WritingProvider>
      </FlashcardProvider>
    </ProgressProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="*" element={<AppContent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;