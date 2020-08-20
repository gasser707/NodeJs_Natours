import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout, signup } from './login';
import { updateData } from './updateSettings';
import { bookTour } from './stripe';

const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const signupForm = document.querySelector('.form--signup')
const logoutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour')
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}


if (loginForm) {
    loginForm.addEventListener('submit', e => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        e.preventDefault();
        login(email, password);

    });
}


if (signupForm) {
    signupForm.addEventListener('submit', e => {
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const name = document.getElementById('name').value;
        e.preventDefault();
        signup(email, password, confirmPassword, name);

    });
}

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateData(form, 'data');
    });
}

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault();
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        const password = document.getElementById('password-current').value;
        const newPassword = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password-confirm').value;
        console.log(password, newPassword, confirmPassword);
        await updateData({ password, newPassword, confirmPassword }, 'password');

        document.querySelector('.btn--save-password').textContent = 'Save password';
        password = document.getElementById('password-current').textContent = '';
        newPassword = document.getElementById('password').textContent = '';
        confirmPassword = document.getElementById('password-confirm').textContent = '';
    });
}

if(bookBtn){
    bookBtn.addEventListener('click', e=>{
        //comes from data-tour-id
        //could us  const {tourId}= e.target.dataset
        e.target.textContent='Processing...'
        const tourId = e.target.dataset.tourId
        bookTour(tourId)
    })
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);