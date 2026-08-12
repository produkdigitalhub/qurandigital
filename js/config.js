export const state = {

    activeTab: 'dashboard',

    // ==========================================
    // LOCATION
    // ==========================================

    cityId: '2622',

    cityName: 'Kota Makassar',

    country: 'Indonesia',

    latitude: -5.1477,

    longitude: 119.4327,

    locationSource: 'default',

    // ==========================================
    // PRAYER
    // ==========================================

    prayerData: null,

    nextPrayerTime: null,

    // ==========================================
    // QURAN
    // ==========================================

    surahList: [],

    dailyAyatAudio: null,

    // ==========================================
    // TASBIH
    // ==========================================

    tasbihCount: 0,

    tasbihIndex: 0,

    tasbihPhrases: [
        {
            arab: 'Subhanallah',
            latin: 'Maha Suci Allah'
        },
        {
            arab: 'Alhamdulillah',
            latin: 'Segala Puji Bagi Allah'
        },
        {
            arab: 'Allahu Akbar',
            latin: 'Allah Maha Besar'
        },
        {
            arab: 'Astaghfirullah',
            latin: 'Aku Memohon Ampun Kepada Allah'
        }
    ],

   
    doaList: [
        { id: 1, judul: 'Doa Sebelum Makan', arab: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ', latin: 'Allahumma baarik lanaa fii maa razaqtanaa wa qinaa \'adzaa ban-naar.', arti: 'Ya Allah, berkahilah kami dalam rezeki yang telah Engkau berikan kepada kami dan peliharalah kami dari siksa api neraka.', kat: 'makan' },
        { id: 2, judul: 'Doa Setelah Makan', arab: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ', latin: 'Alhamdu lillahilladzii ath\'amanaa wa saqaanaa wa ja\'alanaa muslimiin.', arti: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami termasuk orang-orang muslim.', kat: 'makan' },
        { id: 3, judul: 'Doa Bangun Tidur', arab: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', latin: 'Alhamdu lillahil ladzii ahyaanaa ba\'da maa amaatanaa wa ilaihin nusyuur.', arti: 'Segala puji bagi Allah yang menghidupkan kami kembali setelah mematikan kami dan kepada-Nya kami dibangkitkan.', kat: 'pagi' },
        { id: 4, judul: 'Doa Sebelum Tidur', arab: 'بِاسْمِكَ اللَّهُمَّ أَحْيَا وَأَمُوتُ', latin: 'Bismika allahumma ahyaa wa amuutu.', arti: 'Dengan nama-Mu ya Allah aku hidup dan aku mati.', kat: 'petang' },
        { id: 5, judul: 'Doa Masuk Masjid', arab: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', latin: 'Allahummaftah lii abwaaba rahmatik.', arti: 'Ya Allah, bukakanlah bagiku pintu-pintu rahmat-Mu.', kat: 'sholat' },
        { id: 6, judul: 'Doa Keluar Rumah', arab: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لاَ حَوْلَ وَلاَ قُوَّةَ إِلاَّ بِاللَّهِ', latin: 'Bismillahi tawakkaltu \'alallah, laa haula wa laa quwwata illaa billaah.', arti: 'Dengan nama Allah, aku bertawakkal kepada Allah. Tiada daya dan upaya kecuali dengan pertolongan Allah.', kat: 'rumah' },
        { id: 7, judul: 'Doa Memohon Ilmu yang Bermanfaat', arab: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلاً مُتَقَبَّلاً', latin: 'Allahumma inni as-aluka \'ilman naafi\'an wa rizqan thayyiban wa \'amalan mutaqabbalan.', arti: 'Ya Allah, sungguh aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang baik, dan amal yang diterima.', kat: 'pagi' }
    ]
};
