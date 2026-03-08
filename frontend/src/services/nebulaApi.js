const API_KEY = 'AIzaSyB2zQIwK0gowd-Pkum4SHVzRVK7-PrwlUY';
const BASE_URL = 'https://api.utdnebula.com';

/**
 * Fetch data from Nebula API
 * @param {string} endpoint - The API endpoint to fetch (e.g., '/rooms')
 */
export const fetchNebulaData = async (endpoint) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'x-api-key': API_KEY,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Nebula API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch from Nebula API", error);
    return null;
  }
};

/**
 * Get a list of common UTD buildings/locations for the dropdown.
 * Fetches from /rooms endpoint mirroring utd-rooms implementation.
 */
export const getLocations = async () => {
  const data = await fetchNebulaData('/rooms');
  
  if (data && data.message === 'success' && data.data && Array.isArray(data.data)) {
    // Convert from array to map, mirroring utd-rooms implementation
    const locationsList = [];
    for (const building of data.data) {
      if (building.building) {
        locationsList.push({
          name: building.building,
          lat: building.lat === 0 ? null : building.lat,
          lng: building.lng === 0 ? null : building.lng,
          rooms: Array.isArray(building.rooms) ? building.rooms.map(r => r.room).sort((a,b) => a.localeCompare(b, undefined, {numeric: true})) : []
        });
      }
    }
    
    if (locationsList.length > 0) {
      return locationsList.sort((a, b) => a.name.localeCompare(b.name));
    }
  }
  
  // Fallback UTD locations for the hackathon
  // Fallback UTD locations for the hackathon (with approximate central campus coordinates)
  return [
    { name: 'Student Union (SU)', lat: 32.9868, lng: -96.7512 },
    { name: 'Student Services Addition (SSA)', lat: 32.9865, lng: -96.7505 },
    { name: 'Engineering and Computer Science South (ECSS)', lat: 32.9861, lng: -96.7516 },
    { name: 'Engineering and Computer Science North (ECSN)', lat: 32.9864, lng: -96.7516 },
    { name: 'Naveen Jindal School of Management (JSOM)', lat: 32.9855, lng: -96.7481 },
    { name: 'Founders North (FN)', lat: 32.9880, lng: -96.7500 },
    { name: 'Founders Building (FO)', lat: 32.9877, lng: -96.7500 },
    { name: 'Science Learning Center (SLC)', lat: 32.9870, lng: -96.7485 },
    { name: 'Library (MC)', lat: 32.9862, lng: -96.7495 },
    { name: 'Activity Center (AB)', lat: 32.9845, lng: -96.7502 },
    { name: 'Dining Hall West (DHW)', lat: 32.9886, lng: -96.7538 },
    { name: 'Residence Hall North (RHN)', lat: 32.9902, lng: -96.7510 }
  ];
};
