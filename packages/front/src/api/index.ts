import axios from "axios";

export const getAuthorizationHeaders = () => {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
};

export default axios.create({
  baseURL: "http://localhost:3100",
});
