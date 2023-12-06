/* eslint-disable */
// import "@babel/polyfill";
import 'core-js/stable';
import 'regenerator-runtime/runtime.js';

import { displayMap } from './mapbox.js';
import { login, logout } from './login.js';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

// DELEGATION
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm)
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log(email, password);
        login(email, password);
    });

if (logOutBtn) logOutBtn.addEventListener('click', logout);
