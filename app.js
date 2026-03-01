import { auth, db } from './firebase-config.js';

console.log('App.js загружен');
console.log('Auth:', auth);
console.log('DB:', db);

document.body.innerHTML = '<h1 style="color:green; text-align:center; margin-top:50px;">✅ App.js работает!</h1>';
