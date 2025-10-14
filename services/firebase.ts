import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

// IMPORTANT: 
// This configuration is now set up with your project's keys.
// For security, avoid sharing these keys publicly.
const firebaseConfig = {
    apiKey: "AIzaSyCHOssg_YXYDCSRGuw4XiYAXD7r46C4NSU",
    authDomain: "dccc-volunteers.firebaseapp.com",
    projectId: "dccc-volunteers",
    storageBucket: "dccc-volunteers.firebasestorage.app",
    messagingSenderId: "894679810557",
    appId: "1:894679810557:web:2b7b968fc4870a914f1994",
    measurementId: "G-TQTWNKMG34"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore();

// Initialize Firebase Authentication and get a reference to the service
const auth = firebase.auth();

export { db, auth };