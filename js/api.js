// Panggilan ke API EQuran.id
export async function fetchSurahListAPI() {
    try {
        const res = await fetch('https://equran.id/api/v2/surat');[cite: 1]
        const data = await res.json();[cite: 1]
        return data.code === 200 ? data.data : [];[cite: 1]
    } catch (err) {
        console.error("Gagal mengambil data surah:", err);[cite: 1]
        return [];
    }
}

export async function fetchSurahDetailAPI(nomor) {
    try {
        const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);[cite: 1]
        const data = await res.json();[cite: 1]
        return data.code === 200 ? data.data : null;[cite: 1]
    } catch (err) {
        console.error("Gagal mengambil detail surah:", err);[cite: 1]
        return null;
    }
}

// Panggilan ke API Jadwal Shalat
export async function fetchPrayerScheduleAPI(cityId, yyyy, mm, dd) {
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${yyyy}/${mm}/${dd}`);[cite: 1]
        return await res.json();[cite: 1]
    } catch (err) {
        console.error("Gagal mengambil jadwal sholat:", err);[cite: 1]
        return null;
    }
}

export async function searchCityAPI(query) {
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${query}`);[cite: 1]
        return await res.json();[cite: 1]
    } catch (err) {
        console.error("Gagal mencari kota:", err);[cite: 1]
        return null;
    }
}

// Panggilan ke API Hadis
export async function fetchHaditsBookAPI(bookName) {
    try {
        const res = await fetch(`https://api.hadith.gading.dev/books/${bookName}?range=1-5`);[cite: 1]
        return await res.json();[cite: 1]
    } catch (err) {
        console.error("Gagal mengambil hadis:", err);[cite: 1]
        return null;
    }
}