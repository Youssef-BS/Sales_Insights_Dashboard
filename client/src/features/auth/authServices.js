import axios from "axios";
import { base_url } from "../../utils/baseUrl";

// Utility to set or remove JWT token from Axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};

const login = async (userData) => {
  const response = await axios.post(`${base_url}/login`, userData);
  if (response.data) {
    const { token, user } = response.data;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setAuthToken(token);
  }
  return response.data;
};

const register = async (userData) => {
  const response = await axios.post(`${base_url}/register`, userData);
  if (response.data) {
    const { token, user } = response.data;
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    setAuthToken(token);
  }
  return response.data;
};

const updateAccount = async (id, userData) => {
  const token = localStorage.getItem("token");
  setAuthToken(token);
  const response = await axios.put(`${base_url}/updateAccount/${id}`, userData);
  if (response.data) {
    const { user } = response.data;
    localStorage.setItem("user", JSON.stringify(user));
  }
  return response.data;
};

const logout = async () => {
  try {
    const response = await axios.get(`${base_url}/logout`);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setAuthToken(null);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const authService = {
  login,
  register,
  updateAccount,
  logout,
};

export default authService;
