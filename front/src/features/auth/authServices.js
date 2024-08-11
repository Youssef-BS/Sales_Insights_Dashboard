import axios from "axios";
import { config } from "../../utils/axiosconfig";
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
const logout = async()=>{
  const reponse = await axios.get(`${base_url}/logout`,);

  localStorage.removeItem("user")
  return reponse.data 
}

const authService = {
  login,
  register,
  logout,
};

export default authService;

