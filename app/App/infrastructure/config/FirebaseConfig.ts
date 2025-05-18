import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import analytics from '@react-native-firebase/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import env from './env';

// Initialize Firebase services
export const FIREBASE_AUTH = auth();
export const FIREBASE_DB = firestore();
export const FIREBASE_ANALYTICS = analytics();

// Configure auth persistence
auth().setPersistence(auth.Auth.Persistence.LOCAL);

// Disable analytics in development
if (__DEV__) {
  analytics().setAnalyticsCollectionEnabled(false);
}
