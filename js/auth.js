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

// Navbar otomatis dimuat saat login
function toggleNavbarVisibility(user) {
  const navbarPlaceholder = document.getElementById('navbar-placeholder');
  if (navbarPlaceholder) {
    navbarPlaceholder.style.display = user ? 'block' : 'none';
  }
  if (user && !document.querySelector("#languagesDropdown")) {
    fetch("navbar.html")
      .then(res => res.text())
      .then(html => {
        navbarPlaceholder.innerHTML = html;
      });
  }
}

// 2️⃣ Logout
function logout() {
  try { logUserBehavior("logout_button"); } catch {}
  auth.signOut().then(() => {
    window.location.href = 'index.html';
  }).catch(error => {
    console.error('Logout Error:', error);
  });
}

// Login dengan Google Redirect
document.addEventListener('DOMContentLoaded', () => {
  const loginContainer = document.getElementById("loginContainer");
  const mainContent = document.getElementById("mainContent");
  const loginBtn = document.getElementById("loginBtn");

  // Tombol Login
  if (loginBtn) {
    loginBtn.onclick = () => {
      logUserBehavior("login_button");
      localStorage.setItem("redirectAfterLogin", window.location.href);
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithRedirect(provider).catch(error => {
        console.error("Login Gagal:", error);
      });
    };
  }

  // Tangani hasil redirect
  auth.getRedirectResult()
    .then(result => {
      if (result.user) {
        const redirectUrl = localStorage.getItem("redirectAfterLogin");
        if (redirectUrl) {
          localStorage.removeItem("redirectAfterLogin");
          window.location.href = redirectUrl;
        }
      }
    })
    .catch(error => console.error("Error redirect:", error));

// 3️⃣ Modal Login Gagal (fallback jika bootstrap belum siap)
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
      // fallback sederhana
      modalDiv.classList.add('show');
      modalDiv.style.display = 'block';
      modalDiv.setAttribute('aria-modal', 'true');
      modalDiv.removeAttribute('aria-hidden');
    }
  } catch (e) {
    console.error("Gagal menampilkan modal:", e);
  }
}

  // 6️⃣ Update UI berdasar status login (tanpa paksa pindah halaman)
  auth.onAuthStateChanged(user => {
    toggleNavbarVisibility(user);

    if (pageLoader) pageLoader.classList.add('d-none');

    if (user) {
      if (mainContent)    mainContent.classList.remove('d-none');
      if (loginContainer) loginContainer.classList.add('d-none');

      const welcomeMessage = document.getElementById("welcome-text");
      if (welcomeMessage && user.displayName) {
        welcomeMessage.textContent = `🎉 Selamat Datang, ${user.displayName}!`;
      }
    } else {
      if (loginContainer) loginContainer.classList.remove('d-none');
      if (mainContent)    mainContent.classList.add('d-none');
    }
  });
});
