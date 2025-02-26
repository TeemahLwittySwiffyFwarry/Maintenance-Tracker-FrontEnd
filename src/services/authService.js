import axios from "axios";

const API_URL = "https://agronomy-dept-llgc.teemah.com.ng/api/";

const register = (username, password) => {
  return axios.post(API_URL + "register/", { username, password });
};

const login = (username, password) => {
  return axios
    .post(API_URL + "token/", { username, password })
    .then((response) => {
      if (response.data.access) {
        localStorage.setItem("user", JSON.stringify(response.data));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem("user");
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem("user"));
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
};
