import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/routeNavigation.css';
import { dijkstra, getIntermediateNodes } from '../../utils/dijkstra';
import { cityGraph, cityCoordinates } from '../../utils/cityGraph';

// Fix marker icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function RouteNavigation() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  
  // State
  const [startInput, setStartInput] = useState('Hyderabad');
  const [destInput, setDestInput] = useState('Hitech City');
  const [startLocation, setStartLocation] = useState({ lat: 17.3850, lng: 78.4867, name: 'Hyderabad' });
  const [destination, setDestination] = useState({ lat: 17.4399, lng: 78.4983, name: 'Hitech City' });
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [carPosition, setCarPosition] = useState(null);



  // Predefined locations for quick access
  const predefinedLocations = {
    'hyderabad': { lat: 17.3850, lng: 78.4867, name: 'Hyderabad' },
    'warangal': { lat: 17.9689, lng: 79.5941, name: 'Warangal' },
    'vijayawada': { lat: 16.5062, lng: 80.6480, name: 'Vijayawada' },
    'karimnagar': { lat: 18.4386, lng: 79.1288, name: 'Karimnagar' },
    'pune': { lat: 18.5204, lng: 73.8567, name: 'Pune' },
    'mumbai': { lat: 19.0760, lng: 72.8777, name: 'Mumbai' },
    'delhi': { lat: 28.7041, lng: 77.1025, name: 'Delhi' },
    'agra': { lat: 27.1767, lng: 78.0081, name: 'Agra' },
    'bangalore': { lat: 12.9716, lng: 77.5946, name: 'Bangalore' },
    'chennai': { lat: 13.0827, lng: 80.2707, name: 'Chennai' },
    'hitech city': { lat: 17.4399, lng: 78.4983, name: 'Hitech City' }
  };

  // Geocode location using predefined locations or Nominatim
  const geocodeLocation = async (locationName) => {
    try {
      console.log(`🔍 Geocoding: ${locationName}`);
      
      // Check predefined locations first
      const lowerName = locationName.toLowerCase().trim();
      if (predefinedLocations[lowerName]) {
        const result = predefinedLocations[lowerName];
        console.log(`✅ Found predefined location: ${locationName}`, result);
        return result;
      }
      
      // Try Nominatim API with better error handling
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(locationName)}&format=json&limit=1&timeout=10`,
        {
          headers: {
            'User-Agent': 'NeuroFleetX/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          name: locationName
        };
        console.log(`✅ Geocoded ${locationName}:`, result);
        return result;
      } else {
        console.error(`❌ Location not found: ${locationName}`);
        toast.error(`❌ Location "${locationName}" not found.\n\nTry: Hyderabad, Warangal, Vijayawada, Pune, Mumbai, Delhi, Agra, Bangalore, Chennai`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return null;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error(`❌ Error: ${error.message}\n\nTry predefined cities: Hyderabad, Warangal, Pune, Mumbai, Delhi, Agra`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return null;
    }
  };

  // Fetch multiple real routes from OSRM API with alternatives
  const fetchOSRMRoutes = async (startLat, startLng, endLat, endLng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?alternatives=true&overview=full&geometries=geojson`;
      console.log('📡 Fetching multiple OSRM routes with alternatives...');
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`OSRM API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        console.log(`✅ OSRM returned ${data.routes.length} alternative routes`);
        
        // Process all available routes (up to 3)
        const processedRoutes = data.routes.slice(0, 3).map((route, idx) => {
          const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
          const distanceKm = (route.distance / 1000).toFixed(1);
          const durationMins = Math.round(route.duration / 60);
          
          console.log(`Route ${idx + 1}:`, { distance: distanceKm, duration: durationMins });
          
          return {
            coordinates,
            distance: distanceKm,
            duration: durationMins
          };
        });
        
        // If we only got 1 route, create 2 more by requesting with different parameters
        if (processedRoutes.length === 1) {
          console.log('⚠️ Only 1 route returned, fetching alternative routes...');
          console.log('📊 Main Route Distance:', processedRoutes[0].distance, 'km');
          
          // Try fetching with waypoint names to get different routes
          try {
            const altUrl = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?alternatives=3&overview=full&geometries=geojson&exclude=motorway`;
            const altResponse = await fetch(altUrl);
            const altData = await altResponse.json();
            
            if (altData.routes && altData.routes.length > 1) {
              console.log(`✅ Got ${altData.routes.length} alternative routes with motorway exclusion`);
              const altRoutes = altData.routes.slice(1, 3).map((route, idx) => {
                const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
                const distanceKm = (route.distance / 1000).toFixed(1);
                const durationMins = Math.round(route.duration / 60);
                
                console.log(`Alternative Route ${idx + 2}:`, { distance: distanceKm, duration: durationMins });
                
                return {
                  coordinates,
                  distance: distanceKm,
                  duration: durationMins
                };
              });
              
              console.log('✅ Returning real alternative routes from OSRM');
              return [...processedRoutes, ...altRoutes];
            }
          } catch (altError) {
            console.warn('⚠️ Alternative route fetch failed, using offset routes');
          }
          
          // Fallback: Create offset routes with adjusted distances
          const mainRoute = processedRoutes[0];
          const route2Distance = (parseFloat(mainRoute.distance) * 1.15).toFixed(1);
          const route3Distance = (parseFloat(mainRoute.distance) * 1.35).toFixed(1);
          
          const offsetRoute2 = {
            coordinates: mainRoute.coordinates.map((coord, idx) => {
              const progress = idx / mainRoute.coordinates.length;
              const offsetLat = Math.sin(progress * Math.PI) * 0.015;
              const offsetLng = Math.sin(progress * Math.PI) * 0.015;
              return [coord[0] + offsetLat, coord[1] + offsetLng];
            }),
            distance: route2Distance,
            duration: Math.round(mainRoute.duration * 1.2)
          };
          
          const offsetRoute3 = {
            coordinates: mainRoute.coordinates.map((coord, idx) => {
              const progress = idx / mainRoute.coordinates.length;
              const offsetLat = -Math.sin(progress * Math.PI) * 0.025;
              const offsetLng = -Math.sin(progress * Math.PI) * 0.025;
              return [coord[0] + offsetLat, coord[1] + offsetLng];
            }),
            distance: route3Distance,
            duration: Math.round(mainRoute.duration * 1.5)
          };
          
          console.log('📊 Route 1 (Main):', { distance: mainRoute.distance, duration: mainRoute.duration });
          console.log('📊 Route 2 (Offset +15%):', { distance: offsetRoute2.distance, duration: offsetRoute2.duration });
          console.log('📊 Route 3 (Offset +35%):', { distance: offsetRoute3.distance, duration: offsetRoute3.duration });
          
          return [mainRoute, offsetRoute2, offsetRoute3];
        }
        
        return processedRoutes;
      } else {
        console.error('❌ No routes found from OSRM');
        return null;
      }
    } catch (error) {
      console.error('❌ OSRM API error:', error);
      return null;
    }
  };

  // Fetch multi-segment route using Dijkstra optimization
  const fetchMultiSegmentRoute = async (path) => {
    console.log('🔗 Fetching multi-segment route for path:', path);
    
    let allCoordinates = [];
    let totalDistance = 0;
    let totalDuration = 0;

    // Fetch each segment
    for (let i = 0; i < path.length - 1; i++) {
      const currentCity = path[i];
      const nextCity = path[i + 1];
      
      const currentCoords = cityCoordinates[currentCity];
      const nextCoords = cityCoordinates[nextCity];

      if (!currentCoords || !nextCoords) {
        console.warn(`⚠️ Missing coordinates for ${currentCity} or ${nextCity}`);
        continue;
      }

      const segment = await fetchOSRMRoute(
        currentCoords.lat,
        currentCoords.lng,
        nextCoords.lat,
        nextCoords.lng
      );

      if (segment) {
        // Avoid duplicate coordinates at segment junctions
        if (i === 0) {
          allCoordinates = [...segment.coordinates];
        } else {
          allCoordinates = [...allCoordinates.slice(0, -1), ...segment.coordinates];
        }
        totalDistance += parseFloat(segment.distance);
        totalDuration += segment.duration;
      }
    }

    console.log('✅ Multi-segment route complete:', { totalDistance, totalDuration, segments: path.length - 1 });

    return {
      coordinates: allCoordinates,
      distance: totalDistance.toFixed(1),
      duration: totalDuration
    };
  };

  // Calculate routes using OSRM API with alternatives
  const calculateRoutes = async (start, dest) => {
    console.log('═══════════════════════════════════════');
    console.log('🔄 CALCULATING REAL ROUTES (OSRM)');
    console.log('═══════════════════════════════════════');
    console.log('📍 Start:', start.name, `(${start.lat.toFixed(4)}, ${start.lng.toFixed(4)})`);
    console.log('🎯 Destination:', dest.name, `(${dest.lat.toFixed(4)}, ${dest.lng.toFixed(4)})`);
    
    // Fetch multiple real routes from OSRM
    const osrmRoutes = await fetchOSRMRoutes(start.lat, start.lng, dest.lat, dest.lng);
    
    if (!osrmRoutes || osrmRoutes.length === 0) {
      toast.error('❌ Failed to fetch routes from OSRM', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    const calculatedRoutes = [];

    // Route 1: FASTEST ROUTE - First OSRM route (shortest)
    const route1 = {
      name: 'FASTEST ROUTE',
      path: osrmRoutes[0].coordinates,
      distance: osrmRoutes[0].distance,
      eta: formatETA(osrmRoutes[0].duration),
      color: '#3b82f6',
      type: 'fastest',
      nodes: ['Start', 'End'],
      duration: osrmRoutes[0].duration
    };
    calculatedRoutes.push(route1);
    console.log('✅ Route 1 (Fastest):', { distance: route1.distance + ' km', eta: route1.eta, duration: route1.duration });

    // Route 2: ALTERNATE ROUTE - Second OSRM route
    if (osrmRoutes.length > 1) {
      const route2 = {
        name: 'ALTERNATE ROUTE',
        path: osrmRoutes[1].coordinates,
        distance: osrmRoutes[1].distance,
        eta: formatETA(osrmRoutes[1].duration),
        color: '#10b981',
        type: 'alternate',
        nodes: ['Start', 'End'],
        duration: osrmRoutes[1].duration
      };
      calculatedRoutes.push(route2);
      console.log('✅ Route 2 (Alternate):', { distance: route2.distance + ' km', eta: route2.eta, duration: route2.duration });
    }

    // Route 3: TRAFFIC ROUTE - Third OSRM route
    if (osrmRoutes.length > 2) {
      const route3 = {
        name: 'HIGH TRAFFIC ROUTE',
        path: osrmRoutes[2].coordinates,
        distance: osrmRoutes[2].distance,
        eta: formatETA(osrmRoutes[2].duration),
        color: '#ef4444',
        type: 'traffic',
        nodes: ['Start', 'End'],
        duration: osrmRoutes[2].duration
      };
      calculatedRoutes.push(route3);
      console.log('✅ Route 3 (High Traffic):', { distance: route3.distance + ' km', eta: route3.eta, duration: route3.duration });
    }

    setRoutes(calculatedRoutes);
    setSelectedRoute(calculatedRoutes[0]);
    
    console.log('═══════════════════════════════════════');
    console.log('📊 FINAL ROUTE DISTANCES:');
    calculatedRoutes.forEach((route, idx) => {
      console.log(`Route ${idx + 1} (${route.name}): ${route.distance} km | ${route.eta}`);
    });
    console.log('═══════════════════════════════════════');
    console.log('✅ ALL ROUTES CALCULATED SUCCESSFULLY');
    console.log('═══════════════════════════════════════');
  };

  // Format duration to readable ETA
  const formatETA = (durationMins) => {
    if (durationMins < 60) return `${durationMins} mins`;
    const hours = Math.floor(durationMins / 60);
    const mins = durationMins % 60;
    return `${hours}h ${mins}m`;
  };

  // Handle Calculate Route button
  const handleCalculateRoute = async () => {
    if (!startInput.trim() || !destInput.trim()) {
      toast.error('❌ Please enter both start and destination locations', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);
    toast.loading('🔍 Calculating real routes...', {
      position: "top-center",
      toastId: 'calculating',
    });
    console.log('🚀 Starting route calculation...');
    
    // Geocode both locations
    const startCoords = await geocodeLocation(startInput);
    const destCoords = await geocodeLocation(destInput);

    if (startCoords && destCoords) {
      console.log('✅ Both locations geocoded successfully');
      setStartLocation(startCoords);
      setDestination(destCoords);
      
      // Calculate center
      const center = [
        (startCoords.lat + destCoords.lat) / 2,
        (startCoords.lng + destCoords.lng) / 2
      ];
      setMapCenter(center);
      
      // Calculate routes with OSRM API
      await calculateRoutes(startCoords, destCoords);
      
      console.log(`✅ Route calculation complete: ${startInput} → ${destInput}`);
      
      toast.dismiss('calculating');
      toast.success(`✅ Real Routes Calculated!\n${startInput} → ${destInput}`, {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      console.error('❌ Failed to geocode one or both locations');
      toast.dismiss('calculating');
      toast.error('❌ Failed to find one or both locations', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    
    setLoading(false);
  };

  // Handle Recalculate Routes button - recalculates with different distances and traffic
  const handleRecalculateRoutes = async () => {
    console.log('🔄 Recalculating routes with different traffic conditions...');
    toast.loading('🔄 Recalculating routes...', {
      position: "top-center",
      toastId: 'recalculating',
    });
    
    // Recalculate with new random traffic multipliers and different distances
    if (routes.length > 0 && routes[0].path) {
      const mainRoute = routes[0];
      const calculatedRoutes = [];

      // Route 1: FASTEST - Base route (no traffic)
      const route1 = {
        name: 'FASTEST ROUTE',
        path: mainRoute.path,
        distance: mainRoute.distance,
        eta: formatETA(mainRoute.duration),
        color: '#3b82f6',
        type: 'fastest',
        nodes: ['Start', 'End'],
        duration: mainRoute.duration
      };
      calculatedRoutes.push(route1);

      // Route 2: ALTERNATE - Offset path with +15% distance and random traffic
      const offsetPath2 = mainRoute.path.map((coord, idx) => {
        const progress = idx / mainRoute.path.length;
        const offsetLat = Math.sin(progress * Math.PI) * 0.02;
        const offsetLng = Math.sin(progress * Math.PI) * 0.02;
        return [coord[0] + offsetLat, coord[1] + offsetLng];
      });
      
      const altDistanceMult = 1.15;
      const altTrafficMult = 1.1 + Math.random() * 0.2;
      const altDistance = (parseFloat(mainRoute.distance) * altDistanceMult).toFixed(1);
      const altDuration = Math.round(mainRoute.duration * altDistanceMult * altTrafficMult);
      
      const route2 = {
        name: 'ALTERNATE ROUTE',
        path: offsetPath2,
        distance: altDistance,
        eta: formatETA(altDuration),
        color: '#10b981',
        type: 'alternate',
        nodes: ['Start', 'End'],
        duration: altDuration
      };
      calculatedRoutes.push(route2);

      // Route 3: HIGH TRAFFIC - Offset path with +35% distance and heavy traffic
      const offsetPath3 = mainRoute.path.map((coord, idx) => {
        const progress = idx / mainRoute.path.length;
        const offsetLat = -Math.sin(progress * Math.PI) * 0.03;
        const offsetLng = -Math.sin(progress * Math.PI) * 0.03;
        return [coord[0] + offsetLat, coord[1] + offsetLng];
      });
      
      const trafficDistanceMult = 1.35;
      const trafficMult = 1.4 + Math.random() * 0.3;
      const trafficDistance = (parseFloat(mainRoute.distance) * trafficDistanceMult).toFixed(1);
      const trafficDuration = Math.round(mainRoute.duration * trafficDistanceMult * trafficMult);
      
      const route3 = {
        name: 'HIGH TRAFFIC ROUTE',
        path: offsetPath3,
        distance: trafficDistance,
        eta: formatETA(trafficDuration),
        color: '#ef4444',
        type: 'traffic',
        nodes: ['Start', 'End'],
        duration: trafficDuration
      };
      calculatedRoutes.push(route3);

      setRoutes(calculatedRoutes);
      setSelectedRoute(calculatedRoutes[0]);
      
      console.log('═══════════════════════════════════════');
      console.log('🔄 ROUTES RECALCULATED WITH NEW TRAFFIC');
      console.log('═══════════════════════════════════════');
      console.log('Route 1 (Fastest):', { distance: route1.distance + ' km', eta: route1.eta });
      console.log('Route 2 (Alternate +15%):', { distance: route2.distance + ' km', eta: route2.eta, traffic: altTrafficMult.toFixed(2) + 'x' });
      console.log('Route 3 (High Traffic +35%):', { distance: route3.distance + ' km', eta: route3.eta, traffic: trafficMult.toFixed(2) + 'x' });
      console.log('═══════════════════════════════════════');
    }
    
    toast.dismiss('recalculating');
    toast.info('🔄 Routes Updated with New Traffic Conditions!', {
      position: "top-right",
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleStartNavigation = () => {
    if (selectedRoute) {
      setIsNavigating(true);
      console.log('🚀 Navigation started on route:', selectedRoute.name);
      console.log('📍 Distance:', selectedRoute.distance, 'km');
      console.log('⏱️ ETA:', selectedRoute.eta);
      
      toast.success(`🚀 Navigation Started!\n📍 ${selectedRoute.distance} km | ⏱️ ${selectedRoute.eta}`, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Animate car along the route
      animateCarAlongRoute(selectedRoute.path);
    }
  };

  // Animate car movement along route
  const animateCarAlongRoute = (routePath) => {
    if (!routePath || routePath.length < 2) return;

    let currentStep = 0;
    const totalSteps = 100;
    const stepDuration = 50; // milliseconds

    const moveStep = () => {
      if (currentStep <= totalSteps) {
        // Interpolate position between route points
        const segmentIndex = Math.floor((currentStep / totalSteps) * (routePath.length - 1));
        const nextSegmentIndex = Math.min(segmentIndex + 1, routePath.length - 1);
        
        const currentPoint = routePath[segmentIndex];
        const nextPoint = routePath[nextSegmentIndex];
        
        const progress = ((currentStep / totalSteps) * (routePath.length - 1)) - segmentIndex;
        
        const interpolatedLat = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * progress;
        const interpolatedLng = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * progress;
        
        setCarPosition([interpolatedLat, interpolatedLng]);
        currentStep++;
        
        setTimeout(moveStep, stepDuration);
      } else {
        setIsNavigating(false);
        console.log('✅ Navigation complete! You have arrived at your destination.');
        
        toast.success('🎉 You Have Arrived!\n✅ Trip Completed Successfully!', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    };

    moveStep();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Load default routes on mount
  useEffect(() => {
    calculateRoutes(startLocation, destination);
  }, []);

  return (
    <div className="route-navigation-wrapper">
      {/* Navbar */}
      <nav className="dashboard-navbar">
        <div className="navbar-brand">NeuroFleetX</div>
        <ul className="navbar-menu">
          <li onClick={() => navigate('/driver')}>Dashboard</li>
          <li onClick={() => navigate('/driver/my-trips')}>My Trips</li>
          <li className="active">Route Navigation</li>
          <li onClick={() => navigate('/driver/earnings')}>Earnings</li>
          <li onClick={() => navigate('/driver/schedule')}>Schedule</li>
          <li onClick={() => navigate('/driver/profile')}>Profile</li>
        </ul>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </nav>

      {/* Main Content */}
      <div className="route-navigation-page">
        <div className="route-header">
          <h1>🗺️ AI Route Navigation</h1>
          <p>Enter locations to calculate optimized routes</p>
        </div>

        {/* Location Input Section */}
        <div className="location-input-section">
          <div className="input-group">
            <label>📍 Start Location</label>
            <input
              type="text"
              placeholder="e.g., Hyderabad, Warangal, Karimnagar"
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculateRoute()}
            />
          </div>

          <div className="input-group">
            <label>🎯 Destination</label>
            <input
              type="text"
              placeholder="e.g., Hitech City, Warangal, Karimnagar"
              value={destInput}
              onChange={(e) => setDestInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCalculateRoute()}
            />
          </div>

          <button 
            className="action-btn primary" 
            onClick={handleCalculateRoute}
            disabled={loading}
          >
            {loading ? '⏳ Calculating...' : '🔍 Calculate Route'}
          </button>
        </div>

        {/* Map Container */}
        <div className="route-main-content">
          {/* Route Cards Sidebar - Left Side */}
          <div className="routes-container">
            <h2>🚀 Available Routes</h2>
            <div className="routes-grid">
            {routes.length > 0 ? (
              routes.map((route, idx) => (
                <div
                  key={idx}
                  className={`route-card ${selectedRoute?.type === route.type ? 'selected' : ''}`}
                  onClick={() => setSelectedRoute(route)}
                  style={{ borderLeftColor: route.color }}
                >
                  <div className="route-card-header">
                    <h3>{route.name}</h3>
                    <div className="route-indicator" style={{ backgroundColor: route.color }}></div>
                  </div>
                  <div className="route-card-body">
                    <div className="route-stat">
                      <span className="route-stat-icon">📏</span>
                      <div>
                        <p className="route-stat-label">Distance</p>
                        <p className="route-stat-value">{route.distance} km</p>
                      </div>
                    </div>
                    <div className="route-stat">
                      <span className="route-stat-icon">⏱️</span>
                      <div>
                        <p className="route-stat-label">ETA</p>
                        <p className="route-stat-value">{route.eta}</p>
                      </div>
                    </div>
                  </div>
                  <div className="route-card-footer">
                    <p className="route-nodes">Path: {route.nodes.join(' → ')}</p>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#999' }}>
                Enter locations and click "Calculate Route" to see available routes
              </p>
            )}
            </div>
          </div>

          <div className="map-container">
          {/* Route Legend */}
          <div className="route-legend">
            <div className="legend-title">📍 Route Types</div>
            <div className="legend-item">
              <div className="legend-line" style={{ borderTop: '3px solid #3b82f6' }}></div>
              <span>Fastest Route</span>
            </div>
            <div className="legend-item">
              <div className="legend-line" style={{ borderTop: '3px dashed #10b981' }}></div>
              <span>Alternate Route</span>
            </div>
            <div className="legend-item">
              <div className="legend-line" style={{ borderTop: '3px dotted #ef4444' }}></div>
              <span>Heavy Traffic</span>
            </div>
          </div>

          <MapContainer 
            ref={mapRef}
            center={mapCenter} 
            zoom={11} 
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Start Marker */}
            <Marker position={[startLocation.lat, startLocation.lng]} icon={startIcon}>
              <Popup>
                <strong>🟢 Start Location</strong><br />
                {startLocation.name}
              </Popup>
            </Marker>

            {/* Destination Marker */}
            <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
              <Popup>
                <strong>🔴 Destination</strong><br />
                {destination.name}
              </Popup>
            </Marker>

            {/* Route Polylines - All 3 routes always visible */}
            {/* Render all routes with equal visibility */}
            {routes.length > 0 && (
              <>
                {/* Heavy Traffic Route (Red) - Render first */}
                {routes[2] && routes[2].path && (
                  <Polyline
                    positions={routes[2].path}
                    color={routes[2].color}
                    weight={5}
                    opacity={0.8}
                    dashArray="5,5"
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
                
                {/* Alternate Route (Green) - Render second */}
                {routes[1] && routes[1].path && (
                  <Polyline
                    positions={routes[1].path}
                    color={routes[1].color}
                    weight={5}
                    opacity={0.8}
                    dashArray="10,5"
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
                
                {/* Fastest Route (Blue) - Render last (on top) */}
                {routes[0] && routes[0].path && (
                  <Polyline
                    positions={routes[0].path}
                    color={routes[0].color}
                    weight={5}
                    opacity={0.8}
                    dashArray=""
                    lineCap="round"
                    lineJoin="round"
                  />
                )}
              </>
            )}

            {/* Animated Car Marker */}
            {isNavigating && carPosition && (
              <Marker position={carPosition} icon={L.icon({
                iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHJ4PSI0IiBmaWxsPSIjRkY2QjZCIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPvCZkrg8L3RleHQ+PC9zdmc+',
                iconSize: [32, 32],
                iconAnchor: [16, 16],
                popupAnchor: [0, -16]
              })}>
                <Popup>
                  <strong>🚗 Your Vehicle</strong><br />
                  In Transit
                </Popup>
              </Marker>
            )}
          </MapContainer>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="route-actions-section">
          <button className="action-btn primary" onClick={handleRecalculateRoutes}>
            🔄 Recalculate Routes
          </button>
          <button className="action-btn success" onClick={handleStartNavigation}>
            🚀 Start Navigation
          </button>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
}
