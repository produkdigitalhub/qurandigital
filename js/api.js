// js/api.js

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
