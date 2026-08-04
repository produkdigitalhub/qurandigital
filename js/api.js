



export async function fetchSurahListAPI() {
    try {
        const res = await fetch('https://equran.id/api/v2/surat');
        const data = await res.json();
        return data.data;
    } catch (e) {
        console.error(e);
        return [];
    }
}

export async function fetchSurahDetailAPI(nomor) {
    try {
        const res = await fetch(`https://equran.id/api/v2/surat/${nomor}`);
        const data = await res.json();
        return data.data;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function fetchPrayerScheduleAPI(cityId, yyyy, mm, dd) {
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/jadwal/${cityId}/${yyyy}/${mm}/${dd}`);
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function searchCityAPI(query) {
    try {
        const res = await fetch(`https://api.myquran.com/v2/sholat/kota/cari/${query}`);
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function fetchHaditsBookAPI(bookName) {
    try {
        const res = await fetch(`https://api.hadith.gading.dev/books/${bookName}?range=1-20`);
        return await res.json();
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function fetchDoaListAPI() {
    try {
        const res = await fetch('https://open-api.my.id/api/doa');
        return await res.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

// Fetch Hadis dari MyQuran API v3
export async function fetchHaditsBookAPI(bookName) {
    try {
        // Range 1-20 mengambil 20 hadis pertama
        const res = await fetch(`https://api.myquran.com/v3/hadits/${bookName}?range=1-20`);
        const result = await res.json();
        
        // Cek struktur respon dari MyQuran v3
        if (result && result.status && result.data && result.data.hadiths) {
            return {
                code: 200,
                data: {
                    hadiths: result.data.hadiths.map(h => ({
                        number: h.number || h.no,
                        arab: h.arab,
                        id: h.id || h.terjemah
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

