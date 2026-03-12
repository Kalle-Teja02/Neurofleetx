/**
 * City Graph Database
 * Represents distances between major Indian cities in kilometers
 * Used for Dijkstra's shortest path algorithm
 */

export const cityGraph = {
  'Hyderabad': {
    'Warangal': 160,
    'Karimnagar': 120,
    'Vijayawada': 260,
    'Bangalore': 570,
    'Pune': 650
  },
  'Warangal': {
    'Hyderabad': 160,
    'Karimnagar': 180,
    'Vijayawada': 320
  },
  'Karimnagar': {
    'Hyderabad': 120,
    'Warangal': 180,
    'Vijayawada': 280,
    'Bangalore': 650
  },
  'Vijayawada': {
    'Hyderabad': 260,
    'Warangal': 320,
    'Karimnagar': 280,
    'Chennai': 360,
    'Bangalore': 520
  },
  'Bangalore': {
    'Hyderabad': 570,
    'Karimnagar': 650,
    'Vijayawada': 520,
    'Chennai': 350,
    'Pune': 850
  },
  'Chennai': {
    'Vijayawada': 360,
    'Bangalore': 350,
    'Pune': 1200
  },
  'Pune': {
    'Hyderabad': 650,
    'Bangalore': 850,
    'Chennai': 1200,
    'Mumbai': 150,
    'Delhi': 1400
  },
  'Mumbai': {
    'Pune': 150,
    'Delhi': 1400,
    'Bangalore': 1000
  },
  'Delhi': {
    'Agra': 206,
    'Pune': 1400,
    'Mumbai': 1400
  },
  'Agra': {
    'Delhi': 206
  }
};

/**
 * Get city coordinates for reference
 */
export const cityCoordinates = {
  'Hyderabad': { lat: 17.3850, lng: 78.4867 },
  'Warangal': { lat: 17.9689, lng: 79.5941 },
  'Karimnagar': { lat: 18.4386, lng: 79.1288 },
  'Vijayawada': { lat: 16.5062, lng: 80.6480 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Chennai': { lat: 13.0827, lng: 80.2707 },
  'Pune': { lat: 18.5204, lng: 73.8567 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'Delhi': { lat: 28.7041, lng: 77.1025 },
  'Agra': { lat: 27.1767, lng: 78.0081 }
};
