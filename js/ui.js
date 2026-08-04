export function showToast(msg) {
    const t = document.getElementById('toast');[cite: 1]
    t.innerText = msg;[cite: 1]
    t.classList.remove('opacity-0', 'pointer-events-none');[cite: 1]
    setTimeout(() => {
        t.classList.add('opacity-0', 'pointer-events-none');[cite: 1]
    }, 2500);[cite: 1]
}

export function renderSurahListUI(list, onSurahClick) {
    const container = document.getElementById('surah-list');[cite: 1]
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
    `).join('');[cite: 1]

    document.querySelectorAll('.surah-item').forEach(item => {
        item.addEventListener('click', () => onSurahClick(item.dataset.surah));
    });
}

export function renderDoaListUI(list) {
    const container = document.getElementById('doa-list-container');[cite: 1]
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
    `).join('');[cite: 1]
}

export function renderPrayerGridUI(j) {
    const grid = document.getElementById('mini-prayer-schedule');[cite: 1]
    const items = [
        { name: 'Subuh', time: j.subuh },[cite: 1]
        { name: 'Dzuhur', time: j.dzuhur },[cite: 1]
        { name: 'Ashar', time: j.ashar },[cite: 1]
        { name: 'Maghrib', time: j.maghrib },[cite: 1]
        { name: 'Isya', time: j.isya },[cite: 1]
    ];

    grid.innerHTML = items.map(i => `
        <div class="bg-emerald-900/40 border border-emerald-500/20 p-2 rounded-2xl">
            <p class="text-[10px] text-emerald-200">${i.name}</p>
            <p class="text-xs font-bold text-white mt-0.5">${i.time}</p>
        </div>
    `).join('');[cite: 1]
}

export function renderFullPrayerScheduleUI(j) {
    const rows = document.getElementById('full-prayer-rows');[cite: 1]
    const items = [
        { name: 'Imsak', time: j.imsak || '04:35', icon: 'fa-regular fa-sun' },[cite: 1]
        { name: 'Subuh', time: j.subuh, icon: 'fa-solid fa-sun' },[cite: 1]
        { name: 'Terbit', time: j.terbit || '06:00', icon: 'fa-solid fa-cloud-sun' },[cite: 1]
        { name: 'Dzuhur', time: j.dzuhur, icon: 'fa-solid fa-sun text-amber-500' },[cite: 1]
        { name: 'Ashar', time: j.ashar, icon: 'fa-solid fa-cloud-sun text-orange-400' },[cite: 1]
        { name: 'Maghrib', time: j.maghrib, icon: 'fa-solid fa-moon text-indigo-400' },[cite: 1]
        { name: 'Isya', time: j.isya, icon: 'fa-regular fa-moon' },[cite: 1]
    ];

    rows.innerHTML = items.map(i => `
        <div class="flex justify-between items-center p-3 bg-slate-50 rounded-2xl">
            <div class="flex items-center space-x-3">
                <i class="${i.icon} w-5 text-center text-slate-500"></i>
                <span class="text-xs font-semibold text-slate-700">${i.name}</span>
            </div>
            <span class="text-sm font-bold font-mono text-emerald-700">${i.time}</span>
        </div>
    `).join('');[cite: 1]
}