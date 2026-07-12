"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import { createSession, destroySession, requireUser, requireRole, isAdmin, isStaff } from "./auth";
import { contrastWithWhite } from "./branding";

// ---------- Auth ----------

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const centerSlug = String(formData.get("center") ?? "");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    redirect(`/login?error=1${centerSlug ? `&center=${encodeURIComponent(centerSlug)}` : ""}`);
  }
  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}

// ---------- Students ----------

export async function createStudent(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  const centerId = user.role === "SUPER_ADMIN" ? String(formData.get("centerId")) : user.centerId!;
  const dob = String(formData.get("dateOfBirth") ?? "");
  await prisma.student.create({
    data: {
      firstName: String(formData.get("firstName")).trim(),
      lastName: String(formData.get("lastName")).trim(),
      gender: String(formData.get("gender")),
      dateOfBirth: dob ? new Date(dob) : null,
      medicalNotes: String(formData.get("medicalNotes") ?? "").trim() || null,
      parentId: String(formData.get("parentId") ?? "") || null,
      classId: String(formData.get("classId") ?? "") || null,
      centerId,
    },
  });
  revalidatePath("/students");
  redirect("/students");
}

export async function updateStudent(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  const id = String(formData.get("id"));
  const student = await prisma.student.findUniqueOrThrow({ where: { id } });
  if (user.role !== "SUPER_ADMIN" && student.centerId !== user.centerId) redirect("/students");
  const dob = String(formData.get("dateOfBirth") ?? "");
  await prisma.student.update({
    where: { id },
    data: {
      firstName: String(formData.get("firstName")).trim(),
      lastName: String(formData.get("lastName")).trim(),
      gender: String(formData.get("gender")),
      dateOfBirth: dob ? new Date(dob) : null,
      medicalNotes: String(formData.get("medicalNotes") ?? "").trim() || null,
      parentId: String(formData.get("parentId") ?? "") || null,
      classId: String(formData.get("classId") ?? "") || null,
    },
  });
  revalidatePath(`/students/${id}`);
  redirect(`/students/${id}`);
}

// ---------- Classes ----------

export async function createClass(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  const centerId = user.role === "SUPER_ADMIN" ? String(formData.get("centerId")) : user.centerId!;
  await prisma.classRoom.create({
    data: {
      name: String(formData.get("name")).trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      schedule: String(formData.get("schedule") ?? "").trim() || null,
      teacherId: String(formData.get("teacherId") ?? "") || null,
      centerId,
    },
  });
  revalidatePath("/classes");
  redirect("/classes");
}

// ---------- Attendance ----------

export async function saveAttendance(formData: FormData) {
  const user = await requireUser();
  if (!isStaff(user)) redirect("/dashboard");
  const classId = String(formData.get("classId"));
  const date = String(formData.get("date"));
  const studentIds = formData.getAll("studentId").map(String);
  for (const studentId of studentIds) {
    const status = String(formData.get(`status_${studentId}`) ?? "PRESENT");
    const note = String(formData.get(`note_${studentId}`) ?? "").trim() || null;
    await prisma.attendanceRecord.upsert({
      where: { studentId_classId_date: { studentId, classId, date } },
      create: { studentId, classId, date, status, note },
      update: { status, note },
    });
  }
  revalidatePath("/attendance");
  redirect(`/attendance?classId=${classId}&date=${date}&saved=1`);
}

export async function reportAbsence(formData: FormData) {
  const user = await requireUser();
  const studentId = String(formData.get("studentId"));
  const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
  const allowed =
    (user.role === "PARENT" && student.parentId === user.id) ||
    (isStaff(user) && (user.role === "SUPER_ADMIN" || student.centerId === user.centerId));
  if (!allowed) redirect("/dashboard");
  const dateFrom = String(formData.get("dateFrom"));
  const dateTo = String(formData.get("dateTo") ?? "") || dateFrom;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) redirect(`/students/${studentId}`);
  await prisma.absenceNotice.create({
    data: {
      studentId,
      dateFrom,
      dateTo: dateTo < dateFrom ? dateFrom : dateTo,
      reason: String(formData.get("reason")).trim(),
      submittedById: user.id,
    },
  });
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/attendance");
  redirect(`/students/${studentId}`);
}

