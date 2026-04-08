// --- 1. INISIALISASI AOS ---
AOS.init({
  once: false,
  mirror: true,
  offset: 30 /* Diperkecil jadi 30 agar animasi lebih cepat terpicu saat elemen baru sedikit masuk layar */,
  duration: 1000,
  easing:
    "ease-in-out" /* Diubah agar gerakan masuk dan keluar sama-sama seimbang dan mulus */,
});

// --- 2. HITUNGAN MUNDUR (COUNTDOWN) ---
const countDownDate = new Date("May 25, 2026 08:00:00").getTime();
const countdownInterval = setInterval(function () {
  const now = new Date().getTime();
  const distance = countDownDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  if (document.getElementById("days")) {
    document.getElementById("days").innerText = days < 10 ? "0" + days : days;
    document.getElementById("hours").innerText =
      hours < 10 ? "0" + hours : hours;
    document.getElementById("minutes").innerText =
      minutes < 10 ? "0" + minutes : minutes;
    document.getElementById("seconds").innerText =
      seconds < 10 ? "0" + seconds : seconds;
  }

  if (distance < 0) {
    clearInterval(countdownInterval);
    const countdownContainer = document.querySelector(".countdown-circles");
    if (countdownContainer) {
      countdownContainer.innerHTML =
        "<p style='font-family: var(--font-heading); font-size: 20px; font-style: italic; font-weight: bold; color: #ffffff;'>Acara Sedang Berlangsung</p>";
    }
  }
}, 1000);

// --- 3. PARAMETER NAMA TAMU (URL) ---
const urlParams = new URLSearchParams(window.location.search);
const namaTamu = urlParams.get("to") || "Tamu Kehormatan";
const elemenNamaTamu = document.getElementById("nama-tamu");
if (elemenNamaTamu) {
  elemenNamaTamu.innerText = namaTamu;
}

// --- 4. LOGIKA BUKA UNDANGAN & MUSIK ---
const btnBuka = document.getElementById("btn-buka");
const coverPage = document.getElementById("cover-page");
const mainContent = document.getElementById("main-content");
const bgMusic = document.getElementById("bg-music");
const btnMusic = document.getElementById("btn-music");
const musicIcon = document.getElementById("music-icon");

btnBuka.addEventListener("click", function () {
  bgMusic.play().catch((error) => console.log("Audio play dicegah browser"));

  // Tampilkan tombol musik setelah undangan dibuka
  if (btnMusic) btnMusic.style.display = "flex";

  coverPage.style.transform = "translateY(-100vh)";
  coverPage.style.opacity = "0";
  mainContent.classList.remove("hidden");

  setTimeout(() => {
    coverPage.style.display = "none";
    window.scrollTo(0, 0);
    AOS.refresh();
  }, 1000);
});

// Fitur Tombol Play/Pause Musik
if (btnMusic) {
  btnMusic.addEventListener("click", function () {
    if (bgMusic.paused) {
      bgMusic.play();
      musicIcon.innerText = "🔊";
      btnMusic.classList.remove("paused");
    } else {
      bgMusic.pause();
      musicIcon.innerText = "🔇";
      btnMusic.classList.add("paused");
    }
  });
}

// --- 5. LOGIKA FORM RSVP, PAGINATION, & STATISTIK ---
const form = document.getElementById("rsvp-form");
const kolomUcapan = document.getElementById("kolom-ucapan");
const paginationControls = document.getElementById("pagination-controls");

let currentPage = 1;
const itemsPerPage = 7; // Batas ucapan per halaman

