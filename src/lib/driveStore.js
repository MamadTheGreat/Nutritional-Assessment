// Local device storage engine for Clinical Nutrition Assistant
// Replaces Google Drive with persistent on-device storage (IndexedDB + localStorage fallback)
// Allows offline usage, instant loading, and export/import of data files.

const STORAGE_KEY = "clinical_nutrition_patient_database_v1";
const DB_NAME = "ClinicalNutritionAssistantDB";
const STORE_NAME = "records";
const RECORD_KEY = "patient_database";

const EMPTY_LIBRARY = Object.freeze({ protocols: [], formulas: [], sources: [] });
const EMPTY_DATABASE = Object.freeze({ schemaVersion: 1, patients: [], library: EMPTY_LIBRARY });

let writeQueue = Promise.resolve();
let idbPromise = null;

function getIndexedDB() {
  if (typeof window === "undefined" || !window.indexedDB) return null;
  if (!idbPromise) {
    idbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (err) => {
          console.warn("IndexedDB open error, falling back to localStorage:", err);
          resolve(null);
        };
      } catch (err) {
        console.warn("IndexedDB initialization failed:", err);
        resolve(null);
      }
    });
  }
  return idbPromise;
}

async function idbGet() {
  const db = await getIndexedDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(RECORD_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbSet(value) {
  const db = await getIndexedDB();
  if (!db) return false;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, RECORD_KEY);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch {
      resolve(false);
    }
  });
}

function normalizeDatabase(database) {
  if (!database || typeof database !== "object") {
    return structuredClone(EMPTY_DATABASE);
  }
  const patients = Array.isArray(database.patients) ? database.patients : [];
  const library = database.library && typeof database.library === "object" ? database.library : {};
  return {
    schemaVersion: 1,
    patients,
    library: {
      protocols: Array.isArray(library.protocols) ? library.protocols : [],
      formulas: Array.isArray(library.formulas) ? library.formulas : [],
      sources: Array.isArray(library.sources) ? library.sources : [],
    },
  };
}

export function hasDriveAccess() {
  return true;
}

export function setDriveAccessToken() {
  // Kept for backward compatibility - no-op in local mode
}

export async function loadPatientDatabase() {
  // 1. Try reading from IndexedDB
  try {
    const fromIdb = await idbGet();
    if (fromIdb && typeof fromIdb === "object" && Array.isArray(fromIdb.patients)) {
      return normalizeDatabase(fromIdb);
    }
  } catch (err) {
    console.warn("Error reading from IndexedDB:", err);
  }

  // 2. Fallback to localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          // Sync to IndexedDB for next time
          idbSet(parsed).catch(() => {});
          return normalizeDatabase(parsed);
        }
      }
    } catch (err) {
      console.warn("Error reading from localStorage:", err);
    }
  }

  return structuredClone(EMPTY_DATABASE);
}

export async function updatePatientDatabase(mutator) {
  const operation = writeQueue.then(async () => {
    const database = await loadPatientDatabase();
    const mutated = await mutator(structuredClone(database));
    const nextDatabase = normalizeDatabase(mutated);

    // Save to IndexedDB (asynchronous)
    idbSet(nextDatabase).catch((err) => console.warn("Failed saving to IndexedDB:", err));

    // Save to localStorage (synchronous backup)
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDatabase));
      } catch (err) {
        console.warn("Failed saving to localStorage (possibly quota exceeded):", err);
      }
    }

    return nextDatabase;
  });

  writeQueue = operation.catch(() => {});
  return operation;
}

export function createRecordId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "rec-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);
}

// Export / download database as a JSON file to the user's phone or computer
export async function exportDatabaseFile() {
  const db = await loadPatientDatabase();
  const jsonStr = JSON.stringify(db, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `nutrition-assessment-backup-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return true;
}

// Import database from an uploaded JSON file or string
export async function importDatabaseFile(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    const normalized = normalizeDatabase(parsed);
    await updatePatientDatabase(() => normalized);
    return { ok: true, patientCount: normalized.patients.length };
  } catch (err) {
    throw new Error("فایل انتخاب‌شده قالب معتبر اطلاعات بیماران را ندارد: " + (err?.message || ""));
  }
}
