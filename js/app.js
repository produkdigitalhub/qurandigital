import { state } from './config.js';
import { 
    fetchSurahListAPI, fetchSurahDetailAPI, 
    fetchPrayerScheduleAPI, searchCityAPI, fetchHaditsBookAPI 
} from './api.js';
import { 
    showToast, renderSurahListUI, renderDoaListUI, 
    renderPrayerGridUI, renderFullPrayerScheduleUI 
} from './ui.js';

window.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    setHijriDate();
    initEventListeners();
    await loadPrayerSchedule(state.cityId);
    loadDailyAyat();
    loadDailyHadits();
    loadSurahList();
    renderDoaListUI(state.doaList);
    loadHaditsBook('bukhari');
    startTimer();
}

function setHijriDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-hijri-date').innerText = `${today.toLocaleDateString('id-ID', options)} • 1447 H`;[cite: 1]
}

function switchTab(tabName, filterParam = null) {
    state.activeTab = tabName;
    ['dashboard', 'quran', 'doa', 'hadits', 'sholat'].forEach(v => {
        document.getElementById(`view-${v}`)?.classList.add('hidden');[cite: 1]
    });
    document.getElementById(`view-${tabName}`)?.classList.remove('hidden');[cite: 1]

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active-tab');
        btn.classList.add('text-slate-400');[cite: 1]
    });

    const activeBtn = document.getElementById(`nav-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.add('active-tab');
        activeBtn.classList.remove('text-slate-400');[cite: 1]
    }

    if (tabName === 'doa' && filterParam) {
        filterDoa(filterParam);
    }
}

async function loadPrayerSchedule(cityId) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const data = await fetchPrayerScheduleAPI(cityId, yyyy, mm, dd);
    if (data && data.status) {
        state.prayerData = data.data;
        document.getElementById('header-city-name').innerText = data.data.lokasi.replace('KOTA ', '');[cite: 1]
        document.getElementById('full-schedule-city').innerText = data.data.lokasi;[cite: 1]
        document.getElementById('full-schedule-date').innerText = data.data.jadwal.tanggal;[cite: 1]

        renderPrayerGridUI(data.data.jadwal);
        renderFullPrayerScheduleUI(data.data.jadwal);
        updateNextPrayer(data.data.jadwal);
    }
}

function updateNextPrayer(j) {
    const times = [
        { name: 'Subuh', time: j.subuh },[cite: 1]
        { name: 'Dzuhur', time: j.dzuhur },[cite: 1]
        { name: 'Ashar', time: j.ashar },[cite: 1]
        { name: 'Maghrib', time: j.maghrib },[cite: 1]
        { name: 'Isya', time: j.isya }[cite: 1]
    ];
    const now = new Date();
    let next = null;

    for (let t of times) {
        const [h, m] = t.time.split(':');
        const pTime = new Date();
        pTime.setHours(parseInt(h), parseInt(m), 0);
        if (pTime > now) {
            next = { ...t, dateObj: pTime };
            break;
        }
    }

    if (!next) {
        const [h, m] = times[0].time.split(':');
        const pTime = new Date();
        pTime.setDate(pTime.getDate() + 1);
        pTime.setHours(parseInt(h), parseInt(m), 0);
        next = { name: 'Subuh (Besok)', dateObj: pTime };[cite: 1]
    }

    document.getElementById('next-prayer-name').innerText = next.name;[cite: 1]
    state.nextPrayerTime = next.dateObj;
}

function startTimer() {
    setInterval(() => {
        if (!state.nextPrayerTime) return;
        const diff = state.nextPrayerTime - new Date();
        if (diff <= 0) {
            if (state.prayerData) updateNextPrayer(state.prayerData.jadwal);
            return;
        }
        const hrs = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');[cite: 1]
        const mins = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');[cite: 1]
        const secs = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');[cite: 1]
        document.getElementById('prayer-countdown').innerText = `${hrs}:${mins}:${secs}`;[cite: 1]
    }, 1000);
}

async function loadDailyAyat() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));[cite: 1]
    const surahNo = (dayOfYear % 114) + 1;[cite: 1]
    const data = await fetchSurahDetailAPI(surahNo);

    if (data) {
        const ayat = data.ayat[0];
        document.getElementById('daily-ayat-ref').innerText = `Q.S. ${data.namaLatin}: ${ayat.nomorAyat}`;[cite: 1]
        document.getElementById('daily-ayat-arabic').innerText = ayat.teksArab;[cite: 1]
        document.getElementById('daily-ayat-translation').innerText = ayat.teksIndonesia;[cite: 1]
        state.dailyAyatAudio = ayat.audio['05'];[cite: 1]
    }
}

async function loadDailyHadits() {
    const data = await fetchHaditsBookAPI('bukhari');
    if (data && data.code === 200 && data.data.hadiths.length > 0) {
        const h = data.data.hadiths[0];
        document.getElementById('daily-hadits-arabic').innerText = h.arab.substring(0, 150) + '...';[cite: 1]
        document.getElementById('daily-hadits-translation').innerText = h.id;[cite: 1]
    }
}

async function loadSurahList() {
    const list = await fetchSurahListAPI();
    state.surahList = list;
    renderSurahListUI(list, openSurahModal);
}

async function openSurahModal(nomor) {
    const modal = document.getElementById('surah-modal');[cite: 1]
    const container = document.getElementById('modal-verses-container');[cite: 1]
    modal.classList.remove('hidden');[cite: 1]
    container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400 animate-pulse">Memuat ayat Al-Qur\'an...</div>';[cite: 1]

    const surah = await fetchSurahDetailAPI(nomor);
    if (surah) {
        document.getElementById('modal-surah-title').innerText = `${surah.nomor}. Surah ${surah.namaLatin}`;[cite: 1]
        document.getElementById('modal-surah-subtitle').innerText = `${surah.arti} • ${surah.jumlahAyat} Ayat`;[cite: 1]

        container.innerHTML = surah.ayat.map(a => `
            <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-3">
                <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">${a.nomorAyat}</span>
                    <button class="btn-play-verse text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium" data-audio="${a.audio['05']}"><i class="fa-solid fa-play mr-1"></i> Audio</button>
                </div>
                <p class="text-right font-arabic text-2xl leading-loose text-slate-800">${a.teksArab}</p>
                <p class="text-xs text-emerald-700 font-medium">${a.teksLatin}</p>
                <p class="text-xs text-slate-600 leading-relaxed">${a.teksIndonesia}</p>
            </div>
        `).join('');[cite: 1]

        container.querySelectorAll('.btn-play-verse').forEach(b => {
            b.addEventListener('click', () => {
                new Audio(b.dataset.audio).play();
                showToast("Memutar audio ayat...");[cite: 1]
            });
        });
    }
}

async function loadHaditsBook(bookName) {
    const container = document.getElementById('hadits-feed-container');[cite: 1]
    container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400 animate-pulse">Memuat data hadis...</div>';[cite: 1]

    const data = await fetchHaditsBookAPI(bookName);
    if (data && data.code === 200) {
        container.innerHTML = data.data.hadiths.map(h => `
            <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-2.5">
                <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span class="text-xs font-bold text-blue-700 uppercase">HR. ${bookName} No. ${h.number}</span>
                </div>
                <p class="text-right font-arabic text-xl leading-loose text-slate-800">${h.arab}</p>
                <p class="text-xs text-slate-600 leading-relaxed">${h.id}</p>
            </div>
        `).join('');[cite: 1]
    }
}

function filterDoa(kat) {
    if (kat === 'semua') renderDoaListUI(state.doaList);
    else renderDoaListUI(state.doaList.filter(d => d.kat === kat));
}

function initEventListeners() {
    // Navigation
    document.getElementById('nav-dashboard').addEventListener('click', () => switchTab('dashboard'));
    document.getElementById('nav-quran').addEventListener('click', () => switchTab('quran'));
    document.getElementById('nav-doa').addEventListener('click', () => switchTab('doa'));
    document.getElementById('nav-hadits').addEventListener('click', () => switchTab('hadits'));
    document.getElementById('btn-header-city').addEventListener('click', () => switchTab('sholat'));

    // Dashboard Menus
    document.getElementById('btn-menu-quran').addEventListener('click', () => switchTab('quran'));
    document.getElementById('btn-menu-doa').addEventListener('click', () => switchTab('doa'));
    document.getElementById('btn-menu-hadits').addEventListener('click', () => switchTab('hadits'));
    document.getElementById('btn-menu-sholat').addEventListener('click', () => switchTab('sholat'));
    document.getElementById('btn-menu-pagi').addEventListener('click', () => switchTab('doa', 'pagi'));
    document.getElementById('btn-menu-petang').addEventListener('click', () => switchTab('doa', 'petang'));
    document.getElementById('btn-menu-kiblat').addEventListener('click', () => showToast("Arah Kiblat Indonesia ~294° N-W."));[cite: 1]

    // Tasbih Modals
    const openTasbih = () => document.getElementById('tasbih-modal').classList.remove('hidden');
    const closeTasbih = () => document.getElementById('tasbih-modal').classList.add('hidden');
    document.getElementById('btn-menu-tasbih').addEventListener('click', openTasbih);
    document.getElementById('nav-float-tasbih').addEventListener('click', openTasbih);
    document.getElementById('btn-close-tasbih-modal').addEventListener('click', closeTasbih);

    document.getElementById('btn-count-tasbih').addEventListener('click', () => {
        state.tasbihCount++;
        document.getElementById('tasbih-count').innerText = state.tasbihCount;[cite: 1]
        if (state.tasbihCount % 33 === 0) showToast("33 Hitungan Tercapai!");[cite: 1]
    });

    document.getElementById('btn-reset-tasbih').addEventListener('click', () => {
        state.tasbihCount = 0;
        document.getElementById('tasbih-count').innerText = '0';[cite: 1]
    });

    document.getElementById('btn-next-tasbih').addEventListener('click', () => {
        state.tasbihIndex = (state.tasbihIndex + 1) % state.tasbihPhrases.length;[cite: 1]
        const p = state.tasbihPhrases[state.tasbihIndex];
        document.getElementById('tasbih-phrase').innerText = p.arab;[cite: 1]
        document.getElementById('tasbih-latin').innerText = p.latin;[cite: 1]
        state.tasbihCount = 0;
        document.getElementById('tasbih-count').innerText = '0';[cite: 1]
    });

    // Audio & Search
    document.getElementById('daily-audio-btn').addEventListener('click', () => {
        if (state.dailyAyatAudio) { new Audio(state.dailyAyatAudio).play(); showToast("Memutar audio..."); }
    });

    document.getElementById('btn-close-surah-modal').addEventListener('click', () => {
        document.getElementById('surah-modal').classList.add('hidden');[cite: 1]
    });

    document.getElementById('btn-search-city').addEventListener('click', async () => {
        const q = document.getElementById('city-search-input').value.trim();[cite: 1]
        if (!q) return;
        const res = await searchCityAPI(q);
        const container = document.getElementById('city-search-results');[cite: 1]
        if (res && res.status && res.data.length > 0) {
            container.innerHTML = res.data.map(c => `
                <div class="city-item p-2 hover:bg-emerald-50 rounded-lg cursor-pointer flex justify-between items-center" data-id="${c.id}">
                    <span>${c.lokasi}</span><i class="fa-solid fa-chevron-right text-[10px]"></i>
                </div>
            `).join('');[cite: 1]

            container.querySelectorAll('.city-item').forEach(el => {
                el.addEventListener('click', () => {
                    loadPrayerSchedule(el.dataset.id);
                    container.innerHTML = '';
                    showToast("Lokasi diubah!");[cite: 1]
                });
            });
        }
    });
}