// File: js/analytics.js
// ✅ Versi final – fix integrasi geoTracker.js

const ANALYTICS_WEB_APP = "https://script.google.com/macros/s/AKfycbxm5YQAB2kify_9SzPph5xgaEMlsKpE8UNfrPuvmghgDM9meNKCiDPABKHJ4a4p3Nak/exec";
const videoProgressSession = {};
const videoCompletedSession = {};

/**
 * Format nama kota/kabupaten secara dinamis
 * - Kalau ada city → pakai langsung (contoh: "Semarang")
 * - Kalau ada county → cek apakah sudah ada "Kabupaten", kalau belum → tambahkan "Kab."
 * - Kalau ada town/municipality/village → fallback terakhir
 */
function resolveCityName(address) {
  if (!address) return "";

  // Kota besar → langsung pakai nama city
  if (address.city) {
    return address.city; // contoh: "Semarang"
  }

  // Kalau tidak ada city, tapi ada county → biasanya kabupaten
  if (address.county) {
    if (/Kabupaten/i.test(address.county)) {
      return address.county; // contoh: "Kabupaten Semarang"
    } else {
      return `Kab. ${address.county}`; // contoh: "Kab. Semarang"
    }
  }

  // Fallback: town, municipality, village
  if (address.town) return address.town;
  if (address.municipality) return address.municipality;
  if (address.village) return address.village;

  return "";
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  const platform = navigator.platform.toLowerCase();
  const os = platform.includes("win") ? "Windows"
           : platform.includes("mac") ? "macOS"
           : platform.includes("linux") ? "Linux"
           : /android/i.test(ua) ? "Android"
           : /iphone|ipad/i.test(ua) ? "iOS"
           : "Unknown";
  const browser = /chrome/i.test(ua) ? "Chrome"
                : /firefox/i.test(ua) ? "Firefox"
                : /safari/i.test(ua) ? "Safari"
                : /edg/i.test(ua) ? "Edge"
                : /opr/i.test(ua) ? "Opera"
                : "Unknown";
  const device = /Mobi/i.test(ua) ? "mobile"
               : /Tablet/i.test(ua) ? "tablet"
               : "desktop";
  return { os, browser, device };
}

function getFormattedTimestampWIB() {
  const now = new Date();
  const options = {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  };
  return new Intl.DateTimeFormat('id-ID', options).format(now).replace(",", "");
}

function sendAnalyticsEvent(eventType, dataObject) {
  fetch(ANALYTICS_WEB_APP, {
    method: "POST",
    body: JSON.stringify({ eventType, data: dataObject })
  }).then(res => res.json()).then(result => {
    if (result.status !== "success") {
      console.warn("📉 Analytics gagal:", result.message);
    }
  }).catch(err => console.error("❌ Gagal kirim analytics:", err));
}

function logUserLogin(user) {
  if (!user) return;
  sendAnalyticsEvent("USER_LOGIN_ACTIVITY", {
    user_id: user.uid,
    email: user.email,
    user_name: user.displayName || "Tanpa Nama",
    age_range: null,
    minAge: null,
    first_login_city: null,
    last_login_city: null,
    first_login_country: null,
    last_login_country: null
  });
}

function logPageView(user) {
  const { os, browser, device } = getDeviceInfo();
  const url = window.location.href;
  const path = window.location.pathname;
  let tipe_halaman = "unknown";
  let nama_bahasa = null;

  if (path.includes("index.html") || path === "/" || path === "/index") tipe_halaman = "homepage";
  else if (path.includes("halaman-bahasa")) {
    tipe_halaman = "video_page";
    const params = new URLSearchParams(window.location.search);
    nama_bahasa = params.get("bahasa") || null;
  }
  else if (path.includes("download")) tipe_halaman = "download_page";

  sendAnalyticsEvent("PAGE_VIEW", {
    timestamp: getFormattedTimestampWIB(),
    user_id: user ? user.uid : "ANONYM",
    user_name: user ? user.displayName || "Tanpa Nama" : null,
    url_halaman: url,
    tipe_halaman,
    nama_bahasa,
    device_type: device,
    operating_system: os,
    browser_name: browser
  });
}

function trackVideoInteraction(interactionType, additionalData = {}) {
  const user = firebase.auth().currentUser || null;
  const videoTitle = document.getElementById("videoTitle")?.textContent || "Tanpa Judul";
  const language = window.currentLanguagePage || null;
  const videoId = window.currentVideoId || null;
  const geo = window.latestGeoData || {};

  sendVideoInteraction({
    user_id: user ? user.uid : "ANONYM",
    user_name: user ? user.displayName : "TIDAK DIKETAHUI",
    nama_bahasa: language,
    video_id: videoId,
    video_title: videoTitle,
    interaction_type: interactionType,
    latitude: geo.latitude || "",
    longitude: geo.longitude || "",
    country: geo.country || "",
    state_province: geo.state_province || "",
    city: resolveCityName(geo),
    postcode: geo.postcode || "",
    timezone: geo.timezone || "",
    ...additionalData
  });
}


/**
 * Kirim data interaksi video dengan dukungan geoTracker.js
 * Otomatis menyertakan lokasi jika tersedia
 */
