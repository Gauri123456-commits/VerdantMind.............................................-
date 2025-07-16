import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// ✅ Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAY6c_h30Ge5mQIBM6Qu0tcJNAWuaIfrgY",
  authDomain: "verdantminds-26aa7.firebaseapp.com",
  databaseURL: "https://verdantminds-26aa7-default-rtdb.firebaseio.com",
  projectId: "verdantminds-26aa7",
  storageBucket: "verdantminds-26aa7.appspot.com",
  messagingSenderId: "332964884712",
  appId: "1:332964884712:web:eac7a0475b2bc53804195d",
  measurementId: "G-ZRLX2JSYVZ"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ✅ Reference to the sensor data
const sensorRef = ref(db, "sensorData/current");

// ✅ Get UI elements
const temperatureEl = document.getElementById("temperature");
const humidityEl = document.getElementById("humidity");
const lastUpdatedEl = document.getElementById("lastUpdated");

// ✅ Listen for real-time updates
onValue(sensorRef, (snapshot) => {
  const data = snapshot.val();
  console.log("🔥 Data from Realtime Database:", data);

  if (!data) {
    temperatureEl.textContent = "🌡️ Temperature: -- °C";
    humidityEl.textContent = "💧 Humidity: -- %";
    lastUpdatedEl.textContent = "Last Updated: --";
    return;
  }

  temperatureEl.textContent = `🌡️ Temperature: ${data.temperature} °C`;
  humidityEl.textContent = `💧 Humidity: ${data.humidity} %`;

  const time = new Date(data.timestamp || Date.now());
  lastUpdatedEl.textContent = `Last Updated: ${time.toLocaleString()}`;
});


  temperatureEl.textContent = `🌡️ Temperature: ${data.temperature} °C`;
  humidityEl.textContent = `💧 Humidity: ${data.humidity} %`;

  const time = new Date(data.timestamp || Date.now());
  lastUpdatedEl.textContent = `Last Updated: ${time.toLocaleString()}`;

    console.log("🔥 Sensor data updated:", data);
    