import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLocations } from '../services/nebulaApi';
import { addFoodPost } from '../services/db';
import { Upload, MapPin, Clock, Tag, Camera, X } from 'lucide-react';
import Webcam from 'react-webcam';
import SearchableLocationSelect from '../components/SearchableLocationSelect';

export default function PostFood() {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const webcamRef = useRef(null);
  
  const [formData, setFormData] = useState({
    item: '',
    location: '',      // JSON string of building / room
    photoUrl: '',
    durationHours: 1, 
  });

  const stopCamera = () => {
    if (webcamRef.current && webcamRef.current.stream) {
      const tracks = webcamRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setFormData(prev => ({ ...prev, photoUrl: imageSrc }));
        stopCamera();
        setShowCamera(false);
      } else {
        alert("Camera stream not ready. Please ensure you've allowed camera permissions in your browser.");
      }
    }
  }, [webcamRef]);

  useEffect(() => {
    const fetchLocs = async () => {
      const locs = await getLocations();
      setLocations(locs);
      if(locs.length > 0) {
        // Set default to first building's "Anywhere" or first room
        const firstLoc = locs[0];
        const defaultSelection = {
          name: firstLoc.name,
          lat: firstLoc.lat,
          lng: firstLoc.lng
        };
        setFormData(prev => ({...prev, location: JSON.stringify(defaultSelection)}));
      }
    };
    fetchLocs();
  }, []);

  useEffect(() => {
    // Cleanup function to ensure camera turns off if component unmounts
    return () => stopCamera();
  }, []);

  const [nearby, setNearby] = useState(false);
  const [locationAvailable] = useState(() => {
    return typeof window !== 'undefined' && 'geolocation' in navigator;
  });
  const [locationGranted, setLocationGranted] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [userCoords, setUserCoords] = useState(null);

  // Haversine formula
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

  const sortLocations = useCallback((locs, coords) => {
    if (!coords) return locs;
    return [...locs].sort((a, b) => {
      const distA = calculateDistance(coords.lat, coords.lng, a.lat, a.lng);
      const distB = calculateDistance(coords.lat, coords.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, []);

  const handleNearbyToggle = (checked) => {
    if (locationLoading) {
      setLocationLoading(false);
      return;
    }

    if (!checked || locationGranted) {
      setNearby(checked);
    } else {
      // Check permissions
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          if (result.state === 'granted') {
            setLocationGranted(true);
            setNearby(true);
            fetchUserLocation();
          } else if (result.state === 'prompt' || result.state === 'denied') {
            // we'll try to get it anyway to trigger prompt
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
        
        // Auto-select closest
        const sorted = sortLocations(locations, coords);
        if (sorted.length > 0) {
          const closest = sorted[0];
          setFormData(prev => ({
            ...prev,
            location: JSON.stringify({ name: closest.name, lat: closest.lat, lng: closest.lng })
          }));
        }
      },
      (error) => {
        console.error("Location error", error);
        setLocationLoading(false);
        alert("Could not get your location. Please select manually.");
      },
      { enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Calculate expiration time based on duration
      const nowMs = Date.now();
      const timeTill = new Date(nowMs + formData.durationHours * 3600000).toISOString();
      
      // Location is already fully formatted JSON from the select option
      const finalLocation = JSON.parse(formData.location);
      
      await addFoodPost({
        item: formData.item,
        location: finalLocation, // Save as {name, lat, lng}
        photoUrl: formData.photoUrl || null, 
        timeTill: timeTill
      });
      
      // Redirect to feed
      navigate('/');
    } catch (err) {
      console.error("Failed to post food", err);
      alert("Something went wrong!");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="post-container animate-fade-in">
      <div className="post-card glass-panel">
        <h2 className="text-3xl font-bold mb-6 text-gradient text-center">Share Free Food</h2>
        
        <form onSubmit={handleSubmit} className="post-form">
          <div className="form-group">
            <label><Tag size={16}/> What's the food?</label>
            <input 
              type="text" 
              name="item"
              required
              placeholder="e.g. 5 boxes of Cheese Pizza" 
              value={formData.item}
              onChange={handleChange}
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <div className="label-with-action">
              <label><MapPin size={16}/> Where is it?</label>
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
                    <span>Nearby buildings</span>
                  </label>
                </div>
              )}
            </div>
            <SearchableLocationSelect 
              locations={sortLocations(locations, nearby ? userCoords : null)} 
              value={formData.location} 
              onChange={handleChange} 
              placeholder="Search Building or Room..."
            />
          </div>
          
          <div className="form-group">
            <label><Clock size={16}/> Available for how long?</label>
            <div className="duration-selector">
              <input 
                type="range" 
                name="durationHours" 
                min="0.5" 
                max="5" 
                step="0.5"
                value={formData.durationHours} 
                onChange={handleChange}
                className="range-input"
              />
              <span className="duration-display">{formData.durationHours} Hours</span>
            </div>
            <p className="help-text">Post will auto-expire after this time.</p>
          </div>

          <div className="form-group">
            <label><Upload size={16}/> Photo (Phone or Laptop Camera)</label>
            
            {formData.photoUrl && formData.photoUrl.startsWith('data:image') ? (
              <div className="photo-preview">
                <img src={formData.photoUrl} alt="Preview" className="preview-img" />
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, photoUrl: '' }))} className="btn btn-secondary btn-small">
                  <X size={14} /> Remove Photo
                </button>
              </div>
            ) : showCamera ? (
              <div className="camera-container">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  className="webcam-view"
                />
                <div className="camera-actions">
                  <button type="button" onClick={capture} className="btn btn-primary">
                    <Camera size={18} /> Take Photo
                  </button>
                  <button type="button" onClick={() => {
                      stopCamera();
                      setShowCamera(false);
                  }} className="btn btn-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="photo-options">
                <button type="button" onClick={() => setShowCamera(true)} className="btn btn-secondary">
                  <Camera size={18} /> Open Camera
                </button>
                <span className="or-text">or URL:</span>
                <input 
                  type="url" 
                  name="photoUrl"
                  placeholder="https://..." 
                  value={formData.photoUrl}
                  onChange={handleChange}
                  className="glass-input flex-1"
                />
              </div>
            )}
          </div>

          {/* Calculate if form is ready to submit */}
          <button 
            type="submit" 
            className={`btn btn-primary submit-btn ${!(formData.item.trim() !== '' && formData.location !== '') ? 'disabled-btn' : ''}`} 
            disabled={loading || !(formData.item.trim() !== '' && formData.location !== '')}
          >
            {loading ? 'Posting...' : 'Post Food Alert'}
          </button>
        </form>
      </div>

      <style>{`
        .post-container {
          max-width: 600px;
          margin: 40px auto;
          padding: 0 20px;
        }
        .post-card {
          padding: 40px;
          background: rgba(20,20,30,0.6);
        }
        .post-form {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .form-group label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .label-with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nearby-control {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          user-select: none;
        }
        .glass-checkbox {
          accent-color: var(--utd-orange);
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .spinner-loader {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.1);
          border-top: 2px solid var(--utd-orange);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .glass-input {
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 14px 16px;
          border-radius: 12px;
          color: white;
          font-family: inherit;
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        .glass-input:focus {
          outline: none;
          border-color: var(--utd-orange);
          box-shadow: 0 0 0 2px rgba(232, 117, 0, 0.2);
          background: rgba(0,0,0,0.4);
        }
        .dark-option {
          background: var(--bg-secondary);
          color: white;
        }
        .duration-selector {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .range-input {
          flex: 1;
          accent-color: var(--utd-orange);
        }
        .duration-display {
          min-width: 80px;
          font-weight: bold;
          background: rgba(255,255,255,0.1);
          padding: 6px 12px;
          border-radius: 20px;
          text-align: center;
        }
        .help-text {
          font-size: 0.85rem;
          color: #9CA3AF;
        }
        .submit-btn {
          margin-top: 16px;
          padding: 16px;
          font-size: 1.1rem;
          transition: all 0.3s ease;
        }
        .disabled-btn {
          opacity: 0.5;
          cursor: not-allowed;
          filter: grayscale(0.8);
        }
        .photo-options { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .or-text { color: var(--text-secondary); font-size: 0.9rem; }
        .flex-1 { flex: 1; }
        .camera-container { display: flex; flex-direction: column; gap: 12px; background: rgba(0,0,0,0.3); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); }
        .webcam-view { width: 100%; border-radius: 8px; background: #000; }
        .camera-actions { display: flex; justify-content: center; gap: 12px; }
        .photo-preview { display: flex; flex-direction: column; align-items: flex-start; gap: 12px; }
        .preview-img { width: 100%; max-height: 250px; object-fit: contain; border-radius: 12px; border: 1px solid var(--glass-border); background: #000; }
        .btn-small { padding: 6px 12px; font-size: 0.85rem; display: flex; align-items: center; gap: 6px; }
      `}</style>
    </div>
  );
}
