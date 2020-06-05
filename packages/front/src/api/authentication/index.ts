import axiosInstance from "api";

export const register = (name: string, email: string, password: string) => {
  return axiosInstance.post("/register", {
    name,
    email,
    password,
  });
};

export const login = (email: string, password: string) => {
  return axiosInstance.post("/login", {
    email,
    password,
  });
};
