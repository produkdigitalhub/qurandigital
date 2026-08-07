// Konfigurasi Channel Telegram
const TELEGRAM_CHANNELS = {
    kajian: {
        url: 'https://t.me/s/madrosahsunnah', 
        title: 'Jadwal & Info Kajian',
        icon: 'fa-calendar-day',
        iconColor: 'text-amber-500'
    },
    nasihat: {
        url: 'https://t.me/s/wanitamuslimahofficial', 
        title: 'Nasihat & Quote Islami',
        icon: 'fa-quote-left',
        iconColor: 'text-emerald-500'
    }
};

// Cache data postingan sementara untuk modal detail
window.telegramPostsCache = [];

// Fetcher HTML dengan Multi-Proxy Fallback (Mengatasi Error CORS & 520)
async function fetchTelegramHTML(targetUrl) {
    const proxies = [
        `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`,
        `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`
    ];

    for (const proxy of proxies) {
        try {
            const res = await fetch(proxy);
            if (res.ok) {
                const text = await res.text();
                if (text && text.length > 200) return text;
            }
        } catch (err) {
            console.warn(`Proxy ${proxy} gagal, mencoba proxy berikutnya...`);
        }
    }
    throw new Error("Gagal mengambil data dari Telegram. Semua proxy bermasalah.");
}

