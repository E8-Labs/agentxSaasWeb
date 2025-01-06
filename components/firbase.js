import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { UpdateProfile } from "./apis/UpdateProfile";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD5hVMiikqGuwJuuOp9haoClVtMH_3EibM",
    authDomain: "my-agentx-d27f7.firebaseapp.com",
    projectId: "my-agentx-d27f7",
    storageBucket: "my-agentx-d27f7.firebasestorage.app",
    messagingSenderId: "355634409731",
    appId: "1:355634409731:web:2d5fda2073e75cafee3936",
    measurementId: "G-Y0FBZR2VBW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase Messaging instance
let messaging = null;
let requestToken = null;

if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    // Check for service worker support and initialize messaging
    messaging = getMessaging(app);

    requestToken = () => {
        getToken(messaging, { vapidKey: process.env.NEXT_PUBLIC_Public_Notification_VAPID_key })
            .then((currentToken) => {
                if (currentToken) {
                    console.log("FCM Token is:", currentToken);
                    const apidata = {
                        fcm_token: currentToken
                    }
                    console.log("Token sending in api is", apidata);
                    UpdateProfile(apidata);
                } else {
                    console.log("No registration token available. Request permission to generate one.");
                }
            })
            .catch((err) => {
                console.error("Error while retrieving FCM token:", err);
            })
            .finally(() => {
                console.log("Token request completed.");
            });
    };

    // Call requestToken to request notification permissions
    requestToken();
} else {
    console.log("FCM is not supported in this browser.");
}

export { messaging, requestToken };
