import axios from "axios";
import { base_url } from "../../utils/baseUrl";

const login = async (userData) => {
  const response = await axios.post(`${base_url}/login`, userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const register = async (userData) => {
  const response = await axios.post(`${base_url}/register`, userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const updateAccount = async (id, userData) => {
  const response = await axios.put(`${base_url}/updateAccount/${id}`, userData);
  return response.data;
};

const logout = async () => {
  try {
    const response = await axios.get(`${base_url}/logout`);
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    // Handle error if necessary
    throw error;
  }
};

const authService = {
  login,
  register,
  logout,
  updateAccount
};

export default authService;
