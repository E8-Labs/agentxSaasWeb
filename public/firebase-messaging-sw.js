// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-app.js');
// eslint-disable-next-line no-undef
importScripts('https://www.gstatic.com/firebasejs/8.8.0/firebase-messaging.js');

// Your Firebase config here
const firebaseConfig = {
    apiKey: "AIzaSyD5hVMiikqGuwJuuOp9haoClVtMH_3EibM",
    authDomain: "my-agentx-d27f7.firebaseapp.com",
    projectId: "my-agentx-d27f7",
    storageBucket: "my-agentx-d27f7.firebasestorage.app",
    messagingSenderId: "355634409731",
    appId: "1:355634409731:web:2d5fda2073e75cafee3936",
    measurementId: "G-Y0FBZR2VBW"
};

// Initialize the Firebase app in the service worker
firebase.initializeApp(firebaseConfig);
// eslint-disable-next-line no-undef
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log(
        '[firebase-messaging-sw.js] Received background message ',
        payload
    );
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: './agentX.png',
    };
    self.registration.showNotification(notificationTitle, notificationOptions);
});
