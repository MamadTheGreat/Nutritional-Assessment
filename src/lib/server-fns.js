import { bmi, bmiCategory, computeNrs, computeTargets, getWeightLossPercent, idealWeight } from "@/lib/clinical";
import { DEFAULT_FORMULAS, DEFAULT_PROTOCOLS } from "@/lib/clinicalDefaults";
import { SEED_SOURCES } from "@/lib/knowledgeBase";
import { createRecordId, loadPatientDatabase, updatePatientDatabase } from "@/lib/driveStore";
import { addDaysISO, reviewDaysFor, todayISO } from "@/lib/reviewDates";

const dataOf = (input) => input?.data ?? input ?? {};
const orderedPatients = (items) => [...items].sort((a, b) => (a.next_review_date || "9999").localeCompare(b.next_review_date || "9999"));
const IMAGE_KEYS = new Set(["lab_files", "image", "mimeType", "file_uri", "signed_url", "file_url"]);

function numberOr(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function publicSource(source) {
  if (!source?.file_uri && (!source?.url || /^https?:\/\//i.test(source.url))) return source;
  const { file_uri: _fileUri, url, ...rest } = source;
  return url && /^https?:\/\//i.test(url) ? { ...rest, url } : rest;
}

function mergeLibrary(library = {}) {
  const protocols = [...(library.protocols || [])];
  const formulas = [...(library.formulas || [])];
  const sources = [...(library.sources || [])].map(publicSource);
  if (protocols.length === 0) {
    for (const protocol of DEFAULT_PROTOCOLS) protocols.push({ ...protocol, id: createRecordId(), is_default: true });
  }
  if (formulas.length === 0) {
    for (const formula of DEFAULT_FORMULAS) formulas.push({ ...formula, id: createRecordId(), is_default: true });
  }
  if (sources.length === 0) {
    for (const source of SEED_SOURCES) sources.push({ ...publicSource(source), id: createRecordId(), is_default: true });
  }
  return { protocols, formulas, sources };
}

function libraryChanged(current, next) {
  return JSON.stringify(current || {}) !== JSON.stringify(next);
}

async function loadReadyDatabase() {
  const database = await loadPatientDatabase();
  const library = mergeLibrary(database.library);
  if (!libraryChanged(database.library, library)) return { ...database, library };
  return updatePatientDatabase((current) => ({ ...current, library: mergeLibrary(current.library) }));
}

function sanitizeVisit(data) {
  const visit = {};
  for (const [key, value] of Object.entries(data)) {
    if (IMAGE_KEYS.has(key)) continue;
    if (typeof value === "string" && value.startsWith("data:")) continue;
    visit[key] = key === "abnormal_labs" && typeof value === "string" ? value.slice(0, 8000) : value;
  }
  return visit;
}

export async function listPatients(input) {
  const { search = "" } = dataOf(input);
  const patients = (await loadReadyDatabase()).patients;
  const needle = search.trim().toLocaleLowerCase();
  return orderedPatients(
    needle
      ? patients.filter((patient) => `${patient.full_name} ${patient.file_number || ""}`.toLocaleLowerCase().includes(needle))
      : patients,
  ).slice(0, 200);
}

export async function createPatient(input) {
  const data = dataOf(input);
  const fullName = (data.full_name || "").trim();
  if (!fullName) throw new Error("نام بیمار را وارد کنید.");
  const today = todayISO();
  const patient = {
    id: createRecordId(),
    full_name: fullName,
    file_number: data.file_number || "",
    age: data.age ?? null,
    sex: data.sex || null,
    father_name: data.father_name || "",
    birth_date: data.birth_date || "",
    ward_type: data.ward_type || "general",
    last_review_date: data.last_review_date || today,
    next_review_date: data.next_review_date || addDaysISO(reviewDaysFor(data.ward_type)),
    visits: [],
  };
  await updatePatientDatabase((database) => ({
    ...database,
    library: mergeLibrary(database.library),
    patients: [...database.patients, patient],
  }));
  return patient;
}

export async function dueReviews() {
  const today = todayISO();
  return orderedPatients((await loadReadyDatabase()).patients.filter((patient) => patient.next_review_date && patient.next_review_date <= today));
}

export async function getPatient(input) {
  const { id } = dataOf(input);
  return (await loadReadyDatabase()).patients.find((patient) => patient.id === id) || null;
}

export async function patientAssessments(input) {
  const { patientId } = dataOf(input);
  const patient = (await loadReadyDatabase()).patients.find((item) => item.id === patientId);
  return [...(patient?.visits || [])].sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""));
}

export async function recentAssessments() {
  const patients = (await loadReadyDatabase()).patients;
  return patients
    .flatMap((patient) => (patient.visits || []).map((visit) => ({ ...visit, patient_name: patient.full_name })))
    .sort((a, b) => (b.created_date || "").localeCompare(a.created_date || ""))
    .slice(0, 20);
}

export async function saveAssessment(input) {
  const data = sanitizeVisit(dataOf(input));
  const fullName = (data.patient_name || "").trim();
  if (!fullName) throw new Error("برای ثبت ویزیت، نام بیمار را وارد کنید.");

  let savedVisit;
  await updatePatientDatabase((database) => {
    const match =
      (data.patient_id && database.patients.find((patient) => patient.id === data.patient_id)) ||
      (data.file_number && database.patients.find((patient) => patient.file_number === data.file_number)) ||
      database.patients.find((patient) => patient.full_name.trim().toLocaleLowerCase() === fullName.toLocaleLowerCase());
    const now = new Date().toISOString();
    savedVisit = {
      ...data,
      id: createRecordId(),
      patient_id: match?.id || createRecordId(),
      patient_name: fullName,
      created_date: now,
      visit_date: todayISO(),
    };
    const nextReview = addDaysISO(reviewDaysFor(data.ward_type));
    if (match) {
      const updated = {
        ...match,
        full_name: fullName,
        file_number: data.file_number || match.file_number || "",
        age: data.age ?? match.age ?? null,
        sex: data.sex || match.sex || null,
        father_name: data.father_name || match.father_name || "",
        birth_date: data.birth_date || match.birth_date || "",
        ward_type: data.ward_type || match.ward_type || "general",
        last_review_date: todayISO(),
        next_review_date: nextReview,
        visits: [...(match.visits || []), savedVisit],
      };
      database.patients = database.patients.map((patient) => (patient.id === match.id ? updated : patient));
    } else {
      database.patients.push({
        id: savedVisit.patient_id,
        full_name: fullName,
        file_number: data.file_number || "",
        age: data.age ?? null,
        sex: data.sex || null,
        father_name: data.father_name || "",
        birth_date: data.birth_date || "",
        ward_type: data.ward_type || "general",
        last_review_date: todayISO(),
        next_review_date: nextReview,
        visits: [savedVisit],
      });
    }
    database.library = mergeLibrary(database.library);
    return database;
  });
  return savedVisit;
}

export async function deleteAssessment(input) {
  const { id } = dataOf(input);
  await updatePatientDatabase((database) => ({
    ...database,
    library: mergeLibrary(database.library),
    patients: database.patients.map((patient) => ({
      ...patient,
      visits: (patient.visits || []).filter((visit) => visit.id !== id),
    })),
  }));
  return { ok: true };
}

export async function listProtocols() {
  return (await loadReadyDatabase()).library.protocols;
}

export async function listFormulas() {
  return (await loadReadyDatabase()).library.formulas;
}

export async function listSources() {
  return (await loadReadyDatabase()).library.sources;
}

export async function createProtocol(input) {
  const data = dataOf(input);
  const name = String(data.name || "").trim();
  if (!name) throw new Error("نام پروتکل الزامی است.");
  const protocol = {
    id: createRecordId(),
    name: name.slice(0, 120),
    stress_factor: numberOr(data.stress_factor, 25),
    protein_per_kg: numberOr(data.protein_per_kg, 1),
    fluid_per_kg: numberOr(data.fluid_per_kg, 30),
    fluid_cap: numberOr(data.fluid_cap, 3000),
    notes: String(data.notes || "").slice(0, 300),
    evidence: String(data.evidence || "").slice(0, 200),
    source_url: /^https?:\/\//i.test(data.source_url || "") ? String(data.source_url).slice(0, 300) : "",
    is_default: false,
  };
  await updatePatientDatabase((database) => {
    const library = mergeLibrary(database.library);
    library.protocols.push(protocol);
    return { ...database, library };
  });
  return protocol;
}

export async function createFormula(input) {
  const data = dataOf(input);
  const name = String(data.name || "").trim();
  if (!name) throw new Error("نام فرمولا الزامی است.");
  const formula = {
    id: createRecordId(),
    name: name.slice(0, 120),
    manufacturer: String(data.manufacturer || "").slice(0, 80),
    kcal_per_ml: numberOr(data.kcal_per_ml, 1),
    protein_per_100ml: numberOr(data.protein_per_100ml, 0),
    category: String(data.category || "").slice(0, 60),
    notes: String(data.notes || "").slice(0, 300),
    is_default: false,
  };
  await updatePatientDatabase((database) => {
    const library = mergeLibrary(database.library);
    library.formulas.push(formula);
    return { ...database, library };
  });
  return formula;
}

export async function createSource(input) {
  const data = dataOf(input);
  const title = String(data.title || "").trim();
  if (!title) throw new Error("عنوان منبع الزامی است.");
  const source = publicSource({
    id: createRecordId(),
    title: title.slice(0, 200),
    authors: String(data.authors || "").slice(0, 200),
    year: data.year == null || data.year === "" ? null : numberOr(data.year, null),
    kind: data.kind || "other",
    publisher: String(data.publisher || "").slice(0, 160),
    url: data.url,
    key_points: String(data.key_points || "").slice(0, 4000),
    reviewed_on: String(data.reviewed_on || "").slice(0, 20),
    is_default: false,
  });
  await updatePatientDatabase((database) => {
    const library = mergeLibrary(database.library);
    library.sources.push(source);
    return { ...database, library };
  });
  return source;
}

export async function deleteSource(input) {
  const { id } = dataOf(input);
  await updatePatientDatabase((database) => {
    const library = mergeLibrary(database.library);
    library.sources = library.sources.filter((source) => source.id !== id);
    return { ...database, library };
  });
  return { ok: true };
}

async function callAi(path, data) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "پاسخ هوش مصنوعی دریافت نشد.");
  return result;
}

