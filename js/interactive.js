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

// 2. FUNGSI MUTABA'AH YAUMIHA (TRACKER IBADAH)
const STORAGE_KEY = 'nurislam_ibadah_tracker';

function getTodayKey() {
    return new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
}

function loadIbadahState() {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const today = getTodayKey();

    // Jika hari berganti, reset otomatis
    if (saved.date !== today) {
        saveIbadahState({ date: today, items: {} });
        return {};
    }
    return saved.items || {};
}

function saveIbadahState(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

window.toggleIbadahItem = function(key) {
    const items = loadIbadahState();
    const chk = document.getElementById(`chk-${key}`);
    
    if (chk) {
        items[key] = chk.checked;
        saveIbadahState({ date: getTodayKey(), items: items });
        updateIbadahUI(items);
    }
};

function updateIbadahUI(items) {
    const keys = ['shalat', 'quran', 'dzikir', 'sedekah'];
    let checkedCount = 0;

    keys.forEach(k => {
        const chk = document.getElementById(`chk-${k}`);
        if (chk) {
            chk.checked = !!items[k];
            if (items[k]) checkedCount++;
        }
    });

    const percent = Math.round((checkedCount / keys.length) * 100);
    const pText = document.getElementById('ibadah-percentage');
    const pBar = document.getElementById('ibadah-progress-bar');

    if (pText) pText.innerText = `${percent}%`;
    if (pBar) pBar.style.width = `${percent}%`;
}

window.resetIbadahTracker = function() {
    saveIbadahState({ date: getTodayKey(), items: {} });
    updateIbadahUI({});
};

// Auto Init saat halaman selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    updateIbadahUI(loadIbadahState());
});
