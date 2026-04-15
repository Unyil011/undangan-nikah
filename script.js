// --- 1. INISIALISASI AOS ---
AOS.init({
  once: false,
  mirror: true,
  offset: 30,
  duration: 1000,
  easing: "ease-in-out",
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

// ==========================================================
// --- 5. LOGIKA FORM RSVP, PAGINATION, & GOOGLE SHEETS ---
// ==========================================================
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz5cjdvnfmNw4Dg352EalAimyQYKmtjbcp-c7ZwBlDTbczwq0-OZ5WTAoJQ4-S_mptNfA/exec";
const form = document.getElementById("rsvp-form");
const kolomUcapan = document.getElementById("kolom-ucapan");
const paginationControls = document.getElementById("pagination-controls");

let currentPage = 1;
const itemsPerPage = 7;
let globalDataKehadiran = []; // Variabel penampung data dari Google Sheets

// A. Fungsi Mengambil Data dari Google Sheets
async function fetchUcapan() {
  kolomUcapan.innerHTML =
    "<p style='text-align:center; font-size:12px;'>Memuat ucapan tamu...</p>";
  try {
    const response = await fetch(SCRIPT_URL);
    const data = await response.json();
    globalDataKehadiran = data.reverse(); // Membalik data agar yang terbaru di atas
    renderUcapan();
  } catch (error) {
    console.error("Gagal memuat data:", error);
    kolomUcapan.innerHTML =
      "<p style='text-align:center; color:red; font-size:12px;'>Gagal memuat data ucapan.</p>";
  }
}

// B. Fungsi Merender Ucapan & Menghitung Statistik
function renderUcapan() {
  kolomUcapan.innerHTML = "";
  paginationControls.innerHTML = "";

  // --- MENGHITUNG STATISTIK KEHADIRAN DARI DATABASE ---
  let total = globalDataKehadiran.length;
  let hadir = 0;
  let tidakHadir = 0;

  globalDataKehadiran.forEach((item) => {
    // Membaca string persis dari input form kamu
    if (item.kehadiran === "Hadir") {
      hadir++;
    } else {
      tidakHadir++;
    }
  });

  const statTotal = document.getElementById("stat-total");
  const statHadir = document.getElementById("stat-hadir");
  const statTidakHadir = document.getElementById("stat-tidakhadir");

  if (statTotal) statTotal.innerText = total;
  if (statHadir) statHadir.innerText = hadir;
  if (statTidakHadir) statTidakHadir.innerText = tidakHadir;

  if (globalDataKehadiran.length === 0) {
    kolomUcapan.innerHTML =
      "<p style='text-align:center; font-size:12px;'>Belum ada ucapan.</p>";
    return;
  }

  // --- PAGINATION (Pemotongan Data) ---
  const totalPages = Math.ceil(globalDataKehadiran.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const ucapanDitampilkan = globalDataKehadiran.slice(startIndex, endIndex);

  // --- TAMPILKAN KE LAYAR HTML ---
  ucapanDitampilkan.forEach((item) => {
    const badgeColor =
      item.kehadiran === "Hadir" ? "var(--color-primary)" : "#e74c3c";
    // Tanggal diformat agar rapi
    const tanggalFormat = item.tanggal
      ? new Date(item.tanggal).toLocaleDateString("id-ID")
      : "";

    const htmlKomentar = `
        <div style="background: rgba(255, 255, 255, 0.4); border: 1px solid var(--glass-border); border-radius: 10px; padding: 15px; margin-bottom: 15px;" data-aos="fade-up">
            <p style="font-weight: bold; font-family: var(--font-heading); font-size: 16px; color: var(--color-primary); margin-bottom: 5px;">
                ${item.nama} 
                <span style="background-color: ${badgeColor}; color: white; font-size: 10px; padding: 3px 8px; border-radius: 10px; font-family: var(--font-body); margin-left: 8px; font-weight: normal;">${item.kehadiran}</span>
            </p>
            <p style="color: var(--text-dark); line-height: 1.5; font-size: 14px;">${item.ucapan}</p>
            <small style="font-size: 10px; color: var(--text-muted); display: block; margin-top: 8px;">${tanggalFormat}</small>
        </div>
    `;
    kolomUcapan.insertAdjacentHTML("beforeend", htmlKomentar);
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

// C. Saat ada ucapan baru yang dikirim
form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const btnSubmit = form.querySelector('button[type="submit"]');
  const textAsli = btnSubmit.innerText;

  // Ubah tombol jadi "Mengirim..." dan nonaktifkan agar tidak di-klik 2x
  btnSubmit.innerText = "Mengirim...";
  btnSubmit.disabled = true;

  const formData = {
    nama: document.getElementById("input-nama").value,
    ucapan: document.getElementById("input-ucapan").value,
    kehadiran: document.getElementById("input-kehadiran").value,
  };

  try {
    // Kirim ke Google Sheets
    await fetch(SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(formData),
    });

    form.reset();
    currentPage = 1; // Kembalikan ke halaman 1
    await fetchUcapan(); // Tarik ulang data terbaru dari Google Sheets

    // --- PENGGANTI ALERT: Animasi Tombol Sukses ---
    btnSubmit.innerText = "Terkirim! ✔️";
    btnSubmit.style.backgroundColor = "#2ecc71"; // Warna hijau sukses
    btnSubmit.style.color = "#ffffff";

    // Kembalikan tombol seperti semula setelah 2.5 detik
    setTimeout(() => {
      btnSubmit.innerText = textAsli;
      btnSubmit.style.backgroundColor = ""; // Kembali ke warna asal CSS
      btnSubmit.style.color = "";
      btnSubmit.disabled = false;
    }, 2500);
  } catch (error) {
    console.error("Gagal mengirim:", error);

    // --- PENGGANTI ALERT: Animasi Tombol Gagal ---
    btnSubmit.innerText = "Gagal Kirim ❌";
    btnSubmit.style.backgroundColor = "#e74c3c"; // Warna merah error
    btnSubmit.style.color = "#ffffff";

    setTimeout(() => {
      btnSubmit.innerText = textAsli;
      btnSubmit.style.backgroundColor = "";
      btnSubmit.style.color = "";
      btnSubmit.disabled = false;
    }, 3000);
  }
});

// Tarik data pertama kali saat web dibuka
fetchUcapan();

// --- 6. EFEK KELOPAK BUNGA JATUH (FALLING PETALS) ---
function createPetals() {
  const petalsContainer = document.getElementById("falling-petals");
  if (!petalsContainer) return;

  const btnBuka = document.getElementById("btn-buka");
  if (btnBuka) {
    btnBuka.addEventListener("click", () => {
      petalsContainer.classList.remove("hidden");
    });
  }

  const petalCount = 35;

  for (let i = 0; i < petalCount; i++) {
    const petal = document.createElement("div");
    petal.classList.add("petal");

    const left = Math.random() * 100;
    const size = Math.random() * 10 + 10;
    const duration = Math.random() * 6 + 6;
    const delay = Math.random() * 5;

    petal.style.left = `${left}vw`;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.animationDuration = `${duration}s`;
    petal.style.animationDelay = `${delay}s`;

    petalsContainer.appendChild(petal);
  }
}

createPetals();

// --- 7. LOGIKA WEDDING GIFT (TOGGLE & COPY) ---
const btnToggleGift = document.getElementById("btn-toggle-gift");
const giftContainer = document.getElementById("gift-container");

if (btnToggleGift && giftContainer) {
  btnToggleGift.addEventListener("click", function () {
    giftContainer.classList.toggle("hidden");

    if (giftContainer.classList.contains("hidden")) {
      btnToggleGift.innerHTML = "🎁 Kirim Hadiah";
    } else {
      btnToggleGift.innerHTML = "Tutup";
    }
  });
}

const copyButtons = document.querySelectorAll(".btn-copy");
copyButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const rekNumber = this.getAttribute("data-rek");

    navigator.clipboard
      .writeText(rekNumber)
      .then(() => {
        const originalText = this.innerText;
        this.innerText = "Tersalin!";
        this.style.backgroundColor = "#2ecc71";

        setTimeout(() => {
          this.innerText = originalText;
          this.style.backgroundColor = "var(--color-primary)";
        }, 2000);
      })
      .catch((err) => {
        console.error("Gagal menyalin teks: ", err);
        alert(
          "Browser kamu tidak mendukung fitur copy otomatis. Silakan copy manual.",
        );
      });
  });
});
