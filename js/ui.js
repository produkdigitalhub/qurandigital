export function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.innerText = msg;
    t.classList.remove('opacity-0', 'pointer-events-none');
    setTimeout(() => {
        t.classList.add('opacity-0', 'pointer-events-none');
    }, 2500);
}

export function renderSurahListUI(list, onSurahClick) {
    const container = document.getElementById('surah-list');
    if (!container) return;
    container.innerHTML = list.map(s => `
        <div data-surah="${s.nomor}" class="surah-item p-3.5 bg-white rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-500 flex justify-between items-center cursor-pointer transition">
            <div class="flex items-center space-x-3">
                <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs border border-emerald-100">
                    ${s.nomor}
                </div>
                <div>
                    <h4 class="font-bold text-slate-800 text-xs">${s.namaLatin}</h4>
                    <p class="text-[10px] text-slate-400">${s.tempatTurun} • ${s.jumlahAyat} Ayat</p>
                </div>
            </div>
            <div class="text-right">
                <span class="font-arabic font-bold text-lg text-emerald-800">${s.nama}</span>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.surah-item').forEach(item => {
        item.addEventListener('click', () => onSurahClick(item.dataset.surah));
    });
}

export function renderDoaListUI(list) {
    const container = document.getElementById('doa-list-container');
    if (!container) return;
    container.innerHTML = list.map(d => `
        <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 space-y-2.5">
            <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-emerald-800">${d.judul}</span>
                <button onclick="navigator.clipboard.writeText('${d.arab}\\n\\n${d.arti}');" class="text-slate-400 hover:text-emerald-600 text-xs">
                    <i class="fa-solid fa-copy"></i>
                </button>
            </div>
            <p class="text-right font-arabic text-xl leading-loose text-slate-800">${d.arab}</p>
            <p class="text-xs text-emerald-700 font-medium">${d.latin}</p>
            <p class="text-xs text-slate-600 leading-relaxed">"${d.arti}"</p>
        </div>
    `).join('');
}

export function renderPrayerGridUI(j) {
    const grid = document.getElementById('mini-prayer-schedule');
    if (!grid) return;
    const items = [
        { name: 'Subuh', time: j.subuh },
        { name: 'Dzuhur', time: j.dzuhur },
        { name: 'Ashar', time: j.ashar },
        { name: 'Maghrib', time: j.maghrib },
        { name: 'Isya', time: j.isya },
    ];

    grid.innerHTML = items.map(i => `
        <div class="bg-emerald-900/40 border border-emerald-500/20 p-2 rounded-2xl">
            <p class="text-[10px] text-emerald-200">${i.name}</p>
            <p class="text-xs font-bold text-white mt-0.5">${i.time}</p>
        </div>
    `).join('');
}

export function renderFullPrayerScheduleUI(j) {
    const rows = document.getElementById('full-prayer-rows');
    if (!rows) return;
    const items = [
        { name: 'Imsak', time: j.imsak || '04:35', icon: 'fa-regular fa-sun' },
        { name: 'Subuh', time: j.subuh, icon: 'fa-solid fa-sun' },
        { name: 'Terbit', time: j.terbit || '06:00', icon: 'fa-solid fa-cloud-sun' },
        { name: 'Dzuhur', time: j.dzuhur, icon: 'fa-solid fa-sun text-amber-500' },
        { name: 'Ashar', time: j.ashar, icon: 'fa-solid fa-cloud-sun text-orange-400' },
        { name: 'Maghrib', time: j.maghrib, icon: 'fa-solid fa-moon text-indigo-400' },
        { name: 'Isya', time: j.isya, icon: 'fa-regular fa-moon' },
    ];

    rows.innerHTML = items.map(i => `
        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
            <div class="flex items-center space-x-3">
                <i class="${i.icon} w-5 text-center text-slate-500"></i>
                <span class="text-xs font-semibold text-slate-700">${i.name}</span>
            </div>
            <span class="text-sm font-bold font-mono text-emerald-700">${i.time}</span>
        </div>
    `).join('');
}

// js/ui.js render doa

export function renderDoaListUI(doaArray) {
    const container = document.getElementById('doa-list-container');
    if (!container) return;

    if (!doaArray || doaArray.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-100">
                Memuat data doa atau tidak ada doa yang ditemukan...
            </div>`;
        return;
    }

    container.innerHTML = `
        <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <!-- Information Bar -->
            <div class="p-3.5 bg-slate-50 border-b border-slate-100 flex justify-between items-center text-xs text-slate-500 font-medium">
                <span>Total: <b class="text-emerald-600 font-bold">${doaArray.length}</b> Doa (Sumber: EQuran.id)</span>
                <span class="text-[10px] text-slate-400">*Klik baris untuk detail</span>
            </div>

            <!-- Tabel / List Doa -->
            <div class="divide-y divide-slate-100 max-h-[650px] overflow-y-auto">
                ${doaArray.map((item, idx) => `
                    <details class="group transition-all duration-200">
                        <summary class="flex items-center justify-between p-3.5 hover:bg-emerald-50/50 cursor-pointer select-none list-none">
                            <div class="flex items-center space-x-3 pr-2">
                                <span class="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center flex-shrink-0">
                                    ${idx + 1}
                                </span>
                                <div>
                                    <h4 class="text-xs font-semibold text-slate-800 group-open:text-emerald-600 transition-colors">
                                        ${item.judul}
                                    </h4>
                                    <span class="inline-block mt-0.5 text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                        ${item.kat}
                                    </span>
                                </div>
                            </div>
                            <i class="fa-solid fa-chevron-down text-slate-300 text-xs transition-transform duration-200 group-open:rotate-180"></i>
                        </summary>

                        <!-- Detail Arab, Latin & Arti -->
                        <div class="p-4 bg-slate-50/60 border-t border-slate-100 space-y-3">
                            ${item.arab ? `<p class="text-right font-arabic text-xl leading-loose text-slate-800">${item.arab}</p>` : ''}
                            ${item.latin ? `<p class="text-xs text-emerald-700 font-medium leading-relaxed">${item.latin}</p>` : ''}
                            ${item.arti ? `<p class="text-xs text-slate-600 leading-relaxed">${item.arti}</p>` : ''}
                        </div>
                    </details>
                `).join('')}
            </div>
        </div>
    `;
}
