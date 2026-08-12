import { state } from './config.js';
import { searchCityAPI } from './api.js';

const LOCATION_KEY = 'nurislam_selected_location';


// ======================================================
// UPDATE NAMA KOTA DI HEADER
// ======================================================

export function updateHeaderLocation() {

    const el = document.getElementById('header-city-name');

    if (!el) {
        console.warn('❌ header-city-name belum ditemukan');
        return;
    }

    el.textContent = state.cityName
        .replace(/^Kota\s+/i, '')
        .toUpperCase();
}


// ======================================================
// SIMPAN LOKASI
// ======================================================

export function saveLocation(cityId, cityName) {

    state.cityId = cityId;
    state.cityName = cityName;

    localStorage.setItem(
        LOCATION_KEY,
        JSON.stringify({
            cityId: cityId,
            cityName: cityName
        })
    );

    updateHeaderLocation();

    console.log(
        '📍 Lokasi tersimpan:',
        cityId,
        cityName
    );

    // Beritahu app bahwa lokasi berubah
    document.dispatchEvent(
        new CustomEvent('nurislam-location-changed', {
            detail: {
                cityId: cityId,
                cityName: cityName
            }
        })
    );
}


// ======================================================
// LOAD LOKASI
// ======================================================

export function loadSavedLocation() {

    const saved =
        localStorage.getItem(LOCATION_KEY);

    if (saved) {

        try {

            const location =
                JSON.parse(saved);

            state.cityId =
                location.cityId;

            state.cityName =
                location.cityName;

        } catch (error) {

            console.error(
                'Gagal membaca lokasi:',
                error
            );

        }

    }

    updateHeaderLocation();
}


// ======================================================
// MODAL LOKASI
// ======================================================

export function openLocationModal() {

    console.log('📍 OPEN LOCATION MODAL');

    let modal =
        document.getElementById('location-modal');

    if (!modal) {

        createLocationModal();

        modal =
            document.getElementById('location-modal');
    }

    if (modal) {

        modal.classList.remove('hidden');

        console.log('✅ Modal lokasi dibuka');

    }
}


// ======================================================
// CLOSE MODAL
// ======================================================

export function closeLocationModal() {

    const modal =
        document.getElementById('location-modal');

    if (modal) {

        modal.classList.add('hidden');

    }
}


// ======================================================
// BUAT MODAL
// ======================================================

function createLocationModal() {

    const modal =
        document.createElement('div');

    modal.id =
        'location-modal';

    modal.className =
        'fixed inset-0 z-[9999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4';


    modal.innerHTML = `

        <div
            class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">

            <!-- HEADER -->

            <div
                class="p-5 border-b border-slate-100 flex justify-between items-center">

                <div>

                    <h3 class="font-bold text-slate-800">
                        Pilih Lokasi
                    </h3>

                    <p class="text-[11px] text-slate-400">
                        Sesuaikan kota untuk jadwal shalat
                    </p>

                </div>

                <button
                    id="close-location-modal"
                    type="button"
                    class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200">

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>


            <!-- BODY -->

            <div class="p-5">

                <!-- GPS -->

                <button
                    id="use-gps-location"
                    type="button"
                    class="w-full p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-3">

                    <div
                        class="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">

                        <i class="fa-solid fa-location-crosshairs"></i>

                    </div>

                    <div class="text-left">

                        <div class="text-sm font-bold">
                            Gunakan Lokasi Saya
                        </div>

                        <div class="text-[10px] text-emerald-100">
                            Tentukan kota berdasarkan GPS
                        </div>

                    </div>

                </button>


                <!-- SEARCH -->

                <div class="relative mt-4">

                    <i
                        class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                    </i>

                    <input
                        id="city-search-input"
                        type="text"
                        autocomplete="off"
                        placeholder="Cari kota, misalnya Makassar..."
                        class="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">

                </div>


                <!-- RESULT -->

                <div
                    id="city-search-results"
                    class="mt-3 max-h-64 overflow-y-auto">

                    <div class="text-center py-6 text-xs text-slate-400">
                        Ketik nama kota untuk mencari
                    </div>

                </div>

            </div>

        </div>
    `;

    document.body.appendChild(modal);


    // CLOSE

    document
        .getElementById('close-location-modal')
        .addEventListener(
            'click',
            closeLocationModal
        );


    // SEARCH

    document
        .getElementById('city-search-input')
        .addEventListener(
            'input',
            function () {

                searchCities(this.value);

            }
        );


    // GPS

    document
        .getElementById('use-gps-location')
        .addEventListener(
            'click',
            useGPS
        );


    // Klik area gelap untuk menutup

    modal.addEventListener(
        'click',
        function (event) {

            if (event.target === modal) {

                closeLocationModal();

            }

        }
    );
}


