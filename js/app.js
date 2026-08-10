import { initializeUIComponents, showToast } from './ui.js';
import { fetchPrayerTimes, getDailyAyat, getDailyHadits } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Muat komponen HTML UI terlebih dahulu
    await initializeUIComponents();

    // 2. Aktifkan navigasi tombol bawah
    setupNavigation();

    // 3. Panggil API setelah elemen DOM komponen selesai dirender
    try {
        showToast("Memuat data...");
        await Promise.all([
            fetchPrayerTimes(),
            getDailyAyat(),
            getDailyHadits()
        ]);
        showToast("Berhasil memuat data");
    } catch (error) {
        console.error("Error loading initial data:", error);
        showToast("Gagal memuat beberapa data API");
    }
});

function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-item');
    const views = ['dashboard', 'quran', 'doa', 'hadits', 'sholat'];

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.id.replace('nav-', '');
            
            // Sembunyikan semua view
            views.forEach(v => {
                const viewEl = document.getElementById(`view-${v}`);
                if (viewEl) viewEl.classList.add('hidden');
            });

            // Tampilkan view yang dipilih
            const activeView = document.getElementById(`view-${target}`);
            if (activeView) activeView.classList.remove('hidden');

            // Update status tombol aktif
            navButtons.forEach(b => b.classList.remove('active-tab'));
            btn.classList.add('active-tab');
        });
    });
}
