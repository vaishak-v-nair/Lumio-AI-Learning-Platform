import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "studio-5138391784-a103a",
  appId: "1:790007585173:web:b51e5e8e9b286b9c273e9c",
  apiKey: "AIzaSyBXOWfqWWQpCVdvKhKEBM1tEVdpAHYryjc",
  authDomain: "studio-5138391784-a103a.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "790007585173"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);

export { app, firestore };
