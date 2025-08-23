// File: js/userLocationNotification.js

document.addEventListener("DOMContentLoaded", function () {
    const tutorialModal = new bootstrap.Modal(document.getElementById('tutorialModal'));
    const allowLocationBtn = document.getElementById('allowLocationBtn');

    // Cek permission status (untuk browser modern)
    if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
            if (result.state === 'granted') {
                console.log("Lokasi sudah diizinkan ✅");
            } else if (result.state === 'denied') {
                console.log("Lokasi ditolak ❌ → tampilkan tutorial");
                tutorialModal.show();
            }
        });
    } else {
        // Browser lama → logout otomatis
        alert("Browser Anda tidak mendukung fitur lokasi. Silakan gunakan Google Chrome.");
        doLogout();
    }

    // Event klik tombol izinkan lokasi
    allowLocationBtn.addEventListener("click", function () {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                console.log("Lokasi diizinkan ✅", position);
                tutorialModal.hide();
            },
            function (error) {
                if (error.code === error.PERMISSION_DENIED) {
                    console.warn("User menolak lokasi → tampilkan tutorial");
                    tutorialModal.show();
                }
            }
        );
    });

    // Event setelah modal ditutup
    document.getElementById('tutorialModal').addEventListener('hidden.bs.modal', function () {
        navigator.permissions.query({ name: 'geolocation' }).then(function (result) {
            if (result.state === 'denied') {
                alert("Anda menolak izin lokasi. Anda akan otomatis logout.");
                doLogout();
            }
        });
    });

    function doLogout() {
        firebase.auth().signOut().then(() => {
            window.location.href = "/beta/logout.html";
        });
    }
});
