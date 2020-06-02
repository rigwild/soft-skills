import { AxiosError } from "axios";

export const getErrorMessage = (error: AxiosError) => {
  let errorMessage: string = error.response?.data.message;
  if (error.response?.status === 401) {
    errorMessage = errorMessage
      .concat(" ")
      .concat("Please, log out and log in again.");
  }
  return errorMessage;
};
