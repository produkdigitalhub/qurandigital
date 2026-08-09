import { initializeUIComponents, showToast } from './ui.js';
import { fetchPrayerTimes, fetchDailyAyat, fetchDailyHadith } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Muat komponen HTML secara asynchronous terlebih dahulu
    await initializeUIComponents();

    // 2. Inisialisasi Fitur & API setelah elemen DOM komponen tersedia
    try {
        showToast("Memuat data...");
        await Promise.all([
            fetchPrayerTimes(),
            fetchDailyAyat(),
            fetchDailyHadith()
        ]);
        showToast("Berhasil memuat data");
    } catch (error) {
        console.error("Error loading initial data:", error);
        showToast("Gagal memuat beberapa data API");
    }

    // 3. Setup Navigation Listener
    setupNavigation();
});

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    const views = ['dashboard', 'quran', 'doa', 'hadits', 'sholat'];

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.id.replace('nav-', '');
            views.forEach(v => {
                const viewEl = document.getElementById(`view-${v}`);
                if (viewEl) viewEl.classList.add('hidden');
            });

            const activeView = document.getElementById(`view-${target}`);
            if (activeView) activeView.classList.remove('hidden');

            navButtons.forEach(b => b.classList.remove('active-tab'));
            btn.classList.add('active-tab');
        });
    });
}
