// File: js/userLocationNotification.js

document.addEventListener("DOMContentLoaded", function () {
    const tutorialModalEl = document.getElementById("tutorialModal");
    const tutorialModal = new bootstrap.Modal(tutorialModalEl);
    const carouselInner = document.getElementById("tutorialCarouselInner");

    // Dinamis ambil gambar tutorial
    const totalImages = 7;
    const imagePath = "components/";
    const imagePrefix = "tutorial-lokasi-chrome-";

    let html = "";
    for (let i = 1; i <= totalImages; i++) {
        const activeClass = i === 1 ? "active" : "";
        html += `
          <div class="carousel-item ${activeClass}">
            <img src="${imagePath}${imagePrefix}${String(i).padStart(2, "0")}.webp"
                 class="d-block w-100"
                 alt="Tutorial Izinkan Lokasi ${i}">
          </div>`;
    }
    carouselInner.innerHTML = html;

    // Fungsi logout
    function doLogout() {
        if (firebase?.auth) {
            firebase.auth().signOut().then(() => {
                window.location.href = "/beta/logout.html";
            });
        } else {
            window.location.href = "/beta/logout.html";
        }
    }

    // Fungsi untuk meminta lokasi
    function requestUserLocation() {
        if (!navigator.geolocation) {
            alert("Browser Anda tidak mendukung fitur lokasi. Silakan gunakan Google Chrome.");
            doLogout();
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log("Lokasi diizinkan ✅", position.coords);
                tutorialModal.hide();
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    console.warn("User menolak lokasi → tampilkan tutorial");
                    setTimeout(() => {
                        tutorialModal.show();
                    }, 200);
                }
            }
        );
    }

    // Cek permission geolocation
    if (navigator.permissions) {
        navigator.permissions.query({ name: "geolocation" }).then((result) => {
            if (result.state === "granted") {
                console.log("Lokasi sudah diizinkan ✅");
            } else if (result.state === "prompt") {
                console.log("Lokasi belum diminta → panggil prompt bawaan browser");
                requestUserLocation();
            } else if (result.state === "denied") {
                console.log("Lokasi ditolak ❌ → tampilkan tutorial");
                tutorialModal.show();
            }

            // Dengarkan perubahan permission
            result.onchange = function () {
                if (result.state === "granted") {
                    console.log("User mengizinkan lokasi ✅");
                    tutorialModal.hide();
                } else if (result.state === "denied") {
                    console.warn("User tetap menolak lokasi ❌ → logout otomatis");
                    doLogout();
                }
            };
        });
    } else {
        // Browser lama → logout otomatis
        alert("Browser Anda tidak mendukung fitur lokasi. Silakan gunakan Google Chrome.");
        doLogout();
    }

    // Jika modal ditutup, cek apakah izin masih ditolak
    tutorialModalEl.addEventListener("hidden.bs.modal", function () {
        if (navigator.permissions) {
            navigator.permissions.query({ name: "geolocation" }).then((result) => {
                if (result.state === "denied") {
                    alert("Anda menolak izin lokasi. Anda akan otomatis logout.");
                    doLogout();
                }
            });
        }
    });
});
