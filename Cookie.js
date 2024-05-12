import window from "./Window.js";

export const getCookie = (name) => {
    const value = `; ${window.document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
};
export const setCookie = (name, value, days) => {
    let expires = '';
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
    }
    window.document.cookie = `${name}=${value || ''}${expires}; path=/`;
}
export const deleteCookie = (name) => {
    window.document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export default {
    setCookie,
    getCookie,
    deleteCookie
}
