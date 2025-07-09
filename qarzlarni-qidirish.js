import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyACHEuejKVniBAcYExQxk23A9QD84bUaB4",
  authDomain: "new-project-6075a.firebaseapp.com",
  projectId: "new-project-6075a",
  storageBucket: "new-project-6075a.appspot.com",
  messagingSenderId: "974403904500",
  appId: "1:974403904500:web:5d4edb5db8f5432cbdcfa1",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const searchInputByNameOrId = document.getElementById('searchByNameOrIdInput');
const searchResult = document.getElementById('searchByCodeResult');
const selectedUsersList = document.getElementById('selectedUsersList');

// --- Tanlanganlarni yuklash ---
async function loadSelectedUsers() {
  selectedUsersList.innerHTML = '';
  const snapshot = await getDocs(collection(db, "selectedUsers"));
  snapshot.forEach(docu => {
    const user = docu.data();
    // Kartochka yasash
    const card = document.createElement('div');
    card.className = 'flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow p-4 my-2 w-full';
    card.innerHTML = `
      <div class="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white text-xl font-bold">${user.initials}</div>
      <div class="flex-1">
        <div class="font-bold text-md text-black">${user.name}</div>
        <div class="text-xs text-gray-400">ID: <span class="font-mono">${user.code}</span></div>
      </div>
      <button class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded font-semibold transition">O‘chirish</button>
    `;
    card.querySelector('button').onclick = async () => {
      await deleteDoc(doc(db, "selectedUsers", docu.id));
      loadSelectedUsers();
    };
    selectedUsersList.appendChild(card);
  });
}

// --- Qo‘shish bosilganda Firebase’ga yozish ---
if (searchInputByNameOrId && searchResult) {
  searchInputByNameOrId.addEventListener('input', async function () {
    const searchValue = this.value.trim().toLowerCase();
    searchResult.innerHTML = '';
    if (!searchValue) return;

    // Foydalanuvchilarni Firestore'dan olish
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = [];
    usersSnapshot.forEach(doc => {
      const data = doc.data();
      users.push({
        id: doc.id,
        name: data.name || '',
        code: data.code || '',
      });
    });

    // Qidiruv bo‘yicha filtrlash
    const filtered = users.filter(user =>
      user.name.toLowerCase().includes(searchValue) ||
      user.code.toLowerCase().includes(searchValue)
    );

    if (filtered.length === 0) {
      searchResult.innerHTML = '<div class="text-gray-400 mt-2">Foydalanuvchi topilmadi</div>';
      return;
    }

    filtered.forEach(user => {
      // Avatardan faqat bosh harflar olinadi
      const initials = user.name
        .split(' ')
        .map(w => w[0]?.toUpperCase() || '')
        .join('')
        .slice(0, 2);

      const card = document.createElement('div');
      card.className = 'flex items-center gap-4 bg-white border border-gray-200 rounded-xl shadow p-4 my-2 w-full';

      card.innerHTML = `
        <div class="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white text-2xl font-bold">${initials}</div>
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="font-bold text-lg text-black">${user.name}</span>
            <span class="text-xs text-gray-400 font-mono">#${user.code.slice(-3)}</span>
            <span class="ml-2 flex items-center bg-yellow-400 text-white text-sm font-semibold px-2 py-1 rounded-full"><svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.122-6.545L.488 6.91l6.561-.955L10 0l2.951 5.955 6.561.955-4.756 4.635 1.122 6.545z"/></svg>3.5</span>
          </div>
          <div class="text-xs text-gray-400 mt-1">ID: <span class="font-mono">${user.code}</span></div>
        </div>
        <button class="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold transition">Qo‘shish</button>
      `;

      card.querySelector('button').onclick = async () => {
        // Avvaldan tanlanganini tekshirish
        const q = query(collection(db, "selectedUsers"), where("code", "==", user.code));
        const exists = (await getDocs(q)).size > 0;
        if (exists) {
          alert("Bu foydalanuvchi allaqachon tanlangan!");
          return;
        }
        await addDoc(collection(db, "selectedUsers"), {
          name: user.name,
          code: user.code,
          initials: initials
        });
        loadSelectedUsers();
      };

      searchResult.appendChild(card);
    });
  });
}

// Sahifa yuklanganda tanlanganlarni yuklash
loadSelectedUsers();
