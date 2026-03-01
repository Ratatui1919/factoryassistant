import { auth, db } from './firebase-config.js';

console.log('Firebase подключен:', auth, db);
document.body.innerHTML = '<h1 style="color:green; text-align:center; margin-top:50px;">✅ Firebase работает!</h1>';
