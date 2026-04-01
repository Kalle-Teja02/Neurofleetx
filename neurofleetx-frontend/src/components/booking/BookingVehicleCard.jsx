import { useState } from 'react';
import BookingModal from './BookingModal';

const TYPE_ICONS = { Car: '🚗', Bike: '🏍️', Truck: '🚛' };

export default function BookingVehicleCard({ vehicle }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={`booking-vehicle-card ${vehicle.isRecommended ? 'recommended' : ''}`}>
        {vehicle.isRecommended && (
          <div className="rec-badge">⭐ Recommended</div>
        )}
        <div className="bvc-icon">{TYPE_ICONS[vehicle.type] || '🚘'}</div>
        <div className="bvc-body">
          <h4 className="bvc-name">{vehicle.name}</h4>
          <div className="bvc-tags">
            <span className="bvc-tag type">{vehicle.type}</span>
            <span className="bvc-tag seats">💺 {vehicle.seats} seats</span>
            <span className={`bvc-tag ev ${vehicle.isEV ? 'is-ev' : 'non-ev'}`}>
              {vehicle.isEV ? '⚡ EV' : '⛽ Non-EV'}
            </span>
          </div>
          <p className="bvc-price">₹{vehicle.pricePerHour} <span>/ hour</span></p>
        </div>
        <button className="bvc-book-btn" onClick={() => setShowModal(true)}>Book Now</button>
      </div>

      {showModal && <BookingModal vehicle={vehicle} onClose={() => setShowModal(false)} />}
    </>
  );
}
