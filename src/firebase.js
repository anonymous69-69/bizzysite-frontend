import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCVPq2FtE2ubjj-v8oI1ZfpdINx4GBSn_k",
  authDomain: "bizzysite--login.firebaseapp.com",
  projectId: "bizzysite--login",
  storageBucket: "bizzysite--login.firebasestorage.app",
  messagingSenderId: "314931483952",
  appId: "1:314931483952:web:64646625f7bc36aef2e4f5",
  measurementId: "G-J1DMTXNDXB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };