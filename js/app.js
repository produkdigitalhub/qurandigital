import { state } from './config.js';
import { 
    fetchSurahListAPI, fetchSurahDetailAPI, 
    fetchPrayerScheduleAPI, searchCityAPI, fetchHaditsBookAPI,
    fetchDoaListAPI 
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
    
    // Render data lokal bawaan terlebih dahulu
    renderDoaListUI(state.doaList); 
    startTimer();

    // Jalankan semua API secara paralel
    Promise.all([
        loadPrayerSchedule(state.cityId),
        loadDailyAyat(),
        loadDailyHadits(),
        loadSurahList(),
        loadHaditsBook('bukhari'),
        loadAllDoa()
    ]);
}

function setHijriDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const el = document.getElementById('current-hijri-date');
    if (el) el.innerText = `${today.toLocaleDateString('id-ID', options)} • 1447 H`;
}

function switchTab(tabName, filterParam = null) {
    state.activeTab = tabName;
    ['dashboard', 'quran', 'doa', 'hadits', 'sholat'].forEach(v => {
        const view = document.getElementById(`view-${v}`);
        if (view) view.classList.add('hidden');
    });
    const activeView = document.getElementById(`view-${tabName}`);
    if (activeView) activeView.classList.remove('hidden');

    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active-tab');
        btn.classList.add('text-slate-400');
    });

    const activeBtn = document.getElementById(`nav-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.add('active-tab');
        activeBtn.classList.remove('text-slate-400');
    }

    if (tabName === 'doa' && filterParam) {
        filterDoa(filterParam);
    }
}

// ==========================================
// 1. DATA DOA
// ==========================================
async function loadAllDoa() {
    const apiDoa = await fetchDoaListAPI();
    if (apiDoa && apiDoa.length > 0) {
        state.doaList = apiDoa;
        renderDoaListUI(state.doaList);
    }
}

function filterDoa(kat) {
    if (!state.doaList) return;
    
    if (kat === 'semua' || !kat) {
        renderDoaListUI(state.doaList);
    } else {
        const filtered = state.doaList.filter(d => {
            const itemKat = (d.kat || '').toLowerCase();
            return itemKat.includes(kat.toLowerCase());
        });
        renderDoaListUI(filtered);
    }
}

// ==========================================
// 2. JADWAL SHOLAT
// ==========================================
async function loadPrayerSchedule(cityId) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');

    const data = await fetchPrayerScheduleAPI(cityId, yyyy, mm, dd);
    if (data && data.status) {
        state.prayerData = data.data;
        
        const headerCity = document.getElementById('header-city-name');
        if (headerCity) headerCity.innerText = data.data.lokasi.replace('KOTA ', '');
        
        const fullCity = document.getElementById('full-schedule-city');
        if (fullCity) fullCity.innerText = data.data.lokasi;

        const fullDate = document.getElementById('full-schedule-date');
        if (fullDate) fullDate.innerText = data.data.jadwal.tanggal;

        renderPrayerGridUI(data.data.jadwal);
        renderFullPrayerScheduleUI(data.data.jadwal);
        updateNextPrayer(data.data.jadwal);
    }
}

function updateNextPrayer(j) {
    const times = [
        { name: 'Subuh', time: j.subuh },
        { name: 'Dzuhur', time: j.dzuhur },
        { name: 'Ashar', time: j.ashar },
        { name: 'Maghrib', time: j.maghrib },
        { name: 'Isya', time: j.isya }
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
        next = { name: 'Subuh (Besok)', dateObj: pTime };
    }

    const nextEl = document.getElementById('next-prayer-name');
    if (nextEl) nextEl.innerText = next.name;
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
        const hrs = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
        const mins = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
        const secs = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
        
        const timerEl = document.getElementById('prayer-countdown');
        if (timerEl) timerEl.innerText = `${hrs}:${mins}:${secs}`;
    }, 1000);
}

// ==========================================
// 3. QURAN & HADITS
// ==========================================
async function loadDailyAyat() {
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const surahNo = (dayOfYear % 114) + 1;
    const data = await fetchSurahDetailAPI(surahNo);

    if (data) {
        const ayat = data.ayat[0];
        const refEl = document.getElementById('daily-ayat-ref');
        const arabEl = document.getElementById('daily-ayat-arabic');
        const transEl = document.getElementById('daily-ayat-translation');

        if (refEl) refEl.innerText = `Q.S. ${data.namaLatin}: ${ayat.nomorAyat}`;
        if (arabEl) arabEl.innerText = ayat.teksArab;
        if (transEl) transEl.innerText = ayat.teksIndonesia;
        state.dailyAyatAudio = ayat.audio['05'];
    }
}

async function loadDailyHadits() {
    const data = await fetchHaditsBookAPI('bukhari');
    if (data && data.code === 200 && data.data.hadiths.length > 0) {
        const h = data.data.hadiths[0];
        const arabEl = document.getElementById('daily-hadits-arabic');
        const transEl = document.getElementById('daily-hadits-translation');

        if (arabEl) arabEl.innerText = h.arab ? h.arab.substring(0, 150) + '...' : '';
        if (transEl) transEl.innerText = h.id || '';
    }
}

async function loadSurahList() {
    const list = await fetchSurahListAPI();
    state.surahList = list;
    renderSurahListUI(list, openSurahModal);
}

async function openSurahModal(nomor) {
    const modal = document.getElementById('surah-modal');
    const container = document.getElementById('modal-verses-container');
    if (modal) modal.classList.remove('hidden');
    if (container) container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400 animate-pulse">Memuat ayat Al-Qur\'an...</div>';

    const surah = await fetchSurahDetailAPI(nomor);
    if (surah) {
        const titleEl = document.getElementById('modal-surah-title');
        const subEl = document.getElementById('modal-surah-subtitle');

        if (titleEl) titleEl.innerText = `${surah.nomor}. Surah ${surah.namaLatin}`;
        if (subEl) subEl.innerText = `${surah.arti} • ${surah.jumlahAyat} Ayat`;

        if (container) {
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
            `).join('');

            container.querySelectorAll('.btn-play-verse').forEach(b => {
                b.addEventListener('click', () => {
                    new Audio(b.dataset.audio).play();
                    showToast("Memutar audio ayat...");
                });
            });
        }
    }
}

