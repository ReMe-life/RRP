const hostname = window.location.hostname;

const api = {
  localhost: "http://localhost:9000/",
  platform: "https://ws-rrp.remelife.com/"
};

let apiBase = "";
if (hostname === "localhost") {
  apiBase = api.platform;
} else {
  apiBase = api.platform;
}
export default apiBase;
