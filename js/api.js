// Panggilan ke API Doa EQuran.id (228 Doa & Dzikir)
export async function fetchDoaListAPI(grup = '') {
    try {
        const url = grup 
            ? `https://equran.id/api/doa?grup=${encodeURIComponent(grup)}`
            : `https://equran.id/api/doa`;

        const res = await fetch(url);
        const data = await res.json();
        
        // Cek struktur respon API
        const doaData = Array.isArray(data) ? data : (data.data || []);
        
        return doaData.map((d, index) => ({
            id: d.id || index + 1,
            judul: d.nama || d.judul || d.title,
            arab: d.ar || d.arab || d.arabic,
            latin: d.tr || d.latin,
            arti: d.idn || d.arti || d.indonesian,
            kat: d.grup || d.kategori || 'umum',
            tag: d.tag || []
        }));
    } catch (err) {
        console.error("Gagal mengambil daftar doa:", err);
        return null;
    }
}


export async function fetchSurahListAPI() {
    // 1. Cek apakah sudah ada data tersimpan di browser
    const cached = localStorage.getItem('surah_list');
    if (cached) return JSON.parse(cached);

    try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        if (data.code === 200) {
            // 2. Simpan ke cache jika sukses
            localStorage.setItem('surah_list', JSON.stringify(data.data));
            return data.data;
        }
        return [];
    } catch (err) {
        console.error("Gagal mengambil data surah:", err);
        return [];
    }
}

export async function fetchSurahDetailAPI(nomor) {
    try {
        const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
        const data = await res.json();
        return data.code === 200 ? data.data : null;
    } catch (err) {
        console.error("Gagal mengambil detail surah:", err);
        return null;
    }
}

// Panggilan ke API Jadwal Shalat
export async function fetchPrayerScheduleAPI(cityId, yyyy, mm, dd) {
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${yyyy}/${mm}/${dd}`);
        return await res.json();
    } catch (err) {
        console.error("Gagal mengambil jadwal sholat:", err);
        return null;
    }
}

export async function searchCityAPI(query) {
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${query}`);
        return await res.json();
    } catch (err) {
        console.error("Gagal mencari kota:", err);
        return null;
    }
}

// Panggilan ke API Hadis
// Panggilan ke API Hadis (Menggunakan API MyQuran sebagai cadangan)
export async function fetchHaditsBookAPI(bookName) {
    try {
        // Menggunakan API Hadis MyQuran yang aktif
        const res = await fetch(`https://api.myquran.com/v2/hadits/arbain/semua`);
        const data = await res.json();
        if (data && data.status) {
            return {
                code: 200,
                data: {
                    hadiths: data.data.map(item => ({
                        number: item.no,
                        arab: item.arab,
                        id: item.indo,
                        judul: item.judul
                    }))
                }
            };
        }
        return null;
    } catch (err) {
        console.error("Gagal mengambil hadis:", err);
        return null;
    }
}
