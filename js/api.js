/**
 * API Service Module
 */

// 1. Ambil Jadwal Shalat (Kompatibel dengan nama fetchPrayerScheduleAPI)
export async function fetchPrayerScheduleAPI(cityId = '1301', year, month, day) {
    try {
        const today = new Date();
        const y = year || today.getFullYear();
        const m = month || String(today.getMonth() + 1).padStart(2, '0');
        const d = day || String(today.getDate()).padStart(2, '0');

        const response = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${y}/${m}/${d}`);
        const data = await response.json();

        if (data.status && data.data && data.data.jadwal) {
            updatePrayerUI(data.data.jadwal);
        }
        return data;
    } catch (error) {
        console.error("Gagal mengambil jadwal shalat:", error);
        return null;
    }
}

// Alias untuk nama fungsi lama
export const fetchPrayerTimes = fetchPrayerScheduleAPI;

// 2. Cari Kota untuk Jadwal Sholat
export async function searchCityAPI(keyword) {
    try {
        const response = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${keyword}`);
        return await response.json();
    } catch (error) {
        console.error("Gagal mencari kota:", error);
        return null;
    }
}

// 3. Ambil Daftar Surah Al-Qur'an
export async function fetchSurahListAPI() {
    try {
        const response = await fetch('https://equran.id/api/v2/surat');
        const data = await response.json();
        return data.data || [];
    } catch (error) {
        console.error("Gagal mengambil daftar surah:", error);
        return [];
    }
}

// 4. Ambil Detail Surah & Ayat
export async function fetchSurahDetailAPI(surahNomor) {
    try {
        const response = await fetch(`https://equran.id/api/v2/surat/${surahNomor}`);
        const data = await response.json();
        return data.data || null;
    } catch (error) {
        console.error(`Gagal mengambil detail surah ${surahNomor}:`, error);
        return null;
    }
}

// 5. Ambil Ayat Harian
export async function getDailyAyat() {
    try {
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

// 6. Ambil Buku Hadis
// Ganti fungsi fetchHaditsBookAPI di api.js dengan ini:

export async function fetchHaditsBookAPI(book = 'bukhari') {
    try {
        // Menggunakan API Hadis Indonesia yang stabil dan aktif
        const response = await fetch(`https://hadis-api-id.vercel.app/hadith/${book}?page=1&limit=20`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const resData = await response.json();
        
        // Memastikan format return seragam (mencakup array hadiths & code 200)
        return {
            code: 200,
            data: {
                hadiths: resData.items || resData.data || []
            }
        };
    } catch (err) {
        console.warn(`Gagal mengambil hadits ${book}:`, err);
        
        // Fallback data kosong agar app.js tidak crash
        return {
            code: 500,
            data: { hadiths: [] }
        };
    }
}

// 7. Ambil Hadis Harian
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
        const arabEl = document.getElementById('daily-hadits-arabic');
        const indoEl = document.getElementById('daily-hadits-translation');
        const refEl = document.getElementById('daily-hadits-ref');

        if (arabEl) arabEl.textContent = "Bawalah kejujuran, karena kejujuran menuntun kepada kebaikan.";
        if (indoEl) indoEl.textContent = "Sesungguhnya kejujuran itu membimbing kepada kebaikan, dan kebaikan itu membimbing ke surga.";
        if (refEl) refEl.textContent = "HR. Bukhari & Muslim";
    }
}

// 8. Ambil Daftar Doa (Disediakan ekspor fetchDoaListAPI & fetchDoaList)
export async function fetchDoaListAPI() {
    try {
        const response = await fetch('https://equran.id/api/doa');
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Gagal memuat daftar doa:", error);
        return [];
    }
}

export async function fetchDoaList() {
    const container = document.getElementById('doa-list-container');
    const data = await fetchDoaListAPI();

    if (!container) return data;

    if (data && data.length > 0) {
        container.innerHTML = '';
        data.slice(0, 15).forEach((doa, index) => {
            const item = document.createElement('div');
            item.className = 'p-4 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-2';
            item.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 text-[11px] font-bold flex items-center justify-center">${index + 1}</span>
                    <h4 class="text-xs font-semibold text-slate-700">${doa.nama || doa.title || 'Doa'}</h4>
                </div>
                <p class="font-arabic text-right text-lg leading-loose text-slate-800 my-2">${doa.ar || doa.arabic || ''}</p>
                <p class="text-xs text-slate-500 italic">${doa.idn || doa.latin || doa.translation || ''}</p>
            `;
            container.appendChild(item);
        });
    } else {
        container.innerHTML = '<p class="text-xs text-slate-400 text-center py-4">Gagal memuat daftar doa.</p>';
    }
    return data;
}

// Helper Internal Update Jadwal Sholat
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
