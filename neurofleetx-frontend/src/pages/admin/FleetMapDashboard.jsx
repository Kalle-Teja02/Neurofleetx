import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/fleetMapDashboard.css';
import '../../styles/pages.css';

// Fix Vite/Leaflet broken icon paths
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl:       new URL('leaflet/dist/images/marker-icon.png',    import.meta.url).href,
  shadowUrl:     new URL('leaflet/dist/images/marker-shadow.png',  import.meta.url).href,
});

const BASE = 'http://localhost:8082';
const STATUS_COLOR = { AVAILABLE: '#10b981', IN_USE: '#3b82f6', MAINTENANCE: '#f59e0b' };

const safeJson = async (url, token) => {
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
};

export default function FleetMapDashboard() {
  const navigate   = useNavigate();
  const token      = localStorage.getItem('token');
  const mapRef     = useRef(null);
  const heatRef    = useRef(null);

  const [vehicles,   setVehicles]   = useState([]);
  const [trips,      setTrips]      = useState([]);
  const [heatSource, setHeatSource] = useState('backend');
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true); setError(null);
      const [v, t] = await Promise.all([
        safeJson(`${BASE}/api/admin/vehicles`, token),
        safeJson(`${BASE}/api/admin/trips`,    token),
      ]);
      setVehicles(v); setTrips(t);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  // Lazy-load leaflet.heat inside useEffect to prevent module-load crash
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Remove old heat layer
    if (heatRef.current) { map.removeLayer(heatRef.current); heatRef.current = null; }

    import('leaflet.heat/dist/leaflet-heat.js').then(() => {
      if (heatSource === 'backend') {
        // Use trip pickup coords if available, fall back to vehicle coords
        let points = trips
          .filter(t => t.pickupLat && t.pickupLng)
          .map(t => [t.pickupLat, t.pickupLng, 0.6]);

        if (points.length === 0) {
          // Fallback: use vehicle positions — they always have coords
          points = vehicles
            .filter(v => v.lat && v.lng)
            .flatMap(v => [
              [v.lat, v.lng, 0.9],
              [v.lat + (Math.random()-0.5)*0.02, v.lng + (Math.random()-0.5)*0.02, 0.6],
              [v.lat + (Math.random()-0.5)*0.02, v.lng + (Math.random()-0.5)*0.02, 0.5],
            ]);
        }

        heatRef.current = L.heatLayer(points, { radius: 25, blur: 20, maxZoom: 14 }).addTo(map);
      } else {
        import('../../data/uber_trips.json').then(m => {
          const uberPoints = m.default.map(t => [t.lat, t.lng, 0.5]);
          heatRef.current = L.heatLayer(uberPoints, { radius: 20, blur: 15 }).addTo(map);
        });
      }
    }).catch(e => console.warn('leaflet.heat load failed:', e));
  }, [heatSource, trips, mapRef.current]);

  // KPI counts
  const available   = vehicles.filter(v => v.status === 'AVAILABLE').length;
  const inUse       = vehicles.filter(v => v.status === 'IN_USE').length;
  const maintenance = vehicles.filter(v => v.status === 'MAINTENANCE').length;

  const mapCenter = heatSource === 'backend' ? [17.3850, 78.4867] : [40.7128, -74.0060];

  if (loading) return <div className="page-container"><p className="fmd-loading">⏳ Loading map data...</p></div>;
  if (error)   return (
    <div className="page-container">
      <p className="fmd-error">⚠ {error}</p>
      <button className="fmd-retry" onClick={loadData}>Retry</button>
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate('/admin')} className="back-btn">← Back</button>
        <h1>Fleet Map Dashboard</h1>
      </div>

      {/* KPI strip */}
      <div className="fmd-kpi-strip">
        <div className="fmd-kpi green">🟢 Available <strong>{available}</strong></div>
        <div className="fmd-kpi blue">🔵 In Use <strong>{inUse}</strong></div>
        <div className="fmd-kpi amber">🟡 Maintenance <strong>{maintenance}</strong></div>
        <div className="fmd-kpi gray">🚗 Total <strong>{vehicles.length}</strong></div>
        <div className="fmd-kpi gray">📍 Trip Points <strong>{trips.filter(t => t.pickupLat).length || vehicles.filter(v => v.lat).length * 3}</strong></div>
      </div>

      {/* Heatmap source toggle */}
      <div className="fmd-toggle-row">
        <button
          className={`fmd-toggle-btn ${heatSource === 'backend' ? 'active' : ''}`}
          onClick={() => setHeatSource('backend')}
        >🇮🇳 Backend Trips (Hyderabad)</button>
        <button
          className={`fmd-toggle-btn ${heatSource === 'uber' ? 'active' : ''}`}
          onClick={() => setHeatSource('uber')}
        >🗽 Uber Dataset (NYC)</button>
      </div>

      {/* Map */}
      <div className="fmd-map-wrap">
        <MapContainer
          key={heatSource}
          center={mapCenter}
          zoom={heatSource === 'backend' ? 12 : 11}
          style={{ height: '520px', width: '100%', borderRadius: '12px' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Vehicle markers — only for backend source */}
          {heatSource === 'backend' && vehicles.map(v => (
            v.lat && v.lng ? (
              <CircleMarker
                key={v.id}
                center={[v.lat, v.lng]}
                radius={8}
                fillColor={STATUS_COLOR[v.status] || '#94a3b8'}
                color="#fff"
                weight={2}
                fillOpacity={0.9}
              >
                <Popup>
                  <strong>{v.vehicleNumber}</strong><br />
                  Model: {v.model}<br />
                  Status: {v.status}<br />
                  Lat: {v.lat?.toFixed(4)}, Lng: {v.lng?.toFixed(4)}<br />
                  Speed: {v.speed?.toFixed(1)} km/h<br />
                  Battery: {v.battery}% | Fuel: {v.fuel}%
                </Popup>
              </CircleMarker>
            ) : null
          ))}

          {/* Legend overlay */}
          <div className="fmd-legend">
            <p className="fmd-legend-title">Legend</p>
            {Object.entries(STATUS_COLOR).map(([s, c]) => (
              <div key={s} className="fmd-legend-item">
                <span className="fmd-legend-dot" style={{ background: c }} />
                {s.replace('_', ' ')}
              </div>
            ))}
            <div className="fmd-legend-item">
              <span className="fmd-legend-dot" style={{ background: '#ff4444', opacity: 0.6 }} />
              Heatmap
            </div>
          </div>
        </MapContainer>
      </div>
    </div>
  );
}
