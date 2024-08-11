import axios from "axios";
import { base_url } from "./baseUrl";
const getTokenFromLocalStorage = localStorage.getItem("user")
  ? JSON.parse(localStorage.getItem("user"))
  : null;

   const headers = {
    Authorization: `Bearer ${getTokenFromLocalStorage !== null ? getTokenFromLocalStorage.token : ""}`,
    Accept: "application/json",
  };
  export const authAxios = axios.create({
    baseURL:base_url,
    headers:{
      Authorization: `Bearer ${getTokenFromLocalStorage !== null ? getTokenFromLocalStorage.token : ""}`,
    }
  })
  
   export const config = {
    headers: headers,
  };

