import axiosInstance, { getAuthorizationHeaders } from "api";

export const getProfile = () => {
  return axiosInstance.get("/profile", {
    headers: getAuthorizationHeaders(),
  });
};

export const editProfile = (name: string) => {
  return axiosInstance.patch(
    "/profile",
    { name },
    {
      headers: getAuthorizationHeaders(),
    }
  );
};

export const deleteProfile = () => {
  return axiosInstance.delete("/profile", {
    headers: getAuthorizationHeaders(),
  });
};
