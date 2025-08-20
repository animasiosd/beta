// File: js/geoTracker.js
// Versi final – siap pakai

const GEO_TRACK_CACHE_KEY = "geoTrackerData";
const GEO_TRACK_EXPIRY = 1000 * 60 * 15; // 15 menit caching
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse";

// Ambil lokasi dari cache jika ada dan belum kadaluarsa
function getCachedLocation() {
  try {
    const cached = sessionStorage.getItem(GEO_TRACK_CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached);
    if (Date.now() - parsed.timestamp < GEO_TRACK_EXPIRY) {
      return parsed.location;
    }
    return null;
  } catch {
    return null;
  }
}

// Simpan lokasi ke cache
function setCachedLocation(location) {
  sessionStorage.setItem(
    GEO_TRACK_CACHE_KEY,
    JSON.stringify({ timestamp: Date.now(), location })
  );
}

// Ambil lokasi user + reverse geocoding
async function fetchUserLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation tidak didukung browser.");
      return resolve(null);
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          // Reverse geocoding
          const response = await fetch(
            `${NOMINATIM_URL}?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
              headers: { "User-Agent": "geo-tracker-app" },
            }
          );
          const data = await response.json();

          const locationData = {
            latitude: latitude.toFixed(5),
            longitude: longitude.toFixed(5),
            country: data.address.country || "",
            state_province: data.address.state || "",
            city:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              "",
            postcode: data.address.postcode || "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          };

          setCachedLocation(locationData);
          resolve(locationData);
        } catch (err) {
          console.error("GeoTracker error:", err);
          resolve(null);
        }
      },
      (err) => {
        console.warn("User menolak akses lokasi:", err);
        resolve(null);
      },
      { enableHighAccuracy: false, maximumAge: 60000, timeout: 15000 }
    );
  });
}

// Fungsi utama kirim data ke Google Sheets
async function sendGeoVideoInteraction({
  video_id,
  video_title,
  nama_bahasa,
  interaction_type,
  comment_id = "",
  video_watch_percentage = "",
  video_completed = "",
}) {
  try {
    // Pastikan user login
    if (!window.currentUser || !currentUser.uid) {
      console.warn("GeoTracker: User belum login, skip.");
      return;
    }

    // Ambil lokasi dari cache atau fetch baru
    let locationData = getCachedLocation();
    if (!locationData) {
      locationData = await fetchUserLocation();
    }

    // Siapkan payload sesuai urutan kolom Google Sheets
    const payload = {
      interaction_timestamp: new Date().toISOString(),
      user_id: currentUser.uid,
      user_name: currentUser.displayName || "Anonim",
      nama_bahasa: nama_bahasa || "",
      video_id,
      video_title,
      interaction_type,
      comment_id,
      video_watch_percentage,
      video_completed,
      latitude: locationData?.latitude || "",
      longitude: locationData?.longitude || "",
      country: locationData?.country || "",
      state_province: locationData?.state_province || "",
      city: locationData?.city || "",
      postcode: locationData?.postcode || "",
      timezone: locationData?.timezone || "",
    };

    // Kirim ke Google Apps Script
    await fetch(url_web_app_analytics, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sheet: "video_interaction", data: payload }),
    });

    console.log("GeoTracker: Data terkirim ✅", payload);
  } catch (err) {
    console.error("GeoTracker: Gagal kirim data", err);
  }
}
