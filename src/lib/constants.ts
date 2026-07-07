export const ROLES = ["SUPER_ADMIN", "ADMIN", "TEACHER", "PARENT"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Center Admin",
  TEACHER: "Teacher",
  PARENT: "Parent",
};

export const ATTENDANCE_STATUSES = ["PRESENT", "ABSENT", "LATE", "EXCUSED"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

export const PROGRESS_TYPES = ["HIFZ", "TILAWAH", "ISLAMIC_STUDIES", "ARABIC"] as const;
export type ProgressType = (typeof PROGRESS_TYPES)[number];

export const PROGRESS_TYPE_LABELS: Record<ProgressType, string> = {
  HIFZ: "Hifz (Memorisation)",
  TILAWAH: "Tilawah (Recitation)",
  ISLAMIC_STUDIES: "Islamic Studies",
  ARABIC: "Arabic Language",
};

export const GRADES = ["EXCELLENT", "GOOD", "SATISFACTORY", "NEEDS_IMPROVEMENT"] as const;
export type Grade = (typeof GRADES)[number];

export const GRADE_LABELS: Record<Grade, string> = {
  EXCELLENT: "Excellent (Mumtaz)",
  GOOD: "Good (Jayyid)",
  SATISFACTORY: "Satisfactory (Maqbul)",
  NEEDS_IMPROVEMENT: "Needs Improvement",
};

export const BEHAVIOR_TYPES = ["POSITIVE", "NEUTRAL", "NEGATIVE"] as const;
export type BehaviorType = (typeof BEHAVIOR_TYPES)[number];

export const AUDIENCES = ["ALL", "PARENTS", "TEACHERS"] as const;

// AlAdhan prayer-time calculation methods (subset)
export const CALC_METHODS: { id: number; label: string }[] = [
  { id: 1, label: "University of Islamic Sciences, Karachi" },
  { id: 2, label: "Islamic Society of North America (ISNA)" },
  { id: 3, label: "Muslim World League" },
  { id: 4, label: "Umm Al-Qura University, Makkah" },
  { id: 5, label: "Egyptian General Authority of Survey" },
  { id: 12, label: "Union Organization islamic de France" },
  { id: 13, label: "Diyanet İşleri Başkanlığı, Turkey" },
];

export const KAABA = { lat: 21.4225, lng: 39.8262 };

export const SURAHS = [
  "Al-Fatihah","Al-Baqarah","Aal-E-Imran","An-Nisa","Al-Ma'idah","Al-An'am","Al-A'raf","Al-Anfal","At-Tawbah","Yunus",
  "Hud","Yusuf","Ar-Ra'd","Ibrahim","Al-Hijr","An-Nahl","Al-Isra","Al-Kahf","Maryam","Ta-Ha",
  "Al-Anbiya","Al-Hajj","Al-Mu'minun","An-Nur","Al-Furqan","Ash-Shu'ara","An-Naml","Al-Qasas","Al-Ankabut","Ar-Rum",
  "Luqman","As-Sajdah","Al-Ahzab","Saba","Fatir","Ya-Sin","As-Saffat","Sad","Az-Zumar","Ghafir",
  "Fussilat","Ash-Shura","Az-Zukhruf","Ad-Dukhan","Al-Jathiyah","Al-Ahqaf","Muhammad","Al-Fath","Al-Hujurat","Qaf",
  "Adh-Dhariyat","At-Tur","An-Najm","Al-Qamar","Ar-Rahman","Al-Waqi'ah","Al-Hadid","Al-Mujadila","Al-Hashr","Al-Mumtahanah",
  "As-Saff","Al-Jumu'ah","Al-Munafiqun","At-Taghabun","At-Talaq","At-Tahrim","Al-Mulk","Al-Qalam","Al-Haqqah","Al-Ma'arij",
  "Nuh","Al-Jinn","Al-Muzzammil","Al-Muddathir","Al-Qiyamah","Al-Insan","Al-Mursalat","An-Naba","An-Nazi'at","Abasa",
  "At-Takwir","Al-Infitar","Al-Mutaffifin","Al-Inshiqaq","Al-Buruj","At-Tariq","Al-A'la","Al-Ghashiyah","Al-Fajr","Al-Balad",
  "Ash-Shams","Al-Layl","Ad-Duha","Ash-Sharh","At-Tin","Al-Alaq","Al-Qadr","Al-Bayyinah","Az-Zalzalah","Al-Adiyat",
  "Al-Qari'ah","At-Takathur","Al-Asr","Al-Humazah","Al-Fil","Quraysh","Al-Ma'un","Al-Kawthar","Al-Kafirun","An-Nasr",
  "Al-Masad","Al-Ikhlas","Al-Falaq","An-Nas",
];
