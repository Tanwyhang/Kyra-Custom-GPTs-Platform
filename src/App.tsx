import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { InteractiveDots } from './components/Background/InteractiveDots';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { UploadPage } from './pages/UploadPage';
import { TestModelPage } from './pages/TestModelPage';
import { DashboardPage } from './pages/DashboardPage';
import { ModelDetailPage } from './pages/ModelDetailPage';
import { SignInForm } from './components/Auth/SignInForm';
import { SignUpForm } from './components/Auth/SignUpForm';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col relative">
      <InteractiveDots />
      <Navbar />
      <main className="flex-1 relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/test" element={<TestModelPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/models/:id" element={<ModelDetailPage />} />
          <Route path="/signin" element={<SignInForm />} />
          <Route path="/signup" element={<SignUpForm />} />
        </Routes>
      </main>
      {isHomePage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;