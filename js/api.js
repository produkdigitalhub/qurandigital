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
// 3. HADITS API (Endpoint Hadith Vercel)
// ==========================================

export async function fetchHaditsBookAPI(bookName) {
    try {
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
// 4. DOA HARIAN API (EQuran.id)
// ==========================================

export async function fetchDoaListAPI() {
    try {
        const res = await fetch('https://equran.id/api/doa');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        
        const data = await res.json();
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

// ==========================================
// 5. HELPER FIQIH WAKTU SHALAT & SUNNAH
// ==========================================

export function calculateFiqihTimes(jadwalObj) {
    if (!jadwalObj || !jadwalObj.subuh || !jadwalObj.dzuhur) return null;

    // A. Waktu Terbit / Syuruq & Estimasi Awal Dhuha (+15 menit)
    const jamSyuruqStr = jadwalObj.terbit || jadwalObj.syuruq || "06:00";
    const [sJam, sMenit] = jamSyuruqStr.split(':').map(Number);
    
    const timeSyuruq = new Date();
    timeSyuruq.setHours(sJam, sMenit, 0);

    const timeDhuha = new Date(timeSyuruq.getTime() + 15 * 60000);

    // B. Hitung 1/3 Malam Terakhir (Tahajud)
    const [mJam, mMenit] = jadwalObj.maghrib.split(':').map(Number);
    const [subJam, subMenit] = jadwalObj.subuh.split(':').map(Number);

    let tMaghrib = new Date();
    tMaghrib.setHours(mJam, mMenit, 0);

    let tSubuh = new Date();
    tSubuh.setDate(tSubuh.getDate() + 1);
    tSubuh.setHours(subJam, subMenit, 0);

    const totalMalamMs = tSubuh.getTime() - tMaghrib.getTime();
    const sepertigaMalamMs = totalMalamMs / 3;
    const timeTahajud = new Date(tSubuh.getTime() - sepertigaMalamMs);

    // C. Status Waktu Haram Realtime
    const sekarang = new Date();
    let statusHaram = {
        isHaram: false,
        title: "Waktu Diperbolehkan Shalat",
        desc: "Saat ini diperbolehkan mendirikan shalat sunnah mutlak.",
        type: "safe"
    };

    if (sekarang >= timeSyuruq && sekarang < timeDhuha) {
        statusHaram = {
            isHaram: true,
            title: "Waktu Haram Shalat (Syuruq)",
            desc: "Matahari sedang terbit. Dilarang shalat sunnah mutlak hingga masuk waktu Dhuha.",
            type: "danger"
        };
    } else {
        const [dJam, dMenit] = jadwalObj.dzuhur.split(':').map(Number);
        const timeDzuhur = new Date();
        timeDzuhur.setHours(dJam, dMenit, 0);
        const timeIstiwa = new Date(timeDzuhur.getTime() - 10 * 60000);

        if (sekarang >= timeIstiwa && sekarang < timeDzuhur) {
            statusHaram = {
                isHaram: true,
                title: "Waktu Haram Shalat (Istiwa)",
                desc: "Matahari tepat di atas kepala. Dilarang shalat sunnah hingga azan Dzuhur berkumandang.",
                type: "warning"
            };
        }
    }

    const formatTime = (dateObj) => {
        const h = String(dateObj.getHours()).padStart(2, '0');
        const m = String(dateObj.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    };

    return {
        syuruq: jamSyuruqStr,
        dhuha: formatTime(timeDhuha),
        tahajud: formatTime(timeTahajud),
        statusHaram: statusHaram
    };
}
