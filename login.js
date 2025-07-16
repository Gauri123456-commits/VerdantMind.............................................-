// === login.js ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAY6c_h30Ge5mQIBM6Qu0tcJNAWuaIfrgY",
  authDomain: "verdantminds-26aa7.firebaseapp.com",
  projectId: "verdantminds-26aa7",
  storageBucket: "verdantminds-26aa7.appspot.com",
  messagingSenderId: "332964884712",
  appId: "1:332964884712:web:eac7a0475b2bc53804195d",
  measurementId: "G-ZRLX2JSYVZ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.querySelector(".login-btn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) return alert("Please enter email and password.");

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    const userDoc = await getDoc(doc(db, "users", uid));
    const userData = userDoc.data();

    if (userData && userData.fullName) {
      localStorage.setItem("fullName", userData.fullName);
      localStorage.setItem("uid", uid);
      alert("Login successful!");
      window.location.href = "/community.html";
    } else {
      alert("User profile not found.");
    }
  } catch (error) {
    console.error("Login failed:", error);
    alert("Login failed: " + error.message);
  }
});
