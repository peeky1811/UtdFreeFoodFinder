import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Replace with your actual Firebase config from Firebase Console
// For the hackathon, we can use a mock mode if these are empty
const firebaseConfig = {
  apiKey: "MOCK_API_KEY",
  authDomain: "mock-utdfreefood.firebaseapp.com",
  projectId: "mock-utdfreefood",
  storageBucket: "mock-utdfreefood.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
