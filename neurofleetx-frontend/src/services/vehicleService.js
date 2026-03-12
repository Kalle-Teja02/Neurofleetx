import axios from 'axios';

const BASE_URL = 'http://localhost:8082/api/vehicles';

export const getVehicles = async () => {
  // Use manager test endpoint to bypass authentication
  const response = await axios.get(`${BASE_URL}/manager/test`);
  return response.data;
};

export const addVehicle = async (vehicle) => {
  // Use test endpoint to bypass authentication
  const response = await axios.post(`${BASE_URL}/test`, vehicle);
  return response.data;
};

export const updateVehicle = async (id, vehicle) => {
  // Use test endpoint to bypass authentication
  const response = await axios.put(`${BASE_URL}/test/${id}`, vehicle);
  return response.data;
};

export const deleteVehicle = async (id) => {
  // Use test endpoint to bypass authentication
  await axios.delete(`${BASE_URL}/test/${id}`);
};

export const markAsServiced = async (id) => {
  const response = await axios.put(`${BASE_URL}/${id}/service-complete`);
  return response.data;
};

export const getMaintenanceVehicles = async () => {
  const response = await axios.get(`${BASE_URL}/maintenance`);
  return response.data;
};

export const getLowBatteryVehicles = async () => {
  const response = await axios.get(`${BASE_URL}/low-battery`);
  return response.data;
};
