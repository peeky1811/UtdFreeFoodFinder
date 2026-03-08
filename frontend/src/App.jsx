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
