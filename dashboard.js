import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAY6c_h30Ge5mQIBM6Qu0tcJNAWuaIfrgY",
  authDomain: "verdantminds-26aa7.firebaseapp.com",
  databaseURL: "https://verdantminds-26aa7-default-rtdb.firebaseio.com",
  projectId: "verdantminds-26aa7",
  storageBucket: "verdantminds-26aa7.firebasestorage.app",
  messagingSenderId: "332964884712",
  appId: "1:332964884712:web:eac7a0475b2bc53804195d",
  measurementId: "G-ZRLX2JSYVZ"
};


// ImgBB API Key
const imgbbApiKey = "9b1bc1610ee161c683108556bff3881c";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const plantCollection = collection(db, "identifiedPlants");

const identifyBtn = document.getElementById("identifyBtn");
const imageUpload = document.getElementById("imageUpload");
const resultDiv = document.getElementById("result");
const plantTypeSelect = document.getElementById("plantType");

const moistureData = {
  "Herbs": { start: 30, stop: 40 },
  "Shrubs": { start: 25, stop: 35 },
  "Trees": { start: 25, stop: 35 },
  "Climbers": { start: 30, stop: 40 },
  "Creepers": { start: 35, stop: 45 },
  "Desert": { start: 10, stop: 15 },
  "Terrestrial": { start: 25, stop: 35 },
  "Epiphytes": { start: 40, stop: 50, note: "Requires humidity" },
  "Mangroves": { start: 100, stop: 100, note: "Waterlogged (saline) conditions" },
  "Ornamental": { start: 30, stop: 40 },
  "Medicinal": { start: 25, stop: 35 },
  "Food Crops": { start: 25, stop: 40 },
  "Aromatic": { start: 30, stop: 40 },
  "Timber Plants": { start: 20, stop: 30 },
  "Annuals": { start: 35, stop: 40 },
  "Biennials": { start: 30, stop: 40 },
  "Perennials": { start: 25, stop: 35 },
  "Full Sun Plants": { start: 25, stop: 35 },
  "Partial Shade": { start: 30, stop: 40 },
  "Full Shade": { start: 35, stop: 45 },
  "Indoor Plants": { start: 35, stop: 45 },
  "Outdoor Plants": { start: 30, stop: 35 },
  "Angiosperms": { start: 25, stop: 40 },
  
  "Gymnosperms": { start: 20, stop: 30 },
  "Pteridophytes": { start: 40, stop: 100, note: "Requires >40%" },
  "Bryophytes": { start: 60, stop: 100, note: "Requires >60%" },
  "Nitrogen fixing plants": { start: 30, stop: 40 },
  "Monocots": { start: 25, stop: 35 },
  "Dicots": { start: 25, stop: 40 },
  "Cryptogams": { start: 60, stop: 100, note: "Requires ≥60%" },
  "Phanerogams": { start: 25, stop: 40 },
  "Native Plants": { start: 30, stop: 35 },
  "Exotic Plants": { start: 35, stop: 40 },
  "Invasive Plants": { start: 25, stop: 35 },
  "Tropical Plants": { start: 40, stop: 100, note: "Requires >40%" },
  "Temperate Plants": { start: 25, stop: 35 },
  "Cold-Climate Plants": { start: 25, stop: 30 },
  "Dye-yielding Plants": { start: 30, stop: 35 },
  "Diurnal Plants": { start: 25, stop: 35 },
  "Nocturnal Plants": { start: 30, stop: 40 },
  "Insectivorous": { start: 40, stop: 100, note: "Requires moist soil" },
  "Allelopathic Plants": { start: 20, stop: 30 }
};

// 🔍 Load saved plant cards on page load
window.addEventListener("DOMContentLoaded", async () => {
  const q = query(plantCollection, orderBy("timestamp", "desc"));
  const snapshot = await getDocs(q);
  snapshot.forEach((doc) => {
    const plant = doc.data();
    const moistureHTML = plant.moisture
      ? `<p class="text-blue-600 text-sm">💧 Start: ${plant.moisture.start}% | Stop: ${plant.moisture.stop}%<br><span class="italic">${plant.moisture.note || ""}</span></p>`
      : `<p class="text-red-500 text-sm">No moisture data available</p>`;
    addPlantCard(plant.name, plant.type, moistureHTML, plant.imageUrl);
  });
});

identifyBtn.addEventListener("click", async () => {
  const file = imageUpload.files[0];
  const selectedPlantType = plantTypeSelect.value || "Not specified";

  if (!file) {
    alert("Please upload an image.");
    return;
  }

  const imgbbUrl = await uploadToImgBB(file);
  if (!imgbbUrl) {
    alert("Image upload failed.");
    return;
  }

  try {
    const base64 = await toBase64(file);

    // Send to Plant.id
    const response = await fetch("https://api.plant.id/v2/identify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": "opYJCSWgKvgXYh6ZW2TcmhhuJwQq23tK9tSuMzK8DKICab2YPL"
      },
      body: JSON.stringify({
        images: [base64],
        modifiers: ["crops_fast", "similar_images"],
        plant_language: "en",
        plant_details: ["common_names", "url"]
      })
    });

    const data = await response.json();
    const plantName = data?.suggestions?.[0]?.plant_name || "Unknown";
    const displayName = data?.suggestions?.[0]?.plant_details?.common_names?.[0] || plantName;

    const moisture = moistureData[selectedPlantType];
    const moistureHTML = moisture
      ? `<p class="text-blue-600 text-sm">💧 Start: ${moisture.start}% | Stop: ${moisture.stop}%<br><span class="italic">${moisture.note || ""}</span></p>`
      : `<p class="text-red-500 text-sm">No moisture data available</p>`;

    // Show on screen
    resultDiv.innerHTML = `
      <h2 class="text-xl font-bold">🌿 ${displayName}</h2>
      <p class="text-green-700">🌱 ${selectedPlantType}</p>
      <img src="${imgbbUrl}" class="w-60 mx-auto mt-2 mb-4 rounded shadow" />
      ${moistureHTML}
    `;

    // Save to Firestore
    await addDoc(plantCollection, {
      name: displayName,
      type: selectedPlantType,
      imageUrl: imgbbUrl,
      moisture: moisture || null,
      timestamp: Date.now()
    });

    // Add to history
    addPlantCard(displayName, selectedPlantType, moistureHTML, imgbbUrl);

  } catch (err) {
    console.error("Plant ID API failed:", err);
    alert("Error identifying plant.");
  }
});

// Convert file to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(reader.result.replace(/^data:image\/[a-z]+;base64,/, ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Upload image to ImgBB
async function uploadToImgBB(file) {
  const form = new FormData();
  form.append("image", await toBase64(file));
  try {
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: "POST",
      body: form
    });
    const data = await res.json();
    return data?.data?.url || null;
  } catch (err) {
    console.error("ImgBB upload failed:", err);
    return null;
  }
}

// Add a plant card to history bar
function addPlantCard(name, type, moistureHTML, imageUrl) {
  const card = document.createElement("div");
  card.className = "bg-white border rounded-lg p-4 shadow w-60 flex-shrink-0";

  card.innerHTML = `
    <img src="${imageUrl}" alt="${name}" class="w-full h-48 object-cover rounded mb-3" />
    <h4 class="text-lg font-bold mb-1">${name}</h4>
    <p class="text-green-700 mb-1">${type}</p>
    ${moistureHTML}
  `;

  document.getElementById("plantCards").appendChild(card);
}
