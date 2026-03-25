import BookingVehicleCard from './BookingVehicleCard';

export default function VehicleList({ vehicles }) {
  if (vehicles.length === 0) {
    return (
      <div className="booking-empty">
        <p>😕 No vehicles match your filters.</p>
        <p>Try adjusting or resetting the filters.</p>
      </div>
    );
  }

  return (
    <div className="booking-vehicle-grid">
      {vehicles.map(v => <BookingVehicleCard key={v.id} vehicle={v} />)}
    </div>
  );
}
