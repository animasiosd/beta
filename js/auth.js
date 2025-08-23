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

// ============================
// 2️⃣ FUNGSI TAMPILKAN NAVBAR
// ============================
function toggleNavbarVisibility(user) {
  const navbarPlaceholder = document.getElementById("navbar-placeholder");
  if (!navbarPlaceholder) return;

  navbarPlaceholder.style.display = user ? "block" : "none";

  if (user && !document.querySelector("#languagesDropdown")) {
    fetch("navbar.html")
      .then(res => res.text())
      .then(html => {
        navbarPlaceholder.innerHTML = html;
      });
  }
}

// ============================
// 3️⃣ LOGOUT USER
// ============================
function logout() {
  try { logUserBehavior("logout_button"); } catch {}
  auth.signOut()
    .then(() => {
      window.location.href = "https://animasiosd.github.io/beta/login";
    })
    .catch(error => console.error("Logout Error:", error));
}

// ============================
// 4️⃣ MODAL LOGIN GAGAL
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
  const loginContainer = document.getElementById("loginContainer");
  const pageLoader = document.getElementById("page-loader");
  const mainContent = document.getElementById("mainContent");
  const loginBtn = document.getElementById("loginBtn");

  // Tombol Login Google
  if (loginBtn) {
    loginBtn.onclick = () => {
      try { logUserBehavior("login_button"); } catch {}
      const provider = new firebase.auth.GoogleAuthProvider();

      auth.signInWithPopup(provider)
        .then(result => {
          const user = result.user;
          console.log("Login berhasil:", user.displayName);

          toggleNavbarVisibility(user);
          if (mainContent) mainContent.classList.remove("d-none");
          if (loginContainer) loginContainer.classList.add("d-none");

          const welcomeMessage = document.getElementById("welcome-text");
          if (welcomeMessage && user.displayName) {
            welcomeMessage.textContent = `🎉 Selamat Datang, ${user.displayName}!`;
          }

          // Redirect ke halaman utama agar URL bersih
          window.location.href = "https://animasiosd.github.io/beta/index.html";
        })
        .catch(error => {
          console.error("Login Gagal:", error);
          showLoginFailModal(error.message);
        });
    };
  }

  // ============================
  // 6️⃣ CEK STATUS LOGIN
  // ============================
  auth.onAuthStateChanged(user => {
    const currentPath = window.location.pathname;

    // Jika user BELUM login → paksa ke halaman login
    if (!user && !currentPath.endsWith("/beta/login")) {
      window.location.href = "https://animasiosd.github.io/beta/login";
      return;
    }

    // Jika user SUDAH login dan berada di halaman login → pindahkan ke halaman utama
    if (user && currentPath.endsWith("/beta/login")) {
      window.location.href = "https://animasiosd.github.io/beta/index.html";
      return;
    }

    toggleNavbarVisibility(user);

    // Loader hilang setelah status login dicek
    if (pageLoader) pageLoader.classList.add("d-none");

    // Update tampilan konten
    if (user) {
      if (mainContent) mainContent.classList.remove("d-none");
      if (loginContainer) loginContainer.classList.add("d-none");

      const welcomeMessage = document.getElementById("welcome-text");
      if (welcomeMessage && user.displayName) {
        welcomeMessage.textContent = `🎉 Selamat Datang, ${user.displayName}!`;
      }
    } else {
      if (loginContainer) loginContainer.classList.remove("d-none");
      if (mainContent) mainContent.classList.add("d-none");
    }
  });
});
