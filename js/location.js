import { state } from './config.js';
import {
    searchCityAPI,
    fetchAllCitiesAPI
} from './api.js';


// =====================================================
// STORAGE
// =====================================================

const LOCATION_KEY =
    'nurislam_selected_location';


// =====================================================
// UPDATE HEADER
// =====================================================

export function updateHeaderLocation() {

    const element =
        document.getElementById(
            'header-city-name'
        );

    if (!element) return;

    element.textContent =
        state.cityName
            .replace(/^Kota\s+/i, '')
            .toUpperCase();
}


// =====================================================
// SAVE LOCATION
// =====================================================

export function saveLocation(location) {

    state.cityId =
        location.cityId;

    state.cityName =
        location.cityName;

    state.latitude =
        location.latitude || null;

    state.longitude =
        location.longitude || null;

    state.locationSource =
        location.source || 'manual';


    localStorage.setItem(
        LOCATION_KEY,
        JSON.stringify({

            cityId: state.cityId,

            cityName: state.cityName,

            latitude: state.latitude,

            longitude: state.longitude,

            source: state.locationSource

        })
    );


    updateHeaderLocation();


    console.log(
        '📍 Lokasi dipilih:',
        state.cityName,
        state.cityId
    );
}


// =====================================================
// LOAD SAVED LOCATION
// =====================================================

export function loadSavedLocation() {

    const saved =
        localStorage.getItem(
            LOCATION_KEY
        );

    if (!saved) {

        updateHeaderLocation();

        return;

    }


    try {

        const location =
            JSON.parse(saved);


        state.cityId =
            location.cityId;

        state.cityName =
            location.cityName;

        state.latitude =
            location.latitude;

        state.longitude =
            location.longitude;

        state.locationSource =
            location.source || 'manual';


    } catch (error) {

        console.error(
            'Gagal membaca lokasi:',
            error
        );

    }


    updateHeaderLocation();
}


// =====================================================
// OPEN MODAL
// =====================================================

export function openLocationModal() {

    let modal =
        document.getElementById(
            'location-modal'
        );


    if (!modal) {

        createLocationModal();

        modal =
            document.getElementById(
                'location-modal'
            );

    }


    modal.classList.remove(
        'hidden'
    );
}


// =====================================================
// CLOSE MODAL
// =====================================================

export function closeLocationModal() {

    const modal =
        document.getElementById(
            'location-modal'
        );

    if (modal) {

        modal.classList.add(
            'hidden'
        );

    }
}


// =====================================================
// CREATE MODAL
// =====================================================

