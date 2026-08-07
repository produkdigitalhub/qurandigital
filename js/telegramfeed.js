/**
 * Module untuk Fetching & Management Feed Telegram
 * Channel: https://t.me/s/wanitamuslimahofficial
 */

// Memory Cache agar tidak re-fetch setiap kali modal dibuka
let telegramPostsCache = [];

/**
 * Mengambil dan mem-parsing data HTML dari Telegram Web View
 */
export async function fetchTelegramPosts() {
    if (telegramPostsCache.length > 0) {
        return telegramPostsCache;
    }

    const channelUrl = 'https://t.me/s/wanitamuslimahofficial';
    // Menggunakan AllOrigins Proxy untuk melewati kendala CORS di Browser
    const corsProxy = 'https://api.allorigins.win/get?url=' + encodeURIComponent(channelUrl);

    try {
        const response = await fetch(corsProxy);
        if (!response.ok) throw new Error('Gagal terhubung ke server proxy');

        const data = await response.json();
        
        // Parsing string HTML menggunakan DOMParser
        const parser = new DOMParser();
        const doc = parser.parseFromString(data.contents, 'text/html');
        const widgetPosts = doc.querySelectorAll('.tgme_widget_message');

        const posts = [];

        widgetPosts.forEach(post => {
            const textEl = post.querySelector('.tgme_widget_message_text');
            const dateEl = post.querySelector('.tgme_widget_message_date time');
            const photoEl = post.querySelector('.tgme_widget_message_photo_wrap');

            if (textEl) {
                const text = textEl.innerText.trim();
                let photoUrl = null;

                // Ambil background-image URL jika postingan berupa gambar/poster
                if (photoEl) {
                    const style = photoEl.getAttribute('style') || '';
                    const match = style.match(/url\(['"]?(.*?)['"]?\)/);
                    if (match && match[1]) {
                        photoUrl = match[1];
                    }
                }

                // Pengelompokan / Klasifikasi Konten berdasarkan kata kunci
                const lowerText = text.toLowerCase();
                const isKajian = lowerText.includes('kajian') || 
                                 lowerText.includes('penceramah') || 
                                 lowerText.includes('ustadz') || 
                                 lowerText.includes('ustadzah') || 
                                 lowerText.includes('tempat:') || 
                                 lowerText.includes('waktu:') || 
                                 lowerText.includes('hadirlah') || 
                                 lowerText.includes('materi:');

                posts.push({
                    text: text,
                    date: dateEl ? dateEl.textContent.trim() : '',
                    photo: photoUrl,
                    type: isKajian ? 'kajian' : 'nasihat'
                });
            }
        });

        // Balikkan urutan agar postingan terbaru berada di paling atas
        telegramPostsCache = posts.reverse();
        return telegramPostsCache;

    } catch (err) {
        console.error('Error fetching Telegram Feed:', err);
        return [];
    }
}

/**
 * Menampilkan Modal sesuai kategori ('kajian' atau 'nasihat')
 */
export async function openTelegramModal(type) {
    const modal = document.getElementById('telegram-feed-modal');
    const modalTitle = document.getElementById('tg-modal-title');
    const modalIcon = document.getElementById('tg-modal-icon');
    const container = document.getElementById('tg-modal-content');

    if (!modal || !container) return;

    // Atur Judul Modal
    if (type === 'kajian') {
        modalTitle.textContent = 'Jadwal & Info Kajian';
        modalIcon.className = 'fa-solid fa-calendar-day text-rose-400 text-lg';
    } else {
        modalTitle.textContent = 'Nasihat & Mutiara Hikmah';
        modalIcon.className = 'fa-solid fa-quote-left text-emerald-400 text-lg';
    }

    // Tampilan Loading
    container.innerHTML = `
        <div class="text-center text-xs text-slate-400 animate-pulse py-10 space-y-2">
            <i class="fa-brands fa-telegram text-4xl text-emerald-600/40 block"></i>
            <p>Memuat feed dari @wanitamuslimahofficial...</p>
        </div>
    `;

    modal.classList.remove('hidden');

    const allPosts = await fetchTelegramPosts();
    
    // Filter konten berdasarkan kriteria
    let filteredPosts = [];
    if (type === 'kajian') {
        filteredPosts = allPosts.filter(p => p.type === 'kajian');
        // Jika tidak ada keyword kajian khusus yang terdeteksi, tampilkan postingan bergambar/poster
        if (filteredPosts.length === 0) {
            filteredPosts = allPosts.filter(p => p.photo !== null);
        }
    } else {
        filteredPosts = allPosts.filter(p => p.type === 'nasihat');
    }

    // Jika filter kosong, tampilkan semua postingan sebagai fallback
    if (filteredPosts.length === 0) {
        filteredPosts = allPosts;
    }

    renderPostsUI(filteredPosts, container);
}

/**
 * Helper untuk merender list postingan ke dalam HTML
 */
function renderPostsUI(items, container) {
    if (items.length === 0) {
        container.innerHTML = `
            <div class="text-center text-xs text-slate-400 py-8">
                <p>Belum ada postingan ditemukan saat ini.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = items.map(post => `
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            ${post.photo ? `<img src="${post.photo}" class="w-full h-48 object-cover rounded-xl mb-2" loading="lazy" alt="Gambar Telegram">` : ''}
            <p class="text-xs text-slate-700 whitespace-pre-line leading-relaxed">${escapeHtml(post.text)}</p>
            <div class="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                <span class="flex items-center gap-1">
                    <i class="fa-brands fa-telegram text-emerald-600"></i> Wanita Muslimah
                </span>
                <span>${post.date}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Helper untuk sanitasi HTML
 */
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/**
 * Inisialisasi Event Listener Tombol
 */
export function initTelegramFeed() {
    const btnKajian = document.getElementById('btn-menu-kajian');
    const btnNasihat = document.getElementById('btn-menu-nasihat');
    const btnCloseModal = document.getElementById('btn-close-tg-modal');
    const modal = document.getElementById('telegram-feed-modal');

    if (btnKajian) {
        btnKajian.addEventListener('click', () => openTelegramModal('kajian'));
    }

    if (btnNasihat) {
        btnNasihat.addEventListener('click', () => openTelegramModal('nasihat'));
    }

    if (btnCloseModal && modal) {
        btnCloseModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
}
