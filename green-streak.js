// green-streak.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, set, get, update, remove } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const userId = "user123"; // Replace this with dynamic user ID after login

const uploadForm = document.getElementById("uploadForm");
const plantInput = document.getElementById("plantImage");
const progressText = document.getElementById("progressText");
const progressBar = document.getElementById("progressBar");
const watchBtn = document.getElementById("watchBtn");
const notification = document.getElementById("notification");
const galleryContainer = document.getElementById("galleryContainer");
const timelapseVideo = document.getElementById("timelapseVideo");

const storyRef = ref(db, `stories/${userId}`);

async function loadGreenStreakGallery() {
  galleryContainer.innerHTML = "";
  const snapshot = await get(storyRef);
  const data = snapshot.val();
  const today = new Date().toISOString().split("T")[0];
  let validImages = [];

  if (data) {
    for (const [key, value] of Object.entries(data)) {
      if (value.type === "greenStreak" && value.url) {
        try {
          const check = await fetch(value.url, { method: "HEAD" });
          if (check.ok) {
            validImages.push([key, value]);
          } else {
            await remove(ref(db, `stories/${userId}/${key}`));
          }
        } catch (err) {
          await remove(ref(db, `stories/${userId}/${key}`));
        }
      }
    }

    validImages.sort((a, b) => parseInt(a[0].replace("day", "")) - parseInt(b[0].replace("day", "")));
  }

  const count = validImages.length;
  progressText.innerText = `${count} / 10 Days`;
  progressBar.style.width = `${(count / 10) * 100}%`;

  if (count > 0) {
    const lastEntry = validImages[count - 1][1];
    const lastDate = new Date(lastEntry.timestamp);
    const now = new Date();
    const diffDays = (now - lastDate) / (1000 * 3600 * 24);
    if (diffDays >= 1.5) notification.classList.remove("hidden");
  }

  validImages.forEach(([key, value]) => {
    const wrapper = document.createElement("div");
    wrapper.className = "relative inline-block m-1";

    const img = document.createElement("img");
    img.src = value.url;
    img.className = "w-32 h-32 object-cover border border-green-300 rounded";

    const delBtn = document.createElement("button");
    delBtn.innerText = "✖";
    delBtn.className = "absolute top-1 right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded hover:bg-red-700";
    delBtn.onclick = async () => {
      await remove(ref(db, `stories/${userId}/${key}`));
      alert("Image deleted.");
      loadGreenStreakGallery();
    };

    wrapper.appendChild(img);
    wrapper.appendChild(delBtn);
    galleryContainer.appendChild(wrapper);
  });

  if (count === 10) {
    watchBtn.classList.remove("hidden");
    watchBtn.addEventListener("click", () => createTimelapse(validImages.map(([_, v]) => v.url)));
  }
}

loadGreenStreakGallery();

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const file = plantInput.files[0];
  if (!file) return alert("Please select an image.");
  const today = new Date().toISOString().split("T")[0];

  const timestampedBlob = await drawTimestamp(file);
  const imageUrl = await uploadToImgBB(timestampedBlob);

  const snapshot = await get(storyRef);
  const data = snapshot.val();
  const count = Object.values(data || {}).filter(d => d.type === "greenStreak").length;

  await set(ref(db, `stories/${userId}/day${count + 1}`), {
    url: imageUrl,
    timestamp: new Date().toISOString(),
    type: "greenStreak"
  });

  alert("Image uploaded successfully!");
  window.location.reload();
});

async function drawTimestamp(file) {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = new Image();
      img.src = e.target.result;
      img.onload = function () {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText(new Date().toLocaleString(), 20, img.height - 30);
        canvas.toBlob(blob => resolve(blob), "image/jpeg");
      };
    };
    reader.readAsDataURL(file);
  });
}

async function uploadToImgBB(imageBlob) {
  const formData = new FormData();
  formData.append("image", imageBlob);
  formData.append("album", "fVhn6P");

  const res = await fetch("https://api.imgbb.com/1/upload?key=9b1bc1610ee161c683108556bff3881c", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data.data.url;
}

// Optional: Timelapse Creation Stub
function createTimelapse(imageUrls) {
  alert("Timelapse generation is not implemented yet.");
  // You can add the FFmpeg logic here as discussed earlier.
}
