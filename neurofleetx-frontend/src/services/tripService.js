const API_BASE_URL = 'http://localhost:8082/api/trips';

export const tripService = {
  // Start a new trip
  startTrip: async (driverId, vehicleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ driverId, vehicleId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start trip');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error starting trip:', error);
      throw error;
    }
  },

  // End a trip
  endTrip: async (tripId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test/end/${tripId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to end trip');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error ending trip:', error);
      throw error;
    }
  },

  // Get active trip for a driver
  getActiveTrip: async (driverId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test/active/${driverId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch active trip');
      }
      
      const data = await response.json();
      return data.message ? null : data;
    } catch (error) {
      console.error('Error fetching active trip:', error);
      throw error;
    }
  },

  // Get all trips for a driver
  getTripsByDriver: async (driverId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/test/driver/${driverId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch trips');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching trips:', error);
      throw error;
    }
  },

  // Get all active trips
  getAllActiveTrips: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/test/active`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch active trips');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching active trips:', error);
      throw error;
    }
  },
};
