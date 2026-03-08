import { useState, useEffect } from 'react';
import FoodCard from '../components/FoodCard';
import { subscribeToFoodPosts, votePost, addComment, deleteFoodPost, editFoodPost } from '../services/db';
import { getLocations } from '../services/nebulaApi';

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch locations to pass to cards for editing
    getLocations().then(setLocations).catch(console.error);

    // Subscribe to real-time cross-tab updates from the mock DB
    const unsubscribe = subscribeToFoodPosts((data) => {
      setPosts(data);
      setLoading(false);
    });
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleVote = async (id, val) => {
    // Real call - UI will instantly update via the pub/sub listener
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
      <div className="feed-header">
        <h1 className="text-3xl font-bold mb-2">Live Campus Feed</h1>
        <p className="text-secondary">Discover what's available for free at UTD right now.</p>
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
          padding: 40px 20px;
        }
        .feed-header {
          margin-bottom: 40px;
          text-align: center;
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
        .empty-state h3 {
          font-size: 1.5rem;
          margin-bottom: 10px;
          color: #FFA033;
        }
      `}</style>
    </div>
  );
}
