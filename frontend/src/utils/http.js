import axios from "axios";
import URL from "../globals/config";
import store from '../redux/store';
/**Create a instance of axios with a custom config */
export const http = axios.create({
  baseURL: URL,
  // headers: { "Content-Type": "application/json", Accept: "multipart/form-data" }
});
const getJWT = () => {
  var storeData = store.getState();
  return storeData.userReducer.userToken;
}
/**Add a request interceptor */
http.interceptors.request.use(

  async function (config) {
    let token = await encodeURIComponent(getJWT())
    if (token) config.headers.Authorization = token;
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
