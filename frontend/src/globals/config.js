const hostname = window.location.hostname;

const api = {
  localhost: "https://rrp.staging.remelife.com",
  platform: "https://rrp.staging.remelife.com"
};

let apiBase = "";
if (hostname === "localhost") {
  apiBase = api.platform;
} else {
  apiBase = api.platform;
}
export default apiBase;
