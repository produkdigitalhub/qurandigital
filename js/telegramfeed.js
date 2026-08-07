/**
 * Module Fetching & Management Feed Telegram
 * Channel: https://t.me/s/wanitamuslimahofficial
 */

let telegramPostsCache = [];

export async function fetchTelegramPosts() {
    if (telegramPostsCache.length > 0) return telegramPostsCache;

    const channelUrl = 'https://t.me/s/wanitamuslimahofficial';
    const corsProxy = 'https://api.allorigins.win/get?url=' + encodeURIComponent(channelUrl);

    try {
        const response = await fetch(corsProxy);
        if (!response.ok) throw new Error('Gagal terhubung ke proxy');

        const data = await response.json();
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

                if (photoEl) {
                    const style = photoEl.getAttribute('style') || '';
                    const match = style.match(/url\(['"]?(.*?)['"]?\)/);
                    if (match && match[1]) photoUrl = match[1];
                }

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

        telegramPostsCache = posts.reverse();
        return telegramPostsCache;
    } catch (err) {
        console.error('Error fetching Telegram Feed:', err);
        return [];
    }
}

export async function openTelegramModal(type) {
    // Toleransi pencarian ID (kajian-nasihat-modal ATAU telegram-feed-modal)
    const modal = document.getElementById('kajian-nasihat-modal') || document.getElementById('telegram-feed-modal');
    const modalTitle = document.getElementById('kn-modal-title') || document.getElementById('tg-modal-title');
    const modalIcon = document.getElementById('kn-modal-icon') || document.getElementById('tg-modal-icon');
    const container = document.getElementById('kn-modal-content') || document.getElementById('tg-modal-content');

    if (!modal) {
        console.error('Modal Kajian/Nasihat tidak ditemukan di HTML.');
        return;
    }

    if (type === 'kajian') {
        if (modalTitle) modalTitle.textContent = 'Jadwal & Info Kajian';
        if (modalIcon) modalIcon.className = 'fa-solid fa-calendar-day text-amber-500 text-lg';
    } else {
        if (modalTitle) modalTitle.textContent = 'Nasihat & Mutiara Hikmah';
        if (modalIcon) modalIcon.className = 'fa-solid fa-quote-left text-amber-500 text-lg';
    }

    if (container) {
        container.innerHTML = `
            <div class="text-center text-xs text-slate-400 animate-pulse py-10 space-y-2">
                <i class="fa-brands fa-telegram text-4xl text-emerald-600/40 block"></i>
                <p>Memuat feed Telegram...</p>
            </div>
        `;
    }

    modal.classList.remove('hidden');

    const allPosts = await fetchTelegramPosts();
    let filteredPosts = [];

    if (type === 'kajian') {
        filteredPosts = allPosts.filter(p => p.type === 'kajian');
        if (filteredPosts.length === 0) filteredPosts = allPosts.filter(p => p.photo !== null);
    } else {
        filteredPosts = allPosts.filter(p => p.type === 'nasihat');
    }

    if (filteredPosts.length === 0) filteredPosts = allPosts;

    if (container) renderPostsUI(filteredPosts, container);
}

function renderPostsUI(items, container) {
    if (items.length === 0) {
        container.innerHTML = `<div class="text-center text-xs text-slate-400 py-8">Belum ada postingan.</div>`;
        return;
    }

    container.innerHTML = items.map(post => `
        <div class="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2.5">
            ${post.photo ? `<img src="${post.photo}" class="w-full h-48 object-cover rounded-xl mb-2" loading="lazy" alt="Gambar Feed">` : ''}
            <p class="text-xs text-slate-700 whitespace-pre-line leading-relaxed">${escapeHtml(post.text)}</p>
            <div class="flex justify-between items-center pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                <span class="flex items-center gap-1"><i class="fa-brands fa-telegram text-emerald-600"></i> Wanitamuslimah</span>
                <span>${post.date}</span>
            </div>
        </div>
    `).join('');
}

function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function initTelegramFeed() {
    const btnKajian = document.getElementById('btn-menu-kajian');
    const btnNasihat = document.getElementById('btn-menu-nasihat');
    
    const btnCloseModal = document.getElementById('btn-close-kn-modal') || document.getElementById('btn-close-tg-modal');
    const modal = document.getElementById('kajian-nasihat-modal') || document.getElementById('telegram-feed-modal');

    if (btnKajian) btnKajian.addEventListener('click', () => openTelegramModal('kajian'));
    if (btnNasihat) btnNasihat.addEventListener('click', () => openTelegramModal('nasihat'));

    if (btnCloseModal && modal) {
        btnCloseModal.addEventListener('click', () => modal.classList.add('hidden'));
    }
}
