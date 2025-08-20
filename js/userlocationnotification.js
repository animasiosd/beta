// File: js/userLocationNotification.js

document.addEventListener("DOMContentLoaded", () => {
  // Fungsi untuk membuat popup
  function createLocationPopup() {
    // Jika popup sudah ada, jangan buat lagi
    if (document.getElementById("location-popup")) return;

    const popup = document.createElement("div");
    popup.id = "location-popup";
    popup.style.position = "fixed";
    popup.style.top = "0";
    popup.style.left = "0";
    popup.style.width = "100%";
    popup.style.height = "100%";
    popup.style.backgroundColor = "rgba(0,0,0,0.5)";
    popup.style.display = "flex";
    popup.style.justifyContent = "center";
    popup.style.alignItems = "center";
    popup.style.zIndex = "9999";

    popup.innerHTML = `
      <div style="
        background: white;
        padding: 25px;
        max-width: 400px;
        border-radius: 8px;
        text-align: center;
        font-family: sans-serif;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      ">
        <h2>Izinkan Lokasi</h2>
        <p>Untuk menggunakan aplikasi ini, kami memerlukan akses lokasi Anda. 
        Lokasi digunakan untuk personalisasi konten dan keamanan.</p>
        <button id="allow-location-btn" style="
          padding: 10px 20px;
          margin-top: 15px;
          border: none;
          background-color: #007bff;
          color: white;
          font-size: 16px;
          border-radius: 5px;
          cursor: pointer;
        ">Izinkan Lokasi</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Event klik tombol "Izinkan Lokasi"
    document.getElementById("allow-location-btn").addEventListener("click", () => {
      requestUserLocation();
    });
  }

  // Fungsi untuk meminta lokasi user
  function requestUserLocation() {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung fitur lokasi.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // User mengizinkan lokasi
        const popup = document.getElementById("location-popup");
        if (popup) popup.remove();
        console.log("Lokasi diterima:", position.coords);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          alert("Akses lokasi wajib. Anda akan logout.");
          // Logout Firebase
          if (firebase && firebase.auth) {
            firebase.auth().signOut();
          }
        }
      }
    );
  }

  // Listen login state Firebase
  if (firebase && firebase.auth) {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        // User login → tampilkan popup lokasi
        createLocationPopup();
      }
    });
  }
});
