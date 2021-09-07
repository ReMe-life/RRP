const hostname = window.location.hostname;

const api = {
  localhost: "http://localhost:8080/",
  platform: "https://ws-remelife.s6.staging-host.com/"
};

let apiBase = "";
if (hostname === "localhost") {
  apiBase = api.platform;
} else {
  apiBase = api.platform;
}
export default apiBase;
