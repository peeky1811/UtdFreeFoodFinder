import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FoodCard from '../components/FoodCard';
import { subscribeToFoodPosts, votePost, addComment, deleteFoodPost, editFoodPost } from '../services/db';
import { getLocations } from '../services/nebulaApi';
import { Search, Plus } from 'lucide-react';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch locations to pass to cards for editing
    getLocations().then(setLocations).catch(console.error);

    // Subscribe to real-time updates from the backend
    const unsubscribe = subscribeToFoodPosts((data) => {
      setPosts(data);
      setLoading(false);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleVote = async (id, val) => {
    await votePost(id, val);
  };

  const handleAddComment = async (id, text) => {
    await addComment(id, text);
  };

  const handleEdit = async (id, data) => {
    await editFoodPost(id, data);
  };

  const handleDelete = async (id) => {
    await deleteFoodPost(id);
  };

  if (loading) {
    return (
      <div className="feed-container loading-state">
        <div className="spinner"></div>
        <p>Finding free food nearby...</p>
        <style>{`
          .loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; gap: 20px;}
          .spinner { border: 4px solid rgba(255,255,255,0.1); border-left-color: var(--utd-orange); border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  return (
    <div className="feed-container animate-fade-in">
      <div className="nebula-branding">powered by nebula api</div>
      
      <div className="feed-header-alt">
        <div className="title-row">
          <h1 className="feed-title-alt">UTD Food Finder</h1>
          <Search className="search-icon-header" size={28} />
        </div>
        <p className="feed-subtitle-alt">Find free food at UT Dallas</p>
        
        <Link to="/post" className="floating-action-button desk-inline-fab">
          <Plus size={24} />
          <span className="fab-text">Post Food</span>
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state glass-panel">
          <h3>No food right now!</h3>
          <p>Be the hero UTD needs and post some leftover food.</p>
        </div>
      ) : (
        <div className="grid-layout">
          {posts.map(post => (
            <FoodCard 
              key={post._id} 
              post={post} 
              onVote={handleVote} 
              onComment={handleAddComment}
              onEdit={handleEdit}
              onDelete={handleDelete}
              locations={locations}
            />
          ))}
        </div>
      )}

      <style>{`
        .feed-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 20px;
          position: relative;
        }
        .nebula-branding {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 8px;
          text-align: left;
        }
        .feed-header-alt {
          margin-bottom: 50px;
          text-align: left;
        }
        .title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        .feed-title-alt {
          font-size: 2.8rem;
          font-weight: 800;
          color: white;
          margin: 0;
        }
        .search-icon-header {
          color: var(--utd-orange);
        }
        .feed-subtitle-alt {
          font-size: 1.2rem;
          color: var(--text-secondary);
          margin: 0;
        }
        .grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 30px;
        }
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          max-width: 500px;
          margin: 0 auto;
        }
        
        /* Floating Action Button - Desktop Inline Version */
        .desk-inline-fab {
          position: relative;
          bottom: auto;
          right: auto;
          margin-top: 25px;
          display: inline-flex;
          z-index: 10;
        }
        
        .floating-action-button {
          background: var(--utd-orange);
          color: white;
          padding: 16px 24px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          gap: 10px;
          box-shadow: 0 10px 30px rgba(232, 117, 0, 0.4);
          text-decoration: none;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(255,255,255,0.2);
        }
        
        .floating-action-button:hover {
          transform: scale(1.05) translateY(-5px);
          box-shadow: 0 15px 40px rgba(232, 117, 0, 0.6);
        }

        .floating-action-button:active {
          transform: scale(0.95);
        }

        @media (max-width: 768px) {
          .floating-action-button {
            position: fixed;
            width: 60px;
            height: 60px;
            padding: 0;
            justify-content: center;
            border-radius: 50%;
            bottom: calc(20px + env(safe-area-inset-bottom));
            right: calc(20px + env(safe-area-inset-right));
            box-shadow: 0 8px 25px rgba(232, 117, 0, 0.5);
            z-index: 1000;
          }
          .fab-text {
            display: none;
          }
          .feed-title-alt {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}
