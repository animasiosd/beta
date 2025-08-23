// File: js/userLocationNotification.js
function requestUserGeolocation() {
    if (!navigator.geolocation) {
        // Jika browser tidak mendukung geolocation, langsung logout
        window.location.href = "/beta/login"; // Ganti path logout sesuai aplikasimu
        return;
    }

    navigator.geolocation.getCurrentPosition(
        // ✅ Jika user mengizinkan
        function (position) {
            console.log("Lokasi diizinkan ✅");
        },

        // ❌ Jika user menolak → langsung logout tanpa pemberitahuan
        function (error) {
            if (error.code === error.PERMISSION_DENIED) {
              console.log("Lokasi ditolak ❌, logout...");
                window.location.href = "/beta/login"; // Ganti path logout sesuai aplikasimu
            }
        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Jalankan otomatis saat user login berhasil
document.addEventListener("DOMContentLoaded", function () {
    requestUserGeolocation();
});
