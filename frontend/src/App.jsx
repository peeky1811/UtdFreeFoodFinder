import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { PlusCircle, MapPin, Search } from 'lucide-react';
import Feed from './pages/Feed';
import PostFood from './pages/PostFood';
import './App.css';

function App() {
  const location = useLocation();

  return (
    <div className="app-container">
      {/* Background decorations for premium feel */}
      <div className="bg-glow-orange"></div>
      <div className="bg-glow-green"></div>
      
      <header className="app-header glass-panel">
        <div className="header-content">
          <Link to="/" className="brand-logo">
            <span className="text-gradient font-bold text-2xl">UTD</span>
            <span className="font-semibold text-xl ml-1">FreeFoodFinder</span>
          </Link>
          
          <nav className="header-nav">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              <Search size={18} />
              <span>Find Food</span>
            </Link>
            
            <Link 
              to="/post" 
              className="btn btn-primary"
            >
              <PlusCircle size={18} />
              <span>Post Food</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/post" element={<PostFood />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
