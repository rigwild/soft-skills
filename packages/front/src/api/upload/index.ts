import axiosInstance, { getAuthorizationHeaders } from "api";

export const upload = (blob: Blob) => {
  const data = new FormData();
  data.append("content", blob);
  return axiosInstance.post("/uploads", data, {
    headers: getAuthorizationHeaders(),
  });
};
