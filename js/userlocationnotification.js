// File: js/userlocationnotification.js
document.addEventListener("DOMContentLoaded", () => {
  // Tambahkan modal ke body
  const modalHTML = `
    <div id="locationModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 hidden">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center">
        <h2 class="text-xl font-bold mb-4">Izinkan Akses Lokasi</h2>
        <p class="text-gray-700 mb-6">
          Animasiosd ingin mengetahui lokasi Anda.<br><br>
          Kami <strong>tidak menjual data pribadi Anda</strong>.<br>
          Kami hanya ingin memberikan pengalaman terbaik<br>
          berdasarkan <strong>bahasa suku Anda</strong>.
          <br><br>
          Apakah Anda memahami sepenuhnya?
        </p>
        <button id="allowLocationBtn" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-lg">
          Mengerti
        </button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const locationModal = document.getElementById("locationModal");
  const allowLocationBtn = document.getElementById("allowLocationBtn");

  // Jika user sudah pernah diminta, jangan tampilkan modal lagi
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const hasAsked = localStorage.getItem("location_permission_requested");
      if (!hasAsked) {
        locationModal.classList.remove("hidden");
      }
    }
  });

  // Fungsi request lokasi
  function requestLocation() {
    locationModal.classList.add("hidden");
    localStorage.setItem("location_permission_requested", "true");

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          // Simpan lokasi ke window.latestGeoData agar analytics.js bisa pakai otomatis
          window.latestGeoData = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          };
          console.log("✅ Lokasi diizinkan:", window.latestGeoData);
        },
        err => {
          console.warn("⚠️ User menolak izin lokasi:", err.message);
          alert("Anda menolak izin lokasi. Beberapa fitur mungkin tidak optimal.");
        }
      );
    } else {
      alert("Browser Anda tidak mendukung fitur lokasi.");
    }
  }

  // Klik tombol Mengerti → request lokasi
  allowLocationBtn.addEventListener("click", requestLocation);

  // Klik di luar modal → tetap request lokasi
  locationModal.addEventListener("click", (e) => {
    if (e.target === locationModal) {
      requestLocation();
    }
  });

  // Tekan ESC → dianggap "Mengerti"
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !locationModal.classList.contains("hidden")) {
      requestLocation();
    }
  });
});
