import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterPanel from '../../components/booking/FilterPanel';
import VehicleList from '../../components/booking/VehicleList';
import '../../styles/customerBooking.css';
import '../../styles/pages.css';

const VEHICLES = [
  { id: 1,  name: 'Toyota Innova',    type: 'Car',   seats: 6,  isEV: false, pricePerHour: 120 },
  { id: 2,  name: 'Honda City',       type: 'Car',   seats: 4,  isEV: false, pricePerHour: 90  },
  { id: 3,  name: 'Tata Nexon EV',    type: 'Car',   seats: 4,  isEV: true,  pricePerHour: 110 },
  { id: 4,  name: 'Ola S1 Pro',       type: 'Bike',  seats: 2,  isEV: true,  pricePerHour: 40  },
  { id: 5,  name: 'Royal Enfield',    type: 'Bike',  seats: 2,  isEV: false, pricePerHour: 35  },
  { id: 6,  name: 'Tata Ace',         type: 'Truck', seats: 2,  isEV: false, pricePerHour: 200 },
  { id: 7,  name: 'Mahindra Bolero',  type: 'Car',   seats: 6,  isEV: false, pricePerHour: 100 },
  { id: 8,  name: 'BYD Atto 3',       type: 'Car',   seats: 4,  isEV: true,  pricePerHour: 130 },
  { id: 9,  name: 'Ashok Leyland',    type: 'Truck', seats: 2,  isEV: false, pricePerHour: 350 },
  { id: 10, name: 'Maruti Swift',     type: 'Car',   seats: 4,  isEV: false, pricePerHour: 75  },
  { id: 11, name: 'Ather 450X',       type: 'Bike',  seats: 2,  isEV: true,  pricePerHour: 45  },
  { id: 12, name: 'Toyota Fortuner',  type: 'Car',   seats: 6,  isEV: false, pricePerHour: 180 },
];

function matchSeats(vehicleSeats, filterSeats) {
  if (!filterSeats) return true;
  if (filterSeats === '6+') return vehicleSeats >= 6;
  return vehicleSeats === parseInt(filterSeats);
}

// Rule-based scoring: type +3, seats +2, EV +3
function scoreVehicle(vehicle, filters) {
  let score = 0;
  if (filters.type && vehicle.type === filters.type)           score += 3;
  if (filters.seats && matchSeats(vehicle.seats, filters.seats)) score += 2;
  if (filters.ev === 'ev'     && vehicle.isEV)                 score += 3;
  if (filters.ev === 'non-ev' && !vehicle.isEV)                score += 3;
  return score;
}

const TOP_N = 3; // how many vehicles get the "Recommended" badge

export default function CustomerBookingPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ type: '', seats: '', ev: '' });

  const rankedVehicles = useMemo(() => {
    const anyFilterActive = filters.type || filters.seats || filters.ev;

    const filtered = VEHICLES.filter(v => {
      if (filters.type && v.type !== filters.type) return false;
      if (!matchSeats(v.seats, filters.seats)) return false;
      if (filters.ev === 'ev' && !v.isEV) return false;
      if (filters.ev === 'non-ev' && v.isEV) return false;
      return true;
    });

    if (!anyFilterActive) {
      // No filters — no recommendations, just show all
      return filtered.map(v => ({ ...v, score: 0, isRecommended: false }));
    }

    // Score and sort
    const scored = filtered
      .map(v => ({ ...v, score: scoreVehicle(v, filters) }))
      .sort((a, b) => b.score - a.score);

    // Only mark as recommended if score > 0
    const maxScore = scored[0]?.score ?? 0;
    if (maxScore === 0) return scored.map(v => ({ ...v, isRecommended: false }));

    // Top N get the badge (only if they actually scored)
    const topScore = scored.slice(0, TOP_N).map(v => v.score);
    const threshold = topScore[topScore.length - 1];

    return scored.map(v => ({
      ...v,
      isRecommended: v.score >= threshold && v.score > 0,
    }));
  }, [filters]);

  const anyFilterActive = filters.type || filters.seats || filters.ev;
  const recommendedCount = rankedVehicles.filter(v => v.isRecommended).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate('/customer')} className="back-btn">← Back</button>
        <h1>Book a Vehicle</h1>
      </div>

      <div className="booking-layout">
        <FilterPanel filters={filters} onChange={setFilters} />
        <main className="booking-main">
          <div className="booking-result-bar">
            <p className="booking-result-count">
              {rankedVehicles.length} vehicle{rankedVehicles.length !== 1 ? 's' : ''} available
            </p>
            {anyFilterActive && recommendedCount > 0 && (
              <span className="rec-hint">⭐ Top {recommendedCount} recommended based on your filters</span>
            )}
          </div>
          <VehicleList vehicles={rankedVehicles} />
        </main>
      </div>
    </div>
  );
}
