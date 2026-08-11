console.log('=== APP.JS BERHASIL DIMUAT ===');
import { state } from './config.js';

import {
    fetchSurahListAPI,
    fetchSurahDetailAPI,
    fetchPrayerScheduleAPI,
    searchCityAPI,
    fetchHaditsBookAPI,
    fetchDoaListAPI,
    calculateFiqihTimes
} from './api.js';

import {
    initializeUIComponents,
    showToast,
    renderSurahListUI,
    renderDoaListUI,
    renderPrayerGridUI,
    renderFullPrayerScheduleUI
} from './ui.js';

import {
    initTelegramFeed,
    openTelegramModal
} from './telegramfeed.js';


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', async () => {

    console.log('[QURAN DIGITAL] DOMContentLoaded');

    await initApp();

});


// ============================================================
// INIT APP
// ============================================================

async function initApp() {

    console.log('[QURAN DIGITAL] initApp()');

    try {

        // ------------------------------------------------------
        // 1. Load semua komponen HTML terlebih dahulu
        // ------------------------------------------------------

        if (typeof initializeUIComponents === 'function') {

            console.log('[UI] Memuat komponen...');

            await initializeUIComponents();

            console.log('[UI] Semua komponen selesai dimuat');

        } else {

            console.warn(
                '[UI] initializeUIComponents tidak tersedia'
            );

        }


        // ------------------------------------------------------
        // 2. Setup tanggal
        // ------------------------------------------------------

        setHijriDate();


        // ------------------------------------------------------
        // 3. Setup event
        // ------------------------------------------------------

        initEventListeners();


        // ------------------------------------------------------
        // 4. Dashboard pertama
        // ------------------------------------------------------

        switchTab('dashboard');


        // ------------------------------------------------------
        // 5. Telegram
        // ------------------------------------------------------

        try {

            initTelegramFeed();

        } catch (error) {

            console.error(
                '[TELEGRAM]',
                error
            );

        }


        // ------------------------------------------------------
        // 6. Render doa dari state
        // ------------------------------------------------------

        if (
            state.doaList &&
            state.doaList.length > 0
        ) {

            renderDoaListUI(
                state.doaList
            );

        }


        // ------------------------------------------------------
        // 7. Timer
        // ------------------------------------------------------

        startTimer();


        // ------------------------------------------------------
        // 8. Load semua data
        // ------------------------------------------------------

        console.log(
            '[DATA] Mulai memuat data aplikasi...'
        );

        const results =
            await Promise.allSettled([

                loadPrayerSchedule(
                    state.cityId
                ),

                loadDailyAyat(),

                loadDailyHadits(),

                loadSurahList(),

                renderHaditsFeed(
                    'bukhari'
                ),

                loadAllDoa()

            ]);


        console.log(
            '[DATA] Loading selesai:',
            results
        );


    } catch (error) {

        console.error(
            '[INIT APP ERROR]',
            error
        );

    }

}


// ============================================================
// TANGGAL
// ============================================================

function setHijriDate() {

    const today = new Date();

    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    const el =
        document.getElementById(
            'current-hijri-date'
        );

    if (el) {

        el.innerText =
            `${today.toLocaleDateString(
                'id-ID',
                options
            )} • 1447 H`;

    }

}


// ============================================================
// NAVIGASI
// ============================================================

function switchTab(
    tabName,
    filterParam = null
) {

    console.log(
        '[NAVIGASI] switchTab:',
        tabName
    );


    state.activeTab =
        tabName;


    const views = [
        'dashboard',
        'quran',
        'doa',
        'hadits',
        'sholat'
    ];


    // ----------------------------------------------------------
    // Hide semua view
    // ----------------------------------------------------------

    views.forEach(
        viewName => {

            const view =
                document.getElementById(
                    `view-${viewName}`
                );

            if (view) {

                view.classList.add(
                    'hidden'
                );

                view.style.display =
                    'none';

            }

        }
    );


    // ----------------------------------------------------------
    // Tampilkan view aktif
    // ----------------------------------------------------------

    const activeView =
        document.getElementById(
            `view-${tabName}`
        );


    if (!activeView) {

        console.error(
            `[NAVIGASI] view-${tabName} tidak ditemukan`
        );

        return;

    }


    activeView.classList.remove(
        'hidden'
    );

    activeView.style.display =
        '';


    console.log(
        `[NAVIGASI] view-${tabName} berhasil ditampilkan`
    );


    // ----------------------------------------------------------
    // Update navigation
    // ----------------------------------------------------------

    document
        .querySelectorAll('.nav-item')
        .forEach(
            btn => {

                btn.classList.remove(
                    'active-tab'
                );

                btn.classList.add(
                    'text-slate-400'
                );

            }
        );


    const activeBtn =
        document.getElementById(
            `nav-${tabName}`
        );


    if (activeBtn) {

        activeBtn.classList.add(
            'active-tab'
        );

        activeBtn.classList.remove(
            'text-slate-400'
        );

    }


    // ----------------------------------------------------------
    // Filter doa
    // ----------------------------------------------------------

    if (
        tabName === 'doa' &&
        filterParam
    ) {

        filterDoa(
            filterParam
        );

    }

}


