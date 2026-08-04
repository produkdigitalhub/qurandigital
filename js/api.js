// ==========================================
// 1. AL-QURAN API (equran.id v2 - Valid Path)
// ==========================================

export async function fetchSurahListAPI() {
    try {
        const res = await fetch('https://equran.id/api/v2/surat');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data.data;
    } catch (e) {
        console.error("Gagal fetch daftar Surah:", e);
        return [];
    }
}

export async function fetchSurahDetailAPI(nomor) {
    try {
        const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        return data.data;
    } catch (e) {
        console.error(`Gagal fetch Surah No. ${nomor}:`, e);
        return null;
    }
}

// ==========================================
// 2. JADWAL SHOLAT & KOTA (MyQuran API v2)
// ==========================================

export async function fetchPrayerScheduleAPI(cityId, yyyy, mm, dd) {
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${yyyy}/${mm}/${dd}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (e) {
        console.error("Gagal fetch Jadwal Sholat:", e);
        return null;
    }
}

export async function searchCityAPI(query) {
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${query}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return await res.json();
    } catch (e) {
        console.error("Gagal cari kota:", e);
        return null;
    }
}

// ==========================================
// 3. HADITS API (Ganti ke Endpoint Hadith Vercel yang Aktif)
// ==========================================

export async function fetchHaditsBookAPI(bookName) {
    try {
        // Menggunakan Endpoint Hadits yang Aktif & Tanpa 404
        const res = await fetch(`https://hadis-api-id.vercel.app/hadith/${bookName}?page=1&limit=20`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const result = await res.json();

        if (result && result.items) {
            return {
                code: 200,
                data: {
                    hadiths: result.items.map(h => ({
                        number: h.number,
                        arab: h.arab,
                        id: h.id
                    }))
                }
            };
        }
        return null;
    } catch (e) {
        console.error("Gagal fetch Hadits:", e);
        return null;
    }
}

// ==========================================
// 4. DOA HARIAN API (Ganti ke Endpoint Doa Publik Bebas CORS)
// ==========================================

export async function fetchDoaListAPI() {
    try {
        // Menggunakan API Doa Harian Publik yang Aktif & Bebas CORS
        const res = await fetch('https://islamic-api-zhiaa.vercel.app/api/doa');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();

        if (Array.isArray(data)) {
            return data.map(d => ({
                judul: d.title || d.doa || d.nama,
                arab: d.arabic || d.ar,
                latin: d.latin || d.tr,
                arti: d.translation || d.idn,
                kat: 'semua'
            }));
        } else if (data && data.data) {
            return data.data.map(d => ({
                judul: d.title || d.doa || d.nama,
                arab: d.arabic || d.ar,
                latin: d.latin || d.tr,
                arti: d.translation || d.idn,
                kat: 'semua'
            }));
        }
        return [];
    } catch (e) {
        console.error("Gagal fetch Doa:", e);
        return [];
    }
}
