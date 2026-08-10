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

// Tambahkan di bagian bawah ui.js

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
                    ${doa.kat || 'Harian'}
                </span>
            </div>
            
            ${doa.arab ? `<p class="text-right font-arabic text-xl leading-loose text-slate-800 pt-1">${doa.arab}</p>` : ''}
            ${doa.latin ? `<p class="text-xs text-emerald-700 font-medium italic">${doa.latin}</p>` : ''}
            ${doa.terjemah || doa.arti ? `<p class="text-xs text-slate-600 leading-relaxed">${doa.terjemah || doa.arti}</p>` : ''}
        </div>
    `).join('');
}
