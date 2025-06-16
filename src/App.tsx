import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { InteractiveDots } from './components/Background/InteractiveDots';
import { HomePage } from './pages/HomePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { TestModelPage } from './pages/TestModelPage';
import { ModelDetailPage } from './pages/ModelDetailPage';

function AppContent() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  // Ensure page starts from top on route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <>
      <InteractiveDots />
      <div className="min-h-screen flex flex-col relative z-10">
        <Navbar />
        <main className="flex-1 relative">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/marketplace" element={<MarketplacePage />} />
            <Route path="/test" element={<TestModelPage />} />
            <Route path="/gpts/:id" element={<ModelDetailPage />} />
          </Routes>
        </main>
        {isHomePage && <Footer />}
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;