// ============================================================
// EXPORT SWITCHTAB KE WINDOW
// ============================================================
//
// Karena app.js menggunakan ES Module,
// function tidak otomatis tersedia di Console.
//
// Dengan ini:
//
// switchTab('quran')
//
// bisa dipanggil dari Console.
//

window.switchTab =
    switchTab;


// ============================================================
// DOA
// ============================================================

async function loadAllDoa() {

    console.log(
        '[DOA] Memuat data doa...'
    );


    try {

        const apiDoa =
            await fetchDoaListAPI();


        console.log(
            '[DOA] Response:',
            apiDoa
        );


        if (
            Array.isArray(apiDoa) &&
            apiDoa.length > 0
        ) {

            state.doaList =
                apiDoa;


            renderDoaListUI(
                state.doaList
            );


            console.log(
                `[DOA] ${apiDoa.length} doa berhasil dirender`
            );

        } else {

            console.warn(
                '[DOA] Data doa kosong'
            );

        }


    } catch (error) {

        console.error(
            '[DOA] Error:',
            error
        );

    }

}


function filterDoa(kat) {

    if (!state.doaList) {
        return;
    }


    if (
        kat === 'semua' ||
        !kat
    ) {

        renderDoaListUI(
            state.doaList
        );

        return;

    }


    const filtered =
        state.doaList.filter(
            d => {

                const itemKat =
                    (
                        d.kat ||
                        d.grup ||
                        d.kategori ||
                        ''
                    )
                    .toLowerCase();


                return itemKat.includes(
                    kat.toLowerCase()
                );

            }
        );


    renderDoaListUI(
        filtered
    );

}


// ============================================================
// JADWAL SHOLAT
// ============================================================

async function loadPrayerSchedule(
    cityId
) {

    try {

        const now =
            new Date();


        const yyyy =
            now.getFullYear();


        const mm =
            String(
                now.getMonth() + 1
            )
            .padStart(
                2,
                '0'
            );


        const dd =
            String(
                now.getDate()
            )
            .padStart(
                2,
                '0'
            );


        const data =
            await fetchPrayerScheduleAPI(
                cityId,
                yyyy,
                mm,
                dd
            );


        if (
            data &&
            data.status
        ) {

            state.prayerData =
                data.data;


            const headerCity =
                document.getElementById(
                    'header-city-name'
                );


            if (
                headerCity &&
                data.data.lokasi
            ) {

                headerCity.innerText =
                    data.data.lokasi.replace(
                        'KOTA ',
                        ''
                    );

            }


            const fullCity =
                document.getElementById(
                    'full-schedule-city'
                );


            if (fullCity) {

                fullCity.innerText =
                    data.data.lokasi ||
                    '';

            }


            const fullDate =
                document.getElementById(
                    'full-schedule-date'
                );


            if (fullDate) {

                fullDate.innerText =
                    data.data.jadwal?.tanggal ||
                    '';

            }


            renderPrayerGridUI(
                data.data.jadwal
            );


            renderFullPrayerScheduleUI(
                data.data.jadwal
            );


            updateNextPrayer(
                data.data.jadwal
            );


            updateFiqihUI(
                data.data.jadwal
            );

        }


    } catch (error) {

        console.error(
            '[SHOLAT] Error:',
            error
        );

    }

}


// ============================================================
// FIQIH
// ============================================================

function updateFiqihUI(
    jadwal
) {

    if (!jadwal) {
        return;
    }


    const fiqihData =
        calculateFiqihTimes(
            jadwal
        );


    if (!fiqihData) {
        return;
    }


    const elSyuruq =
        document.getElementById(
            'time-syuruq'
        );


    const elDhuha =
        document.getElementById(
            'status-dhuha'
        );


    if (elSyuruq) {

        elSyuruq.innerText =
            fiqihData.syuruq ||
            '--:--';

    }


    if (elDhuha) {

        elDhuha.innerText =
            `Awal Dhuha: ~${
                fiqihData.dhuha ||
                '--:--'
            }`;

    }


    const elTahajud =
        document.getElementById(
            'time-tahajud'
        );


    if (elTahajud) {

        elTahajud.innerText =
            fiqihData.tahajud ||
            '--:--';

    }


    const container =
        document.getElementById(
            'status-haram-container'
        );


    const title =
        document.getElementById(
            'status-haram-title'
        );


    const desc =
        document.getElementById(
            'status-haram-desc'
        );


    if (
        container &&
        title &&
        desc &&
        fiqihData.statusHaram
    ) {

        title.innerText =
            fiqihData.statusHaram.title;


        desc.innerText =
            fiqihData.statusHaram.desc;


        if (
            fiqihData.statusHaram.type ===
            'danger'
        ) {

            container.className =
                'bg-rose-950/40 border border-rose-500/30 rounded-2xl p-3 flex items-center gap-3';

            title.className =
                'text-[11px] font-bold text-rose-300';


        } else if (
            fiqihData.statusHaram.type ===
            'warning'
        ) {

            container.className =
                'bg-amber-950/40 border border-amber-500/30 rounded-2xl p-3 flex items-center gap-3';

            title.className =
                'text-[11px] font-bold text-amber-300';


        } else {

            container.className =
                'bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-3 flex items-center gap-3';

            title.className =
                'text-[11px] font-bold text-emerald-300';

        }

    }

}


