import axiosInstance, { getAuthorizationHeaders } from "api";

export const upload = (blob: Blob) => {
  const data = new FormData();
  data.append("content", blob, "upload.webm");
  return axiosInstance.post("/uploads", data, {
    headers: getAuthorizationHeaders(),
  });
};

export const getUploads = () => {
  return axiosInstance.get("/uploads", {
    headers: getAuthorizationHeaders(),
  });
};

export const getAnalysis = (id: string) => {
  return axiosInstance.get(`/analysis/${id}`, {
    headers: getAuthorizationHeaders(),
  });
};

export const getAnalysisDataFile = (id: string, dataType: string) => {
  return axiosInstance.get(`/analysis/${id}/${dataType}`, {
    headers: getAuthorizationHeaders(),
    responseType: "blob",
  });
};

export const retryAnalysis = (id: string) => {
  return axiosInstance.post(`/uploads/${id}/retry`, null, {
    headers: getAuthorizationHeaders(),
  });
};

export const deleteUpload = (id: string) => {
  return axiosInstance.delete(`/analysis/${id}`, {
    headers: getAuthorizationHeaders(),
  });
};
