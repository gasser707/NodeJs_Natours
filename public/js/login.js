import axios from 'axios';
import { showAlert } from './alerts';
export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email: email,
                password: password
            }
        });

        showAlert('success', 'logged in successfully!');
        location.assign('/');



    } catch (err) {
        showAlert('error', err.response.data.message);
    };
};

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
        showAlert('success', 'logged out successfully!');
        //force server to reload not browser cache
        location.assign('/')

    } catch (err) {
        showAlert('error', 'Error...please try again!');

    }
};


export const signup = async (email, password, confirmPassword,name)=>{
    try {
        const res = await axios({
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                confirmPassword
            }
        });

        showAlert('success', 'signed up successfully!');
        location.assign('/');

    } catch (err) {
        showAlert('error', err.response.data.message);
    };
};