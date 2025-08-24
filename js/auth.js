// ============================
// 1️⃣ KONFIGURASI FIREBASE
// ============================
const firebaseConfig = {
  apiKey: "AIzaSyCAOg2aMzFVCQVx07t85lFpTXv3c2ugL1E",
  authDomain: "animasiosd-github.firebaseapp.com",
  projectId: "animasiosd-github",
  storageBucket: "animasiosd-github.appspot.com",
  messagingSenderId: "424179260770",
  appId: "1:424179260770:web:2f4a04a8c9643027bca03b",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Ambil elemen-elemen utama di halaman (disamakan dengan ID yang dipakai di HTML)
const pageLoader = document.getElementById("page-loader");
const loginContainer = document.getElementById("loginContainer");
const mainContent = document.getElementById("mainContent");

// Ambil status izin lokasi dari localStorage (snapshot awal; untuk cek realtime gunakan getLocationStatus())
const locationStatus = localStorage.getItem("locationPermission"); // [INFO]

// Flag supaya navbar tidak di-fetch berulang
let navbarLoaded = false;

// URL helper
const URLS = {
  login: "https://animasiosd.github.io/beta/login",
  index: "https://animasiosd.github.io/beta/index.html", // bisa diganti ke .../beta/ jika ingin URL bersih
  tutorial: "https://animasiosd.github.io/beta/locationtutorial.html",
};

// Fungsi untuk redirect halaman
function redirectTo(url) {
  window.location.href = url;
}

// Helper status izin lokasi (selalu ambil fresh)
function getLocationStatus() {
  return localStorage.getItem("locationPermission"); // "granted" | "denied" | null
}

// ============================
// 3️⃣ LOGOUT USER
// ============================
function logout() {
  try { logUserBehavior("logout_button"); } catch {}
  auth
    .signOut()
    .then(() => {
      window.location.href = URLS.login;
    })
    .catch((error) => console.error("Logout Error:", error));
}

// ============================
// 4️⃣ MODAL LOGIN GAGAL (TETAP ADA, TIDAK DIUBAH STRUKTURNYA)
// ============================
function showLoginFailModal(message = "Login gagal. Silakan coba lagi.") {
  let existingModal = document.getElementById("loginFailModal");
  if (existingModal) existingModal.remove();

  const modalDiv = document.createElement("div");
  modalDiv.id = "loginFailModal";
  modalDiv.className = "modal fade";
  modalDiv.tabIndex = -1;
  modalDiv.setAttribute("aria-hidden", "true");
  modalDiv.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">Login Gagal</h5>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">${message}</div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);

  try {
    if (window.bootstrap && bootstrap.Modal) {
      new bootstrap.Modal(modalDiv).show();
    } else {
      modalDiv.classList.add("show");
      modalDiv.style.display = "block";
      modalDiv.setAttribute("aria-modal", "true");
      modalDiv.removeAttribute("aria-hidden");
    }
  } catch (e) {
    console.error("Gagal menampilkan modal:", e);
  }
}

// ============================
// 5️⃣ LOGIN GOOGLE
// ============================
document.addEventListener("DOMContentLoaded", () => {
  // ambil ulang elemen (tetap dipertahankan sesuai struktur awal)
  const loginContainer = document.getElementById("loginContainer");
  const pageLoader = document.getElementById("page-loader");
  const mainContent = document.getElementById("mainContent");
  const loginBtn = document.getElementById("loginBtn");

  // Tombol Login Google
  if (loginBtn) {
    loginBtn.onclick = () => {
      try { logUserBehavior("login_button"); } catch {}
      const provider = new firebase.auth.GoogleAuthProvider();

      auth
        .signInWithPopup(provider)
        .then((result) => {
          const user = result.user;
          console.log("Login berhasil:", user.displayName);

          if (mainContent) mainContent.classList.remove("d-none");
          if (loginContainer) loginContainer.classList.add("d-none");

          const welcomeMessage = document.getElementById("welcome-text");
          if (welcomeMessage && user.displayName) {
            welcomeMessage.textContent = `🎉 Selamat Datang, ${user.displayName}!`;
          }

          // Redirect pasca-login:
          // - Jika lokasi sudah "granted" -> ke halaman utama
          // - Jika belum -> ke halaman tutorial lokasi (tidak memicu geolocation otomatis)
          const statusNow = getLocationStatus();
          if (statusNow === "granted") {
            window.location.href = URLS.index; // bisa diganti URLS.index => https://.../beta/
          } else {
            window.location.href = URLS.tutorial;
          }
        })
        .catch((error) => {
          console.error("Login Gagal:", error);
          showLoginFailModal(error.message);
        });
    };
  }

  // ============================
  // 6️⃣ CEK STATUS LOGIN
  // ============================
  auth.onAuthStateChanged((user) => {
    const currentPath = window.location.pathname;

    // helper deteksi halaman
    const onLoginPage = currentPath.endsWith("/beta/login") || currentPath.endsWith("/beta/login/");
    const onTutorialPage = currentPath.endsWith("/beta/locationtutorial.html") || currentPath.endsWith("/beta/locationtutorial/");
    const onIndexPage =
      currentPath.endsWith("/beta/") ||
      currentPath.endsWith("/beta/index.html") ||
      currentPath.endsWith("/beta/index");

    // 1) Jika user BELUM login → paksa ke halaman login (dari halaman mana pun)
    if (!user) {
      if (!onLoginPage) {
        redirectTo(URLS.login);
        return;
      }
      hideLoader();
      return;
    }

    // 2) Jika user SUDAH login tapi lokasi BELUM "granted" → arahkan ke tutorial (kecuali sudah di situ)
    const statusNow = getLocationStatus();
    if (statusNow !== "granted" && !onTutorialPage) {
      redirectTo(URLS.tutorial);
      return;
    }

    // 3) Jika user SUDAH login & berada di halaman login → kirim ke halaman utama
    if (user && onLoginPage) {
      redirectTo(URLS.index); // bisa diganti ke https://animasiosd.github.io/beta/ untuk URL bersih
      return;
    }

    // 4) Jika lolos kondisi, user SUDAH login & lokasi OK
    handleLoggedInState(user);
  });

  // [Tetap dalam struktur ini] — atur tampilan saat sudah login
  function handleLoggedInState(user) {
    if (pageLoader) pageLoader.classList.add("d-none");

    if (mainContent) mainContent.classList.remove("d-none");
    if (loginContainer) loginContainer.classList.add("d-none");

    const welcomeMessage = document.getElementById("welcome-text");
    if (welcomeMessage && user.displayName) {
      welcomeMessage.textContent = `🎉 Selamat Datang, ${user.displayName}!`;
    }
  }

  // [Tetap dalam struktur ini] — sembunyikan loader saat belum login
  function hideLoader() {
    if (pageLoader) pageLoader.classList.add("d-none");
    if (loginContainer) loginContainer.classList.remove("d-none");
    if (mainContent) mainContent.classList.add("d-none");
  }
});
