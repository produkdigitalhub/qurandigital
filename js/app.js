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
// QURAN DIGITAL APP
// ============================================================

console.log('=== APP.JS BERHASIL DIMUAT ===');


// ============================================================
// COMPONENT LOADER
// FIX GITHUB PAGES
// ============================================================

export async function loadComponent(elementId, filepath) {

    const container =
        document.getElementById(elementId);

    if (!container) {

        console.warn(
            `[UI] Container tidak ditemukan: ${elementId}`
        );

        return false;
    }

    try {

        /*
         * Gunakan lokasi app.js sebagai dasar path.
         * Ini lebih aman untuk GitHub Pages.
         */
        const url =
            new URL(
                filepath,
                import.meta.url
            );

        console.log(
            `[UI] Memuat: ${url.href}`
        );

        const response =
            await fetch(url.href, {
                cache: 'no-cache'
            });

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status} - ${url.href}`
            );
        }

        const html =
            await response.text();

        if (!html.trim()) {

            throw new Error(
                `File kosong: ${url.href}`
            );
        }


        // ====================================================
        // CEK ROOT COMPONENT
        // Jika component mempunyai ID yang sama dengan
        // container, jangan membuat ID ganda.
        // ====================================================

        const temp =
            document.createElement('div');

        temp.innerHTML = html.trim();

        const firstElement =
            temp.firstElementChild;


        if (
            firstElement &&
            firstElement.id === elementId
        ) {

            /*
             * Contoh:
             *
             * container:
             * <div id="view-quran"></div>
             *
             * component:
             * <div id="view-quran">...</div>
             *
             * Kita replace container langsung.
             */

            container.replaceWith(
                firstElement
            );

            console.log(
                `[UI] Component ${elementId} berhasil dimuat (root ID dipertahankan)`
            );

        } else {

            container.innerHTML =
                html;

            console.log(
                `[UI] Component ${elementId} berhasil dimuat`
            );
        }

        return true;

    } catch (error) {

        console.error(
            `[UI] Gagal memuat ${filepath}:`,
            error
        );

        /*
         * Jangan biarkan area kosong tanpa informasi
         * ketika GitHub Pages mengalami 404.
         */

        container.innerHTML = `
            <div class="p-6 text-center">
                <div class="text-rose-500 text-sm font-semibold mb-2">
                    Gagal memuat komponen
                </div>

                <div class="text-xs text-slate-400 break-all">
                    ${filepath}
                </div>
            </div>
        `;

        return false;
    }
}


// ============================================================
// INITIALIZE UI COMPONENTS
// ============================================================

export async function initializeUIComponents() {

    console.log(
        '[UI] Mulai memuat semua component...'
    );

    const components = [

        // Header
        [
            'header-container',
            '../components/header.html'
        ],

        // Dashboard
        [
            'card-next-prayer',
            '../components/dashboard/next-prayer.html'
        ],

        [
            'card-jurnal',
            '../components/dashboard/mutabaah-jurnal.html'
        ],

        [
            'card-quick-menu',
            '../components/dashboard/quick-menu.html'
        ],

        [
            'card-daily-ayat',
            '../components/dashboard/daily-ayat.html'
        ],

        [
            'card-daily-hadits',
            '../components/dashboard/daily-hadits.html'
        ],

        [
            'card-telegram-feed',
            '../components/dashboard/telegram-feed.html'
        ],

        // Views
       

        // Modals
        [
            'modal-surah-container',
            '../components/modals/surah-modal.html'
        ],

        [
            'modal-tasbih-container',
            '../components/modals/tasbih-modal.html'
        ],

        [
            'modal-kiblat-container',
            '../components/modals/kiblat-modal.html'
        ],

        [
            'modal-share-container',
            '../components/modals/share-modal.html'
        ],

        [
            'modal-telegram-container',
            '../components/modals/telegram-modal.html'
        ]
    ];


    let berhasil = 0;
    let gagal = 0;


    for (const [elementId, filepath] of components) {

        const result =
            await loadComponent(
                elementId,
                filepath
            );

        if (result) {
            berhasil++;
        } else {
            gagal++;
        }
    }


    console.log(
        `[UI] Semua component selesai dimuat. Berhasil: ${berhasil}, Gagal: ${gagal}`
    );
}


// ============================================================
// TOAST
// ============================================================

export function showAppToast(
    message,
    duration = 3000
) {

    const toast =
        document.getElementById('toast');

    if (!toast) return;

    toast.textContent =
        message;

    toast.classList.remove(
        'opacity-0',
        'pointer-events-none'
    );

    toast.classList.add(
        'opacity-100'
    );


    setTimeout(() => {

        toast.classList.remove(
            'opacity-100'
        );

        toast.classList.add(
            'opacity-0',
            'pointer-events-none'
        );

    }, duration);
}


// ============================================================
// DOM READY
// ============================================================

document.addEventListener(
    'DOMContentLoaded',
    () => {

        console.log(
            '[QURAN DIGITAL] DOMContentLoaded'
        );

        initApp();

    }
);


// ============================================================
// INITIALIZE APP
// ============================================================

async function initApp() {

    console.log(
        '[QURAN DIGITAL] initApp()'
    );


    setHijriDate();


    /*
     * PENTING:
     * Component harus selesai dimuat TERLEBIH DAHULU.
     */
    await initializeUIComponents();


    /*
     * Setelah HTML component tersedia,
     * baru pasang event listener.
     */
    initEventListeners();


    /*
     * Dashboard pertama kali.
     */
    switchTab('dashboard');


    // Telegram
    try {

        initTelegramFeed();

    } catch (error) {

        console.error(
            '[TELEGRAM]',
            error
        );

    }


    // Doa dari state
    if (
        state.doaList &&
        state.doaList.length > 0
    ) {

        renderDoaListUI(
            state.doaList
        );

    }


    startTimer();


    // ========================================================
    // LOAD DATA
    // ========================================================

    Promise.allSettled([

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

    ]).then(results => {

        console.log(
            '[QURAN DIGITAL] Data loading selesai',
            results
        );

    });

}


// ============================================================
// TANGGAL
// ============================================================

function setHijriDate() {

    const today =
        new Date();

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
// NAVIGASI UTAMA
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


    // ========================================================
    // SEMBUNYIKAN SEMUA VIEW
    // ========================================================

    views.forEach(
        viewName => {

            const elements =
                document.querySelectorAll(
                    `#view-${viewName}`
                );


            elements.forEach(
                view => {

                    view.classList.add(
                        'hidden'
                    );

                    view.style.display =
                        'none';

                }
            );

        }
    );


    // ========================================================
    // TAMPILKAN VIEW AKTIF
    // ========================================================

    const activeViews =
        document.querySelectorAll(
            `#view-${tabName}`
        );


    if (!activeViews.length) {

        console.error(
            `[NAVIGASI] view-${tabName} tidak ditemukan`
        );

        return;

    }


    activeViews.forEach(
        view => {

            view.classList.remove(
                'hidden'
            );

            view.style.display =
                '';

        }
    );


    console.log(
        `[NAVIGASI] view-${tabName} berhasil ditampilkan`
    );


    // ========================================================
    // BOTTOM NAVIGATION
    // ========================================================

    document
        .querySelectorAll('.nav-item')
        .forEach(btn => {

            btn.classList.remove(
                'active-tab'
            );

            btn.classList.add(
                'text-slate-400'
            );

        });


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


    // ========================================================
    // FILTER DOA
    // ========================================================

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
// EXPOSE UNTUK CONSOLE
// ============================================================

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

    if (!state.doaList) return;


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
                    ).toLowerCase();


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
            ).padStart(
                2,
                '0'
            );


        const dd =
            String(
                now.getDate()
            ).padStart(
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
                    data.data.jadwal.tanggal ||
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

    const fiqihData =
        calculateFiqihTimes(
            jadwal
        );


    if (!fiqihData) return;


    const elSyuruq =
        document.getElementById(
            'time-syuruq'
        );


    const elDhuha =
        document.getElementById(
            'status-dhuha'
        );


    const elTahajud =
        document.getElementById(
            'time-tahajud'
        );


    if (elSyuruq) {

        elSyuruq.innerText =
            fiqihData.syuruq;

    }


    if (elDhuha) {

        elDhuha.innerText =
            `Awal Dhuha: ~${fiqihData.dhuha}`;

    }


    if (elTahajud) {

        elTahajud.innerText =
            fiqihData.tahajud;

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
        desc
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

    if (!j) return;


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

        if (!t.time)
            continue;


        const [
            h,
            m
        ] =
            t.time.split(':');


        const pTime =
            new Date();


        pTime.setHours(
            parseInt(h),
            parseInt(m),
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


    if (!next) {

        if (
            !times[0] ||
            !times[0].time
        ) return;


        const [
            h,
            m
        ] =
            times[0]
                .time
                .split(':');


        const pTime =
            new Date();


        pTime.setDate(
            pTime.getDate() + 1
        );


        pTime.setHours(
            parseInt(h),
            parseInt(m),
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
            ) return;


            const diff =
                state.nextPrayerTime -
                new Date();


            if (diff <= 0) {

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
                ).padStart(
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
                ).padStart(
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
                ).padStart(
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

        const dayOfYear =
            Math.floor(
                (
                    new Date() -
                    new Date(
                        new Date()
                            .getFullYear(),
                        0,
                        0
                    )
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        const surahNo =
            (
                dayOfYear % 114
            ) + 1;


        const data =
            await fetchSurahDetailAPI(
                surahNo
            );


        if (
            !data ||
            !data.ayat
        ) return;


        const ayat =
            data.ayat[0];


        if (!ayat) return;


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
                `Q.S. ${data.namaLatin}: ${ayat.nomorAyat}`;

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
// DAFTAR SURAH
// ============================================================

async function loadSurahList() {

    try {

        console.log(
            '[QURAN] Memuat daftar surah...'
        );


        const list =
            await fetchSurahListAPI();


        console.log(
            '[QURAN] Data surah:',
            list
        );


        state.surahList =
            Array.isArray(list)
                ? list
                : [];


        renderSurahListUI(
            state.surahList,
            openSurahModal
        );


        console.log(
            `[QURAN] Jumlah surah: ${state.surahList.length}`
        );


        console.log(
            `[QURAN] ${state.surahList.length} surah berhasil dirender`
        );


    } catch (error) {

        console.error(
            '[QURAN] Error:',
            error
        );

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

        container.innerHTML = `
            <div class="p-4 text-center text-xs text-slate-400 animate-pulse">
                Memuat ayat Al-Qur'an...
            </div>
        `;

    }


    try {

        const surah =
            await fetchSurahDetailAPI(
                nomor
            );


        if (!surah)
            return;


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
                `${surah.nomor}. Surah ${surah.namaLatin}`;

        }


        if (subEl) {

            subEl.innerText =
                `${surah.arti} • ${surah.jumlahAyat} Ayat`;

        }


        if (!container)
            return;


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


        container
            .querySelectorAll(
                '.btn-play-verse'
            )
            .forEach(
                button => {

                    button.addEventListener(
                        'click',
                        () => {

                            if (
                                button.dataset.audio
                            ) {

                                new Audio(
                                    button.dataset.audio
                                ).play();


                                showToast(
                                    'Memutar audio ayat...'
                                );

                            }

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
                <div class="p-5 text-center text-sm text-rose-500">
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


    if (!container)
        return;


    container.innerHTML = `
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
                                HR. ${bookName} No. ${h.number || '-'}
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

            container.innerHTML = `
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


        container.innerHTML = `
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
                                .dataset
                                .book;


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
    // MENU UTAMA
    // ========================================================

    document
        .getElementById(
            'btn-menu-quran'
        )
        ?.addEventListener(
            'click',
            () => {

                console.log(
                    '[MENU] Klik btn-menu-quran'
                );

                switchTab(
                    'quran'
                );

            }
        );


    document
        .getElementById(
            'btn-menu-doa'
        )
        ?.addEventListener(
            'click',
            () => {

                console.log(
                    '[MENU] Klik btn-menu-doa'
                );

                switchTab(
                    'doa'
                );

            }
        );


    document
        .getElementById(
            'btn-menu-hadits'
        )
        ?.addEventListener(
            'click',
            () => {

                console.log(
                    '[MENU] Klik btn-menu-hadits'
                );

                switchTab(
                    'hadits'
                );

            }
        );


    document
        .getElementById(
            'btn-menu-sholat'
        )
        ?.addEventListener(
            'click',
            () =>
                switchTab(
                    'sholat'
                )
        );


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
    // TUTUP SURAH
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
            Math.PI /
            180
        );


    const kaabaLng =
        39.826206 *
        (
            Math.PI /
            180
        );


    const myLat =
        lat *
        (
            Math.PI /
            180
        );


    const myLng =
        lng *
        (
            Math.PI /
            180
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
            180 /
            Math.PI
        );


    return (
        qibla +
        360
    ) % 360;

}


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


    if (
        navigator.geolocation
    ) {

        navigator.geolocation
            .getCurrentPosition(
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


                    const degInfo =
                        document.getElementById(
                            'kiblat-degree-info'
                        );


                    if (degInfo) {

                        degInfo.innerText =
                            `Arah Kiblat: ~${Math.round(
                                qiblaBearing
                            )}° N-W`;

                    }


                    const pointer =
                        document.getElementById(
                            'qibla-pointer'
                        );


                    if (pointer) {

                        pointer.style.transform =
                            `rotate(${qiblaBearing}deg)`;

                    }

                },

                error => {

                    console.warn(
                        '[KIBLAT] Lokasi tidak tersedia:',
                        error.message
                    );

                }
            );

    }


    const pointer =
        document.getElementById(
            'qibla-pointer'
        );


    if (pointer) {

        pointer.style.transform =
            `rotate(${qiblaBearing}deg)`;

    }


    if (
        window.DeviceOrientationEvent
    ) {

        window.addEventListener(
            'deviceorientation',
            e => {

                let heading =
                    e.webkitCompassHeading ||
                    (
                        360 -
                        e.alpha
                    );


                if (heading) {

                    const dial =
                        document.getElementById(
                            'compass-dial'
                        );


                    if (dial) {

                        dial.style.transform =
                            `rotate(${-heading}deg)`;

                    }

                }

            }
        );

    }

}


// ============================================================
// GLOBAL quranApp
// ============================================================

window.quranApp = {

    switchTab,

    loadSurahList,

    openSurahModal,

    loadDailyAyat,

    loadDailyHadits,

    loadAllDoa,

    renderHaditsFeed,

    loadPrayerSchedule,

    filterDoa,

    initializeUIComponents,

    loadComponent

};


console.log(
    '=== quranApp SIAP ==='
);
