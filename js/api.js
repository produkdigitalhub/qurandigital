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

// 4. DOA HARIAN API (EQuran.id)
export async function fetchDoaListAPI() {
    try {
        // Menggunakan endpoint sesuai dokumentasi gambar: https://equran.id/api/doa
        const res = await fetch('https://equran.id/api/doa');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();

        // Data berupa array dari API
        const listDoa = Array.isArray(data) ? data : (data.data || []);

        return listDoa.map((d, index) => ({
            id: d.id || (index + 1),
            judul: d.nama || d.judul || 'Tanpa Judul',
            arab: d.ar || d.arab || '',
            latin: d.tr || d.latin || '',
            arti: d.idn || d.arti || d.terjemah || '',
            kat: d.grup || d.kategori || 'Umum'
        }));
    } catch (e) {
        console.error("Gagal fetch Doa dari EQuran.id:", e);
        return [];
    }
}
