document.addEventListener("DOMContentLoaded", function () {
    const tutorialModal = new bootstrap.Modal(document.getElementById("tutorialModal"));
    const carouselContainer = document.getElementById("carousel-images");
    const allowLocationBtn = document.getElementById("allowLocationBtn");
    const denyLocationBtn = document.getElementById("denyLocationBtn");

    // Deteksi path dinamis, mendukung /beta/ dan root
    const basePath = window.location.pathname.includes("/beta/")
        ? "/beta/components/"
        : "/components/";

    // Daftar gambar tutorial
    const tutorialImages = [
        "tutorial-lokasi-chrome-01.webp",
        "tutorial-lokasi-chrome-02.webp",
        "tutorial-lokasi-chrome-03.webp",
        "tutorial-lokasi-chrome-04.webp",
        "tutorial-lokasi-chrome-05.webp",
        "tutorial-lokasi-chrome-06.webp",
        "tutorial-lokasi-chrome-07.webp",
    ];

    // Generate carousel items dinamis
    tutorialImages.forEach((img, index) => {
        const activeClass = index === 0 ? "active" : "";
        const div = document.createElement("div");
        div.className = `carousel-item ${activeClass}`;
        div.innerHTML = `<img src="${basePath}${img}" class="d-block w-100 img-fluid rounded shadow" alt="Tutorial ${index + 1}">`;
        carouselContainer.appendChild(div);
    });

    // Fungsi minta izin lokasi
    async function requestLocationPermission() {
        if (!navigator.geolocation) {
            alert("Browser Anda tidak mendukung fitur lokasi. Gunakan Google Chrome versi terbaru.");
            handleLogout();
            return;
        }

        try {
            navigator.geolocation.getCurrentPosition(
                () => console.log("Lokasi diizinkan ✅"),
                () => tutorialModal.show() // Jika gagal, tampilkan modal tutorial
            );
        } catch (error) {
            tutorialModal.show();
        }
    }

    // Jika user klik "Saya Sudah Mengizinkan"
    allowLocationBtn.addEventListener("click", () => {
        tutorialModal.hide();
        requestLocationPermission();
    });

    // Jika user klik "Tetap Tolak"
    denyLocationBtn.addEventListener("click", () => {
        handleLogout();
    });

    // Logout otomatis
    function handleLogout() {
        alert("Anda menolak izin lokasi. Anda akan otomatis logout.");
        if (firebase && firebase.auth) {
            firebase.auth().signOut().then(() => {
                window.location.href = "index.html";
            });
        } else {
            window.location.href = "index.html";
        }
    }

    // Jalankan saat login sukses
    if (typeof firebase !== "undefined" && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                requestLocationPermission();
            }
        });
    }
});
