// Run: node src/data/generateDataset.cjs
const fs = require('fs');
const path = require('path');

const HOTSPOTS = [
  { lat: 40.7580, lng: -73.9855, name: 'Midtown' },
  { lat: 40.6413, lng: -73.7781, name: 'JFK' },
  { lat: 40.7769, lng: -73.8740, name: 'LGA' },
  { lat: 40.6782, lng: -73.9442, name: 'Brooklyn' },
  { lat: 40.7282, lng: -73.7949, name: 'Queens' },
  { lat: 40.7831, lng: -73.9712, name: 'Upper West Side' },
  { lat: 40.7484, lng: -73.9967, name: 'Chelsea' },
];

const VEHICLE_TYPES = ['UberX', 'UberXL', 'UberBlack', 'UberPool', 'UberComfort'];
const HOUR_WEIGHTS  = [1,1,1,1,1,2,3,5,8,6,4,3,4,4,4,5,8,7,5,4,3,2,2,1];
const TOTAL_WEIGHT  = HOUR_WEIGHTS.reduce((a, b) => a + b, 0);

function pickHour() {
  let r = Math.floor(Math.random() * TOTAL_WEIGHT), c = 0;
  for (let h = 0; h < 24; h++) { c += HOUR_WEIGHTS[h]; if (r < c) return h; }
  return 12;
}

function pickHotspot() {
  const hs = HOTSPOTS[Math.floor(Math.random() * HOTSPOTS.length)];
  return { lat: hs.lat + (Math.random() - 0.5) * 0.06, lng: hs.lng + (Math.random() - 0.5) * 0.06 };
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  return d.toISOString().slice(0, 10);
}

const trips = Array.from({ length: 500 }, (_, i) => {
  const { lat, lng } = pickHotspot();
  const hour = pickHour();
  return {
    id: i + 1,
    lat, lng,
    hour,
    date: randomDate(30),
    vehicleType: VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)],
    fare: parseFloat((5 + Math.random() * 45).toFixed(2)),
    duration: Math.floor(5 + Math.random() * 55),
  };
});

const outPath = path.join(__dirname, 'uber_trips.json');
fs.writeFileSync(outPath, JSON.stringify(trips, null, 2));
console.log(`Generated ${trips.length} trips → ${outPath}`);
