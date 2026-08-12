// =====================================================
// NURISLAM LOCATION & HIJRI DATE
// =====================================================

const LOCATION_STORAGE_KEY = 'nurislam_location';

let currentLocation = {
    city: 'Makassar',
    country: 'Indonesia',
    latitude: -5.1477,
    longitude: 119.4327
};


// =====================================================
// LOAD LOCATION
// =====================================================

function loadSavedLocation() {

    const saved = localStorage.getItem(LOCATION_STORAGE_KEY);

    if (saved) {

        try {

            currentLocation = JSON.parse(saved);

        } catch (error) {

            console.error('Location data rusak:', error);

        }

    }

    updateLocationUI();
}


// =====================================================
// SAVE LOCATION
// =====================================================

function saveLocation(location) {

    currentLocation = location;

    localStorage.setItem(
        LOCATION_STORAGE_KEY,
        JSON.stringify(location)
    );

    updateLocationUI();

    loadPrayerTimes();

    loadHijriDate();
}


// =====================================================
// UPDATE LOCATION UI
// =====================================================

function updateLocationUI() {

    const el = document.getElementById('location-name');

    if (!el) return;

    el.textContent =
        currentLocation.city.toUpperCase();

}


// =====================================================
// DETEKSI LOKASI OTOMATIS
// =====================================================

window.detectMyLocation = function () {

    if (!navigator.geolocation) {

        alert('Browser tidak mendukung GPS.');

        return;

    }

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            console.log('GPS:', lat, lon);

            await reverseGeocode(lat, lon);

        },

        function (error) {

            console.error(
                'GPS Error:',
                error
            );

            alert(
                'Lokasi tidak dapat diperoleh. Silakan pilih kota secara manual.'
            );

        },

        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
        }

    );

};


// =====================================================
// REVERSE GEOCODING
// =====================================================

async function reverseGeocode(lat, lon) {

    try {

        const url =
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;

        const response = await fetch(url);

        const data = await response.json();

        const address = data.address || {};

        const city =
            address.city ||
            address.town ||
            address.municipality ||
            address.county ||
            address.state ||
            'Lokasi Anda';

        const country =
            address.country ||
            'Indonesia';

        saveLocation({

            city: city,

            country: country,

            latitude: lat,

            longitude: lon

        });

    } catch (error) {

        console.error(
            'Reverse geocode error:',
            error
        );

    }

}


// =====================================================
// HIJRI DATE
// =====================================================

async function loadHijriDate() {

    const el =
        document.getElementById('hijri-date');

    if (!el) return;

    try {

        const today =
            new Date();

        const day =
            String(today.getDate()).padStart(2, '0');

        const month =
            String(today.getMonth() + 1).padStart(2, '0');

        const year =
            today.getFullYear();

        const url =
            `https://api.aladhan.com/v1/gToH?date=${day}-${month}-${year}`;

        const response =
            await fetch(url);

        const result =
            await response.json();

        const hijri =
            result.data.hijri;

        el.textContent =
            `${hijri.day} ${hijri.month.en} ${hijri.year} H`;

    } catch (error) {

        console.error(
            'Hijri error:',
            error
        );

        el.textContent =
            'Tanggal Hijriah';

    }

}


// =====================================================
// PRAYER TIMES
// =====================================================

async function loadPrayerTimes() {

    const lat =
        currentLocation.latitude;

    const lon =
        currentLocation.longitude;

    try {

        const today =
            new Date();

        const day =
            String(today.getDate()).padStart(2, '0');

        const month =
            String(today.getMonth() + 1).padStart(2, '0');

        const year =
            today.getFullYear();

        const url =
            `https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${lat}&longitude=${lon}&method=20`;

        const response =
            await fetch(url);

        const result =
            await response.json();

        if (!result.data) return;

        const timings =
            result.data.timings;

        console.log(
            'Prayer Times:',
            timings
        );

        updatePrayerUI(timings);

    } catch (error) {

        console.error(
            'Prayer API error:',
            error
        );

    }

}


// =====================================================
// UPDATE PRAYER UI
// =====================================================

function updatePrayerUI(timings) {

    const mapping = {

        Fajr: 'fajr-time',

        Dhuhr: 'dhuhr-time',

        Asr: 'asr-time',

        Maghrib: 'maghrib-time',

        Isha: 'isha-time'

    };


    Object.entries(mapping).forEach(
        ([prayer, id]) => {

            const el =
                document.getElementById(id);

            if (el && timings[prayer]) {

                el.textContent =
                    timings[prayer];

            }

        }
    );

}


// =====================================================
// LOCATION MODAL
// =====================================================

window.openLocationModal = function () {

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

    modal.classList.remove('hidden');

};


// =====================================================
// CREATE LOCATION MODAL
// =====================================================

function createLocationModal() {

    const modal =
        document.createElement('div');

    modal.id =
        'location-modal';

    modal.className =
        'fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4';

    modal.innerHTML = `

        <div class="bg-white rounded-3xl w-full max-w-md p-5 shadow-2xl">

            <div class="flex justify-between items-center mb-4">

                <h3 class="font-bold text-slate-800">
                    Pilih Lokasi
                </h3>

                <button
                    onclick="closeLocationModal()"
                    class="w-8 h-8 rounded-full bg-slate-100">

                    ✕

                </button>

            </div>


            <button
                onclick="detectMyLocation(); closeLocationModal();"
                class="w-full p-3 rounded-xl bg-emerald-600 text-white font-semibold mb-4">

                📍 Gunakan Lokasi Saya

            </button>


            <div class="text-xs text-slate-400 mb-2">
                Pilih kota
            </div>


            <div class="grid grid-cols-2 gap-2">

                <button onclick="selectCity('Makassar', 'Indonesia', -5.1477, 119.4327)"
                    class="p-3 bg-slate-50 rounded-xl text-sm">
                    Makassar
                </button>

                <button onclick="selectCity('Jakarta', 'Indonesia', -6.2088, 106.8456)"
                    class="p-3 bg-slate-50 rounded-xl text-sm">
                    Jakarta
                </button>

                <button onclick="selectCity('Surabaya', 'Indonesia', -7.2575, 112.7521)"
                    class="p-3 bg-slate-50 rounded-xl text-sm">
                    Surabaya
                </button>

                <button onclick="selectCity('Bandung', 'Indonesia', -6.9175, 107.6191)"
                    class="p-3 bg-slate-50 rounded-xl text-sm">
                    Bandung
                </button>

                <button onclick="selectCity('Medan', 'Indonesia', 3.5952, 98.6722)"
                    class="p-3 bg-slate-50 rounded-xl text-sm">
                    Medan
                </button>

                <button onclick="selectCity('Semarang', 'Indonesia', -6.9667, 110.4167)"
                    class="p-3 bg-slate-50 rounded-xl text-sm">
                    Semarang
                </button>

            </div>

        </div>

    `;

    document.body.appendChild(modal);

}


// =====================================================
// SELECT CITY
// =====================================================

window.selectCity = function (
    city,
    country,
    latitude,
    longitude
) {

    saveLocation({

        city,
        country,
        latitude,
        longitude

    });

    closeLocationModal();

};


// =====================================================
// CLOSE MODAL
// =====================================================

window.closeLocationModal = function () {

    const modal =
        document.getElementById(
            'location-modal'
        );

    if (modal) {

        modal.classList.add('hidden');

    }

};


// =====================================================
// INIT
// =====================================================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        loadSavedLocation();

        loadHijriDate();

        loadPrayerTimes();

    }
);
