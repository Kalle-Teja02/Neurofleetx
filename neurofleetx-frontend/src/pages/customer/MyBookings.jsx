import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/pages.css";
import "../../styles/myBookings.css";

const DUMMY = [
  { id: "BK3001", vehicle: "Toyota Innova", type: "Car",  isEV: false, date: "2 Mar 2026",  timeSlot: "10:00 AM", total: 320, status: "Confirmed" },
  { id: "BK3002", vehicle: "Honda City",    type: "Car",  isEV: false, date: "5 Mar 2026",  timeSlot: "12:00 PM", total: 340, status: "Pending"   },
  { id: "BK3003", vehicle: "Ola S1 Pro",    type: "Bike", isEV: true,  date: "8 Mar 2026",  timeSlot: "2:00 PM",  total: 340, status: "Confirmed" },
];

export default function MyBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState(() => {
    const saved = JSON.parse(localStorage.getItem('myBookings') || '[]');
    return [...saved, ...DUMMY];
  });

  const [selected, setSelected] = useState(null);

  const cancelBooking = (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    const updated = bookings.map(b => b.id === id ? { ...b, status: 'Cancelled' } : b);
    setBookings(updated);
    // update localStorage entries only (not dummy)
    const lsBookings = updated.filter(b => !DUMMY.find(d => d.id === b.id));
    localStorage.setItem('myBookings', JSON.stringify(lsBookings));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate("/customer")} className="back-btn">← Back</button>
        <h1>My Bookings</h1>
      </div>

      <div className="mb-stats-row">
        <div className="mb-stat confirmed">{bookings.filter(b => b.status === 'Confirmed').length} Confirmed</div>
        <div className="mb-stat pending">{bookings.filter(b => b.status === 'Pending').length} Pending</div>
        <div className="mb-stat cancelled">{bookings.filter(b => b.status === 'Cancelled').length} Cancelled</div>
      </div>

      <div className="mb-grid">
        {bookings.map(b => (
          <div key={b.id} className={`mb-card ${b.status.toLowerCase()}`}>
            <div className="mb-card-top">
              <div>
                <p className="mb-vehicle">{b.vehicle}</p>
                <p className="mb-id">{b.id}</p>
              </div>
              <span className={`mb-badge ${b.status.toLowerCase()}`}>{b.status}</span>
            </div>
            <div className="mb-card-details">
              <span>📅 {b.date}</span>
              <span>🕐 {b.timeSlot}</span>
              <span>{b.isEV ? '⚡ EV' : '⛽ Non-EV'}</span>
              <span>💺 {b.type}</span>
            </div>
            <div className="mb-card-footer">
              <span className="mb-total">₹{b.total}</span>
              <div className="mb-actions">
                <button className="mb-view-btn" onClick={() => setSelected(b)}>View</button>
                {b.status === 'Confirmed' || b.status === 'Pending' ? (
                  <button className="mb-cancel-btn" onClick={() => cancelBooking(b.id)}>Cancel</button>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="mb-overlay" onClick={() => setSelected(null)}>
          <div className="mb-modal" onClick={e => e.stopPropagation()}>
            <div className="mb-modal-header">
              <h3>{selected.vehicle}</h3>
              <button onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="mb-modal-body">
              {[
                ['Booking ID', selected.id],
                ['Vehicle Type', selected.type],
                ['Fuel', selected.isEV ? '⚡ EV' : '⛽ Non-EV'],
                ['Date', selected.date],
                ['Time Slot', selected.timeSlot],
                ['Total Paid', `₹${selected.total}`],
                ['Status', selected.status],
              ].map(([label, val]) => (
                <div key={label} className="mb-detail-row">
                  <span>{label}</span><strong>{val}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