export function extractLabs(input) {
  const data = dataOf(input);
  return callAi("/api/ai/labs", { image: data.image, mimeType: data.mimeType });
}

export function extractPatientInfo(input) {
  const data = dataOf(input);
  return callAi("/api/ai/intake", { text: data.text });
}

function clinicalDraft(data) {
  const height = Number(data.height);
  const weight = Number(data.weight);
  const bmiValue = bmi(weight, height);
  const ibw = idealWeight(height);
  const category = bmiCategory(bmiValue);
  const nrs = computeNrs({
    bmiValue,
    weightLossPercent: getWeightLossPercent(data),
    intakeReduction: data.intake_reduction,
    diseaseSeverity: data.disease_severity,
    age: data.age,
  });
  const targets = computeTargets({
    weight,
    height,
    protocol: {
      stress_factor: data.stress_factor,
      protein_per_kg: data.protein_per_kg,
      fluid_per_kg: data.fluid_per_kg,
      fluid_cap: data.fluid_cap,
    },
    fever: data.fever,
    drain: data.drain,
  });
  return {
    bmiValue,
    bmiLabel: category.label,
    bmiTone: category.tone,
    ibw,
    nrs,
    calorie: targets.calorie,
    protein: targets.protein,
    fluid: targets.fluid,
  };
}

