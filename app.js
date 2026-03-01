import { auth, db } from './firebase-config.js';

console.log('✅ App.js загружен');
console.log('Auth:', auth);
console.log('DB:', db);

document.body.innerHTML = `
    <div style="text-align: center; margin-top: 50px; font-family: Arial;">
        <h1 style="color: #00b060;">Vaillant Assistant</h1>
        <p style="color: green;">✅ Firebase подключен!</p>
        <p style="color: #666;">Сайт работает.</p>
        <p>Auth: ${auth ? '✅' : '❌'}</p>
        <p>DB: ${db ? '✅' : '❌'}</p>
    </div>
`;
