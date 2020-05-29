import axiosInstance from "api";

export const getProfile = () => {
  return axiosInstance.get("/profile", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};