// ======================================================
// CARI KOTA
// ======================================================

async function searchCities(keyword) {

    const results =
        document.getElementById(
            'city-search-results'
        );

    if (!results) return;


    if (keyword.trim().length < 2) {

        results.innerHTML = `
            <div class="text-center py-6 text-xs text-slate-400">
                Ketik minimal 2 huruf
            </div>
        `;

        return;
    }


    results.innerHTML = `
        <div class="text-center py-6 text-xs text-slate-400">
            <i class="fa-solid fa-spinner fa-spin mr-1"></i>
            Mencari kota...
        </div>
    `;


    try {

        const response =
            await searchCityAPI(
                encodeURIComponent(keyword.trim())
            );

        console.log(
            '🔎 Hasil pencarian kota:',
            response
        );


        if (
            !response ||
            !response.data ||
            !Array.isArray(response.data) ||
            response.data.length === 0
        ) {

            results.innerHTML = `
                <div class="text-center py-6 text-xs text-slate-400">
                    Kota tidak ditemukan
                </div>
            `;

            return;
        }


        results.innerHTML =
            response.data.map(city => `

                <button
                    type="button"
                    class="city-result w-full p-3 rounded-xl hover:bg-emerald-50 flex items-center gap-3 text-left"
                    data-id="${city.id}"
                    data-name="${city.lokasi}">

                    <div
                        class="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">

                        <i class="fa-solid fa-location-dot"></i>

                    </div>

                    <div>

                        <div class="text-sm font-semibold text-slate-700">
                            ${city.lokasi}
                        </div>

                        <div class="text-[10px] text-slate-400">
                            ID Kota: ${city.id}
                        </div>

                    </div>

                </button>

            `).join('');


        results
            .querySelectorAll('.city-result')
            .forEach(button => {

                button.addEventListener(
                    'click',
                    function () {

                        saveLocation(
                            this.dataset.id,
                            this.dataset.name
                        );

                        closeLocationModal();

                    }
                );

            });


    } catch (error) {

        console.error(
            '❌ Search kota error:',
            error
        );

        results.innerHTML = `
            <div class="text-center py-6 text-xs text-red-500">
                Gagal mengambil data kota
            </div>
        `;

    }
}


// ======================================================
// GPS
// ======================================================

function useGPS() {

    if (!navigator.geolocation) {

        alert(
            'Browser Anda tidak mendukung GPS.'
        );

        return;
    }


    console.log(
        '📍 Meminta lokasi GPS...'
    );


    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const lat =
                position.coords.latitude;

            const lon =
                position.coords.longitude;


            console.log(
                'GPS:',
                lat,
                lon
            );


            try {

                const response =
                    await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`
                    );


                const data =
                    await response.json();


                const address =
                    data.address || {};


                const cityName =
                    address.city ||
                    address.town ||
                    address.municipality ||
                    address.county;


                if (!cityName) {

                    throw new Error(
                        'Nama kota tidak ditemukan'
                    );

                }


                const cityResponse =
                    await searchCityAPI(
                        encodeURIComponent(cityName)
                    );


                if (
                    !cityResponse ||
                    !cityResponse.data ||
                    !cityResponse.data.length
                ) {

                    alert(
                        `Kota ${cityName} tidak ditemukan. Silakan pilih manual.`
                    );

                    return;
                }


                const city =
                    cityResponse.data[0];


                saveLocation(
                    city.id,
                    city.lokasi
                );


                closeLocationModal();


            } catch (error) {

                console.error(
                    'GPS error:',
                    error
                );

                alert(
                    'Gagal menentukan kota dari lokasi Anda.'
                );

            }

        },

        function (error) {

            console.error(
                'GPS error:',
                error
            );

            alert(
                'Akses lokasi ditolak atau tidak tersedia.'
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        }

    );
}


// ======================================================
// INIT
// ======================================================

export function initLocation() {

    console.log(
        '📍 initLocation() dijalankan'
    );


    loadSavedLocation();


    const button =
        document.getElementById(
            'btn-header-city'
        );


    if (!button) {

        console.error(
            '❌ btn-header-city TIDAK ditemukan'
        );

        return;
    }


    // Hindari listener ganda
    if (button.dataset.locationReady === 'true') {

        console.log(
            'ℹ️ Location listener sudah terpasang'
        );

        return;
    }


    button.dataset.locationReady =
        'true';


    button.addEventListener(
        'click',
        function (event) {

            event.preventDefault();

            event.stopPropagation();

            console.log(
                '🖱️ Tombol kota diklik'
            );

            openLocationModal();

        }
    );


    console.log(
        '✅ Tombol lokasi berhasil diaktifkan'
    );
}