function sendVideoInteraction(data) {
  // Ambil data lokasi terbaru dari geoTracker.js
  const geo = window.latestGeoData || {};

  sendAnalyticsEvent("VIDEO_INTERACTION", {
    interaction_timestamp: getFormattedTimestampWIB(),
    user_id: enrichedData.user_id,
    user_name: enrichedData.user_name,
    nama_bahasa: enrichedData.nama_bahasa,
    video_id: enrichedData.video_id,
    video_title: enrichedData.video_title,
    interaction_type: enrichedData.interaction_type,
    comment_id: enrichedData.comment_id || "",
    video_watch_percentage: enrichedData.video_watch_percentage || "",
    video_completed: enrichedData.video_completed || "",
    latitude: geo.latitude || enrichedData.latitude || "",
    longitude: geo.longitude || enrichedData.longitude || "",
    country: geo.country || enrichedData.country || "",
    state_province: geo.state_province || enrichedData.state_province || "",
    city: resolveCityName(geo) || resolveCityName(enrichedData) || "",
    postcode: geo.postcode || enrichedData.postcode || "",
    timezone: geo.timezone || enrichedData.timezone || ""
  });
}

document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      setTimeout(() => {
        logUserLogin(user);
        logPageView(user);
      }, 500);
    } else {
      logPageView(null);
    }
  });
});

function trackWatchProgress(currentTime, duration) {
  const percentage = Math.floor((currentTime / duration) * 100);
  const user = firebase.auth().currentUser || null;
  const videoId = window.currentVideoId || null;
  const language = window.currentLanguagePage || null;
  const title = document.getElementById("videoTitle")?.textContent || "Tanpa Judul";
  const geo = window.latestGeoData || {};

  if (!videoId || !duration || percentage < 1) return;

  const lastSent = videoProgressSession[videoId] || 0;
  const isCompleted = percentage >= 95;

  // ✅ Kirim progress pada 25%, 50%, 75%, 95%
  const allowedPoints = [25, 50, 75, 95];
  if (allowedPoints.includes(percentage) && percentage !== lastSent) {
    videoProgressSession[videoId] = percentage;

    sendVideoInteraction({
      user_id: user ? user.uid : "ANONYM",
      user_name: user ? user.displayName || "Tanpa Nama" : null,
      nama_bahasa: language,
      video_id: videoId,
      video_title: title,
      interaction_type: "progress_update",
      video_watch_percentage: percentage,
      latitude: geo.latitude || "",
      longitude: geo.longitude || "",
      country: geo.country || "",
      state_province: geo.state_province || "",
      city: resolveCityName(geo),
      postcode: geo.postcode || "",
      timezone: geo.timezone || ""
    });
  }

  // ✅ Tetap kirim data ketika video selesai ditonton
  if (isCompleted && !videoCompletedSession[videoId]) {
    videoCompletedSession[videoId] = true;

    sendVideoInteraction({
      user_id: user ? user.uid : "ANONYM",
      user_name: user ? user.displayName || "Tanpa Nama" : null,
      nama_bahasa: language,
      video_id: videoId,
      video_title: title,
      interaction_type: "video_completed",
      video_watch_percentage: percentage,
      video_completed: "yes",
      latitude: geo.latitude || "",
      longitude: geo.longitude || "",
      country: geo.country || "",
      state_province: geo.state_province || "",
      city: resolveCityName(geo),
      postcode: geo.postcode || "",
      timezone: geo.timezone || ""
    });
  }
}


let playerInterval = null;

function startTrackingPlayerProgress(player) {
  clearInterval(playerInterval);
  playerInterval = setInterval(() => {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    trackWatchProgress(currentTime, duration);
  }, 1000);
}

function attachPlayerEventListeners(player) {
  player.addEventListener("onStateChange", function (event) {
    const duration = player.getDuration();
    const currentTime = player.getCurrentTime();
    const percentage = Math.floor((currentTime / duration) * 100);

    if (event.data === YT.PlayerState.PLAYING) {
      trackVideoInteraction("play", { video_watch_percentage: percentage });
      startTrackingPlayerProgress(player);
    } 
    else if (event.data === YT.PlayerState.PAUSED) {
      trackVideoInteraction("pause", { video_watch_percentage: percentage });
    } 
    else if (event.data === YT.PlayerState.ENDED) {
      if (!videoCompletedSession[window.currentVideoId]) {
        trackVideoInteraction("video_completed", { video_watch_percentage: 100 });
        videoCompletedSession[window.currentVideoId] = true;
      }
    }
  });

  // ✅ Deteksi fullscreen
  document.addEventListener("fullscreenchange", () => {
    const percentage = Math.floor((player.getCurrentTime() / player.getDuration()) * 100);
    if (document.fullscreenElement) {
      trackVideoInteraction("enter_fullscreen", { video_watch_percentage: percentage });
    } else {
      trackVideoInteraction("exit_fullscreen", { video_watch_percentage: percentage });
    }
  });
}


function logUserBehavior(eventName, detail1 = "", detail2 = "") {
  const user = firebase.auth().currentUser || null;

  sendAnalyticsEvent("USER_BEHAVIOR", {
    event_date: new Date().toLocaleDateString("id-ID"),
    event_timestamp: getFormattedTimestampWIB(),
    user_id: user ? user.uid : "ANONYM",
    user_name: user ? user.displayName || "Tanpa Nama" : "ANONYM",
    event_name: eventName,
    event_details_1: detail1,
    event_details_2: detail2
  });
}

function logDownloadPageInteraction(action_type, action_key = "", action_value = "", action_detail = "") {
  const user = firebase.auth().currentUser;
  if (!user) return;

  const payload = {
    eventType: "DOWNLOAD_INTERACTION",
    data: {
      timestamp: getFormattedTimestampWIB(),
      user_id: user.uid,
      user_name: user.displayName || "Tanpa Nama",
      action_type: action_type,
      action_key: action_key,
      action_value: action_value,
      action_detail: action_detail
    }
  };

  fetch(ANALYTICS_WEB_APP, {
    method: "POST",
    body: JSON.stringify(payload),
  }).catch(err => console.error("logDownloadPageInteraction error:", err));
}
