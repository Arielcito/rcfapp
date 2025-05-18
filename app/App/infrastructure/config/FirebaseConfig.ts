import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from './env';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = env.firebase;


export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = initializeAuth(FIREBASE_APP, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
  });
export const FIREBASE_DB = getFirestore(FIREBASE_APP);