// ---------- Fees ----------

export async function createInvoice(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  const studentId = String(formData.get("studentId"));
  const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
  if (user.role !== "SUPER_ADMIN" && student.centerId !== user.centerId) redirect("/fees");
  await prisma.invoice.create({
    data: {
      title: String(formData.get("title")).trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      amountCents: Math.round(parseFloat(String(formData.get("amount"))) * 100),
      dueDate: new Date(String(formData.get("dueDate"))),
      studentId,
      centerId: student.centerId,
    },
  });
  revalidatePath("/fees");
  redirect("/fees");
}

export async function payInvoice(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id"));
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id }, include: { student: true } });
  const allowed = isAdmin(user) || (user.role === "PARENT" && invoice.student.parentId === user.id);
  if (!allowed) redirect("/fees");
  await prisma.invoice.update({
    where: { id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paymentMethod: user.role === "PARENT" ? "Online (demo)" : String(formData.get("method") ?? "Recorded by admin"),
    },
  });
  revalidatePath("/fees");
}

// ---------- Announcements ----------

export async function createAnnouncement(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN", "TEACHER");
  const centerId = user.role === "SUPER_ADMIN" ? String(formData.get("centerId")) : user.centerId!;
  await prisma.announcement.create({
    data: {
      title: String(formData.get("title")).trim(),
      body: String(formData.get("body")).trim(),
      audience: String(formData.get("audience") ?? "ALL"),
      authorId: user.id,
      centerId,
    },
  });
  revalidatePath("/announcements");
  redirect("/announcements");
}

// ---------- Events & permissions ----------

export async function createEvent(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN", "TEACHER");
  const centerId = user.role === "SUPER_ADMIN" ? String(formData.get("centerId")) : user.centerId!;
  await prisma.event.create({
    data: {
      title: String(formData.get("title")).trim(),
      description: String(formData.get("description") ?? "").trim() || null,
      location: String(formData.get("location") ?? "").trim() || null,
      startsAt: new Date(String(formData.get("startsAt"))),
      requiresPermission: formData.get("requiresPermission") === "on",
      centerId,
    },
  });
  revalidatePath("/events");
  redirect("/events");
}

export async function respondPermission(formData: FormData) {
  const user = await requireUser();
  const eventId = String(formData.get("eventId"));
  const studentId = String(formData.get("studentId"));
  const granted = String(formData.get("granted")) === "yes";
  const student = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
  if (user.role === "PARENT" && student.parentId !== user.id) redirect("/events");
  await prisma.permissionResponse.upsert({
    where: { eventId_studentId: { eventId, studentId } },
    create: { eventId, studentId, granted, respondedById: user.id },
    update: { granted, respondedById: user.id, respondedAt: new Date() },
  });
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}

// ---------- Progress & behaviour ----------

export async function createProgress(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN", "TEACHER");
  const studentId = String(formData.get("studentId"));
  await prisma.progressRecord.create({
    data: {
      studentId,
      teacherId: user.id,
      date: String(formData.get("date")),
      type: String(formData.get("type")),
      surah: String(formData.get("surah") ?? "").trim() || null,
      ayahFrom: parseInt(String(formData.get("ayahFrom"))) || null,
      ayahTo: parseInt(String(formData.get("ayahTo"))) || null,
      grade: String(formData.get("grade")),
      notes: String(formData.get("notes") ?? "").trim() || null,
    },
  });
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/progress");
  redirect(`/students/${studentId}`);
}

