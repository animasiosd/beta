// File: js/main.js - Versi Final yang Diperbaiki

const BAHASA_API_URL = "https://script.google.com/macros/s/AKfycbwCT57fhlebRz7nKvvtmPxjKrR54-mQU3syiuRqspHX9nRubS-gg7RYkHybOlIwxdhyTg/exec";

// Listener utama yang akan berjalan di setiap halaman
document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 Memulai proses pemuatan navbar...");
  const navbarPlaceholder = document.getElementById("navbar-placeholder");
  if (!navbarPlaceholder) {
    console.warn("🟡 Placeholder navbar tidak ditemukan di halaman ini. Proses dihentikan.");
    return;
  }

  // Coba muat dari cache dulu untuk kecepatan
  console.log("🔍 Mengecek cache untuk 'navbarHTML'...");
  const cachedNavbar = localStorage.getItem('navbarHTML');
  if (cachedNavbar) {
    console.log("✅ Navbar berhasil dimuat dari cache.");
    navbarPlaceholder.innerHTML = cachedNavbar;
    initializeNavbarFunctions(); // Panggil fungsi setelah render dari cache
  } else {
    console.log("⚪️ Cache 'navbarHTML' kosong.");
  }

  // Tetap fetch versi terbaru dari server
  console.log("🌐 Memulai fetch 'navbar.html' dari server...");
  fetch('navbar.html')
    .then(res => {
      if (!res.ok) throw new Error(`Gagal memuat navbar. Status: ${res.status}`);
      console.log("👍 Fetch 'navbar.html' berhasil diterima.");
      return res.text();
    })
    .then(html => {
      // Hanya update DOM jika ada perubahan
      if (html !== cachedNavbar) {
        console.log("✨ Konten navbar baru ditemukan, memperbarui DOM dan menyimpan ke cache.");
        navbarPlaceholder.innerHTML = html;
        localStorage.setItem('navbarHTML', html);
      } else {
        console.log("👌 Konten navbar dari server sama dengan cache, tidak ada pembaruan DOM.");
      }
      initializeNavbarFunctions(); // Panggil fungsi setelah render dari fetch
    })
    .catch(err => {
      console.error("❌ Terjadi kesalahan saat fetch navbar:", err);
    });
});

// Fungsi untuk menginisialisasi semua fungsionalitas navbar
function initializeNavbarFunctions() {
  // Pastikan fungsi-fungsi ini hanya dipanggil sekali
  if (window.navbarInitialized) return;

  // PENTING: Pastikan file auth.js sudah dimuat SEBELUM main.js di file HTML Anda
  // agar fungsi ini bisa ditemukan.
  if (typeof toggleNavbarVisibility === 'function') {
    toggleNavbarVisibility(firebase.auth().currentUser);
  } else {
    console.error('❌ Fungsi toggleNavbarVisibility tidak ditemukan. Periksa urutan load script di HTML.');
  }
  
  highlightActiveMenu();
  loadDynamicLanguages();
  
  // Inisialisasi fungsionalitas video jika di halaman yang tepat
  if (typeof initPage === 'function') {
      initPage();
  }

  window.navbarInitialized = true; // Tandai bahwa inisialisasi sudah selesai
}

// Fungsi untuk menandai menu aktif
function highlightActiveMenu() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll('a[data-page]').forEach(link => {
    if (link.getAttribute('data-page') === currentPage) {
      link.classList.add('active');
    }
  });
}

// Fungsi untuk memuat daftar bahasa secara dinamis
function loadDynamicLanguages() {
  return new Promise((resolve, reject) => {
    const dropdown = document.getElementById('languagesDropdown');
    if (!dropdown) {
      console.error("❌ Element #languagesDropdown tidak ditemukan.");
      return reject("Element #languagesDropdown tidak ditemukan");
    }

    fetch(BAHASA_API_URL)
      .then(response => response.json())
      .then(data => {
        const bahasaList = data;
        if (!Array.isArray(bahasaList) || bahasaList.length === 0) {
          dropdown.innerHTML = '<li><span class="dropdown-item text-muted">Daftar bahasa kosong.</span></li>';
          return resolve();
        }

        dropdown.innerHTML = ''; // Kosongkan placeholder

        bahasaList.forEach(bahasa => {
          if (!bahasa.value || !bahasa.display) return;
          const listItem = document.createElement('li');
          const link = document.createElement('a');
          link.className = 'dropdown-item language-btn';
          link.href = `halaman-bahasa.html?bahasa=${encodeURIComponent(bahasa.value)}`;
          // Menggunakan format yang benar untuk teks
          link.textContent = `Bahasa ${bahasa.display}`; 
          link.addEventListener("click", () => {
            logUserBehavior("language_selected", bahasa.display);
          });
          listItem.appendChild(link);
          dropdown.appendChild(listItem);
        });
        resolve();
      })
      .catch(err => {
        console.error("❌ Gagal memuat bahasa:", err);
        dropdown.innerHTML = '<li><span class="dropdown-item text-danger">Gagal memuat bahasa.</span></li>';
        reject(err);
      });
  });
}