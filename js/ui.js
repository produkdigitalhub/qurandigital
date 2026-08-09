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
