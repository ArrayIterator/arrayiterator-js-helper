import window from "./Window.js";
import localStorage from "./Compat/LocalStorage";

const BrowserStorage = window.localStorage || window.sessionStorage || localStorage;

export default BrowserStorage;
