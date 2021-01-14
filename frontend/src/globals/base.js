const hostname = window.location.hostname;

const base = {
  localhost: "/",
  platform: "/"
};

let basename = "";
if (hostname === "localhost" || hostname === "192.168.43.211") {
  basename = base.localhost;
} else {
  basename = base.platform;
}
export default basename;
