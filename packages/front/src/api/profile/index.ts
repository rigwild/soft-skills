import axiosInstance from "api";

const getHeaders = () => {
  return { Authorization: `Bearer ${localStorage.getItem("token")}` };
};

export const getProfile = () => {
  return axiosInstance.get("/profile", {
    headers: getHeaders(),
  });
};

export const editProfile = (name: string) => {
  return axiosInstance.patch(
    "/profile",
    { name },
    {
      headers: getHeaders(),
    }
  );
};

export const deleteProfile = () => {
  return axiosInstance.delete("/profile", {
    headers: getHeaders(),
  });
};