// ============================================================
// NEXT PRAYER
// ============================================================

function updateNextPrayer(j) {

    if (!j) {
        return;
    }


    const times = [

        {
            name: 'Subuh',
            time: j.subuh
        },

        {
            name: 'Dzuhur',
            time: j.dzuhur
        },

        {
            name: 'Ashar',
            time: j.ashar
        },

        {
            name: 'Maghrib',
            time: j.maghrib
        },

        {
            name: 'Isya',
            time: j.isya
        }

    ];


    const now =
        new Date();


    let next =
        null;


    for (
        const t of times
    ) {

        if (!t.time) {
            continue;
        }


        const parts =
            t.time.split(':');


        const h =
            parseInt(
                parts[0],
                10
            );


        const m =
            parseInt(
                parts[1],
                10
            );


        const pTime =
            new Date();


        pTime.setHours(
            h,
            m,
            0,
            0
        );


        if (
            pTime > now
        ) {

            next = {

                ...t,

                dateObj:
                    pTime

            };

            break;

        }

    }


    // ----------------------------------------------------------
    // Jika semua waktu hari ini sudah lewat
    // ----------------------------------------------------------

    if (
        !next &&
        times[0]?.time
    ) {

        const parts =
            times[0].time.split(':');


        const h =
            parseInt(
                parts[0],
                10
            );


        const m =
            parseInt(
                parts[1],
                10
            );


        const pTime =
            new Date();


        pTime.setDate(
            pTime.getDate() + 1
        );


        pTime.setHours(
            h,
            m,
            0,
            0
        );


        next = {

            name:
                'Subuh (Besok)',

            dateObj:
                pTime

        };

    }


    if (!next) {
        return;
    }


    const nextEl =
        document.getElementById(
            'next-prayer-name'
        );


    if (nextEl) {

        nextEl.innerText =
            next.name;

    }


    state.nextPrayerTime =
        next.dateObj;

}


// ============================================================
// TIMER
// ============================================================

function startTimer() {

    setInterval(
        () => {

            if (
                state.prayerData
            ) {

                updateFiqihUI(
                    state.prayerData.jadwal
                );

            }


            if (
                !state.nextPrayerTime
            ) {

                return;

            }


            const diff =
                state.nextPrayerTime -
                new Date();


            if (
                diff <= 0
            ) {

                if (
                    state.prayerData
                ) {

                    updateNextPrayer(
                        state.prayerData.jadwal
                    );

                }

                return;

            }


            const hrs =
                String(
                    Math.floor(
                        (
                            diff /
                            (
                                1000 *
                                60 *
                                60
                            )
                        ) % 24
                    )
                )
                .padStart(
                    2,
                    '0'
                );


            const mins =
                String(
                    Math.floor(
                        (
                            diff /
                            (
                                1000 *
                                60
                            )
                        ) % 60
                    )
                )
                .padStart(
                    2,
                    '0'
                );


            const secs =
                String(
                    Math.floor(
                        (
                            diff /
                            1000
                        ) % 60
                    )
                )
                .padStart(
                    2,
                    '0'
                );


            const timerEl =
                document.getElementById(
                    'prayer-countdown'
                );


            if (timerEl) {

                timerEl.innerText =
                    `${hrs}:${mins}:${secs}`;

            }

        },
        1000
    );

}


// ============================================================
// QURAN - AYAT HARIAN
// ============================================================

