// File: js/userLocationNotification.js

document.addEventListener("DOMContentLoaded", () => {
  // Fungsi membuat popup lokasi
  function createLocationPopup() {
    // Jika popup sudah ada, hentikan
    if (document.getElementById("location-popup")) return;

    // Buat elemen overlay popup
    const popup = document.createElement("div");
    popup.id = "location-popup";
    popup.style = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.4s ease-in-out;
    `;

    // Isi konten popup
    popup.innerHTML = `
      <div id="location-popup-content" style="
        background: white;
        padding: 25px;
        max-width: 400px;
        border-radius: 10px;
        text-align: center;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        transform: scale(0.9);
        opacity: 0;
        transition: all 0.3s ease-in-out;
      ">
        <h2 style="margin-top:0;color:#333;">Izinkan Lokasi</h2>
        <p style="color:#555;line-height:1.5;font-size:15px;">
          Untuk menggunakan aplikasi ini, kami memerlukan akses lokasi Anda.<br>
          Lokasi digunakan untuk personalisasi konten dan keamanan.
        </p>
        <button id="allow-location-btn" style="
          padding: 10px 20px;
          margin-top: 15px;
          border: none;
          background-color: #007bff;
          color: white;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
          box-shadow: 0 3px 8px rgba(0,0,0,0.2);
          transition: background-color 0.2s ease-in-out;
        ">Izinkan Lokasi</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Animasi fade-in popup
    setTimeout(() => {
      popup.style.opacity = "1";
      const content = document.getElementById("location-popup-content");
      if (content) {
        content.style.opacity = "1";
        content.style.transform = "scale(1)";
      }
    }, 50);

    // Event klik tombol izin lokasi
    document.getElementById("allow-location-btn").addEventListener("click", () => {
      checkAndRequestLocation();
    });
  }

  // Fungsi cek status izin lokasi
  function checkAndRequestLocation() {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung fitur lokasi. Silakan gunakan Google Chrome versi terbaru.");
      forceLogout();
      return;
    }

    // Cek apakah browser mendukung Permissions API
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        if (result.state === "granted") {
          // Jika user sudah izinkan → hilangkan popup
          hidePopup();
          console.log("Lokasi sudah diizinkan sebelumnya.");
        } else if (result.state === "denied") {
          // Jika user menolak sebelumnya → langsung logout
          alert("Akses lokasi wajib. Anda akan logout.");
          forceLogout();
        } else {
          // Jika masih prompt → minta lokasi
          requestUserLocation();
        }
      }).catch(() => {
        // Jika Permissions API error → fallback
        requestUserLocation();
      });
    } else {
      // Browser lama → tampilkan warning lalu logout
      alert("Browser Anda tidak mendukung fitur lokasi. Silakan gunakan Google Chrome versi terbaru.");
      forceLogout();
    }
  }

  // Fungsi minta lokasi user → memicu popup default browser
  function requestUserLocation() {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Lokasi diterima:", position.coords);
        hidePopup();
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert("Akses lokasi wajib. Anda akan logout.");
          forceLogout();
        } else {
          alert("Gagal mendapatkan lokasi. Silakan coba lagi.");
        }
      }
    );
  }

  // Fungsi animasi fade-out dan hapus popup
  function hidePopup() {
    const popup = document.getElementById("location-popup");
    const content = document.getElementById("location-popup-content");
    if (popup && content) {
      content.style.opacity = "0";
      content.style.transform = "scale(0.9)";
      popup.style.opacity = "0";
      setTimeout(() => {
        popup.remove();
      }, 400); // tunggu animasi selesai
    }
  }

  // Fungsi paksa logout
  function forceLogout() {
    if (firebase && firebase.auth) {
      firebase.auth().signOut();
    }
    hidePopup();
  }

  // Listen state login Firebase → tampilkan popup lokasi jika user login
  if (firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        createLocationPopup();
      }
    });
  }
});
