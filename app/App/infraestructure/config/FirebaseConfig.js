import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyC63HcJiZPxNDxCSwFm0258ctV0ILQDjRc",
  authDomain: "rfc-app-11121.firebaseapp.com",
  projectId: "rfc-app-11121",
  storageBucket: "rfc-app-11121.appspot.com",
  messagingSenderId: "12092366512",
  appId: "1:12092366512:web:4322f9e05508567035a575",
  measurementId: "G-4XD97Z168J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with ReactNativeAsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export const FIREBASE_APP = app;
export const FIREBASE_AUTH = auth;
export const FIREBASE_DB = getFirestore(app);
