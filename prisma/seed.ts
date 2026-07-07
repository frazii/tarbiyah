import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function dateISO(daysFromToday: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function main() {
  const hash = await bcrypt.hash("tarbiyah123", 10);

  // Clean slate (order matters for FKs)
  await prisma.permissionResponse.deleteMany();
  await prisma.behaviorNote.deleteMany();
  await prisma.progressRecord.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.event.deleteMany();
  await prisma.session.deleteMany();
  await prisma.student.deleteMany();
  await prisma.classRoom.deleteMany();
  await prisma.user.deleteMany();
  await prisma.center.deleteMany();

  const alNoor = await prisma.center.create({
    data: {
      name: "Al-Noor Islamic Center",
      slug: "al-noor",
      address: "12 Crescent Road",
      city: "Sydney",
      country: "Australia",
      latitude: -33.8688,
      longitude: 151.2093,
      calcMethod: 3,
    },
  });

  const alFalah = await prisma.center.create({
    data: {
      name: "Masjid Al-Falah Academy",
      slug: "al-falah",
      address: "45 Olive Street",
      city: "Melbourne",
      country: "Australia",
      latitude: -37.8136,
      longitude: 144.9631,
      calcMethod: 3,
    },
  });

  await prisma.user.create({
    data: { name: "Platform Admin", email: "super@tarbiyah.app", passwordHash: hash, role: "SUPER_ADMIN" },
  });

  const adminNoor = await prisma.user.create({
    data: { name: "Br. Yusuf Rahman", email: "admin@alnoor.example", passwordHash: hash, role: "ADMIN", centerId: alNoor.id },
  });
  await prisma.user.create({
    data: { name: "Sr. Khadijah Omar", email: "admin@alfalah.example", passwordHash: hash, role: "ADMIN", centerId: alFalah.id },
  });

  const ustadhAhmad = await prisma.user.create({
    data: { name: "Ustadh Ahmad Siddiqui", email: "ahmad@alnoor.example", passwordHash: hash, role: "TEACHER", centerId: alNoor.id },
  });
  const ustadhaMaryam = await prisma.user.create({
    data: { name: "Ustadha Maryam Hassan", email: "maryam@alnoor.example", passwordHash: hash, role: "TEACHER", centerId: alNoor.id },
  });
  const ustadhBilal = await prisma.user.create({
    data: { name: "Ustadh Bilal Khan", email: "bilal@alfalah.example", passwordHash: hash, role: "TEACHER", centerId: alFalah.id },
  });

  const parentFatima = await prisma.user.create({
    data: { name: "Fatima Ali", email: "parent@alnoor.example", passwordHash: hash, role: "PARENT", centerId: alNoor.id },
  });
  const parentIbrahim = await prisma.user.create({
    data: { name: "Ibrahim Malik", email: "ibrahim@alnoor.example", passwordHash: hash, role: "PARENT", centerId: alNoor.id },
  });
  const parentAisha = await prisma.user.create({
    data: { name: "Aisha Begum", email: "parent@alfalah.example", passwordHash: hash, role: "PARENT", centerId: alFalah.id },
  });

  const hifz1 = await prisma.classRoom.create({
    data: { name: "Hifz Level 1", description: "Memorisation of Juz Amma", schedule: "Sat & Sun 10:00–12:00", centerId: alNoor.id, teacherId: ustadhAhmad.id },
  });
  const tajweed = await prisma.classRoom.create({
    data: { name: "Tajweed & Tilawah", description: "Rules of recitation with practice", schedule: "Wed 17:00–18:30", centerId: alNoor.id, teacherId: ustadhaMaryam.id },
  });
  const islamicStudies = await prisma.classRoom.create({
    data: { name: "Islamic Studies — Juniors", description: "Aqidah, Seerah, Fiqh basics", schedule: "Sat 13:00–15:00", centerId: alNoor.id, teacherId: ustadhaMaryam.id },
  });
  const quranFalah = await prisma.classRoom.create({
    data: { name: "Qur'an Foundation", description: "Qaidah and beginner recitation", schedule: "Sun 09:30–11:30", centerId: alFalah.id, teacherId: ustadhBilal.id },
  });

  const zayd = await prisma.student.create({
    data: { firstName: "Zayd", lastName: "Ali", gender: "MALE", dateOfBirth: new Date("2016-03-14"), centerId: alNoor.id, parentId: parentFatima.id, classId: hifz1.id },
  });
  const ruqayyah = await prisma.student.create({
    data: { firstName: "Ruqayyah", lastName: "Ali", gender: "FEMALE", dateOfBirth: new Date("2018-08-02"), centerId: alNoor.id, parentId: parentFatima.id, classId: tajweed.id, medicalNotes: "Mild peanut allergy — EpiPen in office." },
  });
  const hamza = await prisma.student.create({
    data: { firstName: "Hamza", lastName: "Malik", gender: "MALE", dateOfBirth: new Date("2015-11-20"), centerId: alNoor.id, parentId: parentIbrahim.id, classId: hifz1.id },
  });
  const sumayyah = await prisma.student.create({
    data: { firstName: "Sumayyah", lastName: "Malik", gender: "FEMALE", dateOfBirth: new Date("2017-05-09"), centerId: alNoor.id, parentId: parentIbrahim.id, classId: islamicStudies.id },
  });
  const yahya = await prisma.student.create({
    data: { firstName: "Yahya", lastName: "Rahman", gender: "MALE", dateOfBirth: new Date("2016-12-01"), centerId: alFalah.id, parentId: parentAisha.id, classId: quranFalah.id },
  });

  // Attendance for the past few sessions
  const days = [-1, -3, -7, -8];
  const statuses = ["PRESENT", "PRESENT", "LATE", "ABSENT"];
  for (const [i, d] of days.entries()) {
    for (const s of [zayd, hamza]) {
      await prisma.attendanceRecord.create({
        data: { date: dateISO(d), status: s.id === hamza.id && i === 3 ? "EXCUSED" : statuses[i], studentId: s.id, classId: hifz1.id, note: statuses[i] === "ABSENT" ? "No notification received" : null },
      });
    }
  }
  await prisma.attendanceRecord.create({ data: { date: dateISO(-2), status: "PRESENT", studentId: ruqayyah.id, classId: tajweed.id } });
  await prisma.attendanceRecord.create({ data: { date: dateISO(-1), status: "PRESENT", studentId: yahya.id, classId: quranFalah.id } });

  // Fees
  await prisma.invoice.create({
    data: { title: "Term 3 Tuition", amountCents: 18000, dueDate: new Date(Date.now() + 14 * 86400000), studentId: zayd.id, centerId: alNoor.id },
  });
  await prisma.invoice.create({
    data: { title: "Term 3 Tuition", amountCents: 18000, dueDate: new Date(Date.now() + 14 * 86400000), studentId: ruqayyah.id, centerId: alNoor.id },
  });
  await prisma.invoice.create({
    data: { title: "Term 2 Tuition", amountCents: 18000, dueDate: new Date(Date.now() - 30 * 86400000), status: "PAID", paidAt: new Date(Date.now() - 35 * 86400000), paymentMethod: "Card", studentId: zayd.id, centerId: alNoor.id },
  });
  await prisma.invoice.create({
    data: { title: "Qur'an & Qaidah Books", description: "Set of course books", amountCents: 4500, dueDate: new Date(Date.now() + 7 * 86400000), studentId: hamza.id, centerId: alNoor.id },
  });
  await prisma.invoice.create({
    data: { title: "Term 3 Tuition", amountCents: 15000, dueDate: new Date(Date.now() + 10 * 86400000), studentId: yahya.id, centerId: alFalah.id },
  });

  // Announcements
  await prisma.announcement.create({
    data: {
      title: "Ramadan Timetable Published",
      body: "Assalamu alaikum. Classes during Ramadan will move to 11:00–13:00 on weekends. The full timetable is attached to the noticeboard. JazakumAllahu khayran.",
      audience: "ALL", centerId: alNoor.id, authorId: adminNoor.id,
    },
  });
  await prisma.announcement.create({
    data: {
      title: "Hifz Competition Registrations Open",
      body: "Registrations for the annual inter-center Hifz competition are now open. Please register your child with their teacher by the end of the month.",
      audience: "PARENTS", centerId: alNoor.id, authorId: adminNoor.id,
    },
  });

  // Events
  const eidEvent = await prisma.event.create({
    data: {
      title: "Eid Family Fun Day",
      description: "Community celebration with games, food stalls and prize-giving for students.",
      location: "Center Grounds",
      startsAt: new Date(Date.now() + 12 * 86400000),
      requiresPermission: true,
      centerId: alNoor.id,
    },
  });
  await prisma.event.create({
    data: {
      title: "Seerah Museum Excursion",
      description: "Guided visit to the Islamic heritage exhibition. Transport by chartered bus.",
      location: "City Exhibition Hall",
      startsAt: new Date(Date.now() + 25 * 86400000),
      requiresPermission: true,
      centerId: alNoor.id,
    },
  });
  await prisma.event.create({
    data: {
      title: "Parent Open Evening",
      description: "Meet the teachers and review your child's progress.",
      location: "Main Hall",
      startsAt: new Date(Date.now() + 6 * 86400000),
      requiresPermission: false,
      centerId: alFalah.id,
    },
  });
  await prisma.permissionResponse.create({
    data: { eventId: eidEvent.id, studentId: zayd.id, granted: true, respondedById: parentFatima.id },
  });

  // Progress
  await prisma.progressRecord.create({
    data: { date: dateISO(-1), type: "HIFZ", surah: "An-Naba", ayahFrom: 1, ayahTo: 20, grade: "EXCELLENT", notes: "Strong retention, minor tajweed slips on madd.", studentId: zayd.id, teacherId: ustadhAhmad.id },
  });
  await prisma.progressRecord.create({
    data: { date: dateISO(-8), type: "HIFZ", surah: "An-Naziat", ayahFrom: 1, ayahTo: 46, grade: "GOOD", studentId: zayd.id, teacherId: ustadhAhmad.id },
  });
  await prisma.progressRecord.create({
    data: { date: dateISO(-1), type: "HIFZ", surah: "Abasa", ayahFrom: 1, ayahTo: 15, grade: "SATISFACTORY", notes: "Needs more revision at home.", studentId: hamza.id, teacherId: ustadhAhmad.id },
  });
  await prisma.progressRecord.create({
    data: { date: dateISO(-2), type: "TILAWAH", surah: "Al-Mulk", ayahFrom: 1, ayahTo: 10, grade: "GOOD", studentId: ruqayyah.id, teacherId: ustadhaMaryam.id },
  });
  await prisma.progressRecord.create({
    data: { date: dateISO(-3), type: "ISLAMIC_STUDIES", grade: "EXCELLENT", notes: "Seerah quiz: 19/20.", studentId: sumayyah.id, teacherId: ustadhaMaryam.id },
  });

  // Behaviour
  await prisma.behaviorNote.create({
    data: { type: "POSITIVE", note: "Helped a younger student find their class — excellent adab.", studentId: zayd.id, authorId: ustadhAhmad.id },
  });
  await prisma.behaviorNote.create({
    data: { type: "NEGATIVE", note: "Talking repeatedly during recitation practice.", studentId: hamza.id, authorId: ustadhAhmad.id },
  });

  console.log("Seed complete.");
  console.log("Demo login password for all accounts: tarbiyah123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
