import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "",
  authDomain: "mse342-team13.firebaseapp.com",
  projectId: "mse342-team13",
  storageBucket: "mse342-team13.firebasestorage.app",
  messagingSenderId: "1052126094938",
  appId: "1:1052126094938:web:cd79f85ca6af9084c21a63"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, signOut };