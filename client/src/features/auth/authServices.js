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

const verificationEmail = async (token) => {
  const response = await axios.get(`${base_url}/verify/${token}`);
  return response.data;
};


const resetPasswordRequest = async (email) => {
  const response = await axios.post(`${base_url}/reset-password-request`, { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const response = await axios.post(`${base_url}/reset-password/${token}`, { password });
  return response.data;
};



const authService = {
  login,
  register,
  updateAccount,
  verificationEmail ,
  resetPasswordRequest,
  resetPassword,
};

export default authService;
