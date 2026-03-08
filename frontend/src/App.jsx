import { Routes, Route, Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Feed from './pages/Feed';
import PostFood from './pages/PostFood';
import './App.css';

function App() {
  return (
    <div className="app-container">
      {/* Background decorations for premium feel */}
      <div className="bg-glow-orange"></div>
      <div className="bg-glow-green"></div>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/post" element={<PostFood />} />
        </Routes>
      </main>

      {/* Mobile Sticky FAB - Only visible on mobile endpoints */}
      <Link to="/post" className="mobile-only-fab">
        <Plus size={32} />
      </Link>
    </div>
  );
}

export default App;
