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

// Fungsi Fetcher dengan Multi-Proxy Fallback
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
    throw new Error("Gagal mengambil data dari Telegram.");
}

// Extract data postingan dari HTML Telegram Web
function parseTelegramPosts(htmlText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');
    const widgetPosts = doc.querySelectorAll('.tgme_widget_message');
    const posts = [];

    widgetPosts.forEach(postEl => {
        const textEl = postEl.querySelector('.tgme_widget_message_text');
        let text = textEl ? textEl.innerText.trim() : '';

        const timeEl = postEl.querySelector('time');
        let dateStr = timeEl ? timeEl.innerText : '';

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

        if (text || imageUrl) {
            posts.push({
                text: text,
                date: dateStr,
                image: imageUrl,
                url: postUrl
            });
        }
    });

    return posts.reverse();
}

// Render Card Postingan (Gambar & Teks Tampil Penuh / Full Aspect Ratio)
function renderPostCardsHTML(posts) {
    if (!posts || posts.length === 0) {
        return `<div class="p-4 text-center text-xs text-slate-400">Belum ada postingan terbaru.</div>`;
    }

    return `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${posts.map((p) => {
                const safeText = encodeURIComponent(p.text ? p.text.substring(0, 150) + '...' : 'Informasi Kajian & Nasihat');
                
                return `
                <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition">
                    
                    <!-- Thumbnail Poster / Gambar (Sesuai rasio asli gambar, tidak terpotong) -->
                    ${p.image ? `
                        <div class="w-full bg-slate-900/5 flex items-center justify-center overflow-hidden">
                            <img src="${p.image}" alt="Media Telegram" class="w-full h-auto max-h-96 object-contain" loading="lazy" />
                        </div>
                    ` : ''}

                    <!-- Body Card: Teks tampil penuh secara alami -->
                    <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
                        ${p.text ? `
                            <p class="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal break-words">
                                ${p.text}
                            </p>
                        ` : '<p class="text-xs italic text-slate-400">[Poster / Media Gambar]</p>'}

                        <!-- Footer Card -->
                        <div class="pt-2.5 border-t border-slate-100 flex justify-between items-center text-[11px] gap-2">
                            <span class="text-slate-400 flex items-center gap-1 font-medium">
                                <i class="fa-regular fa-clock text-[10px]"></i> ${p.date || 'Terbaru'}
                            </span>
                            
                            <div class="flex items-center gap-1.5">
                                <button onclick="sharePost('${safeText}', '${p.url}')" class="text-slate-600 hover:text-emerald-600 bg-slate-100 hover:bg-emerald-50 px-2.5 py-1 rounded-full font-semibold transition flex items-center gap-1">
                                    <i class="fa-solid fa-share-nodes text-[10px]"></i> Share
                                </button>

                                <a href="${p.url}" target="_blank" rel="noopener noreferrer" class="text-emerald-600 font-semibold hover:underline flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-full">
                                    Buka <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
                                </a>
                            </div>
                        </div>
                    </div>

                </div>
            `}).join('')}
        </div>
    `;
}

// Fungsi Share
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

// Buka Modal Telegram Feed
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
        contentEl.innerHTML = `
            <div class="p-6 text-center text-xs text-rose-500 bg-rose-50 rounded-2xl border border-rose-100 space-y-2">
                <i class="fa-solid fa-triangle-exclamation text-xl"></i>
                <p>Gagal memuat informasi. Silakan periksa koneksi internet Anda.</p>
            </div>
        `;
    }
}

// Inisialisasi Feed di Dashboard
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
