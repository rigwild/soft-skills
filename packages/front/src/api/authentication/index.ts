import axiosInstance from "api";

export const register = (username: string, email: string, password: string) => {
  return axiosInstance.post("/register", {
    username,
    email,
    password,
  });
};

export const login = (username: string, password: string) => {
  return axiosInstance.post("/login", {
    username,
    password,
  });
};
