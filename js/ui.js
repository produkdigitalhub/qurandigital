/**
 * UI Renderer & Dynamic Component Loader
 */

// Fungsi Helper untuk Load File HTML Komponen
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
        container.innerHTML = `<div class="p-3 text-xs text-red-500 bg-red-50 rounded-xl">Gagal memuat komponen. Gunakan Local HTTP Server.</div>`;
    }
}

// Inisialisasi Seluruh Komponen Utama
export async function initializeUIComponents() {
    // 1. Load Header & Navbar
    await loadComponent('header-container', 'components/header.html');

    // 2. Load View Sub-Components (Dashboard Cards)
    await loadComponent('card-next-prayer', 'components/dashboard/next-prayer.html');
    await loadComponent('card-jurnal', 'components/dashboard/mutabaah-jurnal.html');
    await loadComponent('card-quick-menu', 'components/dashboard/quick-menu.html');
    await loadComponent('card-daily-ayat', 'components/dashboard/daily-ayat.html');
    await loadComponent('card-daily-hadits', 'components/dashboard/daily-hadits.html');
    await loadComponent('card-telegram-feed', 'components/dashboard/telegram-feed.html');

    // 3. Load Views
    await loadComponent('view-quran', 'components/view/quran-view.html');
    await loadComponent('view-doa', 'components/view/doa-view.html');
    await loadComponent('view-hadits', 'components/view/hadits-view.html');
    await loadComponent('view-sholat', 'components/view/sholat-view.html');

    // 4. Load Modals
    await loadComponent('modal-surah-container', 'components/modals/surah-modal.html');
    await loadComponent('modal-tasbih-container', 'components/modals/tasbih-modal.html');
    await loadComponent('modal-kiblat-container', 'components/modals/kiblat-modal.html');
    await loadComponent('modal-share-container', 'components/modals/share-modal.html');
    await loadComponent('modal-telegram-container', 'components/modals/telegram-modal.html');
}

// Toast Notifikasi global
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