// Extract data postingan dari HTML Telegram Web
function parseTelegramPosts(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const widgetPosts = doc.querySelectorAll('.tgme_widget_message');
    const posts = [];

    widgetPosts.forEach((postEl, index) => {
        const textEl = postEl.querySelector('.tgme_widget_message_text');
        let fullText = textEl ? textEl.innerText.trim() : '';

        // Pisahkan baris pertama sebagai Judul/Caption dan sisanya sebagai Penjelasan
        let title = '';
        let description = '';

        if (fullText) {
            const lines = fullText.split('\n').filter(line => line.trim() !== '');
            title = lines[0] || 'Informasi Kajian & Nasihat';
            description = lines.slice(1).join('\n\n');
        }

        const timeEl = postEl.querySelector('time');
        let dateStr = timeEl ? timeEl.innerText : '';

        // Ekstraksi Gambar/Thumbnail
        let imageUrl = null;
        const photoEl = postEl.querySelector('.tgme_widget_message_photo_wrap');
        if (photoEl) {
            const style = photoEl.getAttribute('style') || '';
            const match = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/i);
            if (match && match[1]) imageUrl = match[1];
        }

        if (!imageUrl) {
            const linkPreviewImg = postEl.querySelector('.tgme_widget_message_link_preview .link_preview_image');
            if (linkPreviewImg) {
                const style = linkPreviewImg.getAttribute('style') || '';
                const match = style.match(/background-image:\s*url\(['"]?(.*?)['"]?\)/i);
                if (match && match[1]) imageUrl = match[1];
            }
        }

        const linkEl = postEl.querySelector('.tgme_widget_message_date');
        const postUrl = linkEl ? linkEl.getAttribute('href') : '#';

        if (fullText || imageUrl) {
            posts.push({
                id: index,
                title: title,
                description: description,
                fullText: fullText,
                date: dateStr,
                image: imageUrl,
                url: postUrl
            });
        }
    });

    const reversed = posts.reverse();
    window.telegramPostsCache = reversed;
    return reversed;
}

// Render Grid 2 Kolom Ringkas (Thumbnail Gambar/Judul Singkat)
function renderPostCardsHTML(posts) {
    if (!posts || posts.length === 0) {
        return `<div class="p-4 text-center text-xs text-slate-400">Belum ada postingan terbaru.</div>`;
    }

    return `
        <div class="grid grid-cols-2 gap-2.5 sm:gap-4">
            ${posts.map((p, idx) => {
                const safeText = encodeURIComponent(p.title || 'Informasi Kajian & Nasihat');

                return `
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition group">
                    
                    <!-- Area Klik untuk Buka Modal Detail -->
                    <div onclick="openPostDetail(${idx})" class="cursor-pointer relative w-full flex-1 flex flex-col">
                        ${p.image ? `
                            <div class="w-full h-36 sm:h-44 bg-slate-100 overflow-hidden relative">
                                <img src="${p.image}" alt="Media Telegram" class="w-full h-full object-cover group-hover:scale-105 transition duration-300" loading="lazy" />
                                <span class="absolute bottom-2 right-2 bg-slate-900/60 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <i class="fa-solid fa-expand text-[8px]"></i> Detail
                                </span>
                            </div>
                        ` : ''}

                        <div class="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                            <h4 class="text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                                ${p.title}
                            </h4>
                            ${p.description ? `<p class="text-[10px] text-slate-500 line-clamp-1">Klik untuk detail lengkap...</p>` : ''}
                        </div>
                    </div>

                    <!-- Footer Card -->
                    <div class="p-2 sm:p-2.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-[10px]">
                        <span class="text-slate-400 truncate">
                            <i class="fa-regular fa-clock"></i> ${p.date || 'Terbaru'}
                        </span>
                        
                        <button onclick="sharePost('${safeText}', '${p.url}')" class="text-slate-500 hover:text-emerald-600 bg-white border border-slate-100 px-2 py-0.5 rounded-full transition flex items-center gap-1">
                            <i class="fa-solid fa-share-nodes text-[9px]"></i> Share
                        </button>
                    </div>

                </div>
            `}).join('')}
        </div>
    `;
}

// Open Modal Detail (Scrollable, Teks & Gambar Lengkap)
window.openPostDetail = function(index) {
    const post = window.telegramPostsCache[index];
    if (!post) return;

    let detailModal = document.getElementById('telegram-detail-modal');
    if (!detailModal) {
        detailModal = document.createElement('div');
        detailModal.id = 'telegram-detail-modal';
        detailModal.className = 'fixed inset-0 z-[99] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 hidden';
        document.body.appendChild(detailModal);
    }

    const safeText = encodeURIComponent(post.title || 'Informasi Kajian & Nasihat');

    detailModal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-lg w-full max-h-[88vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            
            <!-- Header Modal Detail -->
            <div class="p-3.5 px-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/80 sticky top-0 z-10 backdrop-blur-md">
                <span class="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <i class="fa-regular fa-clock text-emerald-600"></i> ${post.date || 'Diposting di Telegram'}
                </span>
                <button onclick="closePostDetail()" class="w-7 h-7 rounded-full bg-slate-200/80 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-slate-600 transition">
                    <i class="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <!-- Konten Utama (Scrollable) -->
            <div class="p-4 overflow-y-auto space-y-4 flex-1">
                
                <!-- Gambar Utuh (Tidak Terpotong) -->
                ${post.image ? `
                    <div class="w-full bg-slate-900/5 rounded-2xl overflow-hidden flex items-center justify-center border border-slate-100">
                        <img src="${post.image}" alt="Poster Detail" class="w-full h-auto object-contain max-h-[50vh]" />
                    </div>
                ` : ''}

                <!-- Judul / Caption -->
                ${post.title ? `
                    <div class="border-b border-slate-100 pb-2.5">
                        <h3 class="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                            ${post.title}
                        </h3>
                    </div>
                ` : ''}

                <!-- Penjelasan Lengkap -->
                ${post.description ? `
                    <div class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal break-words">
                        ${post.description}
                    </div>
                ` : (!post.title && post.fullText ? `
                    <div class="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line font-normal break-words">
                        ${post.fullText}
                    </div>
                ` : '')}

            </div>

            <!-- Footer Modal Detail -->
            <div class="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2.5">
                <button onclick="sharePost('${safeText}', '${post.url}')" class="flex-1 py-2 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition">
                    <i class="fa-solid fa-share-nodes text-xs"></i> Bagikan
                </button>
                <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm">
                    Buka Telegram <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
                </a>
            </div>

        </div>
    `;

    detailModal.classList.remove('hidden');
};

// Close Modal Detail
window.closePostDetail = function() {
    const detailModal = document.getElementById('telegram-detail-modal');
    if (detailModal) detailModal.classList.add('hidden');
};

// Fungsi Share Web App
window.sharePost = function(encodedText, telegramUrl) {
    const text = decodeURIComponent(encodedText);
    const webAppUrl = window.location.href;
    
    const shareData = {
        title: 'NurIslam - Al-Qur\'an & Jadwal Shalat',
        text: `${text}\n\nDapatkan info Islami harian melalui Web App NurIslam:`,
        url: webAppUrl
    };

    if (navigator.share) {
        navigator.share(shareData).catch((err) => console.log('Share canceled:', err));
    } else {
        const copyText = `${shareData.text}\n${shareData.url}`;
        navigator.clipboard.writeText(copyText).then(() => {
            if (typeof window.showToast === 'function') {
                window.showToast("Tautan & pesan berhasil disalin!");
            } else {
                alert("Tautan & pesan berhasil disalin ke clipboard!");
            }
        });
    }
};

// Buka Modal Utama Telegram Feed
export async function openTelegramModal(type = 'kajian') {
    const config = TELEGRAM_CHANNELS[type] || TELEGRAM_CHANNELS.kajian;
    const modal = document.getElementById('kajian-nasihat-modal');
    const titleEl = document.getElementById('kn-modal-title');
    const iconEl = document.getElementById('kn-modal-icon');
    const contentEl = document.getElementById('kn-modal-content');

    if (!modal || !contentEl) return;

    if (titleEl) titleEl.innerText = config.title;
    if (iconEl) iconEl.className = `fa-solid ${config.icon} ${config.iconColor} text-lg`;

    modal.classList.remove('hidden');
    contentEl.innerHTML = `
        <div class="p-8 text-center text-xs text-slate-400 animate-pulse space-y-2">
            <i class="fa-brands fa-telegram text-3xl text-emerald-500"></i>
            <p>Memuat postingan terbaru dari Telegram...</p>
        </div>
    `;

    try {
        const html = await fetchTelegramHTML(config.url);
        const posts = parseTelegramPosts(html);
        contentEl.innerHTML = renderPostCardsHTML(posts);
    } catch (err) {
        console.error("Gagal memuat feed modal:", err);
        contentEl.innerHTML = `
            <div class="p-6 text-center text-xs text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 space-y-2">
                <i class="fa-solid fa-triangle-exclamation text-xl"></i>
                <p>Gagal memuat informasi. Silakan periksa koneksi internet Anda.</p>
            </div>
        `;
    }
}

// Inisialisasi Feed
export function initTelegramFeed() {
    const btnClose = document.getElementById('btn-close-kn-modal');
    if (btnClose) {
        btnClose.addEventListener('click', () => {
            document.getElementById('kajian-nasihat-modal')?.classList.add('hidden');
        });
    }

    loadDashboardPreview();
}

async function loadDashboardPreview() {
    const container = document.getElementById('dashboard-kajian-container');
    if (!container) return;

    try {
        const html = await fetchTelegramHTML(TELEGRAM_CHANNELS.kajian.url);
        const posts = parseTelegramPosts(html);
        const previewPosts = posts.slice(0, 2);
        container.innerHTML = renderPostCardsHTML(previewPosts);
    } catch (err) {
        container.innerHTML = `
            <div class="text-center text-xs text-slate-400 py-3">
                Informasi kajian belum dapat dimuat.
            </div>
        `;
    }
}