// SATU-SATUNYA DEKLARASI loadHaditsBook
async function loadHaditsBook(bookName) {
    const container = document.getElementById('hadits-feed-container');
    if (!container) return;
    container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400 animate-pulse">Memuat data hadis...</div>';

    const data = await fetchHaditsBookAPI(bookName);
    if (data && data.code === 200 && data.data.hadiths.length > 0) {
        container.innerHTML = data.data.hadiths.map(h => `
            <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-2.5">
                <div class="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span class="text-xs font-bold text-emerald-700 uppercase">${h.judul || 'HR. ' + bookName + ' No. ' + h.number}</span>
                </div>
                <p class="text-right font-arabic text-xl leading-loose text-slate-800">${h.arab}</p>
                <p class="text-xs text-slate-600 leading-relaxed">${h.id}</p>
            </div>
        `).join('');
    } else {
        container.innerHTML = '<div class="p-4 text-center text-xs text-amber-600">Gagal memuat data hadits.</div>';
    }
}

// ==========================================
// 4. EVENT LISTENERS
// ==========================================
function initEventListeners() {
    // Pencarian Global
    const globalSearchInput = document.querySelector('input[placeholder*="Cari Surah"]');
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (state.surahList && state.surahList.length > 0) {
                const filteredSurah = state.surahList.filter(s => 
                    s.namaLatin.toLowerCase().includes(query) ||
                    s.nama.toLowerCase().includes(query) ||
                    s.nomor.toString() === query
                );
                renderSurahListUI(filteredSurah, openSurahModal);
            }

            if (state.doaList && state.doaList.length > 0) {
                const filteredDoa = state.doaList.filter(d => 
                    (d.judul && d.judul.toLowerCase().includes(query)) ||
                    (d.latin && d.latin.toLowerCase().includes(query)) ||
                    (d.arti && d.arti.toLowerCase().includes(query))
                );
                renderDoaListUI(filteredDoa);
            }

            const haditsCards = document.querySelectorAll('#hadits-feed-container > div');
            haditsCards.forEach(card => {
                const text = card.innerText.toLowerCase();
                if (text.includes(query)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });

            if (query.length > 0 && state.activeTab === 'dashboard') {
                switchTab('quran');
            }
        });
    }

    // Filter Kategori Doa (Chips)
    document.querySelectorAll('.doa-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.doa-filter-btn').forEach(b => {
                b.classList.remove('bg-emerald-600', 'text-white', 'shadow-sm');
                b.classList.add('bg-slate-100', 'text-slate-600');
            });
            const target = e.currentTarget;
            target.classList.remove('bg-slate-100', 'text-slate-600');
            target.classList.add('bg-emerald-600', 'text-white', 'shadow-sm');

            const kat = target.dataset.kat;
            filterDoa(kat);
        });
    });

    // Navigasi
    document.getElementById('nav-dashboard')?.addEventListener('click', () => switchTab('dashboard'));
    document.getElementById('nav-quran')?.addEventListener('click', () => switchTab('quran'));
    document.getElementById('nav-doa')?.addEventListener('click', () => switchTab('doa'));
    document.getElementById('nav-hadits')?.addEventListener('click', () => switchTab('hadits'));
    document.getElementById('btn-header-city')?.addEventListener('click', () => switchTab('sholat'));

    // Dashboard
    document.getElementById('btn-menu-quran')?.addEventListener('click', () => switchTab('quran'));
    document.getElementById('btn-menu-doa')?.addEventListener('click', () => switchTab('doa'));
    document.getElementById('btn-menu-hadits')?.addEventListener('click', () => switchTab('hadits'));
    document.getElementById('btn-menu-sholat')?.addEventListener('click', () => switchTab('sholat'));
    document.getElementById('btn-menu-pagi')?.addEventListener('click', () => switchTab('doa', 'pagi'));
    document.getElementById('btn-menu-petang')?.addEventListener('click', () => switchTab('doa', 'petang'));
    document.getElementById('btn-menu-kiblat')?.addEventListener('click', () => showToast("Arah Kiblat Indonesia ~294° N-W."));

    // Tasbih Modal
    const openTasbih = () => document.getElementById('tasbih-modal')?.classList.remove('hidden');
    const closeTasbih = () => document.getElementById('tasbih-modal')?.classList.add('hidden');
    document.getElementById('btn-menu-tasbih')?.addEventListener('click', openTasbih);
    document.getElementById('nav-float-tasbih')?.addEventListener('click', openTasbih);
    document.getElementById('btn-close-tasbih-modal')?.addEventListener('click', closeTasbih);

    document.getElementById('btn-count-tasbih')?.addEventListener('click', () => {
        state.tasbihCount++;
        const el = document.getElementById('tasbih-count');
        if (el) el.innerText = state.tasbihCount;
        if (state.tasbihCount % 33 === 0) showToast("33 Hitungan Tercapai!");
    });

    document.getElementById('btn-reset-tasbih')?.addEventListener('click', () => {
        state.tasbihCount = 0;
        const el = document.getElementById('tasbih-count');
        if (el) el.innerText = '0';
    });

    document.getElementById('btn-next-tasbih')?.addEventListener('click', () => {
        state.tasbihIndex = (state.tasbihIndex + 1) % state.tasbihPhrases.length;
        const p = state.tasbihPhrases[state.tasbihIndex];
        
        const phraseEl = document.getElementById('tasbih-phrase');
        const latinEl = document.getElementById('tasbih-latin');
        const countEl = document.getElementById('tasbih-count');

        if (phraseEl) phraseEl.innerText = p.arab;
        if (latinEl) latinEl.innerText = p.latin;
        state.tasbihCount = 0;
        if (countEl) countEl.innerText = '0';
    });

    // Audio & Modal Surah & Pencarian Kota
    document.getElementById('daily-audio-btn')?.addEventListener('click', () => {
        if (state.dailyAyatAudio) { new Audio(state.dailyAyatAudio).play(); showToast("Memutar audio..."); }
    });

    document.getElementById('btn-close-surah-modal')?.addEventListener('click', () => {
        document.getElementById('surah-modal')?.classList.add('hidden');
    });

    document.getElementById('btn-search-city')?.addEventListener('click', async () => {
        const input = document.getElementById('city-search-input');
        if (!input) return;
        const q = input.value.trim();
        if (!q) return;
        const res = await searchCityAPI(q);
        const container = document.getElementById('city-search-results');
        if (res && res.status && res.data.length > 0 && container) {
            container.innerHTML = res.data.map(c => `
                <div class="city-item p-2 hover:bg-emerald-50 rounded-lg cursor-pointer flex justify-between items-center" data-id="${c.id}">
                    <span>${c.lokasi}</span><i class="fa-solid fa-chevron-right text-[10px]"></i>
                </div>
            `).join('');

            container.querySelectorAll('.city-item').forEach(el => {
                el.addEventListener('click', () => {
                    loadPrayerSchedule(el.dataset.id);
                    container.innerHTML = '';
                    showToast("Lokasi diubah!");
                });
            });
        }
    });
}