// Fungsi untuk merender ucapan dan menghitung statistik
function renderUcapan() {
  const ucapanTersimpan =
    JSON.parse(localStorage.getItem("dataKehadiran")) || [];

  kolomUcapan.innerHTML = ""; // Bersihkan kolom ucapan
  paginationControls.innerHTML = ""; // Bersihkan tombol pagination

  // --- MENGHITUNG STATISTIK KEHADIRAN ---
  let total = ucapanTersimpan.length;
  let hadir = 0;
  let tidakHadir = 0;

  ucapanTersimpan.forEach((itemHtml) => {
    if (itemHtml.includes(">Hadir</span>")) {
      hadir++;
    } else if (itemHtml.includes(">Tidak Hadir</span>")) {
      tidakHadir++;
    }
  });

  const statTotal = document.getElementById("stat-total");
  const statHadir = document.getElementById("stat-hadir");
  const statTidakHadir = document.getElementById("stat-tidakhadir");

  if (statTotal) statTotal.innerText = total;
  if (statHadir) statHadir.innerText = hadir;
  if (statTidakHadir) statTidakHadir.innerText = tidakHadir;
  // --------------------------------------

  if (ucapanTersimpan.length === 0) return; // Jika kosong, berhenti

  // Hitung total halaman
  const totalPages = Math.ceil(ucapanTersimpan.length / itemsPerPage);

  // Pastikan halaman saat ini tidak melebihi total halaman
  if (currentPage > totalPages) currentPage = totalPages;

  // Potong data dari array sesuai halaman
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const ucapanDitampilkan = ucapanTersimpan.slice(startIndex, endIndex);

  // Tampilkan ucapan ke layar
  ucapanDitampilkan.forEach((itemHtml) => {
    kolomUcapan.insertAdjacentHTML("beforeend", itemHtml);
  });

  // --- BUAT TOMBOL HALAMAN ---
  if (totalPages > 1) {
    if (currentPage > 1) {
      const btnPrev = document.createElement("button");
      btnPrev.className = "btn-page";
      btnPrev.innerText = "«";
      btnPrev.onclick = () => {
        currentPage--;
        renderUcapan();
      };
      paginationControls.appendChild(btnPrev);
    }

    for (let i = 1; i <= totalPages; i++) {
      const btnNum = document.createElement("button");
      btnNum.className = `btn-page ${i === currentPage ? "active" : ""}`;
      btnNum.innerText = i;
      btnNum.onclick = () => {
        currentPage = i;
        renderUcapan();
      };
      paginationControls.appendChild(btnNum);
    }

    if (currentPage < totalPages) {
      const btnNext = document.createElement("button");
      btnNext.className = "btn-page";
      btnNext.innerText = "»";
      btnNext.onclick = () => {
        currentPage++;
        renderUcapan();
      };
      paginationControls.appendChild(btnNext);
    }
  }
}

// Panggil fungsi render saat web pertama kali dibuka
renderUcapan();

// Saat ada ucapan baru yang dikirim
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const nama = document.getElementById("input-nama").value;
  const ucapan = document.getElementById("input-ucapan").value;
  const kehadiran = document.getElementById("input-kehadiran").value;
  const badgeColor = kehadiran === "Hadir" ? "var(--color-primary)" : "#e74c3c";

  const htmlKomentar = `
        <div style="background: rgba(255, 255, 255, 0.4); border: 1px solid var(--glass-border); border-radius: 10px; padding: 15px; margin-bottom: 15px;" data-aos="fade-up">
            <p style="font-weight: bold; font-family: var(--font-heading); font-size: 16px; color: var(--color-primary); margin-bottom: 5px;">
                ${nama} 
                <span style="background-color: ${badgeColor}; color: white; font-size: 10px; padding: 3px 8px; border-radius: 10px; font-family: var(--font-body); margin-left: 8px; font-weight: normal;">${kehadiran}</span>
            </p>
            <p style="color: var(--text-dark); line-height: 1.5;">${ucapan}</p>
        </div>
    `;

  const ucapanTersimpan =
    JSON.parse(localStorage.getItem("dataKehadiran")) || [];
  ucapanTersimpan.unshift(htmlKomentar);
  localStorage.setItem("dataKehadiran", JSON.stringify(ucapanTersimpan));

  form.reset();
  currentPage = 1;
  renderUcapan();
});

// --- 6. EFEK KELOPAK BUNGA JATUH (FALLING PETALS) ---
function createPetals() {
  const petalsContainer = document.getElementById("falling-petals");
  if (!petalsContainer) return;

  // Pastikan kelopak muncul setelah tombol Buka Undangan diklik
  const btnBuka = document.getElementById("btn-buka");
  if (btnBuka) {
    btnBuka.addEventListener("click", () => {
      petalsContainer.classList.remove("hidden");
    });
  }

  const petalCount = 35; // Jumlah kelopak bunga yang jatuh bersaman

  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement("div");
    petal.classList.add("petal");

    // Random posisi (Kiri-Kanan), ukuran, dan kecepatan jatuh
    const left = Math.random() * 100; // 0 - 100vw
    const size = Math.random() * 10 + 10; // Ukuran 10px - 20px
    const duration = Math.random() * 6 + 6; // Durasi jatuh 6s - 12s (Biar slow motion estetik)
    const delay = Math.random() * 5; // Munculnya bergantian 0s - 5s

    petal.style.left = `${left}vw`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;

    petalsContainer.appendChild(petal);
  }
}

// Jalankan fungsi saat web dimuat
createPetals();
