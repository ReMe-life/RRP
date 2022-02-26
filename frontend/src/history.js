import { createBrowserHistory } from "history";

// const hostname = window.location.hostname;

// const base = {
//   localhost: "/",
//   platform: "/"
// };

// let basename = "";
// if (hostname === "localhost" || hostname === "192.168.2.102") {
//   basename = base.localhost;
// } else {
//   basename = base.platform;
// }
//const history = createBrowserHistory({ basename: '/remelife' });
const history = createBrowserHistory({ basename: '/' });
export default history;