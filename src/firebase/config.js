import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDKb5Mxt6RZFqgCxFMkkKsau42MAtEyIRo",
  authDomain: "assignment3-3b99b.firebaseapp.com",
  projectId: "assignment3-3b99b",
  storageBucket: "assignment3-3b99b.firebasestorage.app",
  messagingSenderId: "904317623101",
  appId: "1:904317632310:web:9ec7432db344c207684354"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Main database for user data, classes, reviews, etc.
const db = getFirestore(app, 'fittogether-db');

// Default database for email logs (used by Cloud Functions)
const defaultDb = getFirestore(app);

export { auth, app, db, defaultDb };