export async function createBehavior(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN", "TEACHER");
  const studentId = String(formData.get("studentId"));
  await prisma.behaviorNote.create({
    data: {
      studentId,
      authorId: user.id,
      type: String(formData.get("type")),
      note: String(formData.get("note")).trim(),
    },
  });
  revalidatePath(`/students/${studentId}`);
  redirect(`/students/${studentId}`);
}

// ---------- Admin: users & centers ----------

export async function createUser(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  const role = String(formData.get("role"));
  if (user.role !== "SUPER_ADMIN" && !["TEACHER", "PARENT"].includes(role)) redirect("/admin");
  const centerId =
    user.role === "SUPER_ADMIN" ? String(formData.get("centerId") ?? "") || null : user.centerId;
  await prisma.user.create({
    data: {
      name: String(formData.get("name")).trim(),
      email: String(formData.get("email")).trim().toLowerCase(),
      passwordHash: await bcrypt.hash(String(formData.get("password")), 10),
      role,
      centerId: role === "SUPER_ADMIN" ? null : centerId,
    },
  });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function updateCenterBranding(formData: FormData) {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");
  const centerId = user.role === "SUPER_ADMIN" ? String(formData.get("centerId")) : user.centerId!;
  if (!centerId) redirect("/admin");

  const data: { brandColor?: string | null; logoData?: string | null } = {};

  const color = String(formData.get("brandColor") ?? "").trim();
  if (formData.get("clearColor") === "on") data.brandColor = null;
  else if (/^#[0-9a-fA-F]{6}$/.test(color)) {
    // Brand color carries white button text and acts as text on white — hold it to WCAG AA.
    if (contrastWithWhite(color) < 4.5) redirect("/admin?branding=lowcontrast");
    data.brandColor = color.toLowerCase();
  }

  const logo = formData.get("logo");
  if (formData.get("clearLogo") === "on") {
    data.logoData = null;
  } else if (logo instanceof File && logo.size > 0) {
    const okTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (okTypes.includes(logo.type) && logo.size <= 512 * 1024) {
      const buf = Buffer.from(await logo.arrayBuffer());
      data.logoData = `data:${logo.type};base64,${buf.toString("base64")}`;
    } else {
      redirect("/admin?branding=invalid");
    }
  }

  await prisma.center.update({ where: { id: centerId }, data });
  revalidatePath("/", "layout");
  redirect("/admin?branding=saved");
}

async function uniqueSlug(name: string): Promise<string> {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  let slug = base;
  for (let n = 2; await prisma.center.findUnique({ where: { slug } }); n++) slug = `${base}-${n}`;
  return slug;
}

function centerData(formData: FormData) {
  return {
    address: String(formData.get("address") ?? "").trim() || null,
    city: String(formData.get("city")).trim(),
    country: String(formData.get("country")).trim(),
    latitude: parseFloat(String(formData.get("latitude"))) || 0,
    longitude: parseFloat(String(formData.get("longitude"))) || 0,
    calcMethod: parseInt(String(formData.get("calcMethod"))) || 3,
  };
}

export async function createCenter(formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const name = String(formData.get("name")).trim();
  await prisma.center.create({
    data: { name, slug: await uniqueSlug(name), ...centerData(formData) },
  });
  revalidatePath("/admin");
  redirect("/admin");
}

export async function onboardCenter(formData: FormData) {
  await requireRole("SUPER_ADMIN");
  const name = String(formData.get("name")).trim();
  const adminEmail = String(formData.get("adminEmail")).trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email: adminEmail } })) {
    redirect("/portal?onboard=emailtaken");
  }
  const center = await prisma.center.create({
    data: { name, slug: await uniqueSlug(name), ...centerData(formData) },
  });
  await prisma.user.create({
    data: {
      name: String(formData.get("adminName")).trim(),
      email: adminEmail,
      passwordHash: await bcrypt.hash(String(formData.get("adminPassword")), 10),
      role: "ADMIN",
      centerId: center.id,
    },
  });
  revalidatePath("/portal");
  revalidatePath("/admin");
  redirect(`/portal?onboarded=${center.slug}`);
}