export async function buildPlan(input) {
  const data = dataOf(input);
  const clinical = clinicalDraft(data);
  const sources = (await loadReadyDatabase()).library.sources.filter((source) => source.title);
  const emptyAi = {
    required_labs: [],
    supplement: "",
    drug_interactions: [],
    diet_principles: [],
    record_note: "",
    sources: sources.map((source) => source.title),
  };
  try {
    const ai = await callAi("/api/ai/plan", {
      age: data.age,
      sex: data.sex,
      primary_disease: data.primary_disease,
      underlying_disease: data.underlying_disease,
      prescribed_medications: data.prescribed_medications,
      medication_history: data.medication_history,
      weight: Number(data.weight),
      height: Number(data.height),
      usual_weight: data.usual_weight,
      weight_loss_percent: getWeightLossPercent(data),
      intake_reduction: data.intake_reduction,
      disease_severity: data.disease_severity,
      abnormal_labs: typeof data.abnormal_labs === "string" ? data.abnormal_labs.slice(0, 4000) : "",
      protocol_name: data.protocol_name,
      fever: data.fever,
      drain: data.drain,
      calculated: clinical,
      sources: sources.slice(0, 30).map(({ title, year, key_points }) => ({
        title,
        year,
        key_points: typeof key_points === "string" ? key_points.slice(0, 2000) : "",
      })),
    });
    return { ...clinical, ...emptyAi, ...ai, sources: sources.map((source) => source.title) };
  } catch (error) {
    return { ...clinical, ...emptyAi, ai_error: error?.message || "پاسخ هوش مصنوعی دریافت نشد." };
  }
}
