import { useState } from 'react';
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

export default function CustomerBookingPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({ type: '', seats: '', ev: '' });

  const filtered = VEHICLES.filter(v => {
    if (filters.type && v.type !== filters.type) return false;
    if (!matchSeats(v.seats, filters.seats)) return false;
    if (filters.ev === 'ev' && !v.isEV) return false;
    if (filters.ev === 'non-ev' && v.isEV) return false;
    return true;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate('/customer')} className="back-btn">← Back</button>
        <h1>Book a Vehicle</h1>
      </div>

      <div className="booking-layout">
        <FilterPanel filters={filters} onChange={setFilters} />
        <main className="booking-main">
          <p className="booking-result-count">{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} available</p>
          <VehicleList vehicles={filtered} />
        </main>
      </div>
    </div>
  );
}
