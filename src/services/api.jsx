const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(token && { 'Authorization' : `Bearer ${token}`}),
    };
}
export const BASE_URL = "https://steady-sharply-ibex.ngrok-free.app/"
export const API_BASE_URL = BASE_URL + "api";
export const API_URL_IMAGE = "https://3b980f6eb586.ngrok-free.app/"; //địa chỉ luôn thay đổi

export default getAuthHeaders;