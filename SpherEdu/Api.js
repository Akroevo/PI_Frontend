const API = 'https://spheredu.onrender.com/api';

function getToken() {
    return localStorage.getItem('token');
}

function authHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + getToken()
    };
}

function handleUnauthorized(res) {
    if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/Login/login.html';
        return true;
    }
    return false;
}
