export default function FilterPanel({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val });

  return (
    <aside className="booking-filter-panel">
      <h3 className="filter-title">🔍 Filter Vehicles</h3>

      <div className="filter-group">
        <label>Vehicle Type</label>
        <select value={filters.type} onChange={e => set('type', e.target.value)}>
          <option value="">All Types</option>
          <option value="Car">Car</option>
          <option value="Bike">Bike</option>
          <option value="Truck">Truck</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Seats</label>
        <select value={filters.seats} onChange={e => set('seats', e.target.value)}>
          <option value="">Any Seats</option>
          <option value="2">2</option>
          <option value="4">4</option>
          <option value="6+">6+</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Fuel Type</label>
        <select value={filters.ev} onChange={e => set('ev', e.target.value)}>
          <option value="">All</option>
          <option value="ev">EV</option>
          <option value="non-ev">Non-EV</option>
        </select>
      </div>

      <button className="filter-reset-btn" onClick={() => onChange({ type: '', seats: '', ev: '' })}>
        ✕ Reset Filters
      </button>
    </aside>
  );
}
