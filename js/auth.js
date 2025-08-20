// 1️⃣ KONFIGURASI DAN INISIALISASI FIREBASE
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

// ▼▼▼ Fungsi untuk menampilkan navbar jika user login
function toggleNavbarVisibility(user) {
    const navbarPlaceholder = document.getElementById('navbar-placeholder');
    if (navbarPlaceholder) {
        navbarPlaceholder.style.display = user ? 'block' : 'none';
    }
    // Jika user login, pastikan navbar dimuat ulang
    if (user && !document.querySelector("#languagesDropdown")) {
        fetch("navbar.html")
            .then(res => res.text())
            .then(html => {
                navbarPlaceholder.innerHTML = html;
            });
    }
}


// 2️⃣ Fungsi Logout
function logout() {
  logUserBehavior("logout_button"); // analytics
  auth.signOut().then(() => {
    window.location.href = 'index.html';
  }).catch(error => {
    console.error('Logout Error:', error);
  });
}

// 3️⃣ Modal Login Gagal
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

  const bsModal = new bootstrap.Modal(modalDiv);
  bsModal.show();
}

// 4️⃣ Login dengan Redirect
document.addEventListener('DOMContentLoaded', () => {
  const pageLoader = document.getElementById("page-loader");
  const loginContainer = document.getElementById("loginContainer");
  const mainContent = document.getElementById("mainContent"); // ✅ pastikan id sama dengan HTML

  const loginBtn = document.getElementById("loginBtn");
  if (loginBtn) {
    loginBtn.onclick = () => {
      logUserBehavior("login_button");
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithRedirect(provider).catch(error => {
        console.error("Login Gagal:", error);
        showLoginFailModal();
      });
    };
  }

  // 5️⃣ Tangani hasil redirect
  auth.getRedirectResult()
    .then(result => {
      if (result.user) {
        console.log("Login berhasil via redirect:", result.user.displayName);
      }
    })
    .catch(error => {
      console.error("Error redirect:", error);
      showLoginFailModal();
    });

  // 6️⃣ Pantau perubahan status login
  auth.onAuthStateChanged(user => {
    toggleNavbarVisibility(user);

    if (pageLoader) pageLoader.classList.add('d-none'); // atau gunakan animasi loader
    if (user) {
      if (mainContent) mainContent.classList.remove('d-none');
      if (loginContainer) loginContainer.classList.add('d-none');

      const welcomeMessage = document.getElementById("welcome-text");
      if (welcomeMessage && user.displayName) {
        welcomeMessage.textContent = `🎉 Selamat Datang, ${user.displayName}!`;
      }
    } else {
      if (loginContainer) loginContainer.classList.remove('d-none');
      if (mainContent) mainContent.classList.add('d-none');
    }
  });
});
