import axios from "axios";
import URL from "../globals/config";

/**Create a instance of axios with a custom config */
export const http = axios.create({
  baseURL: URL,
  // headers: { "Content-Type": "application/json", Accept: "multipart/form-data" }
});

/**Add a request interceptor */
http.interceptors.request.use(
  function (config) {
    // if (token) config.headers.Authorization = `Bearer ` + token;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

/**Add a response interceptor */
http.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response) {
      if (401 === error.response.status) {
      } else {
        return Promise.reject(error);
      }
    }
  }
);
