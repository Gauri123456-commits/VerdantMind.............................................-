// === community.js ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/10.3.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAY6c_h30Ge5mQIBM6Qu0tcJNAWuaIfrgY",
  authDomain: "verdantminds-26aa7.firebaseapp.com",
  projectId: "verdantminds-26aa7",
  storageBucket: "verdantminds-26aa7.appspot.com",
  messagingSenderId: "332964884712",
  appId: "1:332964884712:web:eac7a0475b2bc53804195d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uid = localStorage.getItem("uid") || "guest";

const postForm = document.getElementById("postForm");
const postContent = document.getElementById("postContent");
const imageUpload = document.getElementById("imageUpload");
const imagePreview = document.getElementById("imagePreview");
const imagePreviewContainer = document.getElementById("imagePreviewContainer");
const tags = document.getElementById("tags");
const postsContainer = document.getElementById("postsContainer");

let selectedImageFile = null;

if (imageUpload) {
  imageUpload.addEventListener("change", () => {
    const file = imageUpload.files[0];
    if (file && file.type.startsWith("image/")) {
      selectedImageFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        imagePreview.src = reader.result;
        imagePreviewContainer.classList.remove("hidden");
      };
      reader.readAsDataURL(file);
    }
  });
}

if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = postContent.value.trim();
    const selectedTags = Array.from(tags.selectedOptions).map(opt => opt.value);
    if (!content) return alert("Please write something before posting.");

    let imageURL = null;
    if (selectedImageFile) {
      const formData = new FormData();
      formData.append("image", selectedImageFile);
      try {
        const res = await fetch(`https://api.imgbb.com/1/upload?key=8a9c2f436a0b8c298dcd93545c629171`, {
          method: "POST",
          body: formData
        });
        const data = await res.json();
        imageURL = data.data.url;
      } catch (err) {
        console.error("Image upload failed:", err);
        alert("Image upload failed");
      }
    }

    const postData = {
      content,
      tags: selectedTags,
      imageURL,
      createdAt: serverTimestamp(),
      uid,
      likes: [],
      comments: []
    };

    await addDoc(collection(db, "community_posts"), postData);
    postForm.reset();
    imagePreviewContainer.classList.add("hidden");
    selectedImageFile = null;
  });
}

function renderPost(postDoc) {
  const post = postDoc.data();
  const postId = postDoc.id;

  const div = document.createElement("div");
  div.className = "bg-white p-4 rounded shadow relative";

  if (post.uid === uid) {
    const delBtn = document.createElement("button");
    delBtn.innerHTML = "🗑";
    delBtn.className = "absolute right-4 top-2 text-lg text-red-500 hover:text-red-700";
    delBtn.onclick = async () => {
      await deleteDoc(doc(db, "community_posts", postId));
    };
    div.appendChild(delBtn);
  }

  const p = document.createElement("p");
  p.textContent = post.content;
  div.appendChild(p);

  if (post.imageURL) {
    const img = document.createElement("img");
    img.src = post.imageURL;
    img.className = "w-full mt-2 rounded";
    div.appendChild(img);
  }

  if (post.tags?.length) {
    const tagWrap = document.createElement("div");
    tagWrap.className = "mt-2 flex flex-wrap gap-2 text-sm text-green-700";
    post.tags.forEach(tag => {
      const span = document.createElement("span");
      span.textContent = `#${tag}`;
      tagWrap.appendChild(span);
    });
    div.appendChild(tagWrap);
  }

  // Like Button
  const likeBtn = document.createElement("button");
  likeBtn.innerHTML = `❤ ${post.likes?.length || 0}`;
  likeBtn.className = `mt-4 mr-4 ${post.likes?.includes(uid) ? "text-red-500" : "text-gray-500"}`;
  likeBtn.onclick = async () => {
    const postRef = doc(db, "community_posts", postId);
    const action = post.likes?.includes(uid) ? arrayRemove(uid) : arrayUnion(uid);
    await updateDoc(postRef, { likes: action });
  };

  // Share Button
  const shareBtn = document.createElement("button");
  shareBtn.textContent = "Share via WhatsApp";
  shareBtn.className = "text-blue-600 hover:underline";
  shareBtn.onclick = () => {
    const url = encodeURIComponent(post.imageURL || location.href);
    const text = encodeURIComponent(post.content);
    const whatsappUrl = `https://wa.me/?text=${text}%20${url}`;
    window.open(whatsappUrl, '_blank');
  };

  // Comment Section
  const commentForm = document.createElement("form");
  commentForm.className = "mt-4 flex gap-2";
  const commentInput = document.createElement("input");
  commentInput.placeholder = "Write a comment...";
  commentInput.className = "border p-2 rounded flex-1";
  const commentSubmit = document.createElement("button");
  commentSubmit.textContent = "Post";
  commentSubmit.className = "bg-green-600 text-white px-4 py-2 rounded";
  commentForm.append(commentInput, commentSubmit);

  const commentList = document.createElement("div");
  commentList.className = "mt-2 space-y-1 text-sm";
  post.comments?.forEach(c => {
    const comment = document.createElement("div");
    comment.textContent = c.text;
    commentList.appendChild(comment);
  });

  commentForm.onsubmit = async (e) => {
    e.preventDefault();
    const text = commentInput.value.trim();
    if (!text) return;
    const postRef = doc(db, "community_posts", postId);
    await updateDoc(postRef, {
      comments: arrayUnion({ uid, text, createdAt: new Date().toISOString() })
    });
    commentInput.value = "";
  };

  const actions = document.createElement("div");
  actions.className = "mt-4 flex gap-6";
  actions.append(likeBtn, shareBtn);

  div.append(actions, commentList, commentForm);
  postsContainer.appendChild(div);
}

const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"));
onSnapshot(q, (snapshot) => {
  postsContainer.innerHTML = "";
  snapshot.forEach(doc => renderPost(doc));
});