function createLocationModal() {

    const modal =
        document.createElement('div');


    modal.id =
        'location-modal';


    modal.className =
        'fixed inset-0 z-[999] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4';


    modal.innerHTML = `

        <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">


            <!-- HEADER -->

            <div class="p-5 border-b border-slate-100 flex justify-between items-center">

                <div>

                    <h3 class="font-bold text-slate-800">
                        Pilih Lokasi
                    </h3>

                    <p class="text-[11px] text-slate-400">
                        Jadwal shalat akan menyesuaikan kota
                    </p>

                </div>


                <button
                    id="close-location"
                    class="w-8 h-8 rounded-full bg-slate-100">

                    <i class="fa-solid fa-xmark"></i>

                </button>

            </div>


            <!-- BODY -->

            <div class="p-5">


                <!-- GPS -->

                <button
                    id="use-gps"
                    class="w-full p-3 rounded-2xl bg-emerald-600 text-white flex items-center gap-3">

                    <i class="fa-solid fa-location-crosshairs"></i>

                    <div class="text-left">

                        <div class="text-sm font-bold">
                            Gunakan Lokasi Saya
                        </div>

                        <div class="text-[10px] text-emerald-100">
                            Tentukan kota berdasarkan lokasi perangkat
                        </div>

                    </div>

                </button>


                <!-- SEARCH -->

                <div class="relative mt-4">

                    <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>

                    <input
                        id="city-search"
                        type="text"
                        placeholder="Cari kota..."
                        class="w-full pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">

                </div>


                <div
                    id="city-results"
                    class="mt-3 max-h-64 overflow-y-auto space-y-1">

                    <div class="text-center py-5 text-xs text-slate-400">
                        Ketik nama kota...
                    </div>

                </div>


            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    document
        .getElementById(
            'close-location'
        )
        .addEventListener(
            'click',
            closeLocationModal
        );


    document
        .getElementById(
            'city-search'
        )
        .addEventListener(
            'input',
            event => {

                searchCities(
                    event.target.value
                );

            }
        );


    document
        .getElementById(
            'use-gps'
        )
        .addEventListener(
            'click',
            detectLocation
        );
}


// =====================================================
// SEARCH CITY
// =====================================================

async function searchCities(
    keyword
) {

    const results =
        document.getElementById(
            'city-results'
        );


    if (!results) return;


    if (keyword.trim().length < 2) {

        results.innerHTML = `

            <div class="text-center py-5 text-xs text-slate-400">
                Ketik minimal 2 huruf
            </div>

        `;

        return;

    }


    results.innerHTML = `

        <div class="text-center py-5 text-xs text-slate-400">

            <i class="fa-solid fa-spinner fa-spin mr-1"></i>

            Mencari kota...

        </div>

    `;


    try {

        const response =
            await searchCityAPI(
                encodeURIComponent(
                    keyword.trim()
                )
            );


        if (
            !response ||
            !response.data ||
            !response.data.length
        ) {

            results.innerHTML = `

                <div class="text-center py-5 text-xs text-slate-400">
                    Kota tidak ditemukan
                </div>

            `;

            return;

        }


        results.innerHTML =
            response.data.map(city => `

                <button
                    class="city-option w-full flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-50 text-left"
                    data-id="${city.id}"
                    data-name="${city.lokasi}">

                    <div class="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">

                        <i class="fa-solid fa-location-dot text-xs"></i>

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
            .querySelectorAll(
                '.city-option'
            )
            .forEach(button => {

                button.addEventListener(
                    'click',
                    () => {

                        selectCity(
                            button.dataset.id,
                            button.dataset.name
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            'Search city error:',
            error
        );

        results.innerHTML = `

            <div class="text-center py-5 text-xs text-rose-500">
                Gagal mencari kota
            </div>

        `;

    }

}


// =====================================================
// SELECT CITY
// =====================================================

function selectCity(
    cityId,
    cityName
) {

    saveLocation({

        cityId:
            cityId,

        cityName:
            cityName,

        source:
            'manual'

    });


    closeLocationModal();


    // Beri tahu aplikasi
    document.dispatchEvent(
        new CustomEvent(
            'nurislam-location-changed',
            {
                detail: {
                    cityId,
                    cityName
                }
            }
        )
    );
}


// =====================================================
// GPS
// =====================================================

async function detectLocation() {

    if (
        !navigator.geolocation
    ) {

        alert(
            'Browser tidak mendukung GPS.'
        );

        return;

    }


    navigator.geolocation.getCurrentPosition(

        async position => {

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

                // Reverse geocoding
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
                    address.county ||
                    address.state;


                if (!cityName) {

                    throw new Error(
                        'Nama kota tidak ditemukan'
                    );

                }


                // Cari City ID MyQuran
                const search =
                    await searchCityAPI(
                        encodeURIComponent(
                            cityName
                        )
                    );


                let city = null;


                if (
                    search &&
                    search.data &&
                    search.data.length
                ) {

                    city =
                        search.data[0];

                }


                if (!city) {

                    alert(
                        `Kota ${cityName} tidak ditemukan di MyQuran. Silakan pilih manual.`
                    );

                    return;

                }


                saveLocation({

                    cityId:
                        city.id,

                    cityName:
                        city.lokasi,

                    latitude:
                        lat,

                    longitude:
                        lon,

                    source:
                        'gps'

                });


                closeLocationModal();


                document.dispatchEvent(
                    new CustomEvent(
                        'nurislam-location-changed',
                        {
                            detail: {
                                cityId:
                                    city.id,

                                cityName:
                                    city.lokasi
                            }
                        }
                    )
                );


            } catch (error) {

                console.error(
                    'GPS location error:',
                    error
                );

                alert(
                    'Lokasi ditemukan, tetapi kota tidak dapat dipetakan.'
                );

            }

        },


        error => {

            console.error(
                'GPS error:',
                error
            );

            alert(
                'Silakan izinkan akses lokasi pada browser.'
            );

        },

        {
            enableHighAccuracy:
                true,

            timeout:
                15000,

            maximumAge:
                300000
        }

    );

}


// =====================================================
// INIT LOCATION BUTTON
// =====================================================

export function initLocation() {

    loadSavedLocation();


    const button =
        document.getElementById(
            'btn-header-city'
        );


    if (!button) {

        console.warn(
            'Tombol lokasi belum tersedia'
        );

        return;

    }


    button.addEventListener(
        'click',
        openLocationModal
    );


    console.log(
        '✅ Sistem lokasi NurIslam aktif'
    );
}
