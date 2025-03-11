import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAk8Atw1E_dFw5L0l6yzpx1vT9C3eoCEZ8",
  authDomain: "shareprofile-cca1c.firebaseapp.com",
  databaseURL: "https://shareprofile-cca1c-default-rtdb.firebaseio.com/",
  projectId: "shareprofile-cca1c",
  storageBucket: "shareprofile-cca1c.firebasestorage.app",
  messagingSenderId: "859996644324",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get database instance
export const database = getDatabase(app);

export default app;
