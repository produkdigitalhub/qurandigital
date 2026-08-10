/**
 * UI Renderer & Dynamic Component Loader
 */

export async function loadComponent(elementId, filepath) {
    const container = document.getElementById(elementId);
    if (!container) return;

    try {
        const response = await fetch(filepath);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const html = await response.text();
        container.innerHTML = html;
    } catch (error) {
        console.error(`Gagal memuat komponen ${filepath}:`, error);
    }
}

export async function initializeUIComponents() {
    // Tambahkan './' di awal setiap jalur file
    await loadComponent('header-container', './components/header.html');

    // Dashboard Cards
    await loadComponent('card-next-prayer', './components/dashboard/next-prayer.html');
    await loadComponent('card-jurnal', './components/dashboard/mutabaah-jurnal.html');
    await loadComponent('card-quick-menu', './components/dashboard/quick-menu.html');
    await loadComponent('card-daily-ayat', './components/dashboard/daily-ayat.html');
    await loadComponent('card-daily-hadits', './components/dashboard/daily-hadits.html');
    await loadComponent('card-telegram-feed', './components/dashboard/telegram-feed.html');

    // Views
    await loadComponent('view-quran', './components/view/quran-view.html');
    await loadComponent('view-doa', './components/view/doa-view.html');
    await loadComponent('view-hadits', './components/view/hadits-view.html');
    await loadComponent('view-sholat', './components/view/sholat-view.html');

    // Modals
    await loadComponent('modal-surah-container', './components/modals/surah-modal.html');
    await loadComponent('modal-tasbih-container', './components/modals/tasbih-modal.html');
    await loadComponent('modal-kiblat-container', './components/modals/kiblat-modal.html');
    await loadComponent('modal-share-container', './components/modals/share-modal.html');
    await loadComponent('modal-telegram-container', './components/modals/telegram-modal.html');
}

export function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');

    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0', 'pointer-events-none');
    }, duration);
}

// TAMBAHKAN KODE INI KE BAGIAN BAWAH ui.js

// 1. Render Daftar Doa
export function renderDoaListUI(doaList) {
    const container = document.getElementById('doa-list-container');
    if (!container) return;

    if (!doaList || doaList.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center text-xs text-slate-400">
                Doa tidak ditemukan.
            </div>
        `;
        return;
    }

    container.innerHTML = doaList.map(doa => `
        <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-3 hover:shadow-md transition">
            <div class="flex items-start justify-between gap-2">
                <h4 class="font-bold text-sm text-slate-800">${doa.judul || doa.doa || 'Doa'}</h4>
                <span class="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                    ${doa.kat || doa.grup || 'Harian'}
                </span>
            </div>
            
            ${doa.arab ? `<p class="text-right font-arabic text-xl leading-loose text-slate-800 pt-1">${doa.arab}</p>` : ''}
            ${doa.latin ? `<p class="text-xs text-emerald-700 font-medium italic">${doa.latin}</p>` : ''}
            ${doa.terjemah || doa.arti ? `<p class="text-xs text-slate-600 leading-relaxed">${doa.terjemah || doa.arti}</p>` : ''}
        </div>
    `).join('');
}

// 2. Render Daftar Surah
export function renderSurahListUI(list, openModalFn) {
    const container = document.getElementById('surah-list-container');
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = '<div class="p-4 text-center text-xs text-slate-400">Surah tidak ditemukan.</div>';
        return;
    }

    container.innerHTML = list.map(s => `
        <div class="surah-card p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between cursor-pointer hover:border-emerald-200 hover:shadow-md transition" data-nomor="${s.nomor}">
            <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-100/50">
                    ${s.nomor}
                </span>
                <div>
                    <h4 class="font-semibold text-xs text-slate-800">${s.namaLatin}</h4>
                    <p class="text-[10px] text-slate-400">${s.arti} • ${s.jumlahAyat} Ayat</p>
                </div>
            </div>
            <span class="font-arabic text-lg text-emerald-800">${s.nama}</span>
        </div>
    `).join('');

    if (openModalFn) {
        container.querySelectorAll('.surah-card').forEach(el => {
            el.addEventListener('click', () => openModalFn(el.dataset.nomor));
        });
    }
}

// 3. Render Grid Jadwal Sholat (Dashboard)
export function renderPrayerGridUI(j) {
    if (!j) return;
    const times = [
        { name: 'Subuh', time: j.subuh },
        { name: 'Dzuhur', time: j.dzuhur },
        { name: 'Ashar', time: j.ashar },
        { name: 'Maghrib', time: j.maghrib },
        { name: 'Isya', time: j.isya }
    ];

    times.forEach(t => {
        const el = document.getElementById(`time-${t.name.toLowerCase()}`);
        if (el) el.innerText = t.time || '--:--';
    });
}

// 4. Render Jadwal Sholat Lengkap (View Sholat)
export function renderFullPrayerScheduleUI(j) {
    const container = document.getElementById('full-schedule-container');
    if (!container || !j) return;

    const list = [
        { label: 'Imsak', val: j.imsak },
        { label: 'Subuh', val: j.subuh },
        { label: 'Terbit', val: j.terbit },
        { label: 'Dhuha', val: j.dhuha },
        { label: 'Dzuhur', val: j.dzuhur },
        { label: 'Ashar', val: j.ashar },
        { label: 'Maghrib', val: j.maghrib },
        { label: 'Isya', val: j.isya }
    ];

    container.innerHTML = list.map(item => `
        <div class="flex justify-between items-center p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
            <span class="text-xs font-medium text-slate-700">${item.label}</span>
            <span class="text-xs font-bold text-emerald-700">${item.val || '--:--'}</span>
        </div>
    `).join('');
}
