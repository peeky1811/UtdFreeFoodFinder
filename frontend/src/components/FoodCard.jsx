import { useState, useEffect } from 'react';
import { Clock, MapPin, Info, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import SearchableLocationSelect from './SearchableLocationSelect';

export default function FoodCard({ post, onVote, onComment, onEdit, onDelete, locations = [] }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [editItemName, setEditItemName] = useState(post.item);
  const [editLocation, setEditLocation] = useState(JSON.stringify(post.location));
  const [myVote, setMyVote] = useState(null);

  useEffect(() => {
    if (!isEditing) {
      setEditItemName(post.item);
      setEditLocation(JSON.stringify(post.location));
    }
  }, [isEditing, post.item, post.location]);

  const [nearby, setNearby] = useState(false);
  const [locationAvailable] = useState(() => {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  });
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sortLocations = (locs, coords) => {
    if (!coords) return locs;
    return [...locs].sort((a, b) => {
      const distA = calculateDistance(coords.lat, coords.lng, a.lat, a.lng);
      const distB = calculateDistance(coords.lat, coords.lng, b.lat, b.lng);
      return distA - distB;
    });
  };

  const handleNearbyToggle = (checked) => {
    if (locationLoading) {
      setLocationLoading(false);
      return;
    }

    if (!checked || locationGranted) {
      setNearby(checked);
    } else {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            setLocationGranted(true);
            setNearby(true);
            fetchUserLocation();
          } else {
            fetchUserLocation();
          }
        });
      } else {
        fetchUserLocation();
      }
    }
  };

  const fetchUserLocation = () => {
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserCoords(coords);
        setLocationGranted(true);
        setLocationLoading(false);
        setNearby(true);
        
        const sorted = sortLocations(locations, coords);
        if (sorted.length > 0) {
          const closest = sorted[0];
          setEditLocation(JSON.stringify({ name: closest.name, lat: closest.lat, lng: closest.lng }));
        }
      },
      (error) => {
        console.error("Location error", error);
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  const submitComment = (e) => {
    e.preventDefault();
    if (newComment.trim() === '') return;
    onComment(post._id, newComment);
    setNewComment('');
  };

  const handleVoteLocal = (val) => {
    if (myVote === val) return;
    setMyVote(val);
    onVote(post._id, val);
  };

  const submitEdit = (e) => {
    e.preventDefault();
    if (editItemName.trim()) {
      try {
        const newLoc = JSON.parse(editLocation);
        onEdit(post._id, { item: editItemName, location: newLoc });
        setIsEditing(false);
      } catch (err) {
        console.error("Failed to parse location edit", err);
      }
    }
  };

  useEffect(() => {
    const checkTime = () => {
      if (!post.timeTill) return;
      const end = new Date(post.timeTill);
      if (isPast(end)) {
        setTimeLeft('Expired');
        setIsExpired(true);
      } else {
        setTimeLeft(formatDistanceToNow(end, { addSuffix: true }));
        setIsExpired(false);
      }
    };
    checkTime();
    const timer = setInterval(checkTime, 60000); // Check every minute
    return () => clearInterval(timer);
  }, [post.timeTill]);

  // UTD campus map base URL using precise coordinates if available
  const isObjectLocation = typeof post.location === 'object' && post.location !== null;
  const locationName = isObjectLocation ? post.location.name : post.location;
  
  // Use Google Maps with lat/lng for precision, fallback to UTD search
  // If the lat/lng are 0 or null from the new endpoint structure, fallback to name search
  const hasCoordinates = isObjectLocation && post.location.lat != null && post.location.lat !== 0; 
  
  const mapUrl = hasCoordinates 
    ? `https://www.google.com/maps/search/?api=1&query=${post.location.lat},${post.location.lng}`
    : `https://map.utdallas.edu/?search=${encodeURIComponent(locationName)}`;

  return (
    <div className={`food-card glass-panel animate-fade-in ${isExpired || post.status === 'gone' ? 'expired' : ''}`}>
      <div className="card-header-absolute">
        <span className={`status-badge ${post.status === 'gone' || isExpired ? 'badge-gone' : 'badge-active'}`}>
           {post.status === 'gone' || isExpired ? 'GONE' : 'AVAILABLE'}
        </span>
      </div>
      {post.photoUrl && (
        <div className="card-image-wrap">
          <img src={post.photoUrl} alt={post.item} className="card-image" />
        </div>
      )}
      <div className="card-content">
        {isEditing ? (
          <form onSubmit={submitEdit} className="edit-form-inline">
            <div className="form-group-mini">
              <label className="text-xs font-bold text-secondary">Food Item</label>
              <input 
                type="text" 
                value={editItemName} 
                onChange={e => setEditItemName(e.target.value)} 
                className="comment-input bg-glass" 
                autoFocus 
              />
            </div>
            <div className="form-group-mini">
              <div className="label-with-action">
                <label className="text-xs font-bold text-secondary">Location</label>
                {locationAvailable && (
                  <div className="nearby-control">
                    {locationLoading && <div className="spinner-loader"></div>}
                    <label className="checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={nearby}
                        onChange={(e) => handleNearbyToggle(e.target.checked)}
                        className="glass-checkbox"
                      />
                      <span>Nearby</span>
                    </label>
                  </div>
                )}
              </div>
              <SearchableLocationSelect 
                locations={sortLocations(locations, nearby ? userCoords : null)} 
                value={editLocation} 
                onChange={e => setEditLocation(e.target.value)} 
                placeholder="Search Building or Room..."
              />
            </div>
            <div className="edit-actions">
              <button type="submit" className="comment-submit">Save Changes</button>
              <button type="button" onClick={() => { setIsEditing(false); setEditItemName(post.item); setEditLocation(JSON.stringify(post.location)); }} className="comment-submit btn-gone">Cancel</button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="card-title text-gradient">{post.item}</h3>
            
            <div className="card-meta">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="meta-item hover-link bg-glass">
                <MapPin size={16} className="text-orange" />
                <span>{locationName}</span>
              </a>
              
              <div className="meta-item">
                <Clock size={16} className="text-green" />
                <span className="text-secondary text-sm">
                  Posted {formatDistanceToNow(new Date(post.postedAt))} ago
                </span>
              </div>
              
              {post.timeTill && (
                <div className={`meta-item ${isExpired ? 'text-red' : ''}`}>
                  <Info size={16} />
                  <span className="text-sm font-semibold">
                    {isExpired ? 'Ended' : `Ends ${timeLeft}`}
                  </span>
                </div>
              )}
            </div>

            <div className="card-actions-row">
              <div className="status-voting">
                <button 
                  className={`vote-btn btn-left ${myVote === 1 ? 'active-vote' : ''}`}
                  onClick={() => handleVoteLocal(1)}
                  disabled={isExpired || post.status === 'gone'}
                >
                  ✅ Still items left
                </button>
                <button 
                  className={`vote-btn btn-gone ${myVote === -1 ? 'active-vote' : ''}`}
                  onClick={() => handleVoteLocal(-1)}
                  disabled={isExpired || post.status === 'gone'}
                >
                  ❌ Food is gone
                </button>
              </div>
            </div>
          </>
        )}

        {/* Comments Section */}
        <div className="comments-section">
          <h4 className="comments-header">Updates</h4>
          <div className="comments-list">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map(c => (
                <div key={c._id} className="comment-item">
                  <span className="comment-time">{formatDistanceToNow(new Date(c.timestamp))} ago</span>
                  <p className="comment-text">{c.text}</p>
                </div>
              ))
            ) : (
              <p className="no-comments">No updates yet. Be the first to comment!</p>
            )}
          </div>
          
          <form className="comment-form" onSubmit={submitComment}>
            <input 
              type="text" 
              placeholder="Add a comment... (e.g. Almost gone!)" 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="comment-input bg-glass"
              disabled={isExpired || post.status === 'gone'}
            />
            <button 
              type="submit" 
              className="comment-submit"
              disabled={!newComment.trim() || isExpired || post.status === 'gone'}
            >
              Post
            </button>
          </form>
        </div>

        {/* Management Controls */}
        <div className="card-management-footer">
          {isConfirmingDelete ? (
            <div className="delete-confirm">
              <span className="text-sm text-red font-semibold mr-2">Delete this post?</span>
              <button className="manage-btn text-red" onClick={() => onDelete(post._id)}>Yes, Delete</button>
              <button className="manage-btn" onClick={() => setIsConfirmingDelete(false)}>Cancel</button>
            </div>
          ) : (
            <>
              <button className="manage-btn" onClick={() => setIsEditing(!isEditing)} title="Edit Post">
                <Edit2 size={14} /> <span>Edit Post</span>
              </button>
              <button className="manage-btn text-red" onClick={() => setIsConfirmingDelete(true)} title="Delete Post">
                <Trash2 size={14} /> <span>Delete Post</span>
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .food-card {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          background: var(--card-gradient);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .food-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          border: 1px solid rgba(232, 117, 0, 0.3);
        }
        .expired {
          opacity: 0.6;
          filter: grayscale(0.8);
        }
        .card-image-wrap {
          height: 180px;
          overflow: hidden;
          width: 100%;
        }
        .card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .food-card:hover .card-image {
          transform: scale(1.05);
        }
        .card-header-absolute {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 10;
        }
        .card-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .card-title {
          font-size: 1.25rem;
          margin-bottom: 4px;
        }
        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .bg-glass {
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 12px;
          border-radius: 8px;
        }
        .hover-link {
          text-decoration: none;
          color: white;
          transition: background 0.2s;
        }
        .hover-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--utd-orange);
        }
        .text-orange { color: #FFA033; }
        .text-green { color: #4ade80; }
        .text-red { color: #f87171; }
        
        .card-actions-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.05);
          gap: 12px;
          flex-wrap: wrap;
        }
        .status-voting {
          display: flex;
          align-items: stretch;
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .vote-btn {
          border: 1px solid transparent;
          padding: 8px 12px;
          font-size: 0.8rem;
          font-weight: 600;
          color: white;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-left {
          background: rgba(74, 222, 128, 0.15); /* light green */
        }
        .btn-left:hover:not(:disabled) {
          background: rgba(74, 222, 128, 0.4);
        }
        .btn-gone {
          background: rgba(248, 113, 113, 0.15); /* light red */
        }
        .btn-gone:hover:not(:disabled) {
          background: rgba(248, 113, 113, 0.4);
        }
        .btn-left.active-vote {
          background: rgba(74, 222, 128, 0.5);
          border-color: rgba(74, 222, 128, 0.8);
          box-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
        }
        .btn-gone.active-vote {
          background: rgba(248, 113, 113, 0.5);
          border-color: rgba(248, 113, 113, 0.8);
          box-shadow: 0 0 10px rgba(248, 113, 113, 0.3);
        }
        .vote-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
          filter: grayscale(1);
        }
        .status-badge {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 6px 12px;
          border-radius: 20px;
        }
        .badge-active {
          background: rgba(74, 222, 128, 0.2);
          color: #4ade80;
          border: 1px solid rgba(74, 222, 128, 0.3);
        }
        .badge-gone {
          background: rgba(255, 255, 255, 0.1);
          color: #9CA3AF;
        }

        .card-management-footer {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid rgba(255,255,255,0.05);
          justify-content: flex-end;
        }
        .manage-btn {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #9CA3AF;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .manage-btn:hover {
          color: white;
          background: rgba(255,255,255,0.1);
        }
        .manage-btn.text-red:hover {
          color: #f87171;
          border-color: rgba(248, 113, 113, 0.3);
          background: rgba(248, 113, 113, 0.1);
        }
        .delete-confirm {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .edit-form-inline {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .edit-actions {
          display: flex;
          gap: 8px;
        }
        .form-group-mini {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .label-with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nearby-control {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
        }
        .glass-checkbox {
          accent-color: var(--utd-orange);
          width: 14px;
          height: 14px;
          cursor: pointer;
        }
        .spinner-loader {
          width: 12px;
          height: 12px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top: 2px solid var(--utd-orange);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .comments-section {
          margin-top: 8px;
          border-top: 1px dashed rgba(255,255,255,0.1);
          padding-top: 16px;
        }
        .comments-header {
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          font-weight: 600;
        }
        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 150px;
          overflow-y: auto;
          margin-bottom: 16px;
          padding-right: 4px;
        }
        /* Custom scrollbar for comments */
        .comments-list::-webkit-scrollbar { width: 4px; }
        .comments-list::-webkit-scrollbar-track { background: transparent; }
        .comments-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 4px; }
        
        .no-comments {
          font-size: 0.85rem;
          color: #9CA3AF;
          font-style: italic;
        }
        .comment-item {
          background: rgba(0,0,0,0.2);
          padding: 10px 12px;
          border-radius: 8px;
          border-left: 2px solid var(--utd-orange);
        }
        .comment-time {
          font-size: 0.7rem;
          color: #9CA3AF;
          display: block;
          margin-bottom: 4px;
        }
        .comment-text {
          font-size: 0.9rem;
          color: #E5E7EB;
          word-break: break-word;
        }
        .comment-form {
          display: flex;
          gap: 8px;
        }
        .comment-input {
          flex: 1;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 8px 12px;
          font-size: 0.9rem;
          font-family: inherit;
        }
        .comment-input:focus {
          outline: none;
          border-color: var(--utd-orange);
        }
        select.comment-input option {
          background-color: #1a1a2e;
          color: white;
        }
        select.comment-input optgroup {
          background-color: #1a1a2e;
          color: var(--utd-orange);
          font-weight: bold;
        }
        .comment-submit {
          background: rgba(232, 117, 0, 0.2);
          color: var(--utd-orange);
          border: 1px solid rgba(232, 117, 0, 0.5);
          border-radius: 8px;
          padding: 0 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .comment-submit:hover:not(:disabled) {
          background: var(--utd-orange);
          color: white;
        }
        .comment-submit:disabled, .comment-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
