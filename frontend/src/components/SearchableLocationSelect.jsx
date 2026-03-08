import { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, MapPin } from 'lucide-react';

export default function SearchableLocationSelect({ locations, value, onChange, placeholder = "Select Building / Room" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayText, setDisplayText] = useState('');
  const dropdownRef = useRef(null);

  // Sync display text with value
  useEffect(() => {
    if (value) {
      try {
        const parsed = JSON.parse(value);
        setDisplayText(parsed.name);
      } catch (err) {
        setDisplayText(value);
      }
    } else {
      setDisplayText('');
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations based on search term
  const filteredLocations = locations.filter(loc => {
    const searchLower = searchTerm.toLowerCase();
    const hasBuildingMatch = loc.name.toLowerCase().includes(searchLower);
    const hasRoomMatch = loc.rooms && loc.rooms.some(r => r.toLowerCase().includes(searchLower));
    return hasBuildingMatch || hasRoomMatch;
  });

  const handleSelect = (jsonValue) => {
    onChange({ target: { name: 'location', value: jsonValue } });
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="searchable-select-container" ref={dropdownRef}>
      <div 
        className={`select-trigger glass-input ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <MapPin size={16} className="text-orange" />
        <span className={displayText ? 'selected-text' : 'placeholder-text'}>
          {displayText || placeholder}
        </span>
        <ChevronDown size={16} className={`chevron ${isOpen ? 'rotate' : ''}`} />
      </div>

      {isOpen && (
        <div className="select-dropdown glass-panel">
          <div className="search-box">
            <Search size={14} className="search-icon" />
            <input 
              type="text" 
              placeholder="Type to search building or room..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
              className="search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="options-list">
            {filteredLocations.length === 0 ? (
              <div className="no-results">No buildings found matching "{searchTerm}"</div>
            ) : (
              filteredLocations.map(loc => {
                const searchLower = searchTerm.toLowerCase();
                const showBuilding = loc.name.toLowerCase().includes(searchLower) || !searchTerm;
                
                // Show building "Anywhere" option if building matches or search is empty
                const buildingJson = JSON.stringify({ name: loc.name, lat: loc.lat, lng: loc.lng });
                
                // Filter rooms for this building
                const filteredRooms = (loc.rooms || []).filter(r => 
                  r.toLowerCase().includes(searchLower) || loc.name.toLowerCase().includes(searchLower)
                );

                return (
                  <div key={loc.name} className="building-group">
                    {showBuilding && (
                      <div 
                        className="option building-option"
                        onClick={() => handleSelect(buildingJson)}
                      >
                        <span className="building-name">{loc.name}</span>
                        <span className="room-count">Anywhere</span>
                      </div>
                    )}
                    
                    {filteredRooms.map(roomNum => {
                      const roomJson = JSON.stringify({ 
                        name: `${loc.name} - Room ${roomNum}`, 
                        lat: loc.lat, 
                        lng: loc.lng 
                      });
                      return (
                        <div 
                          key={roomNum} 
                          className="option room-option"
                          onClick={() => handleSelect(roomJson)}
                        >
                          <span className="room-prefix">{loc.name}</span>
                          <span className="room-number">Room {roomNum}</span>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <style>{`
        .searchable-select-container {
          position: relative;
          width: 100%;
        }
        .select-trigger {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }
        .select-trigger.active {
          border-color: var(--utd-orange);
          background: rgba(0,0,0,0.4);
        }
        .selected-text { color: white; flex: 1; }
        .placeholder-text { color: rgba(255,255,255,0.4); flex: 1; }
        .chevron { transition: transform 0.3s ease; color: rgba(255,255,255,0.4); }
        .rotate { transform: rotate(180deg); }

        .select-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(20,20,30,0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
          display: flex;
          flex-direction: column;
          max-height: 400px;
          overflow: hidden;
        }
        .search-box {
          padding: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,255,255,0.05);
        }
        .search-icon { color: var(--utd-orange); }
        .search-input {
          background: transparent;
          border: none;
          color: white;
          width: 100%;
          font-family: inherit;
          font-size: 0.9rem;
        }
        .search-input:focus { outline: none; }

        .options-list {
          overflow-y: auto;
          padding: 8px 0;
        }
        .options-list::-webkit-scrollbar { width: 6px; }
        .options-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }

        .option {
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .option:hover {
          background: rgba(232, 117, 0, 0.2);
        }
        .building-option {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.02);
        }
        .building-name { font-weight: 700; color: var(--utd-orange); font-size: 0.9rem; }
        .room-count { font-size: 0.75rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; }
        
        .room-option {
          padding-left: 32px;
        }
        .room-prefix { font-size: 0.8rem; color: rgba(255,255,255,0.4); }
        .room-number { font-weight: 500; font-size: 0.9rem; }

        .no-results {
          padding: 20px;
          text-align: center;
          color: rgba(255,255,255,0.4);
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  );
}
