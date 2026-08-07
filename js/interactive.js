// DATA BASE MOOD QUOTE
const MOOD_QUOTES = {
    sedih: [
        { text: "Janganlah kamu bersedih, sesungguhnya Allah ada bersama kita.", source: "QS. At-Taubah: 40" },
        { text: "Cukuplah Allah bagiku; tidak ada Tuhan selain Dia. Hanya kepada-Nya aku bertawakal.", source: "QS. At-Taubah: 129" }
    ],
    bersyukur: [
        { text: "Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah (nikmat) kepadamu.", source: "QS. Ibrahim: 7" },
        { text: "Maka nikmat Tuhanmu manakah yang kamu dustakan?", source: "QS. Ar-Rahman" }
    ],
    marah: [
        { text: "Orang kuat bukanlah yang pandai bergulat, tetapi orang yang sanggup menguasai dirinya saat marah.", source: "HR. Bukhari & Muslim" },
        { text: "Dan orang-orang yang menahan amarahnya dan memaafkan (kesalahan) orang lain. Allah menyukai orang-orang yang berbuat kebaikan.", source: "QS. Ali 'Imran: 134" }
    ],
    lelah: [
        { text: "Karena sesungguhnya sesudah kesulitan itu ada kemudahan.", source: "QS. Al-Insyirah: 5" },
        { text: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.", source: "QS. Al-Baqarah: 286" }
    ]
};

let currentMoodQuote = MOOD_QUOTES.sedih[0];

// 1. FUNGSI SMART DOA SUASANA HATI
window.loadMoodQuote = function(type) {
    const list = MOOD_QUOTES[type] || MOOD_QUOTES.sedih;
    const randomQuote = list[Math.floor(Math.random() * list.length)];
    currentMoodQuote = randomQuote;

    const textEl = document.getElementById('mood-text');
    const sourceEl = document.getElementById('mood-source');

    if (textEl && sourceEl) {
        textEl.innerText = `"${randomQuote.text}"`;
        sourceEl.innerText = `— ${randomQuote.source}`;
    }
};

window.shareMoodQuote = function() {
    const shareText = `${currentMoodQuote.text}\n(${currentMoodQuote.source})\n\nDapatkan motivasi Islami harian di Web App NurIslam: ${window.location.href}`;
    if (navigator.share) {
        navigator.share({ title: 'NurIslam - Renungan Hati', text: shareText });
    } else {
        navigator.clipboard.writeText(shareText);
        if (typeof window.showToast === 'function') window.showToast("Quote berhasil disalin!");
    }
};

// 2. FUNGSI MUTABA'AH YAUMIAH & RIWAYAT (TRACKER IBADAH)
const STORAGE_KEY = 'nurislam_ibadah_history_db';

function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Ambil seluruh database riwayat
function getAllHistory() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

// Simpan data ibadah hari ini
function saveTodayIbadah(items) {
    const history = getAllHistory();
    const today = getTodayKey();
    
    // Hitung persentase
    const totalKeys = ['shalat', 'quran', 'dzikir', 'sedekah'];
    const checkedCount = totalKeys.filter(k => items[k]).length;
    const percent = Math.round((checkedCount / totalKeys.length) * 100);

    history[today] = {
        items: items,
        percent: percent,
        updatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    updateIbadahUI(items, percent);
}

window.toggleIbadahItem = function(key) {
    const history = getAllHistory();
    const today = getTodayKey();
    const todayData = history[today] ? history[today].items : {};
    
    const chk = document.getElementById(`chk-${key}`);
    if (chk) {
        todayData[key] = chk.checked;
        saveTodayIbadah(todayData);
    }
};

function updateIbadahUI(items, percent) {
    const keys = ['shalat', 'quran', 'dzikir', 'sedekah'];
    keys.forEach(k => {
        const chk = document.getElementById(`chk-${k}`);
        if (chk) chk.checked = !!items[k];
    });

    const pText = document.getElementById('ibadah-percentage');
    const pBar = document.getElementById('ibadah-progress-bar');

    if (pText) pText.innerText = `${percent || 0}%`;
    if (pBar) pBar.style.width = `${percent || 0}%`;
}

window.resetIbadahTracker = function() {
    saveTodayIbadah({});
};

// 3. MODAL RIWAYAT IBADAH
window.openIbadahHistoryModal = function() {
    const history = getAllHistory();
    let modal = document.getElementById('ibadah-history-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'ibadah-history-modal';
        modal.className = 'fixed inset-0 z-[99] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 hidden';
        document.body.appendChild(modal);
    }

    // Urutkan tanggal dari yang terbaru
    const dates = Object.keys(history).sort().reverse();

    modal.innerHTML = `
        <div class="bg-white rounded-3xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            
            <!-- Header Modal -->
            <div class="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div class="flex items-center gap-2">
                    <i class="fa-solid fa-clock-rotate-left text-emerald-600"></i>
                    <h3 class="text-xs font-bold text-slate-800">Riwayat Mutaba'ah Yaumiyah</h3>
                </div>
                <button onclick="closeIbadahHistoryModal()" class="w-7 h-7 rounded-full bg-slate-200 hover:bg-rose-100 hover:text-rose-600 flex items-center justify-center text-slate-600 transition">
                    <i class="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <!-- List Riwayat -->
            <div class="p-4 overflow-y-auto space-y-2.5 flex-1">
                ${dates.length === 0 ? `
                    <div class="text-center text-xs text-slate-400 py-8">Belum ada riwayat ibadah tercatat.</div>
                ` : dates.map(dateStr => {
                    const data = history[dateStr];
                    const formattedDate = new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
                    const isToday = dateStr === getTodayKey();

                    return `
                        <div class="p-3 rounded-2xl border border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <div class="flex items-center gap-1.5">
                                    <span class="text-xs font-semibold text-slate-800">${formattedDate}</span>
                                    ${isToday ? `<span class="bg-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded-full font-bold">Hari Ini</span>` : ''}
                                </div>
                                <div class="flex gap-2 text-[10px] text-slate-500 mt-1">
                                    <span>${data.items.shalat ? '✅' : '❌'} Shalat</span>
                                    <span>${data.items.quran ? '✅' : '❌'} Qur'an</span>
                                    <span>${data.items.dzikir ? '✅' : '❌'} Dzikir</span>
                                    <span>${data.items.sedekah ? '✅' : '❌'} Sedekah</span>
                                </div>
                            </div>
                            <span class="text-xs font-extrabold ${data.percent === 100 ? 'text-emerald-600 bg-emerald-50' : 'text-slate-600 bg-slate-100'} px-2.5 py-1 rounded-full">
                                ${data.percent}%
                            </span>
                        </div>
                    `;
                }).join('')}
            </div>

            <!-- Footer Modal -->
            <div class="p-3 border-t border-slate-100 bg-slate-50 text-center">
                <button onclick="closeIbadahHistoryModal()" class="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition">
                    Tutup
                </button>
            </div>

        </div>
    `;

    modal.classList.remove('hidden');
};

window.closeIbadahHistoryModal = function() {
    const modal = document.getElementById('ibadah-history-modal');
    if (modal) modal.classList.add('hidden');
};

// Auto Init
document.addEventListener('DOMContentLoaded', () => {
    const history = getAllHistory();
    const today = getTodayKey();
    const todayData = history[today] || { items: {}, percent: 0 };
    updateIbadahUI(todayData.items, todayData.percent);
});
