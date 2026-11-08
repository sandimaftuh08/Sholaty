export type DuaSeed = {
  id: number;
  category: 'Dzikir' | 'Sholat' | 'Harian';
  title: string;
  arabic: string;
  latin: string;
  translation: string;
};

export const DUAS: DuaSeed[] = [
  {
    id: 1,
    category: 'Dzikir',
    title: 'Istighfar setelah sholat (3×)',
    arabic: 'أَسْتَغْفِرُ اللّٰهَ',
    latin: 'Astaghfirullāh',
    translation: 'Aku memohon ampun kepada Allah.',
  },
  {
    id: 2,
    category: 'Dzikir',
    title: 'Tasbih (33×)',
    arabic: 'سُبْحَانَ اللّٰهِ',
    latin: 'Subḥānallāh',
    translation: 'Maha Suci Allah.',
  },
  {
    id: 3,
    category: 'Dzikir',
    title: 'Tahmid (33×)',
    arabic: 'الْحَمْدُ لِلّٰهِ',
    latin: 'Alḥamdulillāh',
    translation: 'Segala puji bagi Allah.',
  },
  {
    id: 4,
    category: 'Dzikir',
    title: 'Takbir (33×)',
    arabic: 'اللّٰهُ أَكْبَرُ',
    latin: 'Allāhu akbar',
    translation: 'Allah Maha Besar.',
  },
  {
    id: 5,
    category: 'Dzikir',
    title: 'Tahlil penyempurna',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
    latin: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul mulku wa lahul ḥamdu wa huwa 'alā kulli syai'in qadīr.",
    translation: 'Tiada tuhan selain Allah, Yang Maha Esa, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan segala puji, dan Dia Maha Kuasa atas segala sesuatu.',
  },
  {
    id: 6,
    category: 'Sholat',
    title: 'Doa setelah adzan',
    arabic: 'اللّٰهُمَّ رَبَّ هٰذِهِ الدَّعْوَةِ التَّامَّةِ وَالصَّلَاةِ الْقَائِمَةِ آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
    latin: "Allāhumma rabba hādzihid da'watit tāmmah, waṣ-ṣalātil qā'imah, āti Muḥammadanil wasīlata wal faḍīlah, wab'atshu maqāman maḥmūdanil ladzī wa'adtah.",
    translation: 'Ya Allah, Tuhan pemilik seruan yang sempurna ini dan sholat yang akan ditegakkan, berilah Nabi Muhammad wasilah dan keutamaan, dan bangkitkanlah beliau pada kedudukan terpuji yang telah Engkau janjikan.',
  },
  {
    id: 7,
    category: 'Sholat',
    title: 'Doa masuk masjid',
    arabic: 'اللّٰهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    latin: 'Allāhummaftaḥ lī abwāba raḥmatik.',
    translation: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.',
  },
  {
    id: 8,
    category: 'Sholat',
    title: 'Doa keluar masjid',
    arabic: 'اللّٰهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    latin: "Allāhumma innī as'aluka min faḍlik.",
    translation: 'Ya Allah, sungguh aku memohon karunia-Mu.',
  },
  {
    id: 9,
    category: 'Harian',
    title: 'Doa bangun tidur',
    arabic: 'الْحَمْدُ لِلّٰهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
    latin: "Alḥamdu lillāhil ladzī aḥyānā ba'da mā amātanā wa ilaihin nusyūr.",
    translation: 'Segala puji bagi Allah yang menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dibangkitkan.',
  },
  {
    id: 10,
    category: 'Harian',
    title: 'Doa sebelum tidur',
    arabic: 'بِاسْمِكَ اللّٰهُمَّ أَحْيَا وَبِاسْمِكَ أَمُوتُ',
    latin: 'Bismika Allāhumma aḥyā wa bismika amūt.',
    translation: 'Dengan nama-Mu ya Allah aku hidup dan aku mati.',
  },
  {
    id: 11,
    category: 'Harian',
    title: 'Doa sebelum makan',
    arabic: 'اللّٰهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
    latin: "Allāhumma bārik lanā fīmā razaqtanā wa qinā 'adzāban nār.",
    translation: 'Ya Allah, berkahilah rezeki yang Engkau berikan kepada kami dan jagalah kami dari siksa neraka.',
  },
  {
    id: 12,
    category: 'Harian',
    title: 'Doa sesudah makan',
    arabic: 'الْحَمْدُ لِلّٰهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    latin: "Alḥamdulillāhil ladzī aṭ'amanā wa saqānā wa ja'alanā muslimīn.",
    translation: 'Segala puji bagi Allah yang telah memberi kami makan dan minum serta menjadikan kami muslim.',
  },
  {
    id: 13,
    category: 'Harian',
    title: 'Doa naik kendaraan',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ',
    latin: 'Subḥānal ladzī sakhkhara lanā hādzā wa mā kunnā lahū muqrinīn, wa innā ilā rabbinā lamunqalibūn.',
    translation: 'Maha Suci Tuhan yang telah menundukkan kendaraan ini bagi kami padahal kami sebelumnya tidak mampu menguasainya, dan sesungguhnya kepada Tuhan kami pasti kembali.',
  },
  {
    id: 14,
    category: 'Harian',
    title: 'Doa untuk kedua orang tua',
    arabic: 'رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا',
    latin: 'Rabbigh-fir lī wa li wālidayya warḥamhumā kamā rabbayānī ṣaghīrā.',
    translation: 'Ya Tuhanku, ampunilah aku dan kedua orang tuaku, sayangilah mereka sebagaimana mereka menyayangiku di waktu kecil.',
  },
  {
    id: 15,
    category: 'Harian',
    title: 'Doa kebaikan dunia & akhirat',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    latin: "Rabbanā ātinā fid dunyā ḥasanah, wa fil ākhirati ḥasanah, wa qinā 'adzāban nār.",
    translation: 'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa neraka.',
  },
];