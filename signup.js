// === signup.js ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

// ✅ Firebase config
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

// ✅ Handle signup form
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document.getElementById("confirm-password").value.trim();

  if (!fullName || !email || !password || !confirmPassword) {
    return alert("Please fill in all fields.");
  }

  if (password !== confirmPassword) {
    return alert("Passwords do not match.");
  }

  try {
    // 🔐 Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 👤 Set user display name
    await updateProfile(user, { displayName: fullName });

    // 🗃️ Save in Firestore
    await setDoc(doc(db, "users", user.uid), {
      fullName,
      email,
      createdAt: new Date().toISOString()
    });

    // 💾 Save in Railway (MySQL)
   await fetch("http://localhost:3000/api/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ fullName, email, password })
});


    // 🧠 Store in localStorage
    localStorage.setItem("fullName", fullName);
    localStorage.setItem("uid", user.uid);

    alert("Signup successful!");
    window.location.href = "/community.html";

  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("This email is already registered. Please log in instead.");
    } else {
      console.error("Signup Error:", error);
      alert("Error: " + error.message);
    }
  }
});
