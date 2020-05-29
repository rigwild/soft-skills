import axiosInstance from "api";

export const getProfile = () => {
  return axiosInstance.get("/profile", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};

export const editProfile = (name: string) => {
  return axiosInstance.patch(
    "/profile",
    { name },
    {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    }
  );
};

export const deleteProfile = () => {
  return axiosInstance.delete("/profile", {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  });
};