async function loadDailyAyat() {

    try {

        const startOfYear =
            new Date(
                new Date().getFullYear(),
                0,
                0
            );


        const dayOfYear =
            Math.floor(
                (
                    new Date() -
                    startOfYear
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        const surahNo =
            (dayOfYear % 114) + 1;


        const data =
            await fetchSurahDetailAPI(
                surahNo
            );


        if (
            !data ||
            !Array.isArray(
                data.ayat
            )
        ) {

            return;

        }


        const ayat =
            data.ayat[0];


        if (!ayat) {
            return;
        }


        const refEl =
            document.getElementById(
                'daily-ayat-ref'
            );


        const arabEl =
            document.getElementById(
                'daily-ayat-arabic'
            );


        const transEl =
            document.getElementById(
                'daily-ayat-translation'
            );


        if (refEl) {

            refEl.innerText =
                `Q.S. ${
                    data.namaLatin ||
                    ''
                }: ${
                    ayat.nomorAyat ||
                    ''
                }`;

        }


        if (arabEl) {

            arabEl.innerText =
                ayat.teksArab ||
                '';

        }


        if (transEl) {

            transEl.innerText =
                ayat.teksIndonesia ||
                '';

        }


        if (
            ayat.audio &&
            ayat.audio['05']
        ) {

            state.dailyAyatAudio =
                ayat.audio['05'];

        }


    } catch (error) {

        console.error(
            '[AYAT HARIAN]',
            error
        );

    }

}


// ============================================================
// HADIS HARIAN
// ============================================================

async function loadDailyHadits() {

    try {

        const data =
            await fetchHaditsBookAPI(
                'bukhari'
            );


        if (
            data &&
            data.code === 200 &&
            data.data &&
            Array.isArray(
                data.data.hadiths
            ) &&
            data.data.hadiths.length
        ) {

            const h =
                data.data.hadiths[0];


            const arabEl =
                document.getElementById(
                    'daily-hadits-arabic'
                );


            const transEl =
                document.getElementById(
                    'daily-hadits-translation'
                );


            if (arabEl) {

                arabEl.innerText =
                    h.arab
                        ? h.arab.substring(
                            0,
                            150
                        ) + '...'
                        : '';

            }


            if (transEl) {

                transEl.innerText =
                    h.id ||
                    '';

            }

        }


    } catch (error) {

        console.error(
            '[HADIS HARIAN]',
            error
        );

    }

}


// ============================================================
// QURAN - DAFTAR SURAH
// ============================================================

async function loadSurahList() {

    console.log(
        '[QURAN] Memuat daftar surah...'
    );


    try {

        let list = [];


        // ------------------------------------------------------
        // Coba gunakan API module
        // ------------------------------------------------------

        if (
            typeof fetchSurahListAPI ===
            'function'
        ) {

            list =
                await fetchSurahListAPI();

        }


        // ------------------------------------------------------
        // Jika API module gagal / kosong,
        // gunakan langsung equran.id
        // ------------------------------------------------------

        if (
            !Array.isArray(list) ||
            list.length === 0
        ) {

            console.warn(
                '[QURAN] API module kosong, menggunakan fallback'
            );


            const response =
                await fetch(
                    'https://equran.id/api/v2/surat'
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const json =
                await response.json();


            list =
                json.data || [];

        }


        console.log(
            '[QURAN] Jumlah surah:',
            list.length
        );


        state.surahList =
            Array.isArray(list)
                ? list
                : [];


        // ------------------------------------------------------
        // Render
        // ------------------------------------------------------

        renderSurahListUI(
            state.surahList,
            openSurahModal
        );


        console.log(
            `[QURAN] ${state.surahList.length} surah berhasil dirender`
        );


    } catch (error) {

        console.error(
            '[QURAN] Gagal memuat daftar:',
            error
        );


        const container =
            document.getElementById(
                'surah-list'
            ) ||
            document.getElementById(
                'surah-list-container'
            );


        if (container) {

            container.innerHTML = `
                <div class="p-4 text-center text-xs text-red-500">
                    Gagal memuat daftar Al-Qur'an.
                    <br>
                    <button
                        id="btn-retry-quran"
                        class="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-lg"
                    >
                        Coba Lagi
                    </button>
                </div>
            `;


            document
                .getElementById(
                    'btn-retry-quran'
                )
                ?.addEventListener(
                    'click',
                    loadSurahList
                );

        }

    }

}


// ============================================================
// DETAIL SURAH
// ============================================================

async function openSurahModal(
    nomor
) {

    console.log(
        '[QURAN] Membuka surah:',
        nomor
    );


    const modal =
        document.getElementById(
            'surah-modal'
        );


    const container =
        document.getElementById(
            'modal-verses-container'
        );


    if (modal) {

        modal.classList.remove(
            'hidden'
        );

    }


    if (container) {

        container.innerHTML =
            `
            <div class="p-4 text-center text-xs text-slate-400 animate-pulse">
                Memuat ayat Al-Qur'an...
            </div>
            `;

    }


    try {

        let surah =
            await fetchSurahDetailAPI(
                nomor
            );


        // ------------------------------------------------------
        // Fallback langsung equran.id
        // ------------------------------------------------------

        if (!surah) {

            const response =
                await fetch(
                    `https://equran.id/api/v2/surat/${nomor}`
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const json =
                await response.json();


            surah =
                json.data;

        }


        if (
            !surah ||
            !Array.isArray(
                surah.ayat
            )
        ) {

            throw new Error(
                'Data detail surah tidak valid'
            );

        }


        const titleEl =
            document.getElementById(
                'modal-surah-title'
            );


        const subEl =
            document.getElementById(
                'modal-surah-subtitle'
            );


        if (titleEl) {

            titleEl.innerText =
                `${surah.nomor}. Surah ${
                    surah.namaLatin ||
                    ''
                }`;

        }


        if (subEl) {

            subEl.innerText =
                `${surah.arti || ''} • ${
                    surah.jumlahAyat ||
                    surah.ayat.length
                } Ayat`;

        }


        if (!container) {
            return;
        }


        container.innerHTML =
            surah.ayat
                .map(
                    a => `

                    <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-3">

                        <div class="flex justify-between items-center border-b border-slate-100 pb-2">

                            <span class="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                                ${a.nomorAyat}
                            </span>

                            <button
                                class="btn-play-verse text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium"
                                data-audio="${a.audio?.['05'] || ''}"
                            >
                                <i class="fa-solid fa-play mr-1"></i>
                                Audio
                            </button>

                        </div>

                        <p class="text-right font-arabic text-2xl leading-loose text-slate-800">
                            ${a.teksArab || ''}
                        </p>

                        <p class="text-xs text-emerald-700 font-medium">
                            ${a.teksLatin || ''}
                        </p>

                        <p class="text-xs text-slate-600 leading-relaxed">
                            ${a.teksIndonesia || ''}
                        </p>

                    </div>

                    `
                )
                .join('');


        // ------------------------------------------------------
        // Audio ayat
        // ------------------------------------------------------

        container
            .querySelectorAll(
                '.btn-play-verse'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        'click',
                        () => {

                            const audio =
                                button.dataset.audio;


                            if (!audio) {

                                showToast(
                                    'Audio tidak tersedia'
                                );

                                return;

                            }


                            new Audio(
                                audio
                            ).play();


                            showToast(
                                'Memutar audio ayat...'
                            );

                        }
                    );

                }
            );


    } catch (error) {

        console.error(
            '[QURAN DETAIL]',
            error
        );


        if (container) {

            container.innerHTML = `
                <div class="p-4 text-center text-xs text-red-500">
                    Gagal memuat ayat.
                </div>
            `;

        }

    }

}


// ============================================================
// HADIS FEED
// ============================================================

async function renderHaditsFeed(
    bookName
) {

    const container =
        document.getElementById(
            'hadits-feed-container'
        );


    if (!container) {
        return;
    }


    container.innerHTML =
        `
        <div class="p-4 text-center text-xs text-slate-400 animate-pulse">
            Memuat data hadis...
        </div>
        `;


    try {

        const data =
            await fetchHaditsBookAPI(
                bookName
            );


        console.log(
            '[HADIS] Response:',
            data
        );


        if (
            data &&
            data.code === 200 &&
            data.data &&
            Array.isArray(
                data.data.hadiths
            ) &&
            data.data.hadiths.length > 0
        ) {

            container.innerHTML =
                data.data.hadiths
                    .map(
                        h => `

                        <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-2.5">

                            <div class="flex justify-between items-center border-b border-slate-100 pb-2">

                                <span class="text-xs font-bold text-emerald-700 uppercase">
                                    HR. ${bookName} No. ${
                                        h.number || '-'
                                    }
                                </span>

                            </div>

                            <p class="text-right font-arabic text-xl leading-loose text-slate-800">
                                ${h.arab || ''}
                            </p>

                            <p class="text-xs text-slate-600 leading-relaxed">
                                ${h.id || ''}
                            </p>

                        </div>

                        `
                    )
                    .join('');

        } else {

            container.innerHTML =
                `
                <div class="p-4 text-center text-xs text-amber-600">
                    Gagal memuat data hadits.
                </div>
                `;

        }


    } catch (error) {

        console.error(
            '[HADIS] Error:',
            error
        );


        container.innerHTML =
            `
            <div class="p-4 text-center text-xs text-red-500">
                Terjadi kesalahan saat memuat hadis.
            </div>
            `;

    }

}


// ============================================================
// EVENT LISTENERS
// ============================================================

function initEventListeners() {

    console.log(
        '[EVENT] Memasang event listener...'
    );


    // ========================================================
    // SEARCH
    // ========================================================

    const globalSearchInput =
        document.getElementById(
            'global-search-input'
        );


    if (globalSearchInput) {

        globalSearchInput.addEventListener(
            'input',
            e => {

                const query =
                    e.target.value
                        .toLowerCase()
                        .trim();


                // ------------------------------
                // Search Quran
                // ------------------------------

                if (
                    state.surahList &&
                    state.surahList.length > 0
                ) {

                    const filteredSurah =
                        state.surahList.filter(
                            s =>

                                (
                                    s.namaLatin ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )

                                ||

                                (
                                    s.nama ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )

                                ||

                                String(
                                    s.nomor
                                ) === query

                        );


                    renderSurahListUI(
                        filteredSurah,
                        openSurahModal
                    );

                }


                // ------------------------------
                // Search Doa
                // ------------------------------

                if (
                    state.doaList &&
                    state.doaList.length > 0
                ) {

                    const filteredDoa =
                        state.doaList.filter(
                            d =>

                                (
                                    d.judul ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )

                                ||

                                (
                                    d.latin ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )

                                ||

                                (
                                    d.arti ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )

                                ||

                                (
                                    d.kat ||
                                    ''
                                )
                                    .toLowerCase()
                                    .includes(
                                        query
                                    )

                        );


                    renderDoaListUI(
                        filteredDoa
                    );

                }


                // ------------------------------
                // Search Hadis
                // ------------------------------

                const haditsCards =
                    document.querySelectorAll(
                        '#hadits-feed-container > div'
                    );


                haditsCards.forEach(
                    card => {

                        const text =
                            card.innerText
                                .toLowerCase();


                        card.classList.toggle(
                            'hidden',
                            !text.includes(
                                query
                            )
                        );

                    }
                );


                // ------------------------------
                // Jika search dari dashboard
                // buka Quran
                // ------------------------------

                if (
                    query.length > 0 &&
                    state.activeTab ===
                    'dashboard'
                ) {

                    switchTab(
                        'quran'
                    );

                }

            }
        );

    }


    // ========================================================
    // KITAB HADIS
    // ========================================================

    document
        .querySelectorAll(
            '#hadits-books-grid button'
        )
        .forEach(
            btn => {

                btn.addEventListener(
                    'click',
                    e => {

                        const bookName =
                            e.currentTarget
                                .dataset.book;


                        document
                            .querySelectorAll(
                                '#hadits-books-grid button'
                            )
                            .forEach(
                                b => {

                                    b.classList.remove(
                                        'border-2',
                                        'border-emerald-500'
                                    );

                                    b.classList.add(
                                        'border',
                                        'border-slate-200'
                                    );

                                }
                            );


                        e.currentTarget
                            .classList.remove(
                                'border-slate-200'
                            );


                        e.currentTarget
                            .classList.add(
                                'border-2',
                                'border-emerald-500'
                            );


                        renderHaditsFeed(
                            bookName
                        );

                    }
                );

            }
        );


    // ========================================================
    // FILTER DOA
    // ========================================================

    document
        .querySelectorAll(
            '#doa-category-chips button'
        )
        .forEach(
            btn => {

                btn.addEventListener(
                    'click',
                    e => {

                        document
                            .querySelectorAll(
                                '#doa-category-chips button'
                            )
                            .forEach(
                                b => {

                                    b.classList.remove(
                                        'bg-emerald-600',
                                        'text-white',
                                        'shadow-sm'
                                    );

                                    b.classList.add(
                                        'bg-white',
                                        'border',
                                        'border-slate-200',
                                        'text-slate-600'
                                    );

                                }
                            );


                        const target =
                            e.currentTarget;


                        target.classList.remove(
                            'bg-white',
                            'border',
                            'border-slate-200',
                            'text-slate-600'
                        );


                        target.classList.add(
                            'bg-emerald-600',
                            'text-white',
                            'shadow-sm'
                        );


                        filterDoa(
                            target.dataset.cat
                        );

                    }
                );

            }
        );


    // ========================================================
    // BOTTOM NAVIGATION
    // ========================================================

    document
        .getElementById(
            'nav-dashboard'
        )
        ?.addEventListener(
            'click',
            () =>
                switchTab(
                    'dashboard'
                )
        );


    document
        .getElementById(
            'nav-quran'
        )
        ?.addEventListener(
            'click',
            () =>
                switchTab(
                    'quran'
                )
        );


    document
        .getElementById(
            'nav-doa'
        )
        ?.addEventListener(
            'click',
            () =>
                switchTab(
                    'doa'
                )
        );


    document
        .getElementById(
            'nav-hadits'
        )
        ?.addEventListener(
            'click',
            () =>
                switchTab(
                    'hadits'
                )
        );


    document
        .getElementById(
            'btn-header-city'
        )
        ?.addEventListener(
            'click',
            () =>
                switchTab(
                    'sholat'
                )
        );


    // ========================================================
    // MENU QURAN
    // ========================================================

    document
        .getElementById(
            'btn-menu-quran'
        )
        ?.addEventListener(
            'click',
            e => {

                e.preventDefault();

                console.log(
                    '[MENU] Al-Quran diklik'
                );

                switchTab(
                    'quran'
                );

            }
        );


    // ========================================================
    // MENU DOA
    // ========================================================

    document
        .getElementById(
            'btn-menu-doa'
        )
        ?.addEventListener(
            'click',
            e => {

                e.preventDefault();

                switchTab(
                    'doa'
                );

            }
        );


    // ========================================================
    // MENU HADIS
    // ========================================================

    document
        .getElementById(
            'btn-menu-hadits'
        )
        ?.addEventListener(
            'click',
            e => {

                e.preventDefault();

                switchTab(
                    'hadits'
                );

            }
        );


    // ========================================================
    // MENU SHOLAT
    // ========================================================

    document
        .getElementById(
            'btn-menu-sholat'
        )
        ?.addEventListener(
            'click',
            e => {

                e.preventDefault();

                switchTab(
                    'sholat'
                );

            }
        );


    // ========================================================
    // PAGI
    // ========================================================

    document
        .getElementById(
            'btn-menu-pagi'
        )
        ?.addEventListener(
            'click',
            () =>
                switchTab(
                    'doa',
                    'pagi'
                )
        );


    // ========================================================
    // PETANG
    // ========================================================

    document
        .getElementById(
            'btn-menu-petang'
        )
        ?.addEventListener(
            'click',
            () =>
                switchTab(
                    'doa',
                    'petang'
                )
        );


    // ========================================================
    // MORE HADIS
    // ========================================================

    document
        .getElementById(
            'btn-more-hadits'
        )
        ?.addEventListener(
            'click',
            () =>
                switchTab(
                    'hadits'
                )
        );


    // ========================================================
    // KIBLAT
    // ========================================================

    document
        .getElementById(
            'btn-menu-kiblat'
        )
        ?.addEventListener(
            'click',
            () =>
                showToast(
                    'Arah Kiblat Indonesia ~294° N-W.'
                )
        );


    // ========================================================
    // KAJIAN
    // ========================================================

    document
        .getElementById(
            'btn-menu-kajian'
        )
        ?.addEventListener(
            'click',
            e => {

                e.preventDefault();

                openTelegramModal(
                    'kajian'
                );

            }
        );


    // ========================================================
    // NASIHAT
    // ========================================================

    document
        .getElementById(
            'btn-menu-nasihat'
        )
        ?.addEventListener(
            'click',
            e => {

                e.preventDefault();

                openTelegramModal(
                    'nasihat'
                );

            }
        );


    // ========================================================
    // TASBIH
    // ========================================================

    const openTasbih =
        () =>
            document
                .getElementById(
                    'tasbih-modal'
                )
                ?.classList.remove(
                    'hidden'
                );


    const closeTasbih =
        () =>
            document
                .getElementById(
                    'tasbih-modal'
                )
                ?.classList.add(
                    'hidden'
                );


    document
        .getElementById(
            'btn-menu-tasbih'
        )
        ?.addEventListener(
            'click',
            openTasbih
        );


    document
        .getElementById(
            'nav-float-tasbih'
        )
        ?.addEventListener(
            'click',
            openTasbih
        );


    document
        .getElementById(
            'btn-close-tasbih-modal'
        )
        ?.addEventListener(
            'click',
            closeTasbih
        );


    // ========================================================
    // TASBIH COUNT
    // ========================================================

    document
        .getElementById(
            'btn-count-tasbih'
        )
        ?.addEventListener(
            'click',
            () => {

                state.tasbihCount++;


                const el =
                    document.getElementById(
                        'tasbih-count'
                    );


                if (el) {

                    el.innerText =
                        state.tasbihCount;

                }


                if (
                    state.tasbihCount %
                    33 ===
                    0
                ) {

                    showToast(
                        '33 Hitungan Tercapai!'
                    );

                }

            }
        );


    // ========================================================
    // RESET TASBIH
    // ========================================================

    document
        .getElementById(
            'btn-reset-tasbih'
        )
        ?.addEventListener(
            'click',
            () => {

                state.tasbihCount =
                    0;


                const el =
                    document.getElementById(
                        'tasbih-count'
                    );


                if (el) {

                    el.innerText =
                        '0';

                }

            }
        );


    // ========================================================
    // NEXT TASBIH
    // ========================================================

    document
        .getElementById(
            'btn-next-tasbih'
        )
        ?.addEventListener(
            'click',
            () => {

                if (
                    !state.tasbihPhrases ||
                    !state.tasbihPhrases.length
                ) {

                    return;

                }


                state.tasbihIndex =
                    (
                        state.tasbihIndex +
                        1
                    ) %
                    state.tasbihPhrases.length;


                const p =
                    state.tasbihPhrases[
                        state.tasbihIndex
                    ];


                const phraseEl =
                    document.getElementById(
                        'tasbih-phrase'
                    );


                const latinEl =
                    document.getElementById(
                        'tasbih-latin'
                    );


                const countEl =
                    document.getElementById(
                        'tasbih-count'
                    );


                if (phraseEl) {

                    phraseEl.innerText =
                        p.arab ||
                        '';

                }


                if (latinEl) {

                    latinEl.innerText =
                        p.latin ||
                        '';

                }


                state.tasbihCount =
                    0;


                if (countEl) {

                    countEl.innerText =
                        '0';

                }

            }
        );


    // ========================================================
    // AUDIO AYAT HARIAN
    // ========================================================

    document
        .getElementById(
            'daily-audio-btn'
        )
        ?.addEventListener(
            'click',
            () => {

                if (
                    state.dailyAyatAudio
                ) {

                    new Audio(
                        state.dailyAyatAudio
                    ).play();


                    showToast(
                        'Memutar audio...'
                    );

                } else {

                    showToast(
                        'Audio belum tersedia'
                    );

                }

            }
        );


    // ========================================================
    // CLOSE SURAH
    // ========================================================

    document
        .getElementById(
            'btn-close-surah-modal'
        )
        ?.addEventListener(
            'click',
            () => {

                document
                    .getElementById(
                        'surah-modal'
                    )
                    ?.classList.add(
                        'hidden'
                    );

            }
        );


    // ========================================================
    // SEARCH KOTA
    // ========================================================

    document
        .getElementById(
            'btn-search-city'
        )
        ?.addEventListener(
            'click',
            async () => {

                const input =
                    document.getElementById(
                        'city-search-input'
                    );


                if (!input) {
                    return;
                }


                const q =
                    input.value.trim();


                if (!q) {
                    return;
                }


                try {

                    const res =
                        await searchCityAPI(
                            q
                        );


                    const container =
                        document.getElementById(
                            'city-search-results'
                        );


                    if (
                        res &&
                        res.status &&
                        res.data &&
                        res.data.length > 0 &&
                        container
                    ) {

                        container.innerHTML =
                            res.data
                                .map(
                                    c => `

                                    <div
                                        class="city-item p-2 hover:bg-emerald-50 rounded-lg cursor-pointer flex justify-between items-center"
                                        data-id="${c.id}"
                                    >

                                        <span>
                                            ${c.lokasi}
                                        </span>

                                        <i class="fa-solid fa-chevron-right text-[10px]"></i>

                                    </div>

                                    `
                                )
                                .join('');


                        container
                            .querySelectorAll(
                                '.city-item'
                            )
                            .forEach(
                                el => {

                                    el.addEventListener(
                                        'click',
                                        () => {

                                            loadPrayerSchedule(
                                                el.dataset.id
                                            );


                                            container.innerHTML =
                                                '';


                                            showToast(
                                                'Lokasi diubah!'
                                            );

                                        }
                                    );

                                }
                            );

                    } else {

                        showToast(
                            'Kota tidak ditemukan'
                        );

                    }


                } catch (error) {

                    console.error(
                        '[SEARCH KOTA]',
                        error
                    );


                    showToast(
                        'Gagal mencari kota'
                    );

                }

            }
        );


    // ========================================================
    // KOMPAS
    // ========================================================

    initCompass();


    console.log(
        '[EVENT] Semua event listener selesai dipasang'
    );

}


// ============================================================
// KIBLAT
// ============================================================

function calculateQiblaBearing(
    lat,
    lng
) {

    const kaabaLat =
        21.422487 *
        (
            Math.PI / 180
        );


    const kaabaLng =
        39.826206 *
        (
            Math.PI / 180
        );


    const myLat =
        lat *
        (
            Math.PI / 180
        );


    const myLng =
        lng *
        (
            Math.PI / 180
        );


    const dLng =
        kaabaLng -
        myLng;


    const y =
        Math.sin(
            dLng
        );


    const x =
        Math.cos(
            myLat
        ) *
        Math.tan(
            kaabaLat
        )
        -
        Math.sin(
            myLat
        ) *
        Math.cos(
            dLng
        );


    let qibla =
        Math.atan2(
            y,
            x
        ) *
        (
            180 / Math.PI
        );


    return (
        qibla + 360
    ) % 360;

}


// ============================================================
// KOMPAS
// ============================================================

function initCompass() {

    let userLat =
        -5.14766;


    let userLng =
        119.43273;


    let qiblaBearing =
        calculateQiblaBearing(
            userLat,
            userLng
        );


    const updatePointer =
        () => {

            const pointer =
                document.getElementById(
                    'qibla-pointer'
                );


            if (pointer) {

                pointer.style.transform =
                    `rotate(${qiblaBearing}deg)`;

            }


            const degInfo =
                document.getElementById(
                    'kiblat-degree-info'
                );


            if (degInfo) {

                degInfo.innerText =
                    `Arah Kiblat: ~${
                        Math.round(
                            qiblaBearing
                        )
                    }° N-W`;

            }

        };


    // ----------------------------------------------------------
    // Geolocation
    // ----------------------------------------------------------

    if (
        navigator.geolocation
    ) {

        navigator.geolocation.getCurrentPosition(

            pos => {

                userLat =
                    pos.coords.latitude;


                userLng =
                    pos.coords.longitude;


                qiblaBearing =
                    calculateQiblaBearing(
                        userLat,
                        userLng
                    );


                updatePointer();

            },


            error => {

                console.warn(
                    '[KIBLAT] Lokasi tidak tersedia:',
                    error.message
                );


                updatePointer();

            }

        );

    } else {

        updatePointer();

    }


    // ----------------------------------------------------------
    // Device Orientation
    // ----------------------------------------------------------

    if (
        window.DeviceOrientationEvent
    ) {

        window.addEventListener(
            'deviceorientation',
            e => {

                let heading;


                if (
                    typeof e.webkitCompassHeading ===
                    'number'
                ) {

                    heading =
                        e.webkitCompassHeading;

                } else if (
                    typeof e.alpha ===
                    'number'
                ) {

                    heading =
                        360 -
                        e.alpha;

                }


                if (
                    typeof heading ===
                    'number'
                ) {

                    const dial =
                        document.getElementById(
                            'compass-dial'
                        );


                    if (dial) {

                        dial.style.transform =
                            `rotate(${
                                -heading
                            }deg)`;

                    }

                }

            }
        );

    }

}


// ============================================================
// DEBUG GLOBAL
// ============================================================

window.quranApp = {

    switchTab,

    loadSurahList,

    openSurahModal,

    filterDoa,

    loadPrayerSchedule

};


console.log(
    '[QURAN DIGITAL] app.js berhasil dimuat'
);

// ============================================================
// PUBLIC API - UNTUK CONSOLE / DEBUG
// ============================================================

window.quranApp = {
    switchTab,
    loadSurahList,
    openSurahModal,
    loadDailyAyat,
    loadDailyHadits,
    renderHaditsFeed,
    loadAllDoa,
    filterDoa,
    loadPrayerSchedule
};

window.switchTab = switchTab;

console.log('[QURAN DIGITAL] quranApp siap');


