// ==========================================
// 1. AL-QURAN API (equran.id v2)
// ==========================================

export async function fetchSurahListAPI() {
    try {
        const res = await fetch('https://equran.id/api/v2/surat');
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
        return await res.json();
    } catch (e) {
        console.error("Gagal fetch Jadwal Sholat:", e);
        return null;
    }
}

export async function searchCityAPI(query) {
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${query}`);
        return await res.json();
    } catch (e) {
        console.error("Gagal cari kota:", e);
        return null;
    }
}

// ==========================================
// 3. HADITS BUKU (MyQuran API v3)
// ==========================================

export async function fetchHaditsBookAPI(bookName) {
    try {
        // Ambil range 1-20
        const res = await fetch(`https://api.myquran.com/v3/hadits/${bookName}?range=1-20`);
        const result = await res.json();
        
        // Pengecekan fleksibel untuk response MyQuran v3 / Vercel Mirror
        const hadithsList = result?.data?.hadiths || result?.data || [];

        if (hadithsList.length > 0) {
            return {
                code: 200,
                data: {
                    hadiths: hadithsList.map(h => ({
                        number: h.number || h.no || h.number_hadith,
                        arab: h.arab || h.ar,
                        id: h.id || h.terjemah || h.id_indonesia
                    }))
                }
            };
        }
        return null;
    } catch (e) {
        console.error("Gagal fetch Hadits dari MyQuran v3:", e);
        return null;
    }
}

// ==========================================
// 4. DOA HARIAN (equran.id - Bebas CORS)
// ==========================================

export async function fetchDoaListAPI() {
    try {
        const res = await fetch('https://equran.id/api/v2/doa');
        const data = await res.json();

        if (data && data.data) {
            // Disesuaikan agar kompatibel dengan properti di app.js
            return data.data.map(d => ({
                judul: d.nama,
                arab: d.ar,
                latin: d.tr,
                arti: d.idn,
                kat: d.kategori || 'semua'
            }));
        }
        return [];
    } catch (e) {
        console.error("Gagal fetch Doa:", e);
        return [];
    }
}
