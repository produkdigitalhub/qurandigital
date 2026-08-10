/**
 * API Service Module
 */

// 1. Ambil Jadwal Shalat
export async function fetchPrayerTimes(cityId = '1301') { // Default Makassar/Jakarta
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');

        const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${year}/${month}/${day}`);
        const data = await response.json();

        if (data.status && data.data) {
            updatePrayerUI(data.data.jadwal);
        }
    } catch (error) {
        console.error("Gagal mengambil jadwal shalat:", error);
    }
}

// 2. Ambil Ayat Harian
export async function getDailyAyat() {
    try {
        // Random ayat antara 1-6236
        const randomAyat = Math.floor(Math.random() * 6236) + 1;
        const response = await fetch(`https://api.alquran.cloud/v1/ayah/${randomAyat}/editions/quran-uthmani,id.indonesian`);
        const data = await response.json();

        if (data.code === 200 && data.data.length >= 2) {
            const arab = data.data[0].text;
            const indo = data.data[1].text;
            const surahName = data.data[0].surah.englishName;
            const ayahNum = data.data[0].numberInSurah;

            const arabEl = document.getElementById('daily-ayat-arabic');
            const indoEl = document.getElementById('daily-ayat-translation');
            const refEl = document.getElementById('daily-ayat-ref');

            if (arabEl) arabEl.textContent = arab;
            if (indoEl) indoEl.textContent = `"${indo}"`;
            if (refEl) refEl.textContent = `QS. ${surahName}: ${ayahNum}`;
        }
    } catch (error) {
        console.error("Gagal mengambil ayat harian:", error);
    }
}

// 3. Ambil Hadis Harian
export async function getDailyHadits() {
    try {
        const response = await fetch('https://api.hadith.gq/hadith/bukhari/random');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        const arabEl = document.getElementById('daily-hadits-arabic');
        const indoEl = document.getElementById('daily-hadits-translation');
        const refEl = document.getElementById('daily-hadits-ref');

        if (arabEl) arabEl.textContent = data.arab || '';
        if (indoEl) indoEl.textContent = data.id || '';
        if (refEl) refEl.textContent = `HR. Bukhari No. ${data.number || '-'}`;
    } catch (error) {
        // Fallback lokal jika API Hadis gagal/slow
        const arabEl = document.getElementById('daily-hadits-arabic');
        const indoEl = document.getElementById('daily-hadits-translation');
        const refEl = document.getElementById('daily-hadits-ref');

        if (arabEl) arabEl.textContent = "Bawalah kejujuran, karena kejujuran menuntun kepada kebaikan.";
        if (indoEl) indoEl.textContent = "Sesungguhnya kejujuran itu membimbing kepada kebaikan, dan kebaikan itu membimbing ke surga.";
        if (refEl) refEl.textContent = "HR. Bukhari & Muslim";
    }
}

// Helper untuk update UI Sholat
function updatePrayerUI(jadwal) {
    if (!jadwal) return;
    const subuh = document.getElementById('time-subuh');
    const dzuhur = document.getElementById('time-dzuhur');
    const ashar = document.getElementById('time-ashar');
    const maghrib = document.getElementById('time-maghrib');
    const isya = document.getElementById('time-isya');

    if (subuh) subuh.textContent = jadwal.subuh;
    if (dzuhur) dzuhur.textContent = jadwal.dzuhur;
    if (ashar) ashar.textContent = jadwal.ashar;
    if (maghrib) maghrib.textContent = jadwal.maghrib;
    if (isya) isya.textContent = jadwal.isya;
